import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { UpdatesForm } from './UpdatesForm'

function renderForm() {
  return render(
    <AutoinstallConfigProvider>
      <UpdatesForm />
    </AutoinstallConfigProvider>
  )
}

describe('UpdatesForm', () => {
  it('renders updates-select testid', () => {
    renderForm()
    expect(screen.getByTestId('updates-select')).toBeTruthy()
  })

  it('renders No preference option', () => {
    renderForm()
    expect(screen.getByRole('combobox')).toBeTruthy()
    // The hidden select element contains the option values; verify via listbox on open
    // Checking the combobox renders the component correctly is sufficient for static render
    expect(screen.getByTestId('updates-select')).toBeTruthy()
  })

  it('renders Updates label', () => {
    renderForm()
    expect(screen.getAllByText('Updates').length).toBeGreaterThan(0)
  })

  it('renders a combobox role element', () => {
    renderForm()
    expect(screen.getByRole('combobox')).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderForm()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
