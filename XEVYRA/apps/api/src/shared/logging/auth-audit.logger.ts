import { AuthAuditEvent, IAuthAuditRepository, AuthEventType } from '@xevyra/domain';
import { generateId } from '@xevyra/shared';
import { Logger } from './logger.js';

export interface RecordAuthAuditParams {
  eventType: AuthEventType;
  userId?: string;
  firebaseUid?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export class AuthAuditLogger {
  constructor(private auditRepository?: IAuthAuditRepository) {}

  public async logEvent(params: RecordAuthAuditParams): Promise<void> {
    const sanitizedMeta = params.metadata ? { ...params.metadata } : {};
    // Ensure credentials and tokens are strictly excluded from logs
    delete sanitizedMeta.token;
    delete sanitizedMeta.password;
    delete sanitizedMeta.privateKey;
    delete sanitizedMeta.idToken;

    Logger.info(`[AUTH_AUDIT] ${params.eventType}`, {
      userId: params.userId,
      firebaseUid: params.firebaseUid,
      ip: params.ipAddress,
      meta: sanitizedMeta,
    });

    if (this.auditRepository) {
      try {
        const eventResult = AuthAuditEvent.create(generateId('audit'), {
          eventType: params.eventType,
          userId: params.userId,
          firebaseUid: params.firebaseUid,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          metadata: sanitizedMeta,
          timestamp: new Date(),
        });

        if (eventResult.isSuccess) {
          await this.auditRepository.recordEvent(eventResult.getValue());
        }
      } catch (error) {
        Logger.error('Failed to persist auth audit event to database', { error });
      }
    }
  }
}
