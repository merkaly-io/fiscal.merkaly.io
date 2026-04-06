import sharp from 'sharp';
import { readBarcodes } from 'zxing-wasm/reader';

export async function readFromBuffer(fileBuffer: Buffer): Promise<string> {
  // Procesar imagen con sharp
  const { data, info } = await sharp(fileBuffer)
    .normalize()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convertir a formato esperado por el lector de QR
  const imageData = {
    data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
    width: info.width,
    height: info.height,
  };

  // Leer QR
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
