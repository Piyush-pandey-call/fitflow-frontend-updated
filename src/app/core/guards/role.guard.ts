import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../../enums/role.enum';

/**
 * Usage in a route definition:
 *   { path: 'settings', canActivate: [roleGuard], data: { roles: [Role.GYM_OWNER] } }
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Role[] | undefined;
  const user = authService.currentUser();

  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
