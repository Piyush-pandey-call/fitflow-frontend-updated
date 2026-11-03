import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import {
  CreateTrainerRequest,
  ListTrainersQuery,
  TrainerResponse,
  UpdateTrainerRequest,
} from '../../../models/trainer.model';

/** Maps 1:1 to TrainerController. tenantId is never sent from here - the backend derives it from the JWT. */
@Injectable({ providedIn: 'root' })
export class TrainerService {
  constructor(private api: ApiService) {}

  list(query: ListTrainersQuery): Observable<PageResponse<TrainerResponse>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.status) {
      params = params.set('status', query.status);
    }
    return this.api.get<PageResponse<TrainerResponse>>(API_ENDPOINTS.TRAINERS.BASE, params);
  }

  getById(trainerId: string): Observable<TrainerResponse> {
    return this.api.get<TrainerResponse>(API_ENDPOINTS.TRAINERS.BY_ID(trainerId));
  }

  create(request: CreateTrainerRequest): Observable<TrainerResponse> {
    return this.api.post<TrainerResponse>(API_ENDPOINTS.TRAINERS.BASE, request);
  }

  update(trainerId: string, request: UpdateTrainerRequest): Observable<TrainerResponse> {
    return this.api.put<TrainerResponse>(API_ENDPOINTS.TRAINERS.BY_ID(trainerId), request);
  }

  delete(trainerId: string): Observable<void> {
    // Backend @PreAuthorize restricts the whole controller (except get/list/assignable) to
    // GYM_OWNER - the UI also hides the delete button for anyone else, server is the real gatekeeper.
    return this.api.delete<void>(API_ENDPOINTS.TRAINERS.BY_ID(trainerId));
  }

  uploadProfileImage(trainerId: string, file: File): Observable<TrainerResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData<TrainerResponse>(API_ENDPOINTS.TRAINERS.PROFILE_IMAGE(trainerId), formData);
  }

  /** Lightweight, unpaginated - used by the Member form's "Assigned Trainer" dropdown (Module 3). */
  listAssignable(): Observable<TrainerResponse[]> {
    return this.api.get<TrainerResponse[]>(API_ENDPOINTS.TRAINERS.ASSIGNABLE);
  }
}
