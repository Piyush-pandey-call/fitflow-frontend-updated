import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { DAY_OF_WEEK_LABELS, WorkoutExerciseResponse, WorkoutPlanResponse } from '../../../../models/workout.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-workout-plan-view',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './plan-view.component.html',
  styleUrl: './plan-view.component.css',
})
export class WorkoutPlanViewComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly Role = Role;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly plan = signal<WorkoutPlanResponse | null>(null);
  readonly showDeactivateConfirm = signal(false);
  readonly isDeactivating = signal(false);
  readonly dayLabels = DAY_OF_WEEK_LABELS;

  /** Groups the flat exercises[] into { dayOfWeek -> exercises[] }, sorted by orderIndex. */
  readonly scheduleByDay = computed(() => {
    const p = this.plan();
    if (!p) return [] as { day: number; label: string; exercises: WorkoutExerciseResponse[] }[];

    const grouped = new Map<number, WorkoutExerciseResponse[]>();
    for (const ex of p.exercises) {
      if (!grouped.has(ex.dayOfWeek)) grouped.set(ex.dayOfWeek, []);
      grouped.get(ex.dayOfWeek)!.push(ex);
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([day, exercises]) => ({ day, label: this.dayLabels[day], exercises }));
  });

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('id')!;
    this.load(planId);
  }

  load(planId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.workoutService.getPlan(planId).subscribe({
      next: (p) => {
        this.plan.set(p);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  confirmDeactivate(): void {
    const p = this.plan();
    if (!p) return;
    this.isDeactivating.set(true);
    this.workoutService.deactivatePlan(p.id).subscribe({
      next: () => this.router.navigate(['/workouts/member', p.memberId]),
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isDeactivating.set(false);
        this.showDeactivateConfirm.set(false);
      },
    });
  }
}
