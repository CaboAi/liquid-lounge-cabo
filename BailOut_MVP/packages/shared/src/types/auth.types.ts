/**
 * Shared authentication types for BailOut platform
 * Used by both mobile app and backend API
 */

// User-related types
export interface User {
  id: string;
  phoneNumber: string; // E.164 format (+1XXXXXXXXXX)
  name?: string;
  email?: string;
  createdAt: Date;
  verifiedAt?: Date;
  profileSettings: ProfileSettings;
  subscriptionTier: SubscriptionTier;
  callsRemaining: number;
  lastCallAt?: Date;
  isActive: boolean;
  updatedAt: Date;
}

export interface ProfileSettings {
  voicePreferences: VoicePreferences;
  callerIdDefaults: CallerIdDefaults;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface VoicePreferences {
  preferredVoiceId?: string;
  preferredPersona: VoicePersona;
  voiceSpeed: number; // 0.5 - 2.0
  voiceStability: number; // 0 - 1
  voiceSimilarity: number; // 0 - 1
}

export interface CallerIdDefaults {
  defaultCallerName: string;
  defaultCallerNumber?: string;
  useRandomNumbers: boolean;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
}

export interface NotificationSettings {
  smsNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  callReminders: boolean;
  subscriptionUpdates: boolean;
}

export interface PrivacySettings {
  shareUsageData: boolean;
  allowLocationTracking: boolean;
  emergencyLocationSharing: boolean;
  dataRetentionDays: number;
  consentLevel: ConsentLevel;
}

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export type VoicePersona =
  | 'family_mom'
  | 'family_dad'
  | 'family_sibling'
  | 'work_boss'
  | 'work_colleague'
  | 'friend_casual'
  | 'friend_close'
  | 'service_doctor'
  | 'service_delivery'
  | 'service_uber'
  | 'emergency_contact'
  | 'custom';

export type ConsentLevel = 'minimal' | 'standard' | 'enhanced';

// Authentication token types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: 'Bearer';
}

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  subscriptionTier: string;
  iat?: number;
  exp?: number;
}

// API Request/Response types
export interface SendCodeRequest {
  phoneNumber: string;
}

export interface SendCodeResponse {
  success: boolean;
  data?: {
    message: string;
    phoneNumber: string; // formatted display version
  };
  error?: ApiError;
}

export interface VerifyCodeRequest {
  phoneNumber: string;
  verificationCode: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  error?: ApiError;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
  };
  error?: ApiError;
}

export interface LogoutResponse {
  success: boolean;
  data?: {
    message: string;
  };
  error?: ApiError;
}

export interface GetProfileResponse {
  success: boolean;
  data?: {
    user: User;
  };
  error?: ApiError;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  profileSettings?: Partial<ProfileSettings>;
}

export interface UpdateProfileResponse {
  success: boolean;
  data?: {
    message: string;
    updatedFields: string[];
  };
  error?: ApiError;
}

// Common API error structure
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Authentication state for mobile app
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoginAt?: Date;
}

// Device info for session tracking
export interface DeviceInfo {
  deviceId: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceName: string;
  appVersion: string;
  osVersion: string;
}

// Login flow states
export type LoginStep =
  | 'phone_input'
  | 'code_verification'
  | 'onboarding'
  | 'completed';

export interface LoginFlowState {
  currentStep: LoginStep;
  phoneNumber?: string;
  verificationCodeSent: boolean;
  canResendCode: boolean;
  resendCountdown: number;
  verificationAttempts: number;
  maxVerificationAttempts: number;
}

// Rate limiting info
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Error codes for consistent error handling
export const AUTH_ERROR_CODES = {
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_PHONE_NUMBER: 'INVALID_PHONE_NUMBER',
  INVALID_VERIFICATION_CODE: 'INVALID_VERIFICATION_CODE',

  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',

  // Verification errors
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  CODE_EXPIRED: 'CODE_EXPIRED',
  CODE_NOT_FOUND: 'CODE_NOT_FOUND',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',

  // SMS errors
  SEND_CODE_FAILED: 'SEND_CODE_FAILED',
  SMS_SERVICE_ERROR: 'SMS_SERVICE_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_SMS_REQUESTS: 'TOO_MANY_SMS_REQUESTS',

  // User account errors
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  INSUFFICIENT_SUBSCRIPTION: 'INSUFFICIENT_SUBSCRIPTION',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  REDIS_ERROR: 'REDIS_ERROR',
} as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];

// Helper type for form validation
export interface FormError {
  field: string;
  message: string;
}

export interface FormState {
  isSubmitting: boolean;
  errors: FormError[];
  touched: Record<string, boolean>;
}

// Phone number formatting utilities (types)
export interface PhoneNumberFormat {
  e164: string; // +1XXXXXXXXXX
  national: string; // (XXX) XXX-XXXX
  international: string; // +1 XXX XXX XXXX
  display: string; // Formatted for UI display
}

// Subscription tier features
export interface SubscriptionFeatures {
  callsPerMonth: number;
  features: string[];
  price: number | null;
  billingCycle?: 'monthly' | 'yearly';
}

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    callsPerMonth: 3,
    features: ['basic_scenarios', 'standard_voices'],
    price: 0,
  },
  pro: {
    callsPerMonth: -1, // unlimited
    features: ['premium_scenarios', 'all_voices', 'scheduling', 'analytics'],
    price: 9.99,
    billingCycle: 'monthly',
  },
  enterprise: {
    callsPerMonth: -1, // unlimited
    features: ['all_features', 'priority_support', 'custom_voices', 'api_access'],
    price: null, // custom pricing
  },
};

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export default {
  AUTH_ERROR_CODES,
  SUBSCRIPTION_FEATURES,
};