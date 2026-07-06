import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';

export type UserTier = 'free' | 'premium';

export interface UserProfile {
  id: number;
  email: string;
  tier: UserTier;
  aiCredits: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private authService = inject(AuthService);
  private readonly apiBase = '/api';

  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(false);

  async loadProfile(): Promise<void> {
    if (!this.authService.isSignedIn()) return;
    this.loading.set(true);
    try {
      const res = await fetch(`${this.apiBase}/user/me`, {
        headers: this.authService.getAuthHeaders(),
      });
      if (res.ok) {
        const data = (await res.json()) as UserProfile;
        this.profile.set(data);
      }
    } finally {
      this.loading.set(false);
    }
  }

  clearProfile(): void {
    this.profile.set(null);
  }

  get isFree(): boolean {
    const p = this.profile();
    return !p || p.tier === 'free';
  }

  get isPremium(): boolean {
    return this.profile()?.tier === 'premium';
  }

  get aiCredits(): number {
    return this.profile()?.aiCredits ?? 0;
  }

  decrementCredits(): void {
    const p = this.profile();
    if (p) this.profile.set({ ...p, aiCredits: Math.max(0, p.aiCredits - 1) });
  }

  addCredits(n: number): void {
    const p = this.profile();
    if (p) this.profile.set({ ...p, aiCredits: p.aiCredits + n });
  }

  async createRazorpayOrder(packId: string): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    pack: { credits: number; label: string };
  }> {
    const res = await fetch(`${this.apiBase}/checkout/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authService.getAuthHeaders() },
      body: JSON.stringify({ packId }),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  }

  async verifyPayment(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    packId: string;
  }): Promise<{ creditsAdded: number; newCredits: number }> {
    const res = await fetch(`${this.apiBase}/checkout/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authService.getAuthHeaders() },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Payment verification failed');
    return res.json();
  }

  async createPremiumOrder(): Promise<{ orderId: string; amount: number; currency: string; label: string }> {
    const res = await fetch(`${this.apiBase}/checkout/create-premium-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authService.getAuthHeaders() },
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      throw new Error(err.error ?? 'Failed to create order');
    }
    return res.json();
  }

  async verifyPremiumPayment(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<void> {
    const res = await fetch(`${this.apiBase}/checkout/verify-premium`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authService.getAuthHeaders() },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Payment verification failed');
    await this.loadProfile();
  }
}
