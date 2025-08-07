import { Routes } from '@angular/router';
import { FakeAuthGuard } from './core/guards/fake-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', loadComponent: () => import('./registration/registration.component').then(m => m.RegistrationComponent) },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { 
    path: 'dashboard', 
    canActivate: [FakeAuthGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) 
  }
];
