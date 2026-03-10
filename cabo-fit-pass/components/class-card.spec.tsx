import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClassCard } from './class-card'

const minimalClass = {
  id: 'cls-1',
  title: 'Morning Yoga',
  instructor_name: 'Ana García',
  class_type: 'yoga',
  difficulty_level: 'beginner',
  scheduled_at: '2026-03-15T08:00:00Z',
  duration_minutes: 60,
  credit_cost: 3,
  max_capacity: 20,
  studio: { name: 'Sunset Studio', address: 'Cabo San Lucas' },
  spots_remaining: 5,
}

describe('ClassCard', () => {
  it('renders title prop', () => {
    render(<ClassCard class={minimalClass} onBook={vi.fn()} userCredits={5} />)
    expect(screen.getByText('Morning Yoga')).toBeTruthy()
  })

  it('renders credit_cost as "{n} credits"', () => {
    render(<ClassCard class={minimalClass} onBook={vi.fn()} userCredits={5} />)
    expect(screen.getByText('3 credits')).toBeTruthy()
  })

  it('renders instructor_name', () => {
    render(<ClassCard class={minimalClass} onBook={vi.fn()} userCredits={5} />)
    expect(screen.getByText('Ana García')).toBeTruthy()
  })

  it('renders spots_remaining as "{n} spots left"', () => {
    render(<ClassCard class={minimalClass} onBook={vi.fn()} userCredits={5} />)
    expect(screen.getByText('5 spots left')).toBeTruthy()
  })

  it('renders "Full" when spots_remaining is 0', () => {
    render(<ClassCard class={{ ...minimalClass, spots_remaining: 0 }} onBook={vi.fn()} userCredits={5} />)
    expect(screen.getByText('Full')).toBeTruthy()
  })

  it('renders loading skeleton when isPending is true', () => {
    render(<ClassCard class={minimalClass} onBook={vi.fn()} userCredits={5} isPending />)
    expect(screen.getByTestId('class-skeleton')).toBeTruthy()
  })
})
