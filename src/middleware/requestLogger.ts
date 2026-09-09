import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { logger, morganStream } from '../config/logger';

/**
 * Extend Express Request to include correlationId
 */
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
    }
  }
}

/**
 * Middleware to generate and attach correlation ID to requests
 */
export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate or use existing correlation ID from header
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  
  // Attach to request object
  req.correlationId = correlationId;
  req.startTime = Date.now();
  
  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
};

/**
 * Morgan HTTP request logger with custom tokens
 */
// Register custom token for correlation ID
morgan.token('correlation-id', (req: Request) => req.correlationId || 'N/A');

// Register custom token for response time in ms
morgan.token('response-time-ms', (req: Request) => {
  if (!req.startTime) return 'N/A';
  return `${Date.now() - req.startTime}ms`;
});

// Create morgan middleware with custom format
export const httpLogger = morgan(
  ':method :url :status :response-time-ms - :correlation-id',
  {
    stream: morganStream,
    skip: (req: Request) => {
      // Skip logging for health check endpoint to reduce noise
      return req.url === '/health';
    }
  }
);

/**
 * Middleware to log request completion with detailed information
 */
export const requestCompletionLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Capture the original end function
  const originalEnd = res.end;
  
  // Override res.end to log after response is sent
  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    // Restore original end
    res.end = originalEnd;
    
    // Call original end
    const result = res.end(chunk, encoding, callback);
    
    // Log request completion
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    
    logger.info('Request completed', {
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    return result;
  };
  
  next();
};
