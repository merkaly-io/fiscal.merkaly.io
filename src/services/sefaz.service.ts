import { Injectable } from '@nestjs/common';

@Injectable()
export class SefazService {
  public async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch NFC-e content from ${url}: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }
}
