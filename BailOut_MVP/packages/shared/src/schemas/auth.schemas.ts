import { z } from 'zod';
import { VoicePersona, ConsentLevel, SubscriptionTier } from '../types/auth.types';

/**
 * Shared Zod validation schemas for authentication
 * Used by both mobile app and backend API
 */

// Phone number validation
export const phoneNumberSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must not exceed 15 digits')
  .refine(
    (phone) => {
      // Remove all non-digit characters except +
      const cleaned = phone.replace(/[^\d+]/g, '');

      // Check E.164 format for US numbers
      const e164Regex = /^\+1[2-9]\d{9}$/;

      // Also accept 10-digit US numbers
      const usNumberRegex = /^\d{10}$/;

      // Accept 11-digit numbers starting with 1
      const us11DigitRegex = /^1[2-9]\d{9}$/;

      return e164Regex.test(cleaned) ||
             usNumberRegex.test(cleaned) ||
             us11DigitRegex.test(cleaned);
    },
    {
      message: 'Invalid phone number format. Use US phone number format.',
    }
  );

// Verification code validation
export const verificationCodeSchema = z
  .string()
  .length(6, 'Verification code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only digits');

// JWT token validation
export const accessTokenSchema = z
  .string()
  .min(1, 'Access token is required')
  .regex(
    /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*$/,
    'Invalid JWT token format'
  );

export const refreshTokenSchema = z
  .string()
  .min(1, 'Refresh token is required');

// User profile validation schemas
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must not exceed 255 characters')
  .optional();

// Voice preferences schema
export const voicePreferencesSchema = z.object({
  preferredVoiceId: z.string().optional(),
  preferredPersona: z.enum([
    'family_mom',
    'family_dad',
    'family_sibling',
    'work_boss',
    'work_colleague',
    'friend_casual',
    'friend_close',
    'service_doctor',
    'service_delivery',
    'service_uber',
    'emergency_contact',
    'custom',
  ] as const),
  voiceSpeed: z.number().min(0.5).max(2.0),
  voiceStability: z.number().min(0).max(1),
  voiceSimilarity: z.number().min(0).max(1),
});

// Caller ID defaults schema
export const callerIdDefaultsSchema = z.object({
  defaultCallerName: z.string().min(1).max(50),
  defaultCallerNumber: z.string().optional(),
  useRandomNumbers: z.boolean(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: phoneNumberSchema.optional(),
});

// Notification settings schema
export const notificationSettingsSchema = z.object({
  smsNotifications: z.boolean(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  callReminders: z.boolean(),
  subscriptionUpdates: z.boolean(),
});

// Privacy settings schema
export const privacySettingsSchema = z.object({
  shareUsageData: z.boolean(),
  allowLocationTracking: z.boolean(),
  emergencyLocationSharing: z.boolean(),
  dataRetentionDays: z.number().min(30).max(365),
  consentLevel: z.enum(['minimal', 'standard', 'enhanced'] as const),
});

// Complete profile settings schema
export const profileSettingsSchema = z.object({
  voicePreferences: voicePreferencesSchema.optional(),
  callerIdDefaults: callerIdDefaultsSchema.optional(),
  notifications: notificationSettingsSchema.optional(),
  privacy: privacySettingsSchema.optional(),
});

// API request schemas
export const sendCodeRequestSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

export const verifyCodeRequestSchema = z.object({
  phoneNumber: phoneNumberSchema,
  verificationCode: verificationCodeSchema,
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: refreshTokenSchema,
});

export const updateProfileRequestSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema,
  profileSettings: profileSettingsSchema.optional(),
});

// Device info schema for session tracking
export const deviceInfoSchema = z.object({
  deviceId: z.string().min(1),
  deviceType: z.enum(['ios', 'android', 'web']),
  deviceName: z.string().min(1).max(100),
  appVersion: z.string().min(1).max(20),
  osVersion: z.string().min(1).max(20),
});

// Login flow validation
export const loginStepSchema = z.enum([
  'phone_input',
  'code_verification',
  'onboarding',
  'completed',
]);

// Form validation helpers
export const createFormSchema = <T extends z.ZodType>(schema: T) => {
  return z.object({
    data: schema,
    errors: z.array(z.object({
      field: z.string(),
      message: z.string(),
    })).default([]),
    touched: z.record(z.boolean()).default({}),
    isSubmitting: z.boolean().default(false),
  });
};

// Validation helper functions
export class AuthValidation {
  /**
   * Validates and sanitizes phone number to E.164 format
   */
  static sanitizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Add +1 if US number without country code
    if (cleaned.length === 10 && !cleaned.startsWith('+')) {
      return `+1${cleaned}`;
    }

    // Add + if missing
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Formats phone number for display
   */
  static formatPhoneForDisplay(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/[^\d]/g, '');

    if (cleaned.length >= 10) {
      const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }

    return phoneNumber;
  }

  /**
   * Validates verification code format
   */
  static isValidVerificationCode(code: string): boolean {
    return verificationCodeSchema.safeParse(code).success;
  }

  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    return emailSchema.safeParse(email).success;
  }

  /**
   * Validates name format
   */
  static isValidName(name: string): boolean {
    return nameSchema.safeParse(name).success;
  }

  /**
   * Validates JWT token format
   */
  static isValidJWT(token: string): boolean {
    return accessTokenSchema.safeParse(token).success;
  }

  /**
   * Creates a safe validation result
   */
  static safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: z.ZodError;
  } {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error };
    }
  }

  /**
   * Formats Zod errors for API responses
   */
  static formatZodErrors(error: z.ZodError): Array<{ field: string; message: string }> {
    return error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  }
}

// Password schema (for future use if adding password authentication)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
  );

// Export all schemas
export const authSchemas = {
  phoneNumber: phoneNumberSchema,
  verificationCode: verificationCodeSchema,
  accessToken: accessTokenSchema,
  refreshToken: refreshTokenSchema,
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  voicePreferences: voicePreferencesSchema,
  callerIdDefaults: callerIdDefaultsSchema,
  notificationSettings: notificationSettingsSchema,
  privacySettings: privacySettingsSchema,
  profileSettings: profileSettingsSchema,
  sendCodeRequest: sendCodeRequestSchema,
  verifyCodeRequest: verifyCodeRequestSchema,
  refreshTokenRequest: refreshTokenRequestSchema,
  updateProfileRequest: updateProfileRequestSchema,
  deviceInfo: deviceInfoSchema,
  loginStep: loginStepSchema,
};

export default authSchemas;