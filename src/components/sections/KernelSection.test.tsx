import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { KernelSection } from './KernelSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <KernelSection />
    </AutoinstallConfigProvider>
  )
}

describe('KernelSection', () => {
  it('renders kernel type radio group', () => {
    renderSection()
    expect(screen.getByTestId('kernel-type-package')).toBeTruthy()
    expect(screen.getByTestId('kernel-type-flavor')).toBeTruthy()
  })

  it('renders kernel value field', () => {
    renderSection()
    expect(screen.getByTestId('kernel-value-field')).toBeTruthy()
  })

  it('defaults to package type', () => {
    renderSection()
    const packageRadio = screen.getByTestId('kernel-type-package')
    expect((packageRadio as HTMLInputElement).checked).toBe(true)
  })

  it('shows Package Name label by default', () => {
    renderSection()
    expect(screen.getByLabelText(/Package Name/i)).toBeTruthy()
  })

  it('switches to flavor and updates label', async () => {
    const user = userEvent.setup()
    renderSection()
    const flavorRadio = screen.getByTestId('kernel-type-flavor')
    await user.click(flavorRadio)
    expect((flavorRadio as HTMLInputElement).checked).toBe(true)
    expect(screen.getByLabelText(/Flavor Name/i)).toBeTruthy()
  })

  it('allows typing a kernel value', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('kernel-value-field')
    await user.type(input, 'linux-generic')
    expect((input as HTMLInputElement).value).toBe('linux-generic')
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
