/**
 * Environment configuration and validation
 * Handles environment variables with type safety and validation
 */

import { z } from 'zod'

// Environment variable schema
const envSchema = z.object({
  // Node.js environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Next.js configuration
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  
  // Database configuration (if using direct connection)
  DATABASE_URL: z.string().url().optional(),
  DATABASE_DIRECT_URL: z.string().url().optional(),
  
  // Payment configuration
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  
  // External APIs
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),
  GOOGLE_PLACES_API_KEY: z.string().min(1).optional(),
  
  // Analytics and tracking
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  NEXT_PUBLIC_FB_PIXEL_ID: z.string().optional(),
  
  // Email service
  SENDGRID_API_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // SMS service
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // Push notifications
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  
  // File storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  
  // CDN
  NEXT_PUBLIC_CDN_URL: z.string().url().optional(),
  
  // Monitoring and logging
  SENTRY_DSN: z.string().url().optional(),
  LOGTAIL_TOKEN: z.string().optional(),
  
  // Feature flags and A/B testing
  LAUNCHDARKLY_SDK_KEY: z.string().optional(),
  OPTIMIZELY_SDK_KEY: z.string().optional(),
  
  // Rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Development and testing
  NEXT_PUBLIC_ENABLE_MOCKING: z.string().optional().default('false'),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SKIP_ENV_VALIDATION: z.string().optional().default('false'),
  
  // API URLs
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  
  // Authentication providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
  
  // Webhook endpoints
  STRIPE_WEBHOOK_URL: z.string().url().optional(),
  SUPABASE_WEBHOOK_URL: z.string().url().optional()
})

// Validate environment variables
function validateEnv() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    parsed.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    })
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

// Skip validation if explicitly requested (useful for build processes)
const env = process.env.SKIP_ENV_VALIDATION === 'true' 
  ? (process.env as any)
  : validateEnv()

// Typed environment configuration
export const environmentConfig = {
  // Application
  NODE_ENV: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // URLs
  siteUrl: env.NEXTAUTH_URL || 'http://localhost:3000',
  apiUrl: env.NEXT_PUBLIC_API_URL || '/api',
  cdnUrl: env.NEXT_PUBLIC_CDN_URL,
  
  // Authentication
  auth: {
    secret: env.NEXTAUTH_SECRET,
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    },
    facebook: {
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET
    },
    apple: {
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: env.APPLE_CLIENT_SECRET
    }
  },
  
  // Database
  database: {
    url: env.DATABASE_URL,
    directUrl: env.DATABASE_DIRECT_URL,
    supabase: {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
    }
  },
  
  // Payments
  stripe: {
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    webhookUrl: env.STRIPE_WEBHOOK_URL
  },
  
  // External APIs
  maps: {
    googleMapsKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    placesKey: env.GOOGLE_PLACES_API_KEY
  },
  
  // Analytics
  analytics: {
    googleAnalyticsId: env.NEXT_PUBLIC_GA_ID,
    googleTagManagerId: env.NEXT_PUBLIC_GTM_ID,
    facebookPixelId: env.NEXT_PUBLIC_FB_PIXEL_ID
  },
  
  // Communication
  email: {
    sendgrid: {
      apiKey: env.SENDGRID_API_KEY
    },
    resend: {
      apiKey: env.RESEND_API_KEY
    },
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ? parseInt(env.SMTP_PORT) : undefined,
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD
    }
  },
  
  sms: {
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      phoneNumber: env.TWILIO_PHONE_NUMBER
    }
  },
  
  push: {
    vapid: {
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY
    }
  },
  
  // Storage
  storage: {
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      bucket: env.AWS_S3_BUCKET,
      region: env.AWS_REGION
    }
  },
  
  // Monitoring
  monitoring: {
    sentry: {
      dsn: env.SENTRY_DSN
    },
    logtail: {
      token: env.LOGTAIL_TOKEN
    }
  },
  
  // Feature flags
  featureFlags: {
    launchDarkly: {
      sdkKey: env.LAUNCHDARKLY_SDK_KEY
    },
    optimizely: {
      sdkKey: env.OPTIMIZELY_SDK_KEY
    }
  },
  
  // Rate limiting
  redis: {
    upstash: {
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN
    }
  },
  
  // Development
  development: {
    enableMocking: env.NEXT_PUBLIC_ENABLE_MOCKING === 'true',
    logLevel: env.NEXT_PUBLIC_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error'
  }
} as const

// Environment-specific configurations
export const getDatabaseConfig = () => {
  if (environmentConfig.isTest) {
    return {
      url: process.env.TEST_DATABASE_URL || environmentConfig.database.url,
      // Use in-memory database for tests if available
      inMemory: process.env.TEST_IN_MEMORY_DB === 'true'
    }
  }

  return {
    url: environmentConfig.database.url,
    directUrl: environmentConfig.database.directUrl
  }
}

export const getRedisConfig = () => {
  if (environmentConfig.isTest) {
    return {
      url: process.env.TEST_REDIS_URL || 'redis://localhost:6379',
      // Use mock Redis for tests
      mock: process.env.TEST_MOCK_REDIS === 'true'
    }
  }

  return {
    url: environmentConfig.redis.upstash.url,
    token: environmentConfig.redis.upstash.token
  }
}

export const getEmailConfig = () => {
  // Prefer Resend in production, SendGrid as fallback
  if (environmentConfig.email.resend.apiKey) {
    return {
      provider: 'resend' as const,
      apiKey: environmentConfig.email.resend.apiKey
    }
  }

  if (environmentConfig.email.sendgrid.apiKey) {
    return {
      provider: 'sendgrid' as const,
      apiKey: environmentConfig.email.sendgrid.apiKey
    }
  }

  if (environmentConfig.email.smtp.host) {
    return {
      provider: 'smtp' as const,
      config: environmentConfig.email.smtp
    }
  }

  // Use console logging in development
  if (environmentConfig.isDevelopment) {
    return {
      provider: 'console' as const
    }
  }

  throw new Error('No email configuration found')
}

// Validation helpers
export const requiredInProduction = (value: string | undefined, name: string): string => {
  if (environmentConfig.isProduction && !value) {
    throw new Error(`${name} is required in production`)
  }
  return value || ''
}

export const requiredForFeature = (
  value: string | undefined, 
  featureName: string,
  envVarName: string
): string => {
  if (!value) {
    console.warn(`${envVarName} not set - ${featureName} will be disabled`)
    return ''
  }
  return value
}

// Environment checks
export const environmentChecks = {
  hasDatabase: () => Boolean(environmentConfig.database.supabase.url),
  hasStripe: () => Boolean(environmentConfig.stripe.publishableKey),
  hasGoogleMaps: () => Boolean(environmentConfig.maps.googleMapsKey),
  hasEmail: () => {
    try {
      getEmailConfig()
      return true
    } catch {
      return false
    }
  },
  hasSMS: () => Boolean(environmentConfig.sms.twilio.accountSid),
  hasAnalytics: () => Boolean(environmentConfig.analytics.googleAnalyticsId),
  hasMonitoring: () => Boolean(environmentConfig.monitoring.sentry.dsn),
  hasRedis: () => Boolean(environmentConfig.redis.upstash.url)
}

// Export the validated environment
export const env = environmentConfig

// Type for environment config (useful for dependency injection)
export type EnvironmentConfig = typeof environmentConfig

// Development helpers
if (environmentConfig.isDevelopment && typeof window !== 'undefined') {
  // @ts-ignore - Add to window for debugging
  window.__env__ = environmentConfig
  // @ts-ignore
  window.__envChecks__ = environmentChecks
}