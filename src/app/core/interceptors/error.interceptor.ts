import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../../interfaces/api-response.interface';

// Module-level (not per-request) so concurrent 401s share a single refresh call.
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const storage = inject(StorageService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Backend's central subscription gate (SubscriptionAccessFilter) fired - the
      // gym's trial/paid access has lapsed. Send the owner straight to the expired
      // page instead of showing a raw error on whatever screen they were on.
      const body = error.error as ApiResponse<unknown> | undefined;
      if (error.status === 402 && body?.error?.code === 'SUBSCRIPTION_EXPIRED') {
        if (!router.url.startsWith('/billing')) {
          router.navigate(['/billing/expired']);
        }
        return throwError(() => normalizeError(error));
      }

      // Never try to refresh on the auth endpoints themselves - avoids infinite loops.
      const isAuthCall = Object.values(API_ENDPOINTS.AUTH).some((path) => req.url.includes(path));
      // 401 = expired/invalid token -> worth refreshing and retrying.
      // 403 = valid token, but this role isn't allowed to do this -> refreshing changes nothing;
      // show the backend's actual "forbidden" message instead of masking it with a refresh attempt.
      const isExpiredTokenError = (status: number) => status === 401;

      if (isExpiredTokenError(error.status) && !isAuthCall) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshedToken$.next(null);

          return authService.refreshToken().pipe(
            switchMap((res) => {
              isRefreshing = false;
              refreshedToken$.next(res.accessToken);
              return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }));
            }),
            catchError((refreshErr) => {
              // Covers two cases with one path: (a) the refresh call itself failed, or
              // (b) the refresh succeeded but the retried request still failed (e.g. the
              // "refreshed" token is somehow still rejected). Either way, don't loop -
              // clear the session, send the user to login once, and surface a clean error.
              isRefreshing = false;
              storage.clear();
              router.navigate(['/auth/login']);
              return throwError(() => normalizeError(refreshErr));
            })
          );
        }

        // A refresh is already in flight - wait for it, then retry this request once.
        return refreshedToken$.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))),
          catchError((retryErr) => throwError(() => normalizeError(retryErr)))
        );
      }

      return throwError(() => normalizeError(error));
    })
  );
};

/** Extracts the backend's ApiError.message so components can show one clean string. */
function normalizeError(error: HttpErrorResponse): Error {
  const body = error.error as ApiResponse<unknown> | undefined;
  const message = body?.error?.message ?? body?.message ?? error.message ?? 'Something went wrong. Please try again.';
  return new Error(message);
}
