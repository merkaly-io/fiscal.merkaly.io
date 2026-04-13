export interface NfcSource {
  nfc: Buffer;
  type: 'nfc';
}

export interface XmlSource {
  type: 'xml';
  xml: string;
}

export type Source = NfcSource | XmlSource;
