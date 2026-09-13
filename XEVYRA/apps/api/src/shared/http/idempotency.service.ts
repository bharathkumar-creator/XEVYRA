import { Db, Collection } from 'mongodb';

export interface IdempotencyRecordDocument {
  _id: string; // idk_...
  idkUserId: string; // usr_...
  idkKey: string;
  idkEndpoint: string;
  idkStatusCode: number;
  idkResponsePayload: any;
  idkCreatedAt: Date;
  idkExpiresAt: Date;
}

export class IdempotencyService {
  private collection?: Collection<IdempotencyRecordDocument>;
  private inMemoryCache: Map<string, IdempotencyRecordDocument> = new Map();

  constructor(db?: Db) {
    if (db) {
      this.collection = db.collection<IdempotencyRecordDocument>('idempotency_keys');
    }
  }

  public async getRecord(userId: string, key: string): Promise<IdempotencyRecordDocument | null> {
    if (this.collection) {
      return this.collection.findOne({ idkUserId: userId, idkKey: key });
    }
    return this.inMemoryCache.get(`${userId}:${key}`) || null;
  }

  public async saveRecord(
    userId: string,
    key: string,
    endpoint: string,
    statusCode: number,
    responsePayload: any
  ): Promise<void> {
    const doc: IdempotencyRecordDocument = {
      _id: `idk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      idkUserId: userId,
      idkKey: key,
      idkEndpoint: endpoint,
      idkStatusCode: statusCode,
      idkResponsePayload: responsePayload,
      idkCreatedAt: new Date(),
      idkExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h TTL
    };

    if (this.collection) {
      await this.collection.updateOne(
        { idkUserId: userId, idkKey: key },
        { $set: doc },
        { upsert: true }
      );
    } else {
      this.inMemoryCache.set(`${userId}:${key}`, doc);
    }
  }
}
