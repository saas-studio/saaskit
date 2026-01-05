/**
 * Schema Compiler
 *
 * Compiles Schema AST to various output formats:
 * - TypeScript interfaces
 * - JSON Schema
 * - OpenAPI specification
 *
 * @module compiler/schema-compiler
 */

import type { AppNode, ResourceNode, FieldNode, FieldType } from '../schema/ast'
import { toDisplayName, fieldTypeToTS } from '../utils'

/**
 * TypeScript compilation result
 */
export interface TypeScriptResult {
  success: boolean
  code: string
  errors?: string[]
}

/**
 * JSON Schema compilation result
 */
export interface JSONSchemaResult {
  success: boolean
  schema: {
    $schema: string
    definitions?: Record<string, JSONSchemaDefinition>
  }
  errors?: string[]
}

interface JSONSchemaDefinition {
  type: string
  properties?: Record<string, JSONSchemaProperty>
  required?: string[]
}

interface JSONSchemaProperty {
  type?: string
  format?: string
  enum?: string[]
  $ref?: string
}

/**
 * OpenAPI compilation result
 */
export interface OpenAPIResult {
  success: boolean
  spec: {
    openapi: string
    info: {
      title: string
      version: string
      description?: string
    }
    paths: Record<string, OpenAPIPath>
    components?: {
      schemas?: Record<string, OpenAPISchema>
    }
  }
  errors?: string[]
}

interface OpenAPIPath {
  get?: OpenAPIOperation
  post?: OpenAPIOperation
  put?: OpenAPIOperation
  delete?: OpenAPIOperation
}

interface OpenAPIOperation {
  summary: string
  operationId: string
  responses: Record<string, { description: string }>
  requestBody?: {
    content: Record<string, { schema: { $ref: string } }>
  }
  parameters?: Array<{
    name: string
    in: string
    required: boolean
    schema: { type: string }
  }>
}

interface OpenAPISchema {
  type: string
  properties?: Record<string, { type?: string; format?: string; enum?: string[] }>
  required?: string[]
}

/**
 * Map field types to JSON Schema types
 */
function fieldTypeToJSONSchema(field: FieldNode): JSONSchemaProperty {
  if (field.type === 'select' && field.values && field.values.length > 0) {
    return { type: 'string', enum: field.values }
  }

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'password':
    case 'relation':
      return { type: 'string' }
    case 'email':
      return { type: 'string', format: 'email' }
    case 'url':
      return { type: 'string', format: 'uri' }
    case 'phone':
      return { type: 'string', format: 'phone' }
    case 'number':
      return { type: 'number' }
    case 'boolean':
      return { type: 'boolean' }
    case 'date':
      return { type: 'string', format: 'date-time' }
    case 'json':
      return { type: 'object' }
    case 'select':
      return { type: 'string' }
    default:
      return { type: 'string' }
  }
}

/**
 * Compile AST to TypeScript interfaces
 */
export function compileToTypeScript(app: AppNode): TypeScriptResult {
  const lines: string[] = []

  lines.push(`/**`)
  lines.push(` * ${app.displayName} - Generated Types`)
  lines.push(` * Generated from Schema AST`)
  lines.push(` */`)
  lines.push('')

  for (const resource of app.resources) {
    lines.push(`export interface ${resource.name} {`)
    lines.push(`  id: string`)

    for (const field of resource.fields) {
      const tsType = fieldTypeToTS(field)
      const optional = field.modifiers.optional ? '?' : ''
      const comment = field.type === 'relation' && field.target ? ` // Relation to ${field.target}` : ''

      lines.push(`  ${field.name}${optional}: ${tsType}${comment}`)
    }

    lines.push(`}`)
    lines.push('')
  }

  return {
    success: true,
    code: lines.join('\n'),
  }
}

/**
 * Compile AST to JSON Schema
 */
export function compileToJSON(app: AppNode): JSONSchemaResult {
  const definitions: Record<string, JSONSchemaDefinition> = {}

  for (const resource of app.resources) {
    const properties: Record<string, JSONSchemaProperty> = {
      id: { type: 'string' },
    }
    const required: string[] = ['id']

    for (const field of resource.fields) {
      properties[field.name] = fieldTypeToJSONSchema(field)

      if (field.modifiers.required) {
        required.push(field.name)
      }
    }

    definitions[resource.name] = {
      type: 'object',
      properties,
      required: required.length > 1 ? required : undefined,
    }
  }

  return {
    success: true,
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: Object.keys(definitions).length > 0 ? definitions : undefined,
    },
  }
}

/**
 * Compile AST to OpenAPI specification
 */
export function compileToOpenAPI(app: AppNode): OpenAPIResult {
  const paths: Record<string, OpenAPIPath> = {}
  const schemas: Record<string, OpenAPISchema> = {}

  for (const resource of app.resources) {
    const resourcePath = resource.path
    const itemPath = `${resourcePath}/{id}`
    const name = resource.name
    const nameLower = name.toLowerCase()

    // Build schema
    const properties: Record<string, { type?: string; format?: string; enum?: string[] }> = {
      id: { type: 'string' },
    }
    const required: string[] = ['id']

    for (const field of resource.fields) {
      const jsonSchema = fieldTypeToJSONSchema(field)
      properties[field.name] = jsonSchema

      if (field.modifiers.required) {
        required.push(field.name)
      }
    }

    schemas[name] = {
      type: 'object',
      properties,
      required: required.length > 1 ? required : undefined,
    }

    // Build paths
    paths[resourcePath] = {
      get: {
        summary: `List all ${resource.pluralName}`,
        operationId: `list${resource.pluralName}`,
        responses: {
          '200': { description: `List of ${resource.pluralName}` },
        },
      },
      post: {
        summary: `Create a new ${name}`,
        operationId: `create${name}`,
        requestBody: {
          content: {
            'application/json': { schema: { $ref: `#/components/schemas/${name}` } },
          },
        },
        responses: {
          '201': { description: `${name} created` },
        },
      },
    }

    paths[itemPath] = {
      get: {
        summary: `Get a ${name} by ID`,
        operationId: `get${name}`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: `${name} details` },
        },
      },
      put: {
        summary: `Update a ${name}`,
        operationId: `update${name}`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': { schema: { $ref: `#/components/schemas/${name}` } },
          },
        },
        responses: {
          '200': { description: `${name} updated` },
        },
      },
      delete: {
        summary: `Delete a ${name}`,
        operationId: `delete${name}`,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '204': { description: `${name} deleted` },
        },
      },
    }
  }

  return {
    success: true,
    spec: {
      openapi: '3.0.0',
      info: {
        title: toDisplayName(app.name),
        version: app.version,
        description: app.description,
      },
      paths,
      components: Object.keys(schemas).length > 0 ? { schemas } : undefined,
    },
  }
}
