import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { KernelCrashDumpsSection } from './KernelCrashDumpsSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <KernelCrashDumpsSection />
    </AutoinstallConfigProvider>
  )
}

describe('KernelCrashDumpsSection', () => {
  it('renders kernel crash dumps select', () => {
    renderSection()
    expect(screen.getByTestId('kernel-crash-dumps-select')).toBeTruthy()
  })

  it('renders Unset, Enabled, and Disabled options in the label area', () => {
    renderSection()
    expect(screen.getByLabelText(/Kernel Crash Dumps/i)).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
