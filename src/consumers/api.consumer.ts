import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ApiConsumer {
  private readonly logger = new Logger(ApiConsumer.name);

  @MessagePattern('fiscal.process')
  onFiscalProcess(@Payload() data: unknown) {
    console.log('[fiscal] Received from api:', JSON.stringify(data, null, 2));

    return 'al-reves';
  }
}
