import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { ZDevsForm } from './ZDevsForm'

function renderForm() {
  return render(
    <AutoinstallConfigProvider>
      <ZDevsForm />
    </AutoinstallConfigProvider>
  )
}

describe('ZDevsForm', () => {
  it('renders add device button', () => {
    renderForm()
    expect(screen.getByTestId('zdevs-add-button')).toBeTruthy()
  })

  it('renders table', () => {
    renderForm()
    expect(screen.getByTestId('zdevs-table')).toBeTruthy()
  })

  it('clicking add button appends a row', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByTestId('zdevs-add-button'))
    expect(screen.getByTestId('zdevs-row-0')).toBeTruthy()
  })

  it('id field rendered after add', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByTestId('zdevs-add-button'))
    expect(screen.getByTestId('zdev-id-0')).toBeTruthy()
  })

  it('enabled switch rendered after add', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByTestId('zdevs-add-button'))
    expect(screen.getByTestId('zdev-enabled-0')).toBeTruthy()
  })

  it('clicking remove button removes the row', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByTestId('zdevs-add-button'))
    expect(screen.getByTestId('zdevs-row-0')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Remove z device 1' }))
    expect(screen.queryByTestId('zdevs-row-0')).toBeNull()
  })

  it('aria-live region present', () => {
    const { container } = renderForm()
    const liveRegion = container.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderForm()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
