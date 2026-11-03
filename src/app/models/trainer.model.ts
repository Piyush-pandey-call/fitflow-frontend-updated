import { TrainerStatus } from '../enums/trainer-status.enum';

/** Mirrors CreateTrainerRequest record - note: no `status` field, backend defaults it. */
export interface CreateTrainerRequest {
  fullName: string;
  mobileNumber: string;
  email?: string;
  password?: string;
  experienceYears?: number;
  certifications?: string[];
  specializations?: string[];
  bio?: string;
}

/** Mirrors UpdateTrainerRequest record - same as Create, plus `status`. */
export interface UpdateTrainerRequest {
  fullName: string;
  mobileNumber: string;
  email?: string;
  experienceYears?: number;
  certifications?: string[];
  specializations?: string[];
  bio?: string;
  status?: TrainerStatus;
}

/**
 * Mirrors com.fitflow.platform.modules.trainer.dto.response.TrainerResponse.
 * Used for the full CRUD pages in this module, and (just id/fullName worth of it)
 * for the "Assigned Trainer" dropdown on the Member form (Module 3).
 */
export interface TrainerResponse {
  id: string;
  userId: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  experienceYears?: number;
  certifications: string[];
  specializations: string[];
  profileImageUrl?: string;
  status: TrainerStatus;
  bio?: string;
  assignedMemberCount: number;
}

/**
 * Query params accepted by GET /trainers - mirrors TrainerController#listTrainers
 * exactly. NOTE: unlike GET /members, this endpoint takes NO `search` and NO
 * `sortBy`/`sortDirection` params - only `status`, `page`, `size`. Don't add
 * fields here that the backend won't read.
 */
export interface ListTrainersQuery {
  status?: TrainerStatus;
  page: number;
  size: number;
}
