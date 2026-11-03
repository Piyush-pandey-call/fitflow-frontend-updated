import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { ApiService } from '../../../core/services/api.service';
import {
  GymSubscriptionCheckoutRequest,
  GymSubscriptionCheckoutResponse,
  GymSubscriptionPaymentConfirmation,
  GymSubscriptionResponse,
  PlatformSubscriptionPlan,
  VerifyGymSubscriptionPaymentRequest,
} from '../../../models/gym-subscription.model';

@Injectable({ providedIn: 'root' })
export class GymSubscriptionService {
  private readonly api = inject(ApiService);

  listActivePlans(): Observable<PlatformSubscriptionPlan[]> {
    return this.api.get<PlatformSubscriptionPlan[]>(API_ENDPOINTS.GYMS.ACTIVE_PLANS);
  }

  getMine(): Observable<GymSubscriptionResponse> {
    return this.api.get<GymSubscriptionResponse>(API_ENDPOINTS.GYM_SUBSCRIPTIONS.MINE);
  }

  initiateCheckout(request: GymSubscriptionCheckoutRequest): Observable<GymSubscriptionCheckoutResponse> {
    return this.api.post<GymSubscriptionCheckoutResponse>(API_ENDPOINTS.GYM_SUBSCRIPTIONS.CHECKOUT, request);
  }

  verifyCheckout(request: VerifyGymSubscriptionPaymentRequest): Observable<GymSubscriptionPaymentConfirmation> {
    return this.api.post<GymSubscriptionPaymentConfirmation>(
      API_ENDPOINTS.GYM_SUBSCRIPTIONS.VERIFY_CHECKOUT,
      request
    );
  }
}
