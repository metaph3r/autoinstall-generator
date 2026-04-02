import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { CodecsDriversOemSection } from './CodecsDriversOemSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <CodecsDriversOemSection />
    </AutoinstallConfigProvider>
  )
}

describe('CodecsDriversOemSection', () => {
  it('renders codecs install switch', () => {
    renderSection()
    expect(screen.getByTestId('codecs-install-switch')).toBeTruthy()
  })

  it('renders drivers install switch', () => {
    renderSection()
    expect(screen.getByTestId('drivers-install-switch')).toBeTruthy()
  })

  it('renders OEM select', () => {
    renderSection()
    expect(screen.getByTestId('oem-select')).toBeTruthy()
  })

  it('toggles codecs install switch', async () => {
    const user = userEvent.setup()
    renderSection()
    const toggle = screen.getByTestId('codecs-install-switch')
    expect((toggle as HTMLInputElement).checked).toBe(false)
    await user.click(toggle)
    expect((toggle as HTMLInputElement).checked).toBe(true)
  })

  it('toggles drivers install switch', async () => {
    const user = userEvent.setup()
    renderSection()
    const toggle = screen.getByTestId('drivers-install-switch')
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
