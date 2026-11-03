import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GymSettingsService } from '../../services/gym-settings.service';
import { GYM_STATUS_LABELS, GymResponse } from '../../../../models/gym.model';
import { GYM_TYPE_LABELS } from '../../../../enums/role.enum';

/**
 * Covers "Gym" and "Branding" from the original doc's Settings module.
 * SMTP, WhatsApp, Razorpay, and AWS settings from that same doc entry are
 * NOT included: GymController exposes no endpoints for any of them - those
 * are backend environment/config values (see application.yml), not
 * per-tenant settings with a REST API. There's nothing for a frontend page
 * to read or write for those four.
 */
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
@Component({
  selector: 'app-gym-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './gym-settings.component.html',
  styleUrl: './gym-settings.component.css',
})
export class GymSettingsComponent implements OnInit {
  readonly user = inject(AuthService).currentUser;
  private fb = inject(FormBuilder);
  private gymSettingsService = inject(GymSettingsService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly gym = signal<GymResponse | null>(null);
  readonly isUploadingLogo = signal(false);

  readonly statusLabels = GYM_STATUS_LABELS;
  readonly typeLabels = GYM_TYPE_LABELS;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(180)]],
    phoneNumber: [''],
    address: ['', [Validators.maxLength(500)]],
    city: [''],
    state: [''],
    postalCode: [''],
    gstNumber: ['', [Validators.maxLength(30)]],
  });

  ngOnInit(): void {
    this.load();
  }

  get f() {
    return this.form.controls;
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.gymSettingsService.getMyGym().subscribe({
      next: (gym) => {
        this.gym.set(gym);
        // address/postalCode/gstNumber aren't in GymResponse - see model comment -
        // so they start blank here even on an edit, not because they were cleared.
        this.form.patchValue({
          name: gym.name,
          phoneNumber: gym.phoneNumber ?? '',
          city: gym.city ?? '',
          state: gym.state ?? '',
        });
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const raw = this.form.getRawValue();
    this.gymSettingsService
      .updateMyGym({
        name: raw.name!,
        phoneNumber: raw.phoneNumber || undefined,
        address: raw.address || undefined,
        city: raw.city || undefined,
        state: raw.state || undefined,
        postalCode: raw.postalCode || undefined,
        gstNumber: raw.gstNumber || undefined,
      })
      .subscribe({
        next: (gym) => {
          this.gym.set(gym);
          this.isSaving.set(false);
          this.successMessage.set('Gym profile updated.');
        },
        error: (err: Error) => {
          this.isSaving.set(false);
          this.errorMessage.set(err.message);
        },
      });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploadingLogo.set(true);
    this.gymSettingsService.uploadLogo(file).subscribe({
      next: (gym) => {
        this.gym.set(gym);
        this.isUploadingLogo.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isUploadingLogo.set(false);
      },
    });
  }
}
