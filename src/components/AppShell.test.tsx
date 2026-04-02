import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { AppShell } from './AppShell'

function renderAppShell() {
  return render(
    <AutoinstallConfigProvider>
      <AppShell />
    </AutoinstallConfigProvider>
  )
}

describe('AppShell', () => {
  it('renders AppBar with application title', () => {
    renderAppShell()
    expect(screen.getByRole('banner')).toBeTruthy()
    expect(screen.getAllByText('Autoinstall Generator').length).toBeGreaterThan(0)
  })

  it('renders GitHub icon link with correct aria-label as an anchor', () => {
    renderAppShell()
    const link = screen.getByRole('link', { name: /view source on github/i })
    expect(link).toBeTruthy()
    expect(link.tagName.toLowerCase()).toBe('a')
  })

  it('renders StartPage on initial load', () => {
    renderAppShell()
    expect(screen.getByRole('button', { name: /new project/i })).toBeTruthy()
  })

  it('clicking New Project navigates to FormEditor', async () => {
    renderAppShell()
    await userEvent.click(screen.getByRole('button', { name: /new project/i }))
    expect(screen.getByTestId('form-sections')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /new project/i })).toBeNull()
  })

  it('has no axe-core critical violations on initial render', async () => {
    const { container } = renderAppShell()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
