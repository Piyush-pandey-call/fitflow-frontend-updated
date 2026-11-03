import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { MEMBER_STATUS_LABELS, MemberStatus, MemberSummaryResponse } from '../../../../models/member.model';
import { PageResponse } from '../../../../models/common.model';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SearchBarComponent,
    PaginationComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
  readonly totalMembers = signal<number | null>(null);
  readonly activeMembers = signal<number | null>(null);
  readonly expiredMembers = signal<number | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pageData = signal<PageResponse<MemberSummaryResponse> | null>(null);

  readonly statusOptions = Object.values(MemberStatus);
  readonly statusLabels = MEMBER_STATUS_LABELS;

  // Filter/sort state driving the next request to GET /members
  searchTerm = '';
  statusFilter: MemberStatus | '' = '';
  pageNumber = 0;
  readonly pageSize = 20;

  // Delete-confirmation state
  readonly deleteTarget = signal<MemberSummaryResponse | null>(null);
  readonly isDeleting = signal(false);

  readonly Role = Role;

  constructor(private memberService: MemberService, public authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.searchTerm = this.route.snapshot.queryParamMap.get('search') || '';
    this.route.queryParamMap.subscribe(p=>{const term=p.get('search') || '';if(term!==this.searchTerm){this.searchTerm=term;this.pageNumber=0;this.load();}});
    this.load();
    this.loadSummary();
  }

  private loadSummary(): void {
    const query = { page: 0, size: 1, sortBy: 'createdAt', sortDirection: 'DESC' as const };
    this.memberService.list(query).subscribe({
      next: (page) => this.totalMembers.set(page.totalElements),
      error: (err: Error) => this.errorMessage.set(err.message),
    });
    this.memberService.list({ ...query, status: MemberStatus.ACTIVE }).subscribe({
      next: (page) => this.activeMembers.set(page.totalElements),
      error: (err: Error) => this.errorMessage.set(err.message),
    });
    this.memberService.list({ ...query, status: MemberStatus.EXPIRED }).subscribe({
      next: (page) => this.expiredMembers.set(page.totalElements),
      error: (err: Error) => this.errorMessage.set(err.message),
    });
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.memberService
      .list({
        status: this.statusFilter || undefined,
        search: this.searchTerm || undefined,
        page: this.pageNumber,
        size: this.pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC',
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

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.pageNumber = 0;
    this.load();
  }

  onStatusFilterChange(): void {
    this.pageNumber = 0;
    this.load();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  goToNew(): void {
    this.router.navigate(['/members/new']);
  }

  requestDelete(member: MemberSummaryResponse, event: Event): void {
    event.stopPropagation();
    this.deleteTarget.set(member);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.isDeleting.set(true);
    this.memberService.delete(target.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteTarget.set(null);
        this.load();
        this.loadSummary();
      },
      error: (err: Error) => {
        this.isDeleting.set(false);
        this.errorMessage.set(err.message);
        this.deleteTarget.set(null);
      },
    });
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  statusTone(status: MemberStatus): string {
    switch (status) {
      case MemberStatus.ACTIVE:
        return 'badge-success';
      case MemberStatus.FROZEN:
        return 'badge-warning';
      case MemberStatus.EXPIRED:
      case MemberStatus.INACTIVE:
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  }
}
