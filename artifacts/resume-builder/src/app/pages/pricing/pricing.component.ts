import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

declare const Razorpay: new (options: Record<string, unknown>) => { open(): void };

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
<div class="pricing-page">

  <!-- Already premium -->
  <ng-container *ngIf="userService.isPremium">
    <div class="hero">
      <div class="premium-badge"><mat-icon>workspace_premium</mat-icon> Premium Member</div>
      <h1>You're all set!</h1>
      <p class="hero-sub">You have full access to every ResumeCraft feature.</p>
      <button mat-raised-button color="primary" routerLink="/dashboard">
        <mat-icon>dashboard</mat-icon> Go to Dashboard
      </button>
    </div>
  </ng-container>

  <!-- Pricing cards -->
  <ng-container *ngIf="!userService.isPremium">
    <div class="hero">
      <h1>Simple, honest pricing</h1>
      <p class="hero-sub">One-time payment. Lifetime access. No subscriptions.</p>
    </div>

    <div class="cards-row">

      <!-- Free card -->
      <mat-card class="plan-card free-card">
        <mat-card-content>
          <div class="plan-header">
            <div class="plan-icon free-icon"><mat-icon>person</mat-icon></div>
            <h2>Free</h2>
            <div class="plan-price">₹0 <span class="plan-period">forever</span></div>
          </div>
          <ul class="feature-list">
            <li><mat-icon class="check">check_circle</mat-icon> Step-by-step resume builder</li>
            <li><mat-icon class="check">check_circle</mat-icon> Modern template</li>
            <li><mat-icon class="check">check_circle</mat-icon> Download / Print PDF (sign-in required)</li>
            <li class="locked"><mat-icon class="lock">lock</mat-icon> Upload existing resume</li>
            <li class="locked"><mat-icon class="lock">lock</mat-icon> AI content enhancement</li>
            <li class="locked"><mat-icon class="lock">lock</mat-icon> Executive &amp; Creative templates</li>
          </ul>
          <button mat-stroked-button class="plan-btn" routerLink="/builder">
            Use for free
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Premium card -->
      <mat-card class="plan-card premium-card">
        <div class="popular-banner">Most Popular</div>
        <mat-card-content>
          <div class="plan-header">
            <div class="plan-icon premium-icon"><mat-icon>workspace_premium</mat-icon></div>
            <h2>Premium</h2>
            <div class="plan-price">₹499 <span class="plan-period">one-time</span></div>
            <div class="plan-note">Lifetime access — pay once, use forever</div>
          </div>
          <ul class="feature-list">
            <li><mat-icon class="check">check_circle</mat-icon> Everything in Free</li>
            <li><mat-icon class="check">check_circle</mat-icon> Upload PDF / DOCX (AI auto-fill)</li>
            <li><mat-icon class="check">check_circle</mat-icon> AI content enhancement (unlimited)</li>
            <li><mat-icon class="check">check_circle</mat-icon> Executive template</li>
            <li><mat-icon class="check">check_circle</mat-icon> Creative template</li>
            <li><mat-icon class="check">check_circle</mat-icon> Priority support</li>
          </ul>

          <div class="error-msg" *ngIf="error()">{{ error() }}</div>

          <button mat-raised-button color="primary" class="plan-btn upgrade-btn"
            [disabled]="loading()"
            (click)="upgrade()">
            <mat-spinner *ngIf="loading()" diameter="18" style="margin-right:8px"></mat-spinner>
            <mat-icon *ngIf="!loading()">bolt</mat-icon>
            {{ loading() ? 'Opening checkout…' : 'Upgrade Now — ₹499' }}
          </button>

          <p class="secure-note">
            <mat-icon style="font-size:14px;height:14px;width:14px;vertical-align:middle;">lock</mat-icon>
            Secured by Razorpay · UPI, cards, net banking accepted
          </p>
        </mat-card-content>
      </mat-card>

    </div>

    <!-- Sign-in prompt if not authenticated -->
    <div class="signin-note" *ngIf="!auth.isSignedIn()">
      <mat-icon>info</mat-icon>
      You'll be asked to sign in before checkout.
      <a routerLink="/sign-in">Sign in now</a> to speed things up.
    </div>
  </ng-container>

</div>
  `,
  styles: [`
    .pricing-page {
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, #e8eaf6 0%, #f5f5f5 100%);
      display: flex; flex-direction: column; align-items: center;
      padding: 64px 24px 80px;
    }

    .hero { text-align: center; margin-bottom: 48px; }
    .hero h1 { font-size: 2.4rem; font-weight: 800; color: #1a237e; margin: 0 0 12px; }
    .hero-sub { font-size: 1.1rem; color: #555; margin: 0 0 24px; }

    .premium-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white; border-radius: 20px; padding: 6px 18px;
      font-size: 0.9rem; font-weight: 700; margin-bottom: 16px;
    }
    .premium-badge mat-icon { font-size: 18px; height: 18px; width: 18px; }

    .cards-row {
      display: flex; gap: 24px; align-items: stretch;
      width: 100%; max-width: 760px; flex-wrap: wrap;
    }

    .plan-card {
      flex: 1; min-width: 280px; border-radius: 20px !important;
      position: relative; overflow: hidden;
    }
    .plan-card mat-card-content { padding: 32px 28px !important; }

    .free-card { background: white; }
    .premium-card {
      background: linear-gradient(160deg, #1a237e 0%, #283593 60%, #3949ab 100%);
      color: white;
      box-shadow: 0 16px 48px rgba(26,35,126,0.35) !important;
    }

    .popular-banner {
      position: absolute; top: 16px; right: -28px;
      background: #f59e0b; color: white;
      font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
      padding: 4px 40px; transform: rotate(35deg);
    }

    .plan-header { text-align: center; margin-bottom: 28px; }
    .plan-icon {
      width: 60px; height: 60px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
    }
    .free-icon { background: #e8eaf6; }
    .free-icon mat-icon { color: #3f51b5; font-size: 30px; height: 30px; width: 30px; }
    .premium-icon { background: rgba(255,255,255,0.15); }
    .premium-icon mat-icon { color: #fbbf24; font-size: 30px; height: 30px; width: 30px; }

    .plan-card h2 { font-size: 1.4rem; font-weight: 700; margin: 0 0 8px; }
    .plan-price { font-size: 2rem; font-weight: 800; }
    .plan-period { font-size: 0.85rem; font-weight: 400; opacity: 0.7; }
    .plan-note { font-size: 0.78rem; opacity: 0.65; margin-top: 4px; }

    .feature-list {
      list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 10px;
    }
    .feature-list li {
      display: flex; align-items: center; gap: 10px;
      font-size: 0.9rem;
    }
    .feature-list .check { color: #4caf50; font-size: 18px; height: 18px; width: 18px; flex-shrink: 0; }
    .premium-card .check { color: #86efac; }
    .feature-list .lock { color: #bdbdbd; font-size: 18px; height: 18px; width: 18px; flex-shrink: 0; }
    .feature-list .locked { opacity: 0.5; }

    .plan-btn { width: 100%; height: 48px; font-size: 0.95rem; font-weight: 600; border-radius: 12px !important; }
    .upgrade-btn {
      background: white !important; color: #1a237e !important;
      font-size: 1rem; height: 52px;
    }
    .upgrade-btn mat-icon { margin-right: 6px; }

    .secure-note {
      text-align: center; font-size: 0.75rem; opacity: 0.6; margin: 12px 0 0;
    }

    .error-msg {
      background: rgba(239,68,68,0.15); color: #fca5a5;
      border-radius: 8px; padding: 8px 12px;
      font-size: 0.85rem; margin-bottom: 12px;
    }

    .signin-note {
      display: flex; align-items: center; gap: 8px;
      margin-top: 28px; font-size: 0.9rem; color: #555;
    }
    .signin-note mat-icon { color: #3f51b5; font-size: 18px; height: 18px; width: 18px; }
    .signin-note a { color: #3f51b5; font-weight: 600; }

    @media (max-width: 640px) {
      .hero h1 { font-size: 1.8rem; }
      .cards-row { flex-direction: column; }
      .pricing-page { padding: 40px 16px 60px; }
    }
  `]
})
export class PricingComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly userService = inject(UserService);
  private router = inject(Router);
  private title = inject(Title);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.title.setTitle('Pricing | ResumeCraft');
    if (this.auth.isSignedIn() && !this.userService.profile()) {
      void this.userService.loadProfile();
    }
  }

  async upgrade(): Promise<void> {
    if (!this.auth.isSignedIn()) {
      void this.router.navigate(['/sign-in']);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const order = await this.userService.createPremiumOrder();

      const configRes = await fetch('/api/config');
      const config = (await configRes.json()) as { razorpayKeyId?: string };

      const rzp = new Razorpay({
        key: config.razorpayKeyId ?? '',
        amount: order.amount,
        currency: order.currency,
        name: 'ResumeCraft',
        description: order.label,
        order_id: order.orderId,
        handler: async (response: Record<string, string>) => {
          try {
            await this.userService.verifyPremiumPayment({
              razorpay_order_id: order.orderId,
              razorpay_payment_id: response['razorpay_payment_id'],
              razorpay_signature: response['razorpay_signature'],
            });
            void this.router.navigate(['/dashboard']);
          } catch {
            this.error.set('Payment verification failed. Please contact support.');
          }
        },
        prefill: { email: this.userService.profile()?.email ?? '' },
        theme: { color: '#3f51b5' },
      });
      rzp.open();
    } catch (e) {
      this.error.set((e as Error).message || 'Could not start checkout. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
