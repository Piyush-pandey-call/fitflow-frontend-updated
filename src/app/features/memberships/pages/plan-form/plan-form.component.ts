import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MembershipPlanService } from '../../services/membership-plan.service';
import { BILLING_CYCLE_LABELS, BillingCycle } from '../../../../enums/billing-cycle.enum';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './plan-form.component.html',
  styleUrl: './plan-form.component.css',
})
export class PlanFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private membershipPlanService = inject(MembershipPlanService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private planId: string | null = null;
  readonly billingCycleOptions = Object.values(BillingCycle);
  readonly billingCycleLabels = BILLING_CYCLE_LABELS;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(500)]],
    billingCycle: [BillingCycle.MONTHLY, [Validators.required]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    gstPercentage: [null as number | null, [Validators.min(0)]],
    maxMembers: [null as number | null, [Validators.min(1)]],
    includesPersonalTraining: [false],
    active: [true],
  });

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.planId);

    if (this.planId) {
      this.isLoading.set(true);
      this.membershipPlanService.getById(this.planId).subscribe({
        next: (plan) => {
          this.form.patchValue({
            name: plan.name,
            description: plan.description ?? '',
            billingCycle: plan.billingCycle,
            price: plan.price,
            gstPercentage: plan.gstPercentage ?? null,
            maxMembers: plan.maxMembers ?? null,
            includesPersonalTraining: plan.includesPersonalTraining,
            active: plan.active,
          });
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.isLoading.set(false);
        },
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const basePayload = {
      name: raw.name!,
      description: raw.description || undefined,
      billingCycle: raw.billingCycle!,
      price: raw.price!,
      gstPercentage: raw.gstPercentage ?? undefined,
      maxMembers: raw.maxMembers ?? undefined,
      includesPersonalTraining: raw.includesPersonalTraining!,
    };

    // CreateMembershipPlanRequest has no `active` field - plans are created active by default.
    const request$ = this.isEditMode()
      ? this.membershipPlanService.update(this.planId!, { ...basePayload, active: raw.active! })
      : this.membershipPlanService.create(basePayload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/memberships/plans']);
      },
      error: (err: Error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
