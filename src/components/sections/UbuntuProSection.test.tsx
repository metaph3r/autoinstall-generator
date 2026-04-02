import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { UbuntuProSection } from './UbuntuProSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <UbuntuProSection />
    </AutoinstallConfigProvider>
  )
}

describe('UbuntuProSection', () => {
  it('renders token field', () => {
    renderSection()
    expect(screen.getByTestId('ubuntu-pro-token-field')).toBeTruthy()
  })

  it('shows no error for empty token (optional)', async () => {
    renderSection()
    const input = screen.getByTestId('ubuntu-pro-token-field')
    expect(input).toBeTruthy()
    // No error should show when field is empty
    expect(screen.queryByText(/Token must be between/i)).toBeNull()
  })

  it('shows validation error for token that is too short', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('ubuntu-pro-token-field')
    await user.type(input, 'tooshort')
    await user.tab()
    expect(screen.getByText('Token must be between 24 and 30 characters')).toBeTruthy()
  })

  it('accepts a valid token of 24 characters', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('ubuntu-pro-token-field')
    await user.type(input, 'a'.repeat(24))
    await user.tab()
    expect(screen.queryByText(/Token must be between/i)).toBeNull()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
