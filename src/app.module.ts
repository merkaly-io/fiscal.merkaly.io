import { Module } from '@nestjs/common';
import { ApiConsumer } from './consumers/api.consumer';
import { DocumentService } from './services/document.service';

@Module({
  controllers: [ApiConsumer],
  providers: [DocumentService],
})
export class AppModule {}
