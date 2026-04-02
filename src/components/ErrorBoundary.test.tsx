import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function GoodChild() {
  return <div>All good</div>
}

function BrokenChild(): JSX.Element {
  throw new Error('test error')
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const { container } = render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    )
    expect(container.textContent).toContain('All good')
  })

  it('renders default fallback text when a child throws', () => {
    const consoleError = console.error
    console.error = () => {}
    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeTruthy()
    console.error = consoleError
  })

  it('renders custom fallback node when fallback prop is provided and child throws', () => {
    const consoleError = console.error
    console.error = () => {}
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <BrokenChild />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom error UI')).toBeTruthy()
    console.error = consoleError
  })
})
