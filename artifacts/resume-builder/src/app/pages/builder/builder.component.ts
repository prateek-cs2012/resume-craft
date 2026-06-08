import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, merge, debounceTime, takeUntil } from 'rxjs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ResumeService } from '../../services/resume.service';
import { DEFAULT_RESUME, ResumeData } from '../../models/resume.model';
import { ModernTemplateComponent } from '../../templates/modern/modern-template.component';
import { ExecutiveTemplateComponent } from '../../templates/executive/executive-template.component';
import { CreativeTemplateComponent } from '../../templates/creative/creative-template.component';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatStepperModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCheckboxModule,
    MatCardModule, MatChipsModule, MatDividerModule,
    MatTooltipModule, MatSnackBarModule,
    ModernTemplateComponent, ExecutiveTemplateComponent, CreativeTemplateComponent
  ],
  template: `
<div class="page-layout">

  <!-- Mobile tab toggle (hidden on desktop via CSS) -->
  <div class="mobile-tab-bar no-print">
    <button class="mob-tab" [class.mob-tab-active]="mobileView === 'form'" (click)="mobileView = 'form'">
      <mat-icon>edit</mat-icon> Form
    </button>
    <button class="mob-tab" [class.mob-tab-active]="mobileView === 'preview'" (click)="mobileView = 'preview'">
      <mat-icon>visibility</mat-icon> Preview
    </button>
  </div>

  <!-- LEFT: form panel -->
  <div class="form-panel" [class.mobile-hidden]="mobileView !== 'form'">
  <div class="builder-header no-print">
    <h1>Build Your Resume</h1>
    <p class="subtitle">Fill in your details. The preview updates live as you type.</p>
    <div class="header-actions">
      <button mat-stroked-button color="warn" (click)="resetToDefault()" matTooltip="Reset to sample data">
        <mat-icon>restore</mat-icon> Reset
      </button>
      <button mat-raised-button color="primary" (click)="goToPreview()">
        <mat-icon>print</mat-icon> Print / PDF
      </button>
    </div>
  </div>

  <mat-stepper [linear]="false" orientation="horizontal" #stepper class="resume-stepper no-print">

    <!-- Step 1: Personal Info -->
    <mat-step [stepControl]="personalForm" label="Personal Info">
      <form [formGroup]="personalForm">
        <div class="step-content">
          <h2 class="step-title"><mat-icon>person</mat-icon> Personal Information</h2>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" placeholder="John Doe" />
              <mat-error>Full name is required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Professional Title</mat-label>
              <input matInput formControlName="title" placeholder="Senior Software Engineer" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="you@example.com" />
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" placeholder="+1 555 000 0000" />
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Address</mat-label>
              <input matInput formControlName="address" placeholder="City, State, Country" />
              <mat-icon matSuffix>location_on</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>LinkedIn URL</mat-label>
              <input matInput formControlName="linkedin" placeholder="linkedin.com/in/yourname" />
              <mat-icon matSuffix>link</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>GitHub URL (optional)</mat-label>
              <input matInput formControlName="github" placeholder="github.com/yourname" />
              <mat-icon matSuffix>code</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Website (optional)</mat-label>
              <input matInput formControlName="website" placeholder="yourportfolio.com" />
              <mat-icon matSuffix>public</mat-icon>
            </mat-form-field>
          </div>
          <div class="step-nav">
            <button mat-raised-button color="primary" matStepperNext (click)="savePersonal()">
              Next <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </div>
      </form>
    </mat-step>

    <!-- Step 2: Profile Summary -->
    <mat-step label="Summary">
      <div class="step-content">
        <h2 class="step-title"><mat-icon>article</mat-icon> Profile Summary</h2>
        <p class="step-desc">Add bullet points that highlight your professional background and key strengths.</p>
        <div *ngFor="let ctrl of summaryBullets.controls; let i=index" class="bullet-row">
          <mat-form-field appearance="outline" class="bullet-field">
            <mat-label>Bullet {{ i + 1 }}</mat-label>
            <textarea matInput [formControl]="asFC(ctrl)" rows="2" placeholder="Describe a key professional strength..."></textarea>
          </mat-form-field>
          <button mat-icon-button color="warn" (click)="removeSummaryBullet(i)" matTooltip="Remove">
            <mat-icon>remove_circle</mat-icon>
          </button>
        </div>
        <button mat-stroked-button color="primary" (click)="addSummaryBullet()" class="add-btn">
          <mat-icon>add</mat-icon> Add Bullet
        </button>
        <div class="step-nav">
          <button mat-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
          <button mat-raised-button color="primary" matStepperNext (click)="saveSummary()">Next <mat-icon>arrow_forward</mat-icon></button>
        </div>
      </div>
    </mat-step>

    <!-- Step 3: Work Experience -->
    <mat-step label="Experience">
      <div class="step-content">
        <h2 class="step-title"><mat-icon>work</mat-icon> Work Experience</h2>
        <div *ngFor="let job of workForms.controls; let i=index" class="experience-card">
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>
                <span>{{ getJobTitle(i) }}</span>
              </mat-card-title>
              <button mat-icon-button color="warn" (click)="removeJob(i)" class="remove-card-btn" matTooltip="Remove">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-card-header>
            <mat-card-content [formGroup]="asGroup(job)">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Company</mat-label>
                  <input matInput formControlName="company" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Position</mat-label>
                  <input matInput formControlName="position" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Start Date</mat-label>
                  <input matInput formControlName="startDate" placeholder="e.g. Jan 2022" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>End Date</mat-label>
                  <input matInput formControlName="endDate" placeholder="e.g. Dec 2023" />
                </mat-form-field>
                <mat-checkbox formControlName="isCurrent" class="current-check">Currently working here</mat-checkbox>
              </div>
              <p class="bullets-label">Key Responsibilities / Achievements:</p>
              <div *ngFor="let b of getJobBullets(i).controls; let bi=index" class="bullet-row">
                <mat-form-field appearance="outline" class="bullet-field">
                  <textarea matInput [formControl]="asFC(b)" rows="2" placeholder="Describe a responsibility or achievement..."></textarea>
                </mat-form-field>
                <button mat-icon-button color="warn" (click)="removeJobBullet(i, bi)"><mat-icon>remove_circle</mat-icon></button>
              </div>
              <button mat-stroked-button (click)="addJobBullet(i)" class="add-btn-sm">
                <mat-icon>add</mat-icon> Add Bullet
              </button>
            </mat-card-content>
          </mat-card>
        </div>
        <button mat-stroked-button color="primary" (click)="addJob()" class="add-btn">
          <mat-icon>add</mat-icon> Add Job
        </button>
        <div class="step-nav">
          <button mat-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
          <button mat-raised-button color="primary" matStepperNext (click)="saveExperience()">Next <mat-icon>arrow_forward</mat-icon></button>
        </div>
      </div>
    </mat-step>

    <!-- Step 4: Education -->
    <mat-step label="Education">
      <div class="step-content">
        <h2 class="step-title"><mat-icon>school</mat-icon> Education</h2>
        <div *ngFor="let edu of eduForms.controls; let i=index" class="experience-card">
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>{{ getEduTitle(i) }}</mat-card-title>
              <button mat-icon-button color="warn" (click)="removeEdu(i)" class="remove-card-btn"><mat-icon>delete</mat-icon></button>
            </mat-card-header>
            <mat-card-content [formGroup]="asGroup(edu)">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Degree</mat-label>
                  <input matInput formControlName="degree" placeholder="Bachelor of Technology" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Field of Study</mat-label>
                  <input matInput formControlName="field" placeholder="Computer Science Engineering" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Institution</mat-label>
                  <input matInput formControlName="institution" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Location</mat-label>
                  <input matInput formControlName="location" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Year of Graduation</mat-label>
                  <input matInput formControlName="year" placeholder="2020" />
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        <button mat-stroked-button color="primary" (click)="addEdu()" class="add-btn">
          <mat-icon>add</mat-icon> Add Education
        </button>
        <div class="step-nav">
          <button mat-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
          <button mat-raised-button color="primary" matStepperNext (click)="saveEducation()">Next <mat-icon>arrow_forward</mat-icon></button>
        </div>
      </div>
    </mat-step>

    <!-- Step 5: Skills -->
    <mat-step label="Skills">
      <div class="step-content">
        <h2 class="step-title"><mat-icon>psychology</mat-icon> Skills</h2>

        <h3>Core Competencies</h3>
        <p class="step-desc">Enter each competency on a new line.</p>
        <mat-form-field appearance="outline" class="full-width-field">
          <mat-label>Core Competencies (one per line)</mat-label>
          <textarea matInput [formControl]="competenciesControl" rows="6" placeholder="Full-Stack Java Development&#10;System Design & Scalability&#10;..."></textarea>
        </mat-form-field>

        <mat-divider></mat-divider>
        <h3 style="margin-top:16px">Technical Skills</h3>
        <div *ngFor="let skill of techSkillForms.controls; let i=index" class="tech-skill-row">
          <mat-form-field appearance="outline" class="category-field">
            <mat-label>Category</mat-label>
            <input matInput [formControl]="getCtrl(asGroup(skill), 'category')" placeholder="e.g. Programming Languages" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="skills-field">
            <mat-label>Skills</mat-label>
            <input matInput [formControl]="getCtrl(asGroup(skill), 'skills')" placeholder="Java, Python, TypeScript" />
          </mat-form-field>
          <button mat-icon-button color="warn" (click)="removeTechSkill(i)"><mat-icon>remove_circle</mat-icon></button>
        </div>
        <button mat-stroked-button color="primary" (click)="addTechSkill()" class="add-btn">
          <mat-icon>add</mat-icon> Add Category
        </button>

        <mat-divider></mat-divider>
        <h3 style="margin-top:16px">Soft Skills</h3>
        <mat-form-field appearance="outline" class="full-width-field">
          <mat-label>Soft Skills (comma separated)</mat-label>
          <input matInput [formControl]="softSkillsControl" placeholder="Communication, Leadership, Teamwork" />
        </mat-form-field>

        <mat-divider></mat-divider>
        <h3 style="margin-top:16px">Domain Exposure</h3>
        <mat-form-field appearance="outline" class="full-width-field">
          <mat-label>Domains (comma separated)</mat-label>
          <input matInput [formControl]="domainControl" placeholder="Banking, Healthcare, FinTech" />
        </mat-form-field>

        <div class="step-nav">
          <button mat-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
          <button mat-raised-button color="primary" matStepperNext (click)="saveSkills()">Next <mat-icon>arrow_forward</mat-icon></button>
        </div>
      </div>
    </mat-step>

    <!-- Step 6: Projects -->
    <mat-step label="Projects">
      <div class="step-content">
        <h2 class="step-title"><mat-icon>folder_special</mat-icon> Key Projects</h2>
        <div *ngFor="let proj of projectForms.controls; let i=index" class="experience-card">
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>{{ getProjTitle(i) }}</mat-card-title>
              <button mat-icon-button color="warn" (click)="removeProject(i)" class="remove-card-btn"><mat-icon>delete</mat-icon></button>
            </mat-card-header>
            <mat-card-content [formGroup]="asGroup(proj)">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Project Title</mat-label>
                  <input matInput formControlName="title" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Your Role</mat-label>
                  <input matInput formControlName="role" placeholder="Backend Engineer" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Duration</mat-label>
                  <input matInput formControlName="duration" placeholder="6 months" />
                </mat-form-field>
              </div>
              <p class="bullets-label">Key Contributions:</p>
              <div *ngFor="let b of getProjBullets(i).controls; let bi=index" class="bullet-row">
                <mat-form-field appearance="outline" class="bullet-field">
                  <textarea matInput [formControl]="asFC(b)" rows="2" placeholder="Describe a key contribution..."></textarea>
                </mat-form-field>
                <button mat-icon-button color="warn" (click)="removeProjBullet(i, bi)"><mat-icon>remove_circle</mat-icon></button>
              </div>
              <button mat-stroked-button (click)="addProjBullet(i)" class="add-btn-sm">
                <mat-icon>add</mat-icon> Add Bullet
              </button>
            </mat-card-content>
          </mat-card>
        </div>
        <button mat-stroked-button color="primary" (click)="addProject()" class="add-btn">
          <mat-icon>add</mat-icon> Add Project
        </button>
        <div class="step-nav">
          <button mat-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
          <button mat-raised-button color="primary" matStepperNext (click)="saveProjects()">Next <mat-icon>arrow_forward</mat-icon></button>
        </div>
      </div>
    </mat-step>

    <!-- Step 7: Additional Info -->
    <mat-step label="Additional">
      <div class="step-content">
        <h2 class="step-title"><mat-icon>info</mat-icon> Additional Information</h2>
        <mat-form-field appearance="outline" class="full-width-field">
          <mat-label>Languages Known (comma separated)</mat-label>
          <input matInput [formControl]="languagesControl" placeholder="English, Hindi, French" />
          <mat-icon matSuffix>translate</mat-icon>
        </mat-form-field>
        <div class="step-nav">
          <button mat-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
          <button mat-raised-button color="primary" matStepperNext (click)="saveAdditional()">Next <mat-icon>arrow_forward</mat-icon></button>
        </div>
      </div>
    </mat-step>

    <!-- Step 8: Template Selection -->
    <mat-step label="Template">
      <div class="step-content">
        <h2 class="step-title"><mat-icon>palette</mat-icon> Choose Your Template</h2>
        <p class="step-desc">Select a template that best fits your style. You can change it anytime.</p>
        <div class="template-grid">
          <mat-card
            *ngFor="let tmpl of templates"
            class="template-card"
            [class.selected]="selectedTemplate === tmpl.id"
            (click)="selectTemplate(tmpl.id)">
            <div class="template-preview" [ngClass]="'template-preview-' + tmpl.id">
              <div class="preview-header"></div>
              <div class="preview-lines">
                <div class="preview-line long"></div>
                <div class="preview-line medium"></div>
                <div class="preview-line short"></div>
                <div class="preview-line long"></div>
                <div class="preview-line medium"></div>
              </div>
            </div>
            <mat-card-content>
              <h3>{{ tmpl.name }}</h3>
              <p>{{ tmpl.description }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-flat-button [color]="selectedTemplate === tmpl.id ? 'primary' : ''" (click)="selectTemplate(tmpl.id)">
                <mat-icon>{{ selectedTemplate === tmpl.id ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                {{ selectedTemplate === tmpl.id ? 'Selected' : 'Select' }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
        <div class="step-nav" style="margin-top:24px">
          <button mat-button matStepperPrevious><mat-icon>arrow_back</mat-icon> Back</button>
          <button mat-raised-button color="accent" (click)="goToPreview()">
            <mat-icon>visibility</mat-icon> Preview & Print
          </button>
        </div>
      </div>
    </mat-step>

  </mat-stepper>
  </div><!-- /form-panel -->

  <!-- RIGHT: live preview panel -->
  <aside class="preview-panel no-print" [class.mobile-hidden]="mobileView !== 'preview'">
    <div class="preview-panel-header">
      <span class="preview-label"><mat-icon>visibility</mat-icon> Live Preview</span>
      <div class="template-tabs">
        <button *ngFor="let t of templates"
          mat-button
          [class.active-tab]="selectedTemplate === t.id"
          (click)="selectTemplate(t.id)">
          {{ t.name }}
        </button>
      </div>
      <button mat-icon-button (click)="goToPreview()" matTooltip="Print / Export PDF">
        <mat-icon>print</mat-icon>
      </button>
    </div>
    <div class="preview-scroll-area">
      <div class="preview-scaler-outer">
        <div class="preview-scaler">
          <app-modern-template *ngIf="selectedTemplate === 'modern'" [data]="liveData()"></app-modern-template>
          <app-executive-template *ngIf="selectedTemplate === 'executive'" [data]="liveData()"></app-executive-template>
          <app-creative-template *ngIf="selectedTemplate === 'creative'" [data]="liveData()"></app-creative-template>
        </div>
      </div>
    </div>
  </aside>

</div><!-- /page-layout -->
  `,
  styles: [`
    /* ── Base / Desktop (≥960px) ── */
    :host { display: block; height: calc(100vh - 64px); overflow: hidden; }
    .page-layout { display: flex; height: 100%; overflow: hidden; position: relative; }
    .mobile-tab-bar { display: none; }

    /* Left form panel */
    .form-panel { flex: 0 0 52%; overflow-y: auto; padding: 24px 20px 60px; border-right: 1px solid #e0e0e0; background: #fafafa; }
    .builder-header { text-align: center; margin-bottom: 20px; }
    .builder-header h1 { font-size: 1.6rem; font-weight: 700; color: #1a237e; margin: 0 0 6px; }
    .subtitle { color: #666; margin-bottom: 12px; font-size: 0.88rem; }
    .header-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

    /* Right preview panel */
    .preview-panel { flex: 1; display: flex; flex-direction: column; background: #e8eaf6; overflow: hidden; }
    .preview-panel-header {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
      padding: 10px 14px; background: #fff; border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .preview-label { display: flex; align-items: center; gap: 4px; font-weight: 600; color: #1a237e; font-size: 0.9rem; white-space: nowrap; }
    .preview-label mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .template-tabs { display: flex; gap: 4px; flex: 1; }
    .template-tabs button { font-size: 0.8rem; min-width: 0; padding: 0 10px; border-radius: 20px; color: #555; }
    .template-tabs .active-tab { background: #3f51b5; color: #fff !important; }

    .preview-scroll-area { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 16px 0; }
    .preview-scaler-outer { display: flex; justify-content: center; }
    .preview-scaler {
      transform-origin: top center;
      transform: scale(0.62);
      width: 794px;
      margin-bottom: calc((794px * 1.15 * 0.62) - (794px * 1.15));
    }

    /* Form internals */
    .step-content { padding: 20px 0; }
    .step-title { display: flex; align-items: center; gap: 8px; font-size: 1.2rem; font-weight: 600; color: #1a237e; margin-bottom: 16px; }
    .step-title mat-icon { color: #3f51b5; }
    .step-desc { color: #666; margin-bottom: 14px; font-size: 0.88rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
    .form-grid mat-form-field { width: 100%; }
    .full-width { grid-column: 1 / -1; }
    .full-width-field { width: 100%; }
    .bullet-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
    .bullet-field { flex: 1; }
    .bullets-label { font-weight: 500; color: #555; margin: 10px 0 6px; }
    .add-btn { margin-top: 8px; }
    .add-btn-sm { margin-top: 4px; font-size: 0.85rem; }
    .step-nav { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
    .experience-card { margin-bottom: 14px; }
    .experience-card mat-card { position: relative; }
    .remove-card-btn { position: absolute; top: 8px; right: 8px; }
    .experience-card mat-card-header { padding-bottom: 0; }
    .current-check { grid-column: 1 / -1; }
    .tech-skill-row { display: flex; align-items: center; gap: 8px; }
    .category-field { flex: 0 0 180px; }
    .skills-field { flex: 1; }
    .template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .template-card { cursor: pointer; transition: all 0.2s; border: 2px solid transparent !important; }
    .template-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
    .template-card.selected { border-color: #3f51b5 !important; box-shadow: 0 0 0 2px #3f51b5 !important; }
    .template-preview { height: 120px; border-radius: 6px; overflow: hidden; margin-bottom: 8px; }
    .template-preview-modern { background: linear-gradient(135deg, #1a237e 0%, #283593 40%, #e8eaf6 40%); }
    .template-preview-executive { background: linear-gradient(180deg, #212121 0%, #212121 35%, #fafafa 35%); }
    .template-preview-creative { background: linear-gradient(135deg, #004d40 0%, #00695c 40%, #e0f2f1 40%); }
    .preview-header { height: 40%; background: rgba(255,255,255,0.15); margin: 8px; border-radius: 4px; }
    .preview-lines { padding: 8px; display: flex; flex-direction: column; gap: 5px; }
    .preview-line { height: 5px; border-radius: 3px; background: rgba(0,0,0,0.12); }
    .preview-line.long { width: 90%; }
    .preview-line.medium { width: 65%; }
    .preview-line.short { width: 40%; }
    .resume-stepper ::ng-deep .mat-step-header { padding: 10px 12px; }

    /* ── Tablet (600–959px): stacked, preview below form ── */
    @media (max-width: 959px) {
      :host { height: auto; overflow: visible; }
      .page-layout { flex-direction: column; height: auto; overflow: visible; }
      .form-panel { flex: none; overflow-y: visible; border-right: none; border-bottom: 1px solid #e0e0e0; padding: 16px; }
      .preview-panel { height: 520px; flex-shrink: 0; }
      .preview-scaler {
        transform: scale(0.52);
        margin-bottom: calc((794px * 1.15 * 0.52) - (794px * 1.15));
      }
      .template-grid { grid-template-columns: 1fr 1fr; }
      .tech-skill-row { flex-wrap: wrap; }
      .category-field, .skills-field { flex: 1 1 100%; }
      .mobile-hidden { display: none !important; }
    }

    /* ── Mobile (<600px): tab toggle, single column ── */
    @media (max-width: 599px) {
      :host { height: auto; overflow: visible; }
      .page-layout { flex-direction: column; height: auto; overflow: visible; }

      /* Show the tab bar */
      .mobile-tab-bar {
        display: flex; position: sticky; top: 56px; z-index: 90;
        background: #fff; border-bottom: 2px solid #e0e0e0; flex-shrink: 0;
      }
      .mob-tab {
        flex: 1; padding: 10px 0; border: none; background: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 6px;
        font-size: 0.92rem; font-weight: 500; color: #666;
        transition: color 0.15s;
      }
      .mob-tab mat-icon { font-size: 18px; height: 18px; width: 18px; }
      .mob-tab-active { color: #3f51b5; border-bottom: 3px solid #3f51b5; margin-bottom: -2px; }

      /* Hide inactive panel */
      .mobile-hidden { display: none !important; }

      /* Form panel full width */
      .form-panel { flex: none; overflow-y: visible; border-right: none; padding: 12px 10px 40px; }
      .builder-header h1 { font-size: 1.25rem; }
      .subtitle { font-size: 0.82rem; }
      .header-actions button { font-size: 0.8rem; padding: 0 10px; }
      .form-grid { grid-template-columns: 1fr; }
      .full-width { grid-column: 1; }
      .step-title { font-size: 1rem; }
      .template-grid { grid-template-columns: 1fr; }
      .tech-skill-row { flex-wrap: wrap; }
      .category-field, .skills-field { flex: 1 1 100%; }
      .step-nav { justify-content: space-between; }

      /* Preview panel full width, scaled to fit phone */
      .preview-panel { height: auto; min-height: 460px; }
      .preview-scroll-area { padding: 12px 0; min-height: 440px; }
      .preview-scaler {
        transform: scale(0.40);
        margin-bottom: calc((794px * 1.15 * 0.40) - (794px * 1.15));
      }
      .preview-panel-header { flex-wrap: wrap; gap: 6px; padding: 8px 10px; }
      .template-tabs button { font-size: 0.72rem; padding: 0 7px; }

      /* Stepper label compression */
      .resume-stepper ::ng-deep .mat-step-header { padding: 8px 6px; }
      .resume-stepper ::ng-deep .mat-step-label { display: none; }
    }
  `]
})
export class BuilderComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private resumeService = inject(ResumeService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  readonly liveData = this.resumeService.resumeData;
  private destroy$ = new Subject<void>();

  mobileView: 'form' | 'preview' = 'form';

  personalForm!: FormGroup;
  summaryForm!: FormGroup;
  competenciesControl = this.fb.control('');
  softSkillsControl = this.fb.control('');
  domainControl = this.fb.control('');
  languagesControl = this.fb.control('');
  workForms!: FormArray;
  eduForms!: FormArray;
  techSkillForms!: FormArray;
  projectForms!: FormArray;
  selectedTemplate = 'modern';

  templates = [
    { id: 'modern', name: 'Modern', description: 'Clean, professional layout with a bold header. Based on the classic IT resume format.' },
    { id: 'executive', name: 'Executive', description: 'Dark header with clean typography, ideal for senior roles and leadership positions.' },
    { id: 'creative', name: 'Creative', description: 'Two-column layout with teal accents, perfect for standing out in competitive fields.' }
  ];

  ngOnInit(): void {
    const data = this.resumeService.resumeData();
    this.buildForms(data);
    this.selectedTemplate = data.selectedTemplate || 'modern';
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupAutoSave(): void {
    merge(
      this.personalForm.valueChanges,
      this.summaryForm.valueChanges,
      this.workForms.valueChanges,
      this.eduForms.valueChanges,
      this.techSkillForms.valueChanges,
      this.projectForms.valueChanges,
      this.competenciesControl.valueChanges,
      this.softSkillsControl.valueChanges,
      this.domainControl.valueChanges,
      this.languagesControl.valueChanges
    ).pipe(debounceTime(250), takeUntil(this.destroy$))
     .subscribe(() => this.saveAll());
  }

  private buildForms(data: ResumeData): void {
    const pi = data.personalInfo;
    this.personalForm = this.fb.group({
      fullName: [pi.fullName, Validators.required],
      title: [pi.title],
      email: [pi.email],
      phone: [pi.phone],
      address: [pi.address],
      linkedin: [pi.linkedin],
      github: [pi.github],
      website: [pi.website]
    });

    this.summaryForm = this.fb.group({
      bullets: this.fb.array(data.profileSummary.map(b => this.fb.control(b)))
    });

    this.workForms = this.fb.array(data.workExperience.map(j => this.fb.group({
      id: [j.id],
      company: [j.company],
      position: [j.position],
      startDate: [j.startDate],
      endDate: [j.endDate],
      isCurrent: [j.isCurrent],
      bullets: this.fb.array(j.bullets.map(b => this.fb.control(b)))
    })));

    this.eduForms = this.fb.array(data.education.map(e => this.fb.group({
      id: [e.id],
      degree: [e.degree],
      field: [e.field],
      institution: [e.institution],
      location: [e.location],
      year: [e.year]
    })));

    this.techSkillForms = this.fb.array(data.technicalSkills.map(s => this.fb.group({
      category: [s.category],
      skills: [s.skills]
    })));

    this.projectForms = this.fb.array(data.projects.map(p => this.fb.group({
      id: [p.id],
      title: [p.title],
      role: [p.role],
      duration: [p.duration],
      bullets: this.fb.array(p.bullets.map(b => this.fb.control(b)))
    })));

    this.competenciesControl.setValue(data.coreCompetencies.join('\n'));
    this.softSkillsControl.setValue(data.softSkills.join(', '));
    this.domainControl.setValue(data.domainExposure.join(', '));
    this.languagesControl.setValue(data.languages.join(', '));
  }

  get summaryBullets(): FormArray { return this.summaryForm.get('bullets') as FormArray; }
  addSummaryBullet(): void { this.summaryBullets.push(this.fb.control('')); }
  removeSummaryBullet(i: number): void { this.summaryBullets.removeAt(i); }

  getJobBullets(i: number): FormArray { return (this.workForms.at(i) as FormGroup).get('bullets') as FormArray; }
  addJobBullet(i: number): void { this.getJobBullets(i).push(this.fb.control('')); }
  removeJobBullet(i: number, bi: number): void { this.getJobBullets(i).removeAt(bi); }
  addJob(): void {
    this.workForms.push(this.fb.group({
      id: [Date.now().toString()],
      company: [''], position: [''], startDate: [''], endDate: [''], isCurrent: [false],
      bullets: this.fb.array([this.fb.control('')])
    }));
  }
  removeJob(i: number): void { this.workForms.removeAt(i); }
  getJobTitle(i: number): string {
    const g = this.asGroup(this.workForms.at(i));
    const pos = g.get('position')?.value;
    const co = g.get('company')?.value;
    return pos || co ? `${pos || '?'} @ ${co || '?'}` : `Job ${i + 1}`;
  }

  addEdu(): void {
    this.eduForms.push(this.fb.group({
      id: [Date.now().toString()], degree: [''], field: [''], institution: [''], location: [''], year: ['']
    }));
  }
  removeEdu(i: number): void { this.eduForms.removeAt(i); }
  getEduTitle(i: number): string {
    const g = this.asGroup(this.eduForms.at(i));
    const d = g.get('degree')?.value;
    const inst = g.get('institution')?.value;
    return d || inst ? `${d || '?'} — ${inst || '?'}` : `Education ${i + 1}`;
  }

  addTechSkill(): void { this.techSkillForms.push(this.fb.group({ category: [''], skills: [''] })); }
  removeTechSkill(i: number): void { this.techSkillForms.removeAt(i); }

  getProjBullets(i: number): FormArray { return (this.projectForms.at(i) as FormGroup).get('bullets') as FormArray; }
  addProjBullet(i: number): void { this.getProjBullets(i).push(this.fb.control('')); }
  removeProjBullet(i: number, bi: number): void { this.getProjBullets(i).removeAt(bi); }
  addProject(): void {
    this.projectForms.push(this.fb.group({
      id: [Date.now().toString()], title: [''], role: [''], duration: [''],
      bullets: this.fb.array([this.fb.control('')])
    }));
  }
  removeProject(i: number): void { this.projectForms.removeAt(i); }
  getProjTitle(i: number): string {
    const v = (this.projectForms.at(i) as FormGroup).get('title')?.value;
    return v || `Project ${i + 1}`;
  }

  asGroup(ctrl: any): FormGroup { return ctrl as FormGroup; }
  getCtrl(group: FormGroup, name: string): FormControl { return group.get(name) as FormControl; }
  asFC(ctrl: any): FormControl { return ctrl as FormControl; }

  selectTemplate(id: string): void {
    this.selectedTemplate = id;
    this.saveAll();
  }

  savePersonal(): void { this.saveAll(); }
  saveSummary(): void { this.saveAll(); }
  saveExperience(): void { this.saveAll(); }
  saveEducation(): void { this.saveAll(); }
  saveSkills(): void { this.saveAll(); }
  saveProjects(): void { this.saveAll(); }
  saveAdditional(): void { this.saveAll(); }

  private saveAll(): void {
    const data: ResumeData = {
      personalInfo: this.personalForm.value,
      profileSummary: this.summaryBullets.controls.map(c => c.value).filter(Boolean),
      coreCompetencies: (this.competenciesControl.value || '').split('\n').map((s: string) => s.trim()).filter(Boolean),
      technicalSkills: this.techSkillForms.value,
      softSkills: (this.softSkillsControl.value || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      domainExposure: (this.domainControl.value || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      workExperience: this.workForms.controls.map((ctrl, i) => ({
        ...this.asGroup(ctrl).value,
        bullets: this.getJobBullets(i).controls.map(c => c.value).filter(Boolean)
      })),
      education: this.eduForms.value,
      projects: this.projectForms.controls.map((ctrl, i) => ({
        ...this.asGroup(ctrl).value,
        bullets: this.getProjBullets(i).controls.map(c => c.value).filter(Boolean)
      })),
      languages: (this.languagesControl.value || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      selectedTemplate: this.selectedTemplate
    };
    this.resumeService.update(data);
  }

  goToPreview(): void {
    this.saveAll();
    this.router.navigate(['/preview']);
  }

  resetToDefault(): void {
    this.resumeService.reset();
    const data = this.resumeService.resumeData();
    this.buildForms(data);
    this.selectedTemplate = data.selectedTemplate;
    this.snack.open('Reset to sample data!', 'OK', { duration: 2500 });
  }
}
