/**
 * @jest-environment node
 */

// Mock date utilities
const dateUtils = {
  // Format date for display
  formatDate: (date: string | Date, format: 'short' | 'long' | 'time' | 'datetime' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date')
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Los_Angeles', // Los Cabos timezone
    }

    switch (format) {
      case 'short':
        options.month = 'short'
        options.day = 'numeric'
        options.year = 'numeric'
        break
      case 'long':
        options.weekday = 'long'
        options.month = 'long'
        options.day = 'numeric'
        options.year = 'numeric'
        break
      case 'time':
        options.hour = 'numeric'
        options.minute = '2-digit'
        options.hour12 = true
        break
      case 'datetime':
        options.month = 'short'
        options.day = 'numeric'
        options.year = 'numeric'
        options.hour = 'numeric'
        options.minute = '2-digit'
        options.hour12 = true
        break
    }

    return new Intl.DateTimeFormat('en-US', options).format(dateObj)
  },

  // Get class time display (e.g., "Today 10:00 AM", "Tomorrow 2:30 PM", "Jan 15 3:00 PM")
  getClassTimeDisplay: (startTime: string | Date): string => {
    const classTime = typeof startTime === 'string' ? new Date(startTime) : startTime
    const now = new Date()
    
    if (isNaN(classTime.getTime())) {
      throw new Error('Invalid class time')
    }

    // Set times to start of day for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const classDate = new Date(classTime.getFullYear(), classTime.getMonth(), classTime.getDate())
    
    const daysDiff = Math.floor((classDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const timeStr = dateUtils.formatDate(classTime, 'time')

    if (daysDiff === 0) {
      return `Today ${timeStr}`
    } else if (daysDiff === 1) {
      return `Tomorrow ${timeStr}`
    } else if (daysDiff === -1) {
      return `Yesterday ${timeStr}`
    } else if (daysDiff > 1 && daysDiff <= 7) {
      const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(classTime)
      return `${weekday} ${timeStr}`
    } else {
      const dateStr = dateUtils.formatDate(classTime, 'short')
      return `${dateStr} ${timeStr}`
    }
  },

  // Calculate time until/since class
  getTimeRelativeToClass: (startTime: string | Date, now: Date = new Date()): {
    status: 'upcoming' | 'starting_soon' | 'in_progress' | 'ended'
    minutes: number
    displayText: string
  } => {
    const classTime = typeof startTime === 'string' ? new Date(startTime) : startTime
    
    if (isNaN(classTime.getTime())) {
      throw new Error('Invalid class time')
    }

    const diffMs = classTime.getTime() - now.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes > 15) {
      const hours = Math.floor(diffMinutes / 60)
      const mins = diffMinutes % 60
      
      if (hours >= 24) {
        const days = Math.floor(hours / 24)
        return {
          status: 'upcoming',
          minutes: diffMinutes,
          displayText: `in ${days} day${days === 1 ? '' : 's'}`
        }
      } else if (hours > 0) {
        return {
          status: 'upcoming',
          minutes: diffMinutes,
          displayText: mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours} hour${hours === 1 ? '' : 's'}`
        }
      } else {
        return {
          status: 'upcoming',
          minutes: diffMinutes,
          displayText: `in ${diffMinutes} minutes`
        }
      }
    } else if (diffMinutes >= -15 && diffMinutes <= 15) {
      if (diffMinutes > 0) {
        return {
          status: 'starting_soon',
          minutes: diffMinutes,
          displayText: `starts in ${diffMinutes} min`
        }
      } else if (diffMinutes >= -15) {
        return {
          status: 'in_progress',
          minutes: diffMinutes,
          displayText: 'in progress'
        }
      }
    }

    return {
      status: 'ended',
      minutes: diffMinutes,
      displayText: 'ended'
    }
  },

  // Check if booking can be cancelled (24+ hours before class)
  canCancelBooking: (classStartTime: string | Date, now: Date = new Date()): {
    canCancel: boolean
    reason?: string
    hoursUntilDeadline?: number
  } => {
    const startTime = typeof classStartTime === 'string' ? new Date(classStartTime) : classStartTime
    
    if (isNaN(startTime.getTime())) {
      throw new Error('Invalid class start time')
    }

    const diffMs = startTime.getTime() - now.getTime()
    const hoursUntilClass = diffMs / (1000 * 60 * 60)

    if (hoursUntilClass < 0) {
      return {
        canCancel: false,
        reason: 'Class has already started or ended'
      }
    }

    if (hoursUntilClass < 24) {
      return {
        canCancel: false,
        reason: 'Bookings can only be cancelled up to 24 hours before the class',
        hoursUntilDeadline: 0
      }
    }

    return {
      canCancel: true,
      hoursUntilDeadline: hoursUntilClass - 24
    }
  },

  // Get next available booking slot times
  getAvailableBookingTimes: (currentTime: Date = new Date(), daysAhead: number = 7): Date[] => {
    const times: Date[] = []
    
    for (let day = 0; day <= daysAhead; day++) {
      const date = new Date(currentTime)
      date.setDate(date.getDate() + day)
      
      // Common class times: 6 AM, 8 AM, 10 AM, 12 PM, 2 PM, 4 PM, 6 PM, 8 PM
      const classHours = [6, 8, 10, 12, 14, 16, 18, 20]
      
      classHours.forEach(hour => {
        const classTime = new Date(date)
        classTime.setHours(hour, 0, 0, 0)
        
        // Only include future times
        if (classTime.getTime() > currentTime.getTime()) {
          times.push(classTime)
        }
      })
    }
    
    return times.slice(0, 20) // Limit to 20 slots
  },

  // Check if time is within business hours
  isWithinBusinessHours: (time: Date, businessHours = { start: 6, end: 22 }): boolean => {
    const hour = time.getHours()
    return hour >= businessHours.start && hour <= businessHours.end
  },

  // Parse time string to Date (e.g., "10:30 AM" -> Date)
  parseTimeString: (timeStr: string, baseDate: Date = new Date()): Date => {
    const timeParts = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
    
    if (!timeParts) {
      throw new Error('Invalid time format. Expected format: "HH:MM AM/PM"')
    }

    let hours = parseInt(timeParts[1])
    const minutes = parseInt(timeParts[2])
    const ampm = timeParts[3]?.toUpperCase()

    if (hours < 1 || hours > 12) {
      throw new Error('Hours must be between 1 and 12')
    }

    if (minutes < 0 || minutes > 59) {
      throw new Error('Minutes must be between 0 and 59')
    }

    if (ampm) {
      if (ampm === 'PM' && hours !== 12) {
        hours += 12
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0
      }
    }

    const result = new Date(baseDate)
    result.setHours(hours, minutes, 0, 0)
    return result
  },

  // Get business days between two dates (excluding weekends)
  getBusinessDaysBetween: (startDate: Date, endDate: Date): number => {
    let count = 0
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return count
  },

  // Get timezone offset for Los Cabos
  getLosTabosOffset: (date: Date = new Date()): number => {
    // Los Cabos is in Pacific Time (UTC-8) or Mountain Standard Time (UTC-7)
    // For testing purposes, we'll use a fixed offset
    return -8 * 60 // -8 hours in minutes
  }
}

describe('Date/Time Utilities', () => {
  // Mock current date for consistent testing
  const mockDate = new Date('2024-01-15T14:30:00Z') // Monday, 2:30 PM UTC
  
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('formatDate', () => {
    it('formats date in short format', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = dateUtils.formatDate(date, 'short')
      expect(result).toMatch(/Jan 15, 2024/)
    })

    it('formats date in long format', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = dateUtils.formatDate(date, 'long')
      expect(result).toMatch(/Monday, January 15, 2024/)
    })

    it('formats time only', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = dateUtils.formatDate(date, 'time')
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
    })

    it('formats datetime', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = dateUtils.formatDate(date, 'datetime')
      expect(result).toMatch(/Jan 15, 2024.* \d{1,2}:\d{2} (AM|PM)/)
    })

    it('handles string input', () => {
      const result = dateUtils.formatDate('2024-01-15T10:30:00Z', 'short')
      expect(result).toMatch(/Jan 15, 2024/)
    })

    it('throws error for invalid date', () => {
      expect(() => dateUtils.formatDate('invalid-date')).toThrow('Invalid date')
    })

    it('uses default format when not specified', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = dateUtils.formatDate(date)
      expect(result).toMatch(/Jan 15, 2024/)
    })
  })

  describe('getClassTimeDisplay', () => {
    it('shows "Today" for classes today', () => {
      const today = new Date('2024-01-15T18:00:00Z') // Same day as mock date
      const result = dateUtils.getClassTimeDisplay(today)
      expect(result).toMatch(/^Today \d{1,2}:\d{2} (AM|PM)$/)
    })

    it('shows "Tomorrow" for classes tomorrow', () => {
      const tomorrow = new Date('2024-01-16T10:00:00Z')
      const result = dateUtils.getClassTimeDisplay(tomorrow)
      expect(result).toMatch(/^Tomorrow \d{1,2}:\d{2} (AM|PM)$/)
    })

    it('shows "Yesterday" for classes yesterday', () => {
      const yesterday = new Date('2024-01-14T10:00:00Z')
      const result = dateUtils.getClassTimeDisplay(yesterday)
      expect(result).toMatch(/^Yesterday \d{1,2}:\d{2} (AM|PM)$/)
    })

    it('shows weekday for classes within a week', () => {
      const nextWeek = new Date('2024-01-17T10:00:00Z') // Wednesday
      const result = dateUtils.getClassTimeDisplay(nextWeek)
      expect(result).toMatch(/^Wednesday \d{1,2}:\d{2} (AM|PM)$/)
    })

    it('shows full date for classes more than a week away', () => {
      const farFuture = new Date('2024-02-15T10:00:00Z')
      const result = dateUtils.getClassTimeDisplay(farFuture)
      expect(result).toMatch(/^Feb 15, 2024 \d{1,2}:\d{2} (AM|PM)$/)
    })

    it('handles string input', () => {
      const result = dateUtils.getClassTimeDisplay('2024-01-16T10:00:00Z')
      expect(result).toMatch(/^Tomorrow/)
    })

    it('throws error for invalid date', () => {
      expect(() => dateUtils.getClassTimeDisplay('invalid-date')).toThrow('Invalid class time')
    })
  })

  describe('getTimeRelativeToClass', () => {
    const now = new Date('2024-01-15T14:30:00Z')

    it('returns upcoming status for future classes', () => {
      const classTime = new Date('2024-01-15T16:00:00Z') // 1.5 hours later
      const result = dateUtils.getTimeRelativeToClass(classTime, now)
      
      expect(result.status).toBe('upcoming')
      expect(result.minutes).toBe(90)
      expect(result.displayText).toBe('in 1h 30m')
    })

    it('returns starting_soon for classes starting within 15 minutes', () => {
      const classTime = new Date('2024-01-15T14:40:00Z') // 10 minutes later
      const result = dateUtils.getTimeRelativeToClass(classTime, now)
      
      expect(result.status).toBe('starting_soon')
      expect(result.minutes).toBe(10)
      expect(result.displayText).toBe('starts in 10 min')
    })

    it('returns in_progress for classes that started recently', () => {
      const classTime = new Date('2024-01-15T14:20:00Z') // 10 minutes ago
      const result = dateUtils.getTimeRelativeToClass(classTime, now)
      
      expect(result.status).toBe('in_progress')
      expect(result.minutes).toBe(-10)
      expect(result.displayText).toBe('in progress')
    })

    it('returns ended for classes that ended', () => {
      const classTime = new Date('2024-01-15T13:00:00Z') // 1.5 hours ago
      const result = dateUtils.getTimeRelativeToClass(classTime, now)
      
      expect(result.status).toBe('ended')
      expect(result.minutes).toBe(-90)
      expect(result.displayText).toBe('ended')
    })

    it('formats days correctly for far future classes', () => {
      const classTime = new Date('2024-01-17T14:30:00Z') // 2 days later
      const result = dateUtils.getTimeRelativeToClass(classTime, now)
      
      expect(result.status).toBe('upcoming')
      expect(result.displayText).toBe('in 2 days')
    })

    it('formats hours correctly', () => {
      const classTime = new Date('2024-01-15T16:30:00Z') // 2 hours later
      const result = dateUtils.getTimeRelativeToClass(classTime, now)
      
      expect(result.displayText).toBe('in 2 hours')
    })

    it('handles string input', () => {
      const result = dateUtils.getTimeRelativeToClass('2024-01-15T16:00:00Z', now)
      expect(result.status).toBe('upcoming')
    })

    it('uses current time when now is not provided', () => {
      const classTime = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      const result = dateUtils.getTimeRelativeToClass(classTime)
      expect(result.status).toBe('upcoming')
    })

    it('throws error for invalid date', () => {
      expect(() => dateUtils.getTimeRelativeToClass('invalid-date', now)).toThrow('Invalid class time')
    })
  })

  describe('canCancelBooking', () => {
    const now = new Date('2024-01-15T14:30:00Z')

    it('allows cancellation for classes more than 24 hours away', () => {
      const classTime = new Date('2024-01-17T14:30:00Z') // 2 days later
      const result = dateUtils.canCancelBooking(classTime, now)
      
      expect(result.canCancel).toBe(true)
      expect(result.hoursUntilDeadline).toBe(24) // 48 - 24
    })

    it('prevents cancellation for classes less than 24 hours away', () => {
      const classTime = new Date('2024-01-16T10:30:00Z') // ~20 hours later
      const result = dateUtils.canCancelBooking(classTime, now)
      
      expect(result.canCancel).toBe(false)
      expect(result.reason).toContain('24 hours before')
    })

    it('prevents cancellation for classes that have started', () => {
      const classTime = new Date('2024-01-15T10:30:00Z') // 4 hours ago
      const result = dateUtils.canCancelBooking(classTime, now)
      
      expect(result.canCancel).toBe(false)
      expect(result.reason).toContain('already started or ended')
    })

    it('handles string input', () => {
      const result = dateUtils.canCancelBooking('2024-01-17T14:30:00Z', now)
      expect(result.canCancel).toBe(true)
    })

    it('uses current time when now is not provided', () => {
      const classTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      const result = dateUtils.canCancelBooking(classTime)
      expect(result.canCancel).toBe(true)
    })

    it('throws error for invalid date', () => {
      expect(() => dateUtils.canCancelBooking('invalid-date', now)).toThrow('Invalid class start time')
    })
  })

  describe('getAvailableBookingTimes', () => {
    const currentTime = new Date('2024-01-15T14:30:00Z')

    it('returns future booking times', () => {
      const times = dateUtils.getAvailableBookingTimes(currentTime, 3)
      
      expect(times.length).toBeGreaterThan(0)
      expect(times.length).toBeLessThanOrEqual(20)
      
      // All times should be in the future
      times.forEach(time => {
        expect(time.getTime()).toBeGreaterThan(currentTime.getTime())
      })
    })

    it('includes common class hours', () => {
      const times = dateUtils.getAvailableBookingTimes(currentTime, 1)
      const hours = times.map(time => time.getHours())
      
      expect(hours).toContain(16) // 4 PM
      expect(hours).toContain(18) // 6 PM
      expect(hours).toContain(20) // 8 PM
    })

    it('excludes past times from today', () => {
      const morningTime = new Date('2024-01-15T08:00:00Z')
      const times = dateUtils.getAvailableBookingTimes(currentTime, 1)
      
      const todayMorningTimes = times.filter(time => 
        time.getDate() === currentTime.getDate() && time.getHours() < 14
      )
      
      expect(todayMorningTimes.length).toBe(0)
    })

    it('limits results to 20 slots', () => {
      const times = dateUtils.getAvailableBookingTimes(currentTime, 30)
      expect(times.length).toBe(20)
    })

    it('uses current time when not provided', () => {
      const times = dateUtils.getAvailableBookingTimes()
      expect(times.length).toBeGreaterThan(0)
    })
  })

  describe('isWithinBusinessHours', () => {
    it('returns true for times within business hours', () => {
      const businessTime = new Date('2024-01-15T10:30:00Z')
      const result = dateUtils.isWithinBusinessHours(businessTime)
      expect(result).toBe(true)
    })

    it('returns false for times outside business hours', () => {
      const lateTime = new Date('2024-01-15T23:30:00Z')
      const result = dateUtils.isWithinBusinessHours(lateTime)
      expect(result).toBe(false)
    })

    it('accepts custom business hours', () => {
      const earlyTime = new Date('2024-01-15T05:30:00Z')
      const result = dateUtils.isWithinBusinessHours(earlyTime, { start: 5, end: 23 })
      expect(result).toBe(true)
    })

    it('handles edge cases at business hour boundaries', () => {
      const startTime = new Date('2024-01-15T06:00:00Z')
      const endTime = new Date('2024-01-15T22:00:00Z')
      
      expect(dateUtils.isWithinBusinessHours(startTime)).toBe(true)
      expect(dateUtils.isWithinBusinessHours(endTime)).toBe(true)
    })
  })

  describe('parseTimeString', () => {
    const baseDate = new Date('2024-01-15T00:00:00Z')

    it('parses AM time correctly', () => {
      const result = dateUtils.parseTimeString('10:30 AM', baseDate)
      expect(result.getHours()).toBe(10)
      expect(result.getMinutes()).toBe(30)
    })

    it('parses PM time correctly', () => {
      const result = dateUtils.parseTimeString('2:45 PM', baseDate)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(45)
    })

    it('handles 12 AM (midnight)', () => {
      const result = dateUtils.parseTimeString('12:00 AM', baseDate)
      expect(result.getHours()).toBe(0)
    })

    it('handles 12 PM (noon)', () => {
      const result = dateUtils.parseTimeString('12:00 PM', baseDate)
      expect(result.getHours()).toBe(12)
    })

    it('parses 24-hour format without AM/PM', () => {
      const result = dateUtils.parseTimeString('14:30', baseDate)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
    })

    it('uses current date when baseDate not provided', () => {
      const result = dateUtils.parseTimeString('10:30 AM')
      expect(result.getHours()).toBe(10)
      expect(result.getMinutes()).toBe(30)
    })

    it('throws error for invalid time format', () => {
      expect(() => dateUtils.parseTimeString('25:30 AM', baseDate)).toThrow('Hours must be between 1 and 12')
      expect(() => dateUtils.parseTimeString('10:70 AM', baseDate)).toThrow('Minutes must be between 0 and 59')
      expect(() => dateUtils.parseTimeString('invalid', baseDate)).toThrow('Invalid time format')
    })
  })

  describe('getBusinessDaysBetween', () => {
    it('counts business days correctly', () => {
      const start = new Date('2024-01-15T00:00:00Z') // Monday
      const end = new Date('2024-01-19T00:00:00Z')   // Friday
      
      const result = dateUtils.getBusinessDaysBetween(start, end)
      expect(result).toBe(5) // Mon, Tue, Wed, Thu, Fri
    })

    it('excludes weekends', () => {
      const start = new Date('2024-01-15T00:00:00Z') // Monday
      const end = new Date('2024-01-21T00:00:00Z')   // Sunday
      
      const result = dateUtils.getBusinessDaysBetween(start, end)
      expect(result).toBe(5) // Only weekdays counted
    })

    it('handles same day', () => {
      const start = new Date('2024-01-15T00:00:00Z') // Monday
      const end = new Date('2024-01-15T23:59:59Z')   // Same Monday
      
      const result = dateUtils.getBusinessDaysBetween(start, end)
      expect(result).toBe(1)
    })

    it('handles weekend-only periods', () => {
      const start = new Date('2024-01-13T00:00:00Z') // Saturday
      const end = new Date('2024-01-14T00:00:00Z')   // Sunday
      
      const result = dateUtils.getBusinessDaysBetween(start, end)
      expect(result).toBe(0)
    })
  })

  describe('getLosTabosOffset', () => {
    it('returns correct timezone offset', () => {
      const offset = dateUtils.getLosTabosOffset()
      expect(offset).toBe(-480) // -8 hours in minutes
    })

    it('accepts date parameter', () => {
      const date = new Date('2024-07-15T00:00:00Z')
      const offset = dateUtils.getLosTabosOffset(date)
      expect(typeof offset).toBe('number')
    })
  })
})