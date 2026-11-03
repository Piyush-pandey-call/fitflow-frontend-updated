import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/app.constants';
import { AuthenticatedUser } from '../../models/user.model';

/**
 * Wraps localStorage so the rest of the app never touches window.localStorage
 * directly. Keeping this in one place makes it trivial to swap storage
 * strategy later (e.g. move refresh token to an httpOnly cookie).
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  getUser(): AuthenticatedUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as AuthenticatedUser) : null;
  }

  setUser(user: AuthenticatedUser): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}
