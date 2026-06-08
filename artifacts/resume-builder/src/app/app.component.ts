import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <mat-toolbar color="primary" class="app-toolbar no-print">
      <mat-icon>description</mat-icon>
      <span class="toolbar-title" routerLink="/" style="cursor:pointer;margin-left:6px;">ResumeCraft</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">
        <mat-icon>home</mat-icon><span class="btn-label"> Home</span>
      </button>
      <button mat-button routerLink="/upload" routerLinkActive="active-link">
        <mat-icon>upload_file</mat-icon><span class="btn-label"> Upload</span>
      </button>
      <button mat-button routerLink="/builder" routerLinkActive="active-link">
        <mat-icon>edit</mat-icon><span class="btn-label"> Builder</span>
      </button>
      <button mat-button routerLink="/preview" routerLinkActive="active-link">
        <mat-icon>visibility</mat-icon><span class="btn-label"> Preview</span>
      </button>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .app-toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-title { font-size: 1.15rem; font-weight: 500; white-space: nowrap; }
    .spacer { flex: 1; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
    mat-icon { vertical-align: middle; }
    @media (max-width: 480px) {
      .toolbar-title { font-size: 0.95rem; }
      .btn-label { display: none; }
    }
  `]
})
export class AppComponent {}
