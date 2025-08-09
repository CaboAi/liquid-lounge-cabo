/**
 * @jest-environment jsdom
 */

import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render, testUtils } from '@/tests/utils/test-utils'
import { mockHandlers } from '@/tests/mocks/server'

// Mock SignUp Form Component
const MockSignUpForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validateForm = (formData: FormData) => {
    const newErrors: Record<string, string> = {}
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const fullName = formData.get('fullName') as string
    const terms = formData.get('terms')

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email'
    }

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!terms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.target as HTMLFormElement)
    
    // Client-side validation
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          fullName: formData.get('fullName'),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Registration failed')
      }

      onSuccess?.()
    } catch (err) {
      setErrors({ 
        general: err instanceof Error ? err.message : 'Registration failed' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="signup-form" noValidate>
      <div>
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          data-testid="fullname-input"
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          aria-invalid={!!errors.fullName}
        />
        {errors.fullName && (
          <div id="fullName-error" role="alert" data-testid="fullname-error">
            {errors.fullName}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          data-testid="email-input"
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <div id="email-error" role="alert" data-testid="email-error">
            {errors.email}
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          data-testid="password-input"
          aria-describedby={errors.password ? 'password-error' : 'password-help'}
          aria-invalid={!!errors.password}
        />
        <div id="password-help" className="help-text">
          Password must be at least 8 characters long
        </div>
        {errors.password && (
          <div id="password-error" role="alert" data-testid="password-error">
            {errors.password}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          data-testid="confirm-password-input"
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <div id="confirmPassword-error" role="alert" data-testid="confirm-password-error">
            {errors.confirmPassword}
          </div>
        )}
      </div>

      <div>
        <label>
          <input
            name="terms"
            type="checkbox"
            required
            data-testid="terms-checkbox"
            aria-describedby={errors.terms ? 'terms-error' : undefined}
            aria-invalid={!!errors.terms}
          />
          I agree to the Terms and Conditions
        </label>
        {errors.terms && (
          <div id="terms-error" role="alert" data-testid="terms-error">
            {errors.terms}
          </div>
        )}
      </div>

      {errors.general && (
        <div role="alert" data-testid="general-error">
          {errors.general}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        data-testid="submit-button"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  )
}

describe('SignUpForm', () => {
  beforeEach(() => {
    mockHandlers.reset()
  })

  describe('Rendering', () => {
    it('renders all form fields correctly', () => {
      render(<MockSignUpForm />)

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/terms and conditions/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('shows password requirements', () => {
      render(<MockSignUpForm />)
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })

    it('has proper ARIA attributes', () => {
      render(<MockSignUpForm />)

      const passwordInput = screen.getByLabelText(/^password/i)
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-help')
    })
  })

  describe('Validation', () => {
    it('validates required fields', async () => {
      const { user } = render(<MockSignUpForm />)

      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        expect(screen.getByTestId('fullname-error')).toHaveTextContent(/full name is required/i)
      })
    })

    it('validates email format', async () => {
      const { user } = render(<MockSignUpForm />)

      await testUtils.fillForm(user, {
        'full name': 'Test User',
        email: 'invalid-email',
        password: 'password123',
        'confirm password': 'password123',
      })

      const termsCheckbox = screen.getByLabelText(/terms and conditions/i)
      await user.click(termsCheckbox)

      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent(/valid email/i)
      })
    })

    it('validates password length', async () => {
      const { user } = render(<MockSignUpForm />)

      await testUtils.fillForm(user, {
        'full name': 'Test User',
        email: 'test@cabofitpass.com',
        password: '123',
        'confirm password': '123',
      })

      const termsCheckbox = screen.getByLabelText(/terms and conditions/i)
      await user.click(termsCheckbox)

      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent(/at least 8 characters/i)
      })
    })

    it('validates password confirmation', async () => {
      const { user } = render(<MockSignUpForm />)

      await testUtils.fillForm(user, {
        'full name': 'Test User',
        email: 'test@cabofitpass.com',
        password: 'password123',
        'confirm password': 'different123',
      })

      const termsCheckbox = screen.getByLabelText(/terms and conditions/i)
      await user.click(termsCheckbox)

      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        expect(screen.getByTestId('confirm-password-error')).toHaveTextContent(/passwords do not match/i)
      })
    })

    it('validates terms acceptance', async () => {
      const { user } = render(<MockSignUpForm />)

      await testUtils.fillForm(user, {
        'full name': 'Test User',
        email: 'test@cabofitpass.com',
        password: 'password123',
        'confirm password': 'password123',
      })

      // Don't check terms checkbox
      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        expect(screen.getByTestId('terms-error')).toHaveTextContent(/must agree/i)
      })
    })

    it('clears validation errors when fields are corrected', async () => {
      const { user } = render(<MockSignUpForm />)

      // Trigger validation error
      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        expect(screen.getByTestId('fullname-error')).toBeInTheDocument()
      })

      // Fix the error
      const nameInput = screen.getByLabelText(/full name/i)
      await user.type(nameInput, 'Test User')

      await testUtils.submitForm(user, 'create account')

      // Wait for the name error to be cleared
      await waitFor(() => {
        expect(screen.queryByTestId('fullname-error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    const validFormData = {
      'full name': 'Test User',
      email: 'test@cabofitpass.com',
      password: 'password123',
      'confirm password': 'password123',
    }

    it('submits valid form successfully', async () => {
      const onSuccess = jest.fn()
      const { user } = render(<MockSignUpForm onSuccess={onSuccess} />)

      await testUtils.fillForm(user, validFormData)

      const termsCheckbox = screen.getByLabelText(/terms and conditions/i)
      await user.click(termsCheckbox)

      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('shows loading state during submission', async () => {
      const { user } = render(<MockSignUpForm />)

      await testUtils.fillForm(user, validFormData)

      const termsCheckbox = screen.getByLabelText(/terms and conditions/i)
      await user.click(termsCheckbox)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('handles server errors', async () => {
      const { user } = render(<MockSignUpForm />)

      // Mock server error
      mockHandlers.overrideAuthError()

      await testUtils.fillForm(user, validFormData)

      const termsCheckbox = screen.getByLabelText(/terms and conditions/i)
      await user.click(termsCheckbox)

      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        expect(screen.getByTestId('general-error')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('associates errors with form fields', async () => {
      const { user } = render(<MockSignUpForm />)

      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i)
        const nameError = screen.getByTestId('fullname-error')
        
        expect(nameInput).toHaveAttribute('aria-describedby', 'fullName-error')
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
        expect(nameError).toHaveAttribute('role', 'alert')
      })
    })

    it('provides helpful descriptions', () => {
      render(<MockSignUpForm />)

      const passwordInput = screen.getByLabelText(/^password/i)
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-help')
      
      const helpText = screen.getByText(/password must be at least 8 characters/i)
      expect(helpText).toHaveAttribute('id', 'password-help')
    })

    it('supports keyboard navigation', async () => {
      const { user } = render(<MockSignUpForm />)

      // Should be able to tab through all form fields
      const formFields = [
        screen.getByLabelText(/full name/i),
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/^password/i),
        screen.getByLabelText(/confirm password/i),
        screen.getByLabelText(/terms and conditions/i),
        screen.getByRole('button', { name: /create account/i }),
      ]

      for (let i = 0; i < formFields.length; i++) {
        await user.tab()
        expect(formFields[i]).toHaveFocus()
      }
    })

    it('announces validation errors to screen readers', async () => {
      const { user } = render(<MockSignUpForm />)

      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert')
        expect(alerts.length).toBeGreaterThan(0)
        
        alerts.forEach(alert => {
          expect(alert).toBeInTheDocument()
        })
      })
    })
  })

  describe('User Experience', () => {
    it('prevents double submission', async () => {
      const { user } = render(<MockSignUpForm />)

      await testUtils.fillForm(user, {
        'full name': 'Test User',
        email: 'test@cabofitpass.com',
        password: 'password123',
        'confirm password': 'password123',
      })

      const termsCheckbox = screen.getByLabelText(/terms and conditions/i)
      await user.click(termsCheckbox)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      // First click
      await user.click(submitButton)
      expect(submitButton).toBeDisabled()

      // Second click should be ignored
      await user.click(submitButton)
      expect(submitButton).toBeDisabled()
    })

    it('provides clear visual feedback for validation states', async () => {
      const { user } = render(<MockSignUpForm />)

      // Trigger validation
      await testUtils.submitForm(user, 'create account')

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i)
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
        
        const errorMessage = screen.getByTestId('fullname-error')
        expect(errorMessage).toBeInTheDocument()
      })
    })
  })
})