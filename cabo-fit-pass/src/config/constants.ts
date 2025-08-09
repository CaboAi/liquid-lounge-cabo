/**
 * Application constants and configuration values
 */

// App metadata
export const APP_CONFIG = {
  name: 'CaboFitPass',
  description: 'Your fitness journey in Los Cabos - Book classes, track progress, discover studios',
  version: '1.0.0',
  author: 'CaboAi',
  contact: {
    email: 'support@cabofitpass.com',
    phone: '+52 (624) 123-4567',
    website: 'https://cabofitpass.com'
  },
  social: {
    instagram: '@cabofitpass',
    facebook: 'CaboFitPass',
    twitter: '@cabofitpass'
  }
} as const

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000,
  endpoints: {
    auth: {
      signIn: '/auth/signin',
      signUp: '/auth/signup',
      signOut: '/auth/signout',
      refresh: '/auth/refresh',
      resetPassword: '/auth/reset-password',
      verifyEmail: '/auth/verify-email'
    },
    users: {
      profile: '/users/profile',
      preferences: '/users/preferences',
      analytics: '/users/analytics'
    },
    classes: {
      list: '/classes',
      detail: '/classes/:id',
      book: '/classes/:id/book',
      cancel: '/classes/:id/cancel'
    },
    bookings: {
      list: '/bookings',
      detail: '/bookings/:id',
      cancel: '/bookings/:id/cancel',
      reschedule: '/bookings/:id/reschedule',
      checkin: '/bookings/:id/checkin'
    },
    credits: {
      balance: '/credits/balance',
      purchase: '/credits/purchase',
      transactions: '/credits/transactions'
    },
    studios: {
      list: '/studios',
      detail: '/studios/:id',
      classes: '/studios/:id/classes',
      analytics: '/studios/:id/analytics'
    },
    search: {
      classes: '/search/classes',
      studios: '/search/studios',
      suggestions: '/search/suggestions'
    }
  }
} as const

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  realtime: {
    enabled: true,
    reconnectAfterMs: 3000,
    maxReconnectAttempts: 10
  },
  storage: {
    buckets: {
      avatars: 'avatars',
      studios: 'studio-images',
      classes: 'class-images'
    }
  }
} as const

// Stripe configuration (for payments)
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  apiVersion: '2023-10-16' as const,
  currency: 'usd',
  locale: 'en-US'
} as const

// Map configuration
export const MAP_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  defaultCenter: {
    lat: 23.0545,  // Los Cabos coordinates
    lng: -109.7037
  },
  defaultZoom: 12,
  defaultRadius: 25, // km
  maxRadius: 100,
  styles: 'terrain' as const
} as const

// Business rules and limits
export const BUSINESS_RULES = {
  credits: {
    minPurchase: 1,
    maxPurchase: 100,
    defaultExpiration: 90, // days
    refundWindow: 24, // hours before class
    partialRefundWindow: 2, // hours before class
    partialRefundPercentage: 50
  },
  bookings: {
    maxAdvanceBooking: 30, // days
    minAdvanceBooking: 2, // hours
    maxConcurrentBookings: 5,
    waitlistLimit: 10,
    checkinWindow: {
      before: 30, // minutes
      after: 30   // minutes
    },
    cancellationPolicy: {
      fullRefund: 24, // hours before
      partialRefund: 2, // hours before
      partialRefundPercent: 50
    }
  },
  classes: {
    minDuration: 15, // minutes
    maxDuration: 180, // minutes
    minParticipants: 1,
    maxParticipants: 50,
    minCredits: 1,
    maxCredits: 10,
    maxRecurringInstances: 100
  },
  studios: {
    maxImagesPerStudio: 20,
    maxClassesPerDay: 50,
    operatingHours: {
      earliest: '05:00',
      latest: '23:00'
    }
  },
  users: {
    minAge: 13,
    maxProfileImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp']
  }
} as const

// UI configuration
export const UI_CONFIG = {
  theme: {
    defaultMode: 'light' as const,
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        900: '#0c4a6e'
      },
      secondary: {
        50: '#fafafa',
        100: '#f4f4f5',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        900: '#18181b'
      }
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    }
  },
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: {
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  layout: {
    headerHeight: '4rem',
    sidebarWidth: '16rem',
    footerHeight: '8rem',
    maxContentWidth: '1200px'
  }
} as const

// Fitness categories and options
export const FITNESS_CONFIG = {
  categories: [
    'Yoga',
    'Pilates',
    'HIIT',
    'Strength Training',
    'Cardio',
    'CrossFit',
    'Dance',
    'Martial Arts',
    'Swimming',
    'Cycling',
    'Running',
    'Boxing',
    'Barre',
    'Zumba',
    'Meditation',
    'Stretching',
    'Rehabilitation',
    'Water Aerobics',
    'Rock Climbing',
    'Surfing'
  ],
  difficulties: [
    { value: 'beginner', label: 'Beginner', color: '#10b981' },
    { value: 'intermediate', label: 'Intermediate', color: '#f59e0b' },
    { value: 'advanced', label: 'Advanced', color: '#ef4444' }
  ],
  intensities: [
    { value: 'low', label: 'Low', color: '#6b7280' },
    { value: 'moderate', label: 'Moderate', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' },
    { value: 'extreme', label: 'Extreme', color: '#7c2d12' }
  ],
  equipment: [
    'Yoga Mat',
    'Dumbbells',
    'Resistance Bands',
    'Kettlebells',
    'Medicine Ball',
    'Jump Rope',
    'Pull-up Bar',
    'Foam Roller',
    'Stability Ball',
    'TRX Straps',
    'Barbell',
    'Bench',
    'Treadmill',
    'Stationary Bike',
    'Rowing Machine',
    'Boxing Gloves',
    'Water',
    'Towel',
    'None Required'
  ],
  amenities: [
    'Parking',
    'Lockers',
    'Showers',
    'Changing Rooms',
    'Water Fountain',
    'Towel Service',
    'Equipment Rental',
    'Childcare',
    'WiFi',
    'Air Conditioning',
    'Sound System',
    'Mirrors',
    'Accessibility Features',
    'Retail Shop',
    'Cafe',
    'Sauna',
    'Steam Room',
    'Pool',
    'Juice Bar',
    'Massage Services'
  ]
} as const

// Search and filter configuration
export const SEARCH_CONFIG = {
  defaultLimit: 20,
  maxLimit: 100,
  debounceMs: 300,
  minQueryLength: 2,
  maxSuggestions: 10,
  popularSearches: [
    'morning yoga',
    'evening workout',
    'beginner friendly',
    'high intensity',
    'pilates',
    'strength training'
  ],
  sortOptions: [
    { value: 'time', label: 'Time' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'credits', label: 'Credits (Low to High)' },
    { value: 'rating', label: 'Rating' },
    { value: 'distance', label: 'Distance' }
  ],
  timeOfDayOptions: [
    { value: 'morning', label: 'Morning (5AM - 12PM)', hours: [5, 12] },
    { value: 'afternoon', label: 'Afternoon (12PM - 5PM)', hours: [12, 17] },
    { value: 'evening', label: 'Evening (5PM - 11PM)', hours: [17, 23] }
  ]
} as const

// Notification configuration
export const NOTIFICATION_CONFIG = {
  types: {
    booking_confirmation: {
      title: 'Booking Confirmed',
      icon: '✅',
      color: '#10b981'
    },
    class_reminder: {
      title: 'Class Reminder',
      icon: '🔔',
      color: '#3b82f6'
    },
    cancellation: {
      title: 'Class Cancelled',
      icon: '❌',
      color: '#ef4444'
    },
    waitlist_promotion: {
      title: 'Spot Available',
      icon: '🎉',
      color: '#8b5cf6'
    },
    credit_purchase: {
      title: 'Credits Added',
      icon: '💳',
      color: '#10b981'
    },
    credit_expiry: {
      title: 'Credits Expiring',
      icon: '⏰',
      color: '#f59e0b'
    }
  },
  defaultDuration: 5000, // 5 seconds
  maxNotifications: 5,
  position: 'top-right' as const
} as const

// Analytics and tracking
export const ANALYTICS_CONFIG = {
  enabled: process.env.NODE_ENV === 'production',
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  facebookPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
  trackingEvents: {
    user: ['signup', 'signin', 'profile_update'],
    booking: ['class_book', 'class_cancel', 'class_checkin'],
    payment: ['credit_purchase', 'payment_failed'],
    search: ['search_query', 'filter_applied'],
    engagement: ['page_view', 'button_click', 'form_submit']
  }
} as const

// Feature flags
export const FEATURE_FLAGS = {
  enableRealTimeUpdates: true,
  enablePushNotifications: true,
  enableLocationServices: true,
  enableOfflineMode: false,
  enableAnalytics: process.env.NODE_ENV === 'production',
  enableBetaFeatures: process.env.NODE_ENV === 'development',
  enableA11yFeatures: true,
  enableMultiLanguage: false, // Future feature
  enableDarkMode: true,
  enableSocialLogin: true,
  enableApplePayGooglePay: true,
  enableVideoClasses: false, // Future feature
  enablePersonalTrainer: false, // Future feature
  enableNutritionTracking: false, // Future feature
  enableCommunityFeatures: false, // Future feature
} as const

// Cache configuration
export const CACHE_CONFIG = {
  enabled: true,
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // number of entries
  strategies: {
    classes: 2 * 60 * 1000, // 2 minutes
    studios: 10 * 60 * 1000, // 10 minutes
    user: 5 * 60 * 1000, // 5 minutes
    search: 1 * 60 * 1000 // 1 minute
  }
} as const

// Error handling configuration
export const ERROR_CONFIG = {
  enableErrorBoundary: true,
  enableErrorReporting: process.env.NODE_ENV === 'production',
  maxRetries: 3,
  retryDelay: 1000,
  timeoutMs: 30000,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
} as const

// SEO configuration
export const SEO_CONFIG = {
  defaultTitle: 'CaboFitPass - Your Fitness Journey in Los Cabos',
  titleTemplate: '%s | CaboFitPass',
  defaultDescription: 'Discover and book fitness classes across Los Cabos. From yoga to HIIT, find your perfect workout and track your fitness journey.',
  defaultKeywords: [
    'fitness',
    'los cabos',
    'workout',
    'yoga',
    'gym',
    'classes',
    'booking',
    'mexico',
    'cabo'
  ],
  siteUrl: 'https://cabofitpass.com',
  defaultImage: '/images/og-image.jpg',
  twitterHandle: '@cabofitpass',
  locale: 'en_US'
} as const

// Environment-specific configurations
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  enableDevTools: process.env.NODE_ENV === 'development',
  enableMocking: process.env.NEXT_PUBLIC_ENABLE_MOCKING === 'true',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info'
} as const

// Validation constraints
export const VALIDATION_CONFIG = {
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  email: {
    maxLength: 254
  },
  name: {
    minLength: 2,
    maxLength: 50
  },
  phone: {
    minLength: 10,
    maxLength: 15
  },
  message: {
    minLength: 10,
    maxLength: 2000
  }
} as const

// Date and time configuration
export const DATE_CONFIG = {
  defaultTimezone: 'America/Mazatlan', // Los Cabos timezone
  dateFormat: 'MMM dd, yyyy',
  timeFormat: 'h:mm a',
  dateTimeFormat: 'MMM dd, yyyy h:mm a',
  locale: 'en-US',
  firstDayOfWeek: 0, // Sunday
  businessHours: {
    start: 5, // 5 AM
    end: 23   // 11 PM
  }
} as const