import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { AbstractParser } from 'src/abstracts/abstract.parser';
import { readBarcodes } from 'zxing-wasm/reader';

@Injectable()
export class ImageParser extends AbstractParser<Buffer> {
  public async parse(buffer: Buffer): Promise<string> {
    if (!buffer?.length) {
      throw new BadRequestException('ImageParser expects an image buffer');
    }

    const { data, info } = await sharp(buffer)
      .normalize()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const imageData = {
      data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
      height: info.height,
      width: info.width,
    };

    // @ts-ignore
    const results = await readBarcodes(imageData, {
      formats: ['QRCode'],
      tryDownscale: true,
      tryHarder: true,
      tryInvert: true,
      tryRotate: true,
    });

    if (!results?.length) {
      throw new Error('No QR code found in image');
    }

    return results[0].text;
  }
}
