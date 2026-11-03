import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { ExerciseResponse } from '../../../../models/workout.model';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-exercise-library',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchBarComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './exercise-library.component.html',
  styleUrl: './exercise-library.component.css',
})
export class ExerciseLibraryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private workoutService = inject(WorkoutService);
  public authService = inject(AuthService);

  readonly Role = Role;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly exercises = signal<ExerciseResponse[]>([]);
  readonly searchTerm = signal('');

  readonly showAddForm = signal(false);
  readonly isSubmitting = signal(false);
  readonly deleteTarget = signal<ExerciseResponse | null>(null);
  readonly isDeleting = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    muscleGroup: ['', [Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(1000)]],
    videoUrl: ['', [Validators.maxLength(500)]],
    imageUrl: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.workoutService.listExercises(this.searchTerm() || undefined).subscribe({
      next: (res) => {
        this.exercises.set(res);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.load();
  }

  get f() {
    return this.form.controls;
  }

  submitNewExercise(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();
    this.workoutService
      .createExercise({
        name: raw.name!,
        muscleGroup: raw.muscleGroup || undefined,
        description: raw.description || undefined,
        videoUrl: raw.videoUrl || undefined,
        imageUrl: raw.imageUrl || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showAddForm.set(false);
          this.form.reset();
          this.load();
        },
        error: (err: Error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.message);
        },
      });
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.isDeleting.set(true);
    this.workoutService.deleteExercise(target.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteTarget.set(null);
        this.load();
      },
      error: (err: Error) => {
        this.isDeleting.set(false);
        this.errorMessage.set(err.message);
        this.deleteTarget.set(null);
      },
    });
  }
}
