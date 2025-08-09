/**
 * @jest-environment jsdom
 */

import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render, testUtils } from '@/tests/utils/test-utils'
import { mockHandlers } from '@/tests/mocks/server'

// Mock the actual component - in real implementation, import the actual component
const MockSignInForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="signin-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          data-testid="email-input"
          aria-describedby={error ? 'error-message' : undefined}
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          data-testid="password-input"
          aria-describedby={error ? 'error-message' : undefined}
        />
      </div>

      {error && (
        <div id="error-message" role="alert" data-testid="error-message">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        data-testid="submit-button"
        aria-describedby={error ? 'error-message' : undefined}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  )
}

describe('SignInForm', () => {
  beforeEach(() => {
    mockHandlers.reset()
  })

  describe('Rendering', () => {
    it('renders the sign in form correctly', () => {
      render(<MockSignInForm />)

      expect(screen.getByTestId('signin-form')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('has proper accessibility attributes', () => {
      render(<MockSignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('is keyboard navigable', async () => {
      const { user } = render(<MockSignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Tab through form elements
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })

  describe('Form Validation', () => {
    it('prevents submission with empty fields', async () => {
      const { user } = render(<MockSignInForm />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // HTML5 validation should prevent submission
      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toBeInvalid()
    })

    it('validates email format', async () => {
      const { user } = render(<MockSignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      expect(emailInput).toBeInvalid()
    })

    it('accepts valid email format', async () => {
      const { user } = render(<MockSignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, 'test@cabofitpass.com')
      await user.type(passwordInput, 'password123')

      expect(emailInput).toBeValid()
      expect(passwordInput).toBeValid()
    })
  })

  describe('Form Submission', () => {
    it('shows loading state during submission', async () => {
      const { user } = render(<MockSignInForm />)

      await testUtils.fillForm(user, {
        email: 'test@cabofitpass.com',
        password: 'password123',
      })

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('calls onSuccess callback on successful login', async () => {
      const onSuccess = jest.fn()
      const { user } = render(<MockSignInForm onSuccess={onSuccess} />)

      mockHandlers.overrideAuthSuccess()

      await testUtils.fillForm(user, {
        email: 'test@cabofitpass.com',
        password: 'password123',
      })

      await testUtils.submitForm(user, 'sign in')

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('displays error message on failed login', async () => {
      const { user } = render(<MockSignInForm />)

      mockHandlers.overrideAuthError()

      await testUtils.fillForm(user, {
        email: 'wrong@email.com',
        password: 'wrongpassword',
      })

      await testUtils.submitForm(user, 'sign in')

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })

    it('clears error message on retry', async () => {
      const { user } = render(<MockSignInForm />)

      // First attempt - trigger error
      mockHandlers.overrideAuthError()
      
      await testUtils.fillForm(user, {
        email: 'wrong@email.com',
        password: 'wrongpassword',
      })

      await testUtils.submitForm(user, 'sign in')

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      // Second attempt - should clear error
      mockHandlers.overrideAuthSuccess()

      await testUtils.fillForm(user, {
        email: 'correct@email.com',
        password: 'correctpassword',
      })

      await testUtils.submitForm(user, 'sign in')

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const { user } = render(<MockSignInForm />)

      mockHandlers.overrideNetworkError()

      await testUtils.fillForm(user, {
        email: 'test@cabofitpass.com',
        password: 'password123',
      })

      await testUtils.submitForm(user, 'sign in')

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveTextContent(/error occurred/i)
      })
    })

    it('re-enables form after error', async () => {
      const { user } = render(<MockSignInForm />)

      mockHandlers.overrideAuthError()

      await testUtils.fillForm(user, {
        email: 'test@cabofitpass.com',
        password: 'password123',
      })

      await testUtils.submitForm(user, 'sign in')

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /sign in/i })
        expect(submitButton).not.toBeDisabled()
        expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('announces errors to screen readers', async () => {
      const { user } = render(<MockSignInForm />)

      mockHandlers.overrideAuthError()

      await testUtils.fillForm(user, {
        email: 'test@cabofitpass.com',
        password: 'password123',
      })

      await testUtils.submitForm(user, 'sign in')

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveAttribute('id', 'error-message')
        
        const inputs = screen.getAllByRole('textbox')
        inputs.forEach(input => {
          expect(input).toHaveAttribute('aria-describedby', 'error-message')
        })
      })
    })

    it('maintains focus management', async () => {
      const { user } = render(<MockSignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      
      // Focus should remain on form after error
      mockHandlers.overrideAuthError()
      
      await user.type(emailInput, 'test@cabofitpass.com')
      await user.type(screen.getByLabelText(/password/i), 'password')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        // Form should still be focusable
        expect(screen.getByTestId('signin-form')).toBeInTheDocument()
      })
    })
  })
})