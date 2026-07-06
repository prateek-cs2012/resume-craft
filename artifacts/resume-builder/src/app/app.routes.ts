import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { premiumGuard } from './guards/premium.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in/sign-in.component').then(m => m.SignInComponent)
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up.component').then(m => m.SignUpComponent)
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.component').then(m => m.PricingComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'upload',
    canActivate: [premiumGuard],
    loadComponent: () => import('./pages/upload/upload.component').then(m => m.UploadComponent)
  },
  {
    path: 'builder',
    loadComponent: () => import('./pages/builder/builder.component').then(m => m.BuilderComponent)
  },
  {
    path: 'preview',
    loadComponent: () => import('./pages/preview/preview.component').then(m => m.PreviewComponent)
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
