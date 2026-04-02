import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider, useAutoinstallConfig } from './AutoinstallConfigContext'

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
