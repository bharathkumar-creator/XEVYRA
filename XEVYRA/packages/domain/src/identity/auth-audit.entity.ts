import { Entity } from '../common/entity.js';
import { Result } from '../common/result.js';
import { DomainError } from '../common/result.js';

export type AuthEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'FORBIDDEN_ACCESS_ATTEMPT';

export interface AuthAuditEventProps {
  eventType: AuthEventType;
  userId?: string;
  firebaseUid?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export class AuthAuditEvent extends Entity<AuthAuditEventProps> {
  get eventType(): AuthEventType {
    return this.props.eventType;
  }
  get userId(): string | undefined {
    return this.props.userId;
  }
  get firebaseUid(): string | undefined {
    return this.props.firebaseUid;
  }
  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }
  get userAgent(): string | undefined {
    return this.props.userAgent;
  }
  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }
  get timestamp(): Date {
    return this.props.timestamp;
  }

  private constructor(id: string, props: AuthAuditEventProps) {
    super(id, props);
  }

  public static create(id: string, props: AuthAuditEventProps): Result<AuthAuditEvent, DomainError> {
    if (!props.eventType) {
      return Result.fail(new DomainError('Event type is required for auth audit', 'INVALID_AUDIT_EVENT'));
    }
    return Result.ok(new AuthAuditEvent(id, props));
  }
}

export interface IAuthAuditRepository {
  recordEvent(event: AuthAuditEvent): Promise<void>;
  getRecentEventsByUser(userId: string, limit?: number): Promise<AuthAuditEvent[]>;
}
