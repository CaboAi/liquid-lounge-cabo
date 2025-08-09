/**
 * @jest-environment node
 */

// Mock validation utilities
const validationUtils = {
  // Email validation
  validateEmail: (email: string): { isValid: boolean; error?: string } => {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' }
    }

    const trimmedEmail = email.trim()
    
    if (trimmedEmail.length === 0) {
      return { isValid: false, error: 'Email is required' }
    }

    if (trimmedEmail.length > 254) {
      return { isValid: false, error: 'Email is too long' }
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }

    // Check for common typos
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    const domain = trimmedEmail.split('@')[1]
    const suggestions: string[] = []

    if (domain) {
      commonDomains.forEach(commonDomain => {
        if (domain !== commonDomain && levenshteinDistance(domain, commonDomain) <= 2) {
          suggestions.push(trimmedEmail.replace(domain, commonDomain))
        }
      })
    }

    return { 
      isValid: true,
      ...(suggestions.length > 0 && { suggestions })
    }
  },

  // Password validation
  validatePassword: (
    password: string,
    options = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      maxLength: 128
    }
  ): { isValid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' } => {
    const errors: string[] = []

    if (!password || typeof password !== 'string') {
      return { isValid: false, errors: ['Password is required'], strength: 'weak' }
    }

    if (password.length < options.minLength) {
      errors.push(`Password must be at least ${options.minLength} characters long`)
    }

    if (password.length > options.maxLength) {
      errors.push(`Password must be no more than ${options.maxLength} characters long`)
    }

    if (options.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (options.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (options.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (options.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    // Check for common weak passwords
    const commonWeakPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', '12345678'
    ]

    if (commonWeakPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a more secure password')
    }

    // Calculate password strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    let strengthScore = 0

    if (password.length >= 8) strengthScore++
    if (password.length >= 12) strengthScore++
    if (/[A-Z]/.test(password)) strengthScore++
    if (/[a-z]/.test(password)) strengthScore++
    if (/\d/.test(password)) strengthScore++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strengthScore++
    if (password.length >= 16) strengthScore++

    if (strengthScore >= 5) {
      strength = 'strong'
    } else if (strengthScore >= 3) {
      strength = 'medium'
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength
    }
  },

  // Phone number validation (international format)
  validatePhoneNumber: (
    phone: string,
    countryCode = 'MX' // Default to Mexico for Los Cabos
  ): { isValid: boolean; error?: string; formatted?: string } => {
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, error: 'Phone number is required' }
    }

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '')

    if (digitsOnly.length === 0) {
      return { isValid: false, error: 'Phone number is required' }
    }

    // Mexico phone number validation
    if (countryCode === 'MX') {
      // Mexican phone numbers: 10 digits (mobile) or with country code +52
      if (digitsOnly.length === 10) {
        // Mobile numbers start with specific prefixes
        const mobilePrefix = digitsOnly.substring(0, 3)
        const validPrefixes = ['624', '612', '613', '614', '615', '616', '618', '622', '631', '646', '661', '664', '686']
        
        if (!validPrefixes.includes(mobilePrefix)) {
          return { isValid: false, error: 'Please enter a valid Los Cabos area phone number' }
        }

        return {
          isValid: true,
          formatted: `+52 ${digitsOnly.substring(0, 3)} ${digitsOnly.substring(3, 6)} ${digitsOnly.substring(6)}`
        }
      } else if (digitsOnly.length === 12 && digitsOnly.startsWith('52')) {
        // With country code
        const localNumber = digitsOnly.substring(2)
        const mobilePrefix = localNumber.substring(0, 3)
        const validPrefixes = ['624', '612', '613', '614', '615', '616', '618', '622', '631', '646', '661', '664', '686']
        
        if (!validPrefixes.includes(mobilePrefix)) {
          return { isValid: false, error: 'Please enter a valid Mexican phone number' }
        }

        return {
          isValid: true,
          formatted: `+52 ${localNumber.substring(0, 3)} ${localNumber.substring(3, 6)} ${localNumber.substring(6)}`
        }
      }

      return { isValid: false, error: 'Mexican phone numbers must be 10 digits or include country code (+52)' }
    }

    // US phone number validation
    if (countryCode === 'US') {
      if (digitsOnly.length === 10) {
        const areaCode = digitsOnly.substring(0, 3)
        if (areaCode[0] === '0' || areaCode[0] === '1') {
          return { isValid: false, error: 'Area code cannot start with 0 or 1' }
        }

        return {
          isValid: true,
          formatted: `+1 (${areaCode}) ${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6)}`
        }
      } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        return validationUtils.validatePhoneNumber(digitsOnly.substring(1), 'US')
      }

      return { isValid: false, error: 'US phone numbers must be 10 digits or include country code (+1)' }
    }

    return { isValid: false, error: 'Unsupported country code' }
  },

  // Name validation
  validateName: (
    name: string,
    options = { minLength: 2, maxLength: 50, allowMiddleName: true }
  ): { isValid: boolean; error?: string } => {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: 'Name is required' }
    }

    const trimmedName = name.trim()

    if (trimmedName.length === 0) {
      return { isValid: false, error: 'Name is required' }
    }

    if (trimmedName.length < options.minLength) {
      return { isValid: false, error: `Name must be at least ${options.minLength} characters long` }
    }

    if (trimmedName.length > options.maxLength) {
      return { isValid: false, error: `Name must be no more than ${options.maxLength} characters long` }
    }

    // Only allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/
    if (!nameRegex.test(trimmedName)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
    }

    // Check for at least first and last name
    if (!options.allowMiddleName) {
      const nameParts = trimmedName.split(/\s+/)
      if (nameParts.length < 2) {
        return { isValid: false, error: 'Please enter both first and last name' }
      }
    }

    return { isValid: true }
  },

  // Date validation
  validateDate: (
    dateString: string,
    options = { 
      format: 'YYYY-MM-DD',
      minDate: null as Date | null,
      maxDate: null as Date | null,
      allowFuture: true,
      allowPast: true
    }
  ): { isValid: boolean; error?: string; parsedDate?: Date } => {
    if (!dateString || typeof dateString !== 'string') {
      return { isValid: false, error: 'Date is required' }
    }

    let parsedDate: Date

    try {
      // Handle different date formats
      if (options.format === 'YYYY-MM-DD') {
        const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/
        const match = dateString.match(dateRegex)
        
        if (!match) {
          return { isValid: false, error: 'Date must be in YYYY-MM-DD format' }
        }

        const [, year, month, day] = match
        parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else {
        parsedDate = new Date(dateString)
      }

      if (isNaN(parsedDate.getTime())) {
        return { isValid: false, error: 'Invalid date' }
      }
    } catch {
      return { isValid: false, error: 'Invalid date format' }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!options.allowPast && parsedDate < today) {
      return { isValid: false, error: 'Date cannot be in the past' }
    }

    if (!options.allowFuture && parsedDate > today) {
      return { isValid: false, error: 'Date cannot be in the future' }
    }

    if (options.minDate && parsedDate < options.minDate) {
      return { isValid: false, error: `Date must be after ${options.minDate.toLocaleDateString()}` }
    }

    if (options.maxDate && parsedDate > options.maxDate) {
      return { isValid: false, error: `Date must be before ${options.maxDate.toLocaleDateString()}` }
    }

    return { isValid: true, parsedDate }
  },

  // Form field validation
  validateRequired: (value: any, fieldName: string): { isValid: boolean; error?: string } => {
    if (value === null || value === undefined) {
      return { isValid: false, error: `${fieldName} is required` }
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return { isValid: false, error: `${fieldName} is required` }
    }

    if (Array.isArray(value) && value.length === 0) {
      return { isValid: false, error: `${fieldName} is required` }
    }

    return { isValid: true }
  },

  // Credit card validation (basic Luhn algorithm)
  validateCreditCard: (cardNumber: string): { 
    isValid: boolean; 
    error?: string; 
    cardType?: string;
    formatted?: string 
  } => {
    if (!cardNumber || typeof cardNumber !== 'string') {
      return { isValid: false, error: 'Card number is required' }
    }

    const digitsOnly = cardNumber.replace(/\D/g, '')

    if (digitsOnly.length < 13 || digitsOnly.length > 19) {
      return { isValid: false, error: 'Card number must be between 13 and 19 digits' }
    }

    // Luhn algorithm validation
    let sum = 0
    let isEven = false

    for (let i = digitsOnly.length - 1; i >= 0; i--) {
      let digit = parseInt(digitsOnly[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit = digit % 10 + 1
        }
      }

      sum += digit
      isEven = !isEven
    }

    if (sum % 10 !== 0) {
      return { isValid: false, error: 'Invalid card number' }
    }

    // Determine card type
    let cardType = 'Unknown'
    const firstDigit = digitsOnly[0]
    const firstTwoDigits = digitsOnly.substring(0, 2)

    if (firstDigit === '4') {
      cardType = 'Visa'
    } else if (['51', '52', '53', '54', '55'].includes(firstTwoDigits)) {
      cardType = 'Mastercard'
    } else if (['34', '37'].includes(firstTwoDigits)) {
      cardType = 'American Express'
    } else if (firstDigit === '6') {
      cardType = 'Discover'
    }

    // Format card number
    let formatted = ''
    if (cardType === 'American Express') {
      formatted = `${digitsOnly.substring(0, 4)} ${digitsOnly.substring(4, 10)} ${digitsOnly.substring(10)}`
    } else {
      for (let i = 0; i < digitsOnly.length; i += 4) {
        formatted += digitsOnly.substring(i, i + 4) + ' '
      }
      formatted = formatted.trim()
    }

    return { isValid: true, cardType, formatted }
  },

  // Batch validation for forms
  validateForm: (
    data: Record<string, any>, 
    rules: Record<string, Array<{ 
      type: string; 
      options?: any; 
      message?: string 
    }>>
  ): { isValid: boolean; errors: Record<string, string[]> } => {
    const errors: Record<string, string[]> = {}

    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      const fieldErrors: string[] = []
      const fieldValue = data[fieldName]

      fieldRules.forEach(rule => {
        let result: { isValid: boolean; error?: string; errors?: string[] }

        switch (rule.type) {
          case 'required':
            result = validationUtils.validateRequired(fieldValue, fieldName)
            break
          case 'email':
            result = validationUtils.validateEmail(fieldValue)
            break
          case 'password':
            result = validationUtils.validatePassword(fieldValue, rule.options)
            if ('errors' in result) {
              fieldErrors.push(...(result.errors || []))
              return
            }
            break
          case 'phone':
            result = validationUtils.validatePhoneNumber(fieldValue, rule.options?.countryCode)
            break
          case 'name':
            result = validationUtils.validateName(fieldValue, rule.options)
            break
          case 'date':
            result = validationUtils.validateDate(fieldValue, rule.options)
            break
          case 'creditCard':
            result = validationUtils.validateCreditCard(fieldValue)
            break
          default:
            result = { isValid: true }
        }

        if (!result.isValid) {
          fieldErrors.push(rule.message || result.error || 'Invalid value')
        }
      })

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// Helper function for email suggestions
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  const len1 = str1.length
  const len2 = str2.length

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[len2][len1]
}

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@gmail.com',
        'firstname.lastname@company.com',
        'user123@test-domain.com'
      ]

      validEmails.forEach(email => {
        const result = validationUtils.validateEmail(email)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user name@domain.com'
      ]

      invalidEmails.forEach(email => {
        const result = validationUtils.validateEmail(email)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeDefined()
      })
    })

    it('handles empty or null email', () => {
      expect(validationUtils.validateEmail('').isValid).toBe(false)
      expect(validationUtils.validateEmail('   ').isValid).toBe(false)
      expect(validationUtils.validateEmail(null as any).isValid).toBe(false)
      expect(validationUtils.validateEmail(undefined as any).isValid).toBe(false)
    })

    it('rejects emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@domain.com'
      const result = validationUtils.validateEmail(longEmail)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('too long')
    })

    it('suggests corrections for common domain typos', () => {
      const result = validationUtils.validateEmail('user@gmai.com') // Missing 'l'
      expect(result.isValid).toBe(true)
      expect(result.suggestions).toContain('user@gmail.com')
    })

    it('trims whitespace from email', () => {
      const result = validationUtils.validateEmail('  user@example.com  ')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const strongPasswords = [
        'MySecureP@ssw0rd',
        'C0mplex!Password123',
        'Str0ngP@ssword'
      ]

      strongPasswords.forEach(password => {
        const result = validationUtils.validatePassword(password)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
        expect(['medium', 'strong']).toContain(result.strength)
      })
    })

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'password',
        '123456',
        'qwerty',
        'abc123'
      ]

      weakPasswords.forEach(password => {
        const result = validationUtils.validatePassword(password)
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.strength).toBe('weak')
      })
    })

    it('validates password length requirements', () => {
      const shortPassword = '1234567' // 7 characters
      const result = validationUtils.validatePassword(shortPassword)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('validates character requirements', () => {
      const noUppercase = 'lowercase123'
      const noLowercase = 'UPPERCASE123'
      const noNumbers = 'OnlyLetters'

      expect(validationUtils.validatePassword(noUppercase).errors)
        .toContain('Password must contain at least one uppercase letter')
      
      expect(validationUtils.validatePassword(noLowercase).errors)
        .toContain('Password must contain at least one lowercase letter')
      
      expect(validationUtils.validatePassword(noNumbers).errors)
        .toContain('Password must contain at least one number')
    })

    it('accepts custom validation options', () => {
      const options = {
        minLength: 12,
        requireSpecialChars: true,
        requireUppercase: false,
        requireLowercase: true,
        requireNumbers: true,
        maxLength: 20
      }

      const password = 'longpassword123!' // meets custom requirements
      const result = validationUtils.validatePassword(password, options)
      
      expect(result.isValid).toBe(true)
    })

    it('handles empty or null password', () => {
      expect(validationUtils.validatePassword('').isValid).toBe(false)
      expect(validationUtils.validatePassword(null as any).isValid).toBe(false)
      expect(validationUtils.validatePassword(undefined as any).isValid).toBe(false)
    })

    it('calculates password strength correctly', () => {
      expect(validationUtils.validatePassword('weak').strength).toBe('weak')
      expect(validationUtils.validatePassword('Medium123').strength).toBe('medium')
      expect(validationUtils.validatePassword('VeryStr0ng!Password').strength).toBe('strong')
    })
  })

  describe('validatePhoneNumber', () => {
    describe('Mexican phone numbers', () => {
      it('validates Los Cabos phone numbers', () => {
        const validNumbers = [
          '6241234567', // Los Cabos area code
          '624-123-4567',
          '(624) 123-4567',
          '+52 624 123 4567'
        ]

        validNumbers.forEach(number => {
          const result = validationUtils.validatePhoneNumber(number, 'MX')
          expect(result.isValid).toBe(true)
          expect(result.formatted).toContain('+52 624')
        })
      })

      it('rejects invalid Mexican phone numbers', () => {
        const invalidNumbers = [
          '1234567890', // Wrong area code
          '624123456',  // Too short
          '62412345678' // Too long
        ]

        invalidNumbers.forEach(number => {
          const result = validationUtils.validatePhoneNumber(number, 'MX')
          expect(result.isValid).toBe(false)
          expect(result.error).toBeDefined()
        })
      })

      it('validates with country code', () => {
        const result = validationUtils.validatePhoneNumber('526241234567', 'MX')
        expect(result.isValid).toBe(true)
        expect(result.formatted).toBe('+52 624 123 4567')
      })
    })

    describe('US phone numbers', () => {
      it('validates US phone numbers', () => {
        const validNumbers = [
          '2125551234',
          '(212) 555-1234',
          '212-555-1234',
          '+1 212 555 1234'
        ]

        validNumbers.forEach(number => {
          const result = validationUtils.validatePhoneNumber(number, 'US')
          expect(result.isValid).toBe(true)
          expect(result.formatted).toContain('+1 (212)')
        })
      })

      it('rejects invalid US area codes', () => {
        const result = validationUtils.validatePhoneNumber('0125551234', 'US')
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('Area code cannot start with 0 or 1')
      })
    })

    it('handles empty or invalid input', () => {
      expect(validationUtils.validatePhoneNumber('').isValid).toBe(false)
      expect(validationUtils.validatePhoneNumber(null as any).isValid).toBe(false)
    })

    it('defaults to Mexico country code', () => {
      const result = validationUtils.validatePhoneNumber('6241234567')
      expect(result.isValid).toBe(true)
      expect(result.formatted).toContain('+52')
    })
  })

  describe('validateName', () => {
    it('validates correct names', () => {
      const validNames = [
        'John Doe',
        'María González',
        "O'Connor",
        'Jean-Pierre',
        'José María de la Cruz'
      ]

      validNames.forEach(name => {
        const result = validationUtils.validateName(name)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    it('rejects invalid names', () => {
      const invalidNames = [
        'John123',
        'Name@Domain',
        'A', // Too short
        'X'.repeat(60) // Too long
      ]

      invalidNames.forEach(name => {
        const result = validationUtils.validateName(name)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeDefined()
      })
    })

    it('handles empty or null names', () => {
      expect(validationUtils.validateName('').isValid).toBe(false)
      expect(validationUtils.validateName('   ').isValid).toBe(false)
      expect(validationUtils.validateName(null as any).isValid).toBe(false)
    })

    it('validates minimum length', () => {
      const result = validationUtils.validateName('A')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('at least 2 characters')
    })

    it('accepts custom options', () => {
      const options = { minLength: 5, maxLength: 20, allowMiddleName: false }
      const result = validationUtils.validateName('John', options)
      expect(result.isValid).toBe(false) // Too short for custom minLength
    })

    it('trims whitespace', () => {
      const result = validationUtils.validateName('  John Doe  ')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateDate', () => {
    it('validates correct dates', () => {
      const validDates = [
        '2024-01-15',
        '2024-12-31',
        '2025-06-01'
      ]

      validDates.forEach(date => {
        const result = validationUtils.validateDate(date)
        expect(result.isValid).toBe(true)
        expect(result.parsedDate).toBeInstanceOf(Date)
      })
    })

    it('rejects invalid date formats', () => {
      const invalidDates = [
        '15-01-2024',
        '2024/01/15',
        '2024-13-01', // Invalid month
        '2024-01-32', // Invalid day
        'invalid-date'
      ]

      invalidDates.forEach(date => {
        const result = validationUtils.validateDate(date)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeDefined()
      })
    })

    it('validates date ranges', () => {
      const minDate = new Date('2024-01-01')
      const maxDate = new Date('2024-12-31')
      const options = { format: 'YYYY-MM-DD' as const, minDate, maxDate, allowFuture: true, allowPast: true }

      // Valid date within range
      expect(validationUtils.validateDate('2024-06-15', options).isValid).toBe(true)
      
      // Date before minimum
      expect(validationUtils.validateDate('2023-12-31', options).isValid).toBe(false)
      
      // Date after maximum
      expect(validationUtils.validateDate('2025-01-01', options).isValid).toBe(false)
    })

    it('validates future/past date restrictions', () => {
      const futureOnly = { format: 'YYYY-MM-DD' as const, allowPast: false, allowFuture: true }
      const pastOnly = { format: 'YYYY-MM-DD' as const, allowPast: true, allowFuture: false }
      
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Future only - reject past dates
      const pastResult = validationUtils.validateDate(yesterday.toISOString().split('T')[0], futureOnly)
      expect(pastResult.isValid).toBe(false)
      expect(pastResult.error).toContain('cannot be in the past')

      // Past only - reject future dates
      const futureResult = validationUtils.validateDate(tomorrow.toISOString().split('T')[0], pastOnly)
      expect(futureResult.isValid).toBe(false)
      expect(futureResult.error).toContain('cannot be in the future')
    })

    it('handles empty or null dates', () => {
      expect(validationUtils.validateDate('').isValid).toBe(false)
      expect(validationUtils.validateDate(null as any).isValid).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('validates required fields', () => {
      expect(validationUtils.validateRequired('value', 'Field').isValid).toBe(true)
      expect(validationUtils.validateRequired(['item'], 'Field').isValid).toBe(true)
      expect(validationUtils.validateRequired(123, 'Field').isValid).toBe(true)
      expect(validationUtils.validateRequired(true, 'Field').isValid).toBe(true)
    })

    it('rejects empty values', () => {
      expect(validationUtils.validateRequired('', 'Field').isValid).toBe(false)
      expect(validationUtils.validateRequired('   ', 'Field').isValid).toBe(false)
      expect(validationUtils.validateRequired(null, 'Field').isValid).toBe(false)
      expect(validationUtils.validateRequired(undefined, 'Field').isValid).toBe(false)
      expect(validationUtils.validateRequired([], 'Field').isValid).toBe(false)
    })

    it('includes field name in error message', () => {
      const result = validationUtils.validateRequired('', 'Username')
      expect(result.error).toBe('Username is required')
    })
  })

  describe('validateCreditCard', () => {
    it('validates correct credit card numbers', () => {
      const validCards = [
        '4111111111111111', // Visa test number
        '5555555555554444', // Mastercard test number
        '371449635398431',  // Amex test number
      ]

      validCards.forEach(card => {
        const result = validationUtils.validateCreditCard(card)
        expect(result.isValid).toBe(true)
        expect(result.cardType).toBeDefined()
        expect(result.formatted).toBeDefined()
      })
    })

    it('identifies card types correctly', () => {
      expect(validationUtils.validateCreditCard('4111111111111111').cardType).toBe('Visa')
      expect(validationUtils.validateCreditCard('5555555555554444').cardType).toBe('Mastercard')
      expect(validationUtils.validateCreditCard('371449635398431').cardType).toBe('American Express')
    })

    it('formats card numbers correctly', () => {
      const visa = validationUtils.validateCreditCard('4111111111111111')
      expect(visa.formatted).toBe('4111 1111 1111 1111')

      const amex = validationUtils.validateCreditCard('371449635398431')
      expect(amex.formatted).toBe('3714 496353 98431')
    })

    it('rejects invalid card numbers', () => {
      const invalidCards = [
        '4111111111111112', // Wrong checksum
        '123', // Too short
        '1234567890123456789012', // Too long
      ]

      invalidCards.forEach(card => {
        const result = validationUtils.validateCreditCard(card)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeDefined()
      })
    })

    it('handles formatted input', () => {
      const result = validationUtils.validateCreditCard('4111-1111-1111-1111')
      expect(result.isValid).toBe(true)
    })

    it('handles empty or null input', () => {
      expect(validationUtils.validateCreditCard('').isValid).toBe(false)
      expect(validationUtils.validateCreditCard(null as any).isValid).toBe(false)
    })
  })

  describe('validateForm', () => {
    const formData = {
      email: 'user@example.com',
      password: 'SecureP@ssw0rd123',
      fullName: 'John Doe',
      phone: '6241234567',
      birthDate: '1990-01-15'
    }

    const validationRules = {
      email: [
        { type: 'required' },
        { type: 'email' }
      ],
      password: [
        { type: 'required' },
        { type: 'password', options: { minLength: 8, requireSpecialChars: true } }
      ],
      fullName: [
        { type: 'required' },
        { type: 'name' }
      ],
      phone: [
        { type: 'required' },
        { type: 'phone', options: { countryCode: 'MX' } }
      ],
      birthDate: [
        { type: 'required' },
        { type: 'date', options: { allowFuture: false } }
      ]
    }

    it('validates all fields successfully', () => {
      const result = validationUtils.validateForm(formData, validationRules)
      
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('collects all validation errors', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        fullName: '',
        phone: '123',
        birthDate: '2025-01-01'
      }

      const result = validationUtils.validateForm(invalidData, validationRules)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.email).toBeDefined()
      expect(result.errors.password.length).toBeGreaterThan(0)
      expect(result.errors.fullName).toBeDefined()
      expect(result.errors.phone).toBeDefined()
      expect(result.errors.birthDate).toBeDefined()
    })

    it('uses custom error messages', () => {
      const customRules = {
        email: [
          { type: 'required', message: 'Email address is mandatory' },
          { type: 'email', message: 'Please provide a valid email' }
        ]
      }

      const result = validationUtils.validateForm({ email: 'invalid' }, customRules)
      
      expect(result.errors.email).toContain('Please provide a valid email')
    })

    it('handles missing fields', () => {
      const incompleteData = { email: 'user@example.com' }
      
      const result = validationUtils.validateForm(incompleteData, validationRules)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.password).toBeDefined()
      expect(result.errors.fullName).toBeDefined()
    })
  })
})