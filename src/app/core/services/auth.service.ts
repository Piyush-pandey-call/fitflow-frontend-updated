import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterGymRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../../models/auth.model';
import { AuthenticatedUser } from '../../models/user.model';

/**
 * Lives in core because both the JWT/error interceptors and the route
 * guards depend on it - keeping it here (instead of inside the auth
 * feature folder) avoids a feature -> core -> feature circular import.
 *
 * Every method maps 1:1 to an AuthController endpoint. Components in
 * features/auth/pages call these methods directly; no extra
 * feature-level service is needed on top of this one.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private storage = inject(StorageService);

  /** Signal-based current-user state so templates can do `authService.currentUser()`. */
  private readonly _currentUser = signal<AuthenticatedUser | null>(this.storage.getUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  registerGym(request: RegisterGymRequest): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER_GYM, request)
      .pipe(tap((res) => this.persistSession(res)));
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, { ...request, email: request.email.trim() })
      .pipe(tap((res) => this.persistSession(res)));
  }

  refreshToken(): Observable<AuthResponse> {
    const request: RefreshTokenRequest = { refreshToken: this.storage.getRefreshToken() ?? '' };
    return this.api
      .post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, request)
      .pipe(tap((res) => this.persistSession(res)));
  }

  logout(): Observable<void> {
    const request: RefreshTokenRequest = { refreshToken: this.storage.getRefreshToken() ?? '' };
    // finalize() (not tap()) so the local session is cleared even if this
    // request fails (server down, token already expired, etc.) - the person
    // clicking "Log out" should always end up logged out client-side.
    return this.api.post<void>(API_ENDPOINTS.AUTH.LOGOUT, request).pipe(finalize(() => this.clearSession()));
  }

  logoutAllDevices(): Observable<void> {
    return this.api
      .post<void>(API_ENDPOINTS.AUTH.LOGOUT_ALL, {})
      .pipe(tap(() => this.clearSession()));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, request);
  }

  verifyEmail(request: VerifyEmailRequest): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, request);
  }

  resendVerification(): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {});
  }

  /** Called once on app bootstrap (see APP_INITIALIZER note in app.config.ts) to hydrate state on refresh. */
  restoreSession(): void {
    this._currentUser.set(this.storage.getUser());
  }

  updateProfileImage(profileImageUrl: string): void {
    const user = this._currentUser();
    if (!user) return;

    const updatedUser = { ...user, profileImageUrl };
    this.storage.setUser(updatedUser);
    this._currentUser.set(updatedUser);
  }

  private persistSession(res: AuthResponse): void {
    this.storage.setTokens(res.accessToken, res.refreshToken);
    const user: AuthenticatedUser = {
      userId: res.userId,
      tenantId: res.tenantId,
      fullName: res.fullName,
      email: res.email,
      role: res.role,
      profileImageUrl: res.profileImageUrl,
    };
    this.storage.setUser(user);
    this._currentUser.set(user);
  }

  /**
   * Discards the locally-stored session without calling the logout endpoint.
   * Used right after self-service registration: registerGym() auto-persists
   * a session from the response, but we want a clean "please log in" state
   * instead of silently leaving the person signed in as an unverified user.
   */
  clearLocalSession(): void {
    this.clearSession();
  }

  private clearSession(): void {
    this.storage.clear();
    this._currentUser.set(null);
  }
}
