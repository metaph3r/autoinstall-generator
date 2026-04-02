import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { SnapsSection } from './SnapsSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <SnapsSection />
    </AutoinstallConfigProvider>
  )
}

describe('SnapsSection', () => {
  it('renders add snap button', () => {
    renderSection()
    expect(screen.getByTestId('add-snap')).toBeTruthy()
  })

  it('adds a snap row on button click', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-snap'))
    expect(screen.getByTestId('snap-name-0')).toBeTruthy()
    expect(screen.getByTestId('snap-channel-0')).toBeTruthy()
    expect(screen.getByTestId('snap-classic-0')).toBeTruthy()
  })

  it('removes a snap row on remove button click', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-snap'))
    expect(screen.getByTestId('snap-name-0')).toBeTruthy()
    await user.click(screen.getByTestId('remove-snap-0'))
    expect(screen.queryByTestId('snap-name-0')).toBeNull()
  })

  it('allows typing a snap name', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-snap'))
    const input = screen.getByTestId('snap-name-0')
    await user.type(input, 'hello-world')
    expect((input as HTMLInputElement).value).toBe('hello-world')
  })

  it('allows setting classic flag', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-snap'))
    const checkbox = screen.getByTestId('snap-classic-0')
    expect((checkbox as HTMLInputElement).checked).toBe(false)
    await user.click(checkbox)
    expect((checkbox as HTMLInputElement).checked).toBe(true)
  })

  it('has an aria-live region for announcements', () => {
    const { container } = renderSection()
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
