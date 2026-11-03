/** Mirrors com.fitflow.platform.modules.membership.entity.BillingCycle */
export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY',
}

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  [BillingCycle.MONTHLY]: 'Monthly',
  [BillingCycle.QUARTERLY]: 'Quarterly (3 months)',
  [BillingCycle.HALF_YEARLY]: 'Half-Yearly (6 months)',
  [BillingCycle.YEARLY]: 'Yearly (12 months)',
};
