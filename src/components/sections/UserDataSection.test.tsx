import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { UserDataSection } from './UserDataSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <UserDataSection />
    </AutoinstallConfigProvider>
  )
}

describe('UserDataSection', () => {
  it('renders name field', () => {
    renderSection()
    expect(screen.getByTestId('user-data-name-field')).toBeTruthy()
  })

  it('renders gecos field', () => {
    renderSection()
    expect(screen.getByTestId('user-data-gecos-field')).toBeTruthy()
  })

  it('renders passwd field', () => {
    renderSection()
    expect(screen.getByTestId('user-data-passwd-field')).toBeTruthy()
  })

  it('renders groups field', () => {
    renderSection()
    expect(screen.getByTestId('user-data-groups-field')).toBeTruthy()
  })

  it('renders shell field', () => {
    renderSection()
    expect(screen.getByTestId('user-data-shell-field')).toBeTruthy()
  })

  it('renders lock_passwd switch', () => {
    renderSection()
    expect(screen.getByTestId('user-data-lock-passwd-switch')).toBeTruthy()
  })

  it('renders password field with type password', () => {
    renderSection()
    const field = screen.getByTestId('user-data-passwd-field')
    expect(field.getAttribute('type')).toBe('password')
  })

  it('allows typing into name field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('user-data-name-field')
    await user.type(input, 'John Doe')
    expect((input as HTMLInputElement).value).toBe('John Doe')
  })

  it('allows typing into groups field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('user-data-groups-field')
    await user.type(input, 'sudo,adm')
    expect((input as HTMLInputElement).value).toBe('sudo,adm')
  })

  it('allows toggling lock_passwd switch', async () => {
    const user = userEvent.setup()
    renderSection()
    const switchInput = screen.getByTestId('user-data-lock-passwd-switch')
    expect((switchInput as HTMLInputElement).checked).toBe(false)
    await user.click(switchInput)
    expect((switchInput as HTMLInputElement).checked).toBe(true)
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
