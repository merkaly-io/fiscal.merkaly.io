import { parse } from 'node-html-parser';

export class DocumentService {
  public async readFromKey(key: string) {
    const QrValue = `https://sat.sef.sc.gov.br/nfce/consulta?p=42260383646984007465653060000261901168905560%7C2%7C1%7C1%7C58D606365B7F70F474CD8C57A1806536F48F38AB`;

    const res = await fetch(QrValue);
    const html = await res.text();

    const DOM = parse(html);

    const tableItems = DOM.querySelector('table#tabResult');

    return {
      customer: {
        name: DOM.querySelector('#conteudo .txtCenter .txtTopo')?.innerText,
      },
      items: tableItems?.querySelectorAll('tr').map((row) => ({
        product: row.querySelector('.txtTit')?.textContent.trim(),

        price: row.querySelector('.RvlUnit')?.childNodes
          .filter(node => node.nodeType === 3)
          .map(node => node.textContent.trim())
          .pop(),

        quantity: row.querySelector('.Rqtd')?.childNodes
          .filter(node => node.nodeType === 3)
          .map(node => node.textContent.trim())
          .pop(),

        total: row.querySelector('.txtTit[align="right"]')
          ?.querySelector('.valor')
          ?.textContent,
      })) || [],
    };
  }
}
