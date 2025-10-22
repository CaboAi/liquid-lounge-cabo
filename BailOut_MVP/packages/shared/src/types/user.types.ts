export interface VoicePreferences {
  defaultCallerType: 'mom' | 'boss' | 'friend' | 'roommate' | 'doctor';
  voiceGender: 'male' | 'female' | 'neutral';
  accent: 'us' | 'uk' | 'australian';
  callDurationMinutes: 1 | 2 | 3 | 4 | 5;
  voiceSpeed: number; // 0.5 - 2.0
  voiceStability: number; // 0 - 1
}

export interface CallerIdSettings {
  defaultContactName: string; // max 25 chars
  defaultPhoneNumber: string; // format: (XXX) XXX-XXXX
  useRandomNumbers: boolean;
  showAsUnknown: boolean;
}

export interface NotificationPreferences {
  callReminders: boolean;
  subscriptionUpdates: boolean;
  tipsAndTricks: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  voicePreferences?: Partial<VoicePreferences>;
  callerIdSettings?: Partial<CallerIdSettings>;
  notificationPreferences?: Partial<NotificationPreferences>;
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  voicePreferences: VoicePreferences;
  callerIdSettings: CallerIdSettings;
  notificationPreferences: NotificationPreferences;
}

export interface DeleteAccountRequest {
  reason?: string;
  feedback?: string;
  confirmPhoneNumber: string;
}

export const DEFAULT_VOICE_PREFERENCES: VoicePreferences = {
  defaultCallerType: 'mom',
  voiceGender: 'female',
  accent: 'us',
  callDurationMinutes: 2,
  voiceSpeed: 1.0,
  voiceStability: 0.75,
};

export const DEFAULT_CALLER_ID_SETTINGS: CallerIdSettings = {
  defaultContactName: 'Mom',
  defaultPhoneNumber: '(555) 123-4567',
  useRandomNumbers: false,
  showAsUnknown: false,
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  callReminders: true,
  subscriptionUpdates: true,
  tipsAndTricks: false,
  pushNotifications: true,
  emailNotifications: false,
};

export const VOICE_GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'neutral', label: 'Neutral' },
] as const;

export const ACCENT_OPTIONS = [
  { value: 'us', label: 'American' },
  { value: 'uk', label: 'British' },
  { value: 'australian', label: 'Australian' },
] as const;

export const CALLER_TYPE_OPTIONS = [
  { value: 'mom', label: 'Mom', emoji: '👩‍👧‍👦' },
  { value: 'boss', label: 'Boss', emoji: '👔' },
  { value: 'friend', label: 'Friend', emoji: '👥' },
  { value: 'roommate', label: 'Roommate', emoji: '🏠' },
  { value: 'doctor', label: 'Doctor', emoji: '🩺' },
] as const;