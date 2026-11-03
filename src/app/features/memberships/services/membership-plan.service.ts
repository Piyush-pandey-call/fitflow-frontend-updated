import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import {
  CreateMembershipPlanRequest,
  MemberMembershipResponse,
  MembershipPlanResponse,
  UpdateMembershipPlanRequest,
} from '../../../models/membership.model';

@Injectable({ providedIn: 'root' })
export class MembershipPlanService {
  constructor(private api: ApiService) {}

  list(activeOnly = true): Observable<MembershipPlanResponse[]> {
    const params = new HttpParams().set('activeOnly', activeOnly);
    return this.api.get<MembershipPlanResponse[]>(API_ENDPOINTS.MEMBERSHIP_PLANS.BASE, params);
  }

  getById(planId: string): Observable<MembershipPlanResponse> {
    return this.api.get<MembershipPlanResponse>(API_ENDPOINTS.MEMBERSHIP_PLANS.BY_ID(planId));
  }

  /** Gym owner/trainer: every member (current + past) who has ever been on this plan. */
  getMembers(planId: string, page: number, size: number): Observable<PageResponse<MemberMembershipResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.api.get<PageResponse<MemberMembershipResponse>>(API_ENDPOINTS.MEMBERSHIP_PLANS.MEMBERS(planId), params);
  }

  create(request: CreateMembershipPlanRequest): Observable<MembershipPlanResponse> {
    return this.api.post<MembershipPlanResponse>(API_ENDPOINTS.MEMBERSHIP_PLANS.BASE, request);
  }

  update(planId: string, request: UpdateMembershipPlanRequest): Observable<MembershipPlanResponse> {
    return this.api.put<MembershipPlanResponse>(API_ENDPOINTS.MEMBERSHIP_PLANS.BY_ID(planId), request);
  }

  delete(planId: string): Observable<void> {
    // Backend rejects this with a conflict error if the plan still has active subscribers.
    return this.api.delete<void>(API_ENDPOINTS.MEMBERSHIP_PLANS.BY_ID(planId));
  }
}
