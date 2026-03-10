import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CreditBalance } from './credit-balance'

describe('CreditBalance', () => {
  it('applies animate-pulse class when credits === 2', () => {
    render(<CreditBalance credits={2} />)
    const el = screen.getByTestId('credit-amount')
    expect(el.className).toContain('animate-pulse')
  })

  it('applies animate-pulse class when credits === 1', () => {
    render(<CreditBalance credits={1} />)
    const el = screen.getByTestId('credit-amount')
    expect(el.className).toContain('animate-pulse')
  })

  it('applies animate-pulse class when credits === 0', () => {
    render(<CreditBalance credits={0} />)
    const el = screen.getByTestId('credit-amount')
    expect(el.className).toContain('animate-pulse')
  })

  it('does NOT apply animate-pulse class when credits === 3', () => {
    render(<CreditBalance credits={3} />)
    const el = screen.getByTestId('credit-amount')
    expect(el.className).not.toContain('animate-pulse')
  })
})
