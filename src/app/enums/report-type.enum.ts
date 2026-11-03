/** Mirrors com.fitflow.platform.modules.report.entity.ReportType */
export enum ReportType {
  REVENUE = 'REVENUE',
  ATTENDANCE = 'ATTENDANCE',
  MEMBERSHIP = 'MEMBERSHIP',
  TRAINER = 'TRAINER',
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  [ReportType.REVENUE]: 'Revenue',
  [ReportType.ATTENDANCE]: 'Attendance',
  [ReportType.MEMBERSHIP]: 'Membership',
  [ReportType.TRAINER]: 'Trainer',
};

export const REPORT_TYPE_DESCRIPTIONS: Record<ReportType, string> = {
  [ReportType.REVENUE]: 'Payments received, grouped by date, method, and plan.',
  [ReportType.ATTENDANCE]: 'Check-ins and check-outs across all members.',
  [ReportType.MEMBERSHIP]: 'Active, expired, and pending-payment memberships by plan.',
  [ReportType.TRAINER]: 'Assigned member counts and status per trainer.',
};
