import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

/**
 * TRAINER and MEMBER dashboards are in the original module list, but
 * DashboardController only exposes /dashboard/gym-owner and
 * /dashboard/super-admin today - there's no backend endpoint for these two
 * roles yet. Rather than pointing the frontend at a URL that 404s, this page
 * says so honestly. Swap it out for a real page as soon as the corresponding
 * controller method + DTO exist on the backend.
 */
@Component({
  selector: 'app-dashboard-pending',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-pending.component.html',
  styleUrl: './dashboard-pending.component.css',
})
export class DashboardPendingComponent {
  constructor(public authService: AuthService) {}
}
