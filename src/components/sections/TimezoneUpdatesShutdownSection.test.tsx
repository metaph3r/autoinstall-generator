import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { TimezoneUpdatesShutdownSection } from './TimezoneUpdatesShutdownSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <TimezoneUpdatesShutdownSection />
    </AutoinstallConfigProvider>
  )
}

describe('TimezoneUpdatesShutdownSection', () => {
  it('renders timezone field', () => {
    renderSection()
    expect(screen.getByTestId('timezone-field')).toBeTruthy()
  })

  it('renders updates select', () => {
    renderSection()
    expect(screen.getByTestId('updates-select')).toBeTruthy()
  })

  it('renders shutdown select', () => {
    renderSection()
    expect(screen.getByTestId('shutdown-select')).toBeTruthy()
  })

  it('allows typing into timezone field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('timezone-field')
    await user.type(input, 'Europe/Berlin')
    expect((input as HTMLInputElement).value).toBe('Europe/Berlin')
  })

  it('renders updates select by id', () => {
    renderSection()
    expect(screen.getByTestId('updates-select')).toBeTruthy()
  })

  it('renders shutdown select by id', () => {
    renderSection()
    expect(screen.getByTestId('shutdown-select')).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
