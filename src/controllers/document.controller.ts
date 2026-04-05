import { Controller, Get, Inject, Param } from '@nestjs/common';
import { DocumentService } from '../services/document.service';

@Controller('/documents')
export class DocumentController {

  @Inject()
  protected $service: DocumentService;

  @Get('/:key')
  public readDocument(@Param('key') key: string): any {
    return this.$service.readFromKey(key);
  }
}
