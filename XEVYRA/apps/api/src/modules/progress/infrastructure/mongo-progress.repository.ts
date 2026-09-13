import { Db, Collection } from 'mongodb';

export interface BodyweightLogDocument {
  _id: string; // bwl_...
  bwlUserId: string; // usr_...
  bwlDateString: string; // YYYY-MM-DD
  bwlWeightKg: number;
  bwlNotes?: string;
  bwlLoggedAt: Date;
  bwlCreatedAt: Date;
  bwlUpdatedAt: Date;
}

export interface PersonalRecordDocument {
  _id: string; // prc_...
  prcUserId: string; // usr_...
  prcExerciseId: string; // exr_...
  prcExerciseName: string;
  prcCategory: string;
  prcBestWeightKg: number;
  prcBestReps: number;
  prcEstimated1RM: number;
  prcAchievedInSessionId: string; // wse_...
  prcAchievedAt: Date;
  prcUpdatedAt: Date;
}

export class MongoProgressRepository {
  private bodyweightCol: Collection<BodyweightLogDocument>;
  private personalRecordsCol: Collection<PersonalRecordDocument>;

  constructor(private db: Db) {
    this.bodyweightCol = this.db.collection<BodyweightLogDocument>('bodyweight_logs');
    this.personalRecordsCol = this.db.collection<PersonalRecordDocument>('personal_records');
  }

  public async getWeightLogs(userId: string, limit: number = 30): Promise<BodyweightLogDocument[]> {
    return this.bodyweightCol
      .find({ bwlUserId: userId })
      .sort({ bwlDateString: -1 })
      .limit(limit)
      .toArray();
  }

  public async getLatestWeightLog(userId: string): Promise<BodyweightLogDocument | null> {
    return this.bodyweightCol.findOne(
      { bwlUserId: userId },
      { sort: { bwlDateString: -1 } }
    );
  }

  public async logBodyweight(log: BodyweightLogDocument): Promise<void> {
    await this.bodyweightCol.updateOne(
      { bwlUserId: log.bwlUserId, bwlDateString: log.bwlDateString },
      { $set: log },
      { upsert: true }
    );
  }

  public async getPersonalRecords(userId: string): Promise<PersonalRecordDocument[]> {
    return this.personalRecordsCol
      .find({ prcUserId: userId })
      .sort({ prcEstimated1RM: -1 })
      .toArray();
  }

  public async getRecentPRs(userId: string, limit: number = 5): Promise<PersonalRecordDocument[]> {
    return this.personalRecordsCol
      .find({ prcUserId: userId })
      .sort({ prcAchievedAt: -1 })
      .limit(limit)
      .toArray();
  }

  public async upsertPersonalRecord(pr: PersonalRecordDocument): Promise<void> {
    await this.personalRecordsCol.updateOne(
      { _id: pr._id },
      { $set: pr },
      { upsert: true }
    );
  }
}
