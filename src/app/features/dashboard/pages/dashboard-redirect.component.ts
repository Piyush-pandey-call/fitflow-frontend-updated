import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../enums/role.enum';

/**
 * Renders nothing - just looks at the logged-in user's role (already known
 * client-side from the JWT payload persisted at login) and redirects to the
 * matching dashboard route. Kept as its own tiny component instead of logic
 * inside a resolver/guard so it's easy to see and modify.
 */
@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: '',
})
export class DashboardRedirectComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const role = this.authService.currentUser()?.role;

    switch (role) {
      case Role.GYM_OWNER:
        this.router.navigate(['/dashboard/gym-owner']);
        break;
      case Role.MEMBER:
        this.router.navigate(['/dashboard/member']);
        break;
      case Role.SUPER_ADMIN:
        this.router.navigate(['/dashboard/super-admin']);
        break;
      case Role.TRAINER:
      default:
        this.router.navigate(['/dashboard/pending']);
        break;
    }
  }
}
