import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { NetworkSection } from './NetworkSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <NetworkSection />
    </AutoinstallConfigProvider>
  )
}

describe('NetworkSection', () => {
  it('renders Edit Network YAML button', () => {
    renderSection()
    expect(screen.getByTestId('edit-network-yaml-button')).toBeTruthy()
  })

  it('renders Proxy text field', () => {
    renderSection()
    expect(screen.getByRole('textbox', { name: /Proxy/i })).toBeTruthy()
  })

  it('opens YamlEditorDialog on Edit Network YAML button click', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('edit-network-yaml-button'))
    // Dialog title should appear
    expect(screen.getByText('Network YAML (Netplan)')).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
