import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DietService } from '../../services/diet.service';
import { MemberService } from '../../../members/services/member.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { DietPlanResponse } from '../../../../models/diet.model';
import { MemberResponse } from '../../../../models/member.model';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-diet-member-plans',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, EmptyStateComponent],
  templateUrl: './member-plans.component.html',
  styleUrl: './member-plans.component.css',
})
export class DietMemberPlansComponent implements OnInit {
  private dietService = inject(DietService);
  private memberService = inject(MemberService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly Role = Role;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly member = signal<MemberResponse | null>(null);
  readonly pageData = signal<PageResponse<DietPlanResponse> | null>(null);

  pageNumber = 0;
  readonly pageSize = 10;
  memberId!: string;

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('memberId')!;
    this.memberService.getById(this.memberId).subscribe({ next: (m) => this.member.set(m) });
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dietService.getMemberPlans(this.memberId, this.pageNumber, this.pageSize).subscribe({
      next: (res) => {
        this.pageData.set(res);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }
}
