import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { SystemSection } from './SystemSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <SystemSection />
    </AutoinstallConfigProvider>
  )
}

describe('SystemSection', () => {
  it('renders version field', () => {
    renderSection()
    expect(screen.getByTestId('version-field')).toBeTruthy()
  })

  it('renders Add Section button for interactive sections', () => {
    renderSection()
    expect(screen.getByTestId('add-interactive-section')).toBeTruthy()
  })

  it('renders Add Command buttons for early/late/error commands', () => {
    renderSection()
    expect(screen.getByTestId('add-early-command')).toBeTruthy()
    expect(screen.getByTestId('add-late-command')).toBeTruthy()
    expect(screen.getByTestId('add-error-command')).toBeTruthy()
  })

  it('adds interactive section entry on click', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-interactive-section'))
    expect(screen.getByRole('textbox', { name: /Section 1/i })).toBeTruthy()
  })

  it('adds early command entry on click', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-early-command'))
    expect(screen.getByRole('textbox', { name: /Command 1/i })).toBeTruthy()
  })

  it('renders Refresh Installer toggle', () => {
    renderSection()
    expect(screen.getByRole('checkbox', { name: /Refresh Installer/i })).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
