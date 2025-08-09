/**
 * @jest-environment jsdom
 */

import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render, testUtils, mockData } from '@/tests/utils/test-utils'
import { mockHandlers } from '@/tests/mocks/server'

// Mock Credit History Component
const MockCreditHistory = ({ 
  userId,
  onFilterChange,
  initialFilter = 'all'
}: { 
  userId: string
  onFilterChange?: (filter: string) => void
  initialFilter?: 'all' | 'purchases' | 'usage'
}) => {
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [filter, setFilter] = React.useState(initialFilter)

  React.useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/credits/history')
        if (!response.ok) throw new Error('Failed to fetch credit history')
        const data = await response.json()
        setTransactions(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [userId])

  const filteredTransactions = React.useMemo(() => {
    switch (filter) {
      case 'purchases':
        return transactions.filter(t => t.type === 'purchase')
      case 'usage':
        return transactions.filter(t => t.type === 'usage')
      default:
        return transactions
    }
  }, [transactions, filter])

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter as any)
    onFilterChange?.(newFilter)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return '💳'
      case 'usage': return '🏃'
      case 'refund': return '↩️'
      default: return '📄'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return <div data-testid="history-loading" aria-live="polite">Loading credit history...</div>
  }

  if (error) {
    return (
      <div role="alert" data-testid="history-error" aria-live="assertive">
        {error}
      </div>
    )
  }

  return (
    <section 
      className="credit-history"
      data-testid="credit-history"
      aria-labelledby="history-heading"
    >
      <header>
        <h2 id="history-heading">Credit History</h2>
      </header>

      <div className="filters" data-testid="history-filters" role="tablist">
        {[
          { key: 'all', label: 'All Transactions' },
          { key: 'purchases', label: 'Purchases' },
          { key: 'usage', label: 'Usage' },
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => handleFilterChange(filterOption.key)}
            className={`filter-button ${filter === filterOption.key ? 'active' : ''}`}
            data-testid={`filter-${filterOption.key}`}
            role="tab"
            aria-selected={filter === filterOption.key}
            aria-controls="transactions-list"
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      <div 
        className="transactions-summary" 
        data-testid="transactions-summary"
        aria-live="polite"
      >
        Showing {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? '' : 's'}
      </div>

      {filteredTransactions.length === 0 ? (
        <div 
          className="no-transactions" 
          data-testid="no-transactions"
          role="status"
          aria-live="polite"
        >
          {filter === 'all' 
            ? 'No transactions found' 
            : `No ${filter} transactions found`
          }
        </div>
      ) : (
        <div 
          id="transactions-list"
          className="transactions-list" 
          data-testid="transactions-list"
          role="tabpanel"
          aria-labelledby="history-heading"
        >
          {filteredTransactions.map((transaction) => (
            <article
              key={transaction.id}
              className="transaction-item"
              data-testid={`transaction-${transaction.id}`}
              aria-labelledby={`transaction-title-${transaction.id}`}
              aria-describedby={`transaction-details-${transaction.id}`}
            >
              <div className="transaction-icon" aria-hidden="true">
                {getTransactionIcon(transaction.type)}
              </div>

              <div className="transaction-content">
                <div 
                  id={`transaction-title-${transaction.id}`}
                  className="transaction-description"
                  data-testid="transaction-description"
                >
                  {transaction.description}
                </div>

                <div 
                  id={`transaction-details-${transaction.id}`}
                  className="transaction-details"
                >
                  <span className="transaction-date" data-testid="transaction-date">
                    {formatDate(transaction.created_at)}
                  </span>
                  <span 
                    className={`transaction-status ${getStatusColor(transaction.status)}`}
                    data-testid="transaction-status"
                    aria-label={`Status: ${transaction.status}`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>

              <div className="transaction-amount">
                <div 
                  className={`credits ${transaction.credits > 0 ? 'positive' : 'negative'}`}
                  data-testid="transaction-credits"
                  aria-label={`${Math.abs(transaction.credits)} credits ${transaction.credits > 0 ? 'added' : 'used'}`}
                >
                  {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                </div>
                
                {transaction.amount > 0 && (
                  <div 
                    className="money-amount" 
                    data-testid="transaction-amount"
                    aria-label={`$${transaction.amount.toFixed(2)}`}
                  >
                    ${transaction.amount.toFixed(2)}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {filteredTransactions.length > 0 && (
        <footer className="history-footer" data-testid="history-footer">
          <div className="summary-stats">
            <div className="stat-item" data-testid="total-purchased">
              <span className="stat-label">Total Purchased:</span>
              <span className="stat-value">
                {filteredTransactions
                  .filter(t => t.type === 'purchase')
                  .reduce((sum, t) => sum + t.credits, 0)} credits
              </span>
            </div>
            <div className="stat-item" data-testid="total-spent">
              <span className="stat-label">Total Spent:</span>
              <span className="stat-value">
                ${filteredTransactions
                  .filter(t => t.type === 'purchase')
                  .reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </footer>
      )}
    </section>
  )
}

describe('CreditHistory', () => {
  const mockUserId = 'test-user-id'

  beforeEach(() => {
    mockHandlers.reset()
  })

  describe('Rendering', () => {
    it('displays loading state initially', () => {
      render(<MockCreditHistory userId={mockUserId} />)
      
      expect(screen.getByTestId('history-loading')).toBeInTheDocument()
    })

    it('displays transaction history correctly', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('transactions-list')).toBeInTheDocument()
        expect(screen.getByText('Credit package purchase')).toBeInTheDocument()
        expect(screen.getByText('Class booking: Morning Yoga')).toBeInTheDocument()
      })
    })

    it('has proper semantic structure', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        const section = screen.getByTestId('credit-history')
        const tablist = screen.getByRole('tablist')
        const tabpanel = screen.getByRole('tabpanel')
        
        expect(section).toHaveAttribute('aria-labelledby', 'history-heading')
        expect(tablist).toBeInTheDocument()
        expect(tabpanel).toHaveAttribute('aria-labelledby', 'history-heading')
      })
    })

    it('shows correct transaction count', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('transactions-summary')).toHaveTextContent('Showing 2 transactions')
      })
    })
  })

  describe('Filtering', () => {
    it('filters by purchases', async () => {
      const { user } = render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('filter-purchases')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('filter-purchases'))

      await waitFor(() => {
        expect(screen.getByText('Credit package purchase')).toBeInTheDocument()
        expect(screen.queryByText('Class booking: Morning Yoga')).not.toBeInTheDocument()
        expect(screen.getByTestId('transactions-summary')).toHaveTextContent('Showing 1 transaction')
      })
    })

    it('filters by usage', async () => {
      const { user } = render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('filter-usage')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('filter-usage'))

      await waitFor(() => {
        expect(screen.queryByText('Credit package purchase')).not.toBeInTheDocument()
        expect(screen.getByText('Class booking: Morning Yoga')).toBeInTheDocument()
        expect(screen.getByTestId('transactions-summary')).toHaveTextContent('Showing 1 transaction')
      })
    })

    it('shows all transactions by default', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        const allButton = screen.getByTestId('filter-all')
        expect(allButton).toHaveAttribute('aria-selected', 'true')
        expect(allButton).toHaveClass('active')
      })
    })

    it('calls onFilterChange callback', async () => {
      const onFilterChange = jest.fn()
      const { user } = render(
        <MockCreditHistory userId={mockUserId} onFilterChange={onFilterChange} />
      )

      await waitFor(() => {
        expect(screen.getByTestId('filter-purchases')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('filter-purchases'))

      expect(onFilterChange).toHaveBeenCalledWith('purchases')
    })
  })

  describe('Transaction Display', () => {
    it('displays transaction details correctly', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        const purchaseTransaction = screen.getByTestId('transaction-txn-1')
        expect(purchaseTransaction).toBeInTheDocument()
        
        expect(screen.getByText('Credit package purchase')).toBeInTheDocument()
        expect(screen.getByText(/jan 1, 2024/i)).toBeInTheDocument()
        expect(screen.getByText('completed')).toBeInTheDocument()
      })
    })

    it('shows positive credits for purchases', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        const creditsElement = screen.getByTestId('transaction-txn-1')
          .querySelector('[data-testid="transaction-credits"]')
        
        expect(creditsElement).toHaveTextContent('+10')
        expect(creditsElement).toHaveClass('positive')
      })
    })

    it('shows negative credits for usage', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        const creditsElement = screen.getByTestId('transaction-txn-2')
          .querySelector('[data-testid="transaction-credits"]')
        
        expect(creditsElement).toHaveTextContent('-1')
        expect(creditsElement).toHaveClass('negative')
      })
    })

    it('displays monetary amounts for purchases', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        const purchaseTransaction = screen.getByTestId('transaction-txn-1')
        const amountElement = purchaseTransaction.querySelector('[data-testid="transaction-amount"]')
        
        expect(amountElement).toHaveTextContent('$100.00')
      })
    })

    it('formats dates correctly', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        const dateElements = screen.getAllByTestId('transaction-date')
        expect(dateElements[0]).toHaveTextContent(/jan 1, 2024.*12:00/i)
      })
    })

    it('shows appropriate icons for transaction types', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        const transactionItems = screen.getAllByRole('article')
        expect(transactionItems).toHaveLength(2)
        
        // Icons are rendered but we can verify they exist through the structure
        transactionItems.forEach(item => {
          const icon = item.querySelector('.transaction-icon')
          expect(icon).toBeInTheDocument()
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when history fails to load', async () => {
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/credits/history', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }))
        })
      )

      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/failed to load history/i)
      })
    })

    it('handles empty transaction list', async () => {
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/credits/history', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: [], count: 0 }))
        })
      )

      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('no-transactions')).toHaveTextContent('No transactions found')
      })
    })

    it('shows appropriate message for filtered empty results', async () => {
      // Mock data with only purchases
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/credits/history', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ 
            data: [{
              id: 'txn-1',
              type: 'purchase',
              credits: 10,
              amount: 100.0,
              description: 'Credit package purchase',
              created_at: '2024-01-01T12:00:00Z',
              status: 'completed',
            }], 
            count: 1 
          }))
        })
      )

      const { user } = render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('filter-usage')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('filter-usage'))

      await waitFor(() => {
        expect(screen.getByTestId('no-transactions')).toHaveTextContent('No usage transactions found')
      })
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        const filters = screen.getAllByRole('tab')
        expect(filters).toHaveLength(3)
        
        filters.forEach(filter => {
          expect(filter).toHaveAttribute('aria-controls', 'transactions-list')
        })

        const transactionItems = screen.getAllByRole('article')
        transactionItems.forEach(item => {
          expect(item).toHaveAttribute('aria-labelledby')
          expect(item).toHaveAttribute('aria-describedby')
        })
      })
    })

    it('announces filter changes to screen readers', async () => {
      const { user } = render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('transactions-summary')).toHaveAttribute('aria-live', 'polite')
      })

      await user.click(screen.getByTestId('filter-purchases'))

      await waitFor(() => {
        expect(screen.getByTestId('transactions-summary')).toHaveTextContent('Showing 1 transaction')
      })
    })

    it('provides descriptive labels for credits', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        const creditElements = screen.getAllByTestId('transaction-credits')
        expect(creditElements[0]).toHaveAttribute('aria-label', '10 credits added')
        expect(creditElements[1]).toHaveAttribute('aria-label', '1 credits used')
      })
    })

    it('supports keyboard navigation between filters', async () => {
      const { user } = render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('filter-all')).toBeInTheDocument()
      })

      const filters = ['filter-all', 'filter-purchases', 'filter-usage']
      
      for (let i = 0; i < filters.length; i++) {
        await user.tab()
        expect(screen.getByTestId(filters[i])).toHaveFocus()
      }
    })
  })

  describe('Summary Statistics', () => {
    it('shows summary statistics in footer', async () => {
      render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('total-purchased')).toHaveTextContent('10 credits')
        expect(screen.getByTestId('total-spent')).toHaveTextContent('$100.00')
      })
    })

    it('updates statistics based on filter', async () => {
      const { user } = render(<MockCreditHistory userId={mockUserId} />)

      await waitFor(() => {
        expect(screen.getByTestId('filter-purchases')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('filter-purchases'))

      await waitFor(() => {
        expect(screen.getByTestId('total-purchased')).toHaveTextContent('10 credits')
        expect(screen.getByTestId('total-spent')).toHaveTextContent('$100.00')
      })

      await user.click(screen.getByTestId('filter-usage'))

      await waitFor(() => {
        expect(screen.getByTestId('total-purchased')).toHaveTextContent('0 credits')
        expect(screen.getByTestId('total-spent')).toHaveTextContent('$0.00')
      })
    })
  })
})