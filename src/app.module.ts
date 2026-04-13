import { Module } from '@nestjs/common';
import { ApiConsumer } from './consumers/api.consumer';
import { NfcParser } from './parser/nfc.parser';
import { XmlParser } from './parser/xml.parser';
import { QrProcessor } from './processors/qr.processor';
import { XmlProcessor } from './processors/xml.processor';
import { DocumentService } from './services/document.service';
import { QrService } from './services/qr.service';
import { SefazService } from './services/sefaz.service';

@Module({
  controllers: [ApiConsumer],
  providers: [
    DocumentService,
    QrService,
    SefazService,
    NfcParser,
    XmlParser,
    QrProcessor,
    XmlProcessor,
  ],
})
export class AppModule {}
