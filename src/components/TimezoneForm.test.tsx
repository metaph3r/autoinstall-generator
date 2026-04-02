import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { TimezoneForm } from './TimezoneForm'

function renderForm() {
  return render(
    <AutoinstallConfigProvider>
      <TimezoneForm />
    </AutoinstallConfigProvider>
  )
}

describe('TimezoneForm', () => {
  it('renders timezone field', () => {
    renderForm()
    expect(screen.getByTestId('timezone-field')).toBeTruthy()
  })

  it('typing Europe/Berlin updates the input value', async () => {
    const user = userEvent.setup()
    renderForm()
    const input = screen.getByTestId('timezone-field')
    await user.type(input, 'Europe/Berlin')
    expect((input as HTMLInputElement).value).toBe('Europe/Berlin')
  })

  it('input starts empty when state.timezone is undefined', () => {
    renderForm()
    const input = screen.getByTestId('timezone-field')
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('renders the label Timezone', () => {
    renderForm()
    expect(screen.getByLabelText('Timezone')).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderForm()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
