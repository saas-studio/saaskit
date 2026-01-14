/**
 * Schema-to-Zod Generator
 *
 * Generates Zod validation schemas from SaaSKit YAML schemas.
 * Supports all field types, relations, and validation constraints.
 *
 * @see saaskit-82x
 */

import { z, type ZodTypeAny, type ZodObject, type ZodRawShape } from 'zod'
import type { SaaSSchema, Resource, Field, FieldType, Relation } from './types'

// ============================================================================
// Types
// ============================================================================

/** Options for schema generation */
export interface GenerateZodOptions {
  /** Generate separate create/update schema variants */
  generateVariants?: boolean
  /** Coerce date strings to Date objects */
  coerceDates?: boolean
}

/** Result of schema generation */
export interface ZodSchemaResult {
  /** Main schemas for each resource */
  schemas: Record<string, ZodObject<ZodRawShape>>
  /** TypeScript type definitions (for codegen) */
  types: Record<string, string>
  /** Create schemas (id and timestamps optional) */
  createSchemas?: Record<string, ZodObject<ZodRawShape>>
  /** Update schemas (all fields optional for partial updates) */
  updateSchemas?: Record<string, ZodObject<ZodRawShape>>
}

// ============================================================================
// Field Type Mapping
// ============================================================================

/**
 * Maps a SaaSKit field type to a Zod schema
 */
function fieldTypeToZod(
  field: Field,
  options: GenerateZodOptions = {}
): ZodTypeAny {
  const { type, annotations } = field
  let schema: ZodTypeAny

  switch (type) {
    case 'string':
      schema = z.string()
      // Apply string-specific validations
      if (annotations?.min !== undefined) {
        schema = (schema as z.ZodString).min(annotations.min)
      }
      if (annotations?.max !== undefined) {
        schema = (schema as z.ZodString).max(annotations.max)
      }
      if (annotations?.pattern) {
        schema = (schema as z.ZodString).regex(new RegExp(annotations.pattern))
      }
      break

    case 'number':
      schema = z.number()
      if (annotations?.min !== undefined) {
        schema = (schema as z.ZodNumber).min(annotations.min)
      }
      if (annotations?.max !== undefined) {
        schema = (schema as z.ZodNumber).max(annotations.max)
      }
      break

    case 'boolean':
      schema = z.boolean()
      break

    case 'date':
    case 'datetime':
      // Coerce strings to dates
      schema = z.coerce.date()
      break

    case 'uuid':
      schema = z.string().uuid()
      break

    case 'email':
      schema = z.string().email()
      break

    case 'url':
      schema = z.string().url()
      break

    case 'json':
      schema = z.unknown()
      break

    case 'array':
      const itemType = annotations?.arrayType || 'string'
      const itemSchema = primitiveTypeToZod(itemType)
      schema = z.array(itemSchema)
      break

    case 'enum':
      const enumValues = annotations?.enumValues
      if (enumValues && enumValues.length > 0) {
        schema = z.enum(enumValues as [string, ...string[]])
      } else {
        schema = z.string()
      }
      break

    default:
      schema = z.unknown()
  }

  return schema
}

/**
 * Maps primitive types to Zod for array items
 */
function primitiveTypeToZod(type: FieldType | string): ZodTypeAny {
  switch (type) {
    case 'string':
      return z.string()
    case 'number':
      return z.number()
    case 'boolean':
      return z.boolean()
    case 'date':
    case 'datetime':
      return z.coerce.date()
    default:
      return z.unknown()
  }
}

// ============================================================================
// Resource Schema Generation
// ============================================================================

/**
 * Generates a Zod schema for a single resource
 */
function generateResourceSchema(
  resource: Resource,
  options: GenerateZodOptions = {}
): ZodObject<ZodRawShape> {
  const shape: ZodRawShape = {}

  // Add fields
  for (const field of resource.fields) {
    let fieldSchema = fieldTypeToZod(field, options)

    // Handle optional fields
    if (!field.required) {
      fieldSchema = fieldSchema.optional()
    }

    // Handle primary key - usually optional for create
    if (field.annotations?.primaryKey) {
      fieldSchema = fieldSchema.optional()
    }

    shape[field.name] = fieldSchema
  }

  // Add relation foreign keys
  for (const relation of resource.relations) {
    if (relation.cardinality === 'one') {
      const foreignKey = relation.foreignKey || `${relation.name}Id`
      // Only add if not already defined as a field
      if (!shape[foreignKey]) {
        let fkSchema: ZodTypeAny = z.string()
        if (!relation.required) {
          fkSchema = fkSchema.optional()
        }
        shape[foreignKey] = fkSchema
      }
    }
  }

  // Add timestamp fields if configured
  if (resource.timestamps) {
    if (resource.timestamps.createdAt) {
      shape.createdAt = z.coerce.date().optional()
    }
    if (resource.timestamps.updatedAt) {
      shape.updatedAt = z.coerce.date().optional()
    }
    if (resource.timestamps.deletedAt) {
      shape.deletedAt = z.coerce.date().optional().nullable()
    }
  }

  return z.object(shape)
}

/**
 * Generates a create schema (id and timestamps optional)
 */
function generateCreateSchema(
  resource: Resource,
  options: GenerateZodOptions = {}
): ZodObject<ZodRawShape> {
  const shape: ZodRawShape = {}

  for (const field of resource.fields) {
    let fieldSchema = fieldTypeToZod(field, options)

    // Primary key is always optional for create
    if (field.annotations?.primaryKey) {
      fieldSchema = fieldSchema.optional()
    } else if (!field.required) {
      fieldSchema = fieldSchema.optional()
    }

    shape[field.name] = fieldSchema
  }

  // Add relation foreign keys
  for (const relation of resource.relations) {
    if (relation.cardinality === 'one') {
      const foreignKey = relation.foreignKey || `${relation.name}Id`
      if (!shape[foreignKey]) {
        let fkSchema: ZodTypeAny = z.string()
        if (!relation.required) {
          fkSchema = fkSchema.optional()
        }
        shape[foreignKey] = fkSchema
      }
    }
  }

  // Timestamps are always optional for create
  if (resource.timestamps) {
    if (resource.timestamps.createdAt) {
      shape.createdAt = z.coerce.date().optional()
    }
    if (resource.timestamps.updatedAt) {
      shape.updatedAt = z.coerce.date().optional()
    }
  }

  return z.object(shape)
}

/**
 * Generates an update schema (all fields optional for partial updates)
 */
function generateUpdateSchema(
  resource: Resource,
  options: GenerateZodOptions = {}
): ZodObject<ZodRawShape> {
  const shape: ZodRawShape = {}

  for (const field of resource.fields) {
    // Skip primary key in updates
    if (field.annotations?.primaryKey) {
      continue
    }

    let fieldSchema = fieldTypeToZod(field, options)
    // All fields optional for partial update
    fieldSchema = fieldSchema.optional()
    shape[field.name] = fieldSchema
  }

  // Add relation foreign keys (optional)
  for (const relation of resource.relations) {
    if (relation.cardinality === 'one') {
      const foreignKey = relation.foreignKey || `${relation.name}Id`
      if (!shape[foreignKey]) {
        shape[foreignKey] = z.string().optional()
      }
    }
  }

  return z.object(shape)
}

// ============================================================================
// TypeScript Type Generation
// ============================================================================

/**
 * Generates TypeScript type string for a field
 */
function fieldTypeToTypeScript(field: Field): string {
  const { type, annotations } = field

  switch (type) {
    case 'string':
    case 'uuid':
    case 'email':
    case 'url':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'date':
    case 'datetime':
      return 'Date'
    case 'json':
      return 'unknown'
    case 'array':
      const itemType = annotations?.arrayType || 'string'
      return `${fieldTypeToTypeScriptPrimitive(itemType)}[]`
    case 'enum':
      const enumValues = annotations?.enumValues
      if (enumValues && enumValues.length > 0) {
        return enumValues.map((v) => `'${v}'`).join(' | ')
      }
      return 'string'
    default:
      return 'unknown'
  }
}

function fieldTypeToTypeScriptPrimitive(type: FieldType | string): string {
  switch (type) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'date':
    case 'datetime':
      return 'Date'
    default:
      return 'unknown'
  }
}

/**
 * Generates TypeScript interface for a resource
 */
function generateTypeScriptInterface(resource: Resource): string {
  const lines: string[] = []
  lines.push(`interface ${resource.name} {`)

  for (const field of resource.fields) {
    const optional = !field.required || field.annotations?.primaryKey ? '?' : ''
    const tsType = fieldTypeToTypeScript(field)
    lines.push(`  ${field.name}${optional}: ${tsType};`)
  }

  // Add relation foreign keys
  for (const relation of resource.relations) {
    if (relation.cardinality === 'one') {
      const foreignKey = relation.foreignKey || `${relation.name}Id`
      // Check if already added as a field
      const hasField = resource.fields.some((f) => f.name === foreignKey)
      if (!hasField) {
        const optional = !relation.required ? '?' : ''
        lines.push(`  ${foreignKey}${optional}: string;`)
      }
    }
  }

  // Add timestamps
  if (resource.timestamps) {
    if (resource.timestamps.createdAt) {
      lines.push(`  createdAt?: Date;`)
    }
    if (resource.timestamps.updatedAt) {
      lines.push(`  updatedAt?: Date;`)
    }
    if (resource.timestamps.deletedAt) {
      lines.push(`  deletedAt?: Date | null;`)
    }
  }

  lines.push(`}`)
  return lines.join('\n')
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Generates Zod schemas from a SaaSKit schema
 *
 * @example
 * ```typescript
 * const { schemas, types } = generateZodSchemas(saaskitSchema)
 *
 * // Validate data
 * const user = schemas.User.parse({ name: 'Alice', email: 'alice@example.com' })
 *
 * // TypeScript type inference
 * type User = z.infer<typeof schemas.User>
 * ```
 */
export function generateZodSchemas(
  schema: SaaSSchema,
  options: GenerateZodOptions = {}
): ZodSchemaResult {
  const schemas: Record<string, ZodObject<ZodRawShape>> = {}
  const types: Record<string, string> = {}
  const createSchemas: Record<string, ZodObject<ZodRawShape>> = {}
  const updateSchemas: Record<string, ZodObject<ZodRawShape>> = {}

  for (const resource of schema.resources) {
    // Generate main schema
    schemas[resource.name] = generateResourceSchema(resource, options)

    // Generate TypeScript type
    types[resource.name] = generateTypeScriptInterface(resource)

    // Generate variants if requested
    if (options.generateVariants) {
      createSchemas[resource.name] = generateCreateSchema(resource, options)
      updateSchemas[resource.name] = generateUpdateSchema(resource, options)
    }
  }

  const result: ZodSchemaResult = { schemas, types }

  if (options.generateVariants) {
    result.createSchemas = createSchemas
    result.updateSchemas = updateSchemas
  }

  return result
}
