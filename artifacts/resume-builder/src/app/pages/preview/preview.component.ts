import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResumeService } from '../../services/resume.service';
import { ModernTemplateComponent } from '../../templates/modern/modern-template.component';
import { ExecutiveTemplateComponent } from '../../templates/executive/executive-template.component';
import { CreativeTemplateComponent } from '../../templates/creative/creative-template.component';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatTooltipModule,
    ModernTemplateComponent, ExecutiveTemplateComponent, CreativeTemplateComponent
  ],
  template: `
<div class="preview-page">
  <div class="preview-toolbar no-print">
    <button mat-stroked-button (click)="goBack()">
      <mat-icon>arrow_back</mat-icon> Back to Editor
    </button>
    <div class="template-switcher">
      <span class="switch-label">Template:</span>
      <button *ngFor="let t of templates" mat-button
        [class.active-tmpl]="currentTemplate === t.id"
        (click)="switchTemplate(t.id)">
        {{ t.name }}
      </button>
    </div>
    <button mat-raised-button color="primary" (click)="printResume()">
      <mat-icon>print</mat-icon> Print / Save PDF
    </button>
  </div>

  <div class="print-hint no-print">
    <mat-icon>info</mat-icon>
    To save as PDF: Click "Print / Save PDF", then choose "Save as PDF" as the destination in your browser's print dialog.
  </div>

  <div class="resume-wrapper print-area">
    <ng-container [ngSwitch]="currentTemplate">
      <app-modern-template *ngSwitchCase="'modern'" [data]="data"></app-modern-template>
      <app-executive-template *ngSwitchCase="'executive'" [data]="data"></app-executive-template>
      <app-creative-template *ngSwitchCase="'creative'" [data]="data"></app-creative-template>
      <app-modern-template *ngSwitchDefault [data]="data"></app-modern-template>
    </ng-container>
  </div>
</div>
  `,
  styles: [`
    .preview-page { min-height: 100vh; background: #e8eaf6; }
    .preview-toolbar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 10px 20px; background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 64px; z-index: 50;
    }
    .template-switcher { display: flex; align-items: center; gap: 4px; flex: 1; flex-wrap: wrap; }
    .switch-label { font-size: 0.85rem; color: #666; margin-right: 4px; white-space: nowrap; }
    .active-tmpl { background: #e8eaf6; color: #3f51b5; font-weight: 600; border-radius: 4px; }
    .print-hint {
      display: flex; align-items: flex-start; gap: 6px;
      background: #fff3e0; color: #e65100;
      padding: 8px 20px; font-size: 0.82rem; line-height: 1.4;
    }
    .print-hint mat-icon { font-size: 16px; height: 16px; width: 16px; flex-shrink: 0; margin-top: 2px; }
    .resume-wrapper {
      padding: 32px 16px; display: flex; justify-content: center;
      overflow-x: auto;
    }

    /* Tablet (600–959px) */
    @media (max-width: 959px) {
      .preview-toolbar { top: 56px; padding: 8px 14px; gap: 8px; }
      .resume-wrapper { padding: 20px 8px; }
    }

    /* Mobile (<600px) — scale the resume to fit the screen */
    @media (max-width: 599px) {
      .preview-toolbar { top: 56px; flex-direction: column; align-items: flex-start; gap: 6px; padding: 10px 12px; }
      .template-switcher { width: 100%; }
      .preview-toolbar button { width: 100%; justify-content: center; }
      .resume-wrapper {
        padding: 12px 0; justify-content: flex-start;
        overflow-x: hidden;
      }
      .resume-wrapper > * {
        transform-origin: top left;
        transform: scale(0.43);
        width: 794px;
        margin-bottom: calc((794px * 1.15 * 0.43) - (794px * 1.15));
      }
    }

    @media print {
      .preview-page { background: white; }
      .resume-wrapper { padding: 0; }
      .resume-wrapper > * { transform: none !important; width: auto !important; margin-bottom: 0 !important; }
    }
  `]
})
export class PreviewComponent {
  private resumeService = inject(ResumeService);
  private router = inject(Router);

  data = this.resumeService.resumeData();
  currentTemplate = this.data.selectedTemplate || 'modern';

  templates = [
    { id: 'modern', name: 'Modern' },
    { id: 'executive', name: 'Executive' },
    { id: 'creative', name: 'Creative' }
  ];

  switchTemplate(id: string): void {
    this.currentTemplate = id;
    this.resumeService.setTemplate(id);
  }

  goBack(): void { this.router.navigate(['/']); }

  printResume(): void { window.print(); }
}
