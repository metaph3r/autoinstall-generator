import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../../context/AutoinstallConfigContext'
import { DebconfZdevsSection } from './DebconfZdevsSection'

function renderSection() {
  return render(
    <AutoinstallConfigProvider>
      <DebconfZdevsSection />
    </AutoinstallConfigProvider>
  )
}

describe('DebconfZdevsSection', () => {
  it('renders debconf selections field', () => {
    renderSection()
    expect(screen.getByTestId('debconf-selections-field')).toBeTruthy()
  })

  it('renders add z device button', () => {
    renderSection()
    expect(screen.getByTestId('add-zdev-button')).toBeTruthy()
  })

  it('renders Debconf Selections heading', () => {
    renderSection()
    expect(screen.getAllByText('Debconf Selections').length).toBeGreaterThan(0)
  })

  it('renders Z Devices heading', () => {
    renderSection()
    expect(screen.getByText('Z Devices')).toBeTruthy()
  })

  it('allows typing into debconf selections field', async () => {
    const user = userEvent.setup()
    renderSection()
    const input = screen.getByTestId('debconf-selections-field')
    await user.type(input, 'pkg/option string value')
    expect((input as HTMLInputElement).value).toBe('pkg/option string value')
  })

  it('adds a zdev row when button clicked', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-zdev-button'))
    expect(screen.getByTestId('zdev-id-0')).toBeTruthy()
    expect(screen.getByTestId('zdev-enabled-0')).toBeTruthy()
  })

  it('allows typing zdev id', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-zdev-button'))
    const idInput = screen.getByTestId('zdev-id-0')
    await user.type(idInput, '0.0.1234')
    expect((idInput as HTMLInputElement).value).toBe('0.0.1234')
  })

  it('removes a zdev row when delete clicked', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-zdev-button'))
    expect(screen.getByTestId('zdev-id-0')).toBeTruthy()
    await user.click(screen.getByLabelText('Remove z device 1'))
    expect(screen.queryByTestId('zdev-id-0')).toBeNull()
  })

  it('allows toggling zdev enabled switch', async () => {
    const user = userEvent.setup()
    renderSection()
    await user.click(screen.getByTestId('add-zdev-button'))
    const switchInput = screen.getByTestId('zdev-enabled-0')
    // Default is enabled (true)
    expect((switchInput as HTMLInputElement).checked).toBe(true)
    await user.click(switchInput)
    expect((switchInput as HTMLInputElement).checked).toBe(false)
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderSection()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
