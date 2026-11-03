import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { UserProfile } from '../../../models/user.model';

/** Maps to UserProfileController - a single "who am I" endpoint, GET /users/me. */
@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private api = inject(ApiService);

  getMe(): Observable<UserProfile> {
    return this.api.get<UserProfile>(API_ENDPOINTS.USERS.ME);
  }

  /** Upload/replace my own profile photo (any role - gym owner, trainer, member, super admin). */
  uploadProfileImage(file: File): Observable<UserProfile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData<UserProfile>(API_ENDPOINTS.USERS.PROFILE_IMAGE, formData);
  }
}
