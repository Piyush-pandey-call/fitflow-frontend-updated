import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../enums/role.enum';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        // GET /attendance/daily, /check-in/manual, /check-out: GYM_OWNER + TRAINER only.
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
        loadComponent: () =>
          import('./pages/attendance-dashboard/attendance-dashboard.component').then(
            (m) => m.AttendanceDashboardComponent
          ),
        title: 'Attendance | FitFlow',
      },
      {
        path: 'qr',
        // POST /attendance/check-in/qr has NO @PreAuthorize on the backend - any authenticated role.
        loadComponent: () =>
          import('./pages/qr-attendance/qr-attendance.component').then((m) => m.QrAttendanceComponent),
        title: 'QR Check-In | FitFlow',
      },
      {
        path: 'analytics',
        // GET /attendance/analytics: GYM_OWNER only.
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER] },
        loadComponent: () =>
          import('./pages/analytics/attendance-analytics.component').then((m) => m.AttendanceAnalyticsComponent),
        title: 'Attendance Analytics | FitFlow',
      },
      {
        path: 'member/:memberId',
        // GET /attendance/member/{id} technically also allows MEMBER, but there's no
        // "get my own memberId" endpoint yet for a MEMBER-role user to resolve who
        // they are in Member terms - see README. Restricting to staff for now.
        canActivate: [roleGuard],
        data: { roles: [Role.GYM_OWNER, Role.TRAINER] },
        loadComponent: () =>
          import('./pages/attendance-reports/attendance-reports.component').then(
            (m) => m.AttendanceReportsComponent
          ),
        title: 'Attendance History | FitFlow',
      },
    ],
  },
];
