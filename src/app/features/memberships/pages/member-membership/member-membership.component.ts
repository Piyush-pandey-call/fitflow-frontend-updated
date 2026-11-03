import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MemberMembershipService } from '../../services/member-membership.service';
import { MembershipPlanService } from '../../services/membership-plan.service';
import { MemberService } from '../../../members/services/member.service';
import { PaymentService } from '../../../payments/services/payment.service';
import { RazorpayCheckoutService } from '../../../payments/services/razorpay-checkout.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { MEMBER_MEMBERSHIP_STATUS_LABELS, MemberMembershipStatus } from '../../../../enums/member-membership-status.enum';
import { PAYMENT_METHOD_LABELS, PaymentMethod } from '../../../../enums/payment.enum';
import { MemberMembershipResponse, MembershipPlanResponse } from '../../../../models/membership.model';
import { MemberResponse } from '../../../../models/member.model';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-member-membership',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './member-membership.component.html',
  styleUrl: './member-membership.component.css',
})
export class MemberMembershipComponent implements OnInit {
  readonly member = signal<MemberResponse | null>(null);
  readonly current = signal<MemberMembershipResponse | null>(null);
  readonly hasCurrent = signal(false); // distinguishes "no membership yet" from "still loading"
  readonly plans = signal<MembershipPlanResponse[]>([]);

  readonly historyPage = signal<PageResponse<MemberMembershipResponse> | null>(null);
  private pageNumber = 0;
  private readonly pageSize = 10;

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly Role = Role;
  readonly statusLabels = MEMBER_MEMBERSHIP_STATUS_LABELS;
  readonly MemberMembershipStatus = MemberMembershipStatus;

  // Assign/renew form state
  readonly showAssignForm = signal(false);
  selectedPlanId = '';
  autoRenew = false;
  readonly isSubmittingAssign = signal(false);

  readonly showCancelConfirm = signal(false);
  readonly isCancelling = signal(false);

  // Payment flow for a PENDING_PAYMENT membership
  readonly isPaying = signal(false);
  readonly paymentError = signal<string | null>(null);
  readonly showOfflineForm = signal(false);
  readonly isSubmittingOffline = signal(false);
  offlineAmount: number | null = null;
  offlineMethod: PaymentMethod = PaymentMethod.CASH;
  offlineNotes = '';
  readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;
  readonly offlineMethodOptions = [PaymentMethod.CASH, PaymentMethod.BANK_TRANSFER, PaymentMethod.OTHER];

  private memberId!: string;

  constructor(
    private memberMembershipService: MemberMembershipService,
    private membershipPlanService: MembershipPlanService,
    private memberService: MemberService,
    private paymentService: PaymentService,
    private razorpayCheckout: RazorpayCheckoutService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('memberId')!;
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.memberService.getById(this.memberId).subscribe({ next: (m) => this.member.set(m) });
    this.membershipPlanService.list(true).subscribe({ next: (p) => this.plans.set(p) });
    this.loadCurrent();
    this.loadHistory();
  }

  private loadCurrent(): void {
    this.memberMembershipService.getCurrent(this.memberId).subscribe({
      next: (m) => {
        this.current.set(m);
        this.hasCurrent.set(true);
        this.isLoading.set(false);
      },
      error: () => {
        // Backend returns a 404-style ResourceNotFoundException when there's no active
        // membership - that's a normal, expected state here, not a real error.
        this.current.set(null);
        this.hasCurrent.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private loadHistory(): void {
    this.memberMembershipService.getHistory(this.memberId, this.pageNumber, this.pageSize).subscribe({
      next: (res) => this.historyPage.set(res),
      error: (err: Error) => this.errorMessage.set(err.message),
    });
  }

  onHistoryPageChange(page: number): void {
    this.pageNumber = page;
    this.loadHistory();
  }

  openAssignForm(): void {
    this.selectedPlanId = this.plans()[0]?.id ?? '';
    this.autoRenew = false;
    this.showAssignForm.set(true);
  }

  submitAssignOrRenew(): void {
    if (!this.selectedPlanId) return;

    this.isSubmittingAssign.set(true);
    this.errorMessage.set(null);

    // If there's already a membership (active, expired, or cancelled), this is a renewal;
    // otherwise it's a first-time assignment. Both endpoints create a PENDING_PAYMENT row.
    const request$ = this.hasCurrent() && this.current()
      ? this.memberMembershipService.renew(this.memberId, this.selectedPlanId, this.autoRenew)
      : this.memberMembershipService.assign({ memberId: this.memberId, planId: this.selectedPlanId, autoRenew: this.autoRenew });

    request$.subscribe({
      next: () => {
        this.isSubmittingAssign.set(false);
        this.showAssignForm.set(false);
        this.loadCurrent();
        this.loadHistory();
      },
      error: (err: Error) => {
        this.isSubmittingAssign.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  confirmCancel(): void {
    const membership = this.current();
    if (!membership) return;

    this.isCancelling.set(true);
    this.memberMembershipService.cancel(membership.id).subscribe({
      next: () => {
        this.isCancelling.set(false);
        this.showCancelConfirm.set(false);
        this.loadCurrent();
        this.loadHistory();
      },
      error: (err: Error) => {
        this.isCancelling.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  /** Opens Razorpay Checkout for the current PENDING_PAYMENT membership, then verifies on success. */
  payNow(): void {
    const membership = this.current();
    const memberName = this.member()?.fullName ?? '';
    if (!membership) return;

    this.isPaying.set(true);
    this.paymentError.set(null);

    this.paymentService.initiate({ memberMembershipId: membership.id }).subscribe({
      next: async (order) => {
        try {
          const result = await this.razorpayCheckout.open(order, memberName);
          this.paymentService
            .verify({
              paymentId: order.paymentId,
              razorpayPaymentId: result.razorpay_payment_id,
              razorpaySignature: result.razorpay_signature,
            })
            .subscribe({
              next: () => {
                this.isPaying.set(false);
                this.loadCurrent();
                this.loadHistory();
              },
              error: (err: Error) => {
                this.isPaying.set(false);
                this.paymentError.set(err.message);
              },
            });
        } catch (err) {
          // Person closed the Razorpay popup without paying - not a real error.
          this.isPaying.set(false);
          this.paymentError.set(err instanceof Error ? err.message : 'Payment was not completed.');
        }
      },
      error: (err: Error) => {
        this.isPaying.set(false);
        this.paymentError.set(err.message);
      },
    });
  }

  openOfflineForm(): void {
    const plan = this.plans().find((p) => p.id === this.current()?.planId);
    this.offlineAmount = plan?.price ?? null;
    this.offlineMethod = PaymentMethod.CASH;
    this.offlineNotes = '';
    this.showOfflineForm.set(true);
  }

  submitOfflinePayment(): void {
    const membership = this.current();
    if (!membership || !this.offlineAmount) return;

    this.isSubmittingOffline.set(true);
    this.paymentError.set(null);

    this.paymentService
      .recordOffline({
        memberMembershipId: membership.id,
        amount: this.offlineAmount,
        method: this.offlineMethod,
        notes: this.offlineNotes || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmittingOffline.set(false);
          this.showOfflineForm.set(false);
          this.loadCurrent();
          this.loadHistory();
        },
        error: (err: Error) => {
          this.isSubmittingOffline.set(false);
          this.paymentError.set(err.message);
        },
      });
  }

  statusTone(status: MemberMembershipStatus): string {
    switch (status) {
      case MemberMembershipStatus.ACTIVE:
        return 'badge-success';
      case MemberMembershipStatus.PENDING_PAYMENT:
        return 'badge-warning';
      case MemberMembershipStatus.EXPIRED:
      case MemberMembershipStatus.CANCELLED:
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      price
    );
  }
}
