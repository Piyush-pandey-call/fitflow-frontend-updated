import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { REPORT_TYPE_DESCRIPTIONS, REPORT_TYPE_LABELS, ReportType } from '../../../../enums/report-type.enum';

import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { GymOwnerDashboardResponse } from '../../../../models/dashboard.model';
import { LineChartComponent } from '../../../dashboard/components/line-chart/line-chart.component';
@Component({
  selector: 'app-report-export',
  standalone: true,
  imports: [CommonModule, FormsModule, LineChartComponent],
  templateUrl: './report-export.component.html',
  styleUrl: './report-export.component.css',
})
export class ReportExportComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  readonly overview = signal<GymOwnerDashboardResponse | null>(null);
  ngOnInit(){this.dashboardService.getGymOwnerDashboard().subscribe({next:d=>this.overview.set(d),error:()=>{}});}
  private reportService = inject(ReportService);

  readonly reportTypes = Object.values(ReportType);
  readonly typeLabels = REPORT_TYPE_LABELS;
  readonly typeDescriptions = REPORT_TYPE_DESCRIPTIONS;

  readonly errorMessage = signal<string | null>(null);
  readonly downloadingKey = signal<string | null>(null);

  selectedType: ReportType = Object.values(ReportType)[0];
  fromDate = this.daysAgo(29);
  toDate = this.daysAgo(0);

  private daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  download(type: ReportType, format: 'excel' | 'pdf'): void {
    const key = `${type}-${format}`;
    this.downloadingKey.set(key);
    this.errorMessage.set(null);

    const request$ =
      format === 'excel'
        ? this.reportService.downloadExcel(type, this.fromDate, this.toDate)
        : this.reportService.downloadPdf(type, this.fromDate, this.toDate);

    request$.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = format === 'excel' ? 'xlsx' : 'pdf';
        a.download = `${type.toLowerCase()}-report-${this.fromDate}-to-${this.toDate}.${ext}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingKey.set(null);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.downloadingKey.set(null);
      },
    });
  }

  isDownloading(type: ReportType, format: 'excel' | 'pdf'): boolean {
    return this.downloadingKey() === `${type}-${format}`;
  }
}
