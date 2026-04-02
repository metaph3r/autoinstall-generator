import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { ActiveDirectorySection } from './ActiveDirectorySection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <ActiveDirectorySection />
    </AutoinstallConfigProvider>
  )
}

describe('ActiveDirectorySection', () => {
  it('renders admin name field', () => {
    renderSection()
    expect(screen.getByTestId('ad-admin-name-field')).toBeTruthy()
  })

  it('renders domain name field', () => {
    renderSection()
    expect(screen.getByTestId('ad-domain-name-field')).toBeTruthy()
  })

  it('allows typing into admin name field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('ad-admin-name-field')
    await user.type(input, 'admin')
    expect((input as HTMLInputElement).value).toBe('admin')
  })

  it('allows typing into domain name field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('ad-domain-name-field')
    await user.type(input, 'example.com')
    expect((input as HTMLInputElement).value).toBe('example.com')
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
