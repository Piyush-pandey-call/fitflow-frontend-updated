import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import { CreateDietPlanRequest, DietPlanResponse, GenerateAiDietPlanRequest } from '../../../models/diet.model';

/** Maps 1:1 to DietController. tenantId is never sent from here - the backend derives it from the JWT. */
@Injectable({ providedIn: 'root' })
export class DietService {
  private api = inject(ApiService);

  createPlan(request: CreateDietPlanRequest): Observable<DietPlanResponse> {
    return this.api.post<DietPlanResponse>(API_ENDPOINTS.DIET.PLANS, request);
  }

  /** Gym owner/trainer: generate a real-time AI diet plan for a given member. */
  generateAiPlan(request: GenerateAiDietPlanRequest): Observable<DietPlanResponse> {
    return this.api.post<DietPlanResponse>(API_ENDPOINTS.DIET.AI_GENERATE, request);
  }

  /** Member self-service: generate a real-time AI diet plan for myself. */
  generateMyAiPlan(request: GenerateAiDietPlanRequest): Observable<DietPlanResponse> {
    return this.api.post<DietPlanResponse>(API_ENDPOINTS.DIET.AI_GENERATE_ME, request);
  }

  getPlan(planId: string): Observable<DietPlanResponse> {
    return this.api.get<DietPlanResponse>(API_ENDPOINTS.DIET.PLAN_BY_ID(planId));
  }

  getMemberPlans(memberId: string, page: number, size: number): Observable<PageResponse<DietPlanResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.api.get<PageResponse<DietPlanResponse>>(API_ENDPOINTS.DIET.MEMBER_PLANS(memberId), params);
  }

  deactivatePlan(planId: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.DIET.PLAN_BY_ID(planId));
  }

  downloadPdf(planId: string): Observable<Blob> {
    return this.api.getBlob(API_ENDPOINTS.DIET.PLAN_PDF(planId));
  }
}
