/**
 * Wrangler Config Generator
 *
 * Generates wrangler.toml configuration files from schema definitions.
 * Includes:
 * - Worker configuration
 * - Durable Object bindings
 * - Migrations
 * - Dev settings
 */

import type { SchemaDefinition } from '@saaskit/core/schema-mapping'
import * as TOML from '@iarna/toml'

/**
 * Options for wrangler config generation
 */
export interface WranglerGeneratorOptions {
  /** Generation mode - 'dev' includes dev server settings */
  mode?: 'dev' | 'production'
  /** Compatibility date (defaults to recent date) */
  compatibilityDate?: string
  /** Main entry point (defaults to './src/worker.ts') */
  main?: string
  /** Dev port (defaults to 8787) */
  devPort?: number
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert string to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * Convert string to SCREAMING_SNAKE_CASE
 */
function toScreamingSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase()
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (c) => c.toUpperCase())
}

/**
 * Make a valid identifier from a string
 */
function toValidIdentifier(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '')
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generates a wrangler.toml configuration from a schema definition.
 *
 * @param schema - The schema definition to generate from
 * @param options - Generation options
 * @returns Generated TOML configuration as a string
 *
 * @example
 * ```typescript
 * const config = generateWranglerConfig(schema)
 * // Returns TOML configuration string
 * ```
 */
export function generateWranglerConfig(
  schema: SchemaDefinition,
  options?: WranglerGeneratorOptions
): string {
  const workerName = toKebabCase(schema.name)
  const bindingName = `${toScreamingSnakeCase(toValidIdentifier(schema.name))}_DO`
  const className = `${toValidIdentifier(toPascalCase(schema.name))}DO`
  const compatibilityDate = options?.compatibilityDate ?? '2024-01-01'
  const main = options?.main ?? './src/worker.ts'
  const mode = options?.mode ?? 'production'
  const devPort = options?.devPort ?? 8787

  // Build the configuration object
  const config: any = {
    name: workerName,
    main,
    compatibility_date: compatibilityDate,
    compatibility_flags: ['nodejs_compat'],
    durable_objects: {
      bindings: [
        {
          name: bindingName,
          class_name: className,
        },
      ],
    },
    migrations: [
      {
        tag: 'v1',
        new_sqlite_classes: [className],
      },
    ],
  }

  // Add dev settings if in dev mode
  if (mode === 'dev') {
    config.dev = {
      port: devPort,
      local_protocol: 'http',
    }
  }

  // Convert to TOML
  return TOML.stringify(config as TOML.JsonMap)
}
