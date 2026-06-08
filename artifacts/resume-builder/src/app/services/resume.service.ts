import { Injectable, signal } from '@angular/core';
import { ResumeData, DEFAULT_RESUME } from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private readonly STORAGE_KEY = 'resume_data';

  resumeData = signal<ResumeData>(this.loadFromStorage());

  private loadFromStorage(): ResumeData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored) as ResumeData;
    } catch {}
    return structuredClone(DEFAULT_RESUME);
  }

  update(data: ResumeData): void {
    this.resumeData.set(data);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  reset(): void {
    const fresh = structuredClone(DEFAULT_RESUME);
    this.update(fresh);
  }

  setTemplate(templateId: string): void {
    const current = this.resumeData();
    this.update({ ...current, selectedTemplate: templateId });
  }
}
