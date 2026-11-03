import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartPoint } from '../../../../models/dashboard.model';

/**
 * Self-contained SVG line chart - no external charting library required.
 * The original doc listed separate "revenue-chart" and "growth-chart"
 * components, but since GymOwnerDashboardResponse.revenueAnalytics,
 * attendanceAnalytics, and membershipGrowth are all the same ChartPoint[]
 * shape, one reusable, configurable component (title + color + data) covers
 * all three instead of duplicating near-identical code three times.
 */
@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent implements OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) data: ChartPoint[] = [];
  @Input() color = '#4f46e5';
  /** Prefix shown before each value in the hover tooltip, e.g. '₹' for revenue. */
  @Input() valuePrefix = '';

  private readonly width = 560;
  private readonly height = 180;
  private readonly paddingX = 12;
  private readonly paddingY = 16;

  linePoints = '';
  areaPoints = '';
  dots: { x: number; y: number; value: number; date: string }[] = [];
  maxValue = 0;
  hoveredIndex: number | null = null;

  ngOnChanges(): void {
    this.buildChart();
  }

  private buildChart(): void {
    if (!this.data?.length) {
      this.linePoints = '';
      this.areaPoints = '';
      this.dots = [];
      return;
    }

    const values = this.data.map((d) => d.value);
    this.maxValue = Math.max(...values, 1);
    const innerWidth = this.width - this.paddingX * 2;
    const innerHeight = this.height - this.paddingY * 2;
    const step = this.data.length > 1 ? innerWidth / (this.data.length - 1) : 0;

    this.dots = this.data.map((point, i) => {
      const x = this.paddingX + step * i;
      const y = this.paddingY + innerHeight - (point.value / this.maxValue) * innerHeight;
      return { x, y, value: point.value, date: point.date };
    });

    this.linePoints = this.dots.map((d) => `${d.x},${d.y}`).join(' ');

    const baseline = this.paddingY + innerHeight;
    this.areaPoints = `${this.paddingX},${baseline} ${this.linePoints} ${
      this.paddingX + step * (this.data.length - 1)
    },${baseline}`;
  }

  get viewBox(): string {
    return `0 0 ${this.width} ${this.height}`;
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short' });
  }
}
