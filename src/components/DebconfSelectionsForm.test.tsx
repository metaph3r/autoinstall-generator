import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { DebconfSelectionsForm } from './DebconfSelectionsForm'

function renderForm() {
  return render(
    <AutoinstallConfigProvider>
      <DebconfSelectionsForm />
    </AutoinstallConfigProvider>
  )
}

describe('DebconfSelectionsForm', () => {
  it('renders field with data-testid debconf-selections-field', () => {
    renderForm()
    expect(screen.getByTestId('debconf-selections-field')).toBeTruthy()
  })

  it('renders multiline TextField with minRows >= 4', () => {
    renderForm()
    const field = screen.getByTestId('debconf-selections-field')
    // MUI renders a textarea element for multiline TextField
    expect(field.tagName.toLowerCase()).toBe('textarea')
  })

  it('typing into the field updates value', async () => {
    const user = userEvent.setup()
    renderForm()
    const input = screen.getByTestId('debconf-selections-field')
    await user.type(input, 'pkg/option string value')
    expect((input as HTMLTextAreaElement).value).toBe('pkg/option string value')
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderForm()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
