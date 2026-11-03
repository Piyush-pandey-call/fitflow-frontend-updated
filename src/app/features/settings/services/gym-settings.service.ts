import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { GymResponse, UpdateGymProfileRequest } from '../../../models/gym.model';

/** Maps to GymController's GYM_OWNER self-service endpoints (/gyms/me, /gyms/me/logo). */
@Injectable({ providedIn: 'root' })
export class GymSettingsService {
  private api = inject(ApiService);

  getMyGym(): Observable<GymResponse> {
    return this.api.get<GymResponse>(API_ENDPOINTS.GYMS.ME);
  }

  updateMyGym(request: UpdateGymProfileRequest): Observable<GymResponse> {
    return this.api.put<GymResponse>(API_ENDPOINTS.GYMS.ME, request);
  }

  uploadLogo(file: File): Observable<GymResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData<GymResponse>(API_ENDPOINTS.GYMS.LOGO, formData);
  }
}
