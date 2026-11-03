import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { BillingCycle } from '../../../../enums/billing-cycle.enum';
import {
  GymSubscriptionCheckoutResponse,
  GymSubscriptionPaymentConfirmation,
  PlatformSubscriptionPlan,
  VerifyGymSubscriptionPaymentRequest,
} from '../../../../models/gym-subscription.model';
import { GymSubscriptionService } from '../../services/gym-subscription.service';
import { RazorpayCheckoutResult, RazorpayCheckoutService } from '../../../payments/services/razorpay-checkout.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  readonly BillingCycle = BillingCycle;
  readonly plan = signal<PlatformSubscriptionPlan | null>(null);
  readonly cycle = signal<BillingCycle.MONTHLY | BillingCycle.YEARLY | null>(null);
  readonly checkoutOrder = signal<GymSubscriptionCheckoutResponse | null>(null);
  readonly pendingVerification = signal<{
    order: GymSubscriptionCheckoutResponse;
    result: RazorpayCheckoutResult;
  } | null>(null);
  readonly confirmation = signal<GymSubscriptionPaymentConfirmation | null>(null);
  readonly isLoading = signal(true);
  readonly isPaying = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly paymentError = signal<string | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly gymSubscriptionService: GymSubscriptionService,
    private readonly razorpayCheckout: RazorpayCheckoutService
  ) {}

  get selectedPrice(): number {
    const orderAmount = this.checkoutOrder()?.amount;
    if (orderAmount !== undefined) return orderAmount;
    const plan = this.plan();
    if (!plan) return 0;
    return this.cycle() === BillingCycle.YEARLY ? plan.yearlyPrice ?? 0 : plan.monthlyPrice;
  }

  ngOnInit(): void {
    const planId = this.route.snapshot.queryParamMap.get('planId');
    const cycle = this.route.snapshot.queryParamMap.get('billingCycle');
    if (!planId || (cycle !== BillingCycle.MONTHLY && cycle !== BillingCycle.YEARLY)) {
      this.errorMessage.set('Choose a plan and billing cycle before checking out.');
      this.isLoading.set(false);
      return;
    }
    this.cycle.set(cycle);
    void this.loadSelectedPlanAndOrder(planId, cycle);
  }

  private async loadSelectedPlanAndOrder(
    planId: string,
    cycle: BillingCycle.MONTHLY | BillingCycle.YEARLY
  ): Promise<void> {
    try {
      const plans = await firstValueFrom(this.gymSubscriptionService.listActivePlans());
      const selectedPlan = plans.find((candidate) => candidate.id === planId && candidate.active);
      if (!selectedPlan) {
        this.errorMessage.set('This plan is no longer available. Please choose an active plan.');
        return;
      }
      const price = cycle === BillingCycle.YEARLY ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
      if (price === null || price <= 0) {
        this.errorMessage.set('This plan is not available for the selected billing cycle.');
        return;
      }

      this.plan.set(selectedPlan);
      const order = await firstValueFrom(
        this.gymSubscriptionService.initiateCheckout({ planId, billingCycle: cycle })
      );
      this.checkoutOrder.set(order);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Could not prepare the checkout.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async proceedToPay(): Promise<void> {
    const order = this.checkoutOrder();
    if (!order || this.isPaying()) return;

    this.paymentError.set(null);
    this.isPaying.set(true);
    try {
      if (!this.pendingVerification()) {
        const user = this.authService.currentUser();
        const result = await this.razorpayCheckout.open(order, user?.fullName ?? order.gymName, {
          upiOnly: true,
          description: `${order.planName} FitFlow subscription`,
          email: user?.email,
        });
        this.pendingVerification.set({ order, result });
      }
      await this.verifyPendingPayment();
    } catch (error) {
      this.paymentError.set(
        error instanceof Error ? error.message : 'Payment could not be completed. Please try again.'
      );
    } finally {
      this.isPaying.set(false);
    }
  }

  private async verifyPendingPayment(): Promise<void> {
    const pending = this.pendingVerification();
    if (!pending) return;

    const verified = await firstValueFrom(
      this.gymSubscriptionService.verifyCheckout(this.toVerifyRequest(pending.order, pending.result))
    );
    if (verified.status !== 'ACTIVE') {
      throw new Error('Payment is not verified yet. Your subscription has not been activated.');
    }
    this.confirmation.set(verified);
    this.pendingVerification.set(null);
  }

  private toVerifyRequest(
    order: GymSubscriptionCheckoutResponse,
    result: RazorpayCheckoutResult
  ): VerifyGymSubscriptionPaymentRequest {
    return {
      gymSubscriptionId: order.gymSubscriptionId,
      razorpayOrderId: result.razorpay_order_id,
      razorpayPaymentId: result.razorpay_payment_id,
      razorpaySignature: result.razorpay_signature,
    };
  }
}
