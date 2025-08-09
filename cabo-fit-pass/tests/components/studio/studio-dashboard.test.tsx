/**
 * @jest-environment jsdom
 */

import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render, testUtils, mockData } from '@/tests/utils/test-utils'
import { mockHandlers } from '@/tests/mocks/server'

// Mock Studio Dashboard Component
const MockStudioDashboard = ({ 
  studioId,
  onManageClasses,
  onViewAnalytics 
}: { 
  studioId: string
  onManageClasses?: () => void
  onViewAnalytics?: () => void
}) => {
  const [studioData, setStudioData] = React.useState<any>(null)
  const [analytics, setAnalytics] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const [studioResponse, analyticsResponse] = await Promise.all([
          fetch(`/api/studios/${studioId}`),
          fetch(`/api/analytics/studio/${studioId}`)
        ])

        if (!studioResponse.ok || !analyticsResponse.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const studioData = await studioResponse.json()
        const analyticsData = await analyticsResponse.json()

        setStudioData(studioData.data)
        setAnalytics(analyticsData.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [studioId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div data-testid="dashboard-loading" aria-live="polite">
        Loading studio dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" data-testid="dashboard-error" aria-live="assertive">
        {error}
      </div>
    )
  }

  if (!studioData || !analytics) {
    return (
      <div data-testid="no-data" role="status">
        No dashboard data available
      </div>
    )
  }

  return (
    <main 
      className="studio-dashboard"
      data-testid="studio-dashboard"
      aria-labelledby="dashboard-heading"
    >
      <header className="dashboard-header">
        <div className="studio-info">
          <h1 id="dashboard-heading" data-testid="studio-name">
            {studioData.name}
          </h1>
          <div className="studio-details" data-testid="studio-details">
            <span className="rating" data-testid="studio-rating">
              ⭐ {studioData.rating}/5.0
            </span>
            <span className="class-count" data-testid="studio-class-count">
              {studioData.class_count} classes
            </span>
          </div>
        </div>

        <div className="dashboard-actions" data-testid="dashboard-actions">
          <button
            onClick={onManageClasses}
            data-testid="manage-classes-button"
            aria-describedby="manage-classes-help"
          >
            Manage Classes
          </button>
          <div id="manage-classes-help" className="help-text">
            Add, edit, or remove fitness classes
          </div>

          <button
            onClick={onViewAnalytics}
            data-testid="view-analytics-button"
            aria-describedby="analytics-help"
          >
            View Full Analytics
          </button>
          <div id="analytics-help" className="help-text">
            Detailed reports and insights
          </div>
        </div>
      </header>

      <section 
        className="metrics-overview" 
        data-testid="metrics-overview"
        aria-labelledby="metrics-heading"
      >
        <h2 id="metrics-heading" className="section-title">Performance Metrics</h2>
        
        <div className="metrics-grid" role="grid" aria-label="Performance metrics">
          <div 
            className="metric-card" 
            data-testid="revenue-metric"
            role="gridcell"
            aria-labelledby="revenue-heading"
            aria-describedby="revenue-details"
          >
            <h3 id="revenue-heading" className="metric-title">Revenue</h3>
            <div className="metric-value" data-testid="revenue-total">
              {formatCurrency(analytics.revenue.total)}
            </div>
            <div id="revenue-details" className="metric-details">
              <span data-testid="revenue-this-month">
                This month: {formatCurrency(analytics.revenue.thisMonth)}
              </span>
              <span 
                className={`metric-growth ${getGrowthColor(analytics.revenue.growth)}`}
                data-testid="revenue-growth"
                aria-label={`${analytics.revenue.growth > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(analytics.revenue.growth)}%`}
              >
                {formatPercentage(analytics.revenue.growth)}
              </span>
            </div>
          </div>

          <div 
            className="metric-card" 
            data-testid="bookings-metric"
            role="gridcell"
            aria-labelledby="bookings-heading"
            aria-describedby="bookings-details"
          >
            <h3 id="bookings-heading" className="metric-title">Bookings</h3>
            <div className="metric-value" data-testid="bookings-total">
              {analytics.bookings.total}
            </div>
            <div id="bookings-details" className="metric-details">
              <span data-testid="bookings-this-month">
                This month: {analytics.bookings.thisMonth}
              </span>
              <span 
                className={`metric-growth ${getGrowthColor(analytics.bookings.growth)}`}
                data-testid="bookings-growth"
              >
                {formatPercentage(analytics.bookings.growth)}
              </span>
            </div>
          </div>

          <div 
            className="metric-card" 
            data-testid="classes-metric"
            role="gridcell"
            aria-labelledby="classes-heading"
            aria-describedby="classes-details"
          >
            <h3 id="classes-heading" className="metric-title">Classes</h3>
            <div className="metric-value" data-testid="classes-total">
              {analytics.classes.total}
            </div>
            <div id="classes-details" className="metric-details">
              <span data-testid="classes-active">
                Active: {analytics.classes.active}
              </span>
              <span data-testid="classes-upcoming">
                Upcoming: {analytics.classes.upcoming}
              </span>
            </div>
          </div>

          <div 
            className="metric-card" 
            data-testid="members-metric"
            role="gridcell"
            aria-labelledby="members-heading"
            aria-describedby="members-details"
          >
            <h3 id="members-heading" className="metric-title">Members</h3>
            <div className="metric-value" data-testid="members-total">
              {analytics.members.total}
            </div>
            <div id="members-details" className="metric-details">
              <span data-testid="members-active">
                Active: {analytics.members.active}
              </span>
              <span data-testid="members-new">
                New: {analytics.members.new}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section 
        className="quick-actions" 
        data-testid="quick-actions"
        aria-labelledby="actions-heading"
      >
        <h2 id="actions-heading" className="section-title">Quick Actions</h2>
        
        <div className="actions-grid">
          <button
            className="action-card"
            data-testid="add-class-action"
            aria-describedby="add-class-description"
          >
            <div className="action-icon" aria-hidden="true">➕</div>
            <div className="action-content">
              <h3 className="action-title">Add New Class</h3>
              <p id="add-class-description" className="action-description">
                Schedule a new fitness class
              </p>
            </div>
          </button>

          <button
            className="action-card"
            data-testid="manage-schedule-action"
            aria-describedby="schedule-description"
          >
            <div className="action-icon" aria-hidden="true">📅</div>
            <div className="action-content">
              <h3 className="action-title">Manage Schedule</h3>
              <p id="schedule-description" className="action-description">
                Update class times and availability
              </p>
            </div>
          </button>

          <button
            className="action-card"
            data-testid="view-bookings-action"
            aria-describedby="bookings-description"
          >
            <div className="action-icon" aria-hidden="true">📋</div>
            <div className="action-content">
              <h3 className="action-title">View Bookings</h3>
              <p id="bookings-description" className="action-description">
                See all class bookings and waitlists
              </p>
            </div>
          </button>

          <button
            className="action-card"
            data-testid="studio-settings-action"
            aria-describedby="settings-description"
          >
            <div className="action-icon" aria-hidden="true">⚙️</div>
            <div className="action-content">
              <h3 className="action-title">Studio Settings</h3>
              <p id="settings-description" className="action-description">
                Update studio information and preferences
              </p>
            </div>
          </button>
        </div>
      </section>

      <section 
        className="recent-activity" 
        data-testid="recent-activity"
        aria-labelledby="activity-heading"
      >
        <h2 id="activity-heading" className="section-title">Recent Activity</h2>
        
        <div className="activity-list" data-testid="activity-list">
          {[
            { id: 1, type: 'booking', message: 'New booking for Morning Yoga', time: '2 minutes ago' },
            { id: 2, type: 'class', message: 'HIIT Workout class updated', time: '1 hour ago' },
            { id: 3, type: 'member', message: '3 new members joined', time: '3 hours ago' },
          ].map((activity) => (
            <div
              key={activity.id}
              className="activity-item"
              data-testid={`activity-${activity.id}`}
              role="listitem"
            >
              <div className="activity-icon" aria-hidden="true">
                {activity.type === 'booking' && '📝'}
                {activity.type === 'class' && '🏃'}
                {activity.type === 'member' && '👤'}
              </div>
              <div className="activity-content">
                <span className="activity-message" data-testid="activity-message">
                  {activity.message}
                </span>
                <span className="activity-time" data-testid="activity-time">
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

describe('StudioDashboard', () => {
  const mockStudioId = 'studio-1'

  beforeEach(() => {
    mockHandlers.reset()
  })

  describe('Rendering', () => {
    it('displays loading state initially', () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)
      
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument()
    })

    it('displays studio information correctly', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByTestId('studio-name')).toHaveTextContent('Test Studio')
        expect(screen.getByTestId('studio-rating')).toHaveTextContent('4.5/5.0')
        expect(screen.getByTestId('studio-class-count')).toHaveTextContent('20 classes')
      })
    })

    it('has proper semantic structure', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        const main = screen.getByTestId('studio-dashboard')
        const heading = screen.getByTestId('studio-name')
        
        expect(main).toHaveAttribute('role', 'main')
        expect(main).toHaveAttribute('aria-labelledby', 'dashboard-heading')
        expect(heading).toHaveAttribute('id', 'dashboard-heading')
      })
    })
  })

  describe('Metrics Display', () => {
    it('displays all performance metrics', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByTestId('revenue-metric')).toBeInTheDocument()
        expect(screen.getByTestId('bookings-metric')).toBeInTheDocument()
        expect(screen.getByTestId('classes-metric')).toBeInTheDocument()
        expect(screen.getByTestId('members-metric')).toBeInTheDocument()
      })
    })

    it('formats revenue correctly', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByTestId('revenue-total')).toHaveTextContent('$5,000.00')
        expect(screen.getByTestId('revenue-this-month')).toHaveTextContent('$1,200.00')
        expect(screen.getByTestId('revenue-growth')).toHaveTextContent('+20.0%')
      })
    })

    it('displays booking metrics correctly', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByTestId('bookings-total')).toHaveTextContent('150')
        expect(screen.getByTestId('bookings-this-month')).toHaveTextContent('35')
        expect(screen.getByTestId('bookings-growth')).toHaveTextContent('+16.7%')
      })
    })

    it('shows class and member statistics', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByTestId('classes-total')).toHaveTextContent('25')
        expect(screen.getByTestId('classes-active')).toHaveTextContent('20')
        expect(screen.getByTestId('classes-upcoming')).toHaveTextContent('10')
        
        expect(screen.getByTestId('members-total')).toHaveTextContent('85')
        expect(screen.getByTestId('members-active')).toHaveTextContent('60')
        expect(screen.getByTestId('members-new')).toHaveTextContent('8')
      })
    })

    it('applies correct colors for growth indicators', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        const revenueGrowth = screen.getByTestId('revenue-growth')
        const bookingsGrowth = screen.getByTestId('bookings-growth')
        
        expect(revenueGrowth).toHaveClass('text-green-600') // Positive growth
        expect(bookingsGrowth).toHaveClass('text-green-600') // Positive growth
      })
    })
  })

  describe('Quick Actions', () => {
    it('displays all quick action buttons', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByTestId('add-class-action')).toBeInTheDocument()
        expect(screen.getByTestId('manage-schedule-action')).toBeInTheDocument()
        expect(screen.getByTestId('view-bookings-action')).toBeInTheDocument()
        expect(screen.getByTestId('studio-settings-action')).toBeInTheDocument()
      })
    })

    it('shows action descriptions', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByText('Schedule a new fitness class')).toBeInTheDocument()
        expect(screen.getByText('Update class times and availability')).toBeInTheDocument()
        expect(screen.getByText('See all class bookings and waitlists')).toBeInTheDocument()
        expect(screen.getByText('Update studio information and preferences')).toBeInTheDocument()
      })
    })
  })

  describe('Recent Activity', () => {
    it('displays recent activity items', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByTestId('activity-1')).toBeInTheDocument()
        expect(screen.getByTestId('activity-2')).toBeInTheDocument()
        expect(screen.getByTestId('activity-3')).toBeInTheDocument()
      })
    })

    it('shows activity messages and timestamps', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByText('New booking for Morning Yoga')).toBeInTheDocument()
        expect(screen.getByText('2 minutes ago')).toBeInTheDocument()
        expect(screen.getByText('HIIT Workout class updated')).toBeInTheDocument()
        expect(screen.getByText('3 new members joined')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when dashboard data fails to load', async () => {
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/studios/:id', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }))
        })
      )

      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/failed to fetch dashboard data/i)
      })
    })

    it('handles missing data gracefully', async () => {
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/studios/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: null }))
        })
      )

      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByTestId('no-data')).toHaveTextContent('No dashboard data available')
      })
    })
  })

  describe('Interactions', () => {
    it('calls onManageClasses when manage classes button is clicked', async () => {
      const onManageClasses = jest.fn()
      const { user } = render(
        <MockStudioDashboard 
          studioId={mockStudioId} 
          onManageClasses={onManageClasses} 
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('manage-classes-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('manage-classes-button'))

      expect(onManageClasses).toHaveBeenCalled()
    })

    it('calls onViewAnalytics when analytics button is clicked', async () => {
      const onViewAnalytics = jest.fn()
      const { user } = render(
        <MockStudioDashboard 
          studioId={mockStudioId} 
          onViewAnalytics={onViewAnalytics} 
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('view-analytics-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('view-analytics-button'))

      expect(onViewAnalytics).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        const metricsGrid = screen.getByRole('grid')
        const metricCards = screen.getAllByRole('gridcell')
        
        expect(metricsGrid).toHaveAttribute('aria-label', 'Performance metrics')
        expect(metricCards).toHaveLength(4)

        metricCards.forEach(card => {
          expect(card).toHaveAttribute('aria-labelledby')
          expect(card).toHaveAttribute('aria-describedby')
        })
      })
    })

    it('provides descriptive help text for action buttons', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        const manageButton = screen.getByTestId('manage-classes-button')
        const analyticsButton = screen.getByTestId('view-analytics-button')
        
        expect(manageButton).toHaveAttribute('aria-describedby', 'manage-classes-help')
        expect(analyticsButton).toHaveAttribute('aria-describedby', 'analytics-help')
      })
    })

    it('provides screen reader friendly growth indicators', async () => {
      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        const revenueGrowth = screen.getByTestId('revenue-growth')
        expect(revenueGrowth).toHaveAttribute('aria-label', 'Increased by 20%')
      })
    })

    it('supports keyboard navigation through quick actions', async () => {
      const { user } = render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByTestId('add-class-action')).toBeInTheDocument()
      })

      const actions = [
        'add-class-action',
        'manage-schedule-action', 
        'view-bookings-action',
        'studio-settings-action'
      ]

      for (const action of actions) {
        await user.tab()
        expect(screen.getByTestId(action)).toHaveFocus()
      }
    })

    it('announces errors to screen readers', async () => {
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/studios/:id', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }))
        })
      )

      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toHaveAttribute('aria-live', 'assertive')
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('maintains structure with different data values', async () => {
      // Test with different analytics data
      mockHandlers.server.use(
        mockHandlers.rest.get('/api/analytics/studio/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({
            data: {
              revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
              bookings: { total: 0, thisMonth: 0, lastMonth: 0, growth: -10 },
              classes: { total: 0, active: 0, upcoming: 0 },
              members: { total: 0, active: 0, new: 0 },
            }
          }))
        })
      )

      render(<MockStudioDashboard studioId={mockStudioId} />)

      await waitFor(() => {
        expect(screen.getByTestId('revenue-total')).toHaveTextContent('$0.00')
        expect(screen.getByTestId('bookings-growth')).toHaveClass('text-red-600') // Negative growth
      })
    })
  })
})