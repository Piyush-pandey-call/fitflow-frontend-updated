import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BillingCycle } from '../../../../enums/billing-cycle.enum';
import { GymSubscriptionResponse, PlatformSubscriptionPlan } from '../../../../models/gym-subscription.model';
import { GymSubscriptionService } from '../../services/gym-subscription.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent implements OnInit {
  readonly BillingCycle = BillingCycle;
  readonly plans = signal<PlatformSubscriptionPlan[]>([]);
  readonly currentSubscription = signal<GymSubscriptionResponse | null>(null);
  readonly isLoadingPlans = signal(true);
  readonly planError = signal<string | null>(null);
  readonly subscriptionError = signal<string | null>(null);

  constructor(
    private readonly router: Router,
    private readonly gymSubscriptionService: GymSubscriptionService
  ) {}

  get paidPlans(): PlatformSubscriptionPlan[] {
    return this.plans().filter((plan) => plan.monthlyPrice > 0 || (plan.yearlyPrice ?? 0) > 0);
  }

  ngOnInit(): void {
    this.loadPlans();
    this.loadCurrentSubscription();
  }

  selectPlan(plan: PlatformSubscriptionPlan, billingCycle: BillingCycle.MONTHLY | BillingCycle.YEARLY): void {
    this.router.navigate(['/billing/checkout'], {
      queryParams: { planId: plan.id, billingCycle },
    });
  }

  private loadPlans(): void {
    this.gymSubscriptionService.listActivePlans().subscribe({
      next: (plans) => this.plans.set(plans.filter((plan) => plan.active)),
      error: (error: Error) => {
        this.planError.set(error.message);
        this.isLoadingPlans.set(false);
      },
      complete: () => this.isLoadingPlans.set(false),
    });
  }

  private loadCurrentSubscription(): void {
    this.gymSubscriptionService.getMine().subscribe({
      next: (subscription) => this.currentSubscription.set(subscription),
      error: (error: Error) => this.subscriptionError.set(error.message),
    });
  }
}
