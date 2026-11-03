/**
 * Mirrors com.fitflow.platform.common.dto.ApiResponse<T>.
 * Every controller in the backend returns this envelope, success or error.
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

/** Mirrors com.fitflow.platform.common.dto.ApiError (used on failed responses). */
export interface ApiError {
  code?: string;
  message: string;
  path?: string;
  fieldErrors?: ApiFieldError[];
}

/** Mirrors ApiError.FieldErrorDetail - one entry per @Valid validation failure. */
export interface ApiFieldError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}
