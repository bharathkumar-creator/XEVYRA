import { ApiErrorCode, ApiErrorDetail } from '@xevyra/contracts';

export class AppError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly details?: ApiErrorDetail[];

  constructor(
    code: ApiErrorCode,
    message: string,
    statusCode: number,
    details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static badRequest(message: string, details?: ApiErrorDetail[]): AppError {
    return new AppError('VALIDATION_ERROR', message, 400, details);
  }

  public static unauthorized(message: string = 'Authentication required'): AppError {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  public static forbidden(message: string = 'Access forbidden'): AppError {
    return new AppError('FORBIDDEN', message, 403);
  }

  public static notFound(message: string = 'Resource not found'): AppError {
    return new AppError('NOT_FOUND', message, 404);
  }

  public static conflict(message: string): AppError {
    return new AppError('CONFLICT', message, 409);
  }

  public static rateLimited(message: string = 'Rate limit exceeded. Please try again later.'): AppError {
    return new AppError('RATE_LIMITED', message, 429);
  }

  public static internal(message: string = 'Internal server error'): AppError {
    return new AppError('INTERNAL_ERROR', message, 500);
  }
}
