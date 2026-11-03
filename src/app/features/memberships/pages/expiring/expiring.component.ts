import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MemberMembershipService } from '../../services/member-membership.service';
import { MemberMembershipResponse } from '../../../../models/membership.model';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

/**
 * "Who do I need to call about renewing?" - ACTIVE memberships ending soon,
 * soonest first, with a window the owner can widen. Each row opens the member.
 */
@Component({
  selector: 'app-expiring-memberships',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, EmptyStateComponent],
  templateUrl: './expiring.component.html',
  styleUrl: './expiring.component.css',
})
export class ExpiringComponent implements OnInit {
  private service = inject(MemberMembershipService);

  readonly windows = [7, 14, 30];
  readonly days = signal(7);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pageData = signal<PageResponse<MemberMembershipResponse> | null>(null);
  pageNumber = 0;
  readonly pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  setDays(days: number): void {
    this.days.set(days);
    this.pageNumber = 0;
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.service.getExpiring(this.days(), this.pageNumber, this.pageSize).subscribe({
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

  daysLeft(endDate: string): number {
    const end = new Date(endDate + 'T23:59:59').getTime();
    return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  }

  urgency(endDate: string): 'urgent' | 'soon' | 'ok' {
    const d = this.daysLeft(endDate);
    return d <= 2 ? 'urgent' : d <= 7 ? 'soon' : 'ok';
  }
}
