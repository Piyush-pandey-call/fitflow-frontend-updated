import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AttendanceService } from '../../services/attendance.service';
import { MemberService } from '../../../members/services/member.service';
import { ATTENDANCE_METHOD_LABELS, AttendanceMethod } from '../../../../enums/attendance-method.enum';
import { AttendanceResponse } from '../../../../models/attendance.model';
import { MemberResponse } from '../../../../models/member.model';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

/**
 * Covers "attendance-reports" from the original module list, scoped to one
 * member at a time (GET /attendance/member/{memberId} is the only history
 * endpoint the backend exposes - there's no "all members' history in one
 * report" endpoint). Reached from the Member Details page.
 */
@Component({
  selector: 'app-attendance-reports',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, EmptyStateComponent],
  templateUrl: './attendance-reports.component.html',
  styleUrl: './attendance-reports.component.css',
})
export class AttendanceReportsComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly member = signal<MemberResponse | null>(null);
  readonly pageData = signal<PageResponse<AttendanceResponse> | null>(null);

  readonly methodLabels = ATTENDANCE_METHOD_LABELS;
  readonly AttendanceMethod = AttendanceMethod;

  pageNumber = 0;
  readonly pageSize = 20;
  private memberId!: string;

  constructor(
    private attendanceService: AttendanceService,
    private memberService: MemberService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('memberId')!;
    this.memberService.getById(this.memberId).subscribe({ next: (m) => this.member.set(m) });
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.attendanceService.getMemberHistory(this.memberId, this.pageNumber, this.pageSize).subscribe({
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

  durationLabel(checkIn: string, checkOut: string): string {
    const minutes = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
  }
}
