import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { UserDataForm } from './UserDataForm'

function renderForm() {
  return render(
    <AutoinstallConfigProvider>
      <UserDataForm />
    </AutoinstallConfigProvider>
  )
}

describe('UserDataForm', () => {
  it('renders name field', () => {
    renderForm()
    expect(screen.getByTestId('user-data-name-field')).toBeTruthy()
  })

  it('renders gecos field', () => {
    renderForm()
    expect(screen.getByTestId('user-data-gecos-field')).toBeTruthy()
  })

  it('renders passwd field', () => {
    renderForm()
    expect(screen.getByTestId('user-data-passwd-field')).toBeTruthy()
  })

  it('renders groups field', () => {
    renderForm()
    expect(screen.getByTestId('user-data-groups-field')).toBeTruthy()
  })

  it('renders shell field', () => {
    renderForm()
    expect(screen.getByTestId('user-data-shell-field')).toBeTruthy()
  })

  it('renders switch labelled Lock password', () => {
    renderForm()
    expect(screen.getByTestId('user-data-lock-passwd-switch')).toBeTruthy()
    expect(screen.getByLabelText('Lock password')).toBeTruthy()
  })

  it('does NOT have data-testid yaml-editor-textarea', () => {
    renderForm()
    expect(screen.queryByTestId('yaml-editor-textarea')).toBeNull()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderForm()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('allows typing into name field', async () => {
    const user = userEvent.setup()
    renderForm()
    const input = screen.getByTestId('user-data-name-field')
    await user.type(input, 'johndoe')
    expect((input as HTMLInputElement).value).toBe('johndoe')
  })

  it('allows toggling lock_passwd switch', async () => {
    const user = userEvent.setup()
    renderForm()
    const switchInput = screen.getByTestId('user-data-lock-passwd-switch')
    expect((switchInput as HTMLInputElement).checked).toBe(false)
    await user.click(switchInput)
    expect((switchInput as HTMLInputElement).checked).toBe(true)
  })
})
