import { Injectable, signal } from '@angular/core';
import { ResumeData, DEFAULT_RESUME } from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private readonly STORAGE_KEY = 'resume_data';
  // Bump this when the default resume changes to clear stale cached sample data.
  private readonly STORAGE_VERSION = '3';
  private readonly VERSION_KEY = 'resume_data_version';

  // True only when the user has explicitly saved data (upload, builder edit, etc.)
  // False for brand-new users who haven't touched anything yet.
  readonly hasStoredData = signal(this.checkStoredData());

  resumeData = signal<ResumeData>(this.loadFromStorage());

  private checkStoredData(): boolean {
    try {
      const version = localStorage.getItem(this.VERSION_KEY);
      if (version !== this.STORAGE_VERSION) return false;
      return !!localStorage.getItem(this.STORAGE_KEY);
    } catch { return false; }
  }

  private loadFromStorage(): ResumeData {
    try {
      const version = localStorage.getItem(this.VERSION_KEY);
      if (version !== this.STORAGE_VERSION) {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.setItem(this.VERSION_KEY, this.STORAGE_VERSION);
        return structuredClone(DEFAULT_RESUME);
      }
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored) as ResumeData;
    } catch {}
    return structuredClone(DEFAULT_RESUME);
  }

  update(data: ResumeData): void {
    this.resumeData.set(data);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(this.VERSION_KEY, this.STORAGE_VERSION);
      this.hasStoredData.set(true);
    } catch {}
  }

  reset(): void {
    // Remove stored data so the user is treated as a fresh start
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {}
    this.hasStoredData.set(false);
    this.resumeData.set(structuredClone(DEFAULT_RESUME));
  }

  setTemplate(templateId: string): void {
    const current = this.resumeData();
    this.update({ ...current, selectedTemplate: templateId });
  }
}
