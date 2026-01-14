/**
 * DO Subclass Generator
 *
 * Generates typed Durable Object subclasses from schema definitions.
 * Includes:
 * - Typed CRUD methods per resource
 * - Zod validation schemas
 * - RPC allowlist configuration
 * - Relationship handlers
 */

import type { SchemaDefinition, FieldDefinition, RelationshipConfig } from '@saaskit/core/schema-mapping'
import { singularize } from '@saaskit/core/utils/pluralize'

/**
 * Options for DO subclass generation
 */
export interface DOGeneratorOptions {
  /** Class name for the generated DO (defaults to schema name + "DO") */
  className?: string
  /** Include Zod validation schemas (default: true) */
  includeValidation?: boolean
  /** Generate relationship helper methods (default: true) */
  includeRelationships?: boolean
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
 * Get singular PascalCase name for a resource
 */
function getSingularName(resourceName: string): string {
  return toPascalCase(singularize(resourceName))
}

/**
 * Get plural PascalCase name for a resource
 */
function getPluralName(resourceName: string): string {
  return toPascalCase(resourceName)
}

/**
 * Get Zod type for a field definition
 */
function getZodType(fieldDef: FieldDefinition): string {
  // Shorthand 'string' notation is optional by default
  if (typeof fieldDef === 'string') {
    return `${fieldToZod(fieldDef)}.optional()`
  }

  const baseType = fieldToZod(fieldDef.type)
  const isOptional = !fieldDef.required

  if (fieldDef.enum) {
    const enumValues = fieldDef.enum.map((v) => `'${v}'`).join(', ')
    return isOptional ? `z.enum([${enumValues}]).optional()` : `z.enum([${enumValues}])`
  }

  return isOptional ? `${baseType}.optional()` : baseType
}

/**
 * Map field type to Zod type
 */
function fieldToZod(type: string): string {
  switch (type) {
    case 'string':
      return 'z.string()'
    case 'number':
      return 'z.number()'
    case 'boolean':
      return 'z.boolean()'
    case 'date':
      return 'z.string()' // ISO date strings
    default:
      return 'z.unknown()'
  }
}

// ============================================================================
// Code Generation
// ============================================================================

/**
 * Generate Zod schema for a resource
 */
function generateZodSchema(resourceName: string, fields: Record<string, FieldDefinition>): string {
  const schemaName = `${getSingularName(resourceName)}Schema`
  const fieldDefs = Object.entries(fields)
    .map(([name, def]) => `  ${name}: ${getZodType(def)}`)
    .join(',\n')

  return `const ${schemaName} = z.object({\n${fieldDefs}\n})`
}

/**
 * Generate CRUD methods for a resource
 */
function generateCrudMethods(resourceName: string): string {
  const singular = getSingularName(resourceName)
  const plural = getPluralName(resourceName)
  const schemaName = `${singular}Schema`

  return `
  async create${singular}(data: z.input<typeof ${schemaName}>) {
    return this.create('${resourceName}', ${schemaName}.parse(data))
  }

  async get${singular}(id: string) {
    return this.read('${resourceName}', id)
  }

  async list${plural}(options?: { limit?: number; offset?: number }) {
    return this.list('${resourceName}', options)
  }

  async update${singular}(id: string, data: Partial<z.input<typeof ${schemaName}>>) {
    return this.update('${resourceName}', id, data)
  }

  async delete${singular}(id: string): Promise<boolean> {
    return this.delete('${resourceName}', id)
  }`
}

/**
 * Generate CRUD methods without validation
 */
function generateCrudMethodsNoValidation(resourceName: string): string {
  const singular = getSingularName(resourceName)
  const plural = getPluralName(resourceName)

  return `
  async create${singular}(data: Record<string, unknown>) {
    return this.create('${resourceName}', data)
  }

  async get${singular}(id: string) {
    return this.read('${resourceName}', id)
  }

  async list${plural}(options?: { limit?: number; offset?: number }) {
    return this.list('${resourceName}', options)
  }

  async update${singular}(id: string, data: Record<string, unknown>) {
    return this.update('${resourceName}', id, data)
  }

  async delete${singular}(id: string): Promise<boolean> {
    return this.delete('${resourceName}', id)
  }`
}

/**
 * Generate relationship helper method
 */
function generateRelationshipMethod(
  fromResource: string,
  relName: string,
  relConfig: RelationshipConfig
): string {
  const fromSingular = getSingularName(fromResource)
  const toSingular = getSingularName(relConfig.resource)
  const methodName = relConfig.type === 'belongsTo'
    ? `get${fromSingular}${toPascalCase(relName)}`
    : `get${fromSingular}${getPluralName(relConfig.resource)}`

  if (relConfig.type === 'belongsTo') {
    return `
  async ${methodName}(${fromResource.slice(0, -1)}Id: string) {
    const record = await this.read('${fromResource}', ${fromResource.slice(0, -1)}Id)
    if (!record) return null
    const foreignKey = record['${relName}Id'] as string | undefined
    if (!foreignKey) return null
    return this.read('${relConfig.resource}', foreignKey)
  }`
  }

  // hasMany
  return `
  async ${methodName}(${fromResource.slice(0, -1)}Id: string, options?: { limit?: number; offset?: number }) {
    return this.query('${relConfig.resource}', {
      ...options,
      where: { ${singularize(fromResource)}Id: ${fromResource.slice(0, -1)}Id }
    })
  }`
}

/**
 * Generate allowed methods list
 */
function generateAllowedMethods(
  schema: SchemaDefinition,
  includeRelationships: boolean
): string[] {
  const methods: string[] = []

  for (const resourceName of Object.keys(schema.resources)) {
    const singular = getSingularName(resourceName)
    const plural = getPluralName(resourceName)
    methods.push(
      `'create${singular}'`,
      `'get${singular}'`,
      `'list${plural}'`,
      `'update${singular}'`,
      `'delete${singular}'`
    )
  }

  if (includeRelationships) {
    for (const [resourceName, resource] of Object.entries(schema.resources)) {
      if (!resource.relationships) continue
      for (const [relName, relConfig] of Object.entries(resource.relationships)) {
        const fromSingular = getSingularName(resourceName)
        const methodName = relConfig.type === 'belongsTo'
          ? `get${fromSingular}${toPascalCase(relName)}`
          : `get${fromSingular}${getPluralName(relConfig.resource)}`
        methods.push(`'${methodName}'`)
      }
    }
  }

  return methods
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generates a typed DO subclass from a schema definition.
 *
 * @param schema - The schema definition to generate from
 * @param options - Generation options
 * @returns Generated TypeScript code as a string
 *
 * @example
 * ```typescript
 * const code = generateDOSubclass(schema)
 * // Returns TypeScript class extending SaasKitDO
 * ```
 */
export function generateDOSubclass(
  schema: SchemaDefinition,
  options?: DOGeneratorOptions
): string {
  const className = options?.className ?? `${toValidIdentifier(toPascalCase(schema.name))}DO`
  const includeValidation = options?.includeValidation !== false
  const includeRelationships = options?.includeRelationships !== false

  const resources = Object.entries(schema.resources)
  const allowedMethods = generateAllowedMethods(schema, includeRelationships)

  // Generate imports
  const imports = [
    "import { SaasKitDO } from '@saaskit/core'"
  ]
  if (includeValidation) {
    imports.push("import { z } from 'zod'")
  }

  // Generate Zod schemas
  const zodSchemas = includeValidation
    ? resources
        .map(([name, resource]) => generateZodSchema(name, resource.fields))
        .join('\n\n')
    : ''

  // Generate CRUD methods
  const crudMethods = resources
    .map(([name]) =>
      includeValidation
        ? generateCrudMethods(name)
        : generateCrudMethodsNoValidation(name)
    )
    .join('\n')

  // Generate relationship methods
  let relationshipMethods = ''
  if (includeRelationships) {
    const relMethods: string[] = []
    for (const [resourceName, resource] of resources) {
      if (!resource.relationships) continue
      for (const [relName, relConfig] of Object.entries(resource.relationships)) {
        relMethods.push(generateRelationshipMethod(resourceName, relName, relConfig))
      }
    }
    relationshipMethods = relMethods.join('\n')
  }

  // Assemble the code
  const code = `${imports.join('\n')}

${zodSchemas}

export class ${className} extends SaasKitDO {
  protected allowedMethods = new Set([
    ${allowedMethods.join(',\n    ')}
  ])
${crudMethods}
${relationshipMethods}
}
`

  return code.trim()
}
