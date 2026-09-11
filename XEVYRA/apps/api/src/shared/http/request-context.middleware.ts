import { Request, Response, NextFunction } from 'express';
import { generateId } from '@xevyra/shared';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingRequestId = req.header('x-request-id');
  req.requestId = incomingRequestId || generateId('req');
  req.startTime = Date.now();

  res.setHeader('x-request-id', req.requestId);
  next();
}
