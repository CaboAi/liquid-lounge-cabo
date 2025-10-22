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

// Database schema interfaces for PostgreSQL
export interface CreateUserData {
  phoneNumber: string;
  name?: string;
  email?: string;
  profileSettings?: Partial<ProfileSettings>;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  profileSettings?: Partial<ProfileSettings>;
  subscriptionTier?: SubscriptionTier;
  callsRemaining?: number;
  isActive?: boolean;
}

// User search and filtering
export interface UserFilters {
  subscriptionTier?: SubscriptionTier;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  hasVerifiedPhone?: boolean;
  hasEmail?: boolean;
}

// User statistics
export interface UserStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageCallDuration: number;
  favoriteVoicePersona: VoicePersona;
  lastActiveDate: Date;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
}

// Authentication related interfaces
export interface UserSession {
  userId: string;
  sessionId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceName: string;
  appVersion: string;
  osVersion: string;
}

// Verification code storage
export interface VerificationCode {
  phoneNumber: string;
  code: string;
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
}

// Rate limiting
export interface RateLimitData {
  phoneNumber: string;
  attempts: number;
  firstAttemptAt: Date;
  lastAttemptAt: Date;
  blockedUntil?: Date;
}

// Default profile settings for new users
export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
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
};

// Subscription tier configurations
export const SUBSCRIPTION_CONFIGS = {
  free: {
    callsPerMonth: 3,
    features: ['basic_scenarios', 'standard_voices'],
    price: 0,
  },
  pro: {
    callsPerMonth: -1, // unlimited
    features: ['premium_scenarios', 'all_voices', 'scheduling', 'analytics'],
    price: 9.99,
  },
  enterprise: {
    callsPerMonth: -1, // unlimited
    features: ['all_features', 'priority_support', 'custom_voices', 'api_access'],
    price: null, // custom pricing
  },
} as const;

// Helper functions for user operations
export class UserHelpers {
  static isSubscriptionActive(user: User): boolean {
    return user.subscriptionTier !== 'free' || user.callsRemaining > 0;
  }

  static canMakeCall(user: User): boolean {
    if (user.subscriptionTier === 'free') {
      return user.callsRemaining > 0;
    }
    return true; // pro and enterprise have unlimited calls
  }

  static getCallsRemainingText(user: User): string {
    if (user.subscriptionTier === 'free') {
      return `${user.callsRemaining} calls remaining this month`;
    }
    return 'Unlimited calls';
  }

  static shouldRefreshMonthlyCalls(user: User): boolean {
    if (user.subscriptionTier === 'free' && user.lastCallAt) {
      const lastCallMonth = new Date(user.lastCallAt).getMonth();
      const currentMonth = new Date().getMonth();
      return lastCallMonth !== currentMonth;
    }
    return false;
  }

  static formatPhoneNumber(phoneNumber: string): string {
    // Convert E.164 format to display format
    // +1XXXXXXXXXX -> (XXX) XXX-XXXX
    if (phoneNumber.startsWith('+1') && phoneNumber.length === 12) {
      const digits = phoneNumber.slice(2);
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phoneNumber;
  }

  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 validation for US numbers
    const e164Regex = /^\+1[2-9]\d{9}$/;
    return e164Regex.test(phoneNumber);
  }

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
}

export default User;