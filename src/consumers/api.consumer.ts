import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DocumentService } from 'src/services/document.service';

@Controller()
export class ApiConsumer {
  private readonly logger = new Logger(ApiConsumer.name);

  @Inject()
  private readonly $documents: DocumentService;

  @MessagePattern('fiscal.process')
  public async onFiscalProcess(@Payload() nfc64: string) {
    this.logger.log('[api -> fiscal] Received prototype request');

    return this.$documents.readFromImageBuffer(Buffer.from(nfc64, 'base64'));
  }
}
