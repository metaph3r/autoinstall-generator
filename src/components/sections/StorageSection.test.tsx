import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { StorageSection } from './StorageSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <StorageSection />
    </AutoinstallConfigProvider>
  )
}

describe('StorageSection', () => {
  it('renders storage layout radio group by default', () => {
    renderSection()
    expect(screen.getByRole('radio', { name: 'lvm' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'direct' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'zfs' })).toBeTruthy()
  })

  it('renders action mode switch', () => {
    renderSection()
    expect(screen.getByTestId('action-mode-switch')).toBeTruthy()
  })

  it('shows Edit Storage Actions YAML button when action mode is enabled', async () => {
    const user = userEvent.setup()
    renderSection()
    const toggle = screen.getByTestId('action-mode-switch')
    await user.click(toggle)
    expect(screen.getByTestId('edit-storage-actions-button')).toBeTruthy()
  })

  it('hides radio group when action mode is enabled', async () => {
    const user = userEvent.setup()
    renderSection()
    const toggle = screen.getByTestId('action-mode-switch')
    await user.click(toggle)
    expect(screen.queryByRole('radio', { name: 'lvm' })).toBeNull()
  })

  it('opens YamlEditorDialog on Edit Storage Actions YAML click', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('action-mode-switch'))
    await user.click(screen.getByTestId('edit-storage-actions-button'))
    expect(screen.getByText('Storage Actions YAML')).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
