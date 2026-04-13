import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { readBarcodes } from 'zxing-wasm/reader';

@Injectable()
export class QrService {
  public async read(buffer: Buffer): Promise<string> {
    const { data, info } = await sharp(buffer)
      .normalize()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const imageData = {
      data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
      width: info.width,
      height: info.height,
    };

    // @ts-ignore
    const results = await readBarcodes(imageData, {
      formats: ['QRCode'],
      tryHarder: true,
      tryRotate: true,
      tryInvert: true,
      tryDownscale: true,
    });

    if (!results || results.length === 0) {
      throw new Error('No QR code found in image');
    }

    return results[0].text;
  }
}
