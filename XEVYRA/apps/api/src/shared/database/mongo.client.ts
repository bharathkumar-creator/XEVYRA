import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { ApiEnv } from '@xevyra/config';
import { Logger } from '../logging/logger.js';

export class MongoDatabase {
  private static instance: MongoDatabase;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting = false;

  private constructor() {}

  public static getInstance(): MongoDatabase {
    if (!MongoDatabase.instance) {
      MongoDatabase.instance = new MongoDatabase();
    }
    return MongoDatabase.instance;
  }

  public async connect(config: ApiEnv): Promise<Db> {
    if (this.db && this.client) {
      return this.db;
    }

    if (this.isConnecting) {
      while (this.isConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (this.db) return this.db;
    }

    this.isConnecting = true;

    try {
      const options: MongoClientOptions = {
        maxPoolSize: config.MONGODB_MAX_POOL_SIZE,
        minPoolSize: config.MONGODB_MIN_POOL_SIZE,
        serverSelectionTimeoutMS: 5000,
      };

      this.client = new MongoClient(config.MONGODB_URI, options);
      await this.client.connect();
      this.db = this.client.db(config.MONGODB_DB_NAME);

      Logger.info(`MongoDB connected successfully to database: ${config.MONGODB_DB_NAME}`);
      return this.db;
    } catch (error) {
      Logger.error('Failed to connect to MongoDB', { error });
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  public async isHealthy(): Promise<boolean> {
    if (!this.client || !this.db) {
      return false;
    }
    try {
      await this.db.command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      Logger.info('MongoDB connection closed gracefully');
    }
  }
}
