import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { ShutdownForm } from './ShutdownForm'

function renderForm() {
  return render(
    <AutoinstallConfigProvider>
      <ShutdownForm />
    </AutoinstallConfigProvider>
  )
}

describe('ShutdownForm', () => {
  it('renders shutdown-select testid', () => {
    renderForm()
    expect(screen.getByTestId('shutdown-select')).toBeTruthy()
  })

  it('renders No preference option', () => {
    renderForm()
    expect(screen.getByTestId('shutdown-select')).toBeTruthy()
  })

  it('renders Shutdown label', () => {
    renderForm()
    expect(screen.getAllByText('Shutdown').length).toBeGreaterThan(0)
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
