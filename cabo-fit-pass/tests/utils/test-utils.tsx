/**
 * Test utilities and custom render function
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'

// Mock providers for testing
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="auth-provider">{children}</div>
}

const MockSupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="supabase-provider">{children}</div>
}

// Create a custom render function that includes all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Additional options for testing
  user?: any
  queryClient?: QueryClient
  theme?: 'light' | 'dark' | 'system'
}

export function renderWithProviders(
  ui: ReactElement,
  {
    user = null,
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
    theme = 'light',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme={theme}>
          <MockSupabaseProvider>
            <MockAuthProvider>
              {children}
            </MockAuthProvider>
          </MockSupabaseProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }

  const user_ = userEvent.setup()
  
  return {
    user: user_,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Custom render for components that don't need providers
export function renderComponent(ui: ReactElement, options?: RenderOptions) {
  const user = userEvent.setup()
  return {
    user,
    ...render(ui, options),
  }
}

// Utility functions for common testing patterns
export const testUtils = {
  // Wait for element to appear
  async waitForElement(testId: string, timeout = 5000) {
    return await waitFor(
      () => {
        const element = screen.getByTestId(testId)
        expect(element).toBeInTheDocument()
        return element
      },
      { timeout }
    )
  },

  // Wait for element to disappear
  async waitForElementToDisappear(testId: string, timeout = 5000) {
    return await waitFor(
      () => {
        expect(screen.queryByTestId(testId)).not.toBeInTheDocument()
      },
      { timeout }
    )
  },

  // Fill form fields
  async fillForm(user: any, fields: Record<string, string>) {
    for (const [name, value] of Object.entries(fields)) {
      const field = screen.getByRole('textbox', { name: new RegExp(name, 'i') }) ||
                   screen.getByLabelText(new RegExp(name, 'i'))
      await user.clear(field)
      await user.type(field, value)
    }
  },

  // Submit form
  async submitForm(user: any, formName?: string) {
    const submitButton = formName 
      ? screen.getByRole('button', { name: new RegExp(formName, 'i') })
      : screen.getByRole('button', { name: /submit|save|create|sign|book/i })
    
    await user.click(submitButton)
  },

  // Mock API responses
  mockApiSuccess: (data: any) => {
    return Promise.resolve({ data, status: 200, ok: true })
  },

  mockApiError: (error: string, status = 400) => {
    return Promise.reject({ error, status })
  },

  // Generate mock data
  generateMockUser: (overrides = {}) => ({
    id: 'user-123',
    email: 'test@cabofitpass.com',
    name: 'Test User',
    phone: '+52-624-123-4567',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  generateMockClass: (overrides = {}) => ({
    id: 'class-123',
    title: 'Test Class',
    description: 'A test fitness class',
    instructor: 'Test Instructor',
    start_time: '2024-01-15T10:00:00Z',
    duration: 60,
    capacity: 20,
    booked_count: 5,
    credits_required: 1,
    studio_id: 'studio-123',
    category: 'fitness',
    ...overrides,
  }),

  generateMockStudio: (overrides = {}) => ({
    id: 'studio-123',
    name: 'Test Studio',
    description: 'A test fitness studio',
    address: '123 Test Street, Los Cabos',
    phone: '+52-624-123-4567',
    email: 'studio@test.com',
    image_url: 'https://example.com/studio.jpg',
    rating: 4.5,
    class_count: 20,
    ...overrides,
  }),

  generateMockBooking: (overrides = {}) => ({
    id: 'booking-123',
    class_id: 'class-123',
    user_id: 'user-123',
    status: 'confirmed',
    credits_used: 1,
    created_at: '2024-01-01T12:00:00Z',
    ...overrides,
  }),

  // Common assertions
  expectToBeAccessible: async (element: HTMLElement) => {
    // Basic accessibility checks
    if (element.tagName === 'IMG') {
      expect(element).toHaveAttribute('alt')
    }
    
    if (element.getAttribute('role') === 'button' || element.tagName === 'BUTTON') {
      expect(element).not.toHaveAttribute('disabled')
      expect(element).toBeVisible()
    }

    if (element.tagName === 'INPUT') {
      const label = document.querySelector(`label[for="${element.id}"]`)
      expect(label || element.getAttribute('aria-label')).toBeTruthy()
    }
  },

  expectFormValidation: async (user: any, field: string, value: string, errorMessage?: string) => {
    const input = screen.getByLabelText(new RegExp(field, 'i'))
    
    await user.clear(input)
    await user.type(input, value)
    await user.tab() // Trigger blur event
    
    if (errorMessage) {
      expect(await screen.findByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
    }
  },

  expectLoadingState: (testId = 'loading') => {
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  },

  expectErrorState: (message?: string) => {
    if (message) {
      expect(screen.getByText(new RegExp(message, 'i'))).toBeInTheDocument()
    } else {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    }
  },
}

// Custom matchers
expect.extend({
  toBeValidForm(received: HTMLFormElement) {
    const inputs = received.querySelectorAll('input, textarea, select')
    const labels = received.querySelectorAll('label')
    const submitButton = received.querySelector('button[type="submit"]')

    // Check that all inputs have labels
    inputs.forEach((input) => {
      if (input.type !== 'hidden' && input.type !== 'submit') {
        const hasLabel = labels.length > 0 && 
          Array.from(labels).some(label => 
            label.getAttribute('for') === input.id ||
            label.contains(input) ||
            input.getAttribute('aria-labelledby') ||
            input.getAttribute('aria-label')
          )
        
        if (!hasLabel) {
          return {
            message: () => `Input ${input.name || input.id} is missing a label`,
            pass: false,
          }
        }
      }
    })

    // Check for submit button
    if (!submitButton) {
      return {
        message: () => 'Form is missing a submit button',
        pass: false,
      }
    }

    return {
      message: () => 'Form is valid and accessible',
      pass: true,
    }
  },
})

// Mock data factories
export const mockData = {
  user: testUtils.generateMockUser,
  class: testUtils.generateMockClass,
  studio: testUtils.generateMockStudio,
  booking: testUtils.generateMockBooking,
  
  // Batch generators
  users: (count = 5) => Array.from({ length: count }, (_, i) => 
    testUtils.generateMockUser({ id: `user-${i}`, email: `user${i}@test.com` })
  ),
  
  classes: (count = 5) => Array.from({ length: count }, (_, i) => 
    testUtils.generateMockClass({ id: `class-${i}`, title: `Class ${i}` })
  ),
  
  studios: (count = 3) => Array.from({ length: count }, (_, i) => 
    testUtils.generateMockStudio({ id: `studio-${i}`, name: `Studio ${i}` })
  ),
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { renderWithProviders as render, testUtils, mockData }