import Redis from 'ioredis';
import { logger } from './logger';

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client
export const redisClient = new Redis(redisConfig);

// Redis connection event handlers
redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('ready', () => {
  logger.info('Redis is ready to receive commands');
});

redisClient.on('error', (error) => {
  logger.error('Redis connection error', { error: error.message });
});

redisClient.on('close', () => {
  logger.warn('Redis connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

// Redis utility functions
export class RedisUtils {
  /**
   * Store verification code with expiry
   */
  static async storeVerificationCode(phoneNumber: string, code: string, expirySeconds = 300): Promise<void> {
    const key = `verification:${phoneNumber}`;
    const data = {
      code,
      attempts: 0,
      createdAt: new Date().toISOString(),
    };

    await redisClient.setex(key, expirySeconds, JSON.stringify(data));
    logger.debug('Verification code stored', { phoneNumber: phoneNumber.slice(0, 5) + 'XXXXX' });
  }

  /**
   * Get verification code data
   */
  static async getVerificationCode(phoneNumber: string): Promise<{
    code: string;
    attempts: number;
    createdAt: string;
  } | null> {
    const key = `verification:${phoneNumber}`;
    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  /**
   * Update verification code attempts
   */
  static async updateVerificationAttempts(phoneNumber: string, attempts: number): Promise<void> {
    const key = `verification:${phoneNumber}`;
    const existingData = await this.getVerificationCode(phoneNumber);

    if (existingData) {
      const updatedData = {
        ...existingData,
        attempts,
      };

      const ttl = await redisClient.ttl(key);
      await redisClient.setex(key, ttl > 0 ? ttl : 300, JSON.stringify(updatedData));
    }
  }

  /**
   * Delete verification code
   */
  static async deleteVerificationCode(phoneNumber: string): Promise<void> {
    const key = `verification:${phoneNumber}`;
    await redisClient.del(key);
  }

  /**
   * Store user session
   */
  static async storeUserSession(
    userId: string,
    sessionData: {
      sessionId: string;
      deviceInfo: any;
      ipAddress: string;
      userAgent: string;
    },
    expirySeconds = 7 * 24 * 60 * 60 // 7 days
  ): Promise<void> {
    const key = `session:${userId}:${sessionData.sessionId}`;
    const data = {
      ...sessionData,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    await redisClient.setex(key, expirySeconds, JSON.stringify(data));
    logger.debug('User session stored', { userId, sessionId: sessionData.sessionId });
  }

  /**
   * Get user session
   */
  static async getUserSession(userId: string, sessionId: string): Promise<any | null> {
    const key = `session:${userId}:${sessionId}`;
    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  /**
   * Update session last activity
   */
  static async updateSessionActivity(userId: string, sessionId: string): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    const sessionData = await this.getUserSession(userId, sessionId);

    if (sessionData) {
      const updatedData = {
        ...sessionData,
        lastActivityAt: new Date().toISOString(),
      };

      const ttl = await redisClient.ttl(key);
      await redisClient.setex(key, ttl > 0 ? ttl : 7 * 24 * 60 * 60, JSON.stringify(updatedData));
    }
  }

  /**
   * Delete user session
   */
  static async deleteUserSession(userId: string, sessionId: string): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    await redisClient.del(key);
  }

  /**
   * Delete all user sessions
   */
  static async deleteAllUserSessions(userId: string): Promise<void> {
    const pattern = `session:${userId}:*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.debug('All user sessions deleted', { userId, sessionCount: keys.length });
    }
  }

  /**
   * Store refresh token
   */
  static async storeRefreshToken(
    userId: string,
    refreshToken: string,
    expirySeconds = 7 * 24 * 60 * 60 // 7 days
  ): Promise<void> {
    const key = `refresh_token:${userId}`;
    await redisClient.setex(key, expirySeconds, refreshToken);
    logger.debug('Refresh token stored', { userId });
  }

  /**
   * Get refresh token
   */
  static async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh_token:${userId}`;
    return await redisClient.get(key);
  }

  /**
   * Delete refresh token
   */
  static async deleteRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await redisClient.del(key);
  }

  /**
   * Rate limiting functions
   */
  static async checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number,
    prefix = 'rate_limit'
  ): Promise<{
    allowed: boolean;
    count: number;
    resetTime: number;
  }> {
    const key = `${prefix}:${identifier}`;
    const current = await redisClient.get(key);

    if (!current) {
      await redisClient.setex(key, windowSeconds, '1');
      return {
        allowed: true,
        count: 1,
        resetTime: Date.now() + windowSeconds * 1000,
      };
    }

    const count = parseInt(current);
    const ttl = await redisClient.ttl(key);

    if (count >= limit) {
      return {
        allowed: false,
        count,
        resetTime: Date.now() + ttl * 1000,
      };
    }

    await redisClient.incr(key);
    return {
      allowed: true,
      count: count + 1,
      resetTime: Date.now() + ttl * 1000,
    };
  }

  /**
   * Store rate limit data
   */
  static async incrementRateLimit(
    identifier: string,
    windowSeconds: number,
    prefix = 'rate_limit'
  ): Promise<number> {
    const key = `${prefix}:${identifier}`;
    const multi = redisClient.multi();

    multi.incr(key);
    multi.expire(key, windowSeconds);

    const results = await multi.exec();
    return results?.[0]?.[1] as number || 0;
  }

  /**
   * Cache user data
   */
  static async cacheUser(userId: string, userData: any, expirySeconds = 60 * 60): Promise<void> {
    const key = `user:${userId}`;
    await redisClient.setex(key, expirySeconds, JSON.stringify(userData));
    logger.debug('User data cached', { userId });
  }

  /**
   * Get cached user data
   */
  static async getCachedUser(userId: string): Promise<any | null> {
    const key = `user:${userId}`;
    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  /**
   * Delete cached user data
   */
  static async deleteCachedUser(userId: string): Promise<void> {
    const key = `user:${userId}`;
    await redisClient.del(key);
  }

  /**
   * Store temporary data with expiry
   */
  static async storeTempData(key: string, data: any, expirySeconds: number): Promise<void> {
    await redisClient.setex(key, expirySeconds, JSON.stringify(data));
  }

  /**
   * Get temporary data
   */
  static async getTempData(key: string): Promise<any | null> {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Delete temporary data
   */
  static async deleteTempData(key: string): Promise<void> {
    await redisClient.del(key);
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    const result = await redisClient.exists(key);
    return result === 1;
  }

  /**
   * Get TTL for a key
   */
  static async getTTL(key: string): Promise<number> {
    return await redisClient.ttl(key);
  }

  /**
   * Set expiry for a key
   */
  static async setExpiry(key: string, seconds: number): Promise<void> {
    await redisClient.expire(key, seconds);
  }

  /**
   * Get Redis info for monitoring
   */
  static async getRedisInfo(): Promise<any> {
    try {
      const info = await redisClient.info();
      const memory = await redisClient.info('memory');
      const stats = await redisClient.info('stats');

      return {
        connected: redisClient.status === 'ready',
        info: info.split('\n').reduce((acc: any, line: string) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {}),
        memory: memory.split('\n').reduce((acc: any, line: string) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {}),
        stats: stats.split('\n').reduce((acc: any, line: string) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('Failed to get Redis info', { error: error instanceof Error ? error.message : 'Unknown error' });
      return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Health check function
export async function redisHealthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
  try {
    const start = Date.now();
    await redisClient.ping();
    const latency = Date.now() - start;

    return { healthy: true, latency };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Graceful shutdown
export async function redisShutdown(): Promise<void> {
  try {
    await redisClient.quit();
    logger.info('Redis connection closed gracefully');
  } catch (error) {
    logger.error('Error closing Redis connection', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export default redisClient;