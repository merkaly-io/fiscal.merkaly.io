import { Injectable } from '@nestjs/common';
import { FiscalDocument } from 'src/contracts/document.interface';
import { NfcParser } from 'src/parser/nfc.parser';
import { QrService } from 'src/services/qr.service';
import { SefazService } from 'src/services/sefaz.service';

@Injectable()
export class QrProcessor {
  constructor(
    private readonly qrService: QrService,
    private readonly sefazService: SefazService,
    private readonly nfcParser: NfcParser,
  ) {}

  public async process(buffer: Buffer): Promise<FiscalDocument> {
    const qrValue = await this.qrService.read(buffer);
    const html = await this.sefazService.fetchHtml(qrValue);

    return this.nfcParser.parse(html, qrValue);
  }
}
