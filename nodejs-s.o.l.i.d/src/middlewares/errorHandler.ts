import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';

/**
 * Global error handling middleware.
 *
 * AppError messages are written for clients and are returned as-is. Anything
 * else (Sequelize/DB errors, bugs) is logged server-side and answered with a
 * generic message in every environment, never err.message or the error object.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  if (res.headersSent) {
    return next(err);
  }

  // Malformed JSON bodies from express.json() are the client's fault.
  if ((err as { type?: string }).type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'error', message: 'Malformed request body' });
  }

  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  console.error('Unexpected error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
