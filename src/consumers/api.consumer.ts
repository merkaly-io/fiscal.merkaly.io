import { BadRequestException, Controller, Inject, Logger, UnsupportedMediaTypeException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ImageParser } from 'src/parsers/image.parser';
import { PdfParser } from 'src/parsers/pdf.parser';
import { XmlParser } from 'src/parsers/xml.parser';
import { ScrapingService } from 'src/services/scraping.service';
import { AbstractParser } from '../abstracts/abstract.parser';

@Controller()
export class ApiConsumer {
  private readonly logger = new Logger(ApiConsumer.name);

  @Inject()
  private readonly $image: ImageParser;

  @Inject()
  private readonly $pdf: PdfParser;

  @Inject()
  private readonly $xml: XmlParser;

  @Inject()
  private readonly $scraping: ScrapingService;

  @MessagePattern('fiscal.process')
  public async onFiscalProcess(@Payload() payload: { content: string; type: 'image' | 'pdf' | 'xml'; }) {
    this.logger.log('[api -> fiscal] Received prototype request');

    if (!payload?.content || !payload?.type) {
      throw new BadRequestException('fiscal.process expects { type, content }');
    }

    const buffer = Buffer.from(payload.content, 'base64');

    let parser!: AbstractParser<Buffer>;

    if (payload.type === 'image') {
      parser = this.$image;
    }

    if (payload.type === 'xml') {
      parser = this.$xml;
    }

    if (payload.type === 'pdf') {
      parser = this.$pdf;
    }

    if (!parser) {
      throw new UnsupportedMediaTypeException('Unsupported fiscal document format');
    }

    const url = await parser.parse(buffer);

    return this.$scraping.scrape(url);

  }
}
