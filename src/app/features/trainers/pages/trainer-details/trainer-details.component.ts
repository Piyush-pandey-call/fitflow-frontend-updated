import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { TRAINER_STATUS_LABELS, TrainerStatus } from '../../../../enums/trainer-status.enum';
import { TrainerResponse } from '../../../../models/trainer.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Covers "trainer-details" from the original module list. "Assign Members"
 * was also listed as its own page, but there's no backend support for it as
 * a bulk/dedicated screen: MemberController#listMembers has no trainerId
 * filter, and TrainerRepository's findByTenantIdAndAssignedTrainerId (the
 * query that *would* power such a page) is never wired to any controller
 * endpoint - only its count() sibling is used, to populate assignedMemberCount
 * below. So this page shows that count and links to the real mechanism that
 * exists today: assigning a trainer from the Member form (Module 3).
 */
@Component({
  selector: 'app-trainer-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './trainer-details.component.html',
  styleUrl: './trainer-details.component.css',
})
export class TrainerDetailsComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly trainer = signal<TrainerResponse | null>(null);
  readonly isDeleting = signal(false);
  readonly showDeleteConfirm = signal(false);

  readonly statusLabels = TRAINER_STATUS_LABELS;
  readonly Role = Role;

  private trainerId!: string;

  constructor(
    private trainerService: TrainerService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.trainerId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.trainerService.getById(this.trainerId).subscribe({
      next: (trainer) => {
        this.trainer.set(trainer);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  confirmDelete(): void {
    this.isDeleting.set(true);
    this.trainerService.delete(this.trainerId).subscribe({
      next: () => this.router.navigate(['/trainers']),
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isDeleting.set(false);
        this.showDeleteConfirm.set(false);
      },
    });
  }

  statusTone(status: TrainerStatus): string {
    switch (status) {
      case TrainerStatus.ACTIVE:
        return 'badge-success';
      case TrainerStatus.ON_LEAVE:
        return 'badge-warning';
      default:
        return 'badge-neutral';
    }
  }
}
