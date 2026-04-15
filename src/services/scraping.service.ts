import { Injectable } from '@nestjs/common';
import { parse, type HTMLElement } from 'node-html-parser';
import { Customer, FiscalDocument, Item, Payment, Pricing } from 'src/contracts/document.interface';

function asNumberish(value?: string) {
  if (!value) {
    return 0;
  }

  return Number(value
    .replaceAll('.', '')
    .replaceAll(',', '.'));
}

function asPrice(value?: string) {
  if (!value) {
    return 0;
  }

  const normalized = value.replace(/\./g, '');
  const [intPart, decimalPart = ''] = normalized.split(',');
  const cents = intPart + decimalPart.padEnd(2, '0').slice(0, 2);

  return Number(cents);
}

function asIsoDateTime(value?: string) {
  if (!value) {
    return null;
  }

  const match = value.match(
    /(?<day>\d{2})\/(?<month>\d{2})\/(?<year>\d{4})\s+(?<hour>\d{2}):(?<minute>\d{2})(?::(?<second>\d{2}))?(?<offset>[+-]\d{2}:\d{2})?/,
  );

  if (!match?.groups) {
    return null;
  }

  const {
    day,
    month,
    year,
    hour,
    minute,
    second = '00',
    offset = '',
  } = match.groups;

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
}

@Injectable()
export class ScrapingService {
  public async scrape(url: string): Promise<FiscalDocument> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch NFC-e content from ${url}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const dom = parse(html);

    return {
      customer: this.parseCustomer(dom),
      issuedAt: this.parseIssuedAt(dom),
      items: this.parseItems(dom),
      key: this.parseAccessKey(dom),
      payments: this.parsePayments(dom),
      pricing: this.parsePricing(dom),
      url,
    };
  }

  private parseCustomer(dom: HTMLElement): Customer {
    const header = dom.querySelector('#conteudo .txtCenter');
    const textDivs = header?.querySelectorAll('.text') ?? [];

    return {
      address: textDivs[1]?.innerText
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .join(', '),
      cnpj: textDivs[0]?.innerText
        .replace('CNPJ:', '')
        .trim(),
      name: header?.querySelector('.txtTopo')?.innerText?.trim()
        .replace(/\s+/g, ' '),
    };
  }

  private parseItems(dom: HTMLElement): Item[] {
    const tableItems = dom.querySelector('table#tabResult');

    return tableItems?.querySelectorAll('tr').map((row) => ({
      gtin: row.querySelector('.RCod')?.textContent
        .replace('(Código:', '')
        .replace(')', '')
        .trim(),

      measure: row.querySelector('.RUN')?.textContent
        .replace('UN:', '')
        .trim(),

      name: row.querySelector('.txtTit')?.textContent.trim(),

      price: asPrice(this.readTextNode(row.querySelector('.RvlUnit'))),

      quantity: asNumberish(this.readTextNode(row.querySelector('.Rqtd'))),

      total: asPrice(row.querySelector('.valor')?.textContent.trim()),
    })) ?? [];
  }

  private parsePricing(dom: HTMLElement): Pricing {
    const totalsMap = this.parseTotalsMap(dom);

    return {
      discount: asPrice(totalsMap['Descontos R$:']),
      subtotal: asPrice(totalsMap['Valor total R$:']) || asPrice(totalsMap['Valor a pagar R$:']),
      total: asPrice(totalsMap['Valor a pagar R$:']),
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
        paid: asPrice(line.querySelector('.totalNumb')?.textContent.trim()),
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

  private parseIssuedAt(dom: HTMLElement) {
    const text = dom.innerText.replace(/\s+/g, ' ');
    const dateTime = text.match(
      /(?:Data\s+de\s+Emiss[aã]o|Emiss[aã]o)\s*:?\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}(?::\d{2})?(?:[+-]\d{2}:\d{2})?)/i,
    )?.[1];

    return asIsoDateTime(dateTime) ?? dateTime ?? null;
  }

  private readTextNode(element?: HTMLElement | null) {
    return element?.childNodes
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent.trim())
      .filter(Boolean)
      .pop();
  }
}
