import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { PAYMENT_STATUS_LABELS, PaymentStatus } from '../../../../enums/payment.enum';
import { PaymentResponse } from '../../../../models/payment.model';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { GymOwnerDashboardResponse } from '../../../../models/dashboard.model';
@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, EmptyStateComponent],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.css',
})
export class PaymentListComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private route = inject(ActivatedRoute);

  private dashboardService = inject(DashboardService);
  readonly overview = signal<GymOwnerDashboardResponse | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pageData = signal<PageResponse<PaymentResponse> | null>(null);

  readonly statusOptions = Object.values(PaymentStatus);
  readonly statusLabels = PAYMENT_STATUS_LABELS;

  statusFilter: PaymentStatus | '' = '';
  memberIdFilter: string | null = null;
  pageNumber = 0;
  readonly pageSize = 20;

  ngOnInit(): void {
    this.dashboardService.getGymOwnerDashboard().subscribe({next:d=>this.overview.set(d),error:()=>{}});
    // Reached either standalone (/payments) or filtered from a member's
    // membership page (/payments?memberId=xxx) - both are the same page.
    this.memberIdFilter = this.route.snapshot.queryParamMap.get('memberId');
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.paymentService
      .list({
        status: this.statusFilter || undefined,
        memberId: this.memberIdFilter || undefined,
        page: this.pageNumber,
        size: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.pageData.set(res);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.isLoading.set(false);
        },
      });
  }

  onFilterChange(): void {
    this.pageNumber = 0;
    this.load();
  }

  clearMemberFilter(): void {
    this.memberIdFilter = null;
    this.onFilterChange();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  statusTone(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return 'badge-success';
      case PaymentStatus.PENDING:
        return 'badge-warning';
      case PaymentStatus.FAILED:
        return 'badge-neutral';
      case PaymentStatus.REFUNDED:
      case PaymentStatus.PARTIALLY_REFUNDED:
        return 'badge-primary';
      default:
        return 'badge-neutral';
    }
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  }
}
