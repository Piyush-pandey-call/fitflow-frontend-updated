import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GymType, GYM_TYPE_LABELS } from '../../../../enums/role.enum';
import { mobileNumberValidator, strongPasswordValidator } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly showSuccess = signal(false);

  readonly gymTypeOptions = Object.values(GymType).map((value) => ({
    value,
    label: GYM_TYPE_LABELS[value],
  }));

  readonly form = this.fb.group({
    gymName: ['', [Validators.required, Validators.maxLength(180)]],
    gymType: [GymType.GYM, [Validators.required]],
    ownerFullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, mobileNumberValidator()]],
    password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator()]],
    city: [''],
    state: [''],
  });

  get f() {
    return this.form.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const value = this.form.getRawValue();

    this.authService
      .registerGym({
        gymName: value.gymName!,
        gymType: value.gymType!,
        ownerFullName: value.ownerFullName!,
        email: value.email!,
        mobileNumber: value.mobileNumber!,
        password: value.password!,
        city: value.city || undefined,
        state: value.state || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.authService.clearLocalSession();
          this.showSuccess.set(true);
        },
        error: (err: Error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.message);
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
