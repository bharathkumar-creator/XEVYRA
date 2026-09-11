import { z } from 'zod';

export const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string(),
  version: z.string(),
  environment: z.string(),
  services: z.object({
    database: z.enum(['connected', 'disconnected', 'unreachable']),
    auth: z.enum(['ready', 'uninitialized']),
  }),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
