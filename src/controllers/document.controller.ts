import { Controller, Inject, UseInterceptors, Post, UploadedFiles } from '@nestjs/common';
import { DocumentService } from '../services/document.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { readFromBuffer } from '../utils/qrcode.util';

@Controller('/documents')
export class DocumentController {

  @Inject()
  protected $service: DocumentService;

  @Post('/')
  @UseInterceptors(AnyFilesInterceptor())
  public async readDocument(@UploadedFiles() files: Express.Multer.File[]) {
    // 1. Extraer QR desde imágenes
    const qrResults = await Promise.allSettled(
      files.map(file => readFromBuffer(file.buffer))
    );

    const qrUrls = qrResults
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    // 2. Leer NFC-e desde URLs
    const nfcResults = await Promise.allSettled(
      qrUrls.map(url => this.$service.readFromURL(url))
    );

    // 3. Retornar solo resultados válidos
    return nfcResults
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  }
}
