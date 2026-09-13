import 'dotenv/config';
import { loadApiConfig } from '@xevyra/config';
import { MongoDatabase } from '../shared/database/mongo.client.js';
import { MONGO_INDEXES } from '../../../../database/indexes/mongo-indexes.js';
import { Logger } from '../shared/logging/logger.js';

interface VerificationResult {
  atlasConnected: boolean;
  pingSuccess: boolean;
  dbName: string;
  collectionsFound: string[];
  missingCollections: string[];
  indexesVerified: boolean;
  missingIndexes: string[];
  crudCreate: boolean;
  crudRead: boolean;
  crudUpdate: boolean;
  crudDelete: boolean;
  isPrefixConventionEnforced: boolean;
  error?: string;
}

export async function runAtlasVerification(): Promise<VerificationResult> {
  const result: VerificationResult = {
    atlasConnected: false,
    pingSuccess: false,
    dbName: '',
    collectionsFound: [],
    missingCollections: [],
    indexesVerified: false,
    missingIndexes: [],
    crudCreate: false,
    crudRead: false,
    crudUpdate: false,
    crudDelete: false,
    isPrefixConventionEnforced: false,
  };

  const config = loadApiConfig();
  result.dbName = config.MONGODB_DB_NAME;

  if (!config.MONGODB_URI || config.MONGODB_URI.includes('localhost')) {
    result.error = 'MONGODB_URI is not configured for MongoDB Atlas (currently missing or set to localhost)';
    return result;
  }

  const mongoDb = MongoDatabase.getInstance();

  try {
    // 1. Real MongoDB Atlas Connection
    const db = await mongoDb.connect(config);
    result.atlasConnected = true;

    // 2. Ping
    const pingRes = await db.command({ ping: 1 });
    result.pingSuccess = pingRes.ok === 1;

    // 3. Inspect Collections
    const existingCols = await db.listCollections().toArray();
    const existingColNames = existingCols.map((c) => c.name);
    result.collectionsFound = existingColNames;

    const expectedCollections = [
      'users',
      'user_profiles',
      'nutrition_targets',
      'exercises',
      'workout_routines',
      'workout_sessions',
      'food_items',
      'nutrition_days',
      'diet_plans',
      'maintenance_calorie_analyses',
      'bodyweight_logs',
      'personal_records',
      'ai_requests',
      'notifications',
      'audit_logs',
      'idempotency_keys',
    ];

    result.missingCollections = expectedCollections.filter(
      (c) => !existingColNames.includes(c)
    );

    // 4. Inspect Indexes
    const missingIndexes: string[] = [];
    for (const expected of MONGO_INDEXES) {
      if (existingColNames.includes(expected.collection)) {
        const col = db.collection(expected.collection);
        const actualIndexes = await col.indexes();
        const expectedName = expected.options?.name;
        if (expectedName) {
          const match = actualIndexes.find((idx) => idx.name === expectedName);
          if (!match) {
            missingIndexes.push(`${expected.collection}.${expectedName}`);
          }
        }
      } else {
        missingIndexes.push(`${expected.collection} (collection missing)`);
      }
    }
    result.missingIndexes = missingIndexes;
    result.indexesVerified = missingIndexes.length === 0;

    // 5. Safe Disposable Staging CRUD Verification with 3-char prefix convention
    const testUserId = `usr_test_verification_${Date.now()}`;
    const testDoc = {
      _id: testUserId,
      usrFirebaseUid: `fb_test_${Date.now()}`,
      usrEmail: `test_${Date.now()}@xevyra-staging.internal`,
      usrRole: 'ATHLETE',
      usrCreatedAt: new Date().toISOString(),
      usrIsDisposableTest: true,
      usrTestMarker: 'xevyra_mongodb_connection_test',
    };

    const usersCol = db.collection('users');

    // CREATE
    const insertRes = await usersCol.insertOne(testDoc);
    result.crudCreate = insertRes.acknowledged && insertRes.insertedId === testUserId;

    // READ
    const readDoc = await usersCol.findOne({ _id: testUserId, usrTestMarker: 'xevyra_mongodb_connection_test' });
    result.crudRead = !!readDoc && readDoc.usrEmail === testDoc.usrEmail;

    // Verify Prefix Convention
    result.isPrefixConventionEnforced =
      !!readDoc &&
      readDoc._id.startsWith('usr_') &&
      typeof readDoc.usrFirebaseUid === 'string' &&
      typeof readDoc.usrEmail === 'string' &&
      typeof readDoc.usrRole === 'string';

    // UPDATE
    const updateRes = await usersCol.updateOne(
      { _id: testUserId },
      { $set: { usrRole: 'TEST_VERIFIED', usrUpdatedAt: new Date().toISOString() } }
    );
    result.crudUpdate = updateRes.modifiedCount === 1;

    // DELETE (Clean up test record immediately)
    const deleteRes = await usersCol.deleteOne({ _id: testUserId });
    result.crudDelete = deleteRes.deletedCount === 1;

  } catch (err: any) {
    result.error = err.message || String(err);
  } finally {
    await mongoDb.close();
  }

  return result;
}

// Direct execution
if (process.argv[1]?.endsWith('verify-atlas-connection.ts') || process.argv[1]?.endsWith('verify-atlas-connection.js')) {
  runAtlasVerification().then((res) => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.atlasConnected && res.pingSuccess && res.crudCreate && res.crudDelete ? 0 : 1);
  });
}
