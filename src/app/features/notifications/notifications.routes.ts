import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    // NotificationController is class-level GYM_OWNER+TRAINER only.
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
    loadComponent: () =>
      import('./pages/notification-log/notification-log.component').then((m) => m.NotificationLogComponent),
    title: 'Notifications | FitFlow',
  },
];
