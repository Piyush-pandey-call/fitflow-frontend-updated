import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../interfaces/api-response.interface';

/**
 * Thin generic wrapper around HttpClient.
 *
 * Every endpoint in the backend replies with the ApiResponse<T> envelope
 * (success/message/data/error). Feature services call the methods below
 * and get back the *unwrapped* `data` payload directly, so a components
 * never has to write `.data.data` or check `.success` by hand - errors are
 * instead turned into a thrown HttpErrorResponse by error.interceptor.ts
 * and handled with .subscribe({ error: ... }) / catchError.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: HttpParams | Record<string, string | number | boolean>): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params })
      .pipe(map((res) => res.data as T));
  }

  post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((res) => res.data as T));
  }

  put<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((res) => res.data as T));
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((res) => res.data as T));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T> | null>(`${this.baseUrl}${path}`)
      .pipe(map((res) => res?.data as T));
  }

  /**
   * For multipart/form-data uploads (profile images, documents, etc.).
   * Do NOT set a Content-Type header yourself - the browser needs to set
   * its own header with the multipart boundary, so this deliberately leaves
   * headers alone and just posts the FormData as-is.
   */
  postFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${path}`, formData)
      .pipe(map((res) => res.data as T));
  }

  /**
   * For binary downloads (PDF diet plans, future report exports). These
   * endpoints do NOT return the ApiResponse<T> JSON envelope - they return
   * the raw file bytes directly with a Content-Disposition header - so this
   * skips the `.pipe(map(res => res.data))` unwrapping the other methods do.
   */
  getBlob(path: string, params?: HttpParams): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${path}`, { params, responseType: 'blob' });
  }
}
