import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import {
  CreateExerciseRequest,
  CreateWorkoutPlanRequest,
  ExerciseResponse,
  WorkoutPlanResponse,
} from '../../../models/workout.model';

/** Maps 1:1 to WorkoutController. tenantId is never sent from here - the backend derives it from the JWT. */
@Injectable({ providedIn: 'root' })
export class WorkoutService {
  constructor(private api: ApiService) {}

  // ── Exercise library ──
  createExercise(request: CreateExerciseRequest): Observable<ExerciseResponse> {
    return this.api.post<ExerciseResponse>(API_ENDPOINTS.WORKOUTS.EXERCISES, request);
  }

  listExercises(search?: string): Observable<ExerciseResponse[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.api.get<ExerciseResponse[]>(API_ENDPOINTS.WORKOUTS.EXERCISES, params);
  }

  deleteExercise(exerciseId: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.WORKOUTS.EXERCISE_BY_ID(exerciseId));
  }

  // ── Workout plans (no update endpoint on the backend - create, get, list, deactivate only) ──
  createPlan(request: CreateWorkoutPlanRequest): Observable<WorkoutPlanResponse> {
    return this.api.post<WorkoutPlanResponse>(API_ENDPOINTS.WORKOUTS.PLANS, request);
  }

  getPlan(planId: string): Observable<WorkoutPlanResponse> {
    return this.api.get<WorkoutPlanResponse>(API_ENDPOINTS.WORKOUTS.PLAN_BY_ID(planId));
  }

  getMemberPlans(memberId: string, page: number, size: number): Observable<PageResponse<WorkoutPlanResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.api.get<PageResponse<WorkoutPlanResponse>>(API_ENDPOINTS.WORKOUTS.MEMBER_PLANS(memberId), params);
  }

  deactivatePlan(planId: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.WORKOUTS.PLAN_BY_ID(planId));
  }
}
