import { Injectable, NotImplementedException } from '@nestjs/common';
import { AbstractParser } from 'src/abstracts/abstract.parser';

@Injectable()
export class PdfParser extends AbstractParser<Buffer> {
  public async parse(_pdf: Buffer): Promise<string> {
    throw new NotImplementedException('PDF parsing is not implemented yet');
  }
}
