/**
 * Form validation and state management types
 */

import type { z } from 'zod'
import type { 
  SignUpFormData,
  SignInFormData,
  UpdateProfileFormData,
  BookClassFormData,
  CreateClassFormData,
  CreateStudioFormData,
  PurchaseCreditsFormData,
  ReviewFormData,
  SearchClassesFormData,
  ContactFormData
} from '@/lib/utils/validation'

// Generic form types
export interface FormFieldConfig<T = any> {
  name: keyof T
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime-local' | 'time' | 'file'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  validation?: z.ZodSchema
  options?: FormSelectOption[]
  multiple?: boolean
  rows?: number // for textarea
  accept?: string // for file input
  min?: number | string
  max?: number | string
  step?: number | string
  pattern?: string
  autoComplete?: string
  helperText?: string
  dependsOn?: keyof T
  conditional?: (values: T) => boolean
}

export interface FormSelectOption {
  value: string | number | boolean
  label: string
  disabled?: boolean
  group?: string
}

export interface FormState<T = any> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValidating: boolean
  isDirty: boolean
  isValid: boolean
  submitCount: number
}

export interface FormActions<T = any> {
  setValue: (name: keyof T, value: any) => void
  setValues: (values: Partial<T>) => void
  setError: (name: keyof T, error: string) => void
  setErrors: (errors: Partial<Record<keyof T, string>>) => void
  clearError: (name: keyof T) => void
  clearErrors: () => void
  setTouched: (name: keyof T, touched?: boolean) => void
  setFieldTouched: (name: keyof T, touched?: boolean) => void
  reset: (values?: T) => void
  validate: (name?: keyof T) => Promise<boolean>
  submit: () => Promise<void>
}

export interface FormProps<T = any> {
  initialValues: T
  validationSchema?: z.ZodSchema<T>
  onSubmit: (values: T) => Promise<void> | void
  onValidate?: (values: T) => Promise<Partial<Record<keyof T, string>>> | Partial<Record<keyof T, string>>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  resetOnSubmit?: boolean
  enableReinitialize?: boolean
}

// Specific form data types
export type AuthFormData = SignUpFormData | SignInFormData

export interface SignUpFormState extends FormState<SignUpFormData> {
  passwordStrength: {
    score: number
    feedback: string[]
  }
  emailExists: boolean
  checkingEmail: boolean
}

export interface SignInFormState extends FormState<SignInFormData> {
  showPassword: boolean
  lastAttempt: Date | null
  attemptCount: number
}

export interface ProfileFormState extends FormState<UpdateProfileFormData> {
  profileImage: File | null
  uploadingImage: boolean
  imagePreview: string | null
}

export interface BookingFormState extends FormState<BookClassFormData> {
  classDetails: {
    name: string
    instructor: string
    credits: number
    startTime: string
    spotsLeft: number
  } | null
  emergencyContactRequired: boolean
  waiverSigned: boolean
}

export interface ClassFormState extends FormState<CreateClassFormData> {
  recurring: boolean
  recurringPattern: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    daysOfWeek?: number[]
    endDate?: string
  }
  conflictCheck: {
    checking: boolean
    conflicts: Array<{
      time: string
      instructor: string
      reason: string
    }>
  }
}

export interface StudioFormState extends FormState<CreateStudioFormData> {
  images: File[]
  uploadingImages: boolean
  imageUploads: Array<{
    file: File
    progress: number
    url?: string
    error?: string
  }>
  locationSearch: {
    searching: boolean
    suggestions: Array<{
      address: string
      lat: number
      lng: number
    }>
  }
  amenityOptions: string[]
}

export interface PaymentFormState extends FormState<PurchaseCreditsFormData> {
  selectedPackage: {
    id: string
    name: string
    credits: number
    price: number
    savings?: number
  } | null
  paymentMethod: {
    type: 'card' | 'paypal' | 'apple_pay' | 'google_pay'
    last4?: string
    brand?: string
  } | null
  processing: boolean
  clientSecret: string | null
}

export interface SearchFormState extends FormState<SearchClassesFormData> {
  suggestions: string[]
  loadingSuggestions: boolean
  userLocation: {
    lat: number
    lng: number
  } | null
  gettingLocation: boolean
  recentSearches: string[]
  popularSearches: string[]
}

export interface ReviewFormState extends FormState<ReviewFormData> {
  classDetails: {
    name: string
    instructor: string
    date: string
    studio: string
  } | null
  imageUploads: File[]
  uploadingImages: boolean
}

export interface ContactFormState extends FormState<ContactFormData> {
  attachments: File[]
  uploadingAttachments: boolean
  urgency: 'low' | 'medium' | 'high'
}

// Form validation types
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface FieldValidationResult {
  isValid: boolean
  error?: string
}

export interface ValidationRule<T = any> {
  required?: boolean | ((values: T) => boolean)
  min?: number | ((values: T) => number)
  max?: number | ((values: T) => number)
  pattern?: RegExp | ((values: T) => RegExp)
  custom?: (value: any, values: T) => string | null
  async?: (value: any, values: T) => Promise<string | null>
}

// Form submission types
export interface SubmissionResult {
  success: boolean
  data?: any
  errors?: Record<string, string>
  message?: string
  redirect?: string
}

export interface SubmissionOptions {
  validateBeforeSubmit?: boolean
  resetAfterSubmit?: boolean
  showSuccessMessage?: boolean
  successMessage?: string
  redirectOnSuccess?: string
}

// Multi-step form types
export interface MultiStepFormConfig<T = any> {
  steps: Array<{
    id: string
    title: string
    description?: string
    fields: Array<keyof T>
    validation?: z.ZodSchema
    optional?: boolean
  }>
  allowStepSkipping?: boolean
  saveProgress?: boolean
  progressKey?: string
}

export interface MultiStepFormState<T = any> extends FormState<T> {
  currentStep: number
  completedSteps: Set<number>
  stepErrors: Record<number, Record<string, string>>
  progress: number
  canGoNext: boolean
  canGoPrevious: boolean
}

export interface MultiStepFormActions<T = any> extends FormActions<T> {
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: number) => void
  validateStep: (step?: number) => Promise<boolean>
  isStepValid: (step: number) => boolean
  getStepProgress: () => number
}

// Form wizard types
export interface WizardStep {
  id: string
  title: string
  description?: string
  icon?: string
  optional?: boolean
  completed?: boolean
  error?: boolean
}

export interface WizardConfig {
  steps: WizardStep[]
  linear?: boolean
  showProgress?: boolean
  showStepNumbers?: boolean
  allowStepClick?: boolean
}

// Dynamic form types
export interface DynamicFormField {
  id: string
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'file'
  name: string
  label: string
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  validation?: Record<string, any>
  conditional?: {
    field: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    value: any
  }
  order: number
  width?: 'full' | 'half' | 'third' | 'quarter'
}

export interface DynamicFormConfig {
  id: string
  title: string
  description?: string
  fields: DynamicFormField[]
  submitUrl: string
  submitMethod: 'POST' | 'PUT' | 'PATCH'
  successMessage?: string
  redirectUrl?: string
}

// Form storage types
export interface FormStorage {
  save: (key: string, data: any) => void
  load: <T>(key: string) => T | null
  remove: (key: string) => void
  clear: () => void
}

export interface AutoSaveConfig {
  enabled: boolean
  interval?: number // milliseconds
  key: string
  fields?: string[]
  trigger?: 'change' | 'blur' | 'timer'
}

// Form analytics types
export interface FormAnalytics {
  formId: string
  startTime: Date
  endTime?: Date
  fieldInteractions: Record<string, {
    focused: boolean
    changed: boolean
    timeSpent: number
    errorCount: number
  }>
  submissionAttempts: number
  abandonmentPoint?: string
  completionTime?: number
  errors: Array<{
    field: string
    error: string
    timestamp: Date
  }>
}

// Conditional field types
export interface ConditionalField<T = any> {
  field: keyof T
  condition: (values: T) => boolean
  action: 'show' | 'hide' | 'require' | 'disable'
}

export interface ConditionalLogic<T = any> {
  rules: ConditionalField<T>[]
  operator: 'and' | 'or'
}

// Form theming types
export interface FormTheme {
  colors: {
    primary: string
    secondary: string
    error: string
    warning: string
    success: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
    }
    fontWeight: {
      normal: string
      medium: string
      semibold: string
      bold: string
    }
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
}

// File upload form types
export interface FileUploadConfig {
  maxFiles?: number
  maxSize?: number // bytes
  acceptedTypes?: string[]
  uploadUrl?: string
  multiple?: boolean
  preview?: boolean
  cropEnabled?: boolean
  resizeEnabled?: boolean
  compressionEnabled?: boolean
}

export interface FileUploadState {
  files: Array<{
    id: string
    file: File
    progress: number
    status: 'pending' | 'uploading' | 'completed' | 'error'
    url?: string
    error?: string
    preview?: string
  }>
  isDragOver: boolean
  totalProgress: number
  uploading: boolean
}

// Address form types
export interface AddressFormData {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  apartment?: string
  instructions?: string
}

export interface AddressAutocompleteConfig {
  enabled: boolean
  apiKey: string
  countries?: string[]
  types?: string[]
  language?: string
}

// Payment form types
export interface PaymentFormConfig {
  providers: Array<'stripe' | 'paypal' | 'apple_pay' | 'google_pay'>
  collectBillingAddress: boolean
  savePaymentMethod: boolean
  currency: string
  locale: string
}

export interface CreditCardFormData {
  number: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  name: string
}

// Form accessibility types
export interface FormAccessibilityConfig {
  announceErrors: boolean
  announceSuccess: boolean
  describedBy: boolean
  labelAssociation: boolean
  keyboardNavigation: boolean
  focusManagement: boolean
  colorContrast: boolean
  screenReaderSupport: boolean
}

// Form internationalization types
export interface FormI18nConfig {
  locale: string
  messages: Record<string, string>
  dateFormat: string
  numberFormat: Intl.NumberFormatOptions
  currencyFormat: Intl.NumberFormatOptions
  rtl: boolean
}

export type FormFieldType = 
  | 'text'
  | 'email' 
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'file'
  | 'image'
  | 'range'
  | 'color'
  | 'rating'
  | 'address'
  | 'creditcard'
  | 'phone'
  | 'tags'