import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

type ViewState = 'awaiting-link' | 'verifying' | 'success' | 'error';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly state = signal<ViewState>('awaiting-link');
  readonly errorMessage = signal<string | null>(null);
  readonly resendSent = signal(false);
  readonly isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    // Two ways to land here:
    // 1) fresh registration redirect (no token yet) -> "check your inbox" message
    // 2) clicking the emailed link  /auth/verify-email?token=xxxxx -> auto-verify
    if (token) {
      this.state.set('verifying');
      this.authService.verifyEmail({ token }).subscribe({
        next: () => this.state.set('success'),
        error: (err: Error) => {
          this.state.set('error');
          this.errorMessage.set(err.message);
        },
      });
    }
  }

  resend(): void {
    this.authService.resendVerification().subscribe({
      next: () => this.resendSent.set(true),
      error: (err: Error) => this.errorMessage.set(err.message),
    });
  }
}
