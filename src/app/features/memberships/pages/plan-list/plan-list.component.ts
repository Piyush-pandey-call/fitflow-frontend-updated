import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MembershipPlanService } from '../../services/membership-plan.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { BILLING_CYCLE_LABELS } from '../../../../enums/billing-cycle.enum';
import { MembershipPlanResponse } from '../../../../models/membership.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './plan-list.component.html',
  styleUrl: './plan-list.component.css',
})
export class PlanListComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly plans = signal<MembershipPlanResponse[]>([]);
  readonly showInactive = signal(false);

  readonly billingCycleLabels = BILLING_CYCLE_LABELS;
  readonly Role = Role;

  readonly deleteTarget = signal<MembershipPlanResponse | null>(null);
  readonly isDeleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  constructor(
    private membershipPlanService: MembershipPlanService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.membershipPlanService.list(!this.showInactive()).subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  toggleShowInactive(): void {
    this.showInactive.set(!this.showInactive());
    this.load();
  }

  goToNew(): void {
    this.router.navigate(['/memberships/plans/new']);
  }

  requestDelete(plan: MembershipPlanResponse, event: Event): void {
    event.stopPropagation();
    this.deleteError.set(null);
    this.deleteTarget.set(plan);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.isDeleting.set(true);
    this.membershipPlanService.delete(target.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteTarget.set(null);
        this.load();
      },
      error: (err: Error) => {
        // Backend rejects delete if the plan still has active subscribers - surface that in the dialog itself.
        this.isDeleting.set(false);
        this.deleteError.set(err.message);
      },
    });
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
    this.deleteError.set(null);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      price
    );
  }
}
