import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { GymOwnerDashboardResponse } from '../../../../models/dashboard.model';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { LineChartComponent } from '../../components/line-chart/line-chart.component';
import { RecentActivitiesComponent } from '../../components/recent-activities/recent-activities.component';

import { AuthService } from '../../../../core/services/auth.service';
import { GymSettingsService } from '../../../settings/services/gym-settings.service';
import { GymResponse } from '../../../../models/gym.model';
@Component({
  selector: 'app-gym-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatsCardComponent, LineChartComponent, RecentActivitiesComponent],
  templateUrl: './gym-owner-dashboard.component.html',
  styleUrl: './gym-owner-dashboard.component.css',
})
export class GymOwnerDashboardComponent implements OnInit {
  readonly user = inject(AuthService).currentUser;
  private settings = inject(GymSettingsService);
  readonly gym = signal<GymResponse | null>(null);
  readonly today = new Date();
  trialDays(): number { return Math.max(0, Math.ceil((new Date(this.gym()?.trialEndsAt || '').getTime() - Date.now()) / 86400000)); }
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly dashboard = signal<GymOwnerDashboardResponse | null>(null);
  readonly lastUpdated = signal('—');

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.load();
    this.settings.getMyGym().subscribe({next:g=>this.gym.set(g),error:()=>{}});
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dashboardService.getGymOwnerDashboard().subscribe({
      next: (res) => {
        this.dashboard.set(res);
        this.lastUpdated.set(this.formatDate(new Date()));
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      value
    );
  }

  /** Time-of-day greeting using India time, so it isn't "Good morning" at 9pm. */
  greeting(): string {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()));
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-IN').format(value);
  }

  avgRevenuePerMember(data: GymOwnerDashboardResponse): number {
    return data.totalMembers ? data.revenueThisMonth / data.totalMembers : 0;
  }

  membershipUtilization(data: GymOwnerDashboardResponse): string {
    return data.totalMembers ? `${Math.round((data.activeMemberships / data.totalMembers) * 100)}%` : '0%';
  }

  private formatDate(date: Date): string {
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }
}
