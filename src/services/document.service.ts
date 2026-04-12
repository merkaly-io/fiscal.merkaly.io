import { parse } from 'node-html-parser';
import { readFromBuffer } from '../utils/qrcode.util';

function parseNumberish(value?: string) {
  if (!value) {
    return 0;
  }

  return Number(value
    .replaceAll('.', '')
    .replaceAll(',', '.'));
}

export class DocumentService {
  public async readFromImageBuffer(buffer: Buffer) {
    const qrValue = await readFromBuffer(buffer);

    return this.readFromURL(qrValue);
  }

  public async readFromURL(QrValue: string) {
    const res = await fetch(QrValue);
    const html = await res.text();

    const DOM = parse(html);

    // ─── Emitente ────────────────────────────────────────────────────────────
    const header = DOM.querySelector('#conteudo .txtCenter');
    const textDivs = header?.querySelectorAll('.text') ?? [];

    const customer = {
      name: header?.querySelector('.txtTopo')?.innerText?.trim()
        .replace(/\s+/g, ' '),

      cnpj: textDivs[0]?.innerText
        .replace('CNPJ:', '')
        .trim(),

      address: textDivs[1]?.innerText
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .join(', '),
    };

    // ─── Itens ───────────────────────────────────────────────────────────────
    const tableItems = DOM.querySelector('table#tabResult');
    const items = tableItems?.querySelectorAll('tr').map((row) => ({
      product: row.querySelector('.txtTit')?.textContent.trim(),

      ean: row.querySelector('.RCod')?.textContent
        .replace('(Código:', '')
        .replace(')', '')
        .trim(),

      quantity: parseNumberish(row.querySelector('.Rqtd')?.childNodes
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .filter(Boolean)
        .pop()),

      measure: row.querySelector('.RUN')?.textContent
        .replace('UN:', '')
        .trim(),

      price: parseNumberish(row.querySelector('.RvlUnit')?.childNodes
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .filter(Boolean)
        .pop()),

      total: parseNumberish(row.querySelector('.valor')?.textContent.trim()),
    })) ?? [];

    // ─── Totais ──────────────────────────────────────────────────────────────
    const totalNota = DOM.querySelector('#totalNota');
    const totalLines = totalNota?.querySelectorAll('#linhaTotal') ?? [];

    // Label → valor em cada linha
    const totalsMap: Record<string, string> = {};
    for (const line of totalLines) {
      const label = line.querySelector('label')?.textContent.trim();
      const value = line.querySelector('.totalNumb')?.textContent.trim();
      if (label && value) totalsMap[label] = value;
    }

    const pricing = {
      subtotal: parseNumberish(totalsMap['Valor total R$:']) || parseNumberish(totalsMap['Valor a pagar R$:']),
      discount: parseNumberish(totalsMap['Descontos R$:']),
      total: parseNumberish(totalsMap['Valor a pagar R$:']),
    };

    // ─── Forma de pagamento ───────────────────────────────────────────────────
    // A linha de pagamento fica em #linhaForma + próximo #linhaTotal
    const linhaForma = totalNota?.querySelector('#linhaForma');
    const payments = linhaForma
      ? (() => {
        // Todos os #linhaTotal após #linhaForma com label .tx
        const allLines = totalNota?.querySelectorAll('#linhaTotal') ?? [];
        return allLines
          .filter((l) => l.querySelector('label.tx'))
          .map((l) => ({
            method: l.querySelector('label.tx')?.textContent.trim(),
            paid: parseNumberish(l.querySelector('.totalNumb')?.textContent.trim()),
          }));
      })()
      : [];

    // ─── Informações da NF-e ─────────────────────────────────────────────────
    const infosSection = DOM.querySelector('#infos');
    const infoLis = infosSection?.querySelectorAll('li') ?? [];

    // li[1] → chave de acesso (.chave span)
    const key = infoLis[1]?.querySelector('.chave')?.textContent.trim() ?? null;

    // ─── Retorno final ───────────────────────────────────────────────────────
    return {
      customer,
      items,
      key,
      payments,
      pricing,
      url: QrValue,
    };
  }
}
