/** Mirrors com.fitflow.platform.modules.support.entity.SupportTicketStatus */
export enum SupportTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export const SUPPORT_TICKET_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  [SupportTicketStatus.OPEN]: 'Open',
  [SupportTicketStatus.IN_PROGRESS]: 'In Progress',
  [SupportTicketStatus.RESOLVED]: 'Resolved',
  [SupportTicketStatus.CLOSED]: 'Closed',
};

/** Mirrors com.fitflow.platform.modules.support.entity.SupportTicketPriority */
export enum SupportTicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const SUPPORT_TICKET_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  [SupportTicketPriority.LOW]: 'Low',
  [SupportTicketPriority.MEDIUM]: 'Medium',
  [SupportTicketPriority.HIGH]: 'High',
  [SupportTicketPriority.URGENT]: 'Urgent',
};

/** Mirrors CreateSupportTicketRequest */
export interface CreateSupportTicketRequest {
  subject: string;
  description: string;
  priority?: SupportTicketPriority;
}

/** Mirrors UpdateSupportTicketRequest - SUPER_ADMIN only */
export interface UpdateSupportTicketRequest {
  status: SupportTicketStatus;
  resolutionNotes?: string;
}

/** Mirrors SupportTicketResponse */
export interface SupportTicketResponse {
  id: string;
  raisedByGymId: string;
  gymName: string;
  raisedByUserId: string;
  subject: string;
  description: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}
