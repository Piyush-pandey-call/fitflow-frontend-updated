import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { PUBLIC_ENDPOINTS } from '../constants/api.constants';

/**
 * Functional interceptor (Angular 15+ standalone style, registered via
 * provideHttpClient(withInterceptors([...])) in app.config.ts).
 *
 * Skips endpoints the backend's SecurityConfig.PUBLIC_ENDPOINTS allows
 * through without a token - sending a stale/absent token there is
 * harmless, but keeping this list in sync avoids confusing 401s in the
 * console during logged-out flows like "forgot password".
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);

  const isPublic = PUBLIC_ENDPOINTS.some((endpoint) => req.url.includes(endpoint));
  if (isPublic) {
    return next(req);
  }

  const token = storage.getAccessToken();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};
