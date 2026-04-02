import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { PackagesSection } from './PackagesSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <PackagesSection />
    </AutoinstallConfigProvider>
  )
}

describe('PackagesSection', () => {
  it('renders packages text area', () => {
    renderSection()
    expect(screen.getByTestId('packages-field')).toBeTruthy()
  })

  it('renders with multiline textarea', () => {
    renderSection()
    const field = screen.getByTestId('packages-field')
    expect(field.tagName.toLowerCase()).toBe('textarea')
  })

  it('allows typing packages', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('packages-field')
    await user.type(input, 'vim')
    expect((input as HTMLTextAreaElement).value).toContain('vim')
  })

  it('has an aria-live region for announcements', () => {
    renderSection()
    const liveRegion = document.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
