import { Module } from '@nestjs/common';
import { ApiConsumer } from './consumers/api.consumer';
import { ImageParser } from './parsers/image.parser';
import { PdfParser } from './parsers/pdf.parser';
import { XmlParser } from './parsers/xml.parser';
import { ScrapingService } from './services/scraping.service';

@Module({
  controllers: [ApiConsumer],
  providers: [
    ImageParser,
    PdfParser,
    ScrapingService,
    XmlParser,
  ],
})
export class AppModule {}
