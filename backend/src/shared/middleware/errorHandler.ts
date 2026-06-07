import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  logger.error({ err, req: { method: req.method, url: req.url } }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
  });
}
