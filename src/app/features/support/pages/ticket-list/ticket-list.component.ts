import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupportTicketService } from '../../services/support-ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { SUPPORT_TICKET_STATUS_LABELS, SupportTicketResponse, SupportTicketStatus } from '../../../../models/support.model';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, EmptyStateComponent],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.css',
})
export class TicketListComponent implements OnInit {
  private supportTicketService = inject(SupportTicketService);
  public authService = inject(AuthService);

  readonly Role = Role;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pageData = signal<PageResponse<SupportTicketResponse> | null>(null);
  readonly statusLabels = SUPPORT_TICKET_STATUS_LABELS;
  readonly statusOptions = Object.values(SupportTicketStatus);

  readonly isSuperAdmin = this.authService.currentUser()?.role === Role.SUPER_ADMIN;
  statusFilter: SupportTicketStatus | '' = '';
  pageNumber = 0;
  readonly pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  @HostListener('window:focus')
  refreshWhenWindowFocuses(): void {
    if (!this.isLoading()) this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request$ = this.isSuperAdmin
      ? this.supportTicketService.listAll(this.statusFilter || undefined, this.pageNumber, this.pageSize)
      : this.supportTicketService.listMine(this.pageNumber, this.pageSize);

    request$.subscribe({
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

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  statusTone(status: SupportTicketStatus): string {
    switch (status) {
      case SupportTicketStatus.OPEN:
        return 'badge-warning';
      case SupportTicketStatus.IN_PROGRESS:
        return 'badge-primary';
      case SupportTicketStatus.RESOLVED:
        return 'badge-success';
      case SupportTicketStatus.CLOSED:
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  }
}
