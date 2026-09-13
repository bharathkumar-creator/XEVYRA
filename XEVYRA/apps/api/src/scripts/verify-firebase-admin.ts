import 'dotenv/config';
import { loadApiConfig } from '@xevyra/config';
import { FirebaseAuthService } from '../shared/auth/firebase-admin.client.js';

async function testFirebaseAdminInit() {
  const config = loadApiConfig();
  console.log('Firebase Project ID configured:', config.FIREBASE_PROJECT_ID === 'xevyra-staging' ? 'PASS' : 'FAIL');
  console.log('Firebase Client Email configured:', Boolean(config.FIREBASE_CLIENT_EMAIL) ? 'PASS' : 'FAIL');
  console.log('Firebase Private Key configured:', Boolean(config.FIREBASE_PRIVATE_KEY) ? 'PASS' : 'FAIL');

  const authService = FirebaseAuthService.getInstance(config);
  console.log('Firebase Admin SDK Initialized:', authService.isInitialized() ? 'PASS' : 'FAIL');

  if (!authService.isInitialized()) {
    process.exit(1);
  }
}

testFirebaseAdminInit().catch((err) => {
  console.error('Firebase Admin verification failed with error');
  process.exit(1);
});
