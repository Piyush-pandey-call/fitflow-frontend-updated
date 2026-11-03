import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Covers "Help" and "FAQ" from the original doc. There is no backend
 * endpoint for FAQ/help content (SupportTicketController only handles
 * tickets) - this is plain static content in the frontend, same as any
 * marketing/help page would be. "Contact" from the same doc entry is the
 * real backed feature: raising a ticket via ticket-form.
 */
@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent {
  readonly faqs: FaqItem[] = [
    {
      question: 'How do I add a new member?',
      answer: 'Go to Members from your dashboard, then click "+ Add Member". Fill in their details and save.',
    },
    {
      question: 'How does a member get billed?',
      answer:
        'Assign or renew a membership plan from the member\'s Membership page. This creates a pending payment. ' +
        'Complete it with "Pay Now" (Razorpay) or "Record Offline Payment" for cash/bank transfer.',
    },
    {
      question: 'Can a trainer see all members, or just their own?',
      answer:
        'Trainers can view all members and edit ones they work with, same as gym owners, except for actions ' +
        'restricted to owners (deleting members/trainers, changing settings, refunds).',
    },
    {
      question: 'How do I check a member in?',
      answer:
        'Use the Attendance section: "QR Check-In" for a badge scanner at the front desk, or search-and-check-in ' +
        'manually from the Attendance dashboard.',
    },
    {
      question: 'Where do I download reports?',
      answer: 'Reports (Revenue, Attendance, Membership, Trainer) are available as PDF or Excel from the Reports page.',
    },
    {
      question: "I can't find the answer to my question here.",
      answer: 'Raise a support ticket and the FitFlow team will get back to you.',
    },
  ];
}
