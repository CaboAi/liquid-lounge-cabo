/**
 * Feature flags configuration for CaboFitPass
 * Controls which features are enabled in different environments
 */

import { ENV_CONFIG } from './constants'

export interface FeatureFlag {
  name: string
  description: string
  enabled: boolean
  environments?: ('development' | 'production' | 'test')[]
  rolloutPercentage?: number
  dependencies?: string[]
  version?: string
}

// Core application features
export const CORE_FEATURES: Record<string, FeatureFlag> = {
  classBooking: {
    name: 'Class Booking',
    description: 'Allow users to book fitness classes',
    enabled: true
  },
  
  creditSystem: {
    name: 'Credit System',
    description: 'Credit-based payment system for classes',
    enabled: true
  },
  
  realTimeUpdates: {
    name: 'Real-time Updates',
    description: 'Real-time synchronization of class availability and bookings',
    enabled: true,
    environments: ['development', 'production']
  },
  
  searchAndFilter: {
    name: 'Search and Filter',
    description: 'Advanced search and filtering for classes and studios',
    enabled: true
  },
  
  userProfiles: {
    name: 'User Profiles',
    description: 'User profile management and preferences',
    enabled: true
  },
  
  studioManagement: {
    name: 'Studio Management',
    description: 'Studio owner dashboard and management tools',
    enabled: true
  }
}

// Payment and commerce features
export const PAYMENT_FEATURES: Record<string, FeatureFlag> = {
  stripePayments: {
    name: 'Stripe Payments',
    description: 'Stripe payment processing for credit purchases',
    enabled: true,
    environments: ['production']
  },
  
  applePayGooglePay: {
    name: 'Apple Pay & Google Pay',
    description: 'Digital wallet payment options',
    enabled: true,
    environments: ['production'],
    dependencies: ['stripePayments']
  },
  
  paypalPayments: {
    name: 'PayPal Payments',
    description: 'PayPal payment processing option',
    enabled: false, // Not implemented yet
    version: '1.1.0'
  },
  
  subscriptionPlans: {
    name: 'Subscription Plans',
    description: 'Monthly/yearly subscription options',
    enabled: false, // Future feature
    version: '2.0.0'
  },
  
  corporateAccounts: {
    name: 'Corporate Accounts',
    description: 'Business accounts with bulk booking and billing',
    enabled: false, // Future feature
    version: '2.0.0'
  }
}

// Social and community features
export const SOCIAL_FEATURES: Record<string, FeatureFlag> = {
  classReviews: {
    name: 'Class Reviews',
    description: 'User reviews and ratings for classes',
    enabled: true
  },
  
  socialLogin: {
    name: 'Social Login',
    description: 'Login with Google, Facebook, Apple',
    enabled: true,
    environments: ['production']
  },
  
  friendsAndFollowing: {
    name: 'Friends and Following',
    description: 'Social connections between users',
    enabled: false, // Future feature
    version: '1.5.0'
  },
  
  classChallenges: {
    name: 'Class Challenges',
    description: 'Fitness challenges and competitions',
    enabled: false, // Future feature
    version: '2.0.0'
  },
  
  communityFeed: {
    name: 'Community Feed',
    description: 'Social feed for sharing workout achievements',
    enabled: false, // Future feature
    version: '2.0.0'
  }
}

// Notification features
export const NOTIFICATION_FEATURES: Record<string, FeatureFlag> = {
  emailNotifications: {
    name: 'Email Notifications',
    description: 'Email notifications for bookings and updates',
    enabled: true
  },
  
  pushNotifications: {
    name: 'Push Notifications',
    description: 'Browser push notifications',
    enabled: true,
    environments: ['production']
  },
  
  smsNotifications: {
    name: 'SMS Notifications',
    description: 'SMS notifications for important updates',
    enabled: false, // Not implemented yet
    version: '1.2.0'
  },
  
  whatsappNotifications: {
    name: 'WhatsApp Notifications',
    description: 'WhatsApp notifications for Mexican users',
    enabled: false, // Future feature
    version: '1.3.0'
  }
}

// Analytics and tracking features
export const ANALYTICS_FEATURES: Record<string, FeatureFlag> = {
  googleAnalytics: {
    name: 'Google Analytics',
    description: 'Google Analytics tracking',
    enabled: ENV_CONFIG.isProduction,
    environments: ['production']
  },
  
  userAnalytics: {
    name: 'User Analytics',
    description: 'User behavior and fitness progress analytics',
    enabled: true
  },
  
  studioAnalytics: {
    name: 'Studio Analytics',
    description: 'Studio performance and business analytics',
    enabled: true
  },
  
  heatmapTracking: {
    name: 'Heatmap Tracking',
    description: 'User interaction heatmap tracking',
    enabled: false, // Future feature
    version: '1.4.0'
  },
  
  a11yTracking: {
    name: 'Accessibility Tracking',
    description: 'Track accessibility feature usage',
    enabled: ENV_CONFIG.isDevelopment,
    environments: ['development']
  }
}

// Mobile and platform features
export const PLATFORM_FEATURES: Record<string, FeatureFlag> = {
  mobileResponsive: {
    name: 'Mobile Responsive',
    description: 'Mobile-optimized responsive design',
    enabled: true
  },
  
  pwaSupport: {
    name: 'Progressive Web App',
    description: 'PWA support for mobile app-like experience',
    enabled: true
  },
  
  offlineMode: {
    name: 'Offline Mode',
    description: 'Offline functionality for viewing booked classes',
    enabled: false, // Future feature
    version: '1.6.0'
  },
  
  nativeAppIntegration: {
    name: 'Native App Integration',
    description: 'Integration with native iOS/Android apps',
    enabled: false, // Future feature
    version: '3.0.0'
  },
  
  locationServices: {
    name: 'Location Services',
    description: 'GPS-based studio discovery and check-ins',
    enabled: true
  }
}

// Advanced features
export const ADVANCED_FEATURES: Record<string, FeatureFlag> = {
  aiRecommendations: {
    name: 'AI Recommendations',
    description: 'AI-powered class recommendations',
    enabled: false, // Future feature
    version: '2.5.0'
  },
  
  videoClasses: {
    name: 'Video Classes',
    description: 'Online video class streaming',
    enabled: false, // Future feature
    version: '2.0.0'
  },
  
  virtualReality: {
    name: 'Virtual Reality Classes',
    description: 'VR fitness class experiences',
    enabled: false, // Future feature
    version: '3.0.0'
  },
  
  wearableIntegration: {
    name: 'Wearable Integration',
    description: 'Integration with fitness wearables',
    enabled: false, // Future feature
    version: '2.0.0'
  },
  
  nutritionTracking: {
    name: 'Nutrition Tracking',
    description: 'Meal and nutrition tracking features',
    enabled: false, // Future feature
    version: '2.5.0'
  },
  
  personalTraining: {
    name: 'Personal Training',
    description: '1-on-1 personal training booking',
    enabled: false, // Future feature
    version: '1.8.0'
  }
}

// Admin and management features
export const ADMIN_FEATURES: Record<string, FeatureFlag> = {
  adminDashboard: {
    name: 'Admin Dashboard',
    description: 'System administration dashboard',
    enabled: true
  },
  
  userManagement: {
    name: 'User Management',
    description: 'Admin user management tools',
    enabled: true
  },
  
  contentModeration: {
    name: 'Content Moderation',
    description: 'Review and moderation tools',
    enabled: false, // Future feature
    version: '1.7.0'
  },
  
  auditLogging: {
    name: 'Audit Logging',
    description: 'Comprehensive audit trail',
    enabled: ENV_CONFIG.isProduction,
    environments: ['production']
  },
  
  dataExport: {
    name: 'Data Export',
    description: 'Export user and business data',
    enabled: true
  }
}

// Accessibility features
export const ACCESSIBILITY_FEATURES: Record<string, FeatureFlag> = {
  screenReaderSupport: {
    name: 'Screen Reader Support',
    description: 'Full screen reader compatibility',
    enabled: true
  },
  
  keyboardNavigation: {
    name: 'Keyboard Navigation',
    description: 'Complete keyboard navigation support',
    enabled: true
  },
  
  highContrastMode: {
    name: 'High Contrast Mode',
    description: 'High contrast theme for visually impaired users',
    enabled: true
  },
  
  textScaling: {
    name: 'Text Scaling',
    description: 'Text size adjustment options',
    enabled: true
  },
  
  colorBlindSupport: {
    name: 'Color Blind Support',
    description: 'Color blind friendly design options',
    enabled: true
  },
  
  motionReduction: {
    name: 'Motion Reduction',
    description: 'Reduced motion options for sensitive users',
    enabled: true
  }
}

// Internationalization features
export const I18N_FEATURES: Record<string, FeatureFlag> = {
  multiLanguage: {
    name: 'Multi-language Support',
    description: 'Support for Spanish and English',
    enabled: false, // Future feature
    version: '1.5.0'
  },
  
  rtlSupport: {
    name: 'RTL Support',
    description: 'Right-to-left language support',
    enabled: false, // Future feature
    version: '2.0.0'
  },
  
  currencyLocalization: {
    name: 'Currency Localization',
    description: 'Support for MXN and USD currencies',
    enabled: false, // Future feature
    version: '1.3.0'
  }
}

// All feature flags combined
export const ALL_FEATURES = {
  ...CORE_FEATURES,
  ...PAYMENT_FEATURES,
  ...SOCIAL_FEATURES,
  ...NOTIFICATION_FEATURES,
  ...ANALYTICS_FEATURES,
  ...PLATFORM_FEATURES,
  ...ADVANCED_FEATURES,
  ...ADMIN_FEATURES,
  ...ACCESSIBILITY_FEATURES,
  ...I18N_FEATURES
}

// Feature flag utility functions
export class FeatureFlags {
  private static rolloutCache = new Map<string, boolean>()

  /**
   * Check if a feature is enabled
   */
  static isEnabled(featureName: string): boolean {
    const feature = ALL_FEATURES[featureName]
    
    if (!feature) {
      console.warn(`Feature flag '${featureName}' not found`)
      return false
    }

    // Check if feature is enabled globally
    if (!feature.enabled) {
      return false
    }

    // Check environment restrictions
    if (feature.environments) {
      const currentEnv = ENV_CONFIG.isDevelopment 
        ? 'development' 
        : ENV_CONFIG.isProduction 
        ? 'production' 
        : 'test'
      
      if (!feature.environments.includes(currentEnv)) {
        return false
      }
    }

    // Check dependencies
    if (feature.dependencies) {
      const allDepsEnabled = feature.dependencies.every(dep => this.isEnabled(dep))
      if (!allDepsEnabled) {
        return false
      }
    }

    // Check rollout percentage
    if (feature.rolloutPercentage !== undefined) {
      return this.checkRollout(featureName, feature.rolloutPercentage)
    }

    return true
  }

  /**
   * Check rollout percentage for gradual feature releases
   */
  private static checkRollout(featureName: string, percentage: number): boolean {
    if (this.rolloutCache.has(featureName)) {
      return this.rolloutCache.get(featureName)!
    }

    // Use a deterministic random based on feature name and user session
    const hash = this.simpleHash(featureName + (typeof window !== 'undefined' ? window.location.hostname : ''))
    const enabled = (hash % 100) < percentage

    this.rolloutCache.set(featureName, enabled)
    return enabled
  }

  /**
   * Simple hash function for rollout determination
   */
  private static simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Get all enabled features
   */
  static getEnabledFeatures(): string[] {
    return Object.keys(ALL_FEATURES).filter(name => this.isEnabled(name))
  }

  /**
   * Get feature details
   */
  static getFeature(featureName: string): FeatureFlag | undefined {
    return ALL_FEATURES[featureName]
  }

  /**
   * Override feature for testing (development only)
   */
  static override(featureName: string, enabled: boolean): void {
    if (!ENV_CONFIG.isDevelopment) {
      console.warn('Feature flag overrides are only allowed in development')
      return
    }

    if (ALL_FEATURES[featureName]) {
      ALL_FEATURES[featureName].enabled = enabled
      console.log(`Feature '${featureName}' overridden to ${enabled}`)
    }
  }

  /**
   * Get features by category
   */
  static getCoreFeatures() { return this.getEnabledFromGroup(CORE_FEATURES) }
  static getPaymentFeatures() { return this.getEnabledFromGroup(PAYMENT_FEATURES) }
  static getSocialFeatures() { return this.getEnabledFromGroup(SOCIAL_FEATURES) }
  static getNotificationFeatures() { return this.getEnabledFromGroup(NOTIFICATION_FEATURES) }
  static getAnalyticsFeatures() { return this.getEnabledFromGroup(ANALYTICS_FEATURES) }
  static getPlatformFeatures() { return this.getEnabledFromGroup(PLATFORM_FEATURES) }
  static getAdvancedFeatures() { return this.getEnabledFromGroup(ADVANCED_FEATURES) }
  static getAdminFeatures() { return this.getEnabledFromGroup(ADMIN_FEATURES) }
  static getAccessibilityFeatures() { return this.getEnabledFromGroup(ACCESSIBILITY_FEATURES) }
  static getI18nFeatures() { return this.getEnabledFromGroup(I18N_FEATURES) }

  private static getEnabledFromGroup(group: Record<string, FeatureFlag>): string[] {
    return Object.keys(group).filter(name => this.isEnabled(name))
  }
}

// Export convenience functions
export const isFeatureEnabled = FeatureFlags.isEnabled.bind(FeatureFlags)
export const getEnabledFeatures = FeatureFlags.getEnabledFeatures.bind(FeatureFlags)

// Development-only feature overrides
if (ENV_CONFIG.isDevelopment && typeof window !== 'undefined') {
  // @ts-ignore - Add to window for debugging
  window.FeatureFlags = FeatureFlags
}