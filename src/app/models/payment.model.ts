import { PaymentMethod, PaymentStatus } from '../enums/payment.enum';

/** Mirrors InitiatePaymentRequest - creates a Razorpay order for a PENDING_PAYMENT membership. */
export interface InitiatePaymentRequest {
  memberMembershipId: string;
}

/** Mirrors VerifyPaymentRequest - sent after Razorpay Checkout succeeds client-side. */
export interface VerifyPaymentRequest {
  paymentId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/** Mirrors RecordOfflinePaymentRequest */
export interface RecordOfflinePaymentRequest {
  memberMembershipId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

/** Mirrors RefundRequest */
export interface RefundRequest {
  amount: number;
  reason: string;
}

/** Mirrors RazorpayOrderResponse - everything needed to open Razorpay Checkout client-side. */
export interface RazorpayCheckoutOrder {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountInPaise: number;
  currency: string;
}

export interface RazorpayOrderResponse extends RazorpayCheckoutOrder {
  paymentId: string;
}

/** Mirrors PaymentResponse */
export interface PaymentResponse {
  id: string;
  memberId: string;
  memberName: string;
  memberMembershipId: string;
  amount: number;
  gstAmount?: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  createdAt: string;
}

/** Query params for GET /payments - mirrors PaymentController#listPayments exactly. */
export interface ListPaymentsQuery {
  status?: PaymentStatus;
  memberId?: string;
  page: number;
  size: number;
}
