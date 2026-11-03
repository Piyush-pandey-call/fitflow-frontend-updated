import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    // ReportController is class-level GYM_OWNER only.
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.GYM_OWNER] },
    loadComponent: () => import('./pages/report-export/report-export.component').then((m) => m.ReportExportComponent),
    title: 'Reports | FitFlow',
  },
];
