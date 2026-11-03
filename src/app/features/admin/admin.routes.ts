import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

/** Platform-wide gym management - SUPER_ADMIN only (backend enforces the same on every endpoint). */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.SUPER_ADMIN] },
    children: [
      {
        path: 'gyms',
        loadComponent: () => import('./pages/gym-list/gym-list.component').then((m) => m.GymListComponent),
        title: 'Gyms | FitFlow',
      },
      {
        path: 'gyms/:id',
        loadComponent: () => import('./pages/gym-detail/gym-detail.component').then((m) => m.GymDetailComponent),
        title: 'Gym | FitFlow',
      },
    ],
  },
];
