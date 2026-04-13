import { Injectable } from '@nestjs/common';
import { FiscalDocument } from 'src/contracts/document.interface';
import { Source } from 'src/contracts/source.interface';
import { QrProcessor } from 'src/processors/qr.processor';
import { XmlProcessor } from 'src/processors/xml.processor';

@Injectable()
export class DocumentService {
  constructor(
    private readonly qrProcessor: QrProcessor,
    private readonly xmlProcessor: XmlProcessor,
  ) {}

  public async readFromNfc(buffer: Buffer): Promise<FiscalDocument> {
    return this.process({ type: 'nfc', nfc: buffer });
  }

  public async readFromXml(xml: string): Promise<FiscalDocument> {
    return this.process({ type: 'xml', xml });
  }

  public async process(source: Source): Promise<FiscalDocument> {
    if (source.type === 'nfc') {
      return this.qrProcessor.process(source.nfc);
    }

    return this.xmlProcessor.process(source.xml);
  }
}
