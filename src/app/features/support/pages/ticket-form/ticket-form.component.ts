import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupportTicketService } from '../../services/support-ticket.service';
import { SUPPORT_TICKET_PRIORITY_LABELS, SupportTicketPriority } from '../../../../models/support.model';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.css',
})
export class TicketFormComponent {
  private fb = inject(FormBuilder);
  private supportTicketService = inject(SupportTicketService);
  private router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly priorityOptions = Object.values(SupportTicketPriority);
  readonly priorityLabels = SUPPORT_TICKET_PRIORITY_LABELS;

  readonly form = this.fb.group({
    subject: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    priority: [SupportTicketPriority.MEDIUM],
  });

  constructor(){const subject=inject(ActivatedRoute).snapshot.queryParamMap.get('subject');if(subject)this.form.patchValue({subject});}
  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    this.supportTicketService
      .create({ subject: raw.subject!, description: raw.description!, priority: raw.priority! })
      .subscribe({
        next: (ticket) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/support', ticket.id]);
        },
        error: (err: Error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.message);
        },
      });
  }
}
