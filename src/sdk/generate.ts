/**
 * SDK Generator
 *
 * Generates typed client SDKs from Schema AST.
 * Creates TypeScript types, client classes, and package configuration.
 *
 * @module sdk/generate
 */

import type { AppNode, FieldNode } from '../schema/ast'
import { toDisplayName, normalizeName, fieldTypeToTS } from '../utils'

/**
 * Generated file
 */
export interface GeneratedFile {
  name: string
  content: string
}

/**
 * SDK generation result
 */
export interface SDKResult {
  success: boolean
  files: GeneratedFile[]
  errors?: string[]
}

/**
 * Generate TypeScript types for all resources
 */
export function generateSDKTypes(app: AppNode): string {
  const lines: string[] = []

  lines.push(`/**`)
  lines.push(` * ${app.displayName} SDK Types`)
  lines.push(` * Auto-generated - do not edit`)
  lines.push(` */`)
  lines.push('')

  for (const resource of app.resources) {
    const name = resource.name

    // Main interface
    lines.push(`export interface ${name} {`)
    lines.push(`  id: string`)
    for (const field of resource.fields) {
      const tsType = fieldTypeToTS(field)
      const optional = field.modifiers.optional ? '?' : ''
      lines.push(`  ${field.name}${optional}: ${tsType}`)
    }
    lines.push(`}`)
    lines.push('')

    // Create input
    lines.push(`export interface Create${name}Input {`)
    for (const field of resource.fields) {
      const tsType = fieldTypeToTS(field)
      const optional = field.modifiers.optional || !field.modifiers.required ? '?' : ''
      lines.push(`  ${field.name}${optional}: ${tsType}`)
    }
    lines.push(`}`)
    lines.push('')

    // Update input (all optional)
    lines.push(`export interface Update${name}Input {`)
    for (const field of resource.fields) {
      const tsType = fieldTypeToTS(field)
      lines.push(`  ${field.name}?: ${tsType}`)
    }
    lines.push(`}`)
    lines.push('')

    // List response
    lines.push(`export interface ${name}ListResponse {`)
    lines.push(`  data: ${name}[]`)
    lines.push(`  total?: number`)
    lines.push(`  page?: number`)
    lines.push(`  limit?: number`)
    lines.push(`}`)
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generate client class
 */
export function generateSDKClient(app: AppNode): string {
  const lines: string[] = []
  const className = toPascalCase(app.name) + 'Client'

  lines.push(`/**`)
  lines.push(` * ${app.displayName} SDK Client`)
  lines.push(` * Auto-generated - do not edit`)
  lines.push(` */`)
  lines.push('')
  lines.push(`import type {`)

  for (const resource of app.resources) {
    lines.push(`  ${resource.name},`)
    lines.push(`  Create${resource.name}Input,`)
    lines.push(`  Update${resource.name}Input,`)
    lines.push(`  ${resource.name}ListResponse,`)
  }

  lines.push(`} from './types'`)
  lines.push('')

  // Client config interface
  lines.push(`export interface ${className}Config {`)
  lines.push(`  baseUrl: string`)
  lines.push(`  headers?: Record<string, string>`)
  lines.push(`}`)
  lines.push('')

  // Resource client class template
  for (const resource of app.resources) {
    const name = resource.name
    const nameLower = name.toLowerCase()
    const path = resource.path

    lines.push(`class ${name}Client {`)
    lines.push(`  constructor(private config: ${className}Config) {}`)
    lines.push('')
    lines.push(`  async list(): Promise<${name}ListResponse> {`)
    lines.push(`    const res = await fetch(\`\${this.config.baseUrl}${path}\`, {`)
    lines.push(`      headers: this.config.headers,`)
    lines.push(`    })`)
    lines.push(`    return res.json()`)
    lines.push(`  }`)
    lines.push('')
    lines.push(`  async get(id: string): Promise<${name}> {`)
    lines.push(`    const res = await fetch(\`\${this.config.baseUrl}${path}/\${id}\`, {`)
    lines.push(`      headers: this.config.headers,`)
    lines.push(`    })`)
    lines.push(`    return res.json()`)
    lines.push(`  }`)
    lines.push('')
    lines.push(`  async create(data: Create${name}Input): Promise<${name}> {`)
    lines.push(`    const res = await fetch(\`\${this.config.baseUrl}${path}\`, {`)
    lines.push(`      method: 'POST',`)
    lines.push(`      headers: { 'Content-Type': 'application/json', ...this.config.headers },`)
    lines.push(`      body: JSON.stringify(data),`)
    lines.push(`    })`)
    lines.push(`    return res.json()`)
    lines.push(`  }`)
    lines.push('')
    lines.push(`  async update(id: string, data: Update${name}Input): Promise<${name}> {`)
    lines.push(`    const res = await fetch(\`\${this.config.baseUrl}${path}/\${id}\`, {`)
    lines.push(`      method: 'PUT',`)
    lines.push(`      headers: { 'Content-Type': 'application/json', ...this.config.headers },`)
    lines.push(`      body: JSON.stringify(data),`)
    lines.push(`    })`)
    lines.push(`    return res.json()`)
    lines.push(`  }`)
    lines.push('')
    lines.push(`  async delete(id: string): Promise<void> {`)
    lines.push(`    await fetch(\`\${this.config.baseUrl}${path}/\${id}\`, {`)
    lines.push(`      method: 'DELETE',`)
    lines.push(`      headers: this.config.headers,`)
    lines.push(`    })`)
    lines.push(`  }`)
    lines.push(`}`)
    lines.push('')
  }

  // Main client class
  lines.push(`export class ${className} {`)
  lines.push(`  private config: ${className}Config`)
  lines.push('')

  for (const resource of app.resources) {
    const propName = resource.pluralName.charAt(0).toLowerCase() + resource.pluralName.slice(1)
    lines.push(`  public ${propName}: ${resource.name}Client`)
  }

  lines.push('')
  lines.push(`  constructor(config: ${className}Config) {`)
  lines.push(`    this.config = config`)

  for (const resource of app.resources) {
    const propName = resource.pluralName.charAt(0).toLowerCase() + resource.pluralName.slice(1)
    lines.push(`    this.${propName} = new ${resource.name}Client(config)`)
  }

  lines.push(`  }`)
  lines.push(`}`)
  lines.push('')

  return lines.join('\n')
}

/**
 * Generate complete SDK
 */
export function generateSDK(app: AppNode): SDKResult {
  const files: GeneratedFile[] = []

  // Types file
  files.push({
    name: 'types.ts',
    content: generateSDKTypes(app),
  })

  // Client file
  files.push({
    name: 'client.ts',
    content: generateSDKClient(app),
  })

  // Index file
  const indexContent = [
    `/**`,
    ` * ${app.displayName} SDK`,
    ` */`,
    ``,
    `export * from './types'`,
    `export * from './client'`,
    ``,
  ].join('\n')

  files.push({
    name: 'index.ts',
    content: indexContent,
  })

  // Package.json
  const packageJson = {
    name: `@${normalizeName(app.name)}/sdk`,
    version: app.version,
    description: `${app.displayName} SDK`,
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc',
      test: 'bun test',
    },
    dependencies: {},
    devDependencies: {
      typescript: '^5.0.0',
    },
  }

  files.push({
    name: 'package.json',
    content: JSON.stringify(packageJson, null, 2),
  })

  return {
    success: true,
    files,
  }
}

/**
 * Convert to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}
