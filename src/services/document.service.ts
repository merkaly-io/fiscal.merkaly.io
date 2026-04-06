import { parse } from 'node-html-parser';

export class DocumentService {
  public async readFromURL(QrValue: string) {
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
