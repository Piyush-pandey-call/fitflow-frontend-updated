import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const DIET_ROUTES: Routes = [
  {
    path: '',
    // DietController is class-level GYM_OWNER+TRAINER; get/list/pdf are
    // individually relaxed to also allow MEMBER.
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.GYM_OWNER, Role.TRAINER, Role.MEMBER] },
    children: [
      {
        path: 'plan/:id',
        loadComponent: () => import('./pages/plan-view/plan-view.component').then((m) => m.DietPlanViewComponent),
        title: 'Diet Plan | FitFlow',
      },
      {
        path: 'member/:memberId',
        loadComponent: () =>
          import('./pages/member-plans/member-plans.component').then((m) => m.DietMemberPlansComponent),
        title: 'Diet Plans | FitFlow',
      },
      {
        path: 'member/:memberId/new',
        // createPlan has no MEMBER relaxation - GYM_OWNER/TRAINER only.
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
        loadComponent: () => import('./pages/plan-form/plan-form.component').then((m) => m.DietPlanFormComponent),
        title: 'New Diet Plan | FitFlow',
      },
    ],
  },
];
