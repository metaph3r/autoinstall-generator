import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { FormContent } from './FormContent'

function renderFormContent(activeTab: number) {
  return render(
    <AutoinstallConfigProvider>
      <FormContent activeTab={activeTab} />
    </AutoinstallConfigProvider>
  )
}

describe('FormContent', () => {
  it('renders first tab panel (System) when activeTab=0', () => {
    renderFormContent(0)
    expect(screen.getByRole('tabpanel', { hidden: false })).toBeTruthy()
  })

  it('shows System tab with Version field when activeTab=0', () => {
    renderFormContent(0)
    // SystemSection renders a Version label
    expect(screen.getByText('Version')).toBeTruthy()
  })

  it('shows Network tab with Edit button when activeTab=1', () => {
    renderFormContent(1)
    expect(screen.getByTestId('edit-network-yaml-button')).toBeTruthy()
  })

  it('shows Software tab sections when activeTab=4', () => {
    renderFormContent(4)
    expect(screen.getByText('Snaps')).toBeTruthy()
  })

  it('shows Configuration tab sections when activeTab=5', () => {
    renderFormContent(5)
    expect(screen.getByTestId('timezone-field')).toBeTruthy()
  })

  it('switches visible panel when activeTab changes', () => {
    const { rerender } = renderFormContent(0)
    expect(screen.getByText('Version')).toBeTruthy()
    rerender(
      <AutoinstallConfigProvider>
        <FormContent activeTab={3} />
      </AutoinstallConfigProvider>
    )
    // Identity & Auth tab
    expect(screen.getByText('Identity')).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderFormContent(0)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
