import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { AptSection } from './AptSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <AptSection />
    </AutoinstallConfigProvider>
  )
}

describe('AptSection', () => {
  it('renders preserve sources list switch', () => {
    renderSection()
    expect(screen.getByTestId('preserve-sources-list-switch')).toBeTruthy()
  })

  it('renders geoip switch', () => {
    renderSection()
    expect(screen.getByTestId('geoip-switch')).toBeTruthy()
  })

  it('renders fallback select', () => {
    renderSection()
    expect(screen.getByTestId('apt-fallback-select')).toBeTruthy()
  })

  it('toggles preserve sources list switch', async () => {
    const user = userEvent.setup()
    renderSection()
    const toggle = screen.getByTestId('preserve-sources-list-switch')
    expect((toggle as HTMLInputElement).checked).toBe(false)
    await user.click(toggle)
    expect((toggle as HTMLInputElement).checked).toBe(true)
  })

  it('toggles geoip switch', async () => {
    const user = userEvent.setup()
    renderSection()
    const toggle = screen.getByTestId('geoip-switch')
    expect((toggle as HTMLInputElement).checked).toBe(false)
    await user.click(toggle)
    expect((toggle as HTMLInputElement).checked).toBe(true)
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
