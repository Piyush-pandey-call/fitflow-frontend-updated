import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { GENDER_LABELS, MEMBER_STATUS_LABELS, MemberResponse, MemberStatus } from '../../../../models/member.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Covers both "member-details" and "member-profile" from the original module
 * list - the backend exposes one GET /members/{id} endpoint returning one
 * MemberResponse shape, so there's no separate data source to justify two
 * pages. This single page shows everything: contact info, fitness details,
 * membership snapshot, and status/edit/delete actions.
 */
import { AttendanceService } from '../../../attendance/services/attendance.service';
import { AttendanceResponse } from '../../../../models/attendance.model';
@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './member-details.component.html',
  styleUrl: './member-details.component.css',
})
export class MemberDetailsComponent implements OnInit {
  private attendance = inject(AttendanceService);
  readonly recentVisits = signal<AttendanceResponse[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly member = signal<MemberResponse | null>(null);
  readonly isUpdatingStatus = signal(false);
  readonly isDeleting = signal(false);
  readonly showDeleteConfirm = signal(false);

  readonly statusOptions = Object.values(MemberStatus);
  readonly statusLabels = MEMBER_STATUS_LABELS;
  readonly genderLabels = GENDER_LABELS;
  readonly Role = Role;

  private memberId!: string;

  constructor(
    private memberService: MemberService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id')!;
    this.load();
    this.attendance.getMemberHistory(this.memberId,0,5).subscribe({next:p=>this.recentVisits.set(p.content),error:()=>{}});
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.memberService.getById(this.memberId).subscribe({
      next: (member) => {
        this.member.set(member);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  onStatusChange(status: MemberStatus): void {
    this.isUpdatingStatus.set(true);
    this.memberService.updateStatus(this.memberId, { status }).subscribe({
      next: (member) => {
        this.member.set(member);
        this.isUpdatingStatus.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isUpdatingStatus.set(false);
      },
    });
  }

  confirmDelete(): void {
    this.isDeleting.set(true);
    this.memberService.delete(this.memberId).subscribe({
      next: () => this.router.navigate(['/members']),
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isDeleting.set(false);
        this.showDeleteConfirm.set(false);
      },
    });
  }
}
