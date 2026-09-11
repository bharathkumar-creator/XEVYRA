import * as admin from 'firebase-admin';
import { ApiEnv } from '@xevyra/config';
import { Logger } from '../logging/logger.js';

export interface DecodedAuthToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface IFirebaseAuthService {
  verifyIdToken(token: string): Promise<DecodedAuthToken>;
  isInitialized(): boolean;
}

export class FirebaseAuthService implements IFirebaseAuthService {
  private static instance: FirebaseAuthService;
  private initialized = false;

  private constructor(config: ApiEnv) {
    if (admin.apps.length === 0) {
      if (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: config.FIREBASE_PROJECT_ID,
              clientEmail: config.FIREBASE_CLIENT_EMAIL,
              privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
          });
          this.initialized = true;
          Logger.info('Firebase Admin SDK initialized successfully');
        } catch (error) {
          Logger.warn('Failed to initialize Firebase Admin with provided credentials', { error });
        }
      } else {
        Logger.warn('Firebase Admin credentials not fully configured; auth verification running in mockable/dev mode');
      }
    } else {
      this.initialized = true;
    }
  }

  public static getInstance(config?: ApiEnv): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService(
        config || ({} as ApiEnv)
      );
    }
    return FirebaseAuthService.instance;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public async verifyIdToken(token: string): Promise<DecodedAuthToken> {
    if (!this.initialized) {
      // In development / testing without live Firebase project, reject invalid tokens or accept dev tokens
      if (process.env.NODE_ENV !== 'production' && token.startsWith('mock_token_')) {
        const uid = token.replace('mock_token_', '');
        return {
          uid,
          email: `${uid}@xevyra.fit`,
          name: `User ${uid}`,
        };
      }
      throw new Error('Firebase Admin SDK is not initialized');
    }

    const decoded = await admin.auth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
  }
}
