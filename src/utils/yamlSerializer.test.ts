import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { serializeToYaml } from './yamlSerializer'
import type { AutoinstallConfig } from '../context/AutoinstallConfigContext'

describe('serializeToYaml', () => {
  it('wraps output under autoinstall root key', () => {
    const yaml = serializeToYaml({ version: 1 })
    const parsed = parse(yaml) as Record<string, unknown>
    expect(parsed).toHaveProperty('autoinstall')
  })

  it('includes version field', () => {
    const yaml = serializeToYaml({ version: 1 })
    const parsed = parse(yaml) as { autoinstall: { version: number } }
    expect(parsed.autoinstall.version).toBe(1)
  })

  it('omits undefined optional fields', () => {
    const yaml = serializeToYaml({ version: 1 })
    const parsed = parse(yaml) as { autoinstall: Record<string, unknown> }
    expect(parsed.autoinstall).not.toHaveProperty('locale')
    expect(parsed.autoinstall).not.toHaveProperty('keyboard')
    expect(parsed.autoinstall).not.toHaveProperty('identity')
  })

  it('includes locale when set', () => {
    const config: AutoinstallConfig = { version: 1, locale: 'de_DE.UTF-8' }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { locale: string } }
    expect(parsed.autoinstall.locale).toBe('de_DE.UTF-8')
  })

  it('includes keyboard config', () => {
    const config: AutoinstallConfig = {
      version: 1,
      keyboard: { layout: 'de', variant: 'nodeadkeys' },
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { keyboard: { layout: string; variant: string } } }
    expect(parsed.autoinstall.keyboard.layout).toBe('de')
    expect(parsed.autoinstall.keyboard.variant).toBe('nodeadkeys')
  })

  it('omits undefined keyboard sub-fields', () => {
    const config: AutoinstallConfig = {
      version: 1,
      keyboard: { layout: 'us' },
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { keyboard: Record<string, unknown> } }
    expect(parsed.autoinstall.keyboard).not.toHaveProperty('variant')
    expect(parsed.autoinstall.keyboard).not.toHaveProperty('toggle')
  })

  it('includes identity when set', () => {
    const config: AutoinstallConfig = {
      version: 1,
      identity: { username: 'ubuntu', hostname: 'myhost', password: '$6$abc' },
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as {
      autoinstall: { identity: { username: string; hostname: string } }
    }
    expect(parsed.autoinstall.identity.username).toBe('ubuntu')
    expect(parsed.autoinstall.identity.hostname).toBe('myhost')
  })

  it('serializes storage layout mode', () => {
    const config: AutoinstallConfig = {
      version: 1,
      storage: { layout: { name: 'lvm' }, actionMode: false },
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { storage: { layout: { name: string } } } }
    expect(parsed.autoinstall.storage.layout.name).toBe('lvm')
  })

  it('serializes storage action mode from raw YAML', () => {
    const rawActions = '- id: disk0\n  type: disk\n  ptable: gpt'
    const config: AutoinstallConfig = {
      version: 1,
      storage: { actionMode: true, actions: rawActions },
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { storage: unknown[] } }
    expect(Array.isArray(parsed.autoinstall.storage)).toBe(true)
    const firstItem = parsed.autoinstall.storage[0] as { id: string; type: string }
    expect(firstItem.id).toBe('disk0')
  })

  it('parses network raw YAML verbatim', () => {
    const netplan = 'version: 2\nethernets:\n  eth0:\n    dhcp4: true'
    const config: AutoinstallConfig = { version: 1, network: netplan }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { network: { version: number } } }
    expect(parsed.autoinstall.network.version).toBe(2)
  })

  it('includes SSH config', () => {
    const config: AutoinstallConfig = {
      version: 1,
      ssh: {
        'install-server': true,
        'authorized-keys': ['ssh-rsa AAAA...'],
        'allow-pw': false,
      },
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as {
      autoinstall: { ssh: { 'install-server': boolean; 'authorized-keys': string[] } }
    }
    expect(parsed.autoinstall.ssh['install-server']).toBe(true)
    expect(parsed.autoinstall.ssh['authorized-keys']).toHaveLength(1)
  })

  it('includes snaps list', () => {
    const config: AutoinstallConfig = {
      version: 1,
      snaps: [{ name: 'snapcraft', channel: 'stable', classic: true }],
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { snaps: Array<{ name: string }> } }
    expect(parsed.autoinstall.snaps[0].name).toBe('snapcraft')
  })

  it('omits empty snaps array', () => {
    const config: AutoinstallConfig = { version: 1, snaps: [] }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: Record<string, unknown> }
    expect(parsed.autoinstall).not.toHaveProperty('snaps')
  })

  it('includes packages list', () => {
    const config: AutoinstallConfig = { version: 1, packages: ['git', 'vim'] }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { packages: string[] } }
    expect(parsed.autoinstall.packages).toEqual(['git', 'vim'])
  })

  it('omits empty packages array', () => {
    const config: AutoinstallConfig = { version: 1, packages: [] }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: Record<string, unknown> }
    expect(parsed.autoinstall).not.toHaveProperty('packages')
  })

  it('includes kernel with flavor', () => {
    const config: AutoinstallConfig = { version: 1, kernel: { flavor: 'generic' } }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { kernel: { flavor: string } } }
    expect(parsed.autoinstall.kernel.flavor).toBe('generic')
  })

  it('includes kernel-crash-dumps as null', () => {
    const config: AutoinstallConfig = { version: 1, 'kernel-crash-dumps': null }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { 'kernel-crash-dumps': null } }
    expect(parsed.autoinstall['kernel-crash-dumps']).toBeNull()
  })

  it('includes oem as auto string', () => {
    const config: AutoinstallConfig = { version: 1, oem: 'auto' }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { oem: string } }
    expect(parsed.autoinstall.oem).toBe('auto')
  })

  it('includes timezone', () => {
    const config: AutoinstallConfig = { version: 1, timezone: 'Europe/Berlin' }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { timezone: string } }
    expect(parsed.autoinstall.timezone).toBe('Europe/Berlin')
  })

  it('includes updates enum', () => {
    const config: AutoinstallConfig = { version: 1, updates: 'security' }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { updates: string } }
    expect(parsed.autoinstall.updates).toBe('security')
  })

  it('includes shutdown enum', () => {
    const config: AutoinstallConfig = { version: 1, shutdown: 'reboot' }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { shutdown: string } }
    expect(parsed.autoinstall.shutdown).toBe('reboot')
  })

  it('includes reporting handlers', () => {
    const config: AutoinstallConfig = {
      version: 1,
      reporting: { 'my-hook': { type: 'webhook', endpoint: 'https://example.com' } },
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as {
      autoinstall: { reporting: { 'my-hook': { type: string } } }
    }
    expect(parsed.autoinstall.reporting['my-hook'].type).toBe('webhook')
  })

  it('includes user-data structured fields', () => {
    const config: AutoinstallConfig = {
      version: 1,
      'user-data': { name: 'ubuntu', gecos: 'Ubuntu User', lock_passwd: false },
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { 'user-data': { name: string } } }
    expect(parsed.autoinstall['user-data'].name).toBe('ubuntu')
  })

  it('includes debconf-selections', () => {
    const config: AutoinstallConfig = {
      version: 1,
      'debconf-selections': 'tzdata tzdata/Areas select Europe',
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { 'debconf-selections': string } }
    expect(parsed.autoinstall['debconf-selections']).toContain('tzdata')
  })

  it('includes zdevs list', () => {
    const config: AutoinstallConfig = {
      version: 1,
      zdevs: [{ id: '0.0.1000', enabled: true }],
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { zdevs: Array<{ id: string }> } }
    expect(parsed.autoinstall.zdevs[0].id).toBe('0.0.1000')
  })

  it('includes early-commands', () => {
    const config: AutoinstallConfig = {
      version: 1,
      'early-commands': ['echo hello', 'apt-get update'],
    }
    const yaml = serializeToYaml(config)
    const parsed = parse(yaml) as { autoinstall: { 'early-commands': string[] } }
    expect(parsed.autoinstall['early-commands']).toHaveLength(2)
  })

  it('produces valid YAML (parseable string)', () => {
    const config: AutoinstallConfig = {
      version: 1,
      locale: 'en_US.UTF-8',
      keyboard: { layout: 'us' },
      identity: { username: 'ubuntu', hostname: 'server', password: '$6$xyz' },
      ssh: { 'install-server': true },
    }
    const yaml = serializeToYaml(config)
    expect(() => parse(yaml)).not.toThrow()
  })
})
