/**
 * Wrangler Config Generator Tests - RED Phase
 *
 * Tests for generating wrangler.toml configuration from schema definitions.
 * These tests define the expected behavior and MUST FAIL until implementation is complete.
 *
 * Expected output structure:
 * - Valid TOML configuration
 * - Worker name derived from schema name
 * - Durable Object bindings and migrations
 * - Compatibility flags for nodejs_compat
 * - Dev settings for local development
 */

import { describe, it, expect } from 'vitest'
import { generateWranglerConfig } from '@saaskit/codegen'
import type { SchemaDefinition } from '@saaskit/core'
import * as TOML from '@iarna/toml'

// ============================================================================
// Test Schema Definition
// ============================================================================

const schema: SchemaDefinition = {
  name: 'MyApp',
  namespace: 'myapp.example.com',
  resources: {
    users: {
      fields: {
        name: 'string'
      }
    }
  }
}

// ============================================================================
// Basic TOML Generation Tests
// ============================================================================

describe('generateWranglerConfig', () => {
  it('generates valid TOML', () => {
    const config = generateWranglerConfig(schema)
    expect(() => TOML.parse(config)).not.toThrow()
  })

  it('sets worker name from schema', () => {
    const config = generateWranglerConfig(schema)
    const parsed = TOML.parse(config)
    expect(parsed.name).toBe('my-app')
  })

  it('configures durable object binding', () => {
    const config = generateWranglerConfig(schema)
    const parsed = TOML.parse(config) as any
    expect(parsed.durable_objects?.bindings).toContainEqual({
      name: 'MY_APP_DO',
      class_name: 'MyAppDO',
    })
  })

  it('includes migrations for DO', () => {
    const config = generateWranglerConfig(schema)
    const parsed = TOML.parse(config) as any
    expect(parsed.migrations).toBeDefined()
    expect(parsed.migrations[0].new_sqlite_classes).toContain('MyAppDO')
  })

  it('sets main entry point', () => {
    const config = generateWranglerConfig(schema)
    const parsed = TOML.parse(config)
    expect(parsed.main).toBe('./src/worker.ts')
  })

  it('enables nodejs_compat for crypto', () => {
    const config = generateWranglerConfig(schema)
    const parsed = TOML.parse(config) as any
    expect(parsed.compatibility_flags).toContain('nodejs_compat')
  })

  it('configures dev settings', () => {
    const config = generateWranglerConfig(schema, { mode: 'dev' })
    const parsed = TOML.parse(config) as any
    expect(parsed.dev?.port).toBeDefined()
    expect(parsed.dev?.local_protocol).toBe('http')
  })
})
