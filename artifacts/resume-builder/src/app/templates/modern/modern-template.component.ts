import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeData } from '../../models/resume.model';

@Component({
  selector: 'app-modern-template',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="resume modern-resume">

  <!-- HEADER -->
  <header class="resume-header">
    <div class="header-left">
      <h1 class="name">{{ data.personalInfo.fullName }}</h1>
      <h2 class="title">{{ data.personalInfo.title }}</h2>
    </div>
    <div class="header-right">
      <div class="contact-item" *ngIf="data.personalInfo.email">
        <span class="contact-icon">✉</span> {{ data.personalInfo.email }}
      </div>
      <div class="contact-item" *ngIf="data.personalInfo.phone">
        <span class="contact-icon">☎</span> {{ data.personalInfo.phone }}
      </div>
      <div class="contact-item" *ngIf="data.personalInfo.linkedin">
        <span class="contact-icon">in</span> {{ data.personalInfo.linkedin }}
      </div>
      <div class="contact-item" *ngIf="data.personalInfo.address">
        <span class="contact-icon">⌖</span> {{ data.personalInfo.address }}
      </div>
    </div>
  </header>

  <div class="resume-body">

    <!-- PROFILE SUMMARY -->
    <section *ngIf="data.profileSummary?.length" class="section">
      <h3 class="section-title">PROFILE SUMMARY</h3>
      <ul class="bullet-list">
        <li *ngFor="let item of data.profileSummary">{{ item }}</li>
      </ul>
    </section>

    <!-- CORE COMPETENCIES -->
    <section *ngIf="data.coreCompetencies?.length" class="section">
      <h3 class="section-title">CORE COMPETENCIES</h3>
      <div class="competencies-grid">
        <div *ngFor="let comp of data.coreCompetencies" class="competency-item">{{ comp }}</div>
      </div>
    </section>

    <!-- TECHNICAL SKILLS -->
    <section *ngIf="data.technicalSkills?.length" class="section">
      <h3 class="section-title">TECHNICAL SKILLS</h3>
      <table class="skills-table">
        <tr *ngFor="let skill of data.technicalSkills">
          <td class="skill-category">{{ skill.category }}</td>
          <td class="skill-values">{{ skill.skills }}</td>
        </tr>
      </table>
    </section>

    <!-- SOFT SKILLS + DOMAIN -->
    <div class="two-col-section" *ngIf="data.softSkills?.length || data.domainExposure?.length">
      <div *ngIf="data.softSkills?.length">
        <h3 class="section-title">SOFT SKILLS</h3>
        <ul class="simple-list">
          <li *ngFor="let s of data.softSkills">{{ s }}</li>
        </ul>
      </div>
      <div *ngIf="data.domainExposure?.length">
        <h3 class="section-title">DOMAIN EXPOSURE</h3>
        <ul class="simple-list">
          <li *ngFor="let d of data.domainExposure">{{ d }}</li>
        </ul>
      </div>
    </div>

    <!-- WORK EXPERIENCE -->
    <section *ngIf="data.workExperience?.length" class="section">
      <h3 class="section-title">WORK EXPERIENCE</h3>
      <div *ngFor="let job of sortedWorkExperience" class="experience-entry">
        <div class="exp-header">
          <div class="exp-left">
            <span class="exp-date">{{ job.startDate }} – {{ job.isCurrent ? 'Present' : job.endDate }}</span>
            <span class="exp-sep">|</span>
            <span class="exp-role">{{ job.position }}</span>
            <span class="exp-sep">|</span>
            <span class="exp-company">{{ job.company }}</span>
          </div>
        </div>
        <ul class="bullet-list">
          <li *ngFor="let b of job.bullets">{{ b }}</li>
        </ul>
      </div>
    </section>

    <!-- KEY PROJECTS -->
    <section *ngIf="data.projects?.length" class="section">
      <h3 class="section-title">KEY PROJECTS</h3>
      <div *ngFor="let proj of data.projects" class="experience-entry">
        <div class="exp-header">
          <strong class="proj-title">{{ proj.title }}</strong>
          <span class="proj-meta" *ngIf="proj.role || proj.duration">
            | {{ proj.role }}<span *ngIf="proj.duration"> | {{ proj.duration }}</span>
          </span>
        </div>
        <ul class="bullet-list">
          <li *ngFor="let b of proj.bullets">{{ b }}</li>
        </ul>
      </div>
    </section>

    <!-- EDUCATION -->
    <section *ngIf="data.education?.length" class="section">
      <h3 class="section-title">EDUCATION</h3>
      <div *ngFor="let edu of data.education" class="edu-entry">
        <strong>{{ edu.degree }} in {{ edu.field }}</strong><br />
        {{ edu.institution }}<span *ngIf="edu.location">, {{ edu.location }}</span>
        <span *ngIf="edu.year"> – {{ edu.year }}</span>
      </div>
    </section>

    <!-- PERSONAL DETAILS -->
    <section class="section" *ngIf="data.languages?.length || data.personalInfo.address">
      <h3 class="section-title">PERSONAL DETAILS</h3>
      <div class="personal-grid">
        <div *ngIf="data.languages?.length">
          <strong>Languages Known:</strong> {{ data.languages.join(', ') }}
        </div>
        <div *ngIf="data.personalInfo.address">
          <strong>Address:</strong> {{ data.personalInfo.address }}
        </div>
      </div>
    </section>

  </div>
</div>
  `,
  styles: [`
    .resume { width: 210mm; min-height: 297mm; background: white; font-family: 'Times New Roman', Times, serif; font-size: 10pt; color: #111; }
    .resume-header { background: #1a237e; color: white; padding: 20px 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-left .name { font-size: 22pt; font-weight: 700; margin: 0 0 4px; letter-spacing: 1px; }
    .header-left .title { font-size: 12pt; font-weight: 400; margin: 0; opacity: 0.9; }
    .header-right { text-align: right; font-size: 9pt; display: flex; flex-direction: column; gap: 3px; }
    .contact-item { display: flex; align-items: center; justify-content: flex-end; gap: 5px; }
    .contact-icon { font-weight: 700; font-size: 10pt; width: 14px; text-align: center; }
    .resume-body { padding: 16px 24px; }
    .section { margin-bottom: 14px; }
    .section-title {
      font-size: 10pt; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
      color: #1a237e; border-bottom: 1.5px solid #1a237e;
      padding-bottom: 2px; margin: 0 0 8px;
    }
    .bullet-list { margin: 0; padding-left: 18px; }
    .bullet-list li { margin-bottom: 4px; line-height: 1.4; }
    .competencies-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px 16px; }
    .competency-item::before { content: '• '; color: #1a237e; font-weight: 700; }
    .skills-table { width: 100%; border-collapse: collapse; }
    .skills-table tr { border-bottom: 0.5px solid #e8eaf6; }
    .skill-category { font-weight: 700; width: 220px; padding: 2px 8px 2px 0; color: #1a237e; vertical-align: top; }
    .skill-values { padding: 2px 0; }
    .two-col-section { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
    .simple-list { margin: 0; padding-left: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 4px 16px; }
    .simple-list li::before { content: '○ '; color: #1a237e; }
    .experience-entry { margin-bottom: 10px; }
    .exp-header { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; font-size: 9.5pt; }
    .exp-date { color: #555; }
    .exp-sep { color: #999; }
    .exp-role { font-weight: 700; }
    .exp-company { font-style: italic; }
    .proj-title { font-size: 10pt; }
    .proj-meta { color: #555; font-size: 9pt; }
    .edu-entry { margin-bottom: 6px; line-height: 1.5; }
    .personal-grid { display: flex; flex-direction: column; gap: 4px; }

    @media print {
      .resume { width: 100%; min-height: unset; box-shadow: none; }
      @page { margin: 10mm 12mm; size: A4; }
    }
  `]
})
export class ModernTemplateComponent {
  @Input() data!: ResumeData;

  get sortedWorkExperience() {
    return [...(this.data?.workExperience ?? [])].sort((a, b) => {
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
      return new Date('1 ' + b.startDate).getTime() - new Date('1 ' + a.startDate).getTime();
    });
  }
}
