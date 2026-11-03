import { Role, UserStatus } from '../enums/role.enum';

/** Mirrors com.fitflow.platform.modules.auth.dto.response.UserProfileResponse */
export interface UserProfile {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  profileImageUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

/** The subset of user data we get back directly from /auth/login and /auth/register-gym. */
export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  fullName: string;
  email: string;
  role: Role;
  profileImageUrl?: string;
}
