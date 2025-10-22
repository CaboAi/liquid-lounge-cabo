import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import AuthService from '../services/auth.service';
import { redisClient } from '../utils/redis';
import { UserHelpers } from '../models/User';

// Mock dependencies
jest.mock('../utils/redis');
jest.mock('twilio');
jest.mock('jsonwebtoken');
jest.mock('../utils/logger');

const mockRedisClient = redisClient as jest.Mocked<typeof redisClient>;

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset all mocks after each test
    jest.resetAllMocks();
  });

  describe('generateVerificationCode', () => {
    it('should generate a 6-digit code', () => {
      const code = AuthService.generateVerificationCode();

      expect(code).toHaveLength(6);
      expect(code).toMatch(/^\d{6}$/);
      expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(code)).toBeLessThanOrEqual(999999);
    });

    it('should generate different codes on multiple calls', () => {
      const code1 = AuthService.generateVerificationCode();
      const code2 = AuthService.generateVerificationCode();
      const code3 = AuthService.generateVerificationCode();

      expect(code1).not.toBe(code2);
      expect(code2).not.toBe(code3);
      expect(code1).not.toBe(code3);
    });
  });

  describe('storeVerificationCode', () => {
    it('should store verification code in Redis with correct expiry', async () => {
      const phoneNumber = '+1234567890';
      const code = '123456';

      mockRedisClient.setex.mockResolvedValue('OK');

      await AuthService.storeVerificationCode(phoneNumber, code);

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        `verification:${phoneNumber}`,
        300, // 5 minutes
        JSON.stringify({
          code,
          attempts: 0,
          createdAt: expect.any(String)
        })
      );
    });
  });

  describe('verifyCode', () => {
    const phoneNumber = '+1234567890';
    const correctCode = '123456';
    const incorrectCode = '654321';

    it('should verify correct code successfully', async () => {
      const storedData = {
        code: correctCode,
        attempts: 0,
        createdAt: new Date().toISOString()
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(storedData));
      mockRedisClient.del.mockResolvedValue(1);

      const result = await AuthService.verifyCode(phoneNumber, correctCode);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Phone number verified successfully');
      expect(mockRedisClient.del).toHaveBeenCalledWith(`verification:${phoneNumber}`);
    });

    it('should fail with incorrect code', async () => {
      const storedData = {
        code: correctCode,
        attempts: 0,
        createdAt: new Date().toISOString()
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(storedData));
      mockRedisClient.setex.mockResolvedValue('OK');

      const result = await AuthService.verifyCode(phoneNumber, incorrectCode);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid verification code');
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        `verification:${phoneNumber}`,
        300,
        JSON.stringify({
          code: correctCode,
          attempts: 1,
          createdAt: expect.any(String)
        })
      );
    });

    it('should fail when code is expired', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await AuthService.verifyCode(phoneNumber, correctCode);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Verification code expired or not found');
    });

    it('should fail after max attempts', async () => {
      const storedData = {
        code: correctCode,
        attempts: 3, // Max attempts reached
        createdAt: new Date().toISOString()
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(storedData));
      mockRedisClient.del.mockResolvedValue(1);

      const result = await AuthService.verifyCode(phoneNumber, incorrectCode);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Too many verification attempts. Please request a new code.');
      expect(mockRedisClient.del).toHaveBeenCalledWith(`verification:${phoneNumber}`);
    });
  });

  describe('generateJWT', () => {
    it('should generate valid JWT tokens', () => {
      const mockUser = {
        id: 'user123',
        phoneNumber: '+1234567890',
        subscriptionTier: 'free' as const,
        createdAt: new Date(),
        profileSettings: {} as any,
        callsRemaining: 3,
        isActive: true,
        updatedAt: new Date()
      };

      // Mock jwt.sign to return test tokens
      const jwt = require('jsonwebtoken');
      jwt.sign = jest.fn()
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');

      const tokens = AuthService.generateJWT(mockUser);

      expect(tokens).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 900, // 15 minutes
        tokenType: 'Bearer'
      });

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          phoneNumber: mockUser.phoneNumber,
          subscriptionTier: mockUser.subscriptionTier
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '15m',
          issuer: 'bailout-api',
          audience: 'bailout-app'
        }
      );
    });
  });

  describe('validateJWT', () => {
    it('should validate correct JWT token', () => {
      const mockPayload = {
        userId: 'user123',
        phoneNumber: '+1234567890',
        subscriptionTier: 'free'
      };

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue(mockPayload);

      const result = AuthService.validateJWT('valid-token');

      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        process.env.JWT_SECRET,
        {
          issuer: 'bailout-api',
          audience: 'bailout-app'
        }
      );
    });

    it('should return null for invalid token', () => {
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      const result = AuthService.validateJWT('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new jwt.TokenExpiredError('token expired', new Date());
      });

      const result = AuthService.validateJWT('expired-token');

      expect(result).toBeNull();
    });
  });

  describe('sendVerificationCodeFlow', () => {
    it('should complete full verification code flow', async () => {
      const phoneNumber = '1234567890';
      const sanitizedPhone = '+1234567890';

      // Mock Twilio response
      const twilio = require('twilio');
      const mockTwilioClient = {
        messages: {
          create: jest.fn().mockResolvedValue({
            sid: 'test-message-sid'
          })
        }
      };
      twilio.mockReturnValue(mockTwilioClient);

      // Mock Redis operations
      mockRedisClient.get.mockResolvedValue('0'); // Rate limit check
      mockRedisClient.multi.mockReturnValue({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      });
      mockRedisClient.setex.mockResolvedValue('OK');

      const result = await AuthService.sendVerificationCodeFlow(phoneNumber);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Verification code sent successfully');
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        body: expect.stringContaining('Your BailOut verification code is:'),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: sanitizedPhone
      });
    });

    it('should fail when rate limited', async () => {
      const phoneNumber = '+1234567890';

      // Mock rate limit exceeded
      mockRedisClient.get.mockResolvedValue('5'); // Exceeds limit of 3

      const result = await AuthService.sendVerificationCodeFlow(phoneNumber);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Too many SMS requests. Please try again later.');
    });
  });
});

describe('UserHelpers', () => {
  describe('validatePhoneNumber', () => {
    it('should validate correct US phone numbers', () => {
      expect(UserHelpers.validatePhoneNumber('+12345678901')).toBe(true);
      expect(UserHelpers.validatePhoneNumber('+19876543210')).toBe(true);
      expect(UserHelpers.validatePhoneNumber('+15551234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(UserHelpers.validatePhoneNumber('+11234567890')).toBe(false); // Starts with 1
      expect(UserHelpers.validatePhoneNumber('+123456789')).toBe(false); // Too short
      expect(UserHelpers.validatePhoneNumber('1234567890')).toBe(false); // No country code
      expect(UserHelpers.validatePhoneNumber('+15551234567890')).toBe(false); // Too long
    });
  });

  describe('sanitizePhoneNumber', () => {
    it('should sanitize phone numbers correctly', () => {
      expect(UserHelpers.sanitizePhoneNumber('(555) 123-4567')).toBe('+15551234567');
      expect(UserHelpers.sanitizePhoneNumber('555-123-4567')).toBe('+15551234567');
      expect(UserHelpers.sanitizePhoneNumber('5551234567')).toBe('+15551234567');
      expect(UserHelpers.sanitizePhoneNumber('15551234567')).toBe('+15551234567');
      expect(UserHelpers.sanitizePhoneNumber('+15551234567')).toBe('+15551234567');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone numbers for display', () => {
      expect(UserHelpers.formatPhoneNumber('+15551234567')).toBe('(555) 123-4567');
      expect(UserHelpers.formatPhoneNumber('+19876543210')).toBe('(987) 654-3210');
    });

    it('should return original if not valid format', () => {
      expect(UserHelpers.formatPhoneNumber('invalid')).toBe('invalid');
      expect(UserHelpers.formatPhoneNumber('+44123456789')).toBe('+44123456789');
    });
  });

  describe('canMakeCall', () => {
    it('should allow calls for pro users', () => {
      const proUser = {
        subscriptionTier: 'pro' as const,
        callsRemaining: 0 // Shouldn't matter for pro
      } as any;

      expect(UserHelpers.canMakeCall(proUser)).toBe(true);
    });

    it('should allow calls for free users with remaining calls', () => {
      const freeUser = {
        subscriptionTier: 'free' as const,
        callsRemaining: 2
      } as any;

      expect(UserHelpers.canMakeCall(freeUser)).toBe(true);
    });

    it('should deny calls for free users without remaining calls', () => {
      const freeUser = {
        subscriptionTier: 'free' as const,
        callsRemaining: 0
      } as any;

      expect(UserHelpers.canMakeCall(freeUser)).toBe(false);
    });
  });
});