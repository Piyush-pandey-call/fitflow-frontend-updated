import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import { GymResponse, GymStatus } from '../../../models/gym.model';
import { MemberStatus, MemberSummaryResponse } from '../../../models/member.model';
import { TrainerResponse } from '../../../models/trainer.model';
import { TrainerStatus } from '../../../enums/trainer-status.enum';

/**
 * Maps 1:1 to GymController's SUPER_ADMIN-only endpoints - "see a list of all
 * gym owners, click one, see all their members and trainers". Every method
 * here requires SUPER_ADMIN on the backend regardless of frontend guards.
 */
@Injectable({ providedIn: 'root' })
export class GymAdminService {
  constructor(private api: ApiService) {}

  listAllGyms(status: GymStatus | null, page: number, size: number): Observable<PageResponse<GymResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) {
      params = params.set('status', status);
    }
    return this.api.get<PageResponse<GymResponse>>(API_ENDPOINTS.GYMS.BASE, params);
  }

  getGym(gymId: string): Observable<GymResponse> {
    return this.api.get<GymResponse>(API_ENDPOINTS.GYMS.BY_ID(gymId));
  }

  getGymMembers(
    gymId: string,
    status: MemberStatus | null,
    search: string,
    page: number,
    size: number
  ): Observable<PageResponse<MemberSummaryResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (search?.trim()) params = params.set('search', search.trim());
    return this.api.get<PageResponse<MemberSummaryResponse>>(API_ENDPOINTS.GYMS.MEMBERS(gymId), params);
  }

  getGymTrainers(
    gymId: string,
    status: TrainerStatus | null,
    page: number,
    size: number
  ): Observable<PageResponse<TrainerResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.api.get<PageResponse<TrainerResponse>>(API_ENDPOINTS.GYMS.TRAINERS(gymId), params);
  }

  listActiveSaasPlans(): Observable<{ id: string; name: string }[]> {
    return this.api.get<{ id: string; name: string }[]>(API_ENDPOINTS.GYMS.ACTIVE_PLANS);
  }

  /** Manual activation after you've confirmed the owner's payment (UPI/bank). SUPER_ADMIN only on the backend. */
  activatePlan(gymId: string, planId: string, billingCycle: 'MONTHLY' | 'HALF_YEARLY' | 'YEARLY'): Observable<unknown> {
    return this.api.post<unknown>(API_ENDPOINTS.GYMS.ACTIVATE_PLAN(gymId), { planId, billingCycle });
  }

  deleteGym(gymId: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.GYMS.BY_ID(gymId));
  }

  updateGymStatus(gymId: string, status: GymStatus): Observable<GymResponse> {
    return this.api.patch<GymResponse>(API_ENDPOINTS.GYMS.STATUS(gymId), { status });
  }
}
