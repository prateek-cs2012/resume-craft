import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResumeService } from '../../services/resume.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatCardModule, MatIconModule, MatChipsModule, MatDividerModule, MatTooltipModule,
  ],
  template: `
<div class="dashboard-page">

  <!-- Tier banner -->
  <div class="tier-banner premium-banner" *ngIf="userService.isPremium">
    <mat-icon>workspace_premium</mat-icon>
    <span>Premium Member — you have access to all features.</span>
  </div>
  <div class="tier-banner free-banner" *ngIf="!userService.isPremium">
    <div class="free-banner-left">
      <mat-icon>info</mat-icon>
      <span><strong>Free plan</strong> — upgrade to unlock AI optimize, resume upload, and more templates.</span>
    </div>
    <button mat-raised-button color="accent" routerLink="/pricing">
      <mat-icon>bolt</mat-icon> Upgrade to Premium
    </button>
  </div>

  <!-- ── "Get Started" screen when no resume yet ── -->
  <ng-container *ngIf="!hasResume()">
    <div class="welcome-header">
      <h1>Welcome{{ displayName ? ', ' + displayName : '' }}!</h1>
      <p class="subtitle">How would you like to build your resume?</p>
    </div>

    <div class="start-cards">
      <!-- Upload card — premium only -->
      <mat-card class="start-card" [class.locked-card]="!userService.isPremium"
        (click)="userService.isPremium ? router.navigate(['/upload']) : router.navigate(['/pricing'])">
        <mat-card-content class="start-card-inner">
          <div class="start-icon upload-icon">
            <mat-icon>upload_file</mat-icon>
          </div>
          <h2>Upload Existing Resume
            <span *ngIf="!userService.isPremium" class="premium-label">
              <mat-icon>lock</mat-icon> Premium
            </span>
          </h2>
          <p>Import your PDF or DOCX and we'll auto-fill the builder in seconds using AI.</p>
          <button mat-raised-button color="primary" class="start-btn"
                  [routerLink]="userService.isPremium ? '/upload' : '/pricing'">
            <mat-icon>{{ userService.isPremium ? 'upload' : 'lock' }}</mat-icon>
            {{ userService.isPremium ? 'Upload Resume' : 'Upgrade to Upload' }}
          </button>
        </mat-card-content>
      </mat-card>

      <div class="or-divider">
        <mat-divider></mat-divider>
        <span>or</span>
        <mat-divider></mat-divider>
      </div>

      <mat-card class="start-card" (click)="router.navigate(['/builder'])">
        <mat-card-content class="start-card-inner">
          <div class="start-icon builder-icon">
            <mat-icon>edit_note</mat-icon>
          </div>
          <h2>Build from Scratch</h2>
          <p>Use our guided step-by-step builder to craft a polished resume.</p>
          <button mat-raised-button color="accent" class="start-btn"
                  routerLink="/builder">
            <mat-icon>arrow_forward</mat-icon> Open Builder
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  </ng-container>

  <!-- ── Existing resume dashboard ── -->
  <ng-container *ngIf="hasResume()">
    <div class="welcome-header">
      <h1>Welcome back{{ displayName ? ', ' + displayName : '' }}!</h1>
      <p class="subtitle">Pick up where you left off or start fresh.</p>
    </div>

    <mat-card class="resume-card">
      <mat-card-content>
        <div class="resume-summary">
          <div class="resume-meta">
            <div class="resume-avatar">
              <mat-icon>description</mat-icon>
            </div>
            <div class="resume-info">
              <h2 class="resume-name">{{ resume().personalInfo.fullName || 'Untitled Resume' }}</h2>
              <p class="resume-title">{{ resume().personalInfo.title || '' }}</p>
              <div class="resume-chips">
                <span class="chip template-chip">
                  <mat-icon>palette</mat-icon>
                  {{ templateLabel() }}
                </span>
                <span class="chip" *ngIf="resume().workExperience.length">
                  <mat-icon>work</mat-icon>
                  {{ resume().workExperience.length }} job{{ resume().workExperience.length !== 1 ? 's' : '' }}
                </span>
                <span class="chip" *ngIf="resume().projects.length">
                  <mat-icon>folder</mat-icon>
                  {{ resume().projects.length }} project{{ resume().projects.length !== 1 ? 's' : '' }}
                </span>
                <span class="chip" *ngIf="resume().education.length">
                  <mat-icon>school</mat-icon>
                  {{ resume().education.length }} education
                </span>
              </div>
            </div>
          </div>

          <div class="resume-actions">
            <button mat-raised-button color="primary" routerLink="/builder">
              <mat-icon>edit</mat-icon> Continue Editing
            </button>
            <button mat-stroked-button color="primary" routerLink="/preview">
              <mat-icon>visibility</mat-icon> Preview / PDF
            </button>
            <button mat-stroked-button [routerLink]="userService.isPremium ? '/upload' : '/pricing'"
              [matTooltip]="userService.isPremium ? '' : 'Premium feature'">
              <mat-icon>{{ userService.isPremium ? 'upload_file' : 'lock' }}</mat-icon>
              Upload New
            </button>
            <button mat-stroked-button color="warn" (click)="startFresh()">
              <mat-icon>restart_alt</mat-icon> Start Fresh
            </button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <div class="quick-actions">
      <h3>Quick actions</h3>
      <div class="quick-grid">
        <button mat-stroked-button class="quick-btn" routerLink="/builder">
          <mat-icon>tune</mat-icon>
          <span>Edit Details</span>
        </button>
        <button mat-stroked-button class="quick-btn" routerLink="/preview">
          <mat-icon>print</mat-icon>
          <span>Download PDF</span>
        </button>
        <button mat-stroked-button class="quick-btn"
          [routerLink]="userService.isPremium ? '/upload' : '/pricing'">
          <mat-icon>{{ userService.isPremium ? 'cloud_upload' : 'workspace_premium' }}</mat-icon>
          <span>{{ userService.isPremium ? 'Re-upload' : 'Upgrade' }}</span>
        </button>
      </div>
    </div>
  </ng-container>

</div>
  `,
  styles: [`
    .dashboard-page {
      min-height: 100vh;
      background: #f5f5f5;
      padding: 0 24px 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ── Tier banners ── */
    .tier-banner {
      width: 100%; max-width: 780px; margin: 20px 0 0;
      display: flex; align-items: center; gap: 12px;
      border-radius: 10px; padding: 12px 18px;
      font-size: 0.9rem;
    }
    .premium-banner {
      background: linear-gradient(135deg, #1a237e, #3949ab);
      color: white;
    }
    .premium-banner mat-icon { color: #fbbf24; font-size: 20px; height: 20px; width: 20px; flex-shrink: 0; }
    .free-banner {
      background: #fff3e0; color: #e65100;
      display: flex; justify-content: space-between;
      flex-wrap: wrap; gap: 10px;
    }
    .free-banner-left { display: flex; align-items: center; gap: 8px; }
    .free-banner mat-icon { font-size: 18px; height: 18px; width: 18px; flex-shrink: 0; }
    .free-banner button { flex-shrink: 0; }

    /* ── Header ── */
    .welcome-header {
      text-align: center;
      margin-top: 40px;
      margin-bottom: 40px;
    }
    .welcome-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 8px;
    }
    .welcome-header .subtitle {
      font-size: 1.05rem;
      color: #666;
      margin: 0;
    }

    /* ── Get started cards ── */
    .start-cards {
      display: flex;
      align-items: stretch;
      gap: 0;
      width: 100%;
      max-width: 720px;
    }
    .start-card {
      flex: 1;
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.15s;
      border-radius: 16px !important;
    }
    .start-card:hover {
      box-shadow: 0 8px 32px rgba(63,81,181,0.15) !important;
      transform: translateY(-2px);
    }
    .locked-card { opacity: 0.85; }
    .start-card-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 32px 24px !important;
      gap: 12px;
    }
    .start-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .start-icon mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }
    .upload-icon { background: #e8eaf6; color: #3f51b5; }
    .builder-icon { background: #f3e5f5; color: #9c27b0; }
    .start-card h2 { font-size: 1.2rem; font-weight: 600; margin: 0; color: #1a1a2e; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .start-card p { font-size: 0.9rem; color: #666; margin: 0; line-height: 1.5; }
    .start-btn { width: 100%; margin-top: 8px; }
    .premium-label {
      display: inline-flex; align-items: center; gap: 3px;
      background: #fff3cd; color: #856404;
      border-radius: 12px; padding: 2px 8px; font-size: 11px; font-weight: 700;
    }
    .premium-label mat-icon { font-size: 12px; height: 12px; width: 12px; }

    .or-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 20px;
      gap: 8px;
      color: #999;
      font-size: 13px;
      min-width: 40px;
    }
    .or-divider mat-divider { height: 60px; }

    /* ── Existing resume card ── */
    .resume-card {
      width: 100%;
      max-width: 780px;
      border-radius: 16px !important;
      margin-bottom: 32px;
    }
    .resume-summary {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .resume-meta {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }
    .resume-avatar {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      background: #e8eaf6;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .resume-avatar mat-icon { font-size: 32px; width: 32px; height: 32px; color: #3f51b5; }
    .resume-info { flex: 1; }
    .resume-name { font-size: 1.4rem; font-weight: 700; margin: 0 0 4px; color: #1a1a2e; }
    .resume-title { font-size: 1rem; color: #666; margin: 0 0 12px; }
    .resume-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #f0f0f0;
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 12px;
      color: #555;
    }
    .chip mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .template-chip { background: #e8eaf6; color: #3f51b5; }
    .resume-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .resume-actions button mat-icon { margin-right: 4px; }

    /* ── Quick actions ── */
    .quick-actions {
      width: 100%;
      max-width: 780px;
    }
    .quick-actions h3 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #999;
      margin: 0 0 12px;
    }
    .quick-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .quick-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 16px 24px !important;
      height: auto !important;
      border-radius: 12px !important;
    }
    .quick-btn mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .quick-btn span { font-size: 13px; }

    @media (max-width: 600px) {
      .start-cards { flex-direction: column; }
      .or-divider { flex-direction: row; padding: 12px 0; }
      .or-divider mat-divider { height: 1px; flex: 1; }
      .resume-meta { flex-direction: column; }
      .resume-actions { flex-direction: column; }
      .resume-actions button { width: 100%; }
      .free-banner { flex-direction: column; }
    }
  `]
})
export class DashboardComponent {
  protected router = inject(Router);
  private resumeService = inject(ResumeService);
  private authService = inject(AuthService);
  readonly userService = inject(UserService);

  resume = this.resumeService.resumeData;
  hasResume = this.resumeService.hasStoredData;

  get displayName(): string {
    return this.authService.getDisplayName();
  }

  templateLabel = computed(() => {
    const t = this.resume().selectedTemplate;
    return t === 'modern' ? 'Modern' : t === 'executive' ? 'Executive' : t === 'creative' ? 'Creative' : t;
  });

  startFresh(): void {
    if (confirm('This will clear your current resume. Continue?')) {
      this.resumeService.reset();
    }
  }
}
