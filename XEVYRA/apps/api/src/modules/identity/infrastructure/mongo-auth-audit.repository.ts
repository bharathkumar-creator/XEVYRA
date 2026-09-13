import { Db, Collection } from 'mongodb';
import { IAuthAuditRepository, AuthAuditEvent, AuthEventType } from '@xevyra/domain';

export interface AuditLogDocument {
  _id: string;                         // 'aud_01J...'
  audAction: AuthEventType;
  audUserId?: string;                  // 'usr_01J...'
  audFirebaseUid?: string;
  audIpAddress?: string;
  audUserAgent?: string;
  audMetadata?: Record<string, unknown>;
  audCreatedAt: Date;
}

export class MongoAuthAuditRepository implements IAuthAuditRepository {
  private collection: Collection<AuditLogDocument>;

  constructor(db: Db) {
    this.collection = db.collection<AuditLogDocument>('audit_logs');
  }

  private toDomain(doc: AuditLogDocument): AuthAuditEvent {
    const eventResult = AuthAuditEvent.create(doc._id, {
      eventType: doc.audAction,
      userId: doc.audUserId,
      firebaseUid: doc.audFirebaseUid,
      ipAddress: doc.audIpAddress,
      userAgent: doc.audUserAgent,
      metadata: doc.audMetadata,
      timestamp: doc.audCreatedAt,
    });

    if (eventResult.isFailure) {
      throw new Error(`Failed to reconstitute AuthAuditEvent: ${eventResult.error?.message}`);
    }

    return eventResult.getValue();
  }

  private toDocument(event: AuthAuditEvent): AuditLogDocument {
    return {
      _id: event.id.startsWith('aud_') ? event.id : `aud_${event.id}`,
      audAction: event.eventType,
      audUserId: event.userId,
      audFirebaseUid: event.firebaseUid,
      audIpAddress: event.ipAddress,
      audUserAgent: event.userAgent,
      audMetadata: event.metadata,
      audCreatedAt: event.timestamp,
    };
  }

  public async recordEvent(event: AuthAuditEvent): Promise<void> {
    const doc = this.toDocument(event);
    await this.collection.insertOne(doc);
  }

  public async getRecentEventsByUser(userId: string, limit: number = 20): Promise<AuthAuditEvent[]> {
    const docs = await this.collection
      .find({ audUserId: userId })
      .sort({ audCreatedAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map((d) => this.toDomain(d));
  }
}
