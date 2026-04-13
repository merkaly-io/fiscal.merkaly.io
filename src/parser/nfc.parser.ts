import { Injectable } from '@nestjs/common';
import { parse, type HTMLElement } from 'node-html-parser';
import {
  Customer,
  FiscalDocument,
  Item,
  Payment,
  Pricing,
} from 'src/contracts/document.interface';

function parseNumberish(value?: string) {
  if (!value) {
    return 0;
  }

  return Number(value
    .replaceAll('.', '')
    .replaceAll(',', '.'));
}

@Injectable()
export class NfcParser {
  public parse(html: string, sourceUrl: string): FiscalDocument {
    const dom = parse(html);

    return {
      customer: this.parseCustomer(dom),
      items: this.parseItems(dom),
      key: this.parseAccessKey(dom),
      payments: this.parsePayments(dom),
      pricing: this.parsePricing(dom),
      url: sourceUrl,
    };
  }

  private parseCustomer(dom: HTMLElement): Customer {
    const header = dom.querySelector('#conteudo .txtCenter');
    const textDivs = header?.querySelectorAll('.text') ?? [];

    return {
      name: header?.querySelector('.txtTopo')?.innerText?.trim()
        .replace(/\s+/g, ' '),
      cnpj: textDivs[0]?.innerText
        .replace('CNPJ:', '')
        .trim(),
      address: textDivs[1]?.innerText
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value !== '')
        .join(', '),
    };
  }

  private parseItems(dom: HTMLElement): Item[] {
    const tableItems = dom.querySelector('table#tabResult');

    return tableItems?.querySelectorAll('tr').map((row) => ({
      product: row.querySelector('.txtTit')?.textContent.trim(),
      ean: row.querySelector('.RCod')?.textContent
        .replace('(Código:', '')
        .replace(')', '')
        .trim(),
      quantity: parseNumberish(this.readTextNode(row.querySelector('.Rqtd'))),
      measure: row.querySelector('.RUN')?.textContent
        .replace('UN:', '')
        .trim(),
      price: parseNumberish(this.readTextNode(row.querySelector('.RvlUnit'))),
      total: parseNumberish(row.querySelector('.valor')?.textContent.trim()),
    })) ?? [];
  }

  private parsePricing(dom: HTMLElement): Pricing {
    const totalsMap = this.parseTotalsMap(dom);

    return {
      subtotal: parseNumberish(totalsMap['Valor total R$:']) || parseNumberish(totalsMap['Valor a pagar R$:']),
      discount: parseNumberish(totalsMap['Descontos R$:']),
      total: parseNumberish(totalsMap['Valor a pagar R$:']),
    };
  }

  private parsePayments(dom: HTMLElement): Payment[] {
    const totalNota = dom.querySelector('#totalNota');

    if (!totalNota) {
      return [];
    }

    return totalNota
      .querySelectorAll('#linhaTotal')
      .filter((line) => line.querySelector('label.tx'))
      .map((line) => ({
        method: line.querySelector('label.tx')?.textContent.trim(),
        paid: parseNumberish(line.querySelector('.totalNumb')?.textContent.trim()),
      }));
  }

  private parseTotalsMap(dom: HTMLElement) {
    const totalNota = dom.querySelector('#totalNota');
    const totalLines = totalNota?.querySelectorAll('#linhaTotal') ?? [];
    const totalsMap: Record<string, string> = {};

    for (const line of totalLines) {
      const label = line.querySelector('label')?.textContent.trim();
      const value = line.querySelector('.totalNumb')?.textContent.trim();

      if (label && value) {
        totalsMap[label] = value;
      }
    }

    return totalsMap;
  }

  private parseAccessKey(dom: HTMLElement) {
    const infosSection = dom.querySelector('#infos');
    const infoLis = infosSection?.querySelectorAll('li') ?? [];

    return infoLis[1]?.querySelector('.chave')?.textContent.trim() ?? null;
  }

  private readTextNode(element?: HTMLElement | null) {
    return element?.childNodes
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent.trim())
      .filter(Boolean)
      .pop();
  }
}
