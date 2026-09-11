import { z } from 'zod';

export const ApiErrorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'CONFLICT',
  'RATE_LIMITED',
  'AI_UNAVAILABLE',
  'SERVICE_UNAVAILABLE',
  'INTERNAL_ERROR',
]);

export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const ApiErrorDetailSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
  code: z.string().optional(),
});

export const ApiErrorPayloadSchema = z.object({
  error: z.object({
    code: ApiErrorCodeSchema,
    message: z.string(),
    requestId: z.string(),
    details: z.array(ApiErrorDetailSchema).optional(),
  }),
});

export type ApiErrorPayload = z.infer<typeof ApiErrorPayloadSchema>;
export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;
