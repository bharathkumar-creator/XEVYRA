import { Db, Collection } from 'mongodb';
import { IAuthAuditRepository, AuthAuditEvent, AuthEventType } from '@xevyra/domain';

interface AuthAuditDocument {
  _id: string;
  eventType: AuthEventType;
  userId?: string;
  firebaseUid?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export class MongoAuthAuditRepository implements IAuthAuditRepository {
  private collection: Collection<AuthAuditDocument>;

  constructor(db: Db) {
    this.collection = db.collection<AuthAuditDocument>('auth_audit_logs');
  }

  private toDomain(doc: AuthAuditDocument): AuthAuditEvent {
    const eventResult = AuthAuditEvent.create(doc._id, {
      eventType: doc.eventType,
      userId: doc.userId,
      firebaseUid: doc.firebaseUid,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      metadata: doc.metadata,
      timestamp: doc.timestamp,
    });

    if (eventResult.isFailure) {
      throw new Error(`Failed to reconstitute AuthAuditEvent: ${eventResult.error?.message}`);
    }

    return eventResult.getValue();
  }

  private toDocument(event: AuthAuditEvent): AuthAuditDocument {
    return {
      _id: event.id,
      eventType: event.eventType,
      userId: event.userId,
      firebaseUid: event.firebaseUid,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: event.metadata,
      timestamp: event.timestamp,
    };
  }

  public async recordEvent(event: AuthAuditEvent): Promise<void> {
    const doc = this.toDocument(event);
    await this.collection.insertOne(doc);
  }

  public async getRecentEventsByUser(userId: string, limit: number = 20): Promise<AuthAuditEvent[]> {
    const docs = await this.collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return docs.map((d) => this.toDomain(d));
  }
}
