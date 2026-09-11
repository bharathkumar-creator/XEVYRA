import { describe, it, expect } from 'vitest';
import { loadApiConfig, ApiEnvSchema } from '../src/index.js';

describe('Config Layer: Environment Validation', () => {
  it('should load default configuration values gracefully in test environment', () => {
    const config = loadApiConfig({
      NODE_ENV: 'test',
      PORT: '4000',
    });

    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(4000);
    expect(config.MONGODB_DB_NAME).toBe('xevyra_dev');
    expect(config.REDIS_ENABLED).toBe(false);
  });

  it('should reject invalid NODE_ENV', () => {
    const parsed = ApiEnvSchema.safeParse({
      NODE_ENV: 'staging_unknown',
    });

    expect(parsed.success).toBe(false);
  });
});
