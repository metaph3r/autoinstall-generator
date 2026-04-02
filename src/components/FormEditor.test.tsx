import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { FormEditor } from './FormEditor'

describe('FormEditor', () => {
  it('renders without crashing', () => {
    const { container } = render(<FormEditor />)
    expect(container).toBeTruthy()
  })

  it('renders form sections placeholder', () => {
    render(<FormEditor />)
    expect(screen.getByTestId('form-sections')).toBeTruthy()
  })

  it('renders YAML preview placeholder', () => {
    render(<FormEditor />)
    expect(screen.getByTestId('yaml-preview')).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = render(<FormEditor />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
