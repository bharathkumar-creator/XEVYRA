import { Db, Collection } from 'mongodb';
import { IUserRepository, User, Email } from '@xevyra/domain';

interface UserDocument {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  timezone: string;
  role: 'USER' | 'TRAINER' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoUserRepository implements IUserRepository {
  private collection: Collection<UserDocument>;

  constructor(db: Db) {
    this.collection = db.collection<UserDocument>('users');
  }

  private toDomain(doc: UserDocument): User {
    const emailResult = Email.create(doc.email);
    if (emailResult.isFailure) {
      throw new Error(`Corrupted email in database: ${doc.email}`);
    }

    const userResult = User.create({
      id: doc._id,
      firebaseUid: doc.firebaseUid,
      email: emailResult.getValue(),
      displayName: doc.displayName,
      avatarUrl: doc.avatarUrl,
      timezone: doc.timezone,
      role: doc.role,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });

    if (userResult.isFailure) {
      throw new Error(`Failed to reconstitute user from DB: ${userResult.error?.message}`);
    }

    return userResult.getValue();
  }

  private toDocument(user: User): UserDocument {
    return {
      _id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email.value,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async findById(id: string): Promise<User | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? this.toDomain(doc) : null;
  }

  public async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const doc = await this.collection.findOne({ firebaseUid });
    return doc ? this.toDomain(doc) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const doc = await this.collection.findOne({ email: email.toLowerCase() });
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
