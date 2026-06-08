import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeData } from '../../models/resume.model';

@Component({
  selector: 'app-creative-template',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="resume creative-resume">
  <div class="sidebar">
    <!-- NAME / TITLE -->
    <div class="sidebar-header">
      <div class="name-initials">{{ initials }}</div>
      <h1 class="name">{{ data.personalInfo.fullName }}</h1>
      <h2 class="title">{{ data.personalInfo.title }}</h2>
    </div>

    <!-- CONTACT -->
    <div class="sidebar-section">
      <h3 class="sidebar-title">Contact</h3>
      <div *ngIf="data.personalInfo.email" class="sidebar-item">
        <span class="s-icon">✉</span><span>{{ data.personalInfo.email }}</span>
      </div>
      <div *ngIf="data.personalInfo.phone" class="sidebar-item">
        <span class="s-icon">☎</span><span>{{ data.personalInfo.phone }}</span>
      </div>
      <div *ngIf="data.personalInfo.linkedin" class="sidebar-item">
        <span class="s-icon">in</span><span>{{ data.personalInfo.linkedin }}</span>
      </div>
      <div *ngIf="data.personalInfo.address" class="sidebar-item">
        <span class="s-icon">⌖</span><span>{{ data.personalInfo.address }}</span>
      </div>
    </div>

    <!-- CORE COMPETENCIES -->
    <div class="sidebar-section" *ngIf="data.coreCompetencies?.length">
      <h3 class="sidebar-title">Competencies</h3>
      <div *ngFor="let comp of data.coreCompetencies" class="sidebar-item skill-tag">{{ comp }}</div>
    </div>

    <!-- SOFT SKILLS -->
    <div class="sidebar-section" *ngIf="data.softSkills?.length">
      <h3 class="sidebar-title">Soft Skills</h3>
      <div *ngFor="let s of data.softSkills" class="sidebar-item">▸ {{ s }}</div>
    </div>

    <!-- DOMAINS -->
    <div class="sidebar-section" *ngIf="data.domainExposure?.length">
      <h3 class="sidebar-title">Domain Exposure</h3>
      <div *ngFor="let d of data.domainExposure" class="sidebar-item">▸ {{ d }}</div>
    </div>

    <!-- EDUCATION -->
    <div class="sidebar-section" *ngIf="data.education?.length">
      <h3 class="sidebar-title">Education</h3>
      <div *ngFor="let edu of data.education" class="sidebar-edu">
        <strong>{{ edu.degree }}</strong><br/>
        <span>{{ edu.field }}</span><br/>
        <em>{{ edu.institution }}</em><br/>
        <span *ngIf="edu.year">{{ edu.year }}</span>
      </div>
    </div>

    <!-- LANGUAGES -->
    <div class="sidebar-section" *ngIf="data.languages?.length">
      <h3 class="sidebar-title">Languages</h3>
      <div *ngFor="let l of data.languages" class="sidebar-item">{{ l }}</div>
    </div>
  </div>

  <div class="main-content">
    <!-- PROFILE SUMMARY -->
    <section *ngIf="data.profileSummary?.length" class="section">
      <h3 class="section-title">Profile Summary</h3>
      <ul class="bullet-list">
        <li *ngFor="let item of data.profileSummary">{{ item }}</li>
      </ul>
    </section>

    <!-- TECHNICAL SKILLS -->
    <section *ngIf="data.technicalSkills?.length" class="section">
      <h3 class="section-title">Technical Skills</h3>
      <div *ngFor="let skill of data.technicalSkills" class="tech-row">
        <span class="tech-cat">{{ skill.category }}</span>
        <span class="tech-vals">{{ skill.skills }}</span>
      </div>
    </section>

    <!-- WORK EXPERIENCE -->
    <section *ngIf="data.workExperience?.length" class="section">
      <h3 class="section-title">Work Experience</h3>
      <div *ngFor="let job of data.workExperience" class="experience-entry">
        <div class="exp-header">
          <div>
            <span class="exp-role">{{ job.position }}</span>
            <span class="exp-company"> · {{ job.company }}</span>
          </div>
          <span class="exp-date">{{ job.startDate }} – {{ job.isCurrent ? 'Present' : job.endDate }}</span>
        </div>
        <ul class="bullet-list">
          <li *ngFor="let b of job.bullets">{{ b }}</li>
        </ul>
      </div>
    </section>

    <!-- KEY PROJECTS -->
    <section *ngIf="data.projects?.length" class="section">
      <h3 class="section-title">Key Projects</h3>
      <div *ngFor="let proj of data.projects" class="experience-entry">
        <div class="exp-header">
          <div>
            <strong>{{ proj.title }}</strong>
            <span *ngIf="proj.role" class="exp-company"> · {{ proj.role }}</span>
          </div>
          <span *ngIf="proj.duration" class="exp-date">{{ proj.duration }}</span>
        </div>
        <ul class="bullet-list">
          <li *ngFor="let b of proj.bullets">{{ b }}</li>
        </ul>
      </div>
    </section>
  </div>
</div>
  `,
  styles: [`
    .resume { width: 210mm; min-height: 297mm; background: white; display: flex; font-size: 10pt; color: #111; font-family: 'Arial', sans-serif; }
    .sidebar { width: 72mm; background: #004d40; color: white; padding: 20px 16px; flex-shrink: 0; }
    .sidebar-header { margin-bottom: 16px; text-align: center; }
    .name-initials {
      width: 56px; height: 56px; background: rgba(255,255,255,0.2);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 20pt; font-weight: 700; margin: 0 auto 8px; color: white;
    }
    .name { font-size: 14pt; font-weight: 700; margin: 0 0 2px; color: white; line-height: 1.2; }
    .title { font-size: 8.5pt; font-weight: 400; margin: 0; color: #b2dfdb; }
    .sidebar-section { margin-bottom: 12px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; }
    .sidebar-title { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #80cbc4; margin: 0 0 6px; }
    .sidebar-item { font-size: 8.5pt; margin-bottom: 4px; display: flex; align-items: flex-start; gap: 5px; line-height: 1.3; color: #e0f2f1; }
    .s-icon { font-size: 9pt; width: 14px; flex-shrink: 0; }
    .skill-tag { font-size: 8pt; background: rgba(255,255,255,0.1); border-radius: 3px; padding: 1px 6px; display: block; margin-bottom: 3px; }
    .sidebar-edu { font-size: 8.5pt; margin-bottom: 6px; line-height: 1.4; color: #e0f2f1; }
    .main-content { flex: 1; padding: 20px 20px; }
    .section { margin-bottom: 14px; }
    .section-title {
      font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
      color: #004d40; border-bottom: 2px solid #004d40; padding-bottom: 2px; margin: 0 0 8px;
    }
    .bullet-list { margin: 0; padding-left: 16px; }
    .bullet-list li { margin-bottom: 4px; line-height: 1.4; }
    .tech-row { display: flex; gap: 8px; margin-bottom: 3px; }
    .tech-cat { font-weight: 700; color: #004d40; width: 170px; flex-shrink: 0; font-size: 9pt; }
    .tech-vals { font-size: 9pt; }
    .experience-entry { margin-bottom: 10px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .exp-role { font-weight: 700; font-size: 10pt; }
    .exp-company { color: #555; font-style: italic; }
    .exp-date { font-size: 8.5pt; color: #777; white-space: nowrap; margin-left: 4px; }

    @media print {
      .resume { width: 100%; min-height: unset; box-shadow: none; }
      .sidebar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 8mm 0; size: A4; }
    }
  `]
})
export class CreativeTemplateComponent {
  @Input() data!: ResumeData;

  get initials(): string {
    const parts = (this.data?.personalInfo?.fullName || '').trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
