import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { ReportingSection } from './ReportingSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <ReportingSection />
    </AutoinstallConfigProvider>
  )
}

describe('ReportingSection', () => {
  it('renders add handler button', () => {
    renderSection()
    expect(screen.getByTestId('add-handler-button')).toBeTruthy()
  })

  it('renders Reporting Handlers heading', () => {
    renderSection()
    expect(screen.getByText('Reporting Handlers')).toBeTruthy()
  })

  it('adds a handler row when button clicked', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-handler-button'))
    expect(screen.getByTestId('handler-name-0')).toBeTruthy()
    expect(screen.getByTestId('handler-type-0')).toBeTruthy()
  })

  it('allows typing handler name', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-handler-button'))
    const nameInput = screen.getByTestId('handler-name-0')
    await user.type(nameInput, 'my-handler')
    expect((nameInput as HTMLInputElement).value).toBe('my-handler')
  })

  it('allows typing handler type', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-handler-button'))
    const typeInput = screen.getByTestId('handler-type-0')
    await user.type(typeInput, 'webhook')
    expect((typeInput as HTMLInputElement).value).toBe('webhook')
  })

  it('removes a handler row when delete clicked', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-handler-button'))
    expect(screen.getByTestId('handler-name-0')).toBeTruthy()
    await user.click(screen.getByLabelText('Remove handler 1'))
    expect(screen.queryByTestId('handler-name-0')).toBeNull()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
