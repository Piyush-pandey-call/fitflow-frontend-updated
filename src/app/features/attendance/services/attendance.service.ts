import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import {
  AttendanceAnalyticsQuery,
  AttendanceAnalyticsResponse,
  AttendanceResponse,
  DailyAttendanceQuery,
} from '../../../models/attendance.model';

/** Maps 1:1 to AttendanceController. tenantId is never sent from here - the backend derives it from the JWT. */
@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private api: ApiService) {}

  checkInByQr(qrCodeValue: string): Observable<AttendanceResponse> {
    return this.api.post<AttendanceResponse>(API_ENDPOINTS.ATTENDANCE.CHECK_IN_QR, { qrCodeValue });
  }

  checkInManually(memberId: string): Observable<AttendanceResponse> {
    return this.api.post<AttendanceResponse>(API_ENDPOINTS.ATTENDANCE.CHECK_IN_MANUAL, { memberId });
  }

  /** Member self-service: check myself in (POST /attendance/check-in/self, role MEMBER only). */
  /** Member self-service: check myself out (POST /attendance/check-out/self, role MEMBER only). */
  checkOutSelf(): Observable<AttendanceResponse> {
    return this.api.post<AttendanceResponse>(API_ENDPOINTS.ATTENDANCE.CHECK_OUT_SELF, {});
  }

  checkInSelf(): Observable<AttendanceResponse> {
    return this.api.post<AttendanceResponse>(API_ENDPOINTS.ATTENDANCE.CHECK_IN_SELF, {});
  }

  checkOut(attendanceId: string): Observable<AttendanceResponse> {
    return this.api.patch<AttendanceResponse>(API_ENDPOINTS.ATTENDANCE.CHECK_OUT(attendanceId));
  }

  getMemberHistory(memberId: string, page: number, size: number): Observable<PageResponse<AttendanceResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.api.get<PageResponse<AttendanceResponse>>(API_ENDPOINTS.ATTENDANCE.MEMBER_HISTORY(memberId), params);
  }

  getDaily(query: DailyAttendanceQuery): Observable<PageResponse<AttendanceResponse>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.date) {
      params = params.set('date', query.date);
    }
    return this.api.get<PageResponse<AttendanceResponse>>(API_ENDPOINTS.ATTENDANCE.DAILY, params);
  }

  getAnalytics(query: AttendanceAnalyticsQuery): Observable<AttendanceAnalyticsResponse> {
    const params = new HttpParams().set('from', query.from).set('to', query.to);
    return this.api.get<AttendanceAnalyticsResponse>(API_ENDPOINTS.ATTENDANCE.ANALYTICS, params);
  }
}
