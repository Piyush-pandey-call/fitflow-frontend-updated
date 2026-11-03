import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import { ListNotificationsQuery, NotificationResponse } from '../../../models/notification.model';

/** Maps 1:1 to NotificationController - a single read-only endpoint. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = inject(ApiService);

  list(query: ListNotificationsQuery): Observable<PageResponse<NotificationResponse>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.memberId) params = params.set('memberId', query.memberId);
    return this.api.get<PageResponse<NotificationResponse>>(API_ENDPOINTS.NOTIFICATIONS.LIST, params);
  }
}
