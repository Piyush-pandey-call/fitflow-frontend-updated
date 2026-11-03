import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
        title: 'Login | FitFlow',
      },
      {
        path: 'member-login',
        loadComponent: () =>
          import('./pages/member-login/member-login.component').then((m) => m.MemberLoginComponent),
        title: 'Member Login | FitFlow',
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent),
        title: 'Register Your Gym | FitFlow',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
        title: 'Forgot Password | FitFlow',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
        title: 'Reset Password | FitFlow',
      },
    ],
  },
  // Verify-email is reachable while logged in too (resend flow), so it sits outside guestGuard.
  {
    path: 'verify-email',
    loadComponent: () => import('./pages/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent),
    title: 'Verify Email | FitFlow',
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
