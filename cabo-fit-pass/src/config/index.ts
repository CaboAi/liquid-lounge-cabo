/**
 * Configuration barrel file
 * Exports all configuration modules for easy importing
 */

// Core configuration
export * from './constants'
export * from './features'
export * from './environment'

// Re-export commonly used config objects
export {
  APP_CONFIG,
  API_CONFIG,
  SUPABASE_CONFIG,
  BUSINESS_RULES,
  UI_CONFIG,
  FITNESS_CONFIG,
  SEARCH_CONFIG,
  NOTIFICATION_CONFIG,
  ANALYTICS_CONFIG,
  FEATURE_FLAGS,
  CACHE_CONFIG,
  ERROR_CONFIG,
  SEO_CONFIG,
  ENV_CONFIG,
  VALIDATION_CONFIG,
  DATE_CONFIG
} from './constants'

export {
  FeatureFlags,
  isFeatureEnabled,
  getEnabledFeatures,
  ALL_FEATURES,
  CORE_FEATURES,
  PAYMENT_FEATURES,
  SOCIAL_FEATURES,
  NOTIFICATION_FEATURES,
  ANALYTICS_FEATURES,
  PLATFORM_FEATURES,
  ADVANCED_FEATURES,
  ADMIN_FEATURES,
  ACCESSIBILITY_FEATURES,
  I18N_FEATURES
} from './features'

export {
  environmentConfig as env,
  getDatabaseConfig,
  getRedisConfig,
  getEmailConfig,
  requiredInProduction,
  requiredForFeature,
  environmentChecks
} from './environment'

// Configuration utilities
export const config = {
  app: {
    name: 'CaboFitPass',
    version: '1.0.0',
    description: 'Your fitness journey in Los Cabos'
  },
  
  // Quick access to commonly used values
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Feature shortcuts
  features: {
    hasRealTime: isFeatureEnabled('realTimeUpdates'),
    hasPayments: isFeatureEnabled('stripePayments'),
    hasSocial: isFeatureEnabled('socialLogin'),
    hasAnalytics: isFeatureEnabled('googleAnalytics'),
    hasPushNotifications: isFeatureEnabled('pushNotifications'),
    hasLocationServices: isFeatureEnabled('locationServices')
  },
  
  // Common URLs
  urls: {
    api: process.env.NEXT_PUBLIC_API_URL || '/api',
    supabase: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    site: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }
} as const

// Type exports
export type {
  FeatureFlag,
  EnvironmentConfig
} from './features'

// Default exports for convenience
export default config