import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UploadService {
  extractedText = signal<string>('');
  fileName = signal<string>('');

  setExtracted(fileName: string, text: string): void {
    this.fileName.set(fileName);
    this.extractedText.set(text);
  }

  clear(): void {
    this.fileName.set('');
    this.extractedText.set('');
  }
}
