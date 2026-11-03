import { BillingCycle } from '../enums/billing-cycle.enum';
import { MemberMembershipStatus } from '../enums/member-membership-status.enum';

/** Mirrors CreateMembershipPlanRequest record */
export interface CreateMembershipPlanRequest {
  name: string;
  description?: string;
  billingCycle: BillingCycle;
  price: number;
  gstPercentage?: number;
  maxMembers?: number;
  includesPersonalTraining: boolean;
}

/** Mirrors UpdateMembershipPlanRequest record - same as Create, plus `active`. */
export interface UpdateMembershipPlanRequest extends CreateMembershipPlanRequest {
  active: boolean;
}

/** Mirrors MembershipPlanResponse */
export interface MembershipPlanResponse {
  id: string;
  name: string;
  description?: string;
  billingCycle: BillingCycle;
  price: number;
  gstPercentage?: number;
  active: boolean;
  maxMembers?: number;
  includesPersonalTraining: boolean;
  activeSubscriberCount: number;
}

/**
 * Mirrors AssignMembershipRequest record.
 * NOTE: assigning creates a PENDING_PAYMENT subscription, not an ACTIVE one -
 * it only becomes ACTIVE once a successful Payment is recorded against it
 * (Module 9, not built yet). Don't show it as "active" right after assigning.
 */
export interface AssignMembershipRequest {
  memberId: string;
  planId: string;
  autoRenew: boolean;
}

/** Mirrors RenewMembershipRequest record - same PENDING_PAYMENT caveat as above. */
export interface RenewMembershipRequest {
  planId: string;
  autoRenew: boolean;
}

/** Mirrors MemberMembershipResponse */
export interface MemberMembershipResponse {
  id: string;
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  pricePaid: number;
  status: MemberMembershipStatus;
  autoRenew: boolean;
}
