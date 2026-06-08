import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'upload',
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
  { path: '**', redirectTo: '' }
];
