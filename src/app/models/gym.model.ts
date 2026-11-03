import { GymType } from '../enums/role.enum';

/** Mirrors com.fitflow.platform.modules.gym.entity.GymStatus */
export enum GymStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export const GYM_STATUS_LABELS: Record<GymStatus, string> = {
  [GymStatus.TRIAL]: 'Trial',
  [GymStatus.ACTIVE]: 'Active',
  [GymStatus.SUSPENDED]: 'Suspended',
  [GymStatus.CANCELLED]: 'Cancelled',
};

/**
 * Mirrors UpdateGymProfileRequest. NOTE: address/postalCode/gstNumber can be
 * written here, but GymResponse below doesn't echo them back - the backend
 * accepts and stores them but its response DTO doesn't expose them yet, so
 * the settings form can't prefill those three fields from a GET. Not a
 * frontend bug; flagged in the Settings page itself.
 */
export interface UpdateGymProfileRequest {
  name: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gstNumber?: string;
}

/** Mirrors GymResponse */
export interface GymResponse {
  id: string;
  name: string;
  slug: string;
  gymType: GymType;
  email: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  country?: string;
  logoUrl?: string;
  status: GymStatus;
  trialUsed: boolean;
  trialStartedAt?: string;
  /** Exact ISO instant (e.g. "2026-10-08T10:00:00Z"), not just a calendar date - compare with Date.now(). */
  trialEndsAt?: string;
  currency: string;
  timezone: string;
  totalMembers: number;
  totalTrainers: number;
}
