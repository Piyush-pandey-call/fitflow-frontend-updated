import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const SUPPORT_ROUTES: Routes = [
  {
    path: '',
    // SupportTicketController allows SUPER_ADMIN, GYM_OWNER, and TRAINER
    // (each seeing different data - see TicketListComponent). MEMBER has no
    // access on the backend, so it's excluded here too.
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.GYM_OWNER, Role.TRAINER] },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/ticket-list/ticket-list.component').then((m) => m.TicketListComponent),
        title: 'Support | FitFlow',
      },
      {
        path: 'faq',
        loadComponent: () => import('./pages/faq/faq.component').then((m) => m.FaqComponent),
        title: 'Help & FAQ | FitFlow',
      },
      {
        path: 'new',
        // createTicket is GYM_OWNER+TRAINER only (SUPER_ADMIN doesn't raise tickets against itself).
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
        loadComponent: () => import('./pages/ticket-form/ticket-form.component').then((m) => m.TicketFormComponent),
        title: 'New Ticket | FitFlow',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/ticket-detail/ticket-detail.component').then((m) => m.TicketDetailComponent),
        title: 'Ticket Details | FitFlow',
      },
    ],
  },
];
