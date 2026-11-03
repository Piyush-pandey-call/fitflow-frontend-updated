import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import {
  GymOwnerDashboardResponse,
  MemberDashboardResponse,
  SuperAdminDashboardResponse,
} from '../../../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiService) {}

  getGymOwnerDashboard(): Observable<GymOwnerDashboardResponse> {
    return this.api.get<GymOwnerDashboardResponse>(API_ENDPOINTS.DASHBOARD.GYM_OWNER);
  }

  getMemberDashboard(): Observable<MemberDashboardResponse> {
    return this.api.get<MemberDashboardResponse>(API_ENDPOINTS.DASHBOARD.MEMBER);
  }

  getSuperAdminDashboard(): Observable<SuperAdminDashboardResponse> {
    return this.api.get<SuperAdminDashboardResponse>(API_ENDPOINTS.DASHBOARD.SUPER_ADMIN);
  }
}
