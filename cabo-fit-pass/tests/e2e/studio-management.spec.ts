/**
 * E2E Test: Studio Management Workflow
 * 
 * This test suite covers the complete studio management journey from
 * studio dashboard to class management and analytics.
 */

import { test, expect, type Page } from '@playwright/test'

// Test data
const studioOwner = {
  email: 'owner@oceanviewfitness.com',
  password: 'StudioOwner123!',
  role: 'studio_owner'
}

const testStudio = {
  id: 'studio-oceanview-123',
  name: 'Ocean View Fitness',
  description: 'Premium fitness studio with ocean views',
  address: 'Marina Boulevard, Los Cabos, Mexico',
  phone: '+52 624 123 4567',
  email: 'info@oceanviewfitness.com',
  capacity: 25,
  rating: 4.8
}

const testClass = {
  id: 'class-morning-yoga-456',
  title: 'Morning Yoga Flow',
  description: 'Start your day with energizing yoga',
  instructor: 'Maria Rodriguez',
  category: 'Yoga',
  duration: 60,
  capacity: 20,
  creditsRequired: 1,
  startTime: '2024-02-15T08:00:00Z',
  endTime: '2024-02-15T09:00:00Z',
  recurring: 'weekly'
}

// Helper functions
const loginStudioOwner = async (page: Page) => {
  await page.goto('/auth/signin')
  await page.fill('[data-testid="email-input"]', studioOwner.email)
  await page.fill('[data-testid="password-input"]', studioOwner.password)
  await page.click('[data-testid="submit-button"]')
  await page.waitForURL('/studio/dashboard', { waitUntil: 'networkidle' })
}

const navigateToClassManagement = async (page: Page) => {
  await page.click('[data-testid="manage-classes-link"]')
  await page.waitForURL('/studio/classes', { waitUntil: 'networkidle' })
}

const fillClassForm = async (page: Page, classData: typeof testClass) => {
  await page.fill('[data-testid="class-title-input"]', classData.title)
  await page.fill('[data-testid="class-description-input"]', classData.description)
  await page.selectOption('[data-testid="instructor-select"]', classData.instructor)
  await page.selectOption('[data-testid="category-select"]', classData.category)
  await page.fill('[data-testid="duration-input"]', classData.duration.toString())
  await page.fill('[data-testid="capacity-input"]', classData.capacity.toString())
  await page.fill('[data-testid="credits-input"]', classData.creditsRequired.toString())
  await page.fill('[data-testid="start-date-input"]', '2024-02-15')
  await page.fill('[data-testid="start-time-input"]', '08:00')
}

test.describe('Studio Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock studio API responses
    await page.route('/api/studios/*/dashboard', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            studio: testStudio,
            analytics: {
              revenue: {
                total: 5000,
                thisMonth: 1200,
                lastMonth: 1000,
                growth: 20
              },
              bookings: {
                total: 150,
                thisMonth: 35,
                lastMonth: 30,
                growth: 16.7
              },
              classes: {
                total: 25,
                active: 20,
                upcoming: 10
              },
              members: {
                total: 85,
                active: 60,
                new: 8
              }
            }
          }
        })
      })
    })

    await page.route('/api/studios/*/classes', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              ...testClass,
              bookedCount: 15,
              status: 'active'
            }
          ],
          count: 1
        })
      })
    })

    // Login as studio owner
    await loginStudioOwner(page)
  })

  test.describe('Studio Dashboard', () => {
    test('should display studio dashboard with analytics', async ({ page }) => {
      // Verify dashboard layout
      await expect(page.locator('h1')).toContainText(testStudio.name)
      await expect(page.getByTestId('studio-dashboard')).toBeVisible()

      // Verify key metrics cards
      await expect(page.getByTestId('revenue-metric')).toBeVisible()
      await expect(page.getByTestId('revenue-total')).toContainText('$5,000')
      await expect(page.getByTestId('revenue-growth')).toContainText('+20.0%')

      await expect(page.getByTestId('bookings-metric')).toBeVisible()
      await expect(page.getByTestId('bookings-total')).toContainText('150')
      await expect(page.getByTestId('bookings-growth')).toContainText('+16.7%')

      await expect(page.getByTestId('classes-metric')).toBeVisible()
      await expect(page.getByTestId('classes-total')).toContainText('25')
      await expect(page.getByTestId('classes-active')).toContainText('20')

      await expect(page.getByTestId('members-metric')).toBeVisible()
      await expect(page.getByTestId('members-total')).toContainText('85')
      await expect(page.getByTestId('members-new')).toContainText('8')
    })

    test('should display quick action buttons', async ({ page }) => {
      // Verify quick action cards
      await expect(page.getByTestId('add-class-action')).toBeVisible()
      await expect(page.getByTestId('manage-schedule-action')).toBeVisible()
      await expect(page.getByTestId('view-bookings-action')).toBeVisible()
      await expect(page.getByTestId('studio-settings-action')).toBeVisible()

      // Test quick action navigation
      await page.click('[data-testid="add-class-action"]')
      await page.waitForURL('/studio/classes/new', { waitUntil: 'networkidle' })
    })

    test('should show recent activity feed', async ({ page }) => {
      await expect(page.getByTestId('recent-activity')).toBeVisible()
      await expect(page.getByTestId('activity-list')).toBeVisible()
      
      // Verify activity items
      const activityItems = page.getByTestId('activity-item')
      await expect(activityItems).toHaveCount(3) // Based on mock data
      
      const firstActivity = activityItems.first()
      await expect(firstActivity).toContainText(/new booking/i)
      await expect(firstActivity.getByTestId('activity-time')).toContainText(/minutes ago|hour ago/i)
    })

    test('should handle empty or error states', async ({ page }) => {
      // Mock error response
      await page.route('/api/studios/*/dashboard', route => {
        route.fulfill({ status: 500, body: 'Server Error' })
      })

      await page.reload()

      // Verify error state
      await expect(page.getByTestId('dashboard-error')).toBeVisible()
      await expect(page.getByTestId('error-retry-button')).toBeVisible()
    })
  })

  test.describe('Class Management', () => {
    test('should display class management interface', async ({ page }) => {
      await navigateToClassManagement(page)

      // Verify class management page
      await expect(page.locator('h1')).toContainText(/manage classes/i)
      await expect(page.getByTestId('classes-table')).toBeVisible()
      
      // Verify add class button
      await expect(page.getByTestId('add-class-button')).toBeVisible()
      
      // Verify class filters
      await expect(page.getByTestId('filter-status')).toBeVisible()
      await expect(page.getByTestId('filter-category')).toBeVisible()
      await expect(page.getByTestId('search-classes')).toBeVisible()
    })

    test('should create new class successfully', async ({ page }) => {
      await navigateToClassManagement(page)
      
      // Mock successful class creation
      await page.route('/api/classes', route => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              class: {
                ...testClass,
                id: 'new-class-789',
                createdAt: new Date().toISOString()
              },
              message: 'Class created successfully'
            })
          })
        } else {
          route.continue()
        }
      })

      // Click add class button
      await page.click('[data-testid="add-class-button"]')
      await page.waitForURL('/studio/classes/new')

      // Verify class creation form
      await expect(page.getByTestId('class-form')).toBeVisible()
      await expect(page.locator('h1')).toContainText(/add new class/i)

      // Fill out class form
      await fillClassForm(page, testClass)

      // Set recurring schedule
      await page.check('[data-testid="recurring-checkbox"]')
      await page.selectOption('[data-testid="recurring-frequency"]', 'weekly')
      await page.fill('[data-testid="recurring-end-date"]', '2024-05-15')

      // Submit form
      await page.click('[data-testid="create-class-button"]')

      // Verify success message
      await expect(page.getByTestId('class-created-success')).toBeVisible()
      await expect(page.getByText(/class created successfully/i)).toBeVisible()

      // Should redirect to class management
      await page.waitForURL('/studio/classes')
      
      // Verify new class appears in the list
      await expect(page.getByTestId('classes-table')).toContainText(testClass.title)
    })

    test('should validate class form inputs', async ({ page }) => {
      await page.goto('/studio/classes/new')

      // Submit empty form
      await page.click('[data-testid="create-class-button"]')

      // Verify validation errors
      await expect(page.getByTestId('title-error')).toContainText(/required/i)
      await expect(page.getByTestId('instructor-error')).toContainText(/required/i)
      await expect(page.getByTestId('category-error')).toContainText(/required/i)
      
      // Fill invalid data
      await page.fill('[data-testid="class-title-input"]', 'A') // Too short
      await page.fill('[data-testid="duration-input"]', '0') // Invalid duration
      await page.fill('[data-testid="capacity-input"]', '-5') // Invalid capacity
      await page.fill('[data-testid="credits-input"]', '0') // Invalid credits

      await page.click('[data-testid="create-class-button"]')

      // Verify specific validation messages
      await expect(page.getByTestId('title-error')).toContainText(/at least 3 characters/i)
      await expect(page.getByTestId('duration-error')).toContainText(/greater than 0/i)
      await expect(page.getByTestId('capacity-error')).toContainText(/at least 1/i)
      await expect(page.getByTestId('credits-error')).toContainText(/at least 1/i)
    })

    test('should edit existing class', async ({ page }) => {
      await navigateToClassManagement(page)

      // Mock class update
      await page.route(`/api/classes/${testClass.id}`, route => {
        if (route.request().method() === 'PUT') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              class: { ...testClass, title: 'Updated Yoga Flow' },
              message: 'Class updated successfully'
            })
          })
        } else {
          route.continue()
        }
      })

      // Click edit button for first class
      await page.click('[data-testid="edit-class-button"]')
      await page.waitForURL(`/studio/classes/${testClass.id}/edit`)

      // Verify form is pre-filled
      await expect(page.getByTestId('class-title-input')).toHaveValue(testClass.title)
      await expect(page.getByTestId('class-description-input')).toHaveValue(testClass.description)

      // Update class title
      await page.fill('[data-testid="class-title-input"]', 'Updated Yoga Flow')

      // Submit changes
      await page.click('[data-testid="update-class-button"]')

      // Verify success
      await expect(page.getByTestId('class-updated-success')).toBeVisible()
      await page.waitForURL('/studio/classes')
    })

    test('should cancel/delete class with confirmation', async ({ page }) => {
      await navigateToClassManagement(page)

      // Mock class deletion
      await page.route(`/api/classes/${testClass.id}`, route => {
        if (route.request().method() === 'DELETE') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              message: 'Class cancelled successfully',
              refunds_processed: 15,
              notifications_sent: 15
            })
          })
        } else {
          route.continue()
        }
      })

      // Click delete button
      await page.click('[data-testid="delete-class-button"]')

      // Verify confirmation modal
      await expect(page.getByTestId('delete-confirmation-modal')).toBeVisible()
      await expect(page.getByText(/are you sure/i)).toBeVisible()
      await expect(page.getByText(/15 existing bookings/i)).toBeVisible()
      await expect(page.getByText(/refund.*credits/i)).toBeVisible()

      // Confirm deletion
      await page.click('[data-testid="confirm-delete-button"]')

      // Verify deletion success
      await expect(page.getByTestId('class-deleted-success')).toBeVisible()
      await expect(page.getByText(/class cancelled.*15 users notified/i)).toBeVisible()
    })

    test('should manage class bookings', async ({ page }) => {
      await navigateToClassManagement(page)

      // Mock class bookings
      await page.route(`/api/classes/${testClass.id}/bookings`, route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'booking-1',
                user: { name: 'Maria Rodriguez', email: 'maria@example.com' },
                status: 'confirmed',
                creditsUsed: 1,
                createdAt: '2024-02-01T15:30:00Z'
              }
            ],
            count: 1,
            capacity: testClass.capacity,
            waitlist: []
          })
        })
      })

      // Click view bookings button
      await page.click('[data-testid="view-bookings-button"]')

      // Verify bookings modal/page
      await expect(page.getByTestId('class-bookings-modal')).toBeVisible()
      await expect(page.getByTestId('bookings-list')).toBeVisible()
      
      // Verify booking details
      const booking = page.getByTestId('booking-item').first()
      await expect(booking).toContainText('Maria Rodriguez')
      await expect(booking).toContainText('maria@example.com')
      await expect(booking).toContainText('Confirmed')
      
      // Verify capacity info
      await expect(page.getByTestId('capacity-info')).toContainText('15/20 booked')
      await expect(page.getByTestId('spots-remaining')).toContainText('5 spots remaining')
    })

    test('should filter and search classes', async ({ page }) => {
      await navigateToClassManagement(page)

      // Filter by category
      await page.selectOption('[data-testid="filter-category"]', 'Yoga')
      await expect(page.getByTestId('classes-table')).toContainText('Morning Yoga Flow')

      // Filter by status
      await page.selectOption('[data-testid="filter-status"]', 'active')
      
      // Search classes
      await page.fill('[data-testid="search-classes"]', 'yoga')
      await page.keyboard.press('Enter')
      
      // Verify filtered results
      await expect(page.getByTestId('classes-table')).toContainText('Morning Yoga Flow')
      await expect(page.getByTestId('results-count')).toContainText('1 class found')
    })
  })

  test.describe('Analytics and Reporting', () => {
    test('should display detailed analytics', async ({ page }) => {
      // Navigate to analytics
      await page.click('[data-testid="view-analytics-button"]')
      await page.waitForURL('/studio/analytics')

      // Mock analytics data
      await page.route('/api/analytics/studio/*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              revenue: {
                daily: [100, 120, 80, 150, 200, 180, 160],
                monthly: [3000, 3500, 4000, 4500, 5000],
                total: 20000
              },
              bookings: {
                byClass: [
                  { name: 'Morning Yoga', bookings: 45 },
                  { name: 'HIIT Cardio', bookings: 38 },
                  { name: 'Pilates', bookings: 32 }
                ],
                trends: [20, 25, 30, 35, 40, 38, 42]
              },
              members: {
                retention: 85,
                newMembers: [5, 8, 12, 15, 18, 22, 25],
                demographics: {
                  ageGroups: { '20-30': 35, '31-40': 28, '41-50': 22, '51+': 15 }
                }
              }
            }
          })
        })
      })

      await page.reload()

      // Verify analytics dashboard
      await expect(page.locator('h1')).toContainText(/analytics/i)
      
      // Verify revenue chart
      await expect(page.getByTestId('revenue-chart')).toBeVisible()
      await expect(page.getByTestId('revenue-trend')).toBeVisible()
      
      // Verify bookings analytics
      await expect(page.getByTestId('bookings-chart')).toBeVisible()
      await expect(page.getByTestId('popular-classes-chart')).toBeVisible()
      
      // Verify member analytics
      await expect(page.getByTestId('member-retention')).toContainText('85%')
      await expect(page.getByTestId('demographics-chart')).toBeVisible()
    })

    test('should generate reports', async ({ page }) => {
      await page.goto('/studio/analytics')

      // Mock report generation
      await page.route('/api/reports/generate', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reportId: 'report-123',
            downloadUrl: '/api/reports/report-123.pdf',
            message: 'Report generated successfully'
          })
        })
      })

      // Generate monthly report
      await page.click('[data-testid="generate-report-button"]')
      
      // Select report options
      await page.selectOption('[data-testid="report-type"]', 'monthly')
      await page.selectOption('[data-testid="report-month"]', '2024-01')
      await page.check('[data-testid="include-revenue"]')
      await page.check('[data-testid="include-bookings"]')
      
      await page.click('[data-testid="create-report-button"]')

      // Verify report generation
      await expect(page.getByTestId('report-success')).toBeVisible()
      await expect(page.getByText(/report generated/i)).toBeVisible()
      await expect(page.getByTestId('download-report-button')).toBeVisible()
    })

    test('should export data', async ({ page }) => {
      await page.goto('/studio/analytics')

      // Mock data export
      await page.route('/api/export/*', route => {
        route.fulfill({
          status: 200,
          contentType: 'text/csv',
          body: 'Date,Revenue,Bookings\n2024-01-01,150,12\n2024-01-02,180,15'
        })
      })

      // Start download for bookings data
      const downloadPromise = page.waitForEvent('download')
      await page.click('[data-testid="export-bookings-button"]')
      
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/bookings.*\.csv/)
    })
  })

  test.describe('Studio Settings', () => {
    test('should update studio information', async ({ page }) => {
      await page.click('[data-testid="studio-settings-action"]')
      await page.waitForURL('/studio/settings')

      // Mock studio update
      await page.route(`/api/studios/${testStudio.id}`, route => {
        if (route.request().method() === 'PUT') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              studio: { ...testStudio, description: 'Updated description' },
              message: 'Studio updated successfully'
            })
          })
        } else {
          route.continue()
        }
      })

      // Verify settings form
      await expect(page.getByTestId('studio-settings-form')).toBeVisible()
      
      // Update studio description
      await page.fill('[data-testid="studio-description"]', 'Updated premium fitness studio')
      
      // Update contact information
      await page.fill('[data-testid="studio-phone"]', '+52 624 987 6543')
      
      // Submit changes
      await page.click('[data-testid="save-settings-button"]')

      // Verify success
      await expect(page.getByTestId('settings-saved-success')).toBeVisible()
    })

    test('should manage studio hours', async ({ page }) => {
      await page.goto('/studio/settings')

      // Navigate to hours settings
      await page.click('[data-testid="hours-settings-tab"]')

      // Update business hours
      await page.fill('[data-testid="monday-open"]', '06:00')
      await page.fill('[data-testid="monday-close"]', '22:00')
      
      // Set holiday hours
      await page.click('[data-testid="add-holiday-hours"]')
      await page.fill('[data-testid="holiday-date"]', '2024-12-25')
      await page.check('[data-testid="holiday-closed"]')
      
      await page.click('[data-testid="save-hours-button"]')
      
      // Verify success
      await expect(page.getByTestId('hours-saved-success')).toBeVisible()
    })

    test('should configure payment settings', async ({ page }) => {
      await page.goto('/studio/settings')
      await page.click('[data-testid="payment-settings-tab"]')

      // Update pricing
      await page.fill('[data-testid="credit-price"]', '15')
      await page.fill('[data-testid="membership-price"]', '99')
      
      // Configure payment methods
      await page.check('[data-testid="accept-cards"]')
      await page.check('[data-testid="accept-cash"]')
      
      // Set cancellation policy
      await page.fill('[data-testid="cancellation-hours"]', '24')
      await page.selectOption('[data-testid="refund-policy"]', 'full')
      
      await page.click('[data-testid="save-payment-settings"]')
      
      await expect(page.getByTestId('payment-settings-saved')).toBeVisible()
    })
  })

  test.describe('Staff Management', () => {
    test('should manage studio staff', async ({ page }) => {
      await page.goto('/studio/staff')

      // Mock staff data
      await page.route('/api/studio/staff', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'staff-1',
                name: 'Maria Rodriguez',
                email: 'maria@oceanviewfitness.com',
                role: 'instructor',
                specialties: ['Yoga', 'Pilates'],
                status: 'active'
              }
            ]
          })
        })
      })

      await page.reload()

      // Verify staff list
      await expect(page.getByTestId('staff-list')).toBeVisible()
      await expect(page.getByTestId('staff-member')).toContainText('Maria Rodriguez')
      
      // Add new instructor
      await page.click('[data-testid="add-instructor-button"]')
      
      // Fill instructor form
      await page.fill('[data-testid="instructor-name"]', 'Carlos Mendez')
      await page.fill('[data-testid="instructor-email"]', 'carlos@oceanviewfitness.com')
      await page.selectOption('[data-testid="instructor-specialties"]', ['HIIT', 'CrossFit'])
      
      // Mock instructor creation
      await page.route('/api/studio/staff', route => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              staff: {
                id: 'staff-2',
                name: 'Carlos Mendez',
                email: 'carlos@oceanviewfitness.com',
                role: 'instructor',
                specialties: ['HIIT', 'CrossFit'],
                status: 'active'
              }
            })
          })
        } else {
          route.continue()
        }
      })
      
      await page.click('[data-testid="save-instructor-button"]')
      
      await expect(page.getByTestId('instructor-added-success')).toBeVisible()
    })
  })

  test.describe('Mobile and Accessibility', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Verify mobile studio dashboard
      await expect(page.getByTestId('mobile-menu-toggle')).toBeVisible()
      await expect(page.getByTestId('metrics-grid')).toHaveCSS('grid-template-columns', '1fr')

      // Test mobile navigation
      await page.click('[data-testid="mobile-menu-toggle"]')
      await expect(page.getByTestId('mobile-nav-menu')).toBeVisible()
    })

    test('should be keyboard navigable', async ({ page }) => {
      // Tab through dashboard elements
      await page.keyboard.press('Tab')
      await expect(page.getByTestId('add-class-action')).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.getByTestId('manage-schedule-action')).toBeFocused()
    })

    test('should have proper ARIA attributes', async ({ page }) => {
      // Check dashboard accessibility
      const dashboard = page.getByTestId('studio-dashboard')
      await expect(dashboard).toHaveAttribute('role', 'main')

      // Check metric cards
      const revenueMetric = page.getByTestId('revenue-metric')
      await expect(revenueMetric).toHaveAttribute('role', 'gridcell')
      await expect(revenueMetric).toHaveAttribute('aria-labelledby')
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle API failures gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('/api/studios/*/dashboard', route => {
        route.fulfill({ status: 500, body: 'Server Error' })
      })

      await page.reload()

      // Verify error handling
      await expect(page.getByTestId('dashboard-error')).toBeVisible()
      await expect(page.getByTestId('retry-button')).toBeVisible()

      // Test retry functionality
      await page.route('/api/studios/*/dashboard', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { studio: testStudio, analytics: {} } })
        })
      })

      await page.click('[data-testid="retry-button"]')
      await expect(page.getByTestId('studio-dashboard')).toBeVisible()
    })

    test('should handle empty states', async ({ page }) => {
      // Mock empty classes response
      await page.route('/api/studios/*/classes', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], count: 0 })
        })
      })

      await navigateToClassManagement(page)

      // Verify empty state
      await expect(page.getByTestId('empty-classes-state')).toBeVisible()
      await expect(page.getByText(/no classes yet/i)).toBeVisible()
      await expect(page.getByTestId('create-first-class-button')).toBeVisible()
    })

    test('should validate business rules', async ({ page }) => {
      await navigateToClassManagement(page)
      await page.click('[data-testid="add-class-button"]')

      // Try to create class in the past
      await fillClassForm(page, testClass)
      await page.fill('[data-testid="start-date-input"]', '2023-01-01')
      
      await page.click('[data-testid="create-class-button"]')
      
      await expect(page.getByTestId('date-error')).toContainText(/cannot be in the past/i)
    })
  })
})