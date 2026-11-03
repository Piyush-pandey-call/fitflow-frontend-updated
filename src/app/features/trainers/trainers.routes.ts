import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const TRAINERS_ROUTES: Routes = [
  {
    path: '',
    // TrainerController is class-level @PreAuthorize("hasRole('GYM_OWNER')"), but
    // get/list/assignable are individually relaxed to allow TRAINER too - the
    // route guard here uses the more permissive set (view access); create/edit/
    // delete buttons are hidden for TRAINER in the templates, and the backend
    // still rejects those calls server-side if bypassed.
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/trainer-list/trainer-list.component').then((m) => m.TrainerListComponent),
        title: 'Trainers | FitFlow',
      },
      {
        path: 'new',
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER] },
        loadComponent: () =>
          import('./pages/trainer-form/trainer-form.component').then((m) => m.TrainerFormComponent),
        title: 'Add Trainer | FitFlow',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/trainer-details/trainer-details.component').then((m) => m.TrainerDetailsComponent),
        title: 'Trainer Details | FitFlow',
      },
      {
        path: ':id/edit',
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER] },
        loadComponent: () =>
          import('./pages/trainer-form/trainer-form.component').then((m) => m.TrainerFormComponent),
        title: 'Edit Trainer | FitFlow',
      },
    ],
  },
];
