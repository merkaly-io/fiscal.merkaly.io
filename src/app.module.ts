import { Module } from '@nestjs/common';
import { DocumentController } from './controllers/document.controller';
import { ApiConsumer } from './consumers/api.consumer';
import { RabbitMQModule } from './modules/rabbitmq.module';
import { DocumentService } from './services/document.service';

@Module({
  imports: [RabbitMQModule],
  controllers: [DocumentController, ApiConsumer],
  providers: [DocumentService],
})
export class AppModule {}
