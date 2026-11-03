import { AttendanceMethod } from '../enums/attendance-method.enum';

/** Mirrors ManualCheckInRequest record */
export interface ManualCheckInRequest {
  memberId: string;
}

/** Mirrors QrCheckInRequest record */
export interface QrCheckInRequest {
  qrCodeValue: string;
}

/** Mirrors AttendanceResponse */
export interface AttendanceResponse {
  id: string;
  memberId: string;
  memberName: string;
  memberProfileImageUrl?: string;
  attendanceDate: string; // LocalDate -> 'YYYY-MM-DD'
  checkInTime: string; // Instant -> ISO string
  checkOutTime?: string;
  method: AttendanceMethod;
}

/** Mirrors the nested AttendanceAnalyticsResponse.DailyPoint */
export interface AttendanceDailyPoint {
  date: string;
  count: number;
}

/** Mirrors AttendanceAnalyticsResponse */
export interface AttendanceAnalyticsResponse {
  todayCount: number;
  todayDistinctMembers: number;
  dailySeries: AttendanceDailyPoint[];
}

/** Query params for GET /attendance/daily */
export interface DailyAttendanceQuery {
  date?: string; // defaults server-side to today when omitted
  page: number;
  size: number;
}

/** Query params for GET /attendance/analytics - both required by the backend (no defaults). */
export interface AttendanceAnalyticsQuery {
  from: string;
  to: string;
}
