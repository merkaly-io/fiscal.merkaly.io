import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class ApiConsumer {
  private readonly logger = new Logger(ApiConsumer.name);

  @EventPattern('api.process')
  onApiProcess(@Payload() data: unknown) {
    this.logger.log('Received from api', data);
    // TODO: handle api request
  }
}
