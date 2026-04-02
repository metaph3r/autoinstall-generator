import { render, screen, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider, useAutoinstallConfig, reducer, initialState } from './AutoinstallConfigContext'
import type { AutoinstallAction } from './AutoinstallConfigContext'

function ConsumerComponent() {
  const { state, dispatch } = useAutoinstallConfig()
  return (
    <div>
      <span data-testid="version">{state.version}</span>
      <span data-testid="has-dispatch">{typeof dispatch}</span>
    </div>
  )
}

function ThrowingComponent() {
  useAutoinstallConfig()
  return null
}

describe('AutoinstallConfigContext', () => {
  it('throws a descriptive error when hook is called outside Provider', () => {
    const consoleError = console.error
    console.error = () => {}
    expect(() => render(<ThrowingComponent />)).toThrow(
      'useAutoinstallConfig must be used within AutoinstallConfigProvider'
    )
    console.error = consoleError
  })

  it('returns state and dispatch when used inside Provider', () => {
    render(
      <AutoinstallConfigProvider>
        <ConsumerComponent />
      </AutoinstallConfigProvider>
    )
    expect(screen.getByTestId('version').textContent).toBe('1')
    expect(screen.getByTestId('has-dispatch').textContent).toBe('function')
  })
})

describe('reducer', () => {
  it('SET_VERSION updates version', () => {
    const action: AutoinstallAction = { type: 'SET_VERSION', payload: 2 }
    const next = reducer(initialState, action)
    expect(next.version).toBe(2)
  })

  it('SET_LOCALE updates locale', () => {
    const next = reducer(initialState, { type: 'SET_LOCALE', payload: 'de_DE.UTF-8' })
    expect(next.locale).toBe('de_DE.UTF-8')
  })

  it('SET_LOCALE with undefined clears locale', () => {
    const state = { ...initialState, locale: 'en_US.UTF-8' }
    const next = reducer(state, { type: 'SET_LOCALE', payload: undefined })
    expect(next.locale).toBeUndefined()
  })

  it('SET_KEYBOARD updates keyboard config', () => {
    const next = reducer(initialState, {
      type: 'SET_KEYBOARD',
      payload: { layout: 'de', variant: 'nodeadkeys' },
    })
    expect(next.keyboard).toEqual({ layout: 'de', variant: 'nodeadkeys' })
  })

  it('SET_IDENTITY updates identity', () => {
    const identity = { username: 'ubuntu', hostname: 'myhost', password: '$6$...' }
    const next = reducer(initialState, { type: 'SET_IDENTITY', payload: identity })
    expect(next.identity).toEqual(identity)
  })

  it('SET_STORAGE_LAYOUT sets layout and clears actionMode', () => {
    const withActionMode = { ...initialState, storage: { actionMode: true, actions: 'raw: yaml' } }
    const next = reducer(withActionMode, {
      type: 'SET_STORAGE_LAYOUT',
      payload: { name: 'lvm' },
    })
    expect(next.storage?.layout).toEqual({ name: 'lvm' })
    expect(next.storage?.actionMode).toBe(false)
  })

  it('SET_STORAGE_ACTION_MODE toggles action mode', () => {
    const next = reducer(initialState, { type: 'SET_STORAGE_ACTION_MODE', payload: true })
    expect(next.storage?.actionMode).toBe(true)
  })

  it('SET_STORAGE_ACTIONS stores raw YAML string', () => {
    const next = reducer(initialState, {
      type: 'SET_STORAGE_ACTIONS',
      payload: '- id: disk0\n  type: disk',
    })
    expect(next.storage?.actions).toBe('- id: disk0\n  type: disk')
  })

  it('SET_NETWORK stores raw YAML string', () => {
    const next = reducer(initialState, {
      type: 'SET_NETWORK',
      payload: 'version: 2\nethernets:\n  eth0:\n    dhcp4: true',
    })
    expect(next.network).toContain('eth0')
  })

  it('SET_SSH updates SSH config', () => {
    const next = reducer(initialState, {
      type: 'SET_SSH',
      payload: { 'install-server': true, 'authorized-keys': ['ssh-rsa AAAA...'] },
    })
    expect(next.ssh?.['install-server']).toBe(true)
    expect(next.ssh?.['authorized-keys']).toHaveLength(1)
  })

  it('SET_SNAPS stores snap list', () => {
    const snaps = [{ name: 'snapcraft', channel: 'stable', classic: true }]
    const next = reducer(initialState, { type: 'SET_SNAPS', payload: snaps })
    expect(next.snaps).toEqual(snaps)
  })

  it('SET_PACKAGES stores package list', () => {
    const next = reducer(initialState, { type: 'SET_PACKAGES', payload: ['git', 'vim'] })
    expect(next.packages).toEqual(['git', 'vim'])
  })

  it('SET_KERNEL stores kernel config', () => {
    const next = reducer(initialState, { type: 'SET_KERNEL', payload: { flavor: 'generic' } })
    expect(next.kernel).toEqual({ flavor: 'generic' })
  })

  it('SET_KERNEL_CRASH_DUMPS allows null', () => {
    const next = reducer(initialState, { type: 'SET_KERNEL_CRASH_DUMPS', payload: null })
    expect(next['kernel-crash-dumps']).toBeNull()
  })

  it('SET_REPORTING stores handlers', () => {
    const handlers = { 'my-hook': { type: 'webhook', endpoint: 'https://example.com' } }
    const next = reducer(initialState, { type: 'SET_REPORTING', payload: handlers })
    expect(next.reporting?.['my-hook']?.type).toBe('webhook')
  })

  it('SET_OEM stores auto value', () => {
    const next = reducer(initialState, { type: 'SET_OEM', payload: 'auto' })
    expect(next.oem).toBe('auto')
  })

  it('SET_UBUNTU_PRO stores token', () => {
    const next = reducer(initialState, {
      type: 'SET_UBUNTU_PRO',
      payload: { token: 'C123456789012345678901234' },
    })
    expect(next['ubuntu-pro']?.token).toBe('C123456789012345678901234')
  })

  it('SET_TIMEZONE updates timezone', () => {
    const next = reducer(initialState, { type: 'SET_TIMEZONE', payload: 'Europe/Berlin' })
    expect(next.timezone).toBe('Europe/Berlin')
  })

  it('SET_UPDATES stores security or all', () => {
    const next = reducer(initialState, { type: 'SET_UPDATES', payload: 'all' })
    expect(next.updates).toBe('all')
  })

  it('SET_SHUTDOWN stores reboot or poweroff', () => {
    const next = reducer(initialState, { type: 'SET_SHUTDOWN', payload: 'poweroff' })
    expect(next.shutdown).toBe('poweroff')
  })

  it('SET_ZDEVS stores zdev list', () => {
    const zdevs = [{ id: '0.0.1000', enabled: true }]
    const next = reducer(initialState, { type: 'SET_ZDEVS', payload: zdevs })
    expect(next.zdevs).toEqual(zdevs)
  })

  it('SET_EARLY_COMMANDS stores commands', () => {
    const next = reducer(initialState, {
      type: 'SET_EARLY_COMMANDS',
      payload: ['echo early'],
    })
    expect(next['early-commands']).toEqual(['echo early'])
  })

  it('RESET returns initial state', () => {
    const modified = reducer(initialState, { type: 'SET_LOCALE', payload: 'de_DE.UTF-8' })
    const reset = reducer(modified, { type: 'RESET' })
    expect(reset).toEqual(initialState)
    expect(reset.locale).toBeUndefined()
  })

  it('unknown action type returns state unchanged', () => {
    // Cast to bypass TS type checking for this edge case test
    const action = { type: 'UNKNOWN_ACTION' } as unknown as AutoinstallAction
    const next = reducer(initialState, action)
    expect(next).toBe(initialState)
  })

  it('dispatch via Provider updates state (integration)', async () => {
    function Dispatcher() {
      const { state, dispatch } = useAutoinstallConfig()
      return (
        <div>
          <span data-testid="locale">{state.locale ?? 'none'}</span>
          <button onClick={() => dispatch({ type: 'SET_LOCALE', payload: 'fr_FR.UTF-8' })}>
            Set Locale
          </button>
        </div>
      )
    }

    const { getByRole, getByTestId } = render(
      <AutoinstallConfigProvider>
        <Dispatcher />
      </AutoinstallConfigProvider>
    )

    expect(getByTestId('locale').textContent).toBe('none')
    await act(async () => {
      getByRole('button', { name: 'Set Locale' }).click()
    })
    expect(getByTestId('locale').textContent).toBe('fr_FR.UTF-8')
  })
})
