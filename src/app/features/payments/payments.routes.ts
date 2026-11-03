import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    // get/list on PaymentController: GYM_OWNER + TRAINER only. Refund is
    // further restricted to GYM_OWNER (hidden in the template).
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/payment-list/payment-list.component').then((m) => m.PaymentListComponent),
        title: 'Payments | FitFlow',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/payment-detail/payment-detail.component').then((m) => m.PaymentDetailComponent),
        title: 'Payment Details | FitFlow',
      },
    ],
  },
];
