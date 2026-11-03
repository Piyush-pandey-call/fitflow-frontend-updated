import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const WORKOUTS_ROUTES: Routes = [
  {
    path: '',
    // WorkoutController is class-level GYM_OWNER+TRAINER; listExercises/getPlan/
    // getMemberPlans are individually relaxed to also allow MEMBER - the route
    // guard here uses that more permissive read-access set, and create/delete
    // buttons are hidden in the templates for MEMBER (backend still enforces).
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.GYM_OWNER, Role.TRAINER, Role.MEMBER] },
    children: [
      {
        path: 'exercises',
        loadComponent: () =>
          import('./pages/exercise-library/exercise-library.component').then((m) => m.ExerciseLibraryComponent),
        title: 'Exercise Library | FitFlow',
      },
      {
        path: 'plan/:id',
        loadComponent: () =>
          import('./pages/plan-view/plan-view.component').then((m) => m.WorkoutPlanViewComponent),
        title: 'Workout Plan | FitFlow',
      },
      {
        path: 'member/:memberId',
        loadComponent: () =>
          import('./pages/member-plans/member-plans.component').then((m) => m.MemberPlansComponent),
        title: 'Workout Plans | FitFlow',
      },
      {
        path: 'member/:memberId/new',
        // createPlan has no MEMBER relaxation - GYM_OWNER/TRAINER only.
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
        loadComponent: () =>
          import('./pages/plan-form/plan-form.component').then((m) => m.WorkoutPlanFormComponent),
        title: 'New Workout Plan | FitFlow',
      },
    ],
  },
];
