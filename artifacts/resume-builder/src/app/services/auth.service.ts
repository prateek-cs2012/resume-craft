import { Injectable, signal } from '@angular/core';

export interface AuthUser {
  id: number;
  email: string;
}

export interface UserProfile {
  id: number;
  email: string;
  tier: 'free' | 'premium';
  aiCredits: number;
}

const TOKEN_KEY = 'rc_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isSignedIn = signal(false);
  readonly user = signal<AuthUser | null>(null);

  private token: string | null = null;

  constructor() {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      try {
        const parts = stored.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1])) as { userId: number; email: string; exp?: number };
          const now = Math.floor(Date.now() / 1000);
          if (!payload.exp || payload.exp > now) {
            this.token = stored;
            this.user.set({ id: payload.userId, email: payload.email });
            this.isSignedIn.set(true);
          } else {
            localStorage.removeItem(TOKEN_KEY);
          }
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  async login(email: string, password: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      throw new Error(err.error ?? 'Login failed.');
    }
    const data = (await res.json()) as { token: string; user: UserProfile };
    this.setSession(data.token, data.user);
    return data.user;
  }

  async register(email: string, password: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      throw new Error(err.error ?? 'Registration failed.');
    }
    const data = (await res.json()) as { token: string; user: UserProfile };
    this.setSession(data.token, data.user);
    return data.user;
  }

  async googleSignIn(credential: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      throw new Error(err.error ?? 'Google sign-in failed.');
    }
    const data = (await res.json()) as { token: string; user: UserProfile };
    this.setSession(data.token, data.user);
    return data.user;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    this.isSignedIn.set(false);
    this.user.set(null);
  }

  getAuthHeaders(): Record<string, string> {
    if (!this.token) return {};
    return { Authorization: `Bearer ${this.token}` };
  }

  getDisplayName(): string {
    const u = this.user();
    return u ? u.email.split('@')[0] : '';
  }

  private setSession(token: string, user: UserProfile): void {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
    this.user.set({ id: user.id, email: user.email });
    this.isSignedIn.set(true);
  }
}
