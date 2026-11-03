/** Mirrors com.fitflow.platform.modules.notification.entity.NotificationChannel */
export enum NotificationChannel {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

/** Mirrors com.fitflow.platform.modules.notification.entity.NotificationType */
export enum NotificationType {
  WELCOME_MESSAGE = 'WELCOME_MESSAGE',
  MEMBERSHIP_EXPIRY_REMINDER = 'MEMBERSHIP_EXPIRY_REMINDER',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  BIRTHDAY_WISH = 'BIRTHDAY_WISH',
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.WELCOME_MESSAGE]: 'Welcome Message',
  [NotificationType.MEMBERSHIP_EXPIRY_REMINDER]: 'Membership Expiry Reminder',
  [NotificationType.PAYMENT_REMINDER]: 'Payment Reminder',
  [NotificationType.PAYMENT_CONFIRMATION]: 'Payment Confirmation',
  [NotificationType.BIRTHDAY_WISH]: 'Birthday Wish',
};

/** Mirrors com.fitflow.platform.modules.notification.entity.NotificationStatus - delivery status, not "read" status (there is no read/unread concept on the backend). */
export enum NotificationStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
}

/** Mirrors NotificationResponse */
export interface NotificationResponse {
  id: string;
  recipientMemberId?: string;
  recipientContact?: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  content: string;
  createdAt: string;
}

/** Query params for GET /notifications - mirrors NotificationController#listNotifications exactly. */
export interface ListNotificationsQuery {
  memberId?: string;
  page: number;
  size: number;
}
