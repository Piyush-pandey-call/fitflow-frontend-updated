import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-trial-expired',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './expired.component.html',
  styleUrl: './expired.component.css',
})
export class ExpiredComponent {
  readonly quickPlans = [
    { label: '1 MONTH', price: 'Rs 999' },
    { label: '6 MONTHS', price: 'Rs 4,999' },
    { label: '1 YEAR', price: 'Rs 8,999' },
  ];

  constructor(private router: Router) {}

  goToPricing(): void {
    this.router.navigate(['/billing/pricing']);
  }
}
