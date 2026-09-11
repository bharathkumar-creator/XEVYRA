import { loadApiConfig } from '@xevyra/config';
import { MongoDatabase } from './shared/database/mongo.client.js';
import { FirebaseAuthService } from './shared/auth/firebase-admin.client.js';
import { MongoUserRepository } from './modules/identity/infrastructure/mongo-user.repository.js';
import { MongoAuthAuditRepository } from './modules/identity/infrastructure/mongo-auth-audit.repository.js';
import { createApp } from './app.js';
import { Logger } from './shared/logging/logger.js';

async function bootstrap() {
  try {
    const config = loadApiConfig();
    Logger.info(`Starting XEVYRA API in ${config.NODE_ENV} mode...`);

    // Connect to MongoDB
    const mongoDb = MongoDatabase.getInstance();
    const db = await mongoDb.connect(config);

    // Initialize Auth Service
    const authService = FirebaseAuthService.getInstance(config);

    // Repositories
    const userRepository = new MongoUserRepository(db);
    const auditRepository = new MongoAuthAuditRepository(db);

    // Create App
    const app = createApp({
      config,
      db: mongoDb,
      userRepository,
      authService,
      auditRepository,
    });

    const server = app.listen(config.PORT, () => {
      Logger.info(`XEVYRA API listening on port ${config.PORT} (${config.API_BASE_URL})`);
    });

    // Graceful Shutdown Handling
    const shutdown = async (signal: string) => {
      Logger.info(`Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        Logger.info('HTTP server closed.');
        await mongoDb.close();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        Logger.error('Forceful shutdown triggered after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    Logger.error('Fatal startup error in XEVYRA API', { error });
    process.exit(1);
  }
}

bootstrap();
