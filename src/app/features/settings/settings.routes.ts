import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    // /gyms/me and updateMyGym/logo are GYM_OWNER only on the backend.
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.GYM_OWNER] },
    loadComponent: () => import('./pages/gym-settings/gym-settings.component').then((m) => m.GymSettingsComponent),
    title: 'Settings | FitFlow',
  },
];
