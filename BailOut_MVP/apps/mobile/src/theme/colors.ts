export const colors = {
  // Brand colors
  primary: '#FF3B30',       // Emergency red
  secondary: '#007AFF',     // iOS blue

  // Status colors
  success: '#34C759',       // Green
  warning: '#FF9500',       // Orange
  error: '#FF3B30',         // Red (same as primary)
  info: '#007AFF',          // Blue

  // Background colors
  background: '#000000',    // Black
  backgroundSecondary: '#111111', // Very dark gray
  surface: '#1C1C1E',       // Dark gray surface
  surfaceSecondary: '#2C2C2E', // Lighter surface

  // Text colors
  text: '#FFFFFF',          // White
  textSecondary: '#8E8E93', // Light gray
  textTertiary: '#48484A',  // Medium gray
  textInverse: '#000000',   // Black (for light backgrounds)

  // Interactive colors
  link: '#007AFF',          // Blue
  linkPressed: '#0051D5',   // Darker blue
  button: '#007AFF',        // Blue
  buttonPressed: '#0051D5', // Darker blue
  buttonDanger: '#FF3B30',  // Red
  buttonDangerPressed: '#D70015', // Darker red

  // Border and separator colors
  border: '#38383A',        // Border gray
  borderSecondary: '#2C2C2E', // Lighter border
  separator: '#38383A',     // Same as border

  // Overlay and modal colors
  overlay: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
  modalBackground: '#1C1C1E',     // Dark gray

  // System colors (iOS style)
  systemBackground: '#000000',
  systemGroupedBackground: '#000000',
  secondarySystemBackground: '#1C1C1E',
  tertiarySystemBackground: '#2C2C2E',

  // Caller type colors
  callerColors: {
    mom: '#FF69B4',         // Hot pink
    boss: '#FFD700',        // Gold
    friend: '#00CED1',      // Dark turquoise
    roommate: '#9370DB',    // Medium purple
    doctor: '#20B2AA',      // Light sea green
  },

  // Status colors for calls
  callStatus: {
    scheduled: '#007AFF',   // Blue
    in_progress: '#FF9500', // Orange
    completed: '#34C759',   // Green
    canceled: '#8E8E93',    // Gray
    failed: '#FF3B30',      // Red
  },

  // Subscription tier colors
  subscription: {
    free: '#8E8E93',        // Gray
    pro: '#FFD700',         // Gold
    enterprise: '#9370DB',  // Purple
  },
} as const;

export type ColorKey = keyof typeof colors;
export type CallerTypeColor = keyof typeof colors.callerColors;
export type CallStatusColor = keyof typeof colors.callStatus;
export type SubscriptionColor = keyof typeof colors.subscription;