import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeData } from '../../models/resume.model';

@Component({
  selector: 'app-executive-template',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="resume executive-resume">
  <!-- HEADER -->
  <header class="exec-header">
    <h1 class="name">{{ data.personalInfo.fullName }}</h1>
    <h2 class="title">{{ data.personalInfo.title }}</h2>
    <div class="contact-bar">
      <span *ngIf="data.personalInfo.email">{{ data.personalInfo.email }}</span>
      <span *ngIf="data.personalInfo.phone">{{ data.personalInfo.phone }}</span>
      <span *ngIf="data.personalInfo.linkedin">{{ data.personalInfo.linkedin }}</span>
      <span *ngIf="data.personalInfo.address">{{ data.personalInfo.address }}</span>
    </div>
  </header>

  <div class="resume-body">
    <!-- PROFILE SUMMARY -->
    <section *ngIf="data.profileSummary?.length" class="section">
      <h3 class="section-title">Professional Summary</h3>
      <ul class="bullet-list">
        <li *ngFor="let item of data.profileSummary">{{ item }}</li>
      </ul>
    </section>

    <!-- CORE COMPETENCIES -->
    <section *ngIf="data.coreCompetencies?.length" class="section">
      <h3 class="section-title">Core Competencies</h3>
      <div class="comp-pills">
        <span *ngFor="let comp of data.coreCompetencies" class="pill">{{ comp }}</span>
      </div>
    </section>

    <!-- WORK EXPERIENCE -->
    <section *ngIf="data.workExperience?.length" class="section">
      <h3 class="section-title">Professional Experience</h3>
      <div *ngFor="let job of sortedWorkExperience" class="experience-entry">
        <div class="exp-header-exec">
          <div>
            <span class="exp-role">{{ job.position }}</span>
            <span class="exp-company"> — {{ job.company }}</span>
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
        <div class="exp-header-exec">
          <div><strong>{{ proj.title }}</strong><span *ngIf="proj.role" class="exp-company"> — {{ proj.role }}</span></div>
          <span class="exp-date" *ngIf="proj.duration">{{ proj.duration }}</span>
        </div>
        <ul class="bullet-list">
          <li *ngFor="let b of proj.bullets">{{ b }}</li>
        </ul>
      </div>
    </section>

    <!-- TECHNICAL SKILLS -->
    <section *ngIf="data.technicalSkills?.length" class="section">
      <h3 class="section-title">Technical Expertise</h3>
      <table class="skills-table">
        <tr *ngFor="let skill of data.technicalSkills">
          <td class="skill-category">{{ skill.category }}</td>
          <td>{{ skill.skills }}</td>
        </tr>
      </table>
    </section>

    <!-- EDUCATION + DOMAINS in two columns -->
    <div class="bottom-grid">
      <section *ngIf="data.education?.length" class="section">
        <h3 class="section-title">Education</h3>
        <div *ngFor="let edu of data.education" class="edu-entry">
          <strong>{{ edu.degree }}</strong><br/>
          {{ edu.field }}<br/>
          {{ edu.institution }}<span *ngIf="edu.location">, {{ edu.location }}</span><span *ngIf="edu.year"> ({{ edu.year }})</span>
        </div>
      </section>
      <div>
        <section *ngIf="data.domainExposure?.length" class="section">
          <h3 class="section-title">Domain Exposure</h3>
          <ul class="simple-list">
            <li *ngFor="let d of data.domainExposure">{{ d }}</li>
          </ul>
        </section>
        <section *ngIf="data.languages?.length" class="section">
          <h3 class="section-title">Languages</h3>
          <p>{{ data.languages.join(', ') }}</p>
        </section>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .resume { width: 210mm; min-height: 297mm; background: white; font-family: 'Georgia', serif; font-size: 10pt; color: #111; }
    .exec-header { background: #212121; color: white; padding: 24px 28px; text-align: center; }
    .name { font-size: 26pt; font-weight: 700; margin: 0 0 4px; letter-spacing: 2px; text-transform: uppercase; }
    .title { font-size: 11pt; font-weight: 300; margin: 0 0 12px; letter-spacing: 2px; color: #bdbdbd; text-transform: uppercase; }
    .contact-bar { display: flex; justify-content: center; gap: 20px; font-size: 8.5pt; color: #bdbdbd; flex-wrap: wrap; }
    .resume-body { padding: 18px 28px; }
    .section { margin-bottom: 14px; }
    .section-title {
      font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
      color: #212121; border-bottom: 2px solid #212121; padding-bottom: 3px; margin: 0 0 8px;
    }
    .bullet-list { margin: 0; padding-left: 16px; }
    .bullet-list li { margin-bottom: 4px; line-height: 1.45; }
    .comp-pills { display: flex; flex-wrap: wrap; gap: 5px; }
    .pill { background: #f5f5f5; border: 1px solid #ccc; padding: 2px 10px; border-radius: 12px; font-size: 8.5pt; }
    .skills-table { width: 100%; border-collapse: collapse; }
    .skills-table tr { border-bottom: 0.5px solid #ececec; }
    .skill-category { font-weight: 700; width: 220px; padding: 2px 8px 2px 0; vertical-align: top; }
    .exp-header-exec { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .exp-role { font-weight: 700; font-size: 10.5pt; }
    .exp-company { font-style: italic; color: #555; }
    .exp-date { font-size: 9pt; color: #777; white-space: nowrap; margin-left: 8px; }
    .experience-entry { margin-bottom: 12px; }
    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .edu-entry { margin-bottom: 8px; line-height: 1.5; }
    .simple-list { margin: 0; padding-left: 0; list-style: none; }
    .simple-list li::before { content: '▸ '; color: #212121; }

    @media print {
      .resume { width: 100%; min-height: unset; box-shadow: none; }
      @page { margin: 10mm 12mm; size: A4; }
    }
  `]
})
export class ExecutiveTemplateComponent {
  @Input() data!: ResumeData;

  get sortedWorkExperience() {
    return [...(this.data?.workExperience ?? [])].sort((a, b) => {
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
      return new Date('1 ' + b.startDate).getTime() - new Date('1 ' + a.startDate).getTime();
    });
  }
}
