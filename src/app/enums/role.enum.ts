/** Mirrors com.fitflow.platform.modules.auth.entity.Role */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GYM_OWNER = 'GYM_OWNER',
  TRAINER = 'TRAINER',
  MEMBER = 'MEMBER',
}

/** Mirrors com.fitflow.platform.modules.auth.entity.UserStatus */
export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

/** Mirrors com.fitflow.platform.modules.gym.entity.GymType */
export enum GymType {
  GYM = 'GYM',
  FITNESS_CENTER = 'FITNESS_CENTER',
  CROSSFIT_STUDIO = 'CROSSFIT_STUDIO',
  YOGA_CENTER = 'YOGA_CENTER',
  PERSONAL_TRAINER = 'PERSONAL_TRAINER',
}

/** Human-readable labels for the gym-type dropdown on the register page. */
export const GYM_TYPE_LABELS: Record<GymType, string> = {
  [GymType.GYM]: 'Gym',
  [GymType.FITNESS_CENTER]: 'Fitness Center',
  [GymType.CROSSFIT_STUDIO]: 'CrossFit Studio',
  [GymType.YOGA_CENTER]: 'Yoga Center',
  [GymType.PERSONAL_TRAINER]: 'Personal Trainer',
};
