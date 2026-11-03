import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import {
  CreateSupportTicketRequest,
  SupportTicketResponse,
  SupportTicketStatus,
  UpdateSupportTicketRequest,
} from '../../../models/support.model';

/** Maps 1:1 to SupportTicketController. tenantId is never sent from here - the backend derives it from the JWT. */
@Injectable({ providedIn: 'root' })
export class SupportTicketService {
  private api = inject(ApiService);

  create(request: CreateSupportTicketRequest): Observable<SupportTicketResponse> {
    return this.api.post<SupportTicketResponse>(API_ENDPOINTS.SUPPORT_TICKETS.CREATE, request);
  }

  /** GYM_OWNER/TRAINER - tickets raised by their own gym. */
  listMine(page: number, size: number): Observable<PageResponse<SupportTicketResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.api.get<PageResponse<SupportTicketResponse>>(API_ENDPOINTS.SUPPORT_TICKETS.MINE, params);
  }

  /** SUPER_ADMIN only - every ticket platform-wide. */
  listAll(status: SupportTicketStatus | undefined, page: number, size: number): Observable<PageResponse<SupportTicketResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.api.get<PageResponse<SupportTicketResponse>>(API_ENDPOINTS.SUPPORT_TICKETS.ALL, params);
  }

  getById(ticketId: string): Observable<SupportTicketResponse> {
    return this.api.get<SupportTicketResponse>(API_ENDPOINTS.SUPPORT_TICKETS.BY_ID(ticketId));
  }

  /** SUPER_ADMIN only. */
  update(ticketId: string, request: UpdateSupportTicketRequest): Observable<SupportTicketResponse> {
    return this.api.patch<SupportTicketResponse>(API_ENDPOINTS.SUPPORT_TICKETS.BY_ID(ticketId), request);
  }
}
