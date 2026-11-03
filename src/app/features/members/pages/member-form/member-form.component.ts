import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { TrainerService } from '../../../trainers/services/trainer.service';
import { Gender, GENDER_LABELS } from '../../../../models/member.model';
import { TrainerResponse } from '../../../../models/trainer.model';
import { mobileNumberValidator } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './member-form.component.html',
  styleUrl: './member-form.component.css',
})
export class MemberFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private memberService = inject(MemberService);
  private trainerService = inject(TrainerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly trainers = signal<TrainerResponse[]>([]);
  readonly showPassword = signal(false);

  // Only relevant in edit mode - the image upload endpoint needs an existing memberId.
  readonly currentProfileImageUrl = signal<string | null>(null);
  readonly isUploadingImage = signal(false);
  private memberId: string | null = null;

  readonly genderOptions = Object.values(Gender).map((value) => ({ value, label: GENDER_LABELS[value] }));

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    mobileNumber: ['', [Validators.required, mobileNumberValidator()]],
    email: ['', [Validators.email]],
    password: ['', [Validators.minLength(6), Validators.maxLength(72)]],
    gender: [null as Gender | null],
    dateOfBirth: [''],
    heightCm: [null as number | null],
    weightKg: [null as number | null],
    goal: ['', [Validators.maxLength(200)]],
    address: ['', [Validators.maxLength(500)]],
    emergencyContactName: ['', [Validators.maxLength(150)]],
    emergencyContactNumber: [''],
    assignedTrainerId: [''],
  });

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.memberId);

    // Password is only collected when creating a member: it's what creates their
    // login account, so it's required whenever an email is given, and irrelevant
    // (hidden entirely) once the member already exists.
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

    // Trainer dropdown is optional to populate - if it fails, the form still works fine without it.
    this.trainerService.listAssignable().subscribe({
      next: (list) => this.trainers.set(list),
      error: () => this.trainers.set([]),
    });

    if (this.memberId) {
      this.loadMember(this.memberId);
    }
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  private loadMember(id: string): void {
    this.isLoading.set(true);
    this.memberService.getById(id).subscribe({
      next: (member) => {
        this.form.patchValue({
          fullName: member.fullName,
          mobileNumber: member.mobileNumber,
          email: member.email ?? '',
          gender: member.gender ?? null,
          dateOfBirth: member.dateOfBirth ?? '',
          heightCm: member.heightCm ?? null,
          weightKg: member.weightKg ?? null,
          goal: member.goal ?? '',
          address: member.address ?? '',
          emergencyContactName: member.emergencyContactName ?? '',
          emergencyContactNumber: member.emergencyContactNumber ?? '',
          assignedTrainerId: member.assignedTrainerId ?? '',
        });
        this.currentProfileImageUrl.set(member.profileImageUrl ?? null);
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
    if (!file || !this.memberId) return;

    this.isUploadingImage.set(true);
    this.memberService.uploadProfileImage(this.memberId, file).subscribe({
      next: (member) => {
        this.currentProfileImageUrl.set(member.profileImageUrl ?? null);
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
    const payload = {
      fullName: raw.fullName!,
      mobileNumber: raw.mobileNumber!,
      email: raw.email || undefined,
      password: this.isEditMode() ? undefined : raw.password || undefined,
      gender: raw.gender || undefined,
      dateOfBirth: raw.dateOfBirth || undefined,
      heightCm: raw.heightCm ?? undefined,
      weightKg: raw.weightKg ?? undefined,
      goal: raw.goal || undefined,
      address: raw.address || undefined,
      emergencyContactName: raw.emergencyContactName || undefined,
      emergencyContactNumber: raw.emergencyContactNumber || undefined,
      assignedTrainerId: raw.assignedTrainerId || undefined,
    };

    const request$ = this.isEditMode()
      ? this.memberService.update(this.memberId!, payload)
      : this.memberService.create(payload);

    request$.subscribe({
      next: (member) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/members', member.id]);
      },
      error: (err: Error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
