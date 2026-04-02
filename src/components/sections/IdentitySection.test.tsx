import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { IdentitySection } from './IdentitySection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <IdentitySection />
    </AutoinstallConfigProvider>
  )
}

describe('IdentitySection', () => {
  it('renders all identity fields', () => {
    renderSection()
    expect(screen.getByTestId('realname-field')).toBeTruthy()
    expect(screen.getByTestId('username-field')).toBeTruthy()
    expect(screen.getByTestId('hostname-field')).toBeTruthy()
    expect(screen.getByTestId('password-field')).toBeTruthy()
  })

  it('renders username as required', () => {
    renderSection()
    const usernameField = screen.getByLabelText(/Username/i)
    expect(usernameField).toBeTruthy()
  })

  it('renders hostname as required', () => {
    renderSection()
    expect(screen.getByLabelText(/Hostname/i)).toBeTruthy()
  })

  it('renders password field with type password', () => {
    renderSection()
    const passwordField = screen.getByTestId('password-field')
    expect(passwordField.getAttribute('type')).toBe('password')
  })

  it('allows typing into username field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('username-field')
    await user.type(input, 'testuser')
    expect((input as HTMLInputElement).value).toBe('testuser')
  })

  it('allows typing into hostname field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('hostname-field')
    await user.type(input, 'myhost')
    expect((input as HTMLInputElement).value).toBe('myhost')
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
