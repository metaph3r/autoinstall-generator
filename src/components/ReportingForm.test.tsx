import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { ReportingForm } from './ReportingForm'

function renderForm() {
  return render(
    <AutoinstallConfigProvider>
      <ReportingForm />
    </AutoinstallConfigProvider>
  )
}

describe('ReportingForm', () => {
  it('renders add handler button', () => {
    renderForm()
    expect(screen.getByTestId('add-handler-button')).toBeTruthy()
  })

  it('renders no handlers initially', () => {
    renderForm()
    expect(screen.queryByTestId('reporting-handler-0')).toBeNull()
  })

  it('clicking add handler shows a new handler entry', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByTestId('add-handler-button'))
    expect(screen.getByTestId('reporting-handler-0')).toBeTruthy()
  })

  it('handler name field is rendered after clicking add', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByTestId('add-handler-button'))
    expect(screen.getByTestId('handler-name-0')).toBeTruthy()
  })

  it('handler type field is rendered after clicking add', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByTestId('add-handler-button'))
    expect(screen.getByTestId('handler-type-0')).toBeTruthy()
  })

  it('clicking remove handler button removes the handler entry', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByTestId('add-handler-button'))
    expect(screen.getByTestId('reporting-handler-0')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Remove handler 1' }))
    expect(screen.queryByTestId('reporting-handler-0')).toBeNull()
  })

  it('clicking add field button on a handler adds an extra field row', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByTestId('add-handler-button'))
    await user.click(screen.getByTestId('add-field-button-0'))
    expect(screen.getByTestId('handler-0-extra-0')).toBeTruthy()
  })

  it('aria-live region is present', () => {
    renderForm()
    expect(screen.getByTestId('reporting-announcement')).toBeTruthy()
  })

  it('aria-live region announces when handler is added', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByTestId('add-handler-button'))
    expect(screen.getByTestId('reporting-announcement').textContent).toContain('Handler added')
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderForm()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
