/**
 * Form validation schemas using Zod
 */

import { z } from 'zod'

// Base validation schemas
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits')
  .optional()

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

// User authentication schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  dateOfBirth: z.string().optional(),
  emergencyContactName: nameSchema.optional(),
  emergencyContactPhone: phoneSchema.optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
  marketingConsent: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

export const resetPasswordSchema = z.object({
  email: emailSchema
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Profile schemas
export const updateProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  dateOfBirth: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  fitnessGoals: z.array(z.string()).optional(),
  medicalConditions: z.string().max(1000, 'Medical conditions must be less than 1000 characters').optional(),
  emergencyContactName: nameSchema.optional(),
  emergencyContactPhone: phoneSchema.optional(),
  marketingConsent: z.boolean().optional(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
    classReminders: z.boolean().optional(),
    bookingConfirmations: z.boolean().optional(),
    promotions: z.boolean().optional()
  }).optional()
})

// Class booking schemas
export const bookClassSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  acceptWaitlist: z.boolean().default(false),
  agreeToPolicy: z.boolean().refine(val => val === true, {
    message: 'You must agree to the cancellation policy'
  }),
  emergencyContact: z.string().optional(),
  specialRequirements: z.string().max(200, 'Special requirements must be less than 200 characters').optional()
})

export const rescheduleBookingSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  newClassId: z.string().uuid('Invalid class ID'),
  reason: z.string().min(1, 'Please provide a reason for rescheduling').max(200, 'Reason must be less than 200 characters')
})

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  reason: z.string().optional().refine(val => !val || val.length <= 200, {
    message: 'Reason must be less than 200 characters'
  })
})

// Class creation/update schemas
export const createClassSchema = z.object({
  name: z.string().min(3, 'Class name must be at least 3 characters').max(100, 'Class name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  intensity: z.enum(['low', 'moderate', 'high', 'extreme']),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(180, 'Duration must be less than 180 minutes'),
  maxParticipants: z.number().min(1, 'Must allow at least 1 participant').max(100, 'Cannot exceed 100 participants'),
  creditsRequired: z.number().min(1, 'Must require at least 1 credit').max(10, 'Cannot require more than 10 credits'),
  instructorName: z.string().min(1, 'Instructor name is required'),
  startTime: z.string().datetime('Invalid date/time format'),
  location: z.string().min(1, 'Location is required'),
  requirements: z.array(z.string()).optional(),
  equipmentNeeded: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
})

export const updateClassSchema = createClassSchema.partial()

// Studio schemas
export const createStudioSchema = z.object({
  name: z.string().min(3, 'Studio name must be at least 3 characters').max(100, 'Studio name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must be less than 200 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').max(50, 'City must be less than 50 characters'),
  state: z.string().min(2, 'State must be at least 2 characters').max(50, 'State must be less than 50 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
  phone: phoneSchema,
  email: emailSchema,
  website: z.string().url('Please enter a valid website URL').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  amenities: z.array(z.string()).optional(),
  operatingHours: z.record(z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closed: z.boolean().optional()
  })).optional()
})

export const updateStudioSchema = createStudioSchema.partial()

// Credit purchase schema
export const purchaseCreditsSchema = z.object({
  packageId: z.string().min(1, 'Package selection is required'),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  billingAddress: z.object({
    line1: z.string().min(5, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    country: z.string().min(2, 'Country is required').default('US')
  }),
  savePaymentMethod: z.boolean().optional()
})

// Review/rating schema
export const reviewSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(500, 'Review must be less than 500 characters').optional(),
  wouldRecommend: z.boolean().optional(),
  instructorRating: z.number().min(1).max(5).optional(),
  facilityRating: z.number().min(1).max(5).optional()
})

// Search/filter schemas
export const searchClassesSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  intensity: z.enum(['low', 'moderate', 'high', 'extreme']).optional(),
  instructor: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']).optional(),
  minDuration: z.number().min(15).optional(),
  maxDuration: z.number().max(180).optional(),
  minCredits: z.number().min(1).optional(),
  maxCredits: z.number().max(10).optional(),
  availability: z.enum(['available', 'waitlist', 'all']).optional(),
  sortBy: z.enum(['time', 'popularity', 'credits', 'rating', 'distance']).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(1).max(100).optional()
})

// Contact/support schemas
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject must be less than 100 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000, 'Message must be less than 2000 characters'),
  category: z.enum(['general', 'technical', 'billing', 'class', 'studio', 'other']).optional()
})

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'compliment', 'complaint']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
  email: emailSchema.optional()
})

// Custom validation functions
export function validateAge(birthDate: string): boolean {
  const today = new Date()
  const birth = new Date(birthDate)
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 13 // Must be at least 13 years old
  }
  
  return age >= 13
}

export function validateClassTime(startTime: string): boolean {
  const classDate = new Date(startTime)
  const now = new Date()
  
  // Class must be in the future
  if (classDate <= now) {
    return false
  }
  
  // Class must be within reasonable future (1 year)
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  
  if (classDate > oneYearFromNow) {
    return false
  }
  
  return true
}

export function validateCreditCardNumber(cardNumber: string): boolean {
  // Remove spaces and hyphens
  const cleaned = cardNumber.replace(/[\s-]/g, '')
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return false
  }
  
  // Check length (13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false
  }
  
  // Luhn algorithm
  let sum = 0
  let alternate = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i))
    
    if (alternate) {
      digit *= 2
      if (digit > 9) {
        digit = (digit % 10) + 1
      }
    }
    
    sum += digit
    alternate = !alternate
  }
  
  return sum % 10 === 0
}

export function validateExpiryDate(expiryDate: string): boolean {
  // Format: MM/YY or MM/YYYY
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2}|[0-9]{4})$/
  
  if (!regex.test(expiryDate)) {
    return false
  }
  
  const [month, year] = expiryDate.split('/')
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  
  const cardYear = year.length === 2 ? parseInt('20' + year) : parseInt(year)
  const cardMonth = parseInt(month)
  
  // Card must not be expired
  if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
    return false
  }
  
  // Card must not be too far in the future (10 years)
  if (cardYear > currentYear + 10) {
    return false
  }
  
  return true
}

export function validateCVV(cvv: string, cardType?: string): boolean {
  if (!/^\d+$/.test(cvv)) {
    return false
  }
  
  // American Express uses 4 digits, others use 3
  if (cardType === 'amex') {
    return cvv.length === 4
  } else {
    return cvv.length === 3
  }
}

// Type inference helpers
export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type BookClassFormData = z.infer<typeof bookClassSchema>
export type CreateClassFormData = z.infer<typeof createClassSchema>
export type CreateStudioFormData = z.infer<typeof createStudioSchema>
export type PurchaseCreditsFormData = z.infer<typeof purchaseCreditsSchema>
export type ReviewFormData = z.infer<typeof reviewSchema>
export type SearchClassesFormData = z.infer<typeof searchClassesSchema>
export type ContactFormData = z.infer<typeof contactSchema>

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  time24h: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  time12h: /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  creditCard: /^\d{13,19}$/,
  cvv: /^\d{3,4}$/
} as const