import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GymAdminService } from '../../services/gym-admin.service';
import { GymResponse, GYM_STATUS_LABELS } from '../../../../models/gym.model';
import { MemberSummaryResponse, MEMBER_STATUS_LABELS } from '../../../../models/member.model';
import { TrainerResponse } from '../../../../models/trainer.model';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

type Tab = 'members' | 'trainers';

@Component({
  selector: 'app-gym-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, EmptyStateComponent],
  templateUrl: './gym-detail.component.html',
  styleUrl: './gym-detail.component.css',
})
export class GymDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gymAdminService = inject(GymAdminService);
  private router = inject(Router);

  readonly statusLabels = GYM_STATUS_LABELS;
  readonly memberStatusLabels = MEMBER_STATUS_LABELS;

  readonly gym = signal<GymResponse | null>(null);
  readonly gymError = signal<string | null>(null);

  readonly activeTab = signal<Tab>('members');

  readonly isLoadingList = signal(true);
  readonly listError = signal<string | null>(null);
  readonly membersPage = signal<PageResponse<MemberSummaryResponse> | null>(null);
  readonly trainersPage = signal<PageResponse<TrainerResponse> | null>(null);

  gymId!: string;
  pageNumber = 0;
  readonly pageSize = 20;

  // ---- Manual plan activation (after confirming the owner's payment) ----
  readonly plans = signal<{ id: string; name: string }[]>([]);
  readonly activatePlanId = signal('');
  readonly activateCycle = signal<'MONTHLY' | 'HALF_YEARLY' | 'YEARLY'>('MONTHLY');
  readonly isActivating = signal(false);
  readonly activateMessage = signal<string | null>(null);
  readonly activateError = signal<string | null>(null);
  readonly isDeleting = signal(false);

  deleteGym(): void {
    const gym = this.gym();
    if (!gym || !confirm(`Permanently delete ${gym.name} and all of its data? This cannot be undone.`)) return;
    this.isDeleting.set(true);
    this.gymAdminService.deleteGym(this.gymId).subscribe({
      next: () => this.router.navigate(['/admin/gyms']),
      error: (err: Error) => {
        this.isDeleting.set(false);
        this.gymError.set(err.message);
      }
    });
  }

  activatePlan(): void {
    if (!this.activatePlanId()) return;
    this.isActivating.set(true);
    this.activateMessage.set(null);
    this.activateError.set(null);
    this.gymAdminService.activatePlan(this.gymId, this.activatePlanId(), this.activateCycle()).subscribe({
      next: () => {
        this.isActivating.set(false);
        this.activateMessage.set('Plan activated. The owner has full access again.');
        this.gymAdminService.getGym(this.gymId).subscribe((g) => this.gym.set(g));
      },
      error: (err: Error) => {
        this.isActivating.set(false);
        this.activateError.set(err.message);
      },
    });
  }

  ngOnInit(): void {
    this.gymAdminService.listActiveSaasPlans().subscribe({
      next: (list) => {
        const paid = list.filter((p) => p.name.toLowerCase() !== 'trial');
        this.plans.set(paid);
        if (paid.length) this.activatePlanId.set(paid[0].id);
      },
      error: () => this.plans.set([]),
    });
    this.gymId = this.route.snapshot.paramMap.get('id')!;
    this.gymAdminService.getGym(this.gymId).subscribe({
      next: (g) => this.gym.set(g),
      error: (err: Error) => this.gymError.set(err.message),
    });
    this.loadActiveTab();
  }

  setTab(tab: Tab): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.pageNumber = 0;
    this.loadActiveTab();
  }

  loadActiveTab(): void {
    this.isLoadingList.set(true);
    this.listError.set(null);
    if (this.activeTab() === 'members') {
      this.gymAdminService.getGymMembers(this.gymId, null, '', this.pageNumber, this.pageSize).subscribe({
        next: (res) => {
          this.membersPage.set(res);
          this.isLoadingList.set(false);
        },
        error: (err: Error) => {
          this.listError.set(err.message);
          this.isLoadingList.set(false);
        },
      });
    } else {
      this.gymAdminService.getGymTrainers(this.gymId, null, this.pageNumber, this.pageSize).subscribe({
        next: (res) => {
          this.trainersPage.set(res);
          this.isLoadingList.set(false);
        },
        error: (err: Error) => {
          this.listError.set(err.message);
          this.isLoadingList.set(false);
        },
      });
    }
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadActiveTab();
  }
}
