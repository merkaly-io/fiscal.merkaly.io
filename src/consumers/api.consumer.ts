import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { ProcessRequest } from 'src/contracts/process.request';
import { DocumentService } from 'src/services/document.service';

@Controller()
export class ApiConsumer {
  private readonly logger = new Logger(ApiConsumer.name);

  constructor(private readonly documents: DocumentService) {}

  @MessagePattern('fiscal.process')
  public async onFiscalProcess(@Payload() payload: ProcessRequest) {
    this.logger.log('[api -> fiscal] Received prototype request');

    if (typeof payload?.nfc !== 'string' || !payload.nfc) {
      throw new BadRequestException('fiscal.process expects { nfc: string }');
    }

    return this.documents.process({
      type: 'nfc',
      nfc: Buffer.from(payload.nfc, 'base64'),
    });
  }
}
