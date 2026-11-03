/** Mirrors com.fitflow.platform.common.util.Gender */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Male',
  [Gender.FEMALE]: 'Female',
  [Gender.OTHER]: 'Other',
  [Gender.PREFER_NOT_TO_SAY]: 'Prefer not to say',
};

/** Mirrors com.fitflow.platform.modules.member.entity.MemberStatus */
export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  FROZEN = 'FROZEN',
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  [MemberStatus.ACTIVE]: 'Active',
  [MemberStatus.INACTIVE]: 'Inactive',
  [MemberStatus.EXPIRED]: 'Expired',
  [MemberStatus.FROZEN]: 'Frozen',
};

/** Mirrors CreateMemberRequest record. All fields optional except the @NotBlank ones. */
export interface CreateMemberRequest {
  fullName: string;
  mobileNumber: string;
  email?: string;
  /** Required by the backend when `email` is set (that's what creates the member's login account). */
  password?: string;
  gender?: Gender;
  dateOfBirth?: string; // LocalDate -> 'YYYY-MM-DD'
  heightCm?: number;
  weightKg?: number;
  goal?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  assignedTrainerId?: string;
}

/** Mirrors UpdateMemberRequest record (same shape as create on the backend). */
export type UpdateMemberRequest = CreateMemberRequest;

/** Mirrors UpdateMemberStatusRequest record. */
export interface UpdateMemberStatusRequest {
  status: MemberStatus;
}

/** Mirrors MemberResponse - full detail view (GET /members/{id}, POST, PUT). */
export interface MemberResponse {
  id: string;
  userId: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  gender?: Gender;
  dateOfBirth?: string;
  heightCm?: number;
  weightKg?: number;
  goal?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  profileImageUrl?: string;
  status: MemberStatus;
  joinDate: string;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  qrCodeValue?: string;

  // Membership snapshot, populated server-side from the active MemberMembership (if any)
  currentPlanName?: string;
  membershipExpiryDate?: string;
  membershipActive: boolean;
}

/** Mirrors MemberSummaryResponse - lightweight row shape for GET /members (list/table view). */
export interface MemberSummaryResponse {
  id: string;
  fullName: string;
  mobileNumber: string;
  profileImageUrl?: string;
  status: MemberStatus;
  membershipExpiryDate?: string;
  assignedTrainerName?: string;
}

/** Query params accepted by GET /members. */
export interface MemberListQuery {
  status?: MemberStatus;
  search?: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
}
