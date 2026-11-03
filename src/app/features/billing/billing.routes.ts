import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

/**
 * FitFlow SaaS billing (the gym owner paying FitFlow) - deliberately GYM_OWNER
 * only. "The subscription model should only be visible to the gym owner and
 * the super admin; it should not be visible to the members." TRAINER is also
 * excluded here since they don't own the gym's billing relationship either.
 */
export const BILLING_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.GYM_OWNER] },
    children: [
      {
        path: 'pricing',
        loadComponent: () => import('./pages/pricing/pricing.component').then((m) => m.PricingComponent),
        title: 'Choose your FitFlow plan | FitFlow',
      },
      {path:'checkout',loadComponent:()=>import('./pages/checkout/checkout.component').then(m=>m.CheckoutComponent),title:'Complete your purchase | FitFlow'},
      {
        path: 'expired',
        loadComponent: () => import('./pages/expired/expired.component').then((m) => m.ExpiredComponent),
        title: 'Trial ended | FitFlow',
      },
      { path: '', redirectTo: 'pricing', pathMatch: 'full' },
    ],
  },
];
