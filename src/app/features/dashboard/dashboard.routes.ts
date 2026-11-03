import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard-redirect.component').then((m) => m.DashboardRedirectComponent),
        title: 'Dashboard | FitFlow',
      },
      {
        path: 'gym-owner',
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER] },
        loadComponent: () =>
          import('./pages/gym-owner/gym-owner-dashboard.component').then((m) => m.GymOwnerDashboardComponent),
        title: 'Gym Owner Dashboard | FitFlow',
      },
      {
        path: 'member',
        canActivate: [roleGuard],
        data: { roles: [Role.MEMBER] },
        loadComponent: () =>
          import('./pages/member/member-dashboard.component').then((m) => m.MemberDashboardComponent),
        title: 'My Dashboard | FitFlow',
      },
      {
        path: 'super-admin',
        canActivate: [roleGuard],
        data: { roles: [Role.SUPER_ADMIN] },
        loadComponent: () =>
          import('./pages/super-admin/super-admin-dashboard.component').then(
            (m) => m.SuperAdminDashboardComponent
          ),
        title: 'Super Admin Dashboard | FitFlow',
      },
      {
        path: 'pending',
        loadComponent: () =>
          import('./pages/pending/dashboard-pending.component').then((m) => m.DashboardPendingComponent),
        title: 'Dashboard | FitFlow',
      },
    ],
  },
];
