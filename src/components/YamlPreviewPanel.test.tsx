import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { YamlPreviewPanel } from './YamlPreviewPanel'

function renderPanel() {
  return render(
    <AutoinstallConfigProvider>
      <YamlPreviewPanel />
    </AutoinstallConfigProvider>
  )
}

describe('YamlPreviewPanel', () => {
  it('renders the YAML preview area', () => {
    renderPanel()
    expect(screen.getByTestId('yaml-preview-content')).toBeTruthy()
  })

  it('renders Copy and Download buttons', () => {
    renderPanel()
    expect(screen.getByTestId('copy-button')).toBeTruthy()
    expect(screen.getByTestId('download-button')).toBeTruthy()
  })

  it('preview contains autoinstall root key', () => {
    renderPanel()
    expect(screen.getByTestId('yaml-preview-content').textContent).toContain('autoinstall')
  })

  it('preview area has aria-live="polite"', () => {
    renderPanel()
    const previewArea = screen.getByTestId('yaml-preview-content')
    expect(previewArea.getAttribute('aria-live')).toBe('polite')
  })

  describe('Copy button', () => {
    let writeText: ReturnType<typeof vi.fn>
    let originalClipboard: Clipboard

    beforeEach(() => {
      originalClipboard = navigator.clipboard
      writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      })
    })

    it('shows warning toast when required fields are missing', async () => {
      const user = userEvent.setup()
      renderPanel()
      await user.click(screen.getByTestId('copy-button'))
      await waitFor(() => {
        expect(screen.getByTestId('toast-alert')).toBeTruthy()
        expect(screen.getByTestId('toast-alert').textContent).toContain('Missing required fields')
      })
    })
  })

  describe('Download button', () => {
    it('shows warning toast when required fields are missing', async () => {
      const user = userEvent.setup()
      renderPanel()
      await user.click(screen.getByTestId('download-button'))
      await waitFor(() => {
        expect(screen.getByTestId('toast-alert')).toBeTruthy()
        expect(screen.getByTestId('toast-alert').textContent).toContain('Missing required fields')
      })
    })

    it('triggers download when required fields are filled', async () => {
      const user = userEvent.setup()
      const createObjectURL = vi.fn().mockReturnValue('blob:mock')
      const revokeObjectURL = vi.fn()
      globalThis.URL.createObjectURL = createObjectURL
      globalThis.URL.revokeObjectURL = revokeObjectURL

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

      const { rerender } = render(
        <AutoinstallConfigProvider>
          <YamlPreviewPanel />
        </AutoinstallConfigProvider>
      )

      // Dispatch identity to satisfy required fields
      // We need to render with a Provider that has filled identity
      // Use a custom wrapper
      const { AutoinstallConfigProvider: Provider, useAutoinstallConfig } = await import(
        '../context/AutoinstallConfigContext'
      )

      function FilledPanel() {
        const { dispatch } = useAutoinstallConfig()
        return (
          <>
            <button
              onClick={() =>
                dispatch({
                  type: 'SET_IDENTITY',
                  payload: { username: 'ubuntu', hostname: 'myhost', password: '$6$abc' },
                })
              }
              data-testid="fill-identity"
            >
              Fill
            </button>
            <YamlPreviewPanel />
          </>
        )
      }

      rerender(
        <Provider>
          <FilledPanel />
        </Provider>
      )

      await user.click(screen.getByTestId('fill-identity'))
      await act(async () => {})
      await user.click(screen.getByTestId('download-button'))

      await waitFor(() => {
        expect(createObjectURL).toHaveBeenCalledOnce()
        expect(clickSpy).toHaveBeenCalledOnce()
        expect(revokeObjectURL).toHaveBeenCalledOnce()
      })

      clickSpy.mockRestore()
    })
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderPanel()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
