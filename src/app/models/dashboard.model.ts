/** Mirrors com.fitflow.platform.modules.dashboard.dto.response.GymOwnerDashboardResponse */
export interface GymOwnerDashboardResponse {
  totalMembers: number;
  activeMemberships: number;
  revenueThisMonth: number; // BigDecimal -> number
  todaysAttendance: number;

  revenueAnalytics: ChartPoint[];
  attendanceAnalytics: ChartPoint[];
  membershipGrowth: ChartPoint[];

  recentActivities: RecentActivity[];

  membershipsExpiringThisWeek: number;
  pendingPaymentsCount: number;
  openSupportTicketsCount: number;
}

/** Mirrors the nested GymOwnerDashboardResponse.ChartPoint */
export interface ChartPoint {
  date: string; // LocalDate -> ISO string, e.g. "2026-07-01"
  value: number; // BigDecimal -> number
}

/** Mirrors the nested GymOwnerDashboardResponse.RecentActivity */
export interface RecentActivity {
  type: string; // e.g. NEW_MEMBER, PAYMENT_RECEIVED, MEMBERSHIP_RENEWED
  description: string;
  timestamp: string; // Instant -> ISO string
}

/** Mirrors com.fitflow.platform.modules.dashboard.dto.response.SuperAdminDashboardResponse */
export interface SuperAdminDashboardResponse {
  totalGyms: number;
  activeGyms: number;
  trialGyms: number;
  totalPlatformRevenue: number;
  activeSubscriptions: number;
  newGymsThisMonth: number;
  openSupportTickets: number;
  gymGrowth?: ChartPoint[];
  subscriptionRevenue?: ChartPoint[];
  recentGyms?: {name:string;ownerName:string;status:string;createdAt:string}[];
}

/**
 * Mirrors com.fitflow.platform.modules.dashboard.dto.response.MemberDashboardResponse -
 * everything the logged-in member's own dashboard shows in a single call:
 * profile, membership, attendance history, payments, workouts, diet plans, notifications.
 */
export interface MemberDashboardResponse {
  gymName?: string;
  gymType?: string;
  gymCity?: string;
  gymState?: string;
  member: import('./member.model').MemberResponse;
  currentMembership?: import('./membership.model').MemberMembershipResponse | null;
  membershipHistory: import('./common.model').PageResponse<import('./membership.model').MemberMembershipResponse>;
  attendance: import('./common.model').PageResponse<import('./attendance.model').AttendanceResponse>;
  payments: import('./common.model').PageResponse<import('./payment.model').PaymentResponse>;
  workouts: import('./common.model').PageResponse<import('./workout.model').WorkoutPlanResponse>;
  dietPlans: import('./common.model').PageResponse<import('./diet.model').DietPlanResponse>;
  notifications: import('./common.model').PageResponse<import('./notification.model').NotificationResponse>;
}
