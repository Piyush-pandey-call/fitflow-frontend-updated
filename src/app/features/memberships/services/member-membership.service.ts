import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import { AssignMembershipRequest, MemberMembershipResponse } from '../../../models/membership.model';

@Injectable({ providedIn: 'root' })
export class MemberMembershipService {
  constructor(private api: ApiService) {}

  /** ACTIVE memberships ending within `days` days, soonest first - the renewal follow-up list. */
  getExpiring(days: number, page: number, size: number): Observable<PageResponse<MemberMembershipResponse>> {
    const params = new HttpParams().set('days', days).set('page', page).set('size', size);
    return this.api.get<PageResponse<MemberMembershipResponse>>(API_ENDPOINTS.MEMBER_MEMBERSHIPS.EXPIRING, params);
  }

  assign(request: AssignMembershipRequest): Observable<MemberMembershipResponse> {
    return this.api.post<MemberMembershipResponse>(API_ENDPOINTS.MEMBER_MEMBERSHIPS.ASSIGN, request);
  }

  renew(memberId: string, planId: string, autoRenew: boolean): Observable<MemberMembershipResponse> {
    return this.api.post<MemberMembershipResponse>(API_ENDPOINTS.MEMBER_MEMBERSHIPS.RENEW(memberId), {
      planId,
      autoRenew,
    });
  }

  cancel(membershipId: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.MEMBER_MEMBERSHIPS.CANCEL(membershipId));
  }

  getHistory(memberId: string, page: number, size: number): Observable<PageResponse<MemberMembershipResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.api.get<PageResponse<MemberMembershipResponse>>(
      API_ENDPOINTS.MEMBER_MEMBERSHIPS.HISTORY(memberId),
      params
    );
  }

  /** Returns null (not an error) when the member has no current membership - see component for handling. */
  getCurrent(memberId: string): Observable<MemberMembershipResponse> {
    return this.api.get<MemberMembershipResponse>(API_ENDPOINTS.MEMBER_MEMBERSHIPS.CURRENT(memberId));
  }
}
