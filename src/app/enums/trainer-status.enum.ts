/** Mirrors com.fitflow.platform.modules.trainer.entity.TrainerStatus */
export enum TrainerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
}

export const TRAINER_STATUS_LABELS: Record<TrainerStatus, string> = {
  [TrainerStatus.ACTIVE]: 'Active',
  [TrainerStatus.INACTIVE]: 'Inactive',
  [TrainerStatus.ON_LEAVE]: 'On Leave',
};
