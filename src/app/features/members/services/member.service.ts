import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import {
  CreateMemberRequest,
  MemberListQuery,
  MemberResponse,
  MemberSummaryResponse,
  UpdateMemberRequest,
  UpdateMemberStatusRequest,
} from '../../../models/member.model';

/** Maps 1:1 to MemberController. tenantId is never sent from here - the backend derives it from the JWT. */
@Injectable({ providedIn: 'root' })
export class MemberService {
  constructor(private api: ApiService) {}

  list(query: MemberListQuery): Observable<PageResponse<MemberSummaryResponse>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('size', query.size)
      .set('sortBy', query.sortBy)
      .set('sortDirection', query.sortDirection);

    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    return this.api.get<PageResponse<MemberSummaryResponse>>(API_ENDPOINTS.MEMBERS.BASE, params);
  }

  getById(memberId: string): Observable<MemberResponse> {
    return this.api.get<MemberResponse>(API_ENDPOINTS.MEMBERS.BY_ID(memberId));
  }

  /** Member self-service: get my own profile (GET /members/me, role MEMBER only). */
  getMe(): Observable<MemberResponse> {
    return this.api.get<MemberResponse>(API_ENDPOINTS.MEMBERS.ME);
  }

  create(request: CreateMemberRequest): Observable<MemberResponse> {
    return this.api.post<MemberResponse>(API_ENDPOINTS.MEMBERS.BASE, request);
  }

  update(memberId: string, request: UpdateMemberRequest): Observable<MemberResponse> {
    return this.api.put<MemberResponse>(API_ENDPOINTS.MEMBERS.BY_ID(memberId), request);
  }

  delete(memberId: string): Observable<void> {
    // Backend @PreAuthorize restricts this to GYM_OWNER - the UI also hides
    // the delete button for TRAINER, but the server is the real gatekeeper.
    return this.api.delete<void>(API_ENDPOINTS.MEMBERS.BY_ID(memberId));
  }

  updateStatus(memberId: string, request: UpdateMemberStatusRequest): Observable<MemberResponse> {
    return this.api.patch<MemberResponse>(API_ENDPOINTS.MEMBERS.STATUS(memberId), request);
  }

  uploadProfileImage(memberId: string, file: File): Observable<MemberResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData<MemberResponse>(API_ENDPOINTS.MEMBERS.PROFILE_IMAGE(memberId), formData);
  }
}
