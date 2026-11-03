import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { ReportType } from '../../../enums/report-type.enum';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = inject(ApiService);

  downloadExcel(type: ReportType, from: string, to: string): Observable<Blob> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.api.getBlob(API_ENDPOINTS.REPORTS.EXCEL(type), params);
  }

  downloadPdf(type: ReportType, from: string, to: string): Observable<Blob> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.api.getBlob(API_ENDPOINTS.REPORTS.PDF(type), params);
  }
}
