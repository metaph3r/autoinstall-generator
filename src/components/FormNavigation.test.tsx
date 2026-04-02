import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect, vi } from 'vitest'
import { FormNavigation, TAB_GROUPS } from './FormNavigation'

describe('FormNavigation', () => {
  it('renders all 6 tab groups', () => {
    render(<FormNavigation activeTab={0} onTabChange={() => {}} />)
    for (const label of TAB_GROUPS) {
      expect(screen.getByRole('tab', { name: label })).toBeTruthy()
    }
  })

  it('marks the active tab as selected', () => {
    render(<FormNavigation activeTab={2} onTabChange={() => {}} />)
    const storageTab = screen.getByRole('tab', { name: 'Storage' })
    expect(storageTab).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onTabChange when a tab is clicked', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    render(<FormNavigation activeTab={0} onTabChange={onTabChange} />)
    await user.click(screen.getByRole('tab', { name: 'Network' }))
    expect(onTabChange).toHaveBeenCalledWith(1)
  })

  it('has no axe-core critical violations', async () => {
    // Render with tabpanels so aria-controls references are valid
    const { container } = render(
      <div>
        <FormNavigation activeTab={0} onTabChange={() => {}} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} id={`form-tabpanel-${i}`} role="tabpanel" aria-labelledby={`form-tab-${i}`} hidden={i !== 0} />
        ))}
      </div>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
