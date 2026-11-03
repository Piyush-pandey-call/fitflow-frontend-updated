import { GymType } from '../enums/role.enum';
import { AuthenticatedUser } from './user.model';

/** Mirrors AuthController's AuthResponse (returned by login, register-gym, refresh-token). */
export interface AuthResponse extends AuthenticatedUser {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Mirrors LoginRequest record */
export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

/** Mirrors RegisterGymRequest record */
export interface RegisterGymRequest {
  gymName: string;
  gymType: GymType;
  ownerFullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  city?: string;
  state?: string;
}

/** Mirrors RefreshTokenRequest record */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** Mirrors ForgotPasswordRequest record */
export interface ForgotPasswordRequest {
  email: string;
}

/** Mirrors ResetPasswordRequest record */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/** Mirrors ChangePasswordRequest record */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** Mirrors VerifyEmailRequest record */
export interface VerifyEmailRequest {
  token: string;
}
