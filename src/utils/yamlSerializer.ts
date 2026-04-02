import { stringify, parse } from 'yaml'
import type { AutoinstallConfig, StorageConfig } from '../context/AutoinstallConfigContext'

/**
 * Removes undefined fields from an object recursively.
 * Fields explicitly set to null are retained (e.g., kernel-crash-dumps: null).
 */
function omitUndefined(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(omitUndefined)
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== undefined) {
        result[key] = omitUndefined(value)
      }
    }
    return result
  }
  return obj
}

/**
 * Serializes StorageConfig to the autoinstall storage format.
 * In layout mode: { layout: { name: "lvm" } }
 * In action mode: raw YAML actions merged verbatim
 */
function serializeStorage(storage: StorageConfig): unknown {
  if (storage.actionMode && storage.actions) {
    try {
      return parse(storage.actions)
    } catch {
      // Return raw string if parsing fails; consumer will handle error
      return storage.actions
    }
  }
  if (storage.layout) {
    return { layout: { name: storage.layout.name } }
  }
  return undefined
}

/**
 * Serializes the full AutoinstallConfig state to a YAML string.
 * - Wraps under `autoinstall:` root key
 * - Omits undefined fields
 * - Merges raw YAML strings verbatim for network and storage actions
 */
export function serializeToYaml(config: AutoinstallConfig): string {
  const autoinstall: Record<string, unknown> = {}

  autoinstall.version = config.version

  if (config.locale !== undefined) autoinstall.locale = config.locale
  if (config.keyboard !== undefined) autoinstall.keyboard = omitUndefined(config.keyboard)
  if (config['interactive-sections']?.length) {
    autoinstall['interactive-sections'] = config['interactive-sections']
  }
  if (config['refresh-installer'] !== undefined) {
    autoinstall['refresh-installer'] = omitUndefined(config['refresh-installer'])
  }
  if (config['early-commands']?.length) autoinstall['early-commands'] = config['early-commands']
  if (config['late-commands']?.length) autoinstall['late-commands'] = config['late-commands']
  if (config['error-commands']?.length) autoinstall['error-commands'] = config['error-commands']
  if (config.source !== undefined) autoinstall.source = omitUndefined(config.source)

  // Network: raw Netplan YAML string, merged verbatim
  if (config.network !== undefined) {
    try {
      autoinstall.network = parse(config.network)
    } catch {
      autoinstall.network = config.network
    }
  }

  if (config.proxy !== undefined) autoinstall.proxy = config.proxy
  if (config.apt !== undefined) autoinstall.apt = omitUndefined(config.apt)

  // Storage: layout or action mode
  if (config.storage !== undefined) {
    const serializedStorage = serializeStorage(config.storage)
    if (serializedStorage !== undefined) {
      autoinstall.storage = serializedStorage
    }
  }

  if (config.identity !== undefined) autoinstall.identity = omitUndefined(config.identity)
  if (config['active-directory'] !== undefined) {
    autoinstall['active-directory'] = omitUndefined(config['active-directory'])
  }
  if (config['ubuntu-pro'] !== undefined) {
    autoinstall['ubuntu-pro'] = omitUndefined(config['ubuntu-pro'])
  }
  if (config.ssh !== undefined) autoinstall.ssh = omitUndefined(config.ssh)
  if (config.codecs !== undefined) autoinstall.codecs = omitUndefined(config.codecs)
  if (config.drivers !== undefined) autoinstall.drivers = omitUndefined(config.drivers)
  if (config.oem !== undefined) autoinstall.oem = config.oem
  if (config.snaps?.length) autoinstall.snaps = config.snaps.map(s => omitUndefined(s))
  if (config.packages?.length) autoinstall.packages = config.packages
  if (config.kernel !== undefined) autoinstall.kernel = omitUndefined(config.kernel)
  if (config['kernel-crash-dumps'] !== undefined) {
    autoinstall['kernel-crash-dumps'] = config['kernel-crash-dumps']
  }
  if (config.timezone !== undefined) autoinstall.timezone = config.timezone
  if (config.updates !== undefined) autoinstall.updates = config.updates
  if (config.shutdown !== undefined) autoinstall.shutdown = config.shutdown
  if (config.reporting !== undefined) autoinstall.reporting = omitUndefined(config.reporting)
  if (config['user-data'] !== undefined) {
    autoinstall['user-data'] = omitUndefined(config['user-data'])
  }
  if (config['debconf-selections'] !== undefined) {
    autoinstall['debconf-selections'] = config['debconf-selections']
  }
  if (config.zdevs?.length) autoinstall.zdevs = config.zdevs

  return stringify({ autoinstall })
}
