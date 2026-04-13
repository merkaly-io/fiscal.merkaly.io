import { Injectable } from '@nestjs/common';
import { FiscalDocument } from 'src/contracts/document.interface';

@Injectable()
export class XmlParser {
  public parse(_xml: string): FiscalDocument {
    throw new Error('XML parsing is not implemented yet');
  }
}
