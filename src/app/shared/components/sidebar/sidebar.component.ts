import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../enums/role.enum';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  roles: Role[];
}

/**
 * One role-aware sidebar instead of four separate layout components
 * (admin-layout/gym-owner-layout/trainer-layout/member-layout from the
 * original doc) - the nav items differ by role, but the chrome around them
 * (width, active-state styling, collapse behavior) doesn't, so a single
 * component filtering its item list is simpler than four near-identical
 * shells.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  public authService = inject(AuthService);

  private readonly allItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: [Role.SUPER_ADMIN, Role.GYM_OWNER, Role.TRAINER, Role.MEMBER] },
    { label: 'Gyms', icon: 'gyms', path: '/admin/gyms', roles: [Role.SUPER_ADMIN] },
    { label: 'Members', icon: 'members', path: '/members', roles: [Role.GYM_OWNER, Role.TRAINER] },
    { label: 'Trainers', icon: 'trainers', path: '/trainers', roles: [Role.GYM_OWNER, Role.TRAINER] },
    { label: 'Attendance', icon: 'attendance', path: '/attendance', roles: [Role.GYM_OWNER, Role.TRAINER] },
    { label: 'Membership Plans', icon: 'plans', path: '/memberships/plans', roles: [Role.GYM_OWNER, Role.TRAINER, Role.MEMBER] },
    { label: 'Payments', icon: 'payments', path: '/payments', roles: [Role.GYM_OWNER, Role.TRAINER] },
    { label: 'Workout & Diet', icon: 'wellness', path: '/wellness', roles: [Role.GYM_OWNER, Role.TRAINER, Role.MEMBER] },
    { label: 'Reports', icon: 'reports', path: '/reports', roles: [Role.GYM_OWNER] },
    { label: 'Notifications', icon: 'notifications', path: '/notifications', roles: [Role.GYM_OWNER, Role.TRAINER] },
    { label: 'Settings', icon: 'settings', path: '/settings', roles: [Role.GYM_OWNER] },
    { label: 'Support', icon: 'support', path: '/support', roles: [Role.SUPER_ADMIN, Role.GYM_OWNER, Role.TRAINER] },
    { label: 'My Profile', icon: 'profile', path: '/profile', roles: [Role.SUPER_ADMIN, Role.TRAINER, Role.MEMBER] },
  ];

  readonly memberItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/member', roles: [Role.MEMBER] },
    { label: 'My membership', icon: 'plans', path: '/dashboard/member', roles: [Role.MEMBER] },
    { label: 'Attendance', icon: 'attendance', path: '/dashboard/member', roles: [Role.MEMBER] },
    { label: 'Workout', icon: 'wellness', path: '/wellness', roles: [Role.MEMBER] },
    { label: 'Diet plan', icon: 'diet', path: '/dashboard/member', roles: [Role.MEMBER] },
    { label: 'Invoices', icon: 'payments', path: '/dashboard/member', roles: [Role.MEMBER] },
    { label: 'My profile', icon: 'profile', path: '/profile', roles: [Role.MEMBER] },
  ];

  readonly iconPaths: Record<string, string> = {
    dashboard: 'M3 3h7v7H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 14h7v7H3z',
    gyms: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 21v-5h6v5 M9 9h.01 M15 9h.01 M9 12h.01 M15 12h.01',
    members: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    trainers: 'M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M5 21a7 7 0 0 1 14 0 M12 2v2 M3 10h2 M19 10h2',
    attendance: 'M8 2v4 M16 2v4 M3 9h18 M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2 M8 14l2.5 2.5L16 11',
    plans: 'M4 5h16 M4 10h16 M4 15h10 M4 20h10 M18 15v6 M15 18h6',
    payments: 'M3 6h18v13H3z M3 10h18 M7 15h4 M17 15h.01 M6 3h12',
    wellness: 'M7 3v4 M17 3v4 M5 7h14v14H5z M8 14h3l2-4 2 7 2-3h2',
    diet: 'M12 21v-8 M12 13C6 13 4 9 4 4c6 0 8 3 8 9 M12 15c0-5 3-8 8-8 0 5-2 8-8 8',
    reports: 'M4 19V5 M4 19h17 M7 15l4-4 3 2 6-7 M16 6h4v4',
    notifications: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
    settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 2.94-.08-.02a1.7 1.7 0 0 0-1.83.56l-.05.07h-3.4l-.04-.07a1.7 1.7 0 0 0-1.83-.56l-.08.02-1.7-2.94.06-.06A1.7 1.7 0 0 0 9.5 15l-.08-.04v-3.4l.08-.04a1.7 1.7 0 0 0-.34-1.88L9.1 9.58l1.7-2.94.08.02a1.7 1.7 0 0 0 1.83-.56l.04-.07h3.4l.05.07a1.7 1.7 0 0 0 1.83.56l.08-.02 1.7 2.94-.06.06A1.7 1.7 0 0 0 19.4 11l.08.04v3.4z',
    support: 'M4 13v-2a8 8 0 0 1 16 0v2 M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2 M20 13h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2 M17 20a5 5 0 0 1-5 2',
    profile: 'M20 21a8 8 0 0 0-16 0 M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10',
  };

  queryFor(label: string): Record<string, string> {
    const sections: Record<string, string> = {
      'My membership': 'membership',
      Attendance: 'attendance',
      'Diet plan': 'diet',
      Invoices: 'payments',
    };
    return sections[label] ? { section: sections[label] } : {};
  }

  get visibleItems(): NavItem[] {
    const role = this.authService.currentUser()?.role;
    if (!role) return [];
    if (role === Role.MEMBER) return this.memberItems;
    return this.allItems.filter((item) => item.roles.includes(role));
  }

}
