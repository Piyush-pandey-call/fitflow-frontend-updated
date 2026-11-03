import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PaymentStatus } from '../../../../enums/payment.enum';
import { PaymentResponse } from '../../../../models/payment.model';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './payment-detail.component.html',
  styleUrl: './payment-detail.component.css',
})
export class PaymentDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly Role = Role;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly payment = signal<PaymentResponse | null>(null);
  readonly PaymentStatus = PaymentStatus;
  readonly statusLabels = PAYMENT_STATUS_LABELS;
  readonly methodLabels = PAYMENT_METHOD_LABELS;

  readonly isDownloading = signal(false);
  readonly showRefundForm = signal(false);
  readonly isSubmittingRefund = signal(false);

  readonly refundForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  });

  private paymentId!: string;

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.paymentService.getById(this.paymentId).subscribe({
      next: (p) => {
        this.payment.set(p);
        this.refundForm.patchValue({ amount: p.amount });
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  get f() {
    return this.refundForm.controls;
  }

  downloadInvoice(): void {
    const p = this.payment();
    if (!p) return;
    this.isDownloading.set(true);
    this.paymentService.downloadInvoice(p.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${p.invoiceNumber || p.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isDownloading.set(false);
      },
    });
  }

  submitRefund(): void {
    if (this.refundForm.invalid) {
      this.refundForm.markAllAsTouched();
      return;
    }
    this.isSubmittingRefund.set(true);
    const raw = this.refundForm.getRawValue();
    this.paymentService.refund(this.paymentId, { amount: raw.amount!, reason: raw.reason! }).subscribe({
      next: (p) => {
        this.payment.set(p);
        this.isSubmittingRefund.set(false);
        this.showRefundForm.set(false);
      },
      error: (err: Error) => {
        this.isSubmittingRefund.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  }
}
