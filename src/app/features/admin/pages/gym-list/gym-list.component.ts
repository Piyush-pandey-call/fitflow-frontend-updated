import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GymAdminService } from '../../services/gym-admin.service';
import { GymResponse, GYM_STATUS_LABELS, GymStatus } from '../../../../models/gym.model';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

/** "See a list of all gym owners" - every tenant on the platform, SUPER_ADMIN only. */
@Component({
  selector: 'app-gym-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, EmptyStateComponent],
  templateUrl: './gym-list.component.html',
  styleUrl: './gym-list.component.css',
})
export class GymListComponent implements OnInit {
  private gymAdminService = inject(GymAdminService);

  readonly statusLabels = GYM_STATUS_LABELS;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pageData = signal<PageResponse<GymResponse> | null>(null);
  readonly statusFilter = signal<GymStatus | null>(null);

  pageNumber = 0;
  readonly pageSize = 20;
  readonly statusOptions = Object.values(GymStatus);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.gymAdminService.listAllGyms(this.statusFilter(), this.pageNumber, this.pageSize).subscribe({
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

  onStatusChange(value: string): void {
    this.statusFilter.set((value || null) as GymStatus | null);
    this.pageNumber = 0;
    this.load();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }
}
