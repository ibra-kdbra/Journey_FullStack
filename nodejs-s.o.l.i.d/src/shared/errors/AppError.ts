/**
 * Custom application error class for consistent error handling
 * Follows the pattern from API_s.o.l.i.d_TS
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 400,
    isOperational: boolean = true,
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'AppError';

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a 400 Bad Request error
   */
  static badRequest(message: string): AppError {
    return new AppError(message, 400);
  }

  /**
   * Create a 401 Unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, 401);
  }

  /**
   * Create a 403 Forbidden error
   */
  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, 403);
  }

  /**
   * Create a 404 Not Found error
   */
  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, 404);
  }

  /**
   * Create a 409 Conflict error
   */
  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  /**
   * Create a 500 Internal Server error
   */
  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500, false);
  }
}
