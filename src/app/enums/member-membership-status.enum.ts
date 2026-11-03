/** Mirrors com.fitflow.platform.modules.membership.entity.MemberMembershipStatus */
export enum MemberMembershipStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
}

export const MEMBER_MEMBERSHIP_STATUS_LABELS: Record<MemberMembershipStatus, string> = {
  [MemberMembershipStatus.ACTIVE]: 'Active',
  [MemberMembershipStatus.EXPIRED]: 'Expired',
  [MemberMembershipStatus.CANCELLED]: 'Cancelled',
  [MemberMembershipStatus.PENDING_PAYMENT]: 'Pending Payment',
};
