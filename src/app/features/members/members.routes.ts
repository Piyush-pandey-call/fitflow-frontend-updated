import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const MEMBERS_ROUTES: Routes = [
  {
    path: '',
    // MemberController is class-level @PreAuthorize("hasAnyRole('GYM_OWNER', 'TRAINER')") -
    // every route in this feature gets that same restriction here.
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/member-list/member-list.component').then((m) => m.MemberListComponent),
        title: 'Members | FitFlow',
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/member-form/member-form.component').then((m) => m.MemberFormComponent),
        title: 'Add Member | FitFlow',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/member-details/member-details.component').then((m) => m.MemberDetailsComponent),
        title: 'Member Details | FitFlow',
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/member-form/member-form.component').then((m) => m.MemberFormComponent),
        title: 'Edit Member | FitFlow',
      },
    ],
  },
];
