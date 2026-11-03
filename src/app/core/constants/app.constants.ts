export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ff_access_token',
  REFRESH_TOKEN: 'ff_refresh_token',
  USER: 'ff_user',
} as const;

/** Password rule copied from backend @Pattern validation on all password DTOs. */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
export const PASSWORD_MIN_LENGTH = 8;

/** Mobile number rule copied from RegisterGymRequest @Pattern. */
export const MOBILE_PATTERN = /^[+]?[0-9]{10,15}$/;
