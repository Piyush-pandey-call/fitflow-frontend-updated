import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MembershipPlanService } from '../../services/membership-plan.service';
import { MemberMembershipResponse, MembershipPlanResponse } from '../../../../models/membership.model';
import { MemberMembershipStatus, MEMBER_MEMBERSHIP_STATUS_LABELS } from '../../../../enums/member-membership-status.enum';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

/**
 * "If a gym owner posts a subscription plan, I need to see all the members
 * associated with that [plan]" - this is that view: every member (current
 * and past) who has ever been assigned this plan, most recent first.
 */
@Component({
  selector: 'app-plan-members',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, EmptyStateComponent],
  templateUrl: './plan-members.component.html',
  styleUrl: './plan-members.component.css',
})
export class PlanMembersComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private planService = inject(MembershipPlanService);

  readonly statusLabels = MEMBER_MEMBERSHIP_STATUS_LABELS;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly plan = signal<MembershipPlanResponse | null>(null);
  readonly pageData = signal<PageResponse<MemberMembershipResponse> | null>(null);

  planId!: string;
  pageNumber = 0;
  readonly pageSize = 20;

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id')!;
    this.planService.getById(this.planId).subscribe({ next: (p) => this.plan.set(p) });
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.planService.getMembers(this.planId, this.pageNumber, this.pageSize).subscribe({
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

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' });
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }

  statusTone(status: MemberMembershipStatus): string {
    switch (status) {
      case MemberMembershipStatus.ACTIVE:
        return 'badge-success';
      case MemberMembershipStatus.PENDING_PAYMENT:
        return 'badge-warning';
      default:
        return 'badge-neutral';
    }
  }
}
