import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService } from '../../services/user-profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfile } from '../../../../models/user.model';
import { strongPasswordValidator, passwordsMatchValidator } from '../../../../shared/validators/custom-validators';

/**
 * Covers "Profile, Change Password, Preferences, Theme, Language" from the
 * original doc as ONE page with two sections. Preferences/Theme/Language
 * aren't included: there's no endpoint for any of them on the backend
 * (UserProfileController is a single read-only GET /users/me). Change
 * Password reuses AuthService.changePassword() from Module 1 rather than
 * duplicating it - it's the same /auth/change-password endpoint either way.
 */
@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css',
})
export class MyProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly profile = signal<UserProfile | null>(null);

  readonly isChangingPassword = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal(false);
  readonly showPassword = signal(false);

  readonly isUploadingPhoto = signal(false);
  readonly photoError = signal<string | null>(null);
  readonly photoSuccess = signal(false);
  readonly profileImageLoadFailed = signal(false);

  readonly passwordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator('newPassword', 'confirmPassword') }
  );

  ngOnInit(): void {
    this.load();
  }

  get pf() {
    return this.passwordForm.controls;
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.userProfileService.getMe().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    const raw = this.passwordForm.getRawValue();
    this.authService.changePassword({ currentPassword: raw.currentPassword!, newPassword: raw.newPassword! }).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordSuccess.set(true);
        this.passwordForm.reset();
      },
      error: (err: Error) => {
        this.isChangingPassword.set(false);
        this.passwordError.set(err.message);
      },
    });
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.photoError.set(null);
    this.photoSuccess.set(false);

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.photoError.set('Choose a JPG or PNG image.');
      input.value = '';
      return;
    }

    this.isUploadingPhoto.set(true);
    this.userProfileService.uploadProfileImage(file).subscribe({
      next: (updatedProfile) => {
        const imageUrl = updatedProfile.profileImageUrl;
        if (!imageUrl) {
          this.userProfileService.getMe().subscribe({
            next: (freshProfile) => this.finishPhotoUpload(freshProfile),
            error: (err: Error) => {
              this.photoError.set(err.message);
              this.isUploadingPhoto.set(false);
            },
          });
          return;
        }
        this.finishPhotoUpload(updatedProfile);
      },
      error: (err: Error) => {
        this.photoError.set(err.message);
        this.isUploadingPhoto.set(false);
      },
    });
    input.value = '';
  }

  private finishPhotoUpload(updatedProfile: UserProfile): void {
    const imageUrl = updatedProfile.profileImageUrl;
    if (!imageUrl) {
      this.photoError.set('The upload completed, but no profile image URL was returned.');
      this.isUploadingPhoto.set(false);
      return;
    }

    const refreshedUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;
    this.profile.update((current) => current ? { ...current, profileImageUrl: refreshedUrl } : updatedProfile);
    this.authService.updateProfileImage(refreshedUrl);
    this.photoSuccess.set(true);
    this.profileImageLoadFailed.set(false);
    this.isUploadingPhoto.set(false);
  }
}
