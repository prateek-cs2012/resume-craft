import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
<div class="not-found-wrap">
  <mat-icon class="not-found-icon">search_off</mat-icon>
  <h1>404 — Page Not Found</h1>
  <p>The page you're looking for doesn't exist.</p>
  <button mat-flat-button color="primary" (click)="router.navigate(['/'])">Go to Home</button>
</div>
  `,
  styles: [`
    .not-found-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 16px;
      text-align: center;
      padding: 32px;
    }
    .not-found-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #9e9e9e;
    }
    h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
    }
    p {
      margin: 0;
      color: #666;
    }
  `]
})
export class NotFoundComponent {
  constructor(public router: Router) {}
}
