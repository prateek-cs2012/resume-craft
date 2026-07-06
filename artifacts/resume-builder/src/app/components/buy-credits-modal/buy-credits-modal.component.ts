import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';

declare const Razorpay: new (options: Record<string, unknown>) => { open(): void };

const PACKS = [
  { id: 'pack_10', label: '10 Credits', price: '₹49', popular: false },
  { id: 'pack_25', label: '25 Credits', price: '₹99', popular: true },
  { id: 'pack_50', label: '50 Credits', price: '₹179', popular: false },
];

@Component({
  selector: 'app-buy-credits-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
<div class="modal-backdrop" (click)="close.emit()">
  <div class="modal-card" (click)="$event.stopPropagation()">
    <div class="modal-header">
      <mat-icon class="header-icon">auto_awesome</mat-icon>
      <div>
        <h2>Get AI Credits</h2>
        <p>AI rewrites your bullet points to be more impactful and ATS-friendly.</p>
      </div>
      <button mat-icon-button (click)="close.emit()" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <div class="current-credits" *ngIf="userService.profile() as p">
      You currently have <strong>{{ p.aiCredits }} credit{{ p.aiCredits === 1 ? '' : 's' }}</strong> remaining.
    </div>

    <div class="packs-grid">
      <div *ngFor="let pack of packs" class="pack-card" [class.popular]="pack.popular"
           (click)="selectPack(pack.id)" [class.selected]="selectedPack() === pack.id">
        <div class="popular-badge" *ngIf="pack.popular">Most Popular</div>
        <div class="pack-label">{{ pack.label }}</div>
        <div class="pack-price">{{ pack.price }}</div>
      </div>
    </div>

    <div class="error-msg" *ngIf="error()">{{ error() }}</div>

    <div class="modal-actions">
      <button mat-stroked-button (click)="close.emit()">Cancel</button>
      <button mat-raised-button color="primary"
        [disabled]="!selectedPack() || loading()"
        (click)="startCheckout()">
        <mat-spinner *ngIf="loading()" diameter="18" style="margin-right:6px"></mat-spinner>
        <mat-icon *ngIf="!loading()">shopping_cart</mat-icon>
        {{ loading() ? 'Processing…' : 'Buy Credits' }}
      </button>
    </div>
  </div>
</div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; padding: 16px;
    }
    .modal-card {
      background: white; border-radius: 16px; padding: 28px;
      width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .modal-header {
      display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px;
    }
    .header-icon { font-size: 36px; height: 36px; width: 36px; color: #3f51b5; flex-shrink: 0; margin-top: 4px; }
    .modal-header h2 { margin: 0 0 4px; font-size: 1.2rem; }
    .modal-header p { margin: 0; font-size: 0.85rem; color: #555; }
    .close-btn { margin-left: auto; flex-shrink: 0; }
    .current-credits {
      background: #e8eaf6; border-radius: 8px; padding: 8px 14px;
      font-size: 0.9rem; margin-bottom: 16px;
    }
    .packs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
    .pack-card {
      border: 2px solid #e0e0e0; border-radius: 12px; padding: 14px 8px;
      text-align: center; cursor: pointer; position: relative;
      transition: all .15s ease;
    }
    .pack-card:hover { border-color: #3f51b5; }
    .pack-card.selected { border-color: #3f51b5; background: #e8eaf6; }
    .pack-card.popular { border-color: #3f51b5; }
    .popular-badge {
      position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
      background: #3f51b5; color: white; font-size: 10px; padding: 2px 8px;
      border-radius: 8px; white-space: nowrap;
    }
    .pack-label { font-weight: 600; font-size: 0.95rem; color: #1a237e; }
    .pack-price { font-size: 1.1rem; font-weight: 700; margin-top: 4px; }
    .error-msg { color: #c62828; font-size: 0.85rem; margin-bottom: 10px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .modal-actions button { min-width: 110px; }
  `]
})
export class BuyCreditsModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() purchased = new EventEmitter<number>();

  readonly userService = inject(UserService);
  readonly packs = PACKS;
  readonly selectedPack = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  selectPack(id: string): void {
    this.selectedPack.set(id);
    this.error.set(null);
  }

  async startCheckout(): Promise<void> {
    const packId = this.selectedPack();
    if (!packId) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const order = await this.userService.createRazorpayOrder(packId);

      const configRes = await fetch('/api/config');
      const config = (await configRes.json()) as { razorpayKeyId?: string };

      const rzp = new Razorpay({
        key: config.razorpayKeyId ?? '',
        amount: order.amount,
        currency: order.currency,
        name: 'ResumeCraft',
        description: order.pack.label,
        order_id: order.orderId,
        handler: async (response: Record<string, string>) => {
          try {
            const result = await this.userService.verifyPayment({
              razorpay_order_id: order.orderId,
              razorpay_payment_id: response['razorpay_payment_id'],
              razorpay_signature: response['razorpay_signature'],
              packId,
            });
            this.userService.addCredits(result.creditsAdded);
            this.purchased.emit(result.creditsAdded);
            this.close.emit();
          } catch {
            this.error.set('Payment verification failed. Please contact support.');
          }
        },
        prefill: { email: this.userService.profile()?.email ?? '' },
        theme: { color: '#3f51b5' },
      });
      rzp.open();
    } catch {
      this.error.set('Could not start checkout. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
