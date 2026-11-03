/** Mirrors com.fitflow.platform.modules.payment.entity.PaymentStatus */
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.SUCCESS]: 'Success',
  [PaymentStatus.FAILED]: 'Failed',
  [PaymentStatus.REFUNDED]: 'Refunded',
  [PaymentStatus.PARTIALLY_REFUNDED]: 'Partially Refunded',
};

/** Mirrors com.fitflow.platform.modules.payment.entity.PaymentMethod */
export enum PaymentMethod {
  RAZORPAY = 'RAZORPAY',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  OTHER = 'OTHER',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.RAZORPAY]: 'Razorpay (Online)',
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
  [PaymentMethod.OTHER]: 'Other',
};
