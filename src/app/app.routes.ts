import { Routes } from '@angular/router';
import { AppShellComponent } from './layouts/app-shell/app-shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './enums/role.enum';
import { guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/landing/pages/welcome/welcome.component').then((m) => m.WelcomeComponent),
    title: 'Welcome | FitFlow',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'gym',
    loadChildren: () => import('./features/gym-info/gym-info.routes').then((m) => m.GYM_INFO_ROUTES),
  },
  {
    // Every authenticated page renders inside the sidebar+header shell.
    // authGuard here means an unauthenticated visit to any nested path
    // redirects to login before the shell (and its API calls) ever mounts.
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'billing',
        loadChildren: () => import('./features/billing/billing.routes').then((m) => m.BILLING_ROUTES),
      },
      {
        path: 'members',
        loadChildren: () => import('./features/members/members.routes').then((m) => m.MEMBERS_ROUTES),
      },
      {
        path: 'trainers',
        loadChildren: () => import('./features/trainers/trainers.routes').then((m) => m.TRAINERS_ROUTES),
      },
      {
        path: 'attendance',
        loadChildren: () => import('./features/attendance/attendance.routes').then((m) => m.ATTENDANCE_ROUTES),
      },
      {
        path: 'memberships',
        loadChildren: () => import('./features/memberships/memberships.routes').then((m) => m.MEMBERSHIPS_ROUTES),
      },
      {path:'wellness',canActivate:[roleGuard],data:{roles:[Role.GYM_OWNER,Role.TRAINER,Role.MEMBER]},loadComponent:()=>import('./features/wellness/wellness.component').then(m=>m.WellnessComponent),title:'Workout & Diet | FitFlow'},
      {
        path: 'workouts',
        loadChildren: () => import('./features/workouts/workouts.routes').then((m) => m.WORKOUTS_ROUTES),
      },
      {
        path: 'diet',
        loadChildren: () => import('./features/diet/diet.routes').then((m) => m.DIET_ROUTES),
      },
      {
        path: 'payments',
        loadChildren: () => import('./features/payments/payments.routes').then((m) => m.PAYMENTS_ROUTES),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then((m) => m.NOTIFICATIONS_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
      },
      {path:'help',loadComponent:()=>import('./features/support/pages/faq/faq.component').then(m=>m.FaqComponent),title:'Help & FAQ | FitFlow'},
      {
        path: 'support',
        loadChildren: () => import('./features/support/support.routes').then((m) => m.SUPPORT_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
