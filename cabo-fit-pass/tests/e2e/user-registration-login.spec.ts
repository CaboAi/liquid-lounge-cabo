/**
 * E2E Test: User Registration and Login Flow
 * 
 * This test suite covers the complete user registration and authentication journey
 * using Playwright for end-to-end testing.
 */

import { test, expect, type Page } from '@playwright/test'

// Test data
const testUser = {
  fullName: 'Maria Rodriguez',
  email: `test-user-${Date.now()}@cabofitpass.com`,
  password: 'SecureTest123!',
  phone: '+52 624 123 4567'
}

const existingUser = {
  email: 'existing@cabofitpass.com',
  password: 'ExistingUser123!'
}

// Helper functions
const fillSignUpForm = async (page: Page, userData: typeof testUser) => {
  await page.fill('[data-testid="fullname-input"]', userData.fullName)
  await page.fill('[data-testid="email-input"]', userData.email)
  await page.fill('[data-testid="password-input"]', userData.password)
  await page.fill('[data-testid="confirm-password-input"]', userData.password)
  await page.fill('[data-testid="phone-input"]', userData.phone)
  await page.check('[data-testid="terms-checkbox"]')
}

const fillSignInForm = async (page: Page, credentials: { email: string; password: string }) => {
  await page.fill('[data-testid="email-input"]', credentials.email)
  await page.fill('[data-testid="password-input"]', credentials.password)
}

const waitForNavigation = async (page: Page, expectedUrl: string) => {
  await page.waitForURL(expectedUrl, { waitUntil: 'networkidle' })
}

test.describe('User Registration and Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test.describe('User Registration', () => {
    test('should complete successful user registration', async ({ page }) => {
      // Navigate to registration page
      await page.click('[data-testid="signup-link"]')
      await waitForNavigation(page, '/auth/signup')

      // Verify registration form is displayed
      await expect(page.getByTestId('signup-form')).toBeVisible()
      await expect(page.locator('h1')).toContainText('Create Your Account')

      // Fill out registration form
      await fillSignUpForm(page, testUser)

      // Submit registration form
      await page.click('[data-testid="submit-button"]')

      // Verify loading state
      await expect(page.getByTestId('submit-button')).toBeDisabled()
      await expect(page.getByText(/creating account/i)).toBeVisible()

      // Wait for successful registration
      await expect(page.getByTestId('success-message')).toBeVisible()
      await expect(page.getByText(/account created successfully/i)).toBeVisible()
      await expect(page.getByText(/check your email/i)).toBeVisible()

      // Verify redirect to email verification page
      await waitForNavigation(page, '/auth/verify-email')
      await expect(page.locator('h1')).toContainText('Verify Your Email')
    })

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.click('[data-testid="signup-link"]')
      await waitForNavigation(page, '/auth/signup')

      // Try to submit empty form
      await page.click('[data-testid="submit-button"]')

      // Verify validation errors
      await expect(page.getByTestId('fullname-error')).toBeVisible()
      await expect(page.getByTestId('fullname-error')).toContainText(/required/i)
      
      await expect(page.getByTestId('email-error')).toBeVisible()
      await expect(page.getByTestId('password-error')).toBeVisible()

      // Fill invalid data
      await page.fill('[data-testid="fullname-input"]', 'A') // Too short
      await page.fill('[data-testid="email-input"]', 'invalid-email')
      await page.fill('[data-testid="password-input"]', '123') // Too short
      await page.fill('[data-testid="confirm-password-input"]', '456') // Doesn't match
      
      await page.click('[data-testid="submit-button"]')

      // Verify specific validation messages
      await expect(page.getByTestId('fullname-error')).toContainText(/at least 2 characters/i)
      await expect(page.getByTestId('email-error')).toContainText(/valid email/i)
      await expect(page.getByTestId('password-error')).toContainText(/at least 8 characters/i)
      await expect(page.getByTestId('confirm-password-error')).toContainText(/passwords do not match/i)
      
      // Terms checkbox validation
      await expect(page.getByTestId('terms-error')).toContainText(/must agree/i)
    })

    test('should handle existing email registration attempt', async ({ page }) => {
      await page.click('[data-testid="signup-link"]')
      await waitForNavigation(page, '/auth/signup')

      // Try to register with existing email
      await fillSignUpForm(page, { ...testUser, email: existingUser.email })
      await page.click('[data-testid="submit-button"]')

      // Verify error message for existing user
      await expect(page.getByTestId('general-error')).toBeVisible()
      await expect(page.getByTestId('general-error')).toContainText(/already exists/i)
      
      // Verify suggestion to sign in instead
      await expect(page.getByText(/already have an account/i)).toBeVisible()
      await expect(page.getByTestId('signin-link')).toBeVisible()
    })

    test('should validate password strength requirements', async ({ page }) => {
      await page.click('[data-testid="signup-link"]')
      await waitForNavigation(page, '/auth/signup')

      // Test weak password
      await page.fill('[data-testid="password-input"]', 'password')
      await page.blur('[data-testid="password-input"]')
      
      await expect(page.getByTestId('password-strength')).toContainText(/weak/i)
      await expect(page.getByTestId('password-error')).toContainText(/uppercase letter/i)

      // Test medium password
      await page.fill('[data-testid="password-input"]', 'Password123')
      await page.blur('[data-testid="password-input"]')
      
      await expect(page.getByTestId('password-strength')).toContainText(/medium/i)

      // Test strong password
      await page.fill('[data-testid="password-input"]', 'SecureP@ssw0rd!')
      await page.blur('[data-testid="password-input"]')
      
      await expect(page.getByTestId('password-strength')).toContainText(/strong/i)
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept and fail the signup API call
      await page.route('/api/auth/signup', route => {
        route.abort('failed')
      })

      await page.click('[data-testid="signup-link"]')
      await waitForNavigation(page, '/auth/signup')

      await fillSignUpForm(page, testUser)
      await page.click('[data-testid="submit-button"]')

      // Verify error handling
      await expect(page.getByTestId('general-error')).toBeVisible()
      await expect(page.getByTestId('general-error')).toContainText(/network error|failed to create/i)
      
      // Verify form is re-enabled
      await expect(page.getByTestId('submit-button')).not.toBeDisabled()
    })
  })

  test.describe('User Login', () => {
    test('should complete successful login', async ({ page }) => {
      // Navigate to login page
      await page.click('[data-testid="signin-link"]')
      await waitForNavigation(page, '/auth/signin')

      // Verify login form
      await expect(page.getByTestId('signin-form')).toBeVisible()
      await expect(page.locator('h1')).toContainText('Sign In')

      // Fill login form
      await fillSignInForm(page, existingUser)

      // Submit login
      await page.click('[data-testid="submit-button"]')

      // Verify loading state
      await expect(page.getByText(/signing in/i)).toBeVisible()
      await expect(page.getByTestId('submit-button')).toBeDisabled()

      // Verify successful login and redirect to dashboard
      await waitForNavigation(page, '/dashboard')
      await expect(page.locator('h1')).toContainText(/dashboard|welcome/i)
      
      // Verify user profile menu is available
      await expect(page.getByTestId('user-menu')).toBeVisible()
      await expect(page.getByTestId('user-menu')).toContainText(existingUser.email)
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.click('[data-testid="signin-link"]')
      await waitForNavigation(page, '/auth/signin')

      // Try invalid credentials
      await fillSignInForm(page, {
        email: 'wrong@email.com',
        password: 'wrongpassword'
      })

      await page.click('[data-testid="submit-button"]')

      // Verify error message
      await expect(page.getByTestId('error-message')).toBeVisible()
      await expect(page.getByTestId('error-message')).toContainText(/invalid credentials/i)
      
      // Verify form is re-enabled
      await expect(page.getByTestId('submit-button')).not.toBeDisabled()
    })

    test('should validate required login fields', async ({ page }) => {
      await page.click('[data-testid="signin-link"]')
      await waitForNavigation(page, '/auth/signin')

      // Submit empty form
      await page.click('[data-testid="submit-button"]')

      // Verify HTML5 validation prevents submission
      const emailInput = page.getByTestId('email-input')
      await expect(emailInput).toHaveAttribute('required')
      
      const passwordInput = page.getByTestId('password-input')
      await expect(passwordInput).toHaveAttribute('required')
    })

    test('should handle "remember me" functionality', async ({ page }) => {
      await page.click('[data-testid="signin-link"]')
      await waitForNavigation(page, '/auth/signin')

      // Check remember me option
      await page.check('[data-testid="remember-me-checkbox"]')

      await fillSignInForm(page, existingUser)
      await page.click('[data-testid="submit-button"]')

      // Verify successful login
      await waitForNavigation(page, '/dashboard')

      // Verify persistent session (check for longer-lived cookies or tokens)
      const cookies = await page.context().cookies()
      const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('token'))
      
      expect(sessionCookie).toBeDefined()
      // Should have extended expiration (more than 24 hours)
      if (sessionCookie?.expires) {
        const expirationTime = sessionCookie.expires * 1000 // Convert to milliseconds
        const now = Date.now()
        const dayInMs = 24 * 60 * 60 * 1000
        
        expect(expirationTime - now).toBeGreaterThan(dayInMs)
      }
    })

    test('should redirect to intended page after login', async ({ page }) => {
      // Try to access protected page without authentication
      await page.goto('/profile')
      
      // Should redirect to login with return URL
      await waitForNavigation(page, '/auth/signin?returnUrl=/profile')
      
      // Login
      await fillSignInForm(page, existingUser)
      await page.click('[data-testid="submit-button"]')
      
      // Should redirect back to intended page
      await waitForNavigation(page, '/profile')
      await expect(page.locator('h1')).toContainText(/profile/i)
    })
  })

  test.describe('Password Reset Flow', () => {
    test('should complete password reset request', async ({ page }) => {
      await page.click('[data-testid="signin-link"]')
      await waitForNavigation(page, '/auth/signin')

      // Click forgot password link
      await page.click('[data-testid="forgot-password-link"]')
      await waitForNavigation(page, '/auth/forgot-password')

      // Verify forgot password form
      await expect(page.locator('h1')).toContainText(/reset password/i)
      await expect(page.getByTestId('email-input')).toBeVisible()

      // Enter email
      await page.fill('[data-testid="email-input"]', existingUser.email)
      await page.click('[data-testid="submit-button"]')

      // Verify success message
      await expect(page.getByTestId('success-message')).toBeVisible()
      await expect(page.getByTestId('success-message')).toContainText(/email sent/i)
      
      // Verify instructions
      await expect(page.getByText(/check your inbox/i)).toBeVisible()
      await expect(page.getByTestId('back-to-signin-link')).toBeVisible()
    })

    test('should validate email for password reset', async ({ page }) => {
      await page.goto('/auth/forgot-password')

      // Submit without email
      await page.click('[data-testid="submit-button"]')
      
      const emailInput = page.getByTestId('email-input')
      await expect(emailInput).toHaveAttribute('required')

      // Submit with invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email')
      await page.click('[data-testid="submit-button"]')
      
      await expect(page.getByTestId('email-error')).toContainText(/valid email/i)
    })

    test('should handle password reset for non-existent email', async ({ page }) => {
      await page.goto('/auth/forgot-password')

      // Try with non-existent email
      await page.fill('[data-testid="email-input"]', 'nonexistent@example.com')
      await page.click('[data-testid="submit-button"]')

      // For security, should still show success message
      await expect(page.getByTestId('success-message')).toBeVisible()
      await expect(page.getByTestId('success-message')).toContainText(/email sent/i)
    })
  })

  test.describe('User Session Management', () => {
    test('should persist session across page reloads', async ({ page }) => {
      // Login first
      await page.click('[data-testid="signin-link"]')
      await waitForNavigation(page, '/auth/signin')
      await fillSignInForm(page, existingUser)
      await page.click('[data-testid="submit-button"]')
      await waitForNavigation(page, '/dashboard')

      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Should remain logged in
      await expect(page.getByTestId('user-menu')).toBeVisible()
      expect(page.url()).toContain('/dashboard')
    })

    test('should handle session expiration', async ({ page }) => {
      // Login first
      await page.click('[data-testid="signin-link"]')
      await waitForNavigation(page, '/auth/signin')
      await fillSignInForm(page, existingUser)
      await page.click('[data-testid="submit-button"]')
      await waitForNavigation(page, '/dashboard')

      // Simulate expired session by clearing cookies
      await page.context().clearCookies()

      // Try to access protected resource
      await page.goto('/profile')

      // Should redirect to login
      await waitForNavigation(page, '/auth/signin')
      await expect(page.getByTestId('session-expired-message')).toBeVisible()
    })

    test('should complete logout successfully', async ({ page }) => {
      // Login first
      await page.click('[data-testid="signin-link"]')
      await waitForNavigation(page, '/auth/signin')
      await fillSignInForm(page, existingUser)
      await page.click('[data-testid="submit-button"]')
      await waitForNavigation(page, '/dashboard')

      // Open user menu and logout
      await page.click('[data-testid="user-menu"]')
      await page.click('[data-testid="logout-button"]')

      // Should redirect to home page
      await waitForNavigation(page, '/')
      
      // Verify user is logged out
      await expect(page.getByTestId('signin-link')).toBeVisible()
      await expect(page.getByTestId('user-menu')).not.toBeVisible()

      // Verify cannot access protected pages
      await page.goto('/dashboard')
      await waitForNavigation(page, '/auth/signin')
    })
  })

  test.describe('Email Verification Flow', () => {
    test('should handle email verification', async ({ page }) => {
      // Simulate clicking email verification link
      const verificationToken = 'test-verification-token'
      await page.goto(`/auth/verify-email?token=${verificationToken}`)

      // Should show verification in progress
      await expect(page.getByTestId('verification-progress')).toBeVisible()
      await expect(page.getByText(/verifying/i)).toBeVisible()

      // After verification
      await expect(page.getByTestId('verification-success')).toBeVisible()
      await expect(page.getByText(/email verified successfully/i)).toBeVisible()
      
      // Should have option to continue to dashboard
      await expect(page.getByTestId('continue-to-dashboard')).toBeVisible()
      
      await page.click('[data-testid="continue-to-dashboard"]')
      await waitForNavigation(page, '/dashboard')
    })

    test('should handle invalid verification token', async ({ page }) => {
      await page.goto('/auth/verify-email?token=invalid-token')

      await expect(page.getByTestId('verification-error')).toBeVisible()
      await expect(page.getByText(/invalid.*verification/i)).toBeVisible()
      
      // Should provide option to resend verification email
      await expect(page.getByTestId('resend-verification')).toBeVisible()
    })

    test('should handle resend verification email', async ({ page }) => {
      await page.goto('/auth/verify-email')

      // Should show unverified state
      await expect(page.getByTestId('unverified-message')).toBeVisible()
      
      // Click resend verification
      await page.click('[data-testid="resend-verification"]')
      
      // Should show success message
      await expect(page.getByTestId('resend-success')).toBeVisible()
      await expect(page.getByText(/verification email sent/i)).toBeVisible()
    })
  })

  test.describe('Accessibility and UX', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.click('[data-testid="signin-link"]')
      await waitForNavigation(page, '/auth/signin')

      // Tab through form elements
      await page.keyboard.press('Tab') // Email input
      await expect(page.getByTestId('email-input')).toBeFocused()
      
      await page.keyboard.press('Tab') // Password input
      await expect(page.getByTestId('password-input')).toBeFocused()
      
      await page.keyboard.press('Tab') // Remember me checkbox
      await expect(page.getByTestId('remember-me-checkbox')).toBeFocused()
      
      await page.keyboard.press('Tab') // Submit button
      await expect(page.getByTestId('submit-button')).toBeFocused()
      
      await page.keyboard.press('Tab') // Forgot password link
      await expect(page.getByTestId('forgot-password-link')).toBeFocused()
    })

    test('should have proper ARIA attributes and labels', async ({ page }) => {
      await page.click('[data-testid="signup-link"]')
      await waitForNavigation(page, '/auth/signup')

      // Check form accessibility
      const form = page.getByTestId('signup-form')
      await expect(form).toHaveAttribute('novalidate')
      
      // Check input labels and ARIA attributes
      const emailInput = page.getByTestId('email-input')
      await expect(emailInput).toHaveAttribute('aria-required', 'true')
      await expect(emailInput).toHaveAttribute('type', 'email')
      
      const passwordInput = page.getByTestId('password-input')
      await expect(passwordInput).toHaveAttribute('aria-required', 'true')
      await expect(passwordInput).toHaveAttribute('aria-describedby')
      
      // Check terms checkbox
      const termsCheckbox = page.getByTestId('terms-checkbox')
      await expect(termsCheckbox).toHaveAttribute('required')
    })

    test('should announce errors to screen readers', async ({ page }) => {
      await page.click('[data-testid="signup-link"]')
      await waitForNavigation(page, '/auth/signup')

      // Trigger validation errors
      await page.click('[data-testid="submit-button"]')

      // Check error attributes
      const emailError = page.getByTestId('email-error')
      await expect(emailError).toHaveAttribute('role', 'alert')
      
      const passwordError = page.getByTestId('password-error')
      await expect(passwordError).toHaveAttribute('role', 'alert')
    })
  })
})