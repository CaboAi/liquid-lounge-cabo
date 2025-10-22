import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import AuthService from '../services/auth.service';
import { Logger } from '../utils/logger';
import { RedisUtils } from '../utils/redis';
import { SubscriptionTier } from '../models/User';

// Extended Request interface to include user data
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    phoneNumber: string;
    subscriptionTier: string;
  };
}

// Response interface for consistent error responses
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Middleware to require authentication
 * Validates JWT token and attaches user to request
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    // Get token from Authorization header
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      Logger.security('missing_auth_header', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header is required',
        },
      } as ApiErrorResponse);
      return;
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      Logger.security('invalid_auth_header_format', {
        ip: req.ip,
        path: req.path,
        authHeader: authHeader.substring(0, 20) + '...',
      });

      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid authorization header format. Use: Bearer <token>',
        },
      } as ApiErrorResponse);
      return;
    }

    const token = parts[1];

    // Validate JWT token
    const payload = AuthService.validateJWT(token);

    if (!payload) {
      Logger.security('invalid_jwt_token', {
        ip: req.ip,
        path: req.path,
        tokenPrefix: token.substring(0, 10) + '...',
      });

      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired access token',
        },
      } as ApiErrorResponse);
      return;
    }

    // Attach user data to request
    req.user = {
      userId: payload.userId,
      phoneNumber: payload.phoneNumber,
      subscriptionTier: payload.subscriptionTier,
    };

    Logger.auth('auth_success', {
      userId: payload.userId,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    next();

  } catch (error) {
    Logger.error('Auth middleware error', error as Error, {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed',
      },
    } as ApiErrorResponse);
  }
}

/**
 * Middleware for optional authentication
 * Validates JWT if present but doesn't require it
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      // No auth header, continue without user
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      // Invalid format, continue without user
      next();
      return;
    }

    const token = parts[1];
    const payload = AuthService.validateJWT(token);

    if (payload) {
      // Valid token, attach user
      req.user = {
        userId: payload.userId,
        phoneNumber: payload.phoneNumber,
        subscriptionTier: payload.subscriptionTier,
      };

      Logger.auth('optional_auth_success', {
        userId: payload.userId,
        path: req.path,
        method: req.method,
      });
    }

    next();

  } catch (error) {
    Logger.error('Optional auth middleware error', error as Error, {
      ip: req.ip,
      path: req.path,
    });

    // Don't fail the request, just continue without user
    next();
  }
}

/**
 * Middleware to require specific subscription tier
 */
export function requireSubscription(requiredTier: SubscriptionTier) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        } as ApiErrorResponse);
        return;
      }

      const userTier = req.user.subscriptionTier as SubscriptionTier;

      // Define tier hierarchy
      const tierLevels = {
        free: 0,
        pro: 1,
        enterprise: 2,
      };

      const userLevel = tierLevels[userTier] || 0;
      const requiredLevel = tierLevels[requiredTier] || 0;

      if (userLevel < requiredLevel) {
        Logger.security('insufficient_subscription_tier', {
          userId: req.user.userId,
          userTier,
          requiredTier,
          path: req.path,
          method: req.method,
        });

        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_SUBSCRIPTION',
            message: `${requiredTier} subscription required for this feature`,
            details: {
              currentTier: userTier,
              requiredTier,
            },
          },
        } as ApiErrorResponse);
        return;
      }

      Logger.auth('subscription_check_passed', {
        userId: req.user.userId,
        userTier,
        requiredTier,
        path: req.path,
      });

      next();

    } catch (error) {
      Logger.error('Subscription middleware error', error as Error, {
        userId: req.user?.userId,
        requiredTier,
        path: req.path,
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Subscription check failed',
        },
      } as ApiErrorResponse);
    }
  };
}

/**
 * Rate limiting middleware for SMS sending
 */
export const smsRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.RATE_LIMIT_SMS_PER_HOUR || '3'),
  keyGenerator: (req: Request) => {
    // Use phone number if available, otherwise IP
    const phoneNumber = req.body?.phoneNumber;
    return phoneNumber ? `sms:${phoneNumber}` : `sms:ip:${req.ip}`;
  },
  handler: (req: Request, res: Response) => {
    const identifier = req.body?.phoneNumber || req.ip;

    Logger.rateLimit(identifier, parseInt(process.env.RATE_LIMIT_SMS_PER_HOUR || '3'), 0, {
      type: 'sms',
      ip: req.ip,
      path: req.path,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many SMS requests. Please try again later.',
        details: {
          limit: parseInt(process.env.RATE_LIMIT_SMS_PER_HOUR || '3'),
          windowMs: 60 * 60 * 1000,
        },
      },
    } as ApiErrorResponse);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiting middleware for verification code attempts
 */
export const verificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  keyGenerator: (req: Request) => {
    const phoneNumber = req.body?.phoneNumber;
    return phoneNumber ? `verify:${phoneNumber}` : `verify:ip:${req.ip}`;
  },
  handler: (req: Request, res: Response) => {
    const identifier = req.body?.phoneNumber || req.ip;

    Logger.rateLimit(identifier, 5, 0, {
      type: 'verification',
      ip: req.ip,
      path: req.path,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many verification attempts. Please try again later.',
        details: {
          limit: 5,
          windowMs: 15 * 60 * 1000,
        },
      },
    } as ApiErrorResponse);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiting
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  keyGenerator: (req: AuthenticatedRequest) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.userId || req.ip;
  },
  handler: (req: Request, res: Response) => {
    const identifier = (req as AuthenticatedRequest).user?.userId || req.ip;

    Logger.rateLimit(identifier, 100, 0, {
      type: 'api',
      ip: req.ip,
      path: req.path,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        details: {
          limit: 100,
          windowMs: 15 * 60 * 1000,
        },
      },
    } as ApiErrorResponse);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Custom rate limiting middleware using Redis
 */
export function customRateLimit(
  limit: number,
  windowSeconds: number,
  keyPrefix: string,
  message?: string
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.user?.userId || req.ip;
      const key = `${keyPrefix}:${identifier}`;

      const result = await RedisUtils.checkRateLimit(key, limit, windowSeconds);

      if (!result.allowed) {
        Logger.rateLimit(identifier, limit, result.count, {
          type: keyPrefix,
          resetTime: result.resetTime,
          ip: req.ip,
          path: req.path,
        });

        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: message || 'Rate limit exceeded',
            details: {
              limit,
              current: result.count,
              resetTime: result.resetTime,
            },
          },
        } as ApiErrorResponse);
        return;
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': (limit - result.count).toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
      });

      next();

    } catch (error) {
      Logger.error('Custom rate limit middleware error', error as Error, {
        keyPrefix,
        limit,
        windowSeconds,
        ip: req.ip,
        path: req.path,
      });

      // Don't fail the request if rate limiting fails
      next();
    }
  };
}

/**
 * Middleware to check if user account is active
 */
export function requireActiveAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      } as ApiErrorResponse);
      return;
    }

    // In a real implementation, check user status from database
    // For now, assume all authenticated users are active

    Logger.auth('active_account_check_passed', {
      userId: req.user.userId,
      path: req.path,
    });

    next();

  } catch (error) {
    Logger.error('Active account middleware error', error as Error, {
      userId: req.user?.userId,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Account status check failed',
      },
    } as ApiErrorResponse);
  }
}

/**
 * Middleware to log all requests for monitoring
 */
export function requestLogger(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    Logger.api(req.method, req.originalUrl, res.statusCode, duration, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId,
      contentLength: res.get('Content-Length'),
    });
  });

  next();
}

export default {
  requireAuth,
  optionalAuth,
  requireSubscription,
  smsRateLimit,
  verificationRateLimit,
  apiRateLimit,
  customRateLimit,
  requireActiveAccount,
  requestLogger,
};