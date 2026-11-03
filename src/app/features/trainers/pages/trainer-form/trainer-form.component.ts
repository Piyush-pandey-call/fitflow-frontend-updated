import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { TRAINER_STATUS_LABELS, TrainerStatus } from '../../../../enums/trainer-status.enum';
import { mobileNumberValidator } from '../../../../shared/validators/custom-validators';
import { TagInputComponent } from '../../../../shared/components/tag-input/tag-input.component';

@Component({
  selector: 'app-trainer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TagInputComponent],
  templateUrl: './trainer-form.component.html',
  styleUrl: './trainer-form.component.css',
})
export class TrainerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private trainerService = inject(TrainerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly currentProfileImageUrl = signal<string | null>(null);
  readonly isUploadingImage = signal(false);
  private trainerId: string | null = null;

  readonly statusOptions = Object.values(TrainerStatus);
  readonly statusLabels = TRAINER_STATUS_LABELS;

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    mobileNumber: ['', [Validators.required, mobileNumberValidator()]],
    email: ['', [Validators.email]],
    password: ['', [Validators.minLength(6), Validators.maxLength(72)]],
    experienceYears: [null as number | null, [Validators.min(0)]],
    bio: ['', [Validators.maxLength(1000)]],
    status: [TrainerStatus.ACTIVE],
  });

  // Certifications/specializations are string[] and driven by app-tag-input,
  // which doesn't plug neatly into a plain FormControl<string[]> without
  // extra ControlValueAccessor plumbing - simplest and clearest is to keep
  // them as component state and merge into the payload on submit.
  certifications: string[] = [];
  specializations: string[] = [];

  ngOnInit(): void {
    this.trainerId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.trainerId);

    if (!this.isEditMode()) {
      this.f.email.valueChanges.subscribe((email) => {
        const passwordControl = this.f.password;
        if (email && email.trim()) {
          passwordControl.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(72)]);
        } else {
          passwordControl.setValidators([Validators.minLength(6), Validators.maxLength(72)]);
        }
        passwordControl.updateValueAndValidity({ emitEvent: false });
      });
    }

    if (this.trainerId) {
      this.loadTrainer(this.trainerId);
    }
  }

  get f() {
    return this.form.controls;
  }

  private loadTrainer(id: string): void {
    this.isLoading.set(true);
    this.trainerService.getById(id).subscribe({
      next: (trainer) => {
        this.form.patchValue({
          fullName: trainer.fullName,
          mobileNumber: trainer.mobileNumber,
          email: trainer.email ?? '',
          experienceYears: trainer.experienceYears ?? null,
          bio: trainer.bio ?? '',
          status: trainer.status,
        });
        this.certifications = trainer.certifications ?? [];
        this.specializations = trainer.specializations ?? [];
        this.currentProfileImageUrl.set(trainer.profileImageUrl ?? null);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.trainerId) return;

    this.isUploadingImage.set(true);
    this.trainerService.uploadProfileImage(this.trainerId, file).subscribe({
      next: (trainer) => {
        this.currentProfileImageUrl.set(trainer.profileImageUrl ?? null);
        this.isUploadingImage.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isUploadingImage.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const basePayload = {
      fullName: raw.fullName!,
      mobileNumber: raw.mobileNumber!,
      email: raw.email || undefined,
      password: raw.password || undefined,
      experienceYears: raw.experienceYears ?? undefined,
      certifications: this.certifications,
      specializations: this.specializations,
      bio: raw.bio || undefined,
    };

    // CreateTrainerRequest has no `status` field - only include it on update.
    const request$ = this.isEditMode()
      ? this.trainerService.update(this.trainerId!, { ...basePayload, status: raw.status! })
      : this.trainerService.create(basePayload);

    request$.subscribe({
      next: (trainer) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/trainers', trainer.id]);
      },
      error: (err: Error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
