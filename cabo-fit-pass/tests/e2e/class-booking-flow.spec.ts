/**
 * E2E Test: Class Booking Flow
 * 
 * This test suite covers the complete class booking journey from browsing
 * classes to successful booking and booking management.
 */

import { test, expect, type Page } from '@playwright/test'

// Test data
const testUser = {
  email: 'booker@cabofitpass.com',
  password: 'BookerPass123!',
  credits: 10
}

const testClass = {
  id: 'class-morning-yoga-123',
  title: 'Morning Yoga Flow',
  instructor: 'Maria Rodriguez',
  startTime: '2024-02-15T08:00:00Z',
  duration: 60,
  creditsRequired: 1,
  capacity: 20,
  bookedCount: 5
}

// Helper functions
const loginUser = async (page: Page, credentials = testUser) => {
  await page.goto('/auth/signin')
  await page.fill('[data-testid="email-input"]', credentials.email)
  await page.fill('[data-testid="password-input"]', credentials.password)
  await page.click('[data-testid="submit-button"]')
  await page.waitForURL('/dashboard', { waitUntil: 'networkidle' })
}

const navigateToClasses = async (page: Page) => {
  await page.click('[data-testid="classes-nav-link"]')
  await page.waitForURL('/classes', { waitUntil: 'networkidle' })
}

const selectClass = async (page: Page, classTitle: string) => {
  await page.click(`[data-testid="class-card"][aria-label*="${classTitle}"]`)
}

const waitForBookingConfirmation = async (page: Page) => {
  await expect(page.getByTestId('booking-success-message')).toBeVisible()
  await expect(page.getByTestId('booking-confirmation-details')).toBeVisible()
}

test.describe('Class Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route('/api/classes', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              ...testClass,
              studio: {
                id: 'studio-1',
                name: 'Ocean View Fitness',
                address: 'Marina Boulevard, Los Cabos'
              }
            },
            {
              id: 'class-hiit-456',
              title: 'HIIT Cardio Blast',
              instructor: 'Carlos Mendez',
              startTime: '2024-02-15T18:00:00Z',
              duration: 45,
              creditsRequired: 2,
              capacity: 15,
              bookedCount: 12,
              studio: {
                id: 'studio-1',
                name: 'Ocean View Fitness'
              }
            }
          ],
          count: 2
        })
      })
    })

    await page.route('/api/credits', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user_id: 'test-user-id',
            balance: testUser.credits,
            total_purchased: 20,
            total_used: 10,
            expires_at: '2024-12-31T23:59:59Z'
          }
        })
      })
    })

    // Login before each test
    await loginUser(page)
  })

  test.describe('Class Discovery and Browsing', () => {
    test('should display available classes', async ({ page }) => {
      await navigateToClasses(page)

      // Verify classes page layout
      await expect(page.locator('h1')).toContainText(/classes|book a class/i)
      await expect(page.getByTestId('classes-grid')).toBeVisible()

      // Verify class cards are displayed
      await expect(page.getByTestId('class-card')).toHaveCount(2)
      
      // Verify first class details
      const firstClass = page.getByTestId('class-card').first()
      await expect(firstClass).toContainText(testClass.title)
      await expect(firstClass).toContainText(testClass.instructor)
      await expect(firstClass).toContainText('60 min')
      await expect(firstClass).toContainText('1 credit')
      
      // Verify availability status
      await expect(firstClass.getByTestId('availability-status')).toContainText('15 spots available')
    })

    test('should filter classes by category', async ({ page }) => {
      await navigateToClasses(page)

      // Apply category filter
      await page.click('[data-testid="filter-category"]')
      await page.click('[data-testid="category-yoga"]')

      // Verify filtered results
      await expect(page.getByTestId('class-card')).toHaveCount(1)
      await expect(page.getByTestId('class-card')).toContainText('Morning Yoga Flow')
      
      // Verify filter is active
      await expect(page.getByTestId('active-filters')).toContainText('Yoga')
    })

    test('should filter classes by time', async ({ page }) => {
      await navigateToClasses(page)

      // Apply time filter
      await page.click('[data-testid="filter-time"]')
      await page.click('[data-testid="time-morning"]')

      // Verify morning classes are shown
      await expect(page.getByTestId('class-card')).toContainText('Morning Yoga Flow')
      
      // Clear filter
      await page.click('[data-testid="clear-filters"]')
      await expect(page.getByTestId('class-card')).toHaveCount(2)
    })

    test('should search for classes', async ({ page }) => {
      await navigateToClasses(page)

      // Search for specific class
      await page.fill('[data-testid="search-input"]', 'yoga')
      await page.keyboard.press('Enter')

      // Verify search results
      await expect(page.getByTestId('class-card')).toHaveCount(1)
      await expect(page.getByTestId('class-card')).toContainText('Yoga')
      
      // Clear search
      await page.click('[data-testid="clear-search"]')
      await expect(page.getByTestId('class-card')).toHaveCount(2)
    })

    test('should display class details modal', async ({ page }) => {
      await navigateToClasses(page)

      // Click on class for details
      await selectClass(page, testClass.title)

      // Verify modal is displayed
      await expect(page.getByTestId('class-details-modal')).toBeVisible()
      await expect(page.getByTestId('modal-title')).toContainText(testClass.title)
      
      // Verify detailed information
      await expect(page.getByTestId('class-description')).toBeVisible()
      await expect(page.getByTestId('instructor-info')).toContainText(testClass.instructor)
      await expect(page.getByTestId('class-schedule')).toContainText('8:00 AM')
      await expect(page.getByTestId('studio-info')).toContainText('Ocean View Fitness')
      
      // Verify booking button is available
      await expect(page.getByTestId('book-class-button')).toBeVisible()
      await expect(page.getByTestId('book-class-button')).toContainText('Book Class (1 credit)')
    })
  })

  test.describe('Class Booking Process', () => {
    test('should complete successful class booking', async ({ page }) => {
      await navigateToClasses(page)
      await selectClass(page, testClass.title)

      // Mock successful booking API
      await page.route(`/api/classes/${testClass.id}/book`, route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            booking: {
              id: 'booking-123',
              class_id: testClass.id,
              user_id: 'test-user-id',
              status: 'confirmed',
              credits_used: testClass.creditsRequired,
              created_at: new Date().toISOString()
            },
            message: 'Class booked successfully',
            remaining_credits: testUser.credits - testClass.creditsRequired
          })
        })
      })

      // Book the class
      await page.click('[data-testid="book-class-button"]')

      // Verify booking confirmation
      await waitForBookingConfirmation(page)
      await expect(page.getByTestId('booking-success-message')).toContainText('Class booked successfully')
      
      // Verify booking details
      const confirmationDetails = page.getByTestId('booking-confirmation-details')
      await expect(confirmationDetails).toContainText(testClass.title)
      await expect(confirmationDetails).toContainText(testClass.instructor)
      await expect(confirmationDetails).toContainText('February 15')
      await expect(confirmationDetails).toContainText('8:00 AM')
      
      // Verify credit deduction
      await expect(page.getByTestId('credits-remaining')).toContainText(`${testUser.credits - 1} credits remaining`)
      
      // Verify calendar link
      await expect(page.getByTestId('add-to-calendar')).toBeVisible()
    })

    test('should prevent booking with insufficient credits', async ({ page }) => {
      // Mock user with insufficient credits
      await page.route('/api/credits', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              balance: 0,
              total_purchased: 5,
              total_used: 5,
              expires_at: '2024-12-31T23:59:59Z'
            }
          })
        })
      })

      await page.reload()
      await navigateToClasses(page)
      await selectClass(page, testClass.title)

      // Verify booking button is disabled
      const bookButton = page.getByTestId('book-class-button')
      await expect(bookButton).toBeDisabled()
      await expect(bookButton).toContainText(/need.*more credit/i)
      
      // Verify purchase credits suggestion
      await expect(page.getByTestId('purchase-credits-suggestion')).toBeVisible()
      await expect(page.getByTestId('purchase-credits-button')).toBeVisible()
    })

    test('should prevent booking full classes', async ({ page }) => {
      // Mock full class
      await page.route('/api/classes', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              ...testClass,
              bookedCount: testClass.capacity, // Full capacity
              studio: { id: 'studio-1', name: 'Ocean View Fitness' }
            }]
          })
        })
      })

      await page.reload()
      await navigateToClasses(page)
      await selectClass(page, testClass.title)

      // Verify booking is not available
      const bookButton = page.getByTestId('book-class-button')
      await expect(bookButton).toBeDisabled()
      await expect(bookButton).toContainText(/fully booked/i)
      
      // Verify waitlist option
      await expect(page.getByTestId('join-waitlist-button')).toBeVisible()
      await expect(page.getByTestId('waitlist-info')).toContainText(/join the waitlist/i)
    })

    test('should handle booking errors gracefully', async ({ page }) => {
      await navigateToClasses(page)
      await selectClass(page, testClass.title)

      // Mock booking failure
      await page.route(`/api/classes/${testClass.id}/book`, route => {
        route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Class is full',
            waitlist_position: 3
          })
        })
      })

      await page.click('[data-testid="book-class-button"]')

      // Verify error message
      await expect(page.getByTestId('booking-error')).toBeVisible()
      await expect(page.getByTestId('booking-error')).toContainText(/class is full/i)
      
      // Verify waitlist suggestion
      await expect(page.getByTestId('waitlist-suggestion')).toBeVisible()
      await expect(page.getByTestId('waitlist-suggestion')).toContainText('Position 3 on waitlist')
    })

    test('should show booking confirmation details', async ({ page }) => {
      await navigateToClasses(page)
      await selectClass(page, testClass.title)

      // Mock successful booking
      await page.route(`/api/classes/${testClass.id}/book`, route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            booking: {
              id: 'booking-456',
              class_id: testClass.id,
              user_id: 'test-user-id',
              status: 'confirmed',
              credits_used: 1,
              created_at: '2024-02-01T15:30:00Z'
            },
            message: 'Class booked successfully'
          })
        })
      })

      await page.click('[data-testid="book-class-button"]')

      // Verify comprehensive confirmation details
      const confirmation = page.getByTestId('booking-confirmation-details')
      await expect(confirmation).toContainText('Booking Confirmed')
      await expect(confirmation).toContainText('Booking ID: booking-456')
      await expect(confirmation).toContainText('Morning Yoga Flow')
      await expect(confirmation).toContainText('Maria Rodriguez')
      await expect(confirmation).toContainText('Ocean View Fitness')
      await expect(confirmation).toContainText('Marina Boulevard, Los Cabos')
      
      // Verify action buttons
      await expect(page.getByTestId('view-booking-details')).toBeVisible()
      await expect(page.getByTestId('add-to-calendar')).toBeVisible()
      await expect(page.getByTestId('book-another-class')).toBeVisible()
    })
  })

  test.describe('Booking Management', () => {
    test('should display user bookings', async ({ page }) => {
      // Mock user bookings
      await page.route('/api/bookings', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'booking-1',
                status: 'confirmed',
                credits_used: 1,
                created_at: '2024-02-01T15:30:00Z',
                class: {
                  id: testClass.id,
                  title: testClass.title,
                  instructor: testClass.instructor,
                  start_time: testClass.startTime,
                  duration: testClass.duration,
                  studio: {
                    id: 'studio-1',
                    name: 'Ocean View Fitness',
                    address: 'Marina Boulevard, Los Cabos'
                  }
                }
              }
            ],
            categorized: {
              upcoming: [{ /* booking data */ }],
              past: [],
              cancelled: []
            }
          })
        })
      })

      // Navigate to bookings
      await page.click('[data-testid="bookings-nav-link"]')
      await page.waitForURL('/bookings', { waitUntil: 'networkidle' })

      // Verify bookings page
      await expect(page.locator('h1')).toContainText(/my bookings/i)
      await expect(page.getByTestId('bookings-list')).toBeVisible()

      // Verify booking card
      const bookingCard = page.getByTestId('booking-card').first()
      await expect(bookingCard).toContainText(testClass.title)
      await expect(bookingCard).toContainText(testClass.instructor)
      await expect(bookingCard).toContainText('Ocean View Fitness')
      await expect(bookingCard).toContainText('Confirmed')
      
      // Verify booking actions
      await expect(bookingCard.getByTestId('view-details-button')).toBeVisible()
      await expect(bookingCard.getByTestId('cancel-booking-button')).toBeVisible()
    })

    test('should filter bookings by status', async ({ page }) => {
      await page.goto('/bookings')

      // Filter by upcoming
      await page.click('[data-testid="filter-upcoming"]')
      await expect(page.getByTestId('upcoming-bookings')).toBeVisible()
      
      // Filter by past
      await page.click('[data-testid="filter-past"]')
      await expect(page.getByTestId('past-bookings')).toBeVisible()
      
      // Filter by cancelled
      await page.click('[data-testid="filter-cancelled"]')
      await expect(page.getByTestId('cancelled-bookings')).toBeVisible()
    })

    test('should cancel booking successfully', async ({ page }) => {
      await page.goto('/bookings')

      // Mock successful cancellation
      await page.route('/api/classes/*/book', route => {
        if (route.request().method() === 'DELETE') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              message: 'Booking cancelled successfully',
              refund: {
                credits: 1,
                amount: 0
              }
            })
          })
        } else {
          route.continue()
        }
      })

      // Cancel booking
      await page.click('[data-testid="cancel-booking-button"]')

      // Verify cancellation confirmation modal
      await expect(page.getByTestId('cancel-confirmation-modal')).toBeVisible()
      await expect(page.getByText(/are you sure/i)).toBeVisible()
      await expect(page.getByText(/1 credit.*refunded/i)).toBeVisible()
      
      // Confirm cancellation
      await page.click('[data-testid="confirm-cancel-button"]')

      // Verify cancellation success
      await expect(page.getByTestId('cancellation-success')).toBeVisible()
      await expect(page.getByText(/booking cancelled/i)).toBeVisible()
      await expect(page.getByText(/1 credit.*returned/i)).toBeVisible()
    })

    test('should prevent late cancellation', async ({ page }) => {
      // Mock booking that cannot be cancelled (within 24 hours)
      await page.route('/api/bookings', route => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(10, 0, 0, 0) // 10 AM tomorrow (less than 24 hours)

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 'booking-1',
              status: 'confirmed',
              credits_used: 1,
              created_at: '2024-02-01T15:30:00Z',
              class: {
                id: testClass.id,
                title: testClass.title,
                start_time: tomorrow.toISOString(),
                duration: 60,
                instructor: testClass.instructor,
                studio: { name: 'Ocean View Fitness' }
              }
            }]
          })
        })
      })

      await page.goto('/bookings')

      // Verify cancel button is disabled
      const cancelButton = page.getByTestId('cancel-booking-button')
      await expect(cancelButton).toBeDisabled()
      
      // Verify tooltip/message
      await page.hover('[data-testid="cancel-booking-button"]')
      await expect(page.getByTestId('cancel-disabled-tooltip')).toBeVisible()
      await expect(page.getByTestId('cancel-disabled-tooltip')).toContainText(/24 hours/i)
    })

    test('should view detailed booking information', async ({ page }) => {
      await page.goto('/bookings')

      // Click view details
      await page.click('[data-testid="view-details-button"]')

      // Verify detailed booking modal
      await expect(page.getByTestId('booking-details-modal')).toBeVisible()
      
      // Verify comprehensive booking information
      const modal = page.getByTestId('booking-details-modal')
      await expect(modal).toContainText('Booking Details')
      await expect(modal).toContainText('Booking ID: booking-1')
      await expect(modal).toContainText(testClass.title)
      await expect(modal).toContainText(testClass.instructor)
      await expect(modal).toContainText('Ocean View Fitness')
      await expect(modal).toContainText('Confirmed')
      await expect(modal).toContainText('Credits Used: 1')
      
      // Verify action buttons in modal
      await expect(modal.getByTestId('add-to-calendar')).toBeVisible()
      await expect(modal.getByTestId('get-directions')).toBeVisible()
      await expect(modal.getByTestId('contact-studio')).toBeVisible()
    })
  })

  test.describe('Waitlist Management', () => {
    test('should join class waitlist', async ({ page }) => {
      // Mock full class
      await page.route('/api/classes', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              ...testClass,
              bookedCount: testClass.capacity,
              studio: { id: 'studio-1', name: 'Ocean View Fitness' }
            }]
          })
        })
      })

      // Mock waitlist join
      await page.route(`/api/classes/${testClass.id}/waitlist`, route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            waitlist_entry: {
              id: 'waitlist-1',
              class_id: testClass.id,
              user_id: 'test-user-id',
              position: 2,
              created_at: new Date().toISOString()
            },
            message: 'Added to waitlist successfully'
          })
        })
      })

      await navigateToClasses(page)
      await selectClass(page, testClass.title)

      // Join waitlist
      await page.click('[data-testid="join-waitlist-button"]')

      // Verify waitlist confirmation
      await expect(page.getByTestId('waitlist-success')).toBeVisible()
      await expect(page.getByText(/added to waitlist/i)).toBeVisible()
      await expect(page.getByText(/position 2/i)).toBeVisible()
      
      // Verify notification settings
      await expect(page.getByTestId('waitlist-notifications')).toBeVisible()
      await expect(page.getByText(/notify.*spot opens/i)).toBeVisible()
    })

    test('should leave waitlist', async ({ page }) => {
      // Mock user already on waitlist
      await page.route(`/api/classes/${testClass.id}/waitlist`, route => {
        if (route.request().method() === 'DELETE') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              message: 'Removed from waitlist successfully'
            })
          })
        } else {
          route.continue()
        }
      })

      await navigateToClasses(page)
      await selectClass(page, testClass.title)

      // Assume user is already on waitlist
      await expect(page.getByTestId('leave-waitlist-button')).toBeVisible()
      await page.click('[data-testid="leave-waitlist-button"]')

      // Verify removal confirmation
      await expect(page.getByTestId('waitlist-removed')).toBeVisible()
      await expect(page.getByText(/removed from waitlist/i)).toBeVisible()
      
      // Verify join waitlist button is available again
      await expect(page.getByTestId('join-waitlist-button')).toBeVisible()
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE

      await navigateToClasses(page)

      // Verify mobile layout
      await expect(page.getByTestId('mobile-filter-toggle')).toBeVisible()
      await expect(page.getByTestId('classes-grid')).toHaveCSS('grid-template-columns', '1fr')

      // Test mobile booking flow
      await selectClass(page, testClass.title)
      await expect(page.getByTestId('class-details-modal')).toBeVisible()
      
      // Verify mobile booking button
      const bookButton = page.getByTestId('book-class-button')
      await expect(bookButton).toBeVisible()
      
      // Mobile sticky footer for booking
      await expect(page.getByTestId('mobile-booking-footer')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await navigateToClasses(page)

      // Tab through class cards
      await page.keyboard.press('Tab')
      const firstCard = page.getByTestId('class-card').first()
      await expect(firstCard).toBeFocused()

      // Enter to open details
      await page.keyboard.press('Enter')
      await expect(page.getByTestId('class-details-modal')).toBeVisible()

      // Tab to booking button
      await page.keyboard.press('Tab')
      await expect(page.getByTestId('book-class-button')).toBeFocused()
    })

    test('should have proper ARIA attributes', async ({ page }) => {
      await navigateToClasses(page)

      // Check class cards
      const classCard = page.getByTestId('class-card').first()
      await expect(classCard).toHaveAttribute('role', 'article')
      await expect(classCard).toHaveAttribute('aria-labelledby')

      // Check modal accessibility
      await selectClass(page, testClass.title)
      const modal = page.getByTestId('class-details-modal')
      await expect(modal).toHaveAttribute('role', 'dialog')
      await expect(modal).toHaveAttribute('aria-modal', 'true')
      await expect(modal).toHaveAttribute('aria-labelledby')
    })

    test('should announce booking status changes', async ({ page }) => {
      await navigateToClasses(page)
      await selectClass(page, testClass.title)

      // Mock successful booking
      await page.route(`/api/classes/${testClass.id}/book`, route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            booking: { id: 'booking-123', status: 'confirmed', credits_used: 1 },
            message: 'Class booked successfully'
          })
        })
      })

      await page.click('[data-testid="book-class-button"]')

      // Verify announcement
      const successMessage = page.getByTestId('booking-success-message')
      await expect(successMessage).toHaveAttribute('role', 'alert')
      await expect(successMessage).toHaveAttribute('aria-live', 'assertive')
    })
  })
})