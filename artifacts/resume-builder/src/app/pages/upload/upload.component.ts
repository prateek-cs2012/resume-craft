import { Component, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadService } from '../../services/upload.service';
import { ResumeService } from '../../services/resume.service';
import { ResumeData } from '../../models/resume.model';

type UploadState = 'idle' | 'extracting' | 'parsing' | 'done' | 'error';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatCardModule,
    MatProgressBarModule, MatTooltipModule
  ],
  template: `
<div class="upload-wrap">

  <button mat-button class="back-btn" (click)="router.navigate(['/'])">
    <mat-icon>arrow_back</mat-icon> Back
  </button>

  <div class="upload-content">
    <div class="page-header">
      <mat-icon class="page-icon">upload_file</mat-icon>
      <h1>Upload Your Resume</h1>
      <p>We'll extract the text from your file and use AI to pre-fill the builder.</p>
    </div>

    <!-- Drop zone -->
    <mat-card class="drop-zone"
      [class.drag-over]="isDragging()"
      [class.has-file]="state() === 'done'"
      [class.is-loading]="state() === 'extracting' || state() === 'parsing'"
      (dragover)="onDragOver($event)"
      (dragleave)="isDragging.set(false)"
      (drop)="onDrop($event)"
      (click)="canClick() && fileInput.click()">

      <input #fileInput type="file" accept=".pdf,.docx" style="display:none"
        (change)="onFileChange($event)">

      @if (state() === 'idle') {
        <mat-icon class="drop-icon">cloud_upload</mat-icon>
        <p class="drop-label">Drag &amp; drop your resume here</p>
        <p class="drop-sub">or click to browse</p>
        <div class="file-types">
          <span class="badge">PDF</span>
          <span class="badge">DOCX</span>
        </div>
      }

      @if (state() === 'extracting') {
        <mat-icon class="drop-icon spin">sync</mat-icon>
        <p class="drop-label">Extracting text from file…</p>
        <mat-progress-bar mode="indeterminate" class="prog-bar"></mat-progress-bar>
      }

      @if (state() === 'parsing') {
        <mat-icon class="drop-icon ai-spin">auto_awesome</mat-icon>
        <p class="drop-label">AI is parsing your resume…</p>
        <p class="drop-sub">Identifying skills, experience, education & more</p>
        <mat-progress-bar mode="indeterminate" class="prog-bar" color="accent"></mat-progress-bar>
      }

      @if (state() === 'done') {
        <mat-icon class="drop-icon success-icon">check_circle</mat-icon>
        <p class="drop-label">{{ uploadSvc.fileName() }}</p>
        <p class="drop-sub">
          @if (parsedData()) { AI parsed successfully · }
          Text extracted · Click to replace
        </p>
      }

      @if (state() === 'error') {
        <mat-icon class="drop-icon error-icon">error</mat-icon>
        <p class="drop-label">{{ errorMsg() }}</p>
        <p class="drop-sub">Click to try again</p>
      }
    </mat-card>

    <!-- AI parse result banner -->
    @if (state() === 'done' && parsedData()) {
      <mat-card class="ai-success-card">
        <div class="ai-success-inner">
          <mat-icon class="ai-done-icon">auto_awesome</mat-icon>
          <div>
            <h3>AI Parsing Complete!</h3>
            <p>Your resume has been analysed. Click <strong>Continue to Builder</strong> — all fields will be pre-filled and ready to review.</p>
          </div>
        </div>
      </mat-card>
    }

    <!-- AI placeholder banner (when parsing failed or no key) -->
    @if (state() === 'done' && !parsedData()) {
      <mat-card class="text-preview-card">
        <div class="preview-header">
          <div class="preview-title">
            <mat-icon>article</mat-icon>
            <span>Extracted Text</span>
            <span class="word-count">{{ wordCount() }} words</span>
          </div>
          <button mat-icon-button matTooltip="Copy text" (click)="copyText()">
            <mat-icon>{{ copied() ? 'check' : 'content_copy' }}</mat-icon>
          </button>
        </div>
        <pre class="text-body">{{ uploadSvc.extractedText() }}</pre>
      </mat-card>

      <mat-card class="ai-placeholder-card">
        <div class="ai-inner">
          <mat-icon class="ai-icon">auto_awesome</mat-icon>
          <div>
            <h3>AI Auto-fill <span class="coming-soon-badge">Could not parse</span></h3>
            <p>AI parsing was unavailable. You can still continue to the builder and fill in your details manually using the extracted text above as reference.</p>
          </div>
        </div>
      </mat-card>
    }

    <!-- Action buttons -->
    @if (state() === 'done') {
      <div class="action-row">
        <button mat-stroked-button (click)="resetUpload()">
          <mat-icon>refresh</mat-icon> Upload Different File
        </button>
        <button mat-raised-button color="primary" (click)="goToBuilder()">
          <mat-icon>edit</mat-icon> Continue to Builder
        </button>
      </div>
    }

    @if (state() === 'idle' || state() === 'error') {
      <div class="manual-hint">
        <span>Prefer to start fresh?</span>
        <button mat-button color="primary" (click)="router.navigate(['/builder'])">
          Fill in manually <mat-icon>arrow_forward</mat-icon>
        </button>
      </div>
    }

  </div>
</div>
  `,
  styles: [`
    .upload-wrap { min-height: calc(100vh - 64px); background: #f5f5f5; padding: 24px; }
    .back-btn { margin-bottom: 8px; color: #555; }

    .upload-content { max-width: 720px; margin: 0 auto; }

    .page-header { text-align: center; margin-bottom: 32px; }
    .page-icon { font-size: 48px; height: 48px; width: 48px; color: #3f51b5; margin-bottom: 12px; }
    .page-header h1 { font-size: 2rem; font-weight: 700; color: #1a237e; margin: 0 0 8px; }
    .page-header p { color: #666; margin: 0; }

    .drop-zone {
      border: 2px dashed #9fa8da !important; border-radius: 16px !important;
      padding: 48px 24px; text-align: center; cursor: pointer;
      transition: border-color 0.2s, background 0.2s; background: #fff !important;
    }
    .drop-zone:hover:not(.is-loading), .drag-over { border-color: #3f51b5 !important; background: #e8eaf6 !important; }
    .has-file { border-style: solid !important; border-color: #43a047 !important; background: #f1f8f1 !important; }
    .is-loading { cursor: default; }

    .drop-icon { font-size: 52px; height: 52px; width: 52px; color: #9fa8da; margin-bottom: 12px; }
    .success-icon { color: #43a047; }
    .error-icon { color: #e53935; }
    .spin { animation: spin 1.2s linear infinite; color: #3f51b5; }
    .ai-spin { animation: pulse 1.5s ease-in-out infinite; color: #ff9800; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.15); } }

    .drop-label { font-size: 1.1rem; font-weight: 600; color: #333; margin: 4px 0; }
    .drop-sub { color: #888; font-size: 0.9rem; margin: 0; }
    .file-types { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
    .badge { background: #e8eaf6; color: #3f51b5; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    .prog-bar { width: 200px; margin: 16px auto 0; border-radius: 4px; }

    /* AI success */
    .ai-success-card {
      margin-top: 20px; border-radius: 12px !important;
      border-left: 4px solid #43a047 !important; background: #f1f8f1 !important;
    }
    .ai-success-inner { display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; }
    .ai-done-icon { font-size: 32px; height: 32px; width: 32px; color: #43a047; flex-shrink: 0; margin-top: 2px; }
    .ai-success-inner h3 { margin: 0 0 6px; font-size: 1rem; color: #2e7d32; }
    .ai-success-inner p { margin: 0; font-size: 0.88rem; color: #555; line-height: 1.5; }

    /* Text preview */
    .text-preview-card { margin-top: 20px; border-radius: 12px !important; overflow: hidden; }
    .preview-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: #e8eaf6; border-bottom: 1px solid #d0d4f0;
    }
    .preview-title { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #3f51b5; }
    .preview-title mat-icon { font-size: 20px; height: 20px; width: 20px; }
    .word-count { font-size: 0.8rem; color: #888; font-weight: 400; }
    .text-body {
      max-height: 260px; overflow-y: auto; padding: 16px;
      font-size: 0.85rem; line-height: 1.6; color: #333;
      white-space: pre-wrap; word-break: break-word; margin: 0;
      font-family: 'Courier New', monospace; background: #fafafa;
    }

    /* AI placeholder */
    .ai-placeholder-card {
      margin-top: 16px; border-radius: 12px !important;
      border-left: 4px solid #ff9800 !important; background: #fff8f0 !important;
    }
    .ai-inner { display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; }
    .ai-icon { font-size: 32px; height: 32px; width: 32px; color: #ff9800; flex-shrink: 0; margin-top: 2px; }
    .ai-inner h3 { margin: 0 0 6px; font-size: 1rem; color: #e65100; display: flex; align-items: center; gap: 8px; }
    .ai-inner p { margin: 0; font-size: 0.88rem; color: #666; line-height: 1.5; }
    .coming-soon-badge {
      display: inline-block; background: #ff9800; color: #fff;
      font-size: 0.68rem; padding: 2px 8px; border-radius: 20px; font-weight: 600;
    }

    .action-row { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
    .manual-hint { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 24px; color: #888; font-size: 0.9rem; }

    @media (max-width: 959px) {
      .upload-wrap { padding: 16px; }
      .upload-content { max-width: 100%; }
    }
    @media (max-width: 599px) {
      .upload-wrap { padding: 12px 10px; min-height: calc(100vh - 56px); }
      .page-header h1 { font-size: 1.5rem; }
      .page-icon { font-size: 36px; height: 36px; width: 36px; }
      .drop-zone { padding: 32px 16px; }
      .drop-icon { font-size: 40px; height: 40px; width: 40px; }
      .action-row { flex-direction: column; }
      .action-row button { width: 100%; }
      .ai-success-inner, .ai-inner { flex-direction: column; gap: 10px; }
    }
  `]
})
export class UploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  state = signal<UploadState>('idle');
  errorMsg = signal('');
  isDragging = signal(false);
  copied = signal(false);
  parsedData = signal<ResumeData | null>(null);

  wordCount = computed(() =>
    this.uploadSvc.extractedText().split(/\s+/).filter(Boolean).length
  );

  canClick = computed(() =>
    this.state() !== 'extracting' && this.state() !== 'parsing'
  );

  constructor(
    public router: Router,
    public uploadSvc: UploadService,
    private resumeSvc: ResumeService,
    title: Title,
    meta: Meta
  ) {
    title.setTitle('Upload Your Resume | ResumeCraft');
    meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging.set(true); }
  onDrop(e: DragEvent) {
    e.preventDefault(); this.isDragging.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }
  onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
    (e.target as HTMLInputElement).value = '';
  }

  async processFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx'].includes(ext ?? '')) {
      this.state.set('error');
      this.errorMsg.set('Unsupported file type. Please upload a PDF or DOCX.');
      return;
    }

    this.state.set('extracting');
    this.parsedData.set(null);

    try {
      let text = '';
      if (ext === 'pdf') {
        text = await this.extractPdf(file);
      } else {
        text = await this.extractDocx(file);
      }

      if (!text.trim()) {
        this.state.set('error');
        this.errorMsg.set('No text could be extracted. The file may be image-only or scanned.');
        return;
      }

      this.uploadSvc.setExtracted(file.name, text.trim());

      // Try AI parsing
      this.state.set('parsing');
      try {
        const parsed = await this.callParseApi(text.trim());
        if (parsed) {
          this.parsedData.set(parsed);
        }
      } catch {
        // Parsing failed — proceed without parsed data
      }

      this.state.set('done');
    } catch {
      this.state.set('error');
      this.errorMsg.set('Failed to read the file. Please try again.');
    }
  }

  private async callParseApi(text: string): Promise<ResumeData | null> {
    const res = await fetch('/api/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const body = await res.json() as { resumeData?: ResumeData };
    return body.resumeData ?? null;
  }

  private async extractPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const parts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: unknown) => (item as { str?: string }).str ?? '')
        .join(' ');
      parts.push(pageText);
    }
    return parts.join('\n');
  }

  private async extractDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  copyText() {
    navigator.clipboard.writeText(this.uploadSvc.extractedText());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  resetUpload() {
    this.state.set('idle');
    this.parsedData.set(null);
    this.uploadSvc.clear();
  }

  goToBuilder() {
    const parsed = this.parsedData();
    if (parsed) {
      // Pre-fill builder with AI-parsed data, keep selectedTemplate
      const current = this.resumeSvc.resumeData();
      this.resumeSvc.update({ ...parsed, selectedTemplate: current.selectedTemplate });
    }
    this.router.navigate(['/builder']);
  }
}
