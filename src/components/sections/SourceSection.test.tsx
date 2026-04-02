import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { SourceSection } from './SourceSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <SourceSection />
    </AutoinstallConfigProvider>
  )
}

describe('SourceSection', () => {
  it('renders search drivers switch', () => {
    renderSection()
    expect(screen.getByTestId('search-drivers-switch')).toBeTruthy()
  })

  it('renders source ID field', () => {
    renderSection()
    expect(screen.getByTestId('source-id-field')).toBeTruthy()
  })

  it('toggles search drivers switch', async () => {
    const user = userEvent.setup()
    renderSection()
    const toggle = screen.getByTestId('search-drivers-switch')
    expect((toggle as HTMLInputElement).checked).toBe(false)
    await user.click(toggle)
    expect((toggle as HTMLInputElement).checked).toBe(true)
  })

  it('allows typing into source ID field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('source-id-field')
    await user.type(input, 'ubuntu-desktop')
    expect((input as HTMLInputElement).value).toBe('ubuntu-desktop')
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
