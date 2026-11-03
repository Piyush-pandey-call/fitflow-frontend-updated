import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupportTicketService } from '../../services/support-ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../enums/role.enum';
import {
  SUPPORT_TICKET_STATUS_LABELS,
  SupportTicketResponse,
  SupportTicketStatus,
} from '../../../../models/support.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css',
})
export class TicketDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supportTicketService = inject(SupportTicketService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly Role = Role;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly ticket = signal<SupportTicketResponse | null>(null);
  readonly statusLabels = SUPPORT_TICKET_STATUS_LABELS;
  readonly statusOptions = Object.values(SupportTicketStatus);
  readonly isSubmitting = signal(false);

  readonly updateForm = this.fb.group({
    status: [SupportTicketStatus.OPEN, [Validators.required]],
    resolutionNotes: ['', [Validators.maxLength(2000)]],
  });

  private ticketId!: string;

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.supportTicketService.getById(this.ticketId).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.updateForm.patchValue({ status: t.status, resolutionNotes: t.resolutionNotes ?? '' });
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  submitUpdate(): void {
    if (this.updateForm.invalid) return;
    this.isSubmitting.set(true);
    const raw = this.updateForm.getRawValue();
    this.supportTicketService
      .update(this.ticketId, { status: raw.status!, resolutionNotes: raw.resolutionNotes || undefined })
      .subscribe({
        next: (t) => {
          this.ticket.set(t);
          this.isSubmitting.set(false);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.isSubmitting.set(false);
        },
      });
  }

  statusTone(status: SupportTicketStatus): string {
    switch (status) {
      case SupportTicketStatus.OPEN:
        return 'badge-warning';
      case SupportTicketStatus.IN_PROGRESS:
        return 'badge-primary';
      case SupportTicketStatus.RESOLVED:
        return 'badge-success';
      case SupportTicketStatus.CLOSED:
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
  }
}
