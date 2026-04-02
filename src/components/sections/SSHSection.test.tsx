import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { SSHSection } from './SSHSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <SSHSection />
    </AutoinstallConfigProvider>
  )
}

describe('SSHSection', () => {
  it('renders install server switch', () => {
    renderSection()
    expect(screen.getByRole('checkbox', { name: /Install SSH Server/i })).toBeTruthy()
  })

  it('renders allow password authentication switch', () => {
    renderSection()
    expect(screen.getByRole('checkbox', { name: /Allow Password Authentication/i })).toBeTruthy()
  })

  it('renders Add Key button for authorized keys', () => {
    renderSection()
    expect(screen.getByTestId('add-authorized-key')).toBeTruthy()
  })

  it('adds authorized key entry on click', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-authorized-key'))
    expect(screen.getByRole('textbox', { name: /Key 1/i })).toBeTruthy()
  })

  it('removes authorized key entry on remove click', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-authorized-key'))
    expect(screen.getByRole('textbox', { name: /Key 1/i })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Remove authorized key 1/i }))
    expect(screen.queryByRole('textbox', { name: /Key 1/i })).toBeNull()
  })

  it('toggles install server switch', async () => {
    const user = userEvent.setup()
    renderSection()
    const toggle = screen.getByRole('checkbox', { name: /Install SSH Server/i })
    expect((toggle as HTMLInputElement).checked).toBe(false)
    await user.click(toggle)
    expect((toggle as HTMLInputElement).checked).toBe(true)
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
