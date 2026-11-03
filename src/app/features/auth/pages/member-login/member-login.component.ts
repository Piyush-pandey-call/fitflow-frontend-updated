import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';

/**
 * A dedicated login screen for gym MEMBERS - visually distinct (emerald/teal,
 * matches the Member Dashboard) from the gym-owner LoginComponent, and gives
 * a member-appropriate error if a gym-owner/trainer account is used here by
 * mistake. Hits the exact same POST /auth/login endpoint as the owner login;
 * the backend doesn't distinguish "which login form" was used, only the
 * account's actual role, so this check is purely a friendlier client-side UX.
 */
@Component({
  selector: 'app-member-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './member-login.component.html',
  styleUrl: './member-login.component.css',
})
export class MemberLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.role !== Role.MEMBER) {
          // Right credentials, wrong door - log them back out and send them to staff login instead.
          this.authService.clearLocalSession();
          this.errorMessage.set(
            'This login is for gym members. Staff accounts should sign in from the Gym Owner login page.'
          );
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
