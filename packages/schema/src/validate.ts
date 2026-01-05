/**
 * Schema Validation Functions
 *
 * Type guards and validation helpers for SaaSKit schema types.
 */

import type {
  FieldType,
  Cardinality,
  ViewType,
  Field,
  Relation,
  Resource,
  Action,
  Workflow,
  ViewConfig,
  SaaSSchema,
} from './types'

// ============================================================================
// Constants
// ============================================================================

const FIELD_TYPES: FieldType[] = [
  'string',
  'number',
  'boolean',
  'date',
  'datetime',
  'uuid',
  'email',
  'url',
  'json',
  'array',
  'enum',
]

const CARDINALITIES: Cardinality[] = ['one', 'many']

const VIEW_TYPES: ViewType[] = ['list', 'grid', 'kanban', 'calendar', 'table', 'detail']

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid FieldType
 */
export function isValidFieldType(value: unknown): value is FieldType {
  return typeof value === 'string' && FIELD_TYPES.includes(value as FieldType)
}

/**
 * Check if a value is a valid Cardinality
 */
export function isValidCardinality(value: unknown): value is Cardinality {
  return typeof value === 'string' && CARDINALITIES.includes(value as Cardinality)
}

/**
 * Check if a value is a valid ViewType
 */
export function isValidViewType(value: unknown): value is ViewType {
  return typeof value === 'string' && VIEW_TYPES.includes(value as ViewType)
}

/**
 * Check if a value is a valid Field
 */
export function isValidField(value: unknown): value is Field {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.name === 'string' &&
    isValidFieldType(obj.type) &&
    typeof obj.required === 'boolean'
  )
}

/**
 * Check if a value is a valid Relation
 */
export function isValidRelation(value: unknown): value is Relation {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.name === 'string' &&
    typeof obj.to === 'string' &&
    isValidCardinality(obj.cardinality)
  )
}

/**
 * Check if a value is a valid Resource
 */
export function isValidResource(value: unknown): value is Resource {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.name === 'string' &&
    Array.isArray(obj.fields) &&
    obj.fields.every(isValidField) &&
    Array.isArray(obj.relations) &&
    obj.relations.every(isValidRelation)
  )
}

/**
 * Check if a value is a valid Action
 */
export function isValidAction(value: unknown): value is Action {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return typeof obj.name === 'string'
}

/**
 * Check if a value is a valid Workflow
 */
export function isValidWorkflow(value: unknown): value is Workflow {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.name === 'string' &&
    typeof obj.resource === 'string' &&
    Array.isArray(obj.states) &&
    Array.isArray(obj.transitions)
  )
}

/**
 * Check if a value is a valid ViewConfig
 */
export function isValidViewConfig(value: unknown): value is ViewConfig {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return typeof obj.name === 'string' && isValidViewType(obj.type)
}

/**
 * Check if a value is a valid SaaSSchema
 */
export function isValidSaaSSchema(value: unknown): value is SaaSSchema {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  if (typeof obj.metadata !== 'object' || obj.metadata === null) return false
  const metadata = obj.metadata as Record<string, unknown>
  return (
    typeof metadata.name === 'string' &&
    typeof metadata.version === 'string' &&
    Array.isArray(obj.resources) &&
    obj.resources.every(isValidResource)
  )
}

// ============================================================================
// Serialization Helpers
// ============================================================================

/**
 * Serialize a SaaSSchema to JSON string
 */
export function serializeSchema(schema: SaaSSchema): string {
  return JSON.stringify(schema, null, 2)
}

/**
 * Deserialize a JSON string to SaaSSchema
 */
export function deserializeSchema(json: string): SaaSSchema {
  const parsed = JSON.parse(json)
  if (!isValidSaaSSchema(parsed)) {
    throw new Error('Invalid SaaSSchema')
  }
  return parsed
}
