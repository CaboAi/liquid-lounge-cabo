import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import config from '../../tailwind.config'

describe('tailwind design tokens', () => {
  it('cabo-gold DEFAULT is #FF9F43', () => {
    const colors = config.theme?.extend?.colors as Record<string, { DEFAULT: string }>
    expect(colors['cabo-gold']?.DEFAULT).toBe('#FF9F43')
  })

  it('ocean-blue DEFAULT is #0EA5E9', () => {
    const colors = config.theme?.extend?.colors as Record<string, { DEFAULT: string }>
    expect(colors['ocean-blue']?.DEFAULT).toBe('#0EA5E9')
  })

  it('fontFamily.sans uses --font-inter variable', () => {
    const fontFamily = config.theme?.extend?.fontFamily as Record<string, string[]>
    expect(fontFamily.sans[0]).toBe('var(--font-inter)')
  })

  it('fontFamily.mono uses --font-roboto-mono variable', () => {
    const fontFamily = config.theme?.extend?.fontFamily as Record<string, string[]>
    expect(fontFamily.mono[0]).toBe('var(--font-roboto-mono)')
  })

  it('content array includes components path', () => {
    const content = config.content as string[]
    const hasComponents = content.some((p) => p.includes('./components/'))
    expect(hasComponents).toBe(true)
  })
})

describe('layout font migration', () => {
  it('layout.tsx uses CSS variable --font-inter not .className', () => {
    const src = readFileSync(resolve(__dirname, '../../app/layout.tsx'), 'utf-8')
    expect(src).toContain('--font-inter')
    expect(src).not.toContain('inter.className')
  })
})
