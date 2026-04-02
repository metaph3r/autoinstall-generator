import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { FormContent } from './FormContent'

describe('FormContent', () => {
  it('renders first tab panel (System) when activeTab=0', () => {
    render(<FormContent activeTab={0} />)
    expect(screen.getByRole('tabpanel', { hidden: false })).toBeTruthy()
  })

  it('shows System tab sections when activeTab=0', () => {
    render(<FormContent activeTab={0} />)
    expect(screen.getByText('Version')).toBeTruthy()
  })

  it('shows Network tab sections when activeTab=1', () => {
    render(<FormContent activeTab={1} />)
    expect(screen.getAllByText(/Network \(Netplan\)/).length).toBeGreaterThan(0)
  })

  it('shows Software tab sections when activeTab=4', () => {
    render(<FormContent activeTab={4} />)
    expect(screen.getByText('Snaps')).toBeTruthy()
  })

  it('shows Configuration tab sections when activeTab=5', () => {
    render(<FormContent activeTab={5} />)
    expect(screen.getByText('Timezone')).toBeTruthy()
  })

  it('switches visible panel when activeTab changes', async () => {
    const { rerender } = render(<FormContent activeTab={0} />)
    expect(screen.getByText('Version')).toBeTruthy()
    rerender(<FormContent activeTab={3} />)
    // Identity & Auth tab
    expect(screen.getByText('Identity')).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = render(<FormContent activeTab={0} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
