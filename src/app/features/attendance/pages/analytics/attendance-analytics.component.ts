import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { AttendanceAnalyticsResponse } from '../../../../models/attendance.model';
import { ChartPoint } from '../../../../models/dashboard.model';
import { StatsCardComponent } from '../../../dashboard/components/stats-card/stats-card.component';
import { LineChartComponent } from '../../../dashboard/components/line-chart/line-chart.component';

/**
 * Reuses the exact same stats-card and line-chart components built for
 * Module 2's Gym Owner dashboard - GET /attendance/analytics returns the
 * same { date, value }-shaped series (just named `count` instead of
 * `value`), so there's no reason to build a second chart component.
 */
@Component({
  selector: 'app-attendance-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, StatsCardComponent, LineChartComponent],
  templateUrl: './attendance-analytics.component.html',
  styleUrl: './attendance-analytics.component.css',
})
export class AttendanceAnalyticsComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly analytics = signal<AttendanceAnalyticsResponse | null>(null);
  readonly chartData = signal<ChartPoint[]>([]);

  // Both `from` and `to` are required by the backend (no defaults) - default the UI to the last 30 days.
  fromDate = this.daysAgo(29);
  toDate = this.daysAgo(0);

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.attendanceService.getAnalytics({ from: this.fromDate, to: this.toDate }).subscribe({
      next: (res) => {
        this.analytics.set(res);
        this.chartData.set(res.dailySeries.map((p) => ({ date: p.date, value: p.count })));
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  private daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }
}
