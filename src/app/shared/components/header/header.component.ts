import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GymSettingsService } from '../../../features/settings/services/gym-settings.service';
import { GymResponse, GymStatus } from '../../../models/gym.model';
import { Role } from '../../../enums/role.enum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private gymSettingsService = inject(GymSettingsService);
  private router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly isLoggingOut = signal(false);
  readonly menuOpen = signal(false);
  private readonly failedProfileImageUrl = signal<string | null>(null);
  readonly profileImageUrl = computed(() => {
    const url = this.currentUser()?.profileImageUrl;
    return url && url !== this.failedProfileImageUrl() ? url : null;
  });

  // Trial/subscription status pill - only ever shown to the gym owner, per
  // "the subscription model should only be visible to the gym owner and the
  // super admin; it should not be visible to the members."
  readonly gym = signal<GymResponse | null>(null);

  readonly showTrialPill = computed(() => this.currentUser()?.role === Role.GYM_OWNER);

  /** What the owner sees in the header: trial countdown, trial-ended, or a plain plan status - never "null days". */
  readonly pillLabel = computed(() => {
    const g = this.gym();
    if (!g) return '';
    if (g.status === GymStatus.TRIAL) {
      const days = this.trialDaysLeft();
      if (days === null) return 'Free trial';
      if (days <= 0) return 'TRIAL ENDED';
      return 'Trial: ' + days + (days === 1 ? ' day left' : ' days left');
    }
    return g.status === GymStatus.ACTIVE ? 'Plan active' : 'Plan inactive';
  });

  readonly trialDaysLeft = computed<number | null>(() => {
    const g = this.gym();
    if (!g?.trialEndsAt) return null;
    const diffMs = new Date(g.trialEndsAt).getTime() - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  });

  readonly isTrialExpired = computed(() => {
    const days = this.trialDaysLeft();
    return this.gym()?.status === GymStatus.TRIAL && days !== null && days <= 0;
  });

  ngOnInit(): void {
    if (this.showTrialPill()) {
      this.gymSettingsService.getMyGym().subscribe({
        next: (g) => this.gym.set(g),
        error: () => this.gym.set(null), // Non-critical - header just omits the pill if this fails.
      });
    }
  }

  search(event: Event, value: string): void {
    event.preventDefault();
    if (this.currentUser()?.role === Role.GYM_OWNER || this.currentUser()?.role === Role.TRAINER) this.router.navigate(['/members'], {queryParams: {search:value}});
    else this.router.navigate(['/profile']);
  }
  logout(): void {
    this.isLoggingOut.set(true);
    this.authService.logout().subscribe({
      // AuthService.logout() clears local state either way (see Module 1) -
      // return to the public website on both success and failure.
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.isLoggingOut.set(false);
    this.menuOpen.set(false);
    this.router.navigateByUrl('/');
  }

  initials(name: string | undefined): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  onProfileImageError(): void {
    this.failedProfileImageUrl.set(this.profileImageUrl());
  }
}
