import { z } from 'zod';

export const AppConfigResponseSchema = z.object({
  webAppUrl: z.string().url(),
  version: z.string(),
  environment: z.enum(['development', 'test', 'staging', 'production']),
});

export type AppConfigResponse = z.infer<typeof AppConfigResponseSchema>;
