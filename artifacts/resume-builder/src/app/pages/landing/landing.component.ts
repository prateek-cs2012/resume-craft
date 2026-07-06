import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule],
  template: `
<div class="landing-wrap">
  <div class="landing-hero">
    <mat-icon class="hero-icon">description</mat-icon>
    <h1>Resume Builder</h1>
    <p class="hero-sub">Create a professional, ATS-friendly resume in minutes.<br>Upload your existing resume or start fresh.</p>
  </div>

  <div class="choice-grid">

    <!-- Upload card -->
    <mat-card class="choice-card upload-card" (click)="go('/upload')">
      <div class="card-icon-wrap upload-icon-bg">
        <mat-icon class="card-icon">upload_file</mat-icon>
      </div>
      <mat-card-content>
        <h2>Upload Existing Resume</h2>
        <p>Upload a PDF or DOCX file. We'll extract your details and let you refine them in the editor.</p>
        <div class="feature-list">
          <div class="feature-item"><mat-icon>check_circle</mat-icon> PDF &amp; DOCX supported</div>
          <div class="feature-item"><mat-icon>check_circle</mat-icon> Instant text extraction</div>
          <div class="feature-item ai-chip">
            <mat-icon>auto_awesome</mat-icon>
            <span>AI Auto-fill <span class="ai-live-badge">AI-powered</span></span>
          </div>
        </div>
        <button mat-raised-button color="primary" class="cta-btn" (click)="go('/upload'); $event.stopPropagation()">
          <mat-icon>upload</mat-icon> Upload Resume
        </button>
      </mat-card-content>
    </mat-card>

    <!-- Manual card -->
    <mat-card class="choice-card manual-card" (click)="go('/builder')">
      <div class="card-icon-wrap manual-icon-bg">
        <mat-icon class="card-icon">edit_note</mat-icon>
      </div>
      <mat-card-content>
        <h2>Start From Scratch</h2>
        <p>Fill in your details step-by-step using our guided form and see your resume update in real time.</p>
        <div class="feature-list">
          <div class="feature-item"><mat-icon>check_circle</mat-icon> 8-step guided form</div>
          <div class="feature-item"><mat-icon>check_circle</mat-icon> Live preview as you type</div>
          <div class="feature-item"><mat-icon>check_circle</mat-icon> 3 professional templates</div>
        </div>
        <button mat-stroked-button color="primary" class="cta-btn" (click)="go('/builder'); $event.stopPropagation()">
          <mat-icon>edit</mat-icon> Start Building
        </button>
      </mat-card-content>
    </mat-card>

  </div>

  <p class="ats-note">
    <mat-icon>verified</mat-icon>
    All templates are optimized for Applicant Tracking Systems (ATS)
  </p>
</div>
  `,
  styles: [`
    .landing-wrap {
      min-height: calc(100vh - 64px);
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 40px 24px;
      background: linear-gradient(135deg, #e8eaf6 0%, #f3f4ff 50%, #e0f7fa 100%);
    }
    .landing-hero { text-align: center; margin-bottom: 48px; }
    .hero-icon { font-size: 56px; height: 56px; width: 56px; color: #3f51b5; margin-bottom: 16px; }
    .landing-hero h1 { font-size: 2.8rem; font-weight: 800; color: #1a237e; margin: 0 0 12px; }
    .hero-sub { color: #555; font-size: 1.1rem; line-height: 1.6; margin: 0; }

    .choice-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 28px;
      max-width: 860px; width: 100%;
    }

    .choice-card {
      cursor: pointer; border-radius: 16px !important; padding: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 2px solid transparent !important;
    }
    .choice-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(63,81,181,0.15) !important;
    }
    .upload-card:hover { border-color: #3f51b5 !important; }
    .manual-card:hover { border-color: #00796b !important; }

    .card-icon-wrap {
      width: 72px; height: 72px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin: 16px auto 20px;
    }
    .upload-icon-bg { background: linear-gradient(135deg, #3f51b5, #5c6bc0); }
    .manual-icon-bg { background: linear-gradient(135deg, #00796b, #26a69a); }
    .card-icon { font-size: 36px; height: 36px; width: 36px; color: #fff; }

    mat-card-content h2 { font-size: 1.35rem; font-weight: 700; color: #1a237e; text-align: center; margin: 0 0 10px; }
    mat-card-content p { color: #666; text-align: center; line-height: 1.5; margin-bottom: 20px; font-size: 0.95rem; }

    .feature-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .feature-item {
      display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #444;
    }
    .feature-item mat-icon { font-size: 18px; height: 18px; width: 18px; color: #43a047; }
    .ai-chip mat-icon { color: #ff9800; }
    .ai-live-badge {
      display: inline-block; background: linear-gradient(135deg, #7c4dff, #e040fb);
      color: #fff; font-size: 0.7rem; padding: 2px 7px; border-radius: 20px;
      font-weight: 600; letter-spacing: 0.3px; vertical-align: middle; margin-left: 4px;
    }

    .cta-btn { width: 100%; margin-top: 4px; }

    .ats-note {
      display: flex; align-items: center; gap: 6px; margin-top: 32px;
      color: #555; font-size: 0.88rem;
    }
    .ats-note mat-icon { font-size: 18px; height: 18px; width: 18px; color: #43a047; }

    @media (max-width: 959px) {
      .landing-wrap { padding: 28px 16px; }
      .landing-hero { margin-bottom: 32px; }
    }
    @media (max-width: 640px) {
      .landing-wrap { padding: 20px 12px; min-height: calc(100vh - 56px); }
      .choice-grid { grid-template-columns: 1fr; gap: 16px; }
      .landing-hero h1 { font-size: 1.8rem; }
      .hero-sub { font-size: 0.95rem; }
      .hero-icon { font-size: 44px; height: 44px; width: 44px; }
      .card-icon-wrap { width: 60px; height: 60px; }
      .card-icon { font-size: 28px; height: 28px; width: 28px; }
      mat-card-content h2 { font-size: 1.15rem; }
    }
  `]
})
export class LandingComponent {
  constructor(private router: Router, title: Title, meta: Meta) {
    title.setTitle('ResumeCraft | Free ATS-Friendly Resume Builder');
    meta.updateTag({ name: 'description', content: 'Build a professional, ATS-friendly resume in minutes with ResumeCraft. Upload your existing resume or start from scratch and download a polished PDF optimized for applicant tracking systems.' });
    meta.updateTag({ name: 'robots', content: 'index, follow' });
    meta.updateTag({ property: 'og:title', content: 'ResumeCraft | Free ATS-Friendly Resume Builder' });
    meta.updateTag({ property: 'og:description', content: 'Build a professional, ATS-friendly resume in minutes. Upload, customize, and download a polished PDF that gets past applicant tracking systems.' });
    meta.updateTag({ property: 'og:url', content: 'https://resumecraft.app/' });
  }
  go(path: string) { this.router.navigate([path]); }
}
