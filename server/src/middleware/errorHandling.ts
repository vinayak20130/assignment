import { Request, Response, NextFunction } from 'express';

// Custom error class for application-specific errors
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async wrapper to catch errors in async route handlers
// This eliminates the need for try-catch in every controller method
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handling middleware
// This catches all errors and formats them consistently
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error for debugging (in production, use proper logging service)
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  let statusCode = 500;
  if (error instanceof AppError) {
    statusCode = error.statusCode;
  }

  // Determine error message
  let message = 'Internal server error';
  if (error instanceof AppError && error.isOperational) {
    // These are safe to expose to client
    message = error.message;
  } else if (process.env.NODE_ENV === 'development') {
    // In development, show actual error
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    // Include stack trace in development only
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Middleware to handle 404 errors for unknown routes
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
};

// Request logging middleware for debugging
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Log when request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};
