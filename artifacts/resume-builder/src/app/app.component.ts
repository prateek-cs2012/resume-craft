import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, CommonModule,
    MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule,
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar no-print">
      <mat-icon>description</mat-icon>
      <span class="toolbar-title" routerLink="/" style="cursor:pointer;margin-left:6px;">ResumeCraft</span>
      <span class="spacer"></span>

      <button mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">
        <mat-icon>home</mat-icon><span class="btn-label"> Home</span>
      </button>
      <button mat-button routerLink="/builder" routerLinkActive="active-link">
        <mat-icon>edit</mat-icon><span class="btn-label"> Builder</span>
      </button>
      <button mat-button routerLink="/preview" routerLinkActive="active-link">
        <mat-icon>visibility</mat-icon><span class="btn-label"> Preview</span>
      </button>

      <!-- Signed-in user menu -->
      <ng-container *ngIf="auth.isSignedIn()">
        <!-- Upload — premium only -->
        <button mat-button routerLink="/upload" routerLinkActive="active-link"
          *ngIf="userService.isPremium"
          matTooltip="Upload existing resume">
          <mat-icon>upload_file</mat-icon><span class="btn-label"> Upload</span>
        </button>

        <button mat-button routerLink="/dashboard" routerLinkActive="active-link">
          <mat-icon>dashboard</mat-icon><span class="btn-label"> Dashboard</span>
        </button>

        <!-- Upgrade CTA for free users -->
        <button mat-button routerLink="/pricing" routerLinkActive="active-link"
          *ngIf="!userService.isPremium" class="upgrade-btn">
          <mat-icon>bolt</mat-icon><span class="btn-label"> Upgrade</span>
        </button>

        <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
          <mat-icon>account_circle</mat-icon>
          <span class="btn-label"> {{ auth.getDisplayName() }}</span>
          <span *ngIf="userService.isPremium" class="tier-chip premium-chip">Premium</span>
          <span *ngIf="!userService.isPremium" class="tier-chip free-chip">Free</span>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>My Dashboard</span>
          </button>
          <button mat-menu-item routerLink="/pricing" *ngIf="!userService.isPremium">
            <mat-icon>workspace_premium</mat-icon>
            <span>Upgrade to Premium</span>
          </button>
          <button mat-menu-item disabled class="menu-tier">
            <mat-icon>{{ userService.isPremium ? 'workspace_premium' : 'person' }}</mat-icon>
            <span>{{ userService.isPremium ? 'Premium Member' : 'Free Plan' }}</span>
          </button>
          <button mat-menu-item (click)="signOut()">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      </ng-container>

      <!-- Signed-out -->
      <ng-container *ngIf="!auth.isSignedIn()">
        <button mat-button routerLink="/pricing" routerLinkActive="active-link">
          <mat-icon>sell</mat-icon><span class="btn-label"> Pricing</span>
        </button>
        <button mat-stroked-button class="sign-in-btn" routerLink="/sign-in">
          <mat-icon>login</mat-icon><span class="btn-label"> Sign In</span>
        </button>
      </ng-container>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .app-toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-title { font-size: 1.15rem; font-weight: 500; white-space: nowrap; }
    .spacer { flex: 1; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
    mat-icon { vertical-align: middle; }
    .user-btn { display: flex; align-items: center; gap: 4px; }
    .tier-chip {
      border-radius: 12px; padding: 1px 7px; font-size: 11px; font-weight: 700; margin-left: 4px;
    }
    .premium-chip { background: rgba(251,191,36,0.25); color: #fbbf24; }
    .free-chip { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); }
    .upgrade-btn { color: #fbbf24 !important; }
    .sign-in-btn {
      border-color: rgba(255,255,255,0.6);
      color: white;
      margin-left: 4px;
    }
    .menu-tier { opacity: 1 !important; font-weight: 500; }
    @media (max-width: 480px) {
      .toolbar-title { font-size: 0.95rem; }
      .btn-label { display: none; }
    }
  `]
})
export class AppComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly userService = inject(UserService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isSignedIn() && !this.userService.profile()) {
      void this.userService.loadProfile();
    }
  }

  signOut(): void {
    this.auth.logout();
    this.userService.clearProfile();
    void this.router.navigate(['/']);
  }
}
