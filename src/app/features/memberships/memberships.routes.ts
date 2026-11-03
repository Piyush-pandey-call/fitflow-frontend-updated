import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const MEMBERSHIPS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'plans',
        // GET /membership-plans allows MEMBER too (they can see what's on offer).
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER, Role.TRAINER, Role.MEMBER] },
        loadComponent: () => import('./pages/plan-list/plan-list.component').then((m) => m.PlanListComponent),
        title: 'Membership Plans | FitFlow',
      },
      {
        path: 'plans/new',
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER] },
        loadComponent: () => import('./pages/plan-form/plan-form.component').then((m) => m.PlanFormComponent),
        title: 'New Plan | FitFlow',
      },
      {
        path: 'expiring',
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
        loadComponent: () => import('./pages/expiring/expiring.component').then((m) => m.ExpiringComponent),
        title: 'Expiring memberships | FitFlow',
      },
      {
        path: 'plans/:id/members',
        // Gym owner requirement: see every member (current + past) on a given plan.
        // Matches GET /membership-plans/{planId}/members - GYM_OWNER + TRAINER.
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
        loadComponent: () =>
          import('./pages/plan-members/plan-members.component').then((m) => m.PlanMembersComponent),
        title: 'Plan Members | FitFlow',
      },
      {
        path: 'plans/:id/edit',
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER] },
        loadComponent: () => import('./pages/plan-form/plan-form.component').then((m) => m.PlanFormComponent),
        title: 'Edit Plan | FitFlow',
      },
      {
        path: 'member/:memberId',
        // MemberMembershipController is class-level GYM_OWNER + TRAINER; assign/
        // renew/cancel are further restricted to GYM_OWNER only (hidden in the UI).
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
        loadComponent: () =>
          import('./pages/member-membership/member-membership.component').then((m) => m.MemberMembershipComponent),
        title: 'Membership | FitFlow',
      },
    ],
  },
];
