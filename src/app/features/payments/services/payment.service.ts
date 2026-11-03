import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PageResponse } from '../../../models/common.model';
import {
  InitiatePaymentRequest,
  ListPaymentsQuery,
  PaymentResponse,
  RazorpayOrderResponse,
  RecordOfflinePaymentRequest,
  RefundRequest,
  VerifyPaymentRequest,
} from '../../../models/payment.model';

/** Maps 1:1 to PaymentController. tenantId is never sent from here - the backend derives it from the JWT. */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api = inject(ApiService);

  initiate(request: InitiatePaymentRequest): Observable<RazorpayOrderResponse> {
    return this.api.post<RazorpayOrderResponse>(API_ENDPOINTS.PAYMENTS.INITIATE, request);
  }

  verify(request: VerifyPaymentRequest): Observable<PaymentResponse> {
    return this.api.post<PaymentResponse>(API_ENDPOINTS.PAYMENTS.VERIFY, request);
  }

  recordOffline(request: RecordOfflinePaymentRequest): Observable<PaymentResponse> {
    return this.api.post<PaymentResponse>(API_ENDPOINTS.PAYMENTS.OFFLINE, request);
  }

  getById(paymentId: string): Observable<PaymentResponse> {
    return this.api.get<PaymentResponse>(API_ENDPOINTS.PAYMENTS.BY_ID(paymentId));
  }

  list(query: ListPaymentsQuery): Observable<PageResponse<PaymentResponse>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.status) params = params.set('status', query.status);
    if (query.memberId) params = params.set('memberId', query.memberId);
    return this.api.get<PageResponse<PaymentResponse>>(API_ENDPOINTS.PAYMENTS.LIST, params);
  }

  refund(paymentId: string, request: RefundRequest): Observable<PaymentResponse> {
    return this.api.post<PaymentResponse>(API_ENDPOINTS.PAYMENTS.REFUND(paymentId), request);
  }

  downloadInvoice(paymentId: string): Observable<Blob> {
    return this.api.getBlob(API_ENDPOINTS.PAYMENTS.INVOICE_PDF(paymentId));
  }
}
