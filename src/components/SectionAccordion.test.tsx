import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { SectionAccordion } from './SectionAccordion'

describe('SectionAccordion', () => {
  it('renders the title', () => {
    render(<SectionAccordion title="Identity"><p>content</p></SectionAccordion>)
    expect(screen.getByText('Identity')).toBeTruthy()
  })

  it('renders children when expanded', async () => {
    const user = userEvent.setup()
    render(
      <SectionAccordion title="Identity">
        <p>child content</p>
      </SectionAccordion>
    )
    // Expand accordion
    await user.click(screen.getByRole('button', { name: /Identity/i }))
    expect(screen.getByText('child content')).toBeTruthy()
  })

  it('starts expanded when defaultExpanded is true', () => {
    render(
      <SectionAccordion title="SSH" defaultExpanded>
        <p>ssh content</p>
      </SectionAccordion>
    )
    expect(screen.getByText('ssh content')).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = render(
      <SectionAccordion title="Test Section">
        <p>content</p>
      </SectionAccordion>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
