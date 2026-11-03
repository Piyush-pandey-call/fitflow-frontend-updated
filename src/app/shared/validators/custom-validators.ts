import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MOBILE_PATTERN, PASSWORD_PATTERN } from '../../core/constants/app.constants';

/** Mirrors the backend @Pattern rule: 1 uppercase, 1 lowercase, 1 digit, min 8 chars. */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;
    return PASSWORD_PATTERN.test(value) ? null : { weakPassword: true };
  };
}

/** Mirrors RegisterGymRequest's mobile @Pattern rule. */
export function mobileNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;
    return MOBILE_PATTERN.test(value) ? null : { invalidMobile: true };
  };
}

/** Cross-field validator: put on the FormGroup, checks `password` === `confirmPassword`. */
export function passwordsMatchValidator(
  passwordKey = 'password',
  confirmKey = 'confirmPassword'
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : { passwordsMismatch: true };
  };
}
