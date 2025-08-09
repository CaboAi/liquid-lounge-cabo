/**
 * @jest-environment jsdom
 */

import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render, testUtils, mockData } from '@/tests/utils/test-utils'
import { mockHandlers } from '@/tests/mocks/server'

// Mock Credit Balance Component
const MockCreditBalance = ({ 
  userId,
  onPurchase,
  showHistory = true 
}: { 
  userId: string
  onPurchase?: (credits: number) => void
  showHistory?: boolean
}) => {
  const [credits, setCredits] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [showPurchaseModal, setShowPurchaseModal] = React.useState(false)

  React.useEffect(() => {
    const fetchCredits = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/credits')
        if (!response.ok) throw new Error('Failed to fetch credits')
        const data = await response.json()
        setCredits(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load credits')
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
  }, [userId])

  const handlePurchase = (packageSize: number) => {
    onPurchase?.(packageSize)
    setShowPurchaseModal(false)
    // Update local balance
    if (credits) {
      setCredits({ ...credits, balance: credits.balance + packageSize })
    }
  }

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isExpiringSoon = (dateString: string) => {
    const expiryDate = new Date(dateString)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30
  }

  if (loading) {
    return <div data-testid="credits-loading">Loading credits...</div>
  }

  if (error) {
    return (
      <div role="alert" data-testid="credits-error" aria-live="assertive">
        {error}
      </div>
    )
  }

  if (!credits) {
    return <div data-testid="no-credits">No credit information available</div>
  }

  return (
    <section 
      className="credit-balance"
      data-testid="credit-balance"
      aria-labelledby="credits-heading"
    >
      <header>
        <h2 id="credits-heading">Your Credits</h2>
      </header>

      <div className="balance-card" data-testid="balance-card">
        <div className="balance-amount">
          <span data-testid="credit-balance-amount" aria-label={`${credits.balance} credits available`}>
            {credits.balance}
          </span>
          <span className="balance-label">Credits Available</span>
        </div>

        <div className="balance-details">
          <div className="detail-item" data-testid="total-purchased">
            <span className="label">Total Purchased:</span>
            <span className="value">{credits.total_purchased}</span>
          </div>
          <div className="detail-item" data-testid="total-used">
            <span className="label">Total Used:</span>
            <span className="value">{credits.total_used}</span>
          </div>
          <div className="detail-item" data-testid="expiry-date">
            <span className="label">Expires:</span>
            <span 
              className={`value ${isExpiringSoon(credits.expires_at) ? 'text-red-600' : ''}`}
              aria-label={`Credits expire on ${formatExpiryDate(credits.expires_at)}`}
            >
              {formatExpiryDate(credits.expires_at)}
            </span>
          </div>
        </div>

        {isExpiringSoon(credits.expires_at) && (
          <div 
            role="alert" 
            data-testid="expiry-warning"
            aria-live="polite"
            className="expiry-warning"
          >
            ⚠️ Your credits expire soon!
          </div>
        )}
      </div>

      <div className="actions" data-testid="credit-actions">
        <button
          onClick={() => setShowPurchaseModal(true)}
          data-testid="purchase-credits-button"
          aria-describedby="purchase-help"
        >
          Purchase More Credits
        </button>
        <div id="purchase-help" className="help-text">
          Buy credit packages to book fitness classes
        </div>
      </div>

      {showPurchaseModal && (
        <div 
          role="dialog" 
          data-testid="purchase-modal" 
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className="modal-content">
            <header>
              <h3 id="modal-title">Purchase Credits</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                aria-label="Close purchase modal"
                data-testid="close-modal"
              >
                ×
              </button>
            </header>

            <div id="modal-description">
              <p>Choose a credit package to purchase:</p>
            </div>

            <div className="package-options" data-testid="package-options">
              {[
                { credits: 5, price: 50, popular: false },
                { credits: 10, price: 90, popular: true },
                { credits: 20, price: 160, popular: false },
              ].map((pkg) => (
                <button
                  key={pkg.credits}
                  onClick={() => handlePurchase(pkg.credits)}
                  data-testid={`package-${pkg.credits}`}
                  className={`package-option ${pkg.popular ? 'popular' : ''}`}
                  aria-describedby={`package-${pkg.credits}-details`}
                >
                  <div className="package-credits">{pkg.credits} Credits</div>
                  <div className="package-price">${pkg.price}</div>
                  {pkg.popular && (
                    <div className="popular-badge" aria-label="Most popular package">
                      Most Popular
                    </div>
                  )}
                  <div 
                    id={`package-${pkg.credits}-details`}
                    className="package-details"
                  >
                    ${(pkg.price / pkg.credits).toFixed(2)} per credit
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="credit-history-link" data-testid="history-link">
          <button
            onClick={() => {/* Navigate to history */}}
            data-testid="view-history-button"
          >
            View Credit History
          </button>
        </div>
      )}
    </section>
  )
}

describe('CreditBalance', () => {
  const mockUserId = 'test-user-id'

  beforeEach(() => {
    mockHandlers.reset()
  })

  describe('Rendering', () => {
    it('displays loading state initially', async () => {
      render(<MockCreditBalance userId={mockUserId} />)
      
      expect(screen.getByTestId('credits-loading')).toBeInTheDocument()
    })

    it('displays credit balance information correctly', async () => {
      render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('credit-balance-amount')).toHaveTextContent('10')
        expect(screen.getByTestId('total-purchased')).toHaveTextContent('20')
        expect(screen.getByTestId('total-used')).toHaveTextContent('10')
        expect(screen.getByTestId('expiry-date')).toBeInTheDocument()
      })
    })

    it('has proper semantic structure', async () => {
      render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        const section = screen.getByTestId('credit-balance')
        const heading = screen.getByText('Your Credits')
        
        expect(section).toHaveAttribute('role', 'region')
        expect(section).toHaveAttribute('aria-labelledby', 'credits-heading')
        expect(heading).toHaveAttribute('id', 'credits-heading')
      })
    })

    it('shows expiry warning when credits expire soon', async () => {
      // Mock credits expiring within 30 days
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/credits', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                user_id: 'test-user-id',
                balance: 5,
                total_purchased: 10,
                total_used: 5,
                expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
              },
            })
          )
        })
      )

      render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('expiry-warning')).toBeInTheDocument()
        expect(screen.getByText(/credits expire soon/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when credits fail to load', async () => {
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/credits', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }))
        })
      )

      render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/failed to load credits/i)
      })
    })

    it('shows no credits message when data is null', async () => {
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/credits', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: null }))
        })
      )

      render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('no-credits')).toBeInTheDocument()
      })
    })
  })

  describe('Purchase Modal', () => {
    it('opens purchase modal when purchase button is clicked', async () => {
      const { user } = render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('purchase-credits-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('purchase-credits-button'))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Purchase Credits')).toBeInTheDocument()
    })

    it('closes modal when close button is clicked', async () => {
      const { user } = render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('purchase-credits-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('purchase-credits-button'))
      await user.click(screen.getByTestId('close-modal'))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('displays credit package options', async () => {
      const { user } = render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('purchase-credits-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('purchase-credits-button'))

      expect(screen.getByTestId('package-5')).toBeInTheDocument()
      expect(screen.getByTestId('package-10')).toBeInTheDocument()
      expect(screen.getByTestId('package-20')).toBeInTheDocument()
    })

    it('handles package selection and purchase', async () => {
      const onPurchase = jest.fn()
      const { user } = render(
        <MockCreditBalance userId={mockUserId} onPurchase={onPurchase} />
      )

      await waitFor(() => {
        expect(screen.getByTestId('purchase-credits-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('purchase-credits-button'))
      await user.click(screen.getByTestId('package-10'))

      expect(onPurchase).toHaveBeenCalledWith(10)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('highlights popular package', async () => {
      const { user } = render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('purchase-credits-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('purchase-credits-button'))

      const popularPackage = screen.getByTestId('package-10')
      expect(popularPackage).toHaveClass('popular')
      expect(screen.getByText('Most Popular')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', async () => {
      render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        const balanceAmount = screen.getByTestId('credit-balance-amount')
        expect(balanceAmount).toHaveAttribute('aria-label', '10 credits available')
        
        const purchaseButton = screen.getByTestId('purchase-credits-button')
        expect(purchaseButton).toHaveAttribute('aria-describedby', 'purchase-help')
      })
    })

    it('announces errors to screen readers', async () => {
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/credits', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }))
        })
      )

      render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toHaveAttribute('aria-live', 'assertive')
      })
    })

    it('supports keyboard navigation in modal', async () => {
      const { user } = render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('purchase-credits-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('purchase-credits-button'))

      // Should be able to tab through package options
      const packageOptions = [
        screen.getByTestId('package-5'),
        screen.getByTestId('package-10'),
        screen.getByTestId('package-20'),
      ]

      for (const option of packageOptions) {
        await user.tab()
        expect(option).toHaveFocus()
      }
    })
  })

  describe('Credit History', () => {
    it('shows history link when showHistory is true', async () => {
      render(<MockCreditBalance userId={mockUserId} showHistory={true} />)

      await waitFor(() => {
        expect(screen.getByTestId('view-history-button')).toBeInTheDocument()
      })
    })

    it('hides history link when showHistory is false', async () => {
      render(<MockCreditBalance userId={mockUserId} showHistory={false} />)

      await waitFor(() => {
        expect(screen.queryByTestId('view-history-button')).not.toBeInTheDocument()
      })
    })
  })

  describe('Visual States', () => {
    it('updates balance after successful purchase', async () => {
      const { user } = render(<MockCreditBalance userId={mockUserId} />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('credit-balance-amount')).toHaveTextContent('10')
      })

      // Purchase 5 credits
      await user.click(screen.getByTestId('purchase-credits-button'))
      await user.click(screen.getByTestId('package-5'))

      // Balance should update to 15 (10 + 5)
      expect(screen.getByTestId('credit-balance-amount')).toHaveTextContent('15')
    })

    it('formats expiry date correctly', async () => {
      render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        const expiryDate = screen.getByTestId('expiry-date')
        expect(expiryDate).toHaveTextContent(/december 31, 2024/i)
      })
    })

    it('shows per-credit pricing in packages', async () => {
      const { user } = render(<MockCreditBalance userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('purchase-credits-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('purchase-credits-button'))

      expect(screen.getByText('$10.00 per credit')).toBeInTheDocument() // 5 credits for $50
      expect(screen.getByText('$9.00 per credit')).toBeInTheDocument()  // 10 credits for $90
      expect(screen.getByText('$8.00 per credit')).toBeInTheDocument()  // 20 credits for $160
    })
  })
})