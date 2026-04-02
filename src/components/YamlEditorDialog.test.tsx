import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect, vi } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { YamlEditorDialog } from './YamlEditorDialog'

function renderDialog(props: Partial<Parameters<typeof YamlEditorDialog>[0]> = {}) {
  const defaults = {
    open: true,
    section: 'network' as const,
    value: 'version: 2\nethernets: {}',
    onConfirm: vi.fn(),
    onClose: vi.fn(),
    ...props,
  }
  return render(
    <AutoinstallConfigProvider>
      <YamlEditorDialog {...defaults} />
    </AutoinstallConfigProvider>
  )
}

describe('YamlEditorDialog', () => {
  it('renders dialog with pre-filled YAML value', () => {
    renderDialog({ value: 'version: 2' })
    const textarea = screen.getByTestId('yaml-editor-textarea').querySelector('textarea')
    expect(textarea?.value).toContain('version: 2')
  })

  it('renders dialog title for network section', () => {
    renderDialog({ section: 'network' })
    expect(screen.getByText('Network YAML (Netplan)')).toBeTruthy()
  })

  it('renders dialog title for storage-actions section', () => {
    renderDialog({ section: 'storage-actions' })
    expect(screen.getByText('Storage Actions YAML')).toBeTruthy()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDialog({ onClose })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onConfirm and onClose with valid YAML on Confirm', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    renderDialog({ value: 'version: 2\nethernets: {}', onConfirm, onClose })
    await user.click(screen.getByTestId('yaml-confirm-button'))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows inline error and keeps dialog open on invalid YAML', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDialog({ value: 'valid: yaml', onClose })

    const textarea = screen.getByTestId('yaml-editor-textarea').querySelector('textarea')!
    // fireEvent.change avoids userEvent keyboard parsing issues with special chars
    fireEvent.change(textarea, { target: { value: '%invalid directive' } })

    await user.click(screen.getByTestId('yaml-confirm-button'))

    await waitFor(() => {
      expect(screen.getByTestId('yaml-parse-error')).toBeTruthy()
    })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('dispatches SET_NETWORK action for network section', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderDialog({ section: 'network', value: 'version: 2', onConfirm })
    await user.click(screen.getByTestId('yaml-confirm-button'))
    expect(onConfirm).toHaveBeenCalledWith('version: 2')
  })

  it('dispatches SET_STORAGE_ACTIONS action for storage-actions section', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderDialog({
      section: 'storage-actions',
      value: '- id: disk0\n  type: disk',
      onConfirm,
    })
    await user.click(screen.getByTestId('yaml-confirm-button'))
    expect(onConfirm).toHaveBeenCalledWith('- id: disk0\n  type: disk')
  })

  it('clears error when dialog is closed and reopened', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(
      <AutoinstallConfigProvider>
        <YamlEditorDialog
          open={true}
          section="network"
          value="valid: yaml"
          onConfirm={vi.fn()}
          onClose={onClose}
        />
      </AutoinstallConfigProvider>
    )

    // Trigger error
    const textarea = screen.getByTestId('yaml-editor-textarea').querySelector('textarea')!
    fireEvent.change(textarea, { target: { value: '%bad directive' } })
    await user.click(screen.getByTestId('yaml-confirm-button'))
    await waitFor(() => expect(screen.getByTestId('yaml-parse-error')).toBeTruthy())

    // Close and reopen
    rerender(
      <AutoinstallConfigProvider>
        <YamlEditorDialog
          open={false}
          section="network"
          value="valid: yaml"
          onConfirm={vi.fn()}
          onClose={onClose}
        />
      </AutoinstallConfigProvider>
    )
    rerender(
      <AutoinstallConfigProvider>
        <YamlEditorDialog
          open={true}
          section="network"
          value="valid: yaml"
          onConfirm={vi.fn()}
          onClose={onClose}
        />
      </AutoinstallConfigProvider>
    )
    expect(screen.queryByTestId('yaml-parse-error')).toBeNull()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderDialog()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
