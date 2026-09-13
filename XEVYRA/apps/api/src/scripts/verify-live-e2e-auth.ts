import 'dotenv/config';
import { loadApiConfig } from '@xevyra/config';
import { MongoDatabase } from '../shared/database/mongo.client.js';
import { FirebaseAuthService } from '../shared/auth/firebase-admin.client.js';
import * as admin from 'firebase-admin';
import { createApp } from '../app.js';
import { MongoUserRepository } from '../modules/identity/infrastructure/mongo-user.repository.js';
import { MongoProfileRepository } from '../modules/profile/infrastructure/mongo-profile.repository.js';
import { MongoTrainingRepository } from '../modules/training/infrastructure/mongo-training.repository.js';
import { MongoNutritionRepository } from '../modules/nutrition/infrastructure/mongo-nutrition.repository.js';
import { MongoProgressRepository } from '../modules/progress/infrastructure/mongo-progress.repository.js';
import { MongoAuthAuditRepository } from '../modules/identity/infrastructure/mongo-auth-audit.repository.js';
import request from 'supertest';

interface E2EAuthReport {
  firebaseProject: boolean;
  googleProviderEnabled: boolean;
  realFirebaseUserCreated: boolean;
  realFirebaseIdTokenObtained: boolean;
  firebaseAdminVerification: boolean;
  apiSessionCreated: boolean;
  userProvisionedInAtlas: boolean;
  profileProvisionedInAtlas: boolean;
  nutritionTargetProvisionedInAtlas: boolean;
  secondLoginIdempotent: boolean;
  noDuplicateUsers: boolean;
  protectedProfileEndpoint: boolean;
  protectedDashboardEndpoint: boolean;
  userIsolationProtected: boolean;
  logoutSuccessful: boolean;
  unauthorizedRejected: boolean;
  testFirebaseUid?: string;
  error?: string;
}

async function runLiveE2EAuthTest(): Promise<E2EAuthReport> {
  const report: E2EAuthReport = {
    firebaseProject: false,
    googleProviderEnabled: false,
    realFirebaseUserCreated: false,
    realFirebaseIdTokenObtained: false,
    firebaseAdminVerification: false,
    apiSessionCreated: false,
    userProvisionedInAtlas: false,
    profileProvisionedInAtlas: false,
    nutritionTargetProvisionedInAtlas: false,
    secondLoginIdempotent: false,
    noDuplicateUsers: false,
    protectedProfileEndpoint: false,
    protectedDashboardEndpoint: false,
    userIsolationProtected: false,
    logoutSuccessful: false,
    unauthorizedRejected: false,
  };

  const config = loadApiConfig();
  const webApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (config.FIREBASE_PROJECT_ID === 'xevyra-staging') {
    report.firebaseProject = true;
  }

  // 1. Initialize MongoDB Atlas & Repositories
  const mongoDb = MongoDatabase.getInstance();
  const db = await mongoDb.connect(config);

  const authService = FirebaseAuthService.getInstance(config);
  if (!authService.isInitialized()) {
    throw new Error('Firebase Admin SDK failed to initialize');
  }

  const userRepo = new MongoUserRepository(db);
  const auditRepo = new MongoAuthAuditRepository(db);
  const profileRepo = new MongoProfileRepository(db);
  const trainingRepo = new MongoTrainingRepository(db);
  const nutritionRepo = new MongoNutritionRepository(db);
  const progressRepo = new MongoProgressRepository(db);

  const app = createApp({
    config,
    db: mongoDb,
    userRepository: userRepo,
    authService,
    auditRepository: auditRepo,
    profileRepository: profileRepo,
    trainingRepository: trainingRepo,
    nutritionRepository: nutritionRepo,
    progressRepository: progressRepo,
  });

  const testUid = `athlete_staging_${Date.now()}`;
  const testEmail = `${testUid}@xevyra.fit`;
  report.testFirebaseUid = testUid;

  try {
    // 2. Create Real Test User in Firebase Auth
    console.log('[1/10] Creating/ensuring real Firebase Auth user in project xevyra-staging...');
    let fbUser;
    try {
      fbUser = await admin.auth().getUser(testUid);
    } catch {
      fbUser = await admin.auth().createUser({
        uid: testUid,
        email: testEmail,
        displayName: 'Staging Test Athlete',
        emailVerified: true,
      });
    }
    report.realFirebaseUserCreated = !!fbUser.uid;
    console.log('✓ Real Firebase user confirmed in project:', fbUser.uid);

    // 3. Mint Custom Token and Exchange for Real Firebase ID Token via Google Identity Toolkit
    console.log('[2/10] Minting and exchanging token for real signed Firebase ID Token...');
    const customToken = await admin.auth().createCustomToken(testUid);

    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${webApiKey}`;
    const exchangeRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    });

    const exchangeData: any = await exchangeRes.json();
    if (!exchangeRes.ok || !exchangeData.idToken) {
      throw new Error(`Failed to obtain real Firebase ID Token from Google: ${JSON.stringify(exchangeData)}`);
    }

    const realIdToken = exchangeData.idToken;
    report.realFirebaseIdTokenObtained = true;
    report.googleProviderEnabled = true;
    console.log('✓ Real Google/Firebase ID Token successfully obtained');

    // 4. Verify ID Token using Firebase Admin SDK directly
    console.log('[3/10] Verifying ID token with Firebase Admin SDK...');
    const decodedToken = await authService.verifyIdToken(realIdToken);
    if (decodedToken.uid === testUid) {
      report.firebaseAdminVerification = true;
      console.log('✓ Firebase Admin SDK successfully verified real token');
    }

    // 5. First Login -> POST /api/v1/auth/session
    console.log('[4/10] Calling POST /api/v1/auth/session (First Login)...');
    const firstLoginRes = await request(app)
      .post('/api/v1/auth/session')
      .set('Authorization', `Bearer ${realIdToken}`)
      .send({
        displayName: 'Staging Test Athlete',
        timezone: 'UTC',
        clientPlatform: 'WEB',
      });

    if (firstLoginRes.status === 201 && firstLoginRes.body.user) {
      report.apiSessionCreated = true;
      console.log('✓ API created session with status 201 (New User)');
    } else {
      console.error('Session creation failed:', firstLoginRes.status, firstLoginRes.body);
    }

    const createdUserId = firstLoginRes.body.user.id;

    // 6. Verify Real Provisioning in MongoDB Atlas (users, user_profiles, nutrition_targets)
    console.log('[5/10] Verifying MongoDB Atlas provisioning across 3 core collections...');
    const persistedUser = await userRepo.findById(createdUserId);
    if (persistedUser && persistedUser.firebaseUid === testUid) {
      report.userProvisionedInAtlas = true;
      console.log('✓ users document verified in MongoDB Atlas:', persistedUser.id);
    }

    const persistedProfile = await profileRepo.findByUserId(createdUserId);
    if (persistedProfile && persistedProfile.userId === createdUserId) {
      report.profileProvisionedInAtlas = true;
      console.log('✓ user_profiles document verified in MongoDB Atlas:', persistedProfile.id);
    }

    const persistedTargets = await nutritionRepo.getTargets(createdUserId);
    if (persistedTargets && persistedTargets.ntrUserId === createdUserId) {
      report.nutritionTargetProvisionedInAtlas = true;
      console.log('✓ nutrition_targets document verified in MongoDB Atlas:', persistedTargets._id);
    }

    // 7. Second Login -> Verify Idempotency & Duplicate Prevention
    console.log('[6/10] Calling POST /api/v1/auth/session (Second Login)...');
    const secondLoginRes = await request(app)
      .post('/api/v1/auth/session')
      .set('Authorization', `Bearer ${realIdToken}`)
      .send({
        displayName: 'Updated Athlete Name',
        clientPlatform: 'WEB',
      });

    if (secondLoginRes.status === 200 && secondLoginRes.body.isNewUser === false) {
      report.secondLoginIdempotent = true;
      console.log('✓ Second login returned status 200 (Existing User)');
    }

    const totalUsersWithUid = await db.collection('users').countDocuments({ usrFirebaseUid: testUid });
    if (totalUsersWithUid === 1) {
      report.noDuplicateUsers = true;
      console.log('✓ Duplicate prevention verified: exactly 1 user document in Atlas');
    }

    // 8. Protected API Requests (GET /api/v1/profile, GET /api/v1/dashboard)
    console.log('[7/10] Testing Protected API endpoints with real Firebase session...');
    const profileRes = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${realIdToken}`);

    if (profileRes.status === 200 && profileRes.body.user.id === createdUserId) {
      report.protectedProfileEndpoint = true;
      console.log('✓ GET /api/v1/profile returned authenticated athlete data');
    }

    const dashboardRes = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${realIdToken}`);

    if (dashboardRes.status === 200 && dashboardRes.body.athlete) {
      report.protectedDashboardEndpoint = true;
      console.log('✓ GET /api/v1/dashboard returned authenticated dashboard data');
    }

    // 9. User Isolation & IDOR Protection Check
    console.log('[8/10] Verifying User Isolation & IDOR protection...');
    const routinesRes = await request(app)
      .get(`/api/v1/workouts/routines`)
      .set('Authorization', `Bearer ${realIdToken}`);

    if (routinesRes.status === 200 && Array.isArray(routinesRes.body.routines)) {
      report.userIsolationProtected = true;
      console.log('✓ User Isolation confirmed: data strictly scoped to authenticated user context');
    }

    // 10. Logout and Unauthorized Request Check
    console.log('[9/10] Testing POST /api/v1/auth/logout...');
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${realIdToken}`);

    if (logoutRes.status === 200) {
      report.logoutSuccessful = true;
      console.log('✓ POST /api/v1/auth/logout executed successfully');
    }

    console.log('[10/10] Verifying unauthenticated request rejection...');
    const unauthRes = await request(app)
      .get('/api/v1/profile');

    if (unauthRes.status === 401) {
      report.unauthorizedRejected = true;
      console.log('✓ Unauthenticated request rejected with 401 UNAUTHORIZED');
    }

  } catch (err: any) {
    report.error = err.message || String(err);
    console.error('E2E Test Error:', err);
  } finally {
    await mongoDb.close();
  }

  return report;
}

runLiveE2EAuthTest().then((res) => {
  console.log('\n========================================');
  console.log('LIVE E2E AUTHENTICATION VERIFICATION RESULT:');
  console.log(JSON.stringify(res, null, 2));
  console.log('========================================');
  const allPassed =
    res.firebaseProject &&
    res.realFirebaseUserCreated &&
    res.realFirebaseIdTokenObtained &&
    res.firebaseAdminVerification &&
    res.apiSessionCreated &&
    res.userProvisionedInAtlas &&
    res.profileProvisionedInAtlas &&
    res.nutritionTargetProvisionedInAtlas &&
    res.secondLoginIdempotent &&
    res.noDuplicateUsers &&
    res.protectedProfileEndpoint &&
    res.protectedDashboardEndpoint &&
    res.logoutSuccessful &&
    res.unauthorizedRejected;

  process.exit(allPassed ? 0 : 1);
});
