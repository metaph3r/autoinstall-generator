import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { AutoinstallConfigProvider } from '../context/AutoinstallConfigContext'
import { FormEditor } from './FormEditor'

function renderFormEditor() {
  return render(
    <AutoinstallConfigProvider>
      <FormEditor />
    </AutoinstallConfigProvider>
  )
}

describe('FormEditor', () => {
  it('renders without crashing', () => {
    const { container } = renderFormEditor()
    expect(container).toBeTruthy()
  })

  it('renders form sections placeholder', () => {
    renderFormEditor()
    expect(screen.getByTestId('form-sections')).toBeTruthy()
  })

  it('renders YAML preview placeholder', () => {
    renderFormEditor()
    expect(screen.getByTestId('yaml-preview')).toBeTruthy()
  })

  it('has no axe-core critical violations', async () => {
    const { container } = renderFormEditor()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
