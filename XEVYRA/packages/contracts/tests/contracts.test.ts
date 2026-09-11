import { describe, it, expect } from 'vitest';
import {
  ApiErrorPayloadSchema,
  SyncAuthRequestSchema,
  HealthCheckResponseSchema,
} from '../src/index.js';

describe('Contracts Layer: Schema Validations', () => {
  it('should validate standard error response payload format', () => {
    const validErrorPayload = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        requestId: 'req_123456',
        details: [
          { field: 'displayName', message: 'Display name cannot be empty' },
        ],
      },
    };

    const parsed = ApiErrorPayloadSchema.safeParse(validErrorPayload);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid error codes', () => {
    const invalidErrorPayload = {
      error: {
        code: 'CUSTOM_UNKNOWN_CODE',
        message: 'Some error',
        requestId: 'req_123',
      },
    };

    const parsed = ApiErrorPayloadSchema.safeParse(invalidErrorPayload);
    expect(parsed.success).toBe(false);
  });

  it('should validate sync auth request payload', () => {
    const validSync = {
      displayName: 'John Athlete',
      avatarUrl: 'https://example.com/avatar.jpg',
      timezone: 'America/New_York',
    };

    const parsed = SyncAuthRequestSchema.safeParse(validSync);
    expect(parsed.success).toBe(true);
  });

  it('should validate health check response format', () => {
    const validHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'development',
      services: {
        database: 'connected',
        auth: 'ready',
      },
    };

    const parsed = HealthCheckResponseSchema.safeParse(validHealth);
    expect(parsed.success).toBe(true);
  });
});
