import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect, vi } from 'vitest'
import { StartPage } from './StartPage'

describe('StartPage', () => {
  it('renders heading text with application name', () => {
    render(<StartPage onStart={() => {}} />)
    expect(screen.getByRole('heading', { name: /autoinstall generator/i })).toBeTruthy()
  })

  it('renders New Project button', () => {
    render(<StartPage onStart={() => {}} />)
    expect(screen.getByRole('button', { name: /new project/i })).toBeTruthy()
  })

  it('clicking New Project button calls onStart exactly once', async () => {
    const onStart = vi.fn()
    render(<StartPage onStart={onStart} />)
    await userEvent.click(screen.getByRole('button', { name: /new project/i }))
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('has no axe-core critical violations', async () => {
    const { container } = render(<StartPage onStart={() => {}} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
