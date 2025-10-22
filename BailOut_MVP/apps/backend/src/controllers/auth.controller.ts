import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import AuthService from '../services/auth.service';
import { Logger, sanitizeLogData } from '../utils/logger';
import { User, UserHelpers } from '../models/User';

// Request validation schemas
const sendCodeSchema = z.object({
  phoneNumber: z.string().min(10).max(15).refine(
    (phone) => UserHelpers.validatePhoneNumber(UserHelpers.sanitizePhoneNumber(phone)),
    {
      message: 'Invalid phone number format. Use E.164 format (+1XXXXXXXXXX)',
    }
  ),
});

const verifyCodeSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  verificationCode: z.string().length(6).regex(/^\d{6}$/, {
    message: 'Verification code must be 6 digits',
  }),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: any;
}

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    phoneNumber: string;
    subscriptionTier: string;
  };
}

export class AuthController {
  /**
   * POST /api/auth/send-code
   * Sends verification code to phone number
   */
  static async sendCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { phoneNumber } = sendCodeSchema.parse(req.body);
      const sanitizedPhone = UserHelpers.sanitizePhoneNumber(phoneNumber);

      Logger.auth('send_code_requested', {
        phoneNumber: sanitizeLogData({ phoneNumber: sanitizedPhone }).phoneNumber,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Send verification code
      const result = await AuthService.sendVerificationCodeFlow(sanitizedPhone);

      if (!result.success) {
        Logger.auth('send_code_failed', {
          phoneNumber: sanitizeLogData({ phoneNumber: sanitizedPhone }).phoneNumber,
          reason: result.message,
        });

        res.status(400).json({
          success: false,
          error: {
            code: 'SEND_CODE_FAILED',
            message: result.message,
          },
        } as ApiResponse);
        return;
      }

      Logger.auth('send_code_success', {
        phoneNumber: sanitizeLogData({ phoneNumber: sanitizedPhone }).phoneNumber,
      });

      res.status(200).json({
        success: true,
        data: {
          message: result.message,
          phoneNumber: UserHelpers.formatPhoneNumber(sanitizedPhone),
        },
      } as ApiResponse);

    } catch (error) {
      if (error instanceof z.ZodError) {
        Logger.auth('send_code_validation_error', {
          errors: error.errors,
          ip: req.ip,
        });

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        } as ApiResponse);
        return;
      }

      Logger.error('Send code controller error', error as Error, {
        ip: req.ip,
        body: sanitizeLogData(req.body),
      });

      next(error);
    }
  }

  /**
   * POST /api/auth/verify-code
   * Verifies code and returns JWT tokens
   */
  static async verifyCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { phoneNumber, verificationCode } = verifyCodeSchema.parse(req.body);
      const sanitizedPhone = UserHelpers.sanitizePhoneNumber(phoneNumber);

      Logger.auth('verify_code_requested', {
        phoneNumber: sanitizeLogData({ phoneNumber: sanitizedPhone }).phoneNumber,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Verify code and login
      const result = await AuthService.login(sanitizedPhone, verificationCode);

      if (!result.success) {
        Logger.auth('verify_code_failed', {
          phoneNumber: sanitizeLogData({ phoneNumber: sanitizedPhone }).phoneNumber,
          reason: result.message,
        });

        res.status(400).json({
          success: false,
          error: {
            code: 'VERIFICATION_FAILED',
            message: result.message,
          },
        } as ApiResponse);
        return;
      }

      const { user, tokens } = result;

      Logger.auth('verify_code_success', {
        userId: user!.id,
        phoneNumber: sanitizeLogData({ phoneNumber: sanitizedPhone }).phoneNumber,
        subscriptionTier: user!.subscriptionTier,
      });

      // Set HTTP-only cookie for refresh token (optional, for web clients)
      res.cookie('refreshToken', tokens!.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user!.id,
            phoneNumber: UserHelpers.formatPhoneNumber(user!.phoneNumber),
            name: user!.name,
            email: user!.email,
            subscriptionTier: user!.subscriptionTier,
            callsRemaining: user!.callsRemaining,
            profileSettings: user!.profileSettings,
            verifiedAt: user!.verifiedAt,
            createdAt: user!.createdAt,
          },
          tokens: {
            accessToken: tokens!.accessToken,
            refreshToken: tokens!.refreshToken,
            expiresIn: tokens!.expiresIn,
            tokenType: tokens!.tokenType,
          },
        },
      } as ApiResponse);

    } catch (error) {
      if (error instanceof z.ZodError) {
        Logger.auth('verify_code_validation_error', {
          errors: error.errors,
          ip: req.ip,
        });

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        } as ApiResponse);
        return;
      }

      Logger.error('Verify code controller error', error as Error, {
        ip: req.ip,
        body: sanitizeLogData(req.body),
      });

      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refreshes access token using refresh token
   */
  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get refresh token from body or cookie
      let refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      if (!refreshToken) {
        Logger.auth('refresh_token_missing', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });

        res.status(401).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_MISSING',
            message: 'Refresh token is required',
          },
        } as ApiResponse);
        return;
      }

      // Validate refresh token format if from body
      if (req.body.refreshToken) {
        const { refreshToken: validatedToken } = refreshTokenSchema.parse(req.body);
        refreshToken = validatedToken;
      }

      Logger.auth('refresh_token_requested', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Refresh access token
      const result = await AuthService.refreshAccessToken(refreshToken);

      if (!result.success) {
        Logger.auth('refresh_token_failed', {
          reason: result.message,
        });

        // Clear invalid refresh token cookie
        res.clearCookie('refreshToken');

        res.status(401).json({
          success: false,
          error: {
            code: 'REFRESH_FAILED',
            message: result.message,
          },
        } as ApiResponse);
        return;
      }

      Logger.auth('refresh_token_success');

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          expiresIn: 15 * 60, // 15 minutes
          tokenType: 'Bearer',
        },
      } as ApiResponse);

    } catch (error) {
      if (error instanceof z.ZodError) {
        Logger.auth('refresh_token_validation_error', {
          errors: error.errors,
          ip: req.ip,
        });

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        } as ApiResponse);
        return;
      }

      Logger.error('Refresh token controller error', error as Error, {
        ip: req.ip,
      });

      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logs out user and invalidates tokens
   */
  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        } as ApiResponse);
        return;
      }

      Logger.auth('logout_requested', {
        userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Logout user
      const result = await AuthService.logout(userId);

      if (!result.success) {
        Logger.auth('logout_failed', {
          userId,
          reason: result.message,
        });

        res.status(500).json({
          success: false,
          error: {
            code: 'LOGOUT_FAILED',
            message: result.message,
          },
        } as ApiResponse);
        return;
      }

      Logger.auth('logout_success', { userId });

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        data: {
          message: result.message,
        },
      } as ApiResponse);

    } catch (error) {
      Logger.error('Logout controller error', error as Error, {
        userId: req.user?.userId,
        ip: req.ip,
      });

      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Returns current user profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        } as ApiResponse);
        return;
      }

      Logger.auth('get_profile_requested', {
        userId,
        ip: req.ip,
      });

      // In a real implementation, fetch user from database
      // For now, create a mock user based on JWT payload
      const mockUser: User = {
        id: userId,
        phoneNumber: req.user!.phoneNumber,
        createdAt: new Date(),
        profileSettings: {
          voicePreferences: {
            preferredPersona: 'family_mom',
            voiceSpeed: 1.0,
            voiceStability: 0.8,
            voiceSimilarity: 0.8,
          },
          callerIdDefaults: {
            defaultCallerName: 'Mom',
            useRandomNumbers: true,
          },
          notifications: {
            smsNotifications: false,
            emailNotifications: false,
            pushNotifications: true,
            callReminders: true,
            subscriptionUpdates: true,
          },
          privacy: {
            shareUsageData: false,
            allowLocationTracking: false,
            emergencyLocationSharing: true,
            dataRetentionDays: 90,
            consentLevel: 'minimal',
          },
        },
        subscriptionTier: req.user!.subscriptionTier as any,
        callsRemaining: 3,
        isActive: true,
        updatedAt: new Date(),
      };

      Logger.auth('get_profile_success', { userId });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: mockUser.id,
            phoneNumber: UserHelpers.formatPhoneNumber(mockUser.phoneNumber),
            name: mockUser.name,
            email: mockUser.email,
            subscriptionTier: mockUser.subscriptionTier,
            callsRemaining: mockUser.callsRemaining,
            profileSettings: mockUser.profileSettings,
            verifiedAt: mockUser.verifiedAt,
            createdAt: mockUser.createdAt,
            isActive: mockUser.isActive,
          },
        },
      } as ApiResponse);

    } catch (error) {
      Logger.error('Get profile controller error', error as Error, {
        userId: req.user?.userId,
        ip: req.ip,
      });

      next(error);
    }
  }

  /**
   * PUT /api/auth/profile
   * Updates user profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        } as ApiResponse);
        return;
      }

      // Validate update data
      const updateSchema = z.object({
        name: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
        profileSettings: z.object({
          voicePreferences: z.object({
            preferredPersona: z.enum([
              'family_mom', 'family_dad', 'family_sibling',
              'work_boss', 'work_colleague',
              'friend_casual', 'friend_close',
              'service_doctor', 'service_delivery', 'service_uber',
              'emergency_contact', 'custom'
            ]).optional(),
            voiceSpeed: z.number().min(0.5).max(2.0).optional(),
            voiceStability: z.number().min(0).max(1).optional(),
            voiceSimilarity: z.number().min(0).max(1).optional(),
          }).optional(),
          callerIdDefaults: z.object({
            defaultCallerName: z.string().min(1).max(50).optional(),
            defaultCallerNumber: z.string().optional(),
            useRandomNumbers: z.boolean().optional(),
            emergencyContactName: z.string().optional(),
            emergencyContactNumber: z.string().optional(),
          }).optional(),
          notifications: z.object({
            smsNotifications: z.boolean().optional(),
            emailNotifications: z.boolean().optional(),
            pushNotifications: z.boolean().optional(),
            callReminders: z.boolean().optional(),
            subscriptionUpdates: z.boolean().optional(),
          }).optional(),
          privacy: z.object({
            shareUsageData: z.boolean().optional(),
            allowLocationTracking: z.boolean().optional(),
            emergencyLocationSharing: z.boolean().optional(),
            dataRetentionDays: z.number().min(30).max(365).optional(),
            consentLevel: z.enum(['minimal', 'standard', 'enhanced']).optional(),
          }).optional(),
        }).optional(),
      });

      const updateData = updateSchema.parse(req.body);

      Logger.auth('update_profile_requested', {
        userId,
        updateFields: Object.keys(updateData),
        ip: req.ip,
      });

      // In a real implementation, update user in database
      // For now, just return success with the updated data

      Logger.auth('update_profile_success', { userId });

      res.status(200).json({
        success: true,
        data: {
          message: 'Profile updated successfully',
          updatedFields: Object.keys(updateData),
        },
      } as ApiResponse);

    } catch (error) {
      if (error instanceof z.ZodError) {
        Logger.auth('update_profile_validation_error', {
          userId: req.user?.userId,
          errors: error.errors,
          ip: req.ip,
        });

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        } as ApiResponse);
        return;
      }

      Logger.error('Update profile controller error', error as Error, {
        userId: req.user?.userId,
        ip: req.ip,
      });

      next(error);
    }
  }
}

export default AuthController;