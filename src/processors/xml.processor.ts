import { Injectable } from '@nestjs/common';
import { FiscalDocument } from 'src/contracts/document.interface';
import { XmlParser } from 'src/parser/xml.parser';

@Injectable()
export class XmlProcessor {
  constructor(private readonly xmlParser: XmlParser) {}

  public async process(xml: string): Promise<FiscalDocument> {
    return this.xmlParser.parse(xml);
  }
}
