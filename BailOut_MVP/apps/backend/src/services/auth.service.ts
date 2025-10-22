import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import twilio from 'twilio';
import { User, UserHelpers, DEFAULT_PROFILE_SETTINGS } from '../models/User';
import { redisClient } from '../utils/redis';
import { logger } from '../utils/logger';

// Twilio client initialization
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface VerificationResult {
  success: boolean;
  message: string;
  code?: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  message: string;
}

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  subscriptionTier: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private static readonly VERIFICATION_CODE_LENGTH = 6;
  private static readonly VERIFICATION_CODE_EXPIRY = 5 * 60; // 5 minutes in seconds
  private static readonly MAX_VERIFICATION_ATTEMPTS = 3;
  private static readonly RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds
  private static readonly MAX_SMS_PER_HOUR = parseInt(process.env.RATE_LIMIT_SMS_PER_HOUR || '3');

  /**
   * Generates a 6-digit verification code
   */
  static generateVerificationCode(): string {
    const code = crypto.randomInt(100000, 999999).toString();
    logger.info('Generated verification code', { codeLength: code.length });
    return code;
  }

  /**
   * Sends verification SMS via Twilio
   */
  static async sendVerificationSMS(phoneNumber: string, code: string): Promise<VerificationResult> {
    try {
      // Validate phone number format
      if (!UserHelpers.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          message: 'Invalid phone number format'
        };
      }

      // Check rate limiting
      const rateLimitKey = `rate_limit:sms:${phoneNumber}`;
      const currentAttempts = await redisClient.get(rateLimitKey);

      if (currentAttempts && parseInt(currentAttempts) >= this.MAX_SMS_PER_HOUR) {
        logger.warn('Rate limit exceeded for SMS', { phoneNumber });
        return {
          success: false,
          message: 'Too many SMS requests. Please try again later.'
        };
      }

      // Send SMS via Twilio
      const message = await twilioClient.messages.create({
        body: `Your BailOut verification code is: ${code}. This code expires in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      // Increment rate limit counter
      await redisClient.multi()
        .incr(rateLimitKey)
        .expire(rateLimitKey, this.RATE_LIMIT_WINDOW)
        .exec();

      logger.info('SMS sent successfully', {
        phoneNumber: phoneNumber.slice(0, 5) + 'XXXXX',
        messageSid: message.sid
      });

      return {
        success: true,
        message: 'Verification code sent successfully'
      };

    } catch (error) {
      logger.error('Failed to send SMS', {
        phoneNumber: phoneNumber.slice(0, 5) + 'XXXXX',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: 'Failed to send verification code. Please try again.'
      };
    }
  }

  /**
   * Stores verification code in Redis with expiry
   */
  static async storeVerificationCode(phoneNumber: string, code: string): Promise<void> {
    const key = `verification:${phoneNumber}`;
    const data = {
      code,
      attempts: 0,
      createdAt: new Date().toISOString()
    };

    await redisClient.setex(key, this.VERIFICATION_CODE_EXPIRY, JSON.stringify(data));
    logger.info('Verification code stored', { phoneNumber: phoneNumber.slice(0, 5) + 'XXXXX' });
  }

  /**
   * Verifies the provided code against stored code
   */
  static async verifyCode(phoneNumber: string, providedCode: string): Promise<VerificationResult> {
    try {
      const key = `verification:${phoneNumber}`;
      const storedData = await redisClient.get(key);

      if (!storedData) {
        return {
          success: false,
          message: 'Verification code expired or not found'
        };
      }

      const { code, attempts } = JSON.parse(storedData);

      // Check attempt limits
      if (attempts >= this.MAX_VERIFICATION_ATTEMPTS) {
        await redisClient.del(key);
        return {
          success: false,
          message: 'Too many verification attempts. Please request a new code.'
        };
      }

      // Verify code
      if (code !== providedCode) {
        // Increment attempts
        const updatedData = {
          ...JSON.parse(storedData),
          attempts: attempts + 1
        };
        await redisClient.setex(key, this.VERIFICATION_CODE_EXPIRY, JSON.stringify(updatedData));

        return {
          success: false,
          message: 'Invalid verification code'
        };
      }

      // Code is valid - remove from Redis
      await redisClient.del(key);

      logger.info('Verification code validated successfully', {
        phoneNumber: phoneNumber.slice(0, 5) + 'XXXXX'
      });

      return {
        success: true,
        message: 'Phone number verified successfully'
      };

    } catch (error) {
      logger.error('Error verifying code', {
        phoneNumber: phoneNumber.slice(0, 5) + 'XXXXX',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  }

  /**
   * Generates JWT access and refresh tokens
   */
  static generateJWT(user: User): AuthTokens {
    const payload: JWTPayload = {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      subscriptionTier: user.subscriptionTier
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        issuer: 'bailout-api',
        audience: 'bailout-app'
      }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'bailout-api',
        audience: 'bailout-app'
      }
    );

    const expiresIn = 15 * 60; // 15 minutes in seconds

    logger.info('JWT tokens generated', { userId: user.id });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer'
    };
  }

  /**
   * Validates JWT token and returns payload
   */
  static validateJWT(token: string): JWTPayload | null {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!, {
        issuer: 'bailout-api',
        audience: 'bailout-app'
      }) as JWTPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('JWT token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid JWT token');
      } else {
        logger.error('JWT validation error', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return null;
    }
  }

  /**
   * Validates refresh token
   */
  static validateRefreshToken(token: string): { userId: string } | null {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!, {
        issuer: 'bailout-api',
        audience: 'bailout-app'
      }) as { userId: string };

      return payload;
    } catch (error) {
      logger.warn('Invalid refresh token');
      return null;
    }
  }

  /**
   * Stores refresh token in Redis with expiry
   */
  static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    const expiryDays = parseInt(process.env.JWT_REFRESH_EXPIRES_IN?.replace('d', '') || '7');
    const expirySeconds = expiryDays * 24 * 60 * 60;

    await redisClient.setex(key, expirySeconds, refreshToken);
    logger.info('Refresh token stored', { userId });
  }

  /**
   * Validates stored refresh token
   */
  static async validateStoredRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const key = `refresh_token:${userId}`;
    const storedToken = await redisClient.get(key);
    return storedToken === refreshToken;
  }

  /**
   * Invalidates refresh token (logout)
   */
  static async invalidateRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await redisClient.del(key);
    logger.info('Refresh token invalidated', { userId });
  }

  /**
   * Creates or updates user after successful verification
   */
  static async createOrUpdateUser(phoneNumber: string, userData?: { name?: string; email?: string }): Promise<User> {
    // In a real implementation, this would interact with the database
    // For now, we'll create a mock user object
    const userId = crypto.randomUUID();

    const user: User = {
      id: userId,
      phoneNumber,
      name: userData?.name,
      email: userData?.email,
      createdAt: new Date(),
      verifiedAt: new Date(),
      profileSettings: DEFAULT_PROFILE_SETTINGS,
      subscriptionTier: 'free',
      callsRemaining: 3,
      isActive: true,
      updatedAt: new Date()
    };

    logger.info('User created/updated', {
      userId,
      phoneNumber: phoneNumber.slice(0, 5) + 'XXXXX'
    });

    return user;
  }

  /**
   * Complete login flow: verify code and return user with tokens
   */
  static async login(phoneNumber: string, verificationCode: string): Promise<LoginResult> {
    try {
      // Verify the code
      const verificationResult = await this.verifyCode(phoneNumber, verificationCode);

      if (!verificationResult.success) {
        return {
          success: false,
          message: verificationResult.message
        };
      }

      // Create or get user
      const user = await this.createOrUpdateUser(phoneNumber);

      // Generate tokens
      const tokens = this.generateJWT(user);

      // Store refresh token
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        success: true,
        user,
        tokens,
        message: 'Login successful'
      };

    } catch (error) {
      logger.error('Login failed', {
        phoneNumber: phoneNumber.slice(0, 5) + 'XXXXX',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ success: boolean; accessToken?: string; message: string }> {
    try {
      // Validate refresh token
      const payload = this.validateRefreshToken(refreshToken);
      if (!payload) {
        return {
          success: false,
          message: 'Invalid refresh token'
        };
      }

      // Check if refresh token is stored and valid
      const isValidStored = await this.validateStoredRefreshToken(payload.userId, refreshToken);
      if (!isValidStored) {
        return {
          success: false,
          message: 'Refresh token not found or expired'
        };
      }

      // Get user (in real implementation, fetch from database)
      // For now, create a mock user
      const user: User = {
        id: payload.userId,
        phoneNumber: '+1XXXXXXXXXX', // Would be fetched from DB
        createdAt: new Date(),
        profileSettings: DEFAULT_PROFILE_SETTINGS,
        subscriptionTier: 'free',
        callsRemaining: 3,
        isActive: true,
        updatedAt: new Date()
      };

      // Generate new access token
      const newTokens = this.generateJWT(user);

      return {
        success: true,
        accessToken: newTokens.accessToken,
        message: 'Token refreshed successfully'
      };

    } catch (error) {
      logger.error('Token refresh failed', { error: error instanceof Error ? error.message : 'Unknown error' });

      return {
        success: false,
        message: 'Token refresh failed'
      };
    }
  }

  /**
   * Logout user and invalidate tokens
   */
  static async logout(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.invalidateRefreshToken(userId);

      logger.info('User logged out', { userId });

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      logger.error('Logout failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }

  /**
   * Send verification code flow
   */
  static async sendVerificationCodeFlow(phoneNumber: string): Promise<VerificationResult> {
    try {
      // Sanitize phone number
      const sanitizedPhone = UserHelpers.sanitizePhoneNumber(phoneNumber);

      // Generate code
      const code = this.generateVerificationCode();

      // Store code in Redis
      await this.storeVerificationCode(sanitizedPhone, code);

      // Send SMS
      const smsResult = await this.sendVerificationSMS(sanitizedPhone, code);

      return smsResult;

    } catch (error) {
      logger.error('Send verification code flow failed', {
        phoneNumber: phoneNumber.slice(0, 5) + 'XXXXX',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: 'Failed to send verification code'
      };
    }
  }
}

export default AuthService;