import { gymDateString } from '../../../../core/utils/date.util';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AttendanceService } from '../../services/attendance.service';
import { MemberService } from '../../../members/services/member.service';
import { ATTENDANCE_METHOD_LABELS, AttendanceMethod } from '../../../../enums/attendance-method.enum';
import { MemberStatus } from '../../../../models/member.model';
import { AttendanceResponse } from '../../../../models/attendance.model';
import { MemberSummaryResponse } from '../../../../models/member.model';
import { PageResponse } from '../../../../models/common.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-attendance-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmptyStateComponent],
  templateUrl: './attendance-dashboard.component.html',
  styleUrl: './attendance-dashboard.component.css',
})
export class AttendanceDashboardComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pageData = signal<PageResponse<AttendanceResponse> | null>(null);

  readonly methodLabels = ATTENDANCE_METHOD_LABELS;
  readonly AttendanceMethod = AttendanceMethod;

  // Date being viewed - defaults to today, matches the backend's default when `date` is omitted.
  selectedDate: string = gymDateString();
  readonly isToday = signal(true);

  // Quick manual check-in widget: type a name, pick a match, check them in.
  memberSearchTerm = '';
  readonly memberResults = signal<MemberSummaryResponse[]>([]);
  readonly isSearchingMembers = signal(false);
  readonly checkingInMemberId = signal<string | null>(null);
  readonly checkingOutId = signal<string | null>(null);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor(private attendanceService: AttendanceService, private memberService: MemberService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isToday.set(this.selectedDate === gymDateString());

    this.attendanceService.getDaily({ date: this.selectedDate, page: 0, size: 50 }).subscribe({
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

  insideNow(): number {return this.pageData()?.content.filter(a=>!a.checkOutTime).length || 0;}
  onDateChange(): void {
    this.load();
  }

  onMemberSearchChange(): void {
    clearTimeout(this.searchDebounce);
    const term = this.memberSearchTerm.trim();

    if (!term) {
      this.memberResults.set([]);
      return;
    }

    this.searchDebounce = setTimeout(() => {
      this.isSearchingMembers.set(true);
      this.memberService
        .list({ search: term, status: MemberStatus.ACTIVE, page: 0, size: 5, sortBy: 'fullName', sortDirection: 'ASC' })
        .subscribe({
          next: (res) => {
            this.memberResults.set(res.content);
            this.isSearchingMembers.set(false);
          },
          error: () => this.isSearchingMembers.set(false),
        });
    }, 350);
  }

  checkInMember(member: MemberSummaryResponse): void {
    this.checkingInMemberId.set(member.id);
    this.attendanceService.checkInManually(member.id).subscribe({
      next: () => {
        this.checkingInMemberId.set(null);
        this.memberSearchTerm = '';
        this.memberResults.set([]);
        this.load();
      },
      error: (err: Error) => {
        this.checkingInMemberId.set(null);
        this.errorMessage.set(err.message);
      },
    });
  }

  checkOut(attendanceId: string): void {
    this.checkingOutId.set(attendanceId);
    this.attendanceService.checkOut(attendanceId).subscribe({
      next: () => {
        this.checkingOutId.set(null);
        this.load();
      },
      error: (err: Error) => {
        this.checkingOutId.set(null);
        this.errorMessage.set(err.message);
      },
    });
  }
}
