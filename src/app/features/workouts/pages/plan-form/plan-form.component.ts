import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { TrainerService } from '../../../trainers/services/trainer.service';
import { MemberService } from '../../../members/services/member.service';
import { DAY_OF_WEEK_LABELS, WorkoutExerciseItem } from '../../../../models/workout.model';
import { ExerciseResponse } from '../../../../models/workout.model';
import { TrainerResponse } from '../../../../models/trainer.model';
import { MemberResponse } from '../../../../models/member.model';

interface ScheduleRow extends WorkoutExerciseItem {
  rowId: number;
}

/**
 * Builds a CreateWorkoutPlanRequest - there is NO update-plan endpoint on the
 * backend, so this page is create-only. Once submitted, the only further
 * action available on a plan is deactivating it (see plan-view).
 */
@Component({
  selector: 'app-workout-plan-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './plan-form.component.html',
  styleUrl: './plan-form.component.css',
})
export class WorkoutPlanFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private workoutService = inject(WorkoutService);
  private trainerService = inject(TrainerService);
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly member = signal<MemberResponse | null>(null);
  readonly trainers = signal<TrainerResponse[]>([]);
  readonly exercises = signal<ExerciseResponse[]>([]);

  readonly dayLabels = DAY_OF_WEEK_LABELS;
  readonly dayOptions = [0, 1, 2, 3, 4, 5, 6];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(1000)]],
    trainerId: [''],
    startDate: [''],
    endDate: [''],
  });

  rows: ScheduleRow[] = [];
  private nextRowId = 1;
  private memberId!: string;

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('memberId')!;

    this.memberService.getById(this.memberId).subscribe({ next: (m) => this.member.set(m) });
    this.trainerService.listAssignable().subscribe({ next: (t) => this.trainers.set(t) });
    this.workoutService.listExercises().subscribe({ next: (e) => this.exercises.set(e) });

    this.addRow();
  }

  get f() {
    return this.form.controls;
  }

  addRow(): void {
    this.rows = [
      ...this.rows,
      { rowId: this.nextRowId++, exerciseId: '', dayOfWeek: 1, orderIndex: 0, sets: undefined, reps: undefined },
    ];
  }

  removeRow(rowId: number): void {
    this.rows = this.rows.filter((r) => r.rowId !== rowId);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const validRows = this.rows.filter((r) => r.exerciseId);
    if (validRows.length === 0) {
      this.errorMessage.set('Add at least one exercise to the schedule.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // orderIndex = position within that same day, computed here rather than
    // asking the person to manage numbers manually.
    const dayCounters: Record<number, number> = {};
    const exercises: WorkoutExerciseItem[] = validRows.map((r) => {
      const order = dayCounters[r.dayOfWeek] ?? 0;
      dayCounters[r.dayOfWeek] = order + 1;
      return {
        exerciseId: r.exerciseId,
        dayOfWeek: r.dayOfWeek,
        orderIndex: order,
        sets: r.sets || undefined,
        reps: r.reps || undefined,
        durationSeconds: r.durationSeconds || undefined,
        restSeconds: r.restSeconds || undefined,
        notes: r.notes || undefined,
      };
    });

    const raw = this.form.getRawValue();
    this.workoutService
      .createPlan({
        name: raw.name!,
        description: raw.description || undefined,
        memberId: this.memberId,
        trainerId: raw.trainerId || undefined,
        startDate: raw.startDate || undefined,
        endDate: raw.endDate || undefined,
        exercises,
      })
      .subscribe({
        next: (plan) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/workouts/plan', plan.id]);
        },
        error: (err: Error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.message);
        },
      });
  }
}
