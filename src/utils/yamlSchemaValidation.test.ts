/**
 * YAML Schema Validation Tests
 *
 * Validates that generated YAML conforms to the Canonical Autoinstall schema.
 * Uses a simplified inline schema based on:
 * https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-schema.html
 */
import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import Ajv from 'ajv'
import { serializeToYaml } from './yamlSerializer'
import { reducer, initialState } from '../context/AutoinstallConfigContext'
import type { AutoinstallConfig } from '../context/AutoinstallConfigContext'

// Simplified Autoinstall JSON Schema (core fields)
const autoinstallSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['autoinstall'],
  properties: {
    autoinstall: {
      type: 'object',
      required: ['version'],
      properties: {
        version: { type: 'integer', minimum: 1 },
        locale: { type: 'string' },
        keyboard: {
          type: 'object',
          required: ['layout'],
          properties: {
            layout: { type: 'string' },
            variant: { type: 'string' },
            toggle: { type: 'string' },
          },
        },
        'refresh-installer': {
          type: 'object',
          properties: {
            update: { type: 'boolean' },
            channel: { type: 'string' },
          },
        },
        source: {
          type: 'object',
          properties: {
            search_drivers: { type: 'boolean' },
            id: { type: 'string' },
          },
        },
        proxy: { type: 'string' },
        apt: {
          type: 'object',
          properties: {
            preserve_sources_list: { type: 'boolean' },
            fallback: { type: 'string', enum: ['abort', 'continue-anyway', 'offline-install'] },
            geoip: { type: 'boolean' },
          },
        },
        storage: { type: 'object' },
        identity: {
          type: 'object',
          required: ['username', 'hostname', 'password'],
          properties: {
            realname: { type: 'string' },
            username: { type: 'string' },
            hostname: { type: 'string' },
            password: { type: 'string' },
          },
        },
        'active-directory': {
          type: 'object',
          properties: {
            'admin-name': { type: 'string' },
            'domain-name': { type: 'string' },
          },
        },
        'ubuntu-pro': {
          type: 'object',
          properties: {
            token: { type: 'string' },
          },
        },
        ssh: {
          type: 'object',
          properties: {
            'install-server': { type: 'boolean' },
            'authorized-keys': { type: 'array', items: { type: 'string' } },
            'allow-pw': { type: 'boolean' },
          },
        },
        codecs: {
          type: 'object',
          properties: { install: { type: 'boolean' } },
        },
        drivers: {
          type: 'object',
          properties: { install: { type: 'boolean' } },
        },
        oem: {},
        snaps: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string' },
              channel: { type: 'string' },
              classic: { type: 'boolean' },
            },
          },
        },
        packages: { type: 'array', items: { type: 'string' } },
        kernel: {
          type: 'object',
          properties: {
            package: { type: 'string' },
            flavor: { type: 'string' },
          },
        },
        timezone: { type: 'string' },
        updates: { type: 'string', enum: ['security', 'all'] },
        shutdown: { type: 'string', enum: ['reboot', 'poweroff'] },
        reporting: { type: 'object' },
        'user-data': { type: 'object' },
        'debconf-selections': { type: 'string' },
        zdevs: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string' },
              enabled: { type: 'boolean' },
            },
          },
        },
        'interactive-sections': { type: 'array', items: { type: 'string' } },
        'early-commands': { type: 'array', items: { type: 'string' } },
        'late-commands': { type: 'array', items: { type: 'string' } },
        'error-commands': { type: 'array', items: { type: 'string' } },
      },
      additionalProperties: true,
    },
  },
}

const ajv = new Ajv({ allErrors: true })

function validate(config: AutoinstallConfig): { valid: boolean; errors: string[] } {
  const yaml = serializeToYaml(config)
  const parsed = parse(yaml)
  const validate = ajv.compile(autoinstallSchema)
  const valid = validate(parsed) as boolean
  const errors = (validate.errors ?? []).map((e) => `${e.instancePath} ${e.message}`)
  return { valid, errors }
}

describe('YAML Schema Validation', () => {
  it('minimal config (version only) validates', () => {
    const result = validate({ version: 1 })
    expect(result.errors).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('config with identity validates', () => {
    const config: AutoinstallConfig = {
      version: 1,
      identity: { username: 'ubuntu', hostname: 'server', password: '$6$abc' },
    }
    const result = validate(config)
    expect(result.errors).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('config with keyboard validates', () => {
    const config: AutoinstallConfig = {
      version: 1,
      keyboard: { layout: 'de', variant: 'nodeadkeys' },
    }
    const result = validate(config)
    expect(result.valid).toBe(true)
  })

  it('config with storage layout validates', () => {
    const config: AutoinstallConfig = {
      version: 1,
      storage: { layout: { name: 'lvm' }, actionMode: false },
    }
    const result = validate(config)
    expect(result.valid).toBe(true)
  })

  it('config with SSH validates', () => {
    const config: AutoinstallConfig = {
      version: 1,
      ssh: {
        'install-server': true,
        'authorized-keys': ['ssh-rsa AAAA...'],
        'allow-pw': false,
      },
    }
    const result = validate(config)
    expect(result.valid).toBe(true)
  })

  it('config with snaps validates', () => {
    const config: AutoinstallConfig = {
      version: 1,
      snaps: [{ name: 'snapcraft', channel: 'stable', classic: true }],
    }
    const result = validate(config)
    expect(result.valid).toBe(true)
  })

  it('config with packages validates', () => {
    const config: AutoinstallConfig = { version: 1, packages: ['git', 'vim', 'curl'] }
    const result = validate(config)
    expect(result.valid).toBe(true)
  })

  it('config with updates enum validates', () => {
    const config: AutoinstallConfig = { version: 1, updates: 'security' }
    const result = validate(config)
    expect(result.valid).toBe(true)
  })

  it('config with shutdown enum validates', () => {
    const config: AutoinstallConfig = { version: 1, shutdown: 'reboot' }
    const result = validate(config)
    expect(result.valid).toBe(true)
  })

  it('config with apt settings validates', () => {
    const config: AutoinstallConfig = {
      version: 1,
      apt: { preserve_sources_list: false, fallback: 'continue-anyway', geoip: true },
    }
    const result = validate(config)
    expect(result.valid).toBe(true)
  })

  it('config with zdevs validates', () => {
    const config: AutoinstallConfig = {
      version: 1,
      zdevs: [{ id: '0.0.1000', enabled: true }],
    }
    const result = validate(config)
    expect(result.valid).toBe(true)
  })

  it('config with early/late/error commands validates', () => {
    const config: AutoinstallConfig = {
      version: 1,
      'early-commands': ['echo early'],
      'late-commands': ['echo late'],
      'error-commands': ['echo error'],
    }
    const result = validate(config)
    expect(result.valid).toBe(true)
  })

  it('fully populated config validates', () => {
    let state = initialState
    state = reducer(state, { type: 'SET_LOCALE', payload: 'en_US.UTF-8' })
    state = reducer(state, { type: 'SET_KEYBOARD', payload: { layout: 'us' } })
    state = reducer(state, {
      type: 'SET_IDENTITY',
      payload: { username: 'ubuntu', hostname: 'myhost', password: '$6$xyz' },
    })
    state = reducer(state, {
      type: 'SET_SSH',
      payload: { 'install-server': true, 'allow-pw': false },
    })
    state = reducer(state, { type: 'SET_TIMEZONE', payload: 'Europe/Berlin' })
    state = reducer(state, { type: 'SET_UPDATES', payload: 'security' })
    state = reducer(state, { type: 'SET_SHUTDOWN', payload: 'reboot' })
    state = reducer(state, { type: 'SET_PACKAGES', payload: ['git', 'vim'] })
    state = reducer(state, {
      type: 'SET_SNAPS',
      payload: [{ name: 'snapcraft', channel: 'stable', classic: false }],
    })

    const result = validate(state)
    expect(result.errors).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('generated YAML omits undefined optional fields', () => {
    const yaml = serializeToYaml({ version: 1 })
    expect(yaml).not.toContain('locale:')
    expect(yaml).not.toContain('keyboard:')
    expect(yaml).not.toContain('identity:')
    expect(yaml).not.toContain('ssh:')
  })

  it('generated YAML always includes autoinstall root key', () => {
    const yaml = serializeToYaml({ version: 1 })
    expect(yaml).toMatch(/^autoinstall:/)
  })
})

describe('YAML Serialization Performance', () => {
  it('yaml.stringify() runs in < 50ms for a fully populated config', () => {
    let state = initialState
    state = reducer(state, { type: 'SET_LOCALE', payload: 'en_US.UTF-8' })
    state = reducer(state, { type: 'SET_KEYBOARD', payload: { layout: 'us', variant: '' } })
    state = reducer(state, {
      type: 'SET_IDENTITY',
      payload: { realname: 'Ubuntu User', username: 'ubuntu', hostname: 'myhost', password: '$6$abc' },
    })
    state = reducer(state, {
      type: 'SET_SSH',
      payload: { 'install-server': true, 'authorized-keys': ['ssh-rsa AAAA...'], 'allow-pw': false },
    })
    state = reducer(state, { type: 'SET_PACKAGES', payload: Array.from({ length: 50 }, (_, i) => `pkg-${i}`) })
    state = reducer(state, {
      type: 'SET_SNAPS',
      payload: Array.from({ length: 10 }, (_, i) => ({ name: `snap-${i}`, channel: 'stable' })),
    })
    state = reducer(state, { type: 'SET_TIMEZONE', payload: 'Europe/Berlin' })
    state = reducer(state, { type: 'SET_UPDATES', payload: 'security' })
    state = reducer(state, { type: 'SET_SHUTDOWN', payload: 'reboot' })

    const start = performance.now()
    serializeToYaml(state)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(50)
  })
})
