import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware configurations
 */

/**
 * General rate limiter for most API endpoints
 * 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});

/**
 * Strict rate limiter for simulation endpoints
 * 30 requests per 15 minutes (more resource-intensive operations)
 */
export const simulationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    success: false,
    message: 'Too many simulation requests from this IP, please try again later.',
    error: 'SIMULATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many simulation requests from this IP, please try again later.',
      error: 'SIMULATION_RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});

/**
 * Moderate rate limiter for ledger operations
 * 50 requests per 15 minutes
 */
export const ledgerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many ledger requests from this IP, please try again later.',
    error: 'LEDGER_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many ledger requests from this IP, please try again later.',
      error: 'LEDGER_RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});

/**
 * Lenient rate limiter for read-only operations
 * 200 requests per 15 minutes
 */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many read requests from this IP, please try again later.',
    error: 'READ_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many read requests from this IP, please try again later.',
      error: 'READ_RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});

/**
 * Strict rate limiter for file upload endpoints
 * 10 requests per 15 minutes
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many upload requests from this IP, please try again later.',
    error: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many upload requests from this IP, please try again later.',
      error: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});
