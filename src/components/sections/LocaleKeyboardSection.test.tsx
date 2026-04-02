import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { LocaleKeyboardSection } from './LocaleKeyboardSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <LocaleKeyboardSection />
    </AutoinstallConfigProvider>
  )
}

describe('LocaleKeyboardSection', () => {
  it('renders locale field', () => {
    renderSection()
    expect(screen.getByTestId('locale-field')).toBeTruthy()
  })

  it('renders keyboard layout field', () => {
    renderSection()
    expect(screen.getByTestId('keyboard-layout-field')).toBeTruthy()
  })

  it('renders keyboard variant field', () => {
    renderSection()
    expect(screen.getByTestId('keyboard-variant-field')).toBeTruthy()
  })

  it('allows typing into locale field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('locale-field')
    await user.type(input, 'en_US.UTF-8')
    expect((input as HTMLInputElement).value).toBe('en_US.UTF-8')
  })

  it('allows typing into keyboard layout field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('keyboard-layout-field')
    await user.type(input, 'us')
    expect((input as HTMLInputElement).value).toBe('us')
  })

  it('allows typing into keyboard variant field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('keyboard-variant-field')
    await user.type(input, 'intl')
    expect((input as HTMLInputElement).value).toBe('intl')
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
