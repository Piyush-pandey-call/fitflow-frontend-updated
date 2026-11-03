import { BillingCycle } from '../enums/billing-cycle.enum';

export interface PlatformSubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number | null;
  maxMembers: number | null;
  maxTrainers: number | null;
  features: string[];
  active: boolean;
}

export interface GymSubscriptionResponse {
  id: string;
  gymId: string;
  gymName: string;
  planName: string;
  billingCycle: BillingCycle;
  status: 'PENDING_PAYMENT' | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface GymSubscriptionCheckoutRequest {
  planId: string;
  billingCycle: BillingCycle.MONTHLY | BillingCycle.YEARLY;
}

export interface GymSubscriptionCheckoutResponse {
  gymId: string;
  gymSubscriptionId: string;
  gymName: string;
  planName: string;
  billingCycle: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  razorpayKeyId: string;
  razorpayOrderId: string;
}

export interface VerifyGymSubscriptionPaymentRequest {
  gymSubscriptionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface GymSubscriptionPaymentConfirmation {
  gymId: string;
  gymSubscriptionId: string;
  gymName: string;
  planName: string;
  status: string;
  amountPaid: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}
