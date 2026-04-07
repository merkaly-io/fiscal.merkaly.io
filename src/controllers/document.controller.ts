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

    // 2. Construir estructura con nombre + URL válida
    const qrData = qrResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          name: files[index].fieldname,
          url: result.value,
        };
      }
      return null;
    }).filter(Boolean);

    // 3. Leer NFC-e desde URLs
    const nfcResults = await Promise.allSettled(
      qrData.map(item => this.$service.readFromURL(item!.url))
    );

    // 4. Construir Record final
    const record: Record<string, any> = {};

    nfcResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const key = qrData[index]!.name;
        record[key] = result?.value;
      }
    });

    return record;
  }
}
