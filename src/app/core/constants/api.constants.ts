/**
 * Single source of truth for backend endpoint paths.
 * Every path here is copied 1:1 from the Spring Boot @RequestMapping /
 * @PostMapping annotations in fitflow-backend, so the frontend never
 * drifts from the real API contract.
 *
 * Base URL (environment.apiUrl) already includes the server context-path
 * "/api" (see application.yml -> server.servlet.context-path), so paths
 * below start AFTER /api.
 *
 * We will keep appending sections here, module by module, as we build
 * the rest of the app (Members, Trainers, Attendance, ...).
 */
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER_GYM: '/auth/register-gym',
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  DASHBOARD: {
    // Matches DashboardController exactly.
    GYM_OWNER: '/dashboard/gym-owner',
    MEMBER: '/dashboard/member',
    SUPER_ADMIN: '/dashboard/super-admin',
  },
  MEMBERS: {
    BASE: '/members',
    BY_ID: (id: string) => `/members/${id}`,
    ME: '/members/me',
    PROFILE_IMAGE: (id: string) => `/members/${id}/profile-image`,
    STATUS: (id: string) => `/members/${id}/status`,
  },
  TRAINERS: {
    // Matches TrainerController exactly. Class-level @PreAuthorize is
    // hasRole('GYM_OWNER') for create/update/delete; get/list/assignable
    // additionally allow TRAINER.
    BASE: '/trainers',
    BY_ID: (id: string) => `/trainers/${id}`,
    ASSIGNABLE: '/trainers/assignable',
    PROFILE_IMAGE: (id: string) => `/trainers/${id}/profile-image`,
  },
  ATTENDANCE: {
    // Matches AttendanceController exactly.
    // - check-in/qr has NO @PreAuthorize on the backend (any authenticated role)
    // - check-in/manual, check-out, daily: GYM_OWNER + TRAINER
    // - member/{id} history: GYM_OWNER + TRAINER + MEMBER
    // - analytics: GYM_OWNER only
    CHECK_IN_QR: '/attendance/check-in/qr',
    CHECK_IN_MANUAL: '/attendance/check-in/manual',
    CHECK_IN_SELF: '/attendance/check-in/self',
    CHECK_OUT_SELF: '/attendance/check-out/self',
    CHECK_OUT: (attendanceId: string) => `/attendance/${attendanceId}/check-out`,
    MEMBER_HISTORY: (memberId: string) => `/attendance/member/${memberId}`,
    DAILY: '/attendance/daily',
    ANALYTICS: '/attendance/analytics',
  },
  MEMBERSHIP_PLANS: {
    // Matches MembershipPlanController exactly. Create/update/delete:
    // GYM_OWNER only. Get one: GYM_OWNER + TRAINER. List: + MEMBER too.
    BASE: '/membership-plans',
    BY_ID: (id: string) => `/membership-plans/${id}`,
    MEMBERS: (id: string) => `/membership-plans/${id}/members`,
  },
  MEMBER_MEMBERSHIPS: {
    // Matches MemberMembershipController exactly. Class-level @PreAuthorize is
    // hasAnyRole('GYM_OWNER','TRAINER'); assign/renew/cancel are further
    // restricted to GYM_OWNER only. history/current allow both.
    ASSIGN: '/member-memberships/assign',
    EXPIRING: '/member-memberships/expiring',
    RENEW: (memberId: string) => `/member-memberships/${memberId}/renew`,
    CANCEL: (membershipId: string) => `/member-memberships/${membershipId}`,
    HISTORY: (memberId: string) => `/member-memberships/member/${memberId}/history`,
    CURRENT: (memberId: string) => `/member-memberships/member/${memberId}/current`,
  },
  WORKOUTS: {
    // Matches WorkoutController exactly. Class-level @PreAuthorize is
    // hasAnyRole('GYM_OWNER','TRAINER'); listExercises/getPlan/getMemberPlans
    // are further relaxed to also allow MEMBER. There is NO update-plan
    // endpoint - only create, get, list-by-member, and deactivate (delete).
    EXERCISES: '/workouts/exercises',
    EXERCISE_BY_ID: (id: string) => `/workouts/exercises/${id}`,
    PLANS: '/workouts/plans',
    PLAN_BY_ID: (id: string) => `/workouts/plans/${id}`,
    MEMBER_PLANS: (memberId: string) => `/workouts/plans/member/${memberId}`,
  },
  DIET: {
    // Matches DietController exactly. Same shape as WORKOUTS: class-level
    // GYM_OWNER+TRAINER, get/list/pdf relaxed to also allow MEMBER, and NO
    // update endpoint - create, get, list-by-member, deactivate, PDF only.
    PLANS: '/diet/plans',
    AI_GENERATE: '/diet/plans/ai-generate',
    AI_GENERATE_ME: '/diet/plans/ai-generate/me',
    PLAN_BY_ID: (id: string) => `/diet/plans/${id}`,
    MEMBER_PLANS: (memberId: string) => `/diet/plans/member/${memberId}`,
    PLAN_PDF: (id: string) => `/diet/plans/${id}/pdf`,
  },
  PAYMENTS: {
    // Matches PaymentController exactly. initiate/offline: GYM_OWNER(+TRAINER
    // for initiate); verify: +MEMBER; get/list: GYM_OWNER+TRAINER; refund:
    // GYM_OWNER only; invoice PDF: all three. The Razorpay webhook endpoint
    // is server-to-server only and deliberately has no client method here.
    INITIATE: '/payments/initiate',
    VERIFY: '/payments/verify',
    OFFLINE: '/payments/offline',
    BY_ID: (id: string) => `/payments/${id}`,
    LIST: '/payments',
    REFUND: (id: string) => `/payments/${id}/refund`,
    INVOICE_PDF: (id: string) => `/payments/${id}/invoice/pdf`,
  },
  NOTIFICATIONS: {
    // Matches NotificationController exactly. This is a READ-ONLY audit log
    // - notifications are sent by backend jobs/events (welcome message,
    // expiry reminders, payment confirmations, birthday wishes), not
    // triggered from the frontend. There is no "mark as read" (no read/
    // unread concept exists) and no push-notification endpoint.
    LIST: '/notifications',
  },
  REPORTS: {
    // Matches ReportController exactly (GYM_OWNER only). Pure export
    // endpoints - no JSON preview data, just Excel/PDF file downloads.
    EXCEL: (type: string) => `/reports/${type}/excel`,
    PDF: (type: string) => `/reports/${type}/pdf`,
  },
  GYMS: {
    // Matches GymController exactly. BASE/BY_ID/MEMBERS/TRAINERS are
    // SUPER_ADMIN only - the "click a gym, see everything in it" admin view.
    // ME / updateMyGym / logo are the GYM_OWNER self-service settings.
    BASE: '/gyms',
    BY_ID: (gymId: string) => `/gyms/${gymId}`,
    MEMBERS: (gymId: string) => `/gyms/${gymId}/members`,
    TRAINERS: (gymId: string) => `/gyms/${gymId}/trainers`,
    STATUS: (gymId: string) => `/gyms/${gymId}/status`,
    ACTIVATE_PLAN: (gymId: string) => `/gym-subscriptions/gyms/${gymId}/assign`,
    ACTIVE_PLANS: '/subscription-plans/active',
    ME: '/gyms/me',
    LOGO: '/gyms/me/logo',
  },
  GYM_SUBSCRIPTIONS: {
    MINE: '/gym-subscriptions/mine',
    CHECKOUT: '/gym-subscriptions/checkout',
    VERIFY_CHECKOUT: '/gym-subscriptions/checkout/verify',
  },
  USERS: {
    // Matches UserProfileController. There is no update-profile,
    // preferences, or theme/language endpoint on the backend. Change
    // password already exists as /auth/change-password (see Module 1's
    // AuthService), reused here rather than duplicated.
    ME: '/users/me',
    PROFILE_IMAGE: '/users/me/profile-image',
  },
  SUPPORT_TICKETS: {
    // Matches SupportTicketController exactly. create/mine: GYM_OWNER+TRAINER.
    // list-all: SUPER_ADMIN only. get: all three roles (gym roles restricted
    // to their own gym's tickets server-side). update: SUPER_ADMIN only.
    CREATE: '/support-tickets',
    MINE: '/support-tickets/mine',
    ALL: '/support-tickets',
    BY_ID: (id: string) => `/support-tickets/${id}`,
  },
} as const;

/** Endpoints the backend's SecurityConfig marks as PUBLIC_ENDPOINTS (no JWT required). */
export const PUBLIC_ENDPOINTS: string[] = [
  API_ENDPOINTS.AUTH.REGISTER_GYM,
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REFRESH_TOKEN,
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
  API_ENDPOINTS.AUTH.RESET_PASSWORD,
  API_ENDPOINTS.AUTH.VERIFY_EMAIL,
];
