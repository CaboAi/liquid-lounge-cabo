/**
 * Date and time formatting utilities for fitness class schedules
 */

export const TIME_FORMATS = {
  SHORT_TIME: 'h:mm a', // 2:30 PM
  LONG_TIME: 'h:mm:ss a', // 2:30:45 PM
  SHORT_DATE: 'MMM dd', // Jan 15
  LONG_DATE: 'MMMM dd, yyyy', // January 15, 2024
  DATE_TIME: 'MMM dd, h:mm a', // Jan 15, 2:30 PM
  ISO_DATE: 'yyyy-MM-dd', // 2024-01-15
  WEEKDAY: 'EEEE', // Monday
  SHORT_WEEKDAY: 'EEE', // Mon
} as const

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, format: string = TIME_FORMATS.LONG_DATE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!isValidDate(dateObj)) {
    return 'Invalid Date'
  }

  try {
    // Simple format implementations
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth()
    const day = dateObj.getDate()
    const hours = dateObj.getHours()
    const minutes = dateObj.getMinutes()
    const seconds = dateObj.getSeconds()
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    const shortMonthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    const weekdayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ]
    
    const shortWeekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    switch (format) {
      case TIME_FORMATS.SHORT_TIME:
        return formatTime(dateObj, false)
      case TIME_FORMATS.LONG_TIME:
        return formatTime(dateObj, true)
      case TIME_FORMATS.SHORT_DATE:
        return `${shortMonthNames[month]} ${day}`
      case TIME_FORMATS.LONG_DATE:
        return `${monthNames[month]} ${day}, ${year}`
      case TIME_FORMATS.DATE_TIME:
        return `${shortMonthNames[month]} ${day}, ${formatTime(dateObj, false)}`
      case TIME_FORMATS.ISO_DATE:
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      case TIME_FORMATS.WEEKDAY:
        return weekdayNames[dateObj.getDay()]
      case TIME_FORMATS.SHORT_WEEKDAY:
        return shortWeekdayNames[dateObj.getDay()]
      default:
        return dateObj.toLocaleDateString()
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Format time to readable string
 */
export function formatTime(date: Date | string, includeSeconds: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!isValidDate(dateObj)) {
    return 'Invalid Time'
  }

  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()
  const seconds = dateObj.getSeconds()
  
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  
  const timeString = `${displayHours}:${String(minutes).padStart(2, '0')}`
  
  if (includeSeconds) {
    return `${timeString}:${String(seconds).padStart(2, '0')} ${period}`
  }
  
  return `${timeString} ${period}`
}

/**
 * Format class duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}min`
}

/**
 * Get relative time string (e.g., "in 2 hours", "2 days ago")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = dateObj.getTime() - now.getTime()
  const absDiff = Math.abs(diff)
  
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365
  
  const isFuture = diff > 0
  const prefix = isFuture ? 'in ' : ''
  const suffix = isFuture ? '' : ' ago'
  
  if (absDiff < minute) {
    return 'just now'
  } else if (absDiff < hour) {
    const minutes = Math.floor(absDiff / minute)
    return `${prefix}${minutes} minute${minutes !== 1 ? 's' : ''}${suffix}`
  } else if (absDiff < day) {
    const hours = Math.floor(absDiff / hour)
    return `${prefix}${hours} hour${hours !== 1 ? 's' : ''}${suffix}`
  } else if (absDiff < week) {
    const days = Math.floor(absDiff / day)
    return `${prefix}${days} day${days !== 1 ? 's' : ''}${suffix}`
  } else if (absDiff < month) {
    const weeks = Math.floor(absDiff / week)
    return `${prefix}${weeks} week${weeks !== 1 ? 's' : ''}${suffix}`
  } else if (absDiff < year) {
    const months = Math.floor(absDiff / month)
    return `${prefix}${months} month${months !== 1 ? 's' : ''}${suffix}`
  } else {
    const years = Math.floor(absDiff / year)
    return `${prefix}${years} year${years !== 1 ? 's' : ''}${suffix}`
  }
}

/**
 * Get time until class starts
 */
export function getTimeUntilClass(classTime: Date | string): {
  timeString: string
  isStartingSoon: boolean
  hasStarted: boolean
  canCheckIn: boolean
} {
  const classDate = typeof classTime === 'string' ? new Date(classTime) : classTime
  const now = new Date()
  const diff = classDate.getTime() - now.getTime()
  
  const hasStarted = diff < 0
  const isStartingSoon = diff > 0 && diff < 30 * 60 * 1000 // 30 minutes
  const canCheckIn = diff > -30 * 60 * 1000 && diff < 30 * 60 * 1000 // 30 min before to 30 min after
  
  let timeString: string
  
  if (hasStarted) {
    if (diff > -2 * 60 * 60 * 1000) { // Less than 2 hours ago
      timeString = `Started ${getRelativeTime(classDate)}`
    } else {
      timeString = 'Class ended'
    }
  } else {
    timeString = getRelativeTime(classDate)
  }
  
  return {
    timeString,
    isStartingSoon,
    hasStarted,
    canCheckIn
  }
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Get start of day
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

/**
 * Get end of day
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const newDate = new Date(date)
  newDate.setHours(23, 59, 59, 999)
  return newDate
}

/**
 * Get start of week (Sunday)
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const newDate = new Date(date)
  const day = newDate.getDay()
  newDate.setDate(newDate.getDate() - day)
  return getStartOfDay(newDate)
}

/**
 * Get end of week (Saturday)
 */
export function getEndOfWeek(date: Date = new Date()): Date {
  const newDate = new Date(date)
  const day = newDate.getDay()
  newDate.setDate(newDate.getDate() + (6 - day))
  return getEndOfDay(newDate)
}

/**
 * Get dates for the current week
 */
export function getWeekDates(startDate: Date = new Date()): Date[] {
  const weekStart = getStartOfWeek(startDate)
  const dates: Date[] = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    dates.push(date)
  }
  
  return dates
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date())
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date | string): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return isSameDay(date, tomorrow)
}

/**
 * Get day of week as number (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.getDay()
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

/**
 * Add hours to a date
 */
export function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date)
  newDate.setHours(newDate.getHours() + hours)
  return newDate
}

/**
 * Format class schedule display
 */
export function formatClassSchedule(startTime: Date | string, duration: number): string {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime
  const end = new Date(start.getTime() + duration * 60 * 1000)
  
  const startTimeStr = formatTime(start)
  const endTimeStr = formatTime(end)
  
  if (isToday(start)) {
    return `Today, ${startTimeStr} - ${endTimeStr}`
  } else if (isTomorrow(start)) {
    return `Tomorrow, ${startTimeStr} - ${endTimeStr}`
  } else {
    return `${formatDate(start, TIME_FORMATS.SHORT_DATE)}, ${startTimeStr} - ${endTimeStr}`
  }
}

/**
 * Parse time string to 24-hour format
 */
export function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  const timeRegex = /^(\d{1,2}):(\d{2})(?:\s?(AM|PM))?$/i
  const match = timeStr.trim().match(timeRegex)
  
  if (!match) return null
  
  let hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const period = match[3]?.toUpperCase()
  
  if (period === 'PM' && hours !== 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null
  }
  
  return { hours, minutes }
}

/**
 * Create date from date and time strings
 */
export function createDateTime(dateStr: string, timeStr: string): Date | null {
  const date = new Date(dateStr)
  const time = parseTimeString(timeStr)
  
  if (!isValidDate(date) || !time) {
    return null
  }
  
  date.setHours(time.hours, time.minutes, 0, 0)
  return date
}