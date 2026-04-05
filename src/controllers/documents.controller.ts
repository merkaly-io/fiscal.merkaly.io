import { Controller, Get } from '@nestjs/common';

@Controller('/documents')
export class DocumentsController {

  @Get('/:key')
  public readDocument() {
    return 'https://sat.sef.sc.gov.br/nfce/consulta/42260430527897000410650030003038071110510215';
  }
}
