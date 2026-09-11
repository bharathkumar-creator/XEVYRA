import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_BASE_URL: z.string().url().default('http://localhost:4000'),
  WEB_APP_URL: z.string().url().default('http://localhost:3000'),

  // MongoDB
  MONGODB_URI: z.string().default('mongodb://localhost:27017/xevyra_dev'),
  MONGODB_DB_NAME: z.string().default('xevyra_dev'),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().default(20),
  MONGODB_MIN_POOL_SIZE: z.coerce.number().default(5),

  // Firebase Admin
  FIREBASE_PROJECT_ID: z.string().default('xevyra-fitness'),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Security
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:4000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function loadApiConfig(overrideEnv?: Record<string, string | undefined>): ApiEnv {
  const envToParse = overrideEnv || process.env;
  const result = ApiEnvSchema.safeParse(envToParse);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((e) => `[${e.path.join('.')}] ${e.message}`)
      .join(', ');
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }

  return result.data;
}
