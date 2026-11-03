import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { TRAINER_STATUS_LABELS, TrainerStatus } from '../../../../enums/trainer-status.enum';
import { TrainerResponse } from '../../../../models/trainer.model';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-trainer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './trainer-list.component.html',
  styleUrl: './trainer-list.component.css',
})
export class TrainerListComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pageData = signal<PageResponse<TrainerResponse> | null>(null);

  readonly statusOptions = Object.values(TrainerStatus);
  readonly statusLabels = TRAINER_STATUS_LABELS;

  // GET /trainers has no `search` param on the backend - only status + paging.
  statusFilter: TrainerStatus | '' = '';
  pageNumber = 0;
  readonly pageSize = 20;

  readonly deleteTarget = signal<TrainerResponse | null>(null);
  readonly isDeleting = signal(false);

  readonly Role = Role;

  constructor(private trainerService: TrainerService, public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.trainerService
      .list({ status: this.statusFilter || undefined, page: this.pageNumber, size: this.pageSize })
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

  onStatusFilterChange(): void {
    this.pageNumber = 0;
    this.load();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  goToNew(): void {
    this.router.navigate(['/trainers/new']);
  }

  requestDelete(trainer: TrainerResponse, event: Event): void {
    event.stopPropagation();
    this.deleteTarget.set(trainer);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.isDeleting.set(true);
    this.trainerService.delete(target.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteTarget.set(null);
        this.load();
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

  statusTone(status: TrainerStatus): string {
    switch (status) {
      case TrainerStatus.ACTIVE:
        return 'badge-success';
      case TrainerStatus.ON_LEAVE:
        return 'badge-warning';
      case TrainerStatus.INACTIVE:
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  }
}
