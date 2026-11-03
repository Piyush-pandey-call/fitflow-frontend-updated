import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { gymDateString } from '../../../../core/utils/date.util';
import { DashboardService } from '../../services/dashboard.service';
import { AttendanceService } from '../../../attendance/services/attendance.service';
import { DietService } from '../../../diet/services/diet.service';
import { MemberMembershipService } from '../../../memberships/services/member-membership.service';
import { MembershipPlanService } from '../../../memberships/services/membership-plan.service';
import { PaymentService } from '../../../payments/services/payment.service';
import { MemberDashboardResponse } from '../../../../models/dashboard.model';
import { DietPlanResponse, GenerateAiDietPlanRequest } from '../../../../models/diet.model';
import { MembershipPlanResponse } from '../../../../models/membership.model';
import { MemberMembershipStatus, MEMBER_MEMBERSHIP_STATUS_LABELS } from '../../../../enums/member-membership-status.enum';
import { GYM_TYPE_LABELS, GymType } from '../../../../enums/role.enum';
import { BILLING_CYCLE_LABELS, BillingCycle } from '../../../../enums/billing-cycle.enum';
import { ATTENDANCE_METHOD_LABELS, AttendanceMethod } from '../../../../enums/attendance-method.enum';
import { PAYMENT_METHOD_LABELS, PaymentMethod, PAYMENT_STATUS_LABELS, PaymentStatus } from '../../../../enums/payment.enum';
import { MemberStatus, MEMBER_STATUS_LABELS } from '../../../../models/member.model';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

/**
 * The MEMBER-role home page. Distinct visual identity from the gym-owner
 * dashboard (see .css - emerald/teal theme instead of indigo, a hero banner
 * naming the member's gym) but functionally equivalent in spirit: everything
 * a member needs lives on this one page, backed entirely by the single
 * GET /dashboard/member aggregate call plus a handful of self-service actions
 * (check in, generate an AI diet plan, renew membership) that only touch
 * endpoints a MEMBER is actually allowed to call.
 */
@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatsCardComponent, EmptyStateComponent],
  templateUrl: './member-dashboard.component.html',
  styleUrl: './member-dashboard.component.css',
})
export class MemberDashboardComponent implements OnInit {
  private route=inject(ActivatedRoute);
  readonly section=signal('home');
  private dashboardService = inject(DashboardService);
  private attendanceService = inject(AttendanceService);
  private dietService = inject(DietService);
  private memberMembershipService = inject(MemberMembershipService);
  private membershipPlanService = inject(MembershipPlanService);
  private paymentService = inject(PaymentService);

  readonly membershipStatusLabels = MEMBER_MEMBERSHIP_STATUS_LABELS;
  readonly billingCycleLabels = BILLING_CYCLE_LABELS;
  readonly attendanceMethodLabels = ATTENDANCE_METHOD_LABELS;
  readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;
  readonly paymentStatusLabels = PAYMENT_STATUS_LABELS;

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly dashboard = signal<MemberDashboardResponse | null>(null);

  // ---- Check-in ----
  readonly isCheckingIn = signal(false);
  readonly checkInMessage = signal<string | null>(null);
  readonly checkInError = signal<string | null>(null);

  /** Today's attendance row (one per member per day), using India's calendar date, not UTC. */
  readonly todaysRecord = computed(() => {
    const today = gymDateString();
    return (this.dashboard()?.attendance.content ?? []).find((a) => a.attendanceDate === today) ?? null;
  });
  readonly checkedInToday = computed(() => !!this.todaysRecord());
  readonly checkedOutToday = computed(() => !!this.todaysRecord()?.checkOutTime);

  // ---- Renew membership ----
  readonly showRenewPanel = signal(false);
  readonly availablePlans = signal<MembershipPlanResponse[]>([]);
  readonly selectedPlanId = signal('');
  readonly autoRenew = signal(false);
  readonly isRenewing = signal(false);
  readonly renewError = signal<string | null>(null);

  // ---- AI diet plan generator ----
  readonly showAiPanel = signal(false);
  readonly aiDietType = signal('');
  readonly aiCuisine = signal('');
  readonly aiAllergies = signal('');
  readonly aiMealsPerDay = signal<number | null>(null);
  readonly aiTargetCalories = signal<number | null>(null);
  readonly aiNotes = signal('');
  readonly isGeneratingAiPlan = signal(false);
  readonly aiError = signal<string | null>(null);
  readonly aiResult = signal<DietPlanResponse | null>(null);

  // ---- Invoice download ----
  readonly downloadingInvoiceId = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(p=>this.section.set(p.get("section") || "home"));
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dashboardService.getMemberDashboard().subscribe({
      next: (res) => {
        this.dashboard.set(res);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  checkIn(): void {
    this.isCheckingIn.set(true);
    this.checkInMessage.set(null);
    this.checkInError.set(null);
    this.attendanceService.checkInSelf().subscribe({
      next: () => {
        this.isCheckingIn.set(false);
        this.checkInMessage.set("You're checked in. Have a great workout! 💪");
        this.load();
      },
      error: (err: Error) => {
        this.isCheckingIn.set(false);
        this.checkInError.set(err.message);
      },
    });
  }

  checkOut(): void {
    this.isCheckingIn.set(true);
    this.checkInMessage.set(null);
    this.checkInError.set(null);
    this.attendanceService.checkOutSelf().subscribe({
      next: () => {
        this.isCheckingIn.set(false);
        this.checkInMessage.set('You are checked out. Great work today! 👏');
        this.load();
      },
      error: (err: Error) => {
        this.isCheckingIn.set(false);
        this.checkInError.set(err.message);
      },
    });
  }

  openRenewPanel(): void {
    this.showRenewPanel.set(true);
    this.renewError.set(null);
    if (this.availablePlans().length === 0) {
      this.membershipPlanService.list(true).subscribe({
        next: (plans) => this.availablePlans.set(plans),
        error: () => this.availablePlans.set([]),
      });
    }
  }

  submitRenew(): void {
    const memberId = this.dashboard()?.member.id;
    const planId = this.selectedPlanId();
    if (!memberId || !planId) {
      this.renewError.set('Please choose a plan.');
      return;
    }
    this.isRenewing.set(true);
    this.renewError.set(null);
    this.memberMembershipService.renew(memberId, planId, this.autoRenew()).subscribe({
      next: () => {
        this.isRenewing.set(false);
        this.showRenewPanel.set(false);
        this.load();
      },
      error: (err: Error) => {
        this.isRenewing.set(false);
        this.renewError.set(err.message);
      },
    });
  }

  toggleAiPanel(): void {
    this.showAiPanel.update((v) => !v);
    this.aiError.set(null);
  }

  generateAiPlan(): void {
    this.isGeneratingAiPlan.set(true);
    this.aiError.set(null);
    this.aiResult.set(null);

    const request: GenerateAiDietPlanRequest = {
      dietType: this.aiDietType() || undefined,
      cuisinePreference: this.aiCuisine() || undefined,
      allergiesOrRestrictions: this.aiAllergies() || undefined,
      mealsPerDay: this.aiMealsPerDay() ?? undefined,
      targetCalories: this.aiTargetCalories() ?? undefined,
      additionalNotes: this.aiNotes() || undefined,
      save: true,
    };

    this.dietService.generateMyAiPlan(request).subscribe({
      next: (plan) => {
        this.isGeneratingAiPlan.set(false);
        this.aiResult.set(plan);
        this.load(); // refresh so the new plan shows up in the Diet Plans list too
      },
      error: (err: Error) => {
        this.isGeneratingAiPlan.set(false);
        this.aiError.set(err.message);
      },
    });
  }

  downloadInvoice(paymentId: string, invoiceNumber?: string): void {
    this.downloadingInvoiceId.set(paymentId);
    this.paymentService.downloadInvoice(paymentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceNumber || paymentId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingInvoiceId.set(null);
      },
      error: () => this.downloadingInvoiceId.set(null),
    });
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' });
  }

  formatDateTime(value?: string): string {
    if (!value) return '—';
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }

  daysUntil(dateStr?: string): number | null {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }

  gymTypeLabel(value?: string | null): string {
    if (!value) return '';
    return GYM_TYPE_LABELS[value as GymType] ?? value;
  }

  /** conic-gradient donut slices for protein/carbs/fat, mirroring the reference video's macro ring. */
  macroDonutStyle(plan: { dailyProteinGrams?: number; dailyCarbsGrams?: number; dailyFatGrams?: number }): string {
    const p = plan.dailyProteinGrams || 0;
    const c = plan.dailyCarbsGrams || 0;
    const f = plan.dailyFatGrams || 0;
    const total = p + c + f || 1;
    const pPct = (p / total) * 100;
    const cPct = (c / total) * 100;
    return `conic-gradient(#ef4444 0% ${pPct}%, #22d3ee ${pPct}% ${pPct + cPct}%, #f59e0b ${pPct + cPct}% 100%)`;
  }
}
