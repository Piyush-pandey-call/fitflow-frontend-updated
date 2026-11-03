import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatsCardTone = 'primary' | 'success' | 'warning' | 'neutral';

/**
 * Generic metric card reused across every dashboard (gym-owner today;
 * super-admin, and any future role dashboard, reuse the exact same component).
 * Formatting (currency vs plain number) is left to the caller via `value` -
 * this component only renders whatever string/number it's given.
 */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css',
})
export class StatsCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() tone: StatsCardTone = 'primary';
  @Input() hint?: string;

  get iconPath(): string {
    const label = this.label.toLowerCase();
    if (label.includes('member')) {
      return 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M16 11h6';
    }
    if (label.includes('plan') || label.includes('membership')) {
      return 'M4 5h16 M4 10h16 M4 15h10 M4 20h10 M18 15v6 M15 18h6';
    }
    if (label.includes('revenue') || label.includes('payment') || label.includes('invoice')) {
      return 'M3 6h18v13H3z M3 10h18 M7 15h4 M17 15h.01 M12 2v2';
    }
    if (label.includes('attendance') || label.includes('check-in')) {
      return 'M8 2v4 M16 2v4 M3 9h18 M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2 M8 14l2.5 2.5L16 11';
    }
    if (label.includes('workout') || label.includes('diet')) {
      return 'M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.64 5.64l2.12 2.12 M16.24 16.24l2.12 2.12 M18.36 5.64l-2.12 2.12 M7.76 16.24l-2.12 2.12 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8';
    }
    return 'M4 19V5 M4 19h17 M7 15l4-4 3 2 6-7 M16 6h4v4';
  }
}
