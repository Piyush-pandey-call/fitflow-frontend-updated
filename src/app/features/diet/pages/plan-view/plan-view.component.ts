import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DietService } from '../../services/diet.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { DietItemResponse, DietPlanResponse } from '../../../../models/diet.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-diet-plan-view',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './plan-view.component.html',
  styleUrl: './plan-view.component.css',
})
export class DietPlanViewComponent implements OnInit {
  private dietService = inject(DietService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly Role = Role;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly plan = signal<DietPlanResponse | null>(null);
  readonly showDeactivateConfirm = signal(false);
  readonly isDeactivating = signal(false);
  readonly isDownloading = signal(false);

  /** Groups the flat items[] into { mealType -> items[] }, preserving first-seen meal order. */
  readonly itemsByMeal = computed(() => {
    const p = this.plan();
    if (!p) return [] as { mealType: string; items: DietItemResponse[] }[];

    const grouped = new Map<string, DietItemResponse[]>();
    for (const item of p.items) {
      if (!grouped.has(item.mealType)) grouped.set(item.mealType, []);
      grouped.get(item.mealType)!.push(item);
    }
    return Array.from(grouped.entries()).map(([mealType, items]) => ({ mealType, items }));
  });

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('id')!;
    this.load(planId);
  }

  load(planId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dietService.getPlan(planId).subscribe({
      next: (p) => {
        this.plan.set(p);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  downloadPdf(): void {
    const p = this.plan();
    if (!p) return;
    this.isDownloading.set(true);
    this.dietService.downloadPdf(p.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diet-plan-${p.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isDownloading.set(false);
      },
    });
  }

  confirmDeactivate(): void {
    const p = this.plan();
    if (!p) return;
    this.isDeactivating.set(true);
    this.dietService.deactivatePlan(p.id).subscribe({
      next: () => this.router.navigate(['/diet/member', p.memberId]),
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isDeactivating.set(false);
        this.showDeactivateConfirm.set(false);
      },
    });
  }
}
