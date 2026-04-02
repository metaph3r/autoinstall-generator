import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'

// Sub-interfaces

export interface KeyboardConfig {
  layout: string
  variant?: string
  toggle?: string
}

export interface RefreshInstallerConfig {
  update: boolean
  channel?: string
}

export interface SourceConfig {
  search_drivers?: boolean
  id?: string
}

export interface MirrorEntry {
  uri?: string
  arches?: string[]
}

export interface AptConfig {
  preserve_sources_list?: boolean
  fallback?: 'abort' | 'continue-anyway' | 'offline-install'
  geoip?: boolean
  mirror_selection?: {
    primary?: MirrorEntry[]
  }
  sources?: Record<string, unknown>
}

export interface StorageLayoutConfig {
  name: 'lvm' | 'direct' | 'zfs'
}

export interface StorageConfig {
  layout?: StorageLayoutConfig
  /** Raw YAML string for action mode */
  actions?: string
  /** Whether action mode is active */
  actionMode?: boolean
}

export interface IdentityConfig {
  realname?: string
  username: string
  hostname: string
  password: string
}

export interface ActiveDirectoryConfig {
  'admin-name'?: string
  'domain-name'?: string
}

export interface UbuntuProConfig {
  token?: string
}

export interface SSHConfig {
  'install-server'?: boolean
  'authorized-keys'?: string[]
  'allow-pw'?: boolean
}

export interface SnapConfig {
  name: string
  channel?: string
  classic?: boolean
}

export interface KernelConfig {
  package?: string
  flavor?: string
}

export interface ReportingHandler {
  type: string
  [key: string]: unknown
}

export interface UserDataConfig {
  name?: string
  gecos?: string
  passwd?: string
  groups?: string
  shell?: string
  lock_passwd?: boolean
}

export interface ZDevConfig {
  id: string
  enabled: boolean
}

// Main config interface

export interface AutoinstallConfig {
  version: number
  locale?: string
  keyboard?: KeyboardConfig
  'refresh-installer'?: RefreshInstallerConfig
  source?: SourceConfig
  /** Raw YAML string for Netplan network config */
  network?: string
  proxy?: string
  apt?: AptConfig
  storage?: StorageConfig
  identity?: IdentityConfig
  'active-directory'?: ActiveDirectoryConfig
  'ubuntu-pro'?: UbuntuProConfig
  ssh?: SSHConfig
  codecs?: { install?: boolean }
  drivers?: { install?: boolean }
  oem?: boolean | 'auto'
  snaps?: SnapConfig[]
  packages?: string[]
  kernel?: KernelConfig
  'kernel-crash-dumps'?: boolean | null
  timezone?: string
  updates?: 'security' | 'all'
  shutdown?: 'reboot' | 'poweroff'
  reporting?: Record<string, ReportingHandler>
  'user-data'?: UserDataConfig
  'debconf-selections'?: string
  zdevs?: ZDevConfig[]
  'interactive-sections'?: string[]
  'early-commands'?: string[]
  'late-commands'?: string[]
  'error-commands'?: string[]
}

// Action types

export type AutoinstallAction =
  | { type: 'SET_VERSION'; payload: number }
  | { type: 'SET_LOCALE'; payload: string | undefined }
  | { type: 'SET_KEYBOARD'; payload: KeyboardConfig | undefined }
  | { type: 'SET_REFRESH_INSTALLER'; payload: RefreshInstallerConfig | undefined }
  | { type: 'SET_SOURCE'; payload: SourceConfig | undefined }
  | { type: 'SET_NETWORK'; payload: string | undefined }
  | { type: 'SET_PROXY'; payload: string | undefined }
  | { type: 'SET_APT'; payload: AptConfig | undefined }
  | { type: 'SET_STORAGE_LAYOUT'; payload: StorageLayoutConfig | undefined }
  | { type: 'SET_STORAGE_ACTIONS'; payload: string | undefined }
  | { type: 'SET_STORAGE_ACTION_MODE'; payload: boolean }
  | { type: 'SET_IDENTITY'; payload: IdentityConfig | undefined }
  | { type: 'SET_ACTIVE_DIRECTORY'; payload: ActiveDirectoryConfig | undefined }
  | { type: 'SET_UBUNTU_PRO'; payload: UbuntuProConfig | undefined }
  | { type: 'SET_SSH'; payload: SSHConfig | undefined }
  | { type: 'SET_CODECS'; payload: { install?: boolean } | undefined }
  | { type: 'SET_DRIVERS'; payload: { install?: boolean } | undefined }
  | { type: 'SET_OEM'; payload: boolean | 'auto' | undefined }
  | { type: 'SET_SNAPS'; payload: SnapConfig[] | undefined }
  | { type: 'SET_PACKAGES'; payload: string[] | undefined }
  | { type: 'SET_KERNEL'; payload: KernelConfig | undefined }
  | { type: 'SET_KERNEL_CRASH_DUMPS'; payload: boolean | null | undefined }
  | { type: 'SET_TIMEZONE'; payload: string | undefined }
  | { type: 'SET_UPDATES'; payload: 'security' | 'all' | undefined }
  | { type: 'SET_SHUTDOWN'; payload: 'reboot' | 'poweroff' | undefined }
  | { type: 'SET_REPORTING'; payload: Record<string, ReportingHandler> | undefined }
  | { type: 'SET_USER_DATA'; payload: UserDataConfig | undefined }
  | { type: 'SET_DEBCONF_SELECTIONS'; payload: string | undefined }
  | { type: 'SET_ZDEVS'; payload: ZDevConfig[] | undefined }
  | { type: 'SET_INTERACTIVE_SECTIONS'; payload: string[] | undefined }
  | { type: 'SET_EARLY_COMMANDS'; payload: string[] | undefined }
  | { type: 'SET_LATE_COMMANDS'; payload: string[] | undefined }
  | { type: 'SET_ERROR_COMMANDS'; payload: string[] | undefined }
  | { type: 'RESET' }

export interface AutoinstallConfigContextValue {
  state: AutoinstallConfig
  dispatch: React.Dispatch<AutoinstallAction>
}

const AutoinstallConfigContext = createContext<AutoinstallConfigContextValue | null>(null)

export const initialState: AutoinstallConfig = { version: 1 }

export function reducer(state: AutoinstallConfig, action: AutoinstallAction): AutoinstallConfig {
  switch (action.type) {
    case 'SET_VERSION':
      return { ...state, version: action.payload }
    case 'SET_LOCALE':
      return { ...state, locale: action.payload }
    case 'SET_KEYBOARD':
      return { ...state, keyboard: action.payload }
    case 'SET_REFRESH_INSTALLER':
      return { ...state, 'refresh-installer': action.payload }
    case 'SET_SOURCE':
      return { ...state, source: action.payload }
    case 'SET_NETWORK':
      return { ...state, network: action.payload }
    case 'SET_PROXY':
      return { ...state, proxy: action.payload }
    case 'SET_APT':
      return { ...state, apt: action.payload }
    case 'SET_STORAGE_LAYOUT':
      return {
        ...state,
        storage: {
          ...state.storage,
          layout: action.payload,
          actionMode: false,
        },
      }
    case 'SET_STORAGE_ACTIONS':
      return {
        ...state,
        storage: {
          ...state.storage,
          actions: action.payload,
        },
      }
    case 'SET_STORAGE_ACTION_MODE':
      return {
        ...state,
        storage: {
          ...state.storage,
          actionMode: action.payload,
        },
      }
    case 'SET_IDENTITY':
      return { ...state, identity: action.payload }
    case 'SET_ACTIVE_DIRECTORY':
      return { ...state, 'active-directory': action.payload }
    case 'SET_UBUNTU_PRO':
      return { ...state, 'ubuntu-pro': action.payload }
    case 'SET_SSH':
      return { ...state, ssh: action.payload }
    case 'SET_CODECS':
      return { ...state, codecs: action.payload }
    case 'SET_DRIVERS':
      return { ...state, drivers: action.payload }
    case 'SET_OEM':
      return { ...state, oem: action.payload }
    case 'SET_SNAPS':
      return { ...state, snaps: action.payload }
    case 'SET_PACKAGES':
      return { ...state, packages: action.payload }
    case 'SET_KERNEL':
      return { ...state, kernel: action.payload }
    case 'SET_KERNEL_CRASH_DUMPS':
      return { ...state, 'kernel-crash-dumps': action.payload }
    case 'SET_TIMEZONE':
      return { ...state, timezone: action.payload }
    case 'SET_UPDATES':
      return { ...state, updates: action.payload }
    case 'SET_SHUTDOWN':
      return { ...state, shutdown: action.payload }
    case 'SET_REPORTING':
      return { ...state, reporting: action.payload }
    case 'SET_USER_DATA':
      return { ...state, 'user-data': action.payload }
    case 'SET_DEBCONF_SELECTIONS':
      return { ...state, 'debconf-selections': action.payload }
    case 'SET_ZDEVS':
      return { ...state, zdevs: action.payload }
    case 'SET_INTERACTIVE_SECTIONS':
      return { ...state, 'interactive-sections': action.payload }
    case 'SET_EARLY_COMMANDS':
      return { ...state, 'early-commands': action.payload }
    case 'SET_LATE_COMMANDS':
      return { ...state, 'late-commands': action.payload }
    case 'SET_ERROR_COMMANDS':
      return { ...state, 'error-commands': action.payload }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
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
