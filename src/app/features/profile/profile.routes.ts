import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    // GET /users/me has no @PreAuthorize role restriction - any authenticated
    // user regardless of role. No roleGuard needed, just authGuard.
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-profile/my-profile.component').then((m) => m.MyProfileComponent),
    title: 'My Profile | FitFlow',
  },
];
