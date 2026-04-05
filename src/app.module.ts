import { Module } from '@nestjs/common';
import { DocumentsController } from './controllers/documents.controller';
import { ScrappingService } from './services/scrapping.service';

@Module({
  controllers: [DocumentsController],
  imports: [ScrappingService],
})
export class AppModule {
}
