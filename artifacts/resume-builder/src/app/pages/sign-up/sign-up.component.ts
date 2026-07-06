import { Component, inject, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

interface GoogleAccounts {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
      }): void;
      renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
    };
  };
}

function passwordsMatch(control: AbstractControl): { mismatch: boolean } | null {
  const pw = control.get('password')?.value;
  const confirm = control.get('confirm')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule,
  ],
  template: `
<div class="auth-page">
  <mat-card class="auth-card">
    <mat-card-header>
      <mat-card-title>
        <mat-icon class="auth-icon">person_add</mat-icon>
        Create Account
      </mat-card-title>
      <mat-card-subtitle>Free account · 5 AI credits included</mat-card-subtitle>
    </mat-card-header>

    <mat-card-content>
      <div class="google-btn-wrapper">
        <div #googleBtn class="google-btn-container"></div>
      </div>

      <div class="divider-row" [class.hidden]="!googleClientId">
        <mat-divider></mat-divider>
        <span class="divider-label">or</span>
        <mat-divider></mat-divider>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
          <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">Enter a valid email</mat-error>
        </mat-form-field>

        <ng-container formGroupName="passwords">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" autocomplete="new-password" />
            <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-hint>At least 6 characters</mat-hint>
            <mat-error *ngIf="form.get('passwords.password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="form.get('passwords.password')?.hasError('minlength')">At least 6 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirm Password</mat-label>
            <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="confirm" autocomplete="new-password" />
            <mat-error *ngIf="form.get('passwords.confirm')?.hasError('required')">Please confirm your password</mat-error>
            <mat-error *ngIf="form.get('passwords')?.hasError('mismatch')">Passwords do not match</mat-error>
          </mat-form-field>
        </ng-container>

        <div *ngIf="error" class="error-msg">{{ error }}</div>

        <button mat-raised-button color="primary" type="submit" class="submit-btn" [disabled]="loading">
          <mat-spinner *ngIf="loading" diameter="18" class="inline-spinner"></mat-spinner>
          <span *ngIf="!loading">Create Account</span>
        </button>
      </form>
    </mat-card-content>

    <mat-card-actions>
      <p class="switch-link">
        Already have an account? <a routerLink="/sign-in">Sign in</a>
      </p>
    </mat-card-actions>
  </mat-card>
</div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: #f5f5f5; padding: 24px 16px;
    }
    .auth-card { width: 100%; max-width: 420px; padding: 8px 8px 16px; }
    mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 1.4rem; }
    .auth-icon { font-size: 28px; width: 28px; height: 28px; color: #3f51b5; }
    .auth-form { display: flex; flex-direction: column; gap: 4px; margin-top: 16px; }
    .full-width { width: 100%; }
    .google-btn-wrapper { margin-top: 16px; display: flex; justify-content: center; min-height: 0; }
    .google-btn-container { width: 100%; }
    .google-btn-container:empty { display: none; }
    .divider-row {
      display: flex; align-items: center; gap: 8px;
      margin: 16px 0 4px; color: #999; font-size: 13px;
    }
    .divider-row mat-divider { flex: 1; }
    .divider-row.hidden { display: none; }
    .error-msg {
      color: #f44336; font-size: 13px; background: #fff3f3;
      border: 1px solid #f44336; border-radius: 4px; padding: 8px 12px;
    }
    .submit-btn { width: 100%; height: 44px; margin-top: 4px; }
    .inline-spinner { display: inline-block; }
    .switch-link { text-align: center; font-size: 14px; color: #666; margin: 0; }
    .switch-link a { color: #3f51b5; text-decoration: none; font-weight: 500; }
  `]
})
export class SignUpComponent implements AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    passwords: this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required],
    }, { validators: passwordsMatch }),
  });

  loading = false;
  error = '';
  showPassword = false;
  googleClientId = '';

  async ngAfterViewInit(): Promise<void> {
    try {
      const res = await fetch('/api/config');
      const config = (await res.json()) as { googleClientId?: string };
      this.googleClientId = config.googleClientId ?? '';
      if (!this.googleClientId) return;

      await this.waitForGoogle();
      const goog = (window as unknown as { google?: GoogleAccounts }).google;
      if (!goog) return;

      goog.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (resp) => {
          this.ngZone.run(() => this.handleGoogleCredential(resp.credential));
        },
      });
      goog.accounts.id.renderButton(this.googleBtnRef.nativeElement, {
        theme: 'outline', size: 'large', width: 356, text: 'continue_with',
        logo_alignment: 'left',
      });
    } catch { /* silently ignore config errors */ }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const password = this.form.value.passwords!.password!;
      await this.auth.register(this.form.value.email!, password);
      await this.userService.loadProfile();
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Registration failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private async handleGoogleCredential(credential: string): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      await this.auth.googleSignIn(credential);
      await this.userService.loadProfile();
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private waitForGoogle(): Promise<void> {
    return new Promise(resolve => {
      if ((window as unknown as { google?: unknown }).google) { resolve(); return; }
      const iv = setInterval(() => {
        if ((window as unknown as { google?: unknown }).google) { clearInterval(iv); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(iv); resolve(); }, 5000);
    });
  }
}
