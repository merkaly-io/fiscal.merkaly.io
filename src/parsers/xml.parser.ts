import { Injectable, NotImplementedException } from '@nestjs/common';
import { AbstractParser } from 'src/abstracts/abstract.parser';

@Injectable()
export class XmlParser extends AbstractParser<Buffer> {
  public async parse(_xml: Buffer): Promise<string> {
    throw new NotImplementedException('XML parsing is not implemented yet');
  }
}
