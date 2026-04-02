import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing and container is in document', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })

  it('renders StartPage on initial load', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /new project/i })).toBeTruthy()
  })

  it('has no axe-core violations', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
