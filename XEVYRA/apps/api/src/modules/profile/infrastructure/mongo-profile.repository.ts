import { Db, Collection } from 'mongodb';

export interface UserProfileDocument {
  _id: string;                         // 'upr_01J...'
  uprUserId: string;                   // 'usr_01J...'
  uprBiometrics: {
    uprHeightCm: number;
    uprCurrentWeightKg: number;
    uprBirthDate?: string;
    uprGender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    uprActivityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'ATHLETE';
  };
  uprFitness: {
    uprWeeklyWorkoutTarget: number;
    uprTrainingExperience?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  };
  uprPreferences: {
    uprPreferredCuisine?: 'AMERICAN' | 'NORTH_INDIAN' | 'SOUTH_INDIAN' | 'MEDITERRANEAN' | 'ASIAN';
    uprPreferredUnits: 'METRIC' | 'IMPERIAL';
    uprTimezone: string;
  };
  uprCreatedAt: Date;
  uprUpdatedAt: Date;
}

export interface UserProfileData {
  id: string;
  userId: string;
  heightCm: number;
  currentWeightKg: number;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'ATHLETE';
  weeklyWorkoutTarget: number;
  trainingExperience?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  preferredCuisine: 'AMERICAN' | 'NORTH_INDIAN' | 'SOUTH_INDIAN' | 'MEDITERRANEAN' | 'ASIAN';
  preferredUnits: 'METRIC' | 'IMPERIAL';
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoProfileRepository {
  private collection: Collection<UserProfileDocument>;

  constructor(db: Db) {
    this.collection = db.collection<UserProfileDocument>('user_profiles');
  }

  private toDomain(doc: UserProfileDocument): UserProfileData {
    return {
      id: doc._id,
      userId: doc.uprUserId,
      heightCm: doc.uprBiometrics.uprHeightCm,
      currentWeightKg: doc.uprBiometrics.uprCurrentWeightKg,
      birthDate: doc.uprBiometrics.uprBirthDate,
      gender: doc.uprBiometrics.uprGender,
      activityLevel: doc.uprBiometrics.uprActivityLevel,
      weeklyWorkoutTarget: doc.uprFitness.uprWeeklyWorkoutTarget,
      trainingExperience: doc.uprFitness.uprTrainingExperience,
      preferredCuisine: doc.uprPreferences.uprPreferredCuisine || 'AMERICAN',
      preferredUnits: doc.uprPreferences.uprPreferredUnits,
      timezone: doc.uprPreferences.uprTimezone || 'UTC',
      createdAt: doc.uprCreatedAt,
      updatedAt: doc.uprUpdatedAt,
    };
  }

  private toDocument(data: UserProfileData): UserProfileDocument {
    return {
      _id: data.id.startsWith('upr_') ? data.id : `upr_${data.id}`,
      uprUserId: data.userId,
      uprBiometrics: {
        uprHeightCm: data.heightCm,
        uprCurrentWeightKg: data.currentWeightKg,
        uprBirthDate: data.birthDate,
        uprGender: data.gender,
        uprActivityLevel: data.activityLevel,
      },
      uprFitness: {
        uprWeeklyWorkoutTarget: data.weeklyWorkoutTarget,
        uprTrainingExperience: data.trainingExperience,
      },
      uprPreferences: {
        uprPreferredCuisine: data.preferredCuisine,
        uprPreferredUnits: data.preferredUnits,
        uprTimezone: data.timezone,
      },
      uprCreatedAt: data.createdAt,
      uprUpdatedAt: data.updatedAt,
    };
  }

  public async findByUserId(userId: string): Promise<UserProfileData | null> {
    const doc = await this.collection.findOne({ uprUserId: userId });
    return doc ? this.toDomain(doc) : null;
  }

  public async save(data: UserProfileData): Promise<void> {
    const doc = this.toDocument(data);
    await this.collection.updateOne(
      { uprUserId: data.userId },
      { $set: doc },
      { upsert: true }
    );
  }
}
