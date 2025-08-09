/**
 * Component prop types and UI component interfaces
 */

import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, FormHTMLAttributes } from 'react'
import type { FitnessClass, Gym, Booking, Profile, CreditTransaction } from './database.types'

// Base component props
export interface BaseComponentProps {
  children?: ReactNode
  className?: string
  id?: string
  'data-testid'?: string
}

// Layout component props
export interface LayoutProps extends BaseComponentProps {
  title?: string
  description?: string
  showNavigation?: boolean
  showFooter?: boolean
  requireAuth?: boolean
  allowedRoles?: ('user' | 'studio_owner' | 'admin')[]
}

export interface HeaderProps extends BaseComponentProps {
  transparent?: boolean
  fixed?: boolean
  showSearch?: boolean
  showNotifications?: boolean
}

export interface SidebarProps extends BaseComponentProps {
  open?: boolean
  onClose?: () => void
  position?: 'left' | 'right'
  overlay?: boolean
}

export interface NavigationProps extends BaseComponentProps {
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'tabs' | 'pills'
}

export interface NavigationItem {
  label: string
  href?: string
  icon?: string
  active?: boolean
  disabled?: boolean
  badge?: string | number
  children?: NavigationItem[]
}

// Form component props
export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'children'>, BaseComponentProps {
  onSubmit: (data: any) => Promise<void> | void
  loading?: boolean
  error?: string | null
  resetOnSubmit?: boolean
  validateOnChange?: boolean
  children: ReactNode
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseComponentProps {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: string
  rightIcon?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  fullWidth?: boolean
}

export interface SelectProps extends BaseComponentProps {
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  options: SelectOption[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

export interface TextareaProps extends BaseComponentProps {
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  rows?: number
  maxLength?: number
  resize?: boolean
  fullWidth?: boolean
}

export interface CheckboxProps extends BaseComponentProps {
  label?: string
  checked?: boolean
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

export interface RadioProps extends BaseComponentProps {
  label?: string
  checked?: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  name: string
  value: string
  size?: 'sm' | 'md' | 'lg'
}

export interface SwitchProps extends BaseComponentProps {
  label?: string
  checked?: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// Button component props
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>, BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  loadingText?: string
  leftIcon?: string
  rightIcon?: string
  fullWidth?: boolean
  rounded?: boolean
}

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>, BaseComponentProps {
  icon: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  rounded?: boolean
  tooltip?: string
}

// Card component props
export interface CardProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  image?: string
  imageAlt?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
}

export interface CardHeaderProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  divider?: boolean
}

export interface CardBodyProps extends BaseComponentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export interface CardFooterProps extends BaseComponentProps {
  align?: 'left' | 'center' | 'right' | 'between'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  divider?: boolean
}

// Modal and dialog props
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscapeKey?: boolean
  showCloseButton?: boolean
  preventScroll?: boolean
}

export interface DialogProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  loading?: boolean
}

// Table component props
export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  sortable?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  pagination?: TablePagination
  onPaginationChange?: (pagination: TablePagination) => void
}

export interface TableColumn<T = any> {
  key: keyof T
  header: string
  width?: string | number
  sortable?: boolean
  render?: (value: any, row: T, index: number) => ReactNode
  align?: 'left' | 'center' | 'right'
}

export interface TablePagination {
  page: number
  pageSize: number
  total: number
}

// Data display components
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  rounded?: boolean
  dot?: boolean
}

export interface AvatarProps extends BaseComponentProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  rounded?: boolean
  fallback?: string
  online?: boolean
}

export interface TagProps extends BaseComponentProps {
  label: string
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
  onClose?: () => void
}

// Feedback components
export interface AlertProps extends BaseComponentProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message?: string
  closable?: boolean
  onClose?: () => void
  icon?: boolean
  variant?: 'filled' | 'outlined' | 'light'
}

export interface ToastProps extends BaseComponentProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message?: string
  duration?: number
  closable?: boolean
  onClose?: () => void
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
}

export interface ProgressProps extends BaseComponentProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  striped?: boolean
  animated?: boolean
}

export interface SpinnerProps extends BaseComponentProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  text?: string
}

export interface SkeletonProps extends BaseComponentProps {
  width?: string | number
  height?: string | number
  rounded?: boolean
  animation?: 'pulse' | 'wave' | 'none'
  variant?: 'text' | 'circular' | 'rectangular'
}

// Business-specific component props
export interface ClassCardProps extends BaseComponentProps {
  class: FitnessClass & {
    gym?: Gym
    spotsLeft: number
    userBooking?: Booking
  }
  showStudio?: boolean
  showBookButton?: boolean
  onBook?: () => void
  onCancel?: () => void
  loading?: boolean
}

export interface StudioCardProps extends BaseComponentProps {
  studio: Gym & {
    distance?: number
    upcomingClasses: number
    averageRating: number
  }
  showDistance?: boolean
  showClasses?: boolean
  onClick?: () => void
}

export interface BookingCardProps extends BaseComponentProps {
  booking: Booking & {
    fitness_class?: FitnessClass & {
      gym?: Gym
    }
    canCancel: boolean
    canReschedule: boolean
    canCheckIn: boolean
  }
  onCancel?: () => void
  onReschedule?: () => void
  onCheckIn?: () => void
  loading?: boolean
}

export interface CreditBalanceProps extends BaseComponentProps {
  balance: number
  pendingCredits?: number
  showDetails?: boolean
  onPurchase?: () => void
}

export interface CalendarProps extends BaseComponentProps {
  value?: Date
  onChange?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  highlightedDates?: Date[]
  showWeekNumbers?: boolean
  firstDayOfWeek?: 0 | 1 // 0 = Sunday, 1 = Monday
  locale?: string
}

export interface ScheduleProps extends BaseComponentProps {
  classes: FitnessClass[]
  selectedDate?: Date
  onDateChange?: (date: Date) => void
  onClassClick?: (classItem: FitnessClass) => void
  view?: 'day' | 'week' | 'month'
  timeSlotHeight?: number
  showWeekends?: boolean
}

export interface FilterPanelProps extends BaseComponentProps {
  filters: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
  options: {
    categories: string[]
    difficulties: string[]
    instructors: string[]
    locations: string[]
  }
  loading?: boolean
  onReset?: () => void
}

export interface SearchBarProps extends BaseComponentProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
  loading?: boolean
  debounceMs?: number
  showFilters?: boolean
  onFiltersClick?: () => void
}

export interface MapProps extends BaseComponentProps {
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{
    id: string
    position: { lat: number; lng: number }
    title?: string
    description?: string
    onClick?: () => void
  }>
  onMarkerClick?: (markerId: string) => void
  onMapClick?: (position: { lat: number; lng: number }) => void
  showUserLocation?: boolean
  height?: string | number
}

// Analytics component props
export interface ChartProps extends BaseComponentProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
  data: any[]
  xKey?: string
  yKey?: string
  color?: string
  colors?: string[]
  title?: string
  height?: number
  loading?: boolean
  error?: string
}

export interface MetricCardProps extends BaseComponentProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon?: string
  color?: string
  loading?: boolean
}

export interface StatsGridProps extends BaseComponentProps {
  stats: Array<{
    title: string
    value: string | number
    change?: {
      value: number
      type: 'increase' | 'decrease'
      period: string
    }
    icon?: string
    color?: string
  }>
  columns?: 1 | 2 | 3 | 4
  loading?: boolean
}

// Rating and review components
export interface RatingProps extends BaseComponentProps {
  value: number
  max?: number
  readonly?: boolean
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  precision?: number
}

export interface ReviewListProps extends BaseComponentProps {
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    author: string
    date: string
    helpful?: number
  }>
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

// Image and media components
export interface ImageProps extends BaseComponentProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  placeholder?: string
  fallback?: string
  onLoad?: () => void
  onError?: () => void
}

export interface GalleryProps extends BaseComponentProps {
  images: Array<{
    id: string
    src: string
    alt: string
    title?: string
    description?: string
  }>
  columns?: number
  spacing?: number
  onClick?: (imageId: string, index: number) => void
}

// Utility component props
export interface InfiniteScrollProps extends BaseComponentProps {
  hasMore: boolean
  loading?: boolean
  onLoadMore: () => void
  threshold?: number
  loader?: ReactNode
  endMessage?: ReactNode
}

export interface VirtualizedListProps<T = any> extends BaseComponentProps {
  items: T[]
  itemHeight: number
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
  onScroll?: (scrollTop: number) => void
}

export interface DropzoneProps extends BaseComponentProps {
  onDrop: (files: File[]) => void
  accept?: string[]
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  loading?: boolean
  children?: ReactNode
}

// Responsive and accessibility props
export interface ResponsiveProps {
  xs?: any
  sm?: any
  md?: any
  lg?: any
  xl?: any
  '2xl'?: any
}

export interface AccessibilityProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  role?: string
  tabIndex?: number
}

// Animation props
export interface AnimationProps {
  animate?: boolean
  duration?: number
  delay?: number
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  iterations?: number | 'infinite'
}

// Theme props
export interface ThemeProps {
  theme?: 'light' | 'dark' | 'auto'
  colorScheme?: string
  primaryColor?: string
  secondaryColor?: string
}

// Component state types
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
export type ComponentState = 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading'