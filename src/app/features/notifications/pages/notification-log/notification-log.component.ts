import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import {
  NOTIFICATION_TYPE_LABELS,
  NotificationChannel,
  NotificationResponse,
  NotificationStatus,
} from '../../../../models/notification.model';
import { PageResponse } from '../../../../models/common.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

/**
 * Covers "Center, Email Logs, WhatsApp Logs, Push" from the original module
 * list as ONE page. The backend has a single GET /notifications endpoint
 * returning every channel mixed together with a `channel` field - there's
 * no separate email-log/whatsapp-log/push endpoint to build separate pages
 * against, and no push notifications exist at all (channel is only ever
 * WHATSAPP today, though EMAIL/SMS exist as enum values for future use).
 * The channel tabs below just filter client-side over the `channel` field.
 */
@Component({
  selector: 'app-notification-log',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, EmptyStateComponent],
  templateUrl: './notification-log.component.html',
  styleUrl: './notification-log.component.css',
})
export class NotificationLogComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pageData = signal<PageResponse<NotificationResponse> | null>(null);

  readonly typeLabels = NOTIFICATION_TYPE_LABELS;
  readonly NotificationStatus = NotificationStatus;
  readonly channelOptions: ('ALL' | NotificationChannel)[] = ['ALL', NotificationChannel.WHATSAPP, NotificationChannel.EMAIL, NotificationChannel.SMS];
  activeChannel: 'ALL' | NotificationChannel = 'ALL';

  memberIdFilter: string | null = null;
  pageNumber = 0;
  readonly pageSize = 20;

  /** Client-side filter over the current page's channel field. */
  readonly filteredContent = computed(() => {
    const page = this.pageData();
    if (!page) return [];
    return this.activeChannel === 'ALL' ? page.content : page.content.filter((n) => n.channel === this.activeChannel);
  });

  ngOnInit(): void {
    this.memberIdFilter = this.route.snapshot.queryParamMap.get('memberId');
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.notificationService
      .list({ memberId: this.memberIdFilter || undefined, page: this.pageNumber, size: this.pageSize })
      .subscribe({
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

  clearMemberFilter(): void {
    this.memberIdFilter = null;
    this.pageNumber = 0;
    this.load();
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  channelIcon(channel: NotificationChannel): string {
    switch (channel) {
      case NotificationChannel.WHATSAPP:
        return '💬';
      case NotificationChannel.EMAIL:
        return '✉️';
      case NotificationChannel.SMS:
        return '📱';
    }
  }
}
