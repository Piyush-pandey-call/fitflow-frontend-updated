import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentActivity } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-activities.component.html',
  styleUrl: './recent-activities.component.css',
})
export class RecentActivitiesComponent {
  @Input({ required: true }) activities: RecentActivity[] = [];

  /** Maps each dashboard activity type to a compact line icon and tone. */
  iconFor(type: string): { path: string; tone: string } {
    switch (type) {
      case 'NEW_MEMBER':
        return {
          path: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M16 11h6',
          tone: 'tone-success',
        };
      case 'PAYMENT_RECEIVED':
        return {
          path: 'M3 6h18v13H3z M3 10h18 M7 15h4 M17 15h.01 M12 2v2',
          tone: 'tone-primary',
        };
      case 'MEMBERSHIP_RENEWED':
        return {
          path: 'M20 7v5h-5 M4 17v-5h5 M5.6 9a7 7 0 0 1 11.6-2L20 12 M4 12l2.8 5a7 7 0 0 0 11.6-2',
          tone: 'tone-warning',
        };
      default:
        return {
          path: 'M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.64 5.64l2.12 2.12 M16.24 16.24l2.12 2.12 M18.36 5.64l-2.12 2.12 M7.76 16.24l-2.12 2.12 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
          tone: 'tone-neutral',
        };
    }
  }

  timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
