import { Db, Collection } from 'mongodb';
import { IUserRepository, User, Email } from '@xevyra/domain';

export interface UserDocument {
  _id: string;                         // 'usr_01J...'
  usrFirebaseUid: string;
  usrEmail: string;
  usrDisplayName: string;
  usrAvatarUrl?: string;
  usrTimezone?: string;
  usrRole: 'USER' | 'TRAINER' | 'ADMIN';
  usrIsActive: boolean;
  usrCreatedAt: Date;
  usrUpdatedAt: Date;
}

export class MongoUserRepository implements IUserRepository {
  private collection: Collection<UserDocument>;

  constructor(db: Db) {
    this.collection = db.collection<UserDocument>('users');
  }

  private toDomain(doc: UserDocument): User {
    const emailResult = Email.create(doc.usrEmail);
    if (emailResult.isFailure) {
      throw new Error(`Corrupted email in database: ${doc.usrEmail}`);
    }

    const userResult = User.create({
      id: doc._id,
      firebaseUid: doc.usrFirebaseUid,
      email: emailResult.getValue(),
      displayName: doc.usrDisplayName,
      avatarUrl: doc.usrAvatarUrl,
      timezone: doc.usrTimezone,
      role: doc.usrRole,
      isActive: doc.usrIsActive,
      createdAt: doc.usrCreatedAt,
      updatedAt: doc.usrUpdatedAt,
    });

    if (userResult.isFailure) {
      throw new Error(`Failed to reconstitute user from DB: ${userResult.error?.message}`);
    }

    return userResult.getValue();
  }

  private toDocument(user: User): UserDocument {
    return {
      _id: user.id,
      usrFirebaseUid: user.firebaseUid,
      usrEmail: user.email.value.toLowerCase(),
      usrDisplayName: user.displayName,
      usrAvatarUrl: user.avatarUrl,
      usrTimezone: user.timezone,
      usrRole: user.role,
      usrIsActive: user.isActive,
      usrCreatedAt: user.createdAt,
      usrUpdatedAt: user.updatedAt,
    };
  }

  public async findById(id: string): Promise<User | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? this.toDomain(doc) : null;
  }

  public async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const doc = await this.collection.findOne({ usrFirebaseUid: firebaseUid });
    return doc ? this.toDomain(doc) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const doc = await this.collection.findOne({ usrEmail: email.toLowerCase() });
    return doc ? this.toDomain(doc) : null;
  }

  public async save(user: User): Promise<void> {
    const doc = this.toDocument(user);
    await this.collection.updateOne(
      { _id: user.id },
      { $set: doc },
      { upsert: true }
    );
  }

  public async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }
}
