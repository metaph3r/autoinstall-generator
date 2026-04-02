import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'

export interface AutoinstallConfig {
  version: number
}

export type AutoinstallAction = { type: string; payload?: unknown }

export interface AutoinstallConfigContextValue {
  state: AutoinstallConfig
  dispatch: React.Dispatch<AutoinstallAction>
}

const AutoinstallConfigContext = createContext<AutoinstallConfigContextValue | null>(null)

const initialState: AutoinstallConfig = { version: 1 }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reducer(state: AutoinstallConfig, _action: AutoinstallAction): AutoinstallConfig {
  return state
}

interface AutoinstallConfigProviderProps {
  children: ReactNode
}

export function AutoinstallConfigProvider({ children }: AutoinstallConfigProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <AutoinstallConfigContext.Provider value={{ state, dispatch }}>
      {children}
    </AutoinstallConfigContext.Provider>
  )
}

export function useAutoinstallConfig(): AutoinstallConfigContextValue {
  const ctx = useContext(AutoinstallConfigContext)
  if (ctx === null) {
    throw new Error('useAutoinstallConfig must be used within AutoinstallConfigProvider')
  }
  return ctx
}
