/**
 * Worker Entry Point Generator
 *
 * Generates Cloudflare Worker entry points from schema definitions.
 * Includes:
 * - DO class export for CF binding
 * - Environment type declarations
 * - Fetch handler for standalone mode
 * - Request routing to DO instances
 */

import type { SchemaDefinition } from '@saaskit/core'

/**
 * Options for worker entry point generation
 */
export interface WorkerGeneratorOptions {
  /** Class name for the DO (defaults to schema name + "DO") */
  className?: string
  /** Binding name for the DO (defaults to uppercase snake case) */
  bindingName?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

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

/**
 * Convert string to UPPER_SNAKE_CASE
 */
function toUpperSnakeCase(str: string): string {
  return str
    .replace(/[-\s]+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .toUpperCase()
}

/**
 * Convert string to kebab-case for file names
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

// ============================================================================
// Code Generation
// ============================================================================

/**
 * Generate import statements and re-export
 */
function generateImportsAndExport(className: string, schemaName: string): string {
  const fileName = toKebabCase(schemaName)
  return `import { ${className} } from './${fileName}.do'

export { ${className} }`
}

/**
 * Generate Env interface
 */
function generateEnvInterface(bindingName: string, className: string): string {
  return `export interface Env {
  ${bindingName}: DurableObjectNamespace<${className}>
}`
}

/**
 * Generate DO ID extraction helper
 */
function generateDoIdExtractor(): string {
  return `function extractDoId(url: URL): string | null {
  const match = url.pathname.match(/^\\/do\\/([^\\/]+)/)
  return match ? match[1] : null
}`
}

/**
 * Generate fetch handler
 */
function generateFetchHandler(bindingName: string): string {
  return `export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url)
      const doId = extractDoId(url) || 'default'
      const id = env.${bindingName}.idFromName(doId)
      const stub = env.${bindingName}.get(id)
      return await stub.fetch(request)
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}`
}

/**
 * Generate DO class re-export
 */
function generateDOClass(schema: SchemaDefinition, className: string): string {
  return `export class ${className} extends DurableObject {
  // This class will be implemented by the generated DO subclass
  // It's included here for the Cloudflare Workers runtime
}`
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generates a Cloudflare Worker entry point from a schema definition.
 *
 * @param schema - The schema definition to generate from
 * @param options - Generation options
 * @returns Generated TypeScript code as a string
 *
 * @example
 * ```typescript
 * const code = generateWorkerEntry(schema)
 * // Returns Worker entry point with DO binding
 * ```
 */
export function generateWorkerEntry(
  schema: SchemaDefinition,
  options?: WorkerGeneratorOptions
): string {
  const className = options?.className ?? `${toValidIdentifier(toPascalCase(schema.name))}DO`
  const bindingName = options?.bindingName ?? `${toUpperSnakeCase(schema.name)}_DO`

  // Generate code sections
  const importsAndExport = generateImportsAndExport(className, schema.name)
  const envInterface = generateEnvInterface(bindingName, className)
  const doClass = generateDOClass(schema, className)
  const doIdExtractor = generateDoIdExtractor()
  const fetchHandler = generateFetchHandler(bindingName)

  // Assemble the code
  const code = `${importsAndExport}

${envInterface}

${doClass}

${fetchHandler}

${doIdExtractor}
`

  return code.trim()
}
