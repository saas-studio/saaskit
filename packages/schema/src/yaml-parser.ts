/**
 * YAML Schema Parser for SaaSKit
 *
 * Parses YAML schema files into the unified SaaSSchema AST.
 * Supports both shorthand and verbose YAML formats.
 */

import { parse as parseYaml } from 'yaml'
import type {
  SaaSSchema,
  SchemaMetadata,
  Resource,
  Field,
  FieldType,
  FieldAnnotations,
  Relation,
  Workflow,
  WorkflowState,
  WorkflowTransition,
  ViewConfig,
  Action,
  Cardinality,
} from './types'

// ============================================================================
// YAML Schema Types (Raw Parsed YAML)
// ============================================================================

/**
 * App/Metadata configuration in YAML
 * Can be either "app" or "metadata" at the root level
 */
export interface ParsedAppMetadata {
  name: string
  displayName?: string
  version: string
  description?: string
  author?: string
  license?: string
  baseUrl?: string
  targets?: {
    cli?: boolean
    api?: boolean
    sdk?: boolean
    mcp?: boolean
  }
}

/**
 * Field modifiers in YAML format
 */
export interface ParsedFieldModifiers {
  auto?: boolean
  primary?: boolean
  unique?: boolean
  required?: boolean
  optional?: boolean
  indexed?: boolean
  searchable?: boolean
  hidden?: boolean
  readonly?: boolean
}

/**
 * Field definition in verbose YAML format
 */
export interface ParsedField {
  name: string
  type: string
  modifiers?: ParsedFieldModifiers
  label?: string
  description?: string
  placeholder?: string
  default?: unknown
  min?: number
  max?: number
  pattern?: string
  values?: string[] // For enum/select types
  options?: string[] // Alternative to values for enum/select
  target?: string // For relation types
  to?: string // Alternative to target for relation types
  required?: boolean
  unique?: boolean
  auto?: boolean
  annotations?: FieldAnnotations
}

/**
 * Relation definition in verbose YAML format
 */
export interface ParsedRelation {
  name: string
  to: string
  cardinality: 'one' | 'many'
  foreignKey?: string
  required?: boolean
  inverse?: string
  onDelete?: 'cascade' | 'setNull' | 'restrict' | 'noAction'
}

/**
 * Timestamps configuration in YAML
 */
export interface ParsedTimestamps {
  createdAt?: boolean
  updatedAt?: boolean
  deletedAt?: boolean
}

/**
 * View column configuration in YAML
 */
export interface ParsedViewColumn {
  field: string
  label?: string
  width?: number | string
  sortable?: boolean
  filterable?: boolean
}

/**
 * View configuration in YAML
 */
export interface ParsedViewConfig {
  name: string
  type: 'list' | 'grid' | 'kanban' | 'calendar' | 'table' | 'detail'
  description?: string
  default?: boolean
  columns?: ParsedViewColumn[]
  groupBy?: string
  dateField?: string
  defaultSort?: {
    field: string
    direction: 'asc' | 'desc'
  }
  defaultFilters?: Record<string, unknown>
  pageSize?: number
}

/**
 * Action parameter in YAML
 */
export interface ParsedActionParam {
  name: string
  type: string
  required: boolean
  default?: unknown
  description?: string
}

/**
 * Action definition in YAML
 */
export interface ParsedAction {
  name: string
  description?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  params?: ParsedActionParam[]
  returns?: string
  returnsArray?: boolean
  authenticated?: boolean
  permissions?: string[]
}

/**
 * Resource definition in verbose YAML format
 */
export interface ParsedResource {
  name: string
  pluralName?: string
  path?: string
  displayName?: string
  description?: string
  icon?: string
  fields?: ParsedField[] | Record<string, unknown>
  relations?: ParsedRelation[]
  actions?: ParsedAction[]
  views?: ParsedViewConfig[]
  timestamps?: ParsedTimestamps
}

/**
 * Shorthand resource definition (key-value pairs)
 * Example:
 *   Todo:
 *     id: auto
 *     title: text
 *     completed: boolean
 */
export type ParsedShorthandResource = Record<string, string | Record<string, unknown>>

/**
 * Workflow state definition in YAML
 */
export interface ParsedWorkflowState {
  name: string
  description?: string
  initial?: boolean
  final?: boolean
  onEnter?: string[]
  onExit?: string[]
}

/**
 * Workflow transition definition in YAML
 */
export interface ParsedWorkflowTransition {
  name: string
  from: string
  to: string
  trigger: 'manual' | 'automatic' | 'scheduled' | 'webhook'
  condition?: string
  actions?: string[]
  permissions?: string[]
}

/**
 * Workflow definition in YAML
 */
export interface ParsedWorkflow {
  name: string
  resource: string
  stateField?: string
  description?: string
  states: ParsedWorkflowState[]
  transitions: ParsedWorkflowTransition[]
}

/**
 * Top-level parsed YAML schema structure
 * Supports both formats:
 * 1. With "app" key (shorthand)
 * 2. With "metadata" key (verbose)
 */
export interface ParsedYamlSchema {
  // Metadata (either "app" or "metadata")
  app?: ParsedAppMetadata
  metadata?: ParsedAppMetadata

  // Resources (can be array of objects or object with shorthand)
  resources: ParsedResource[] | Record<string, ParsedShorthandResource>

  // Optional workflows
  workflows?: ParsedWorkflow[]

  // Optional global actions
  globalActions?: ParsedAction[]
}

// ============================================================================
// Valid Field Types
// ============================================================================

const VALID_FIELD_TYPES: Set<string> = new Set([
  'string',
  'text',
  'textarea',
  'number',
  'boolean',
  'date',
  'datetime',
  'uuid',
  'id',
  'email',
  'url',
  'json',
  'array',
  'enum',
  'select',
  'relation',
])

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper function to detect if resources are in shorthand format
 */
export function isShorthandFormat(
  resources: ParsedResource[] | Record<string, ParsedShorthandResource>
): resources is Record<string, ParsedShorthandResource> {
  return !Array.isArray(resources)
}

/**
 * Helper function to normalize field type names
 */
export function normalizeFieldType(type: string): FieldType {
  const typeMap: Record<string, FieldType> = {
    text: 'string',
    textarea: 'string',
    select: 'enum',
    id: 'uuid',
  }

  return (typeMap[type] || type) as FieldType
}

/**
 * Check if a string looks like an enum definition (contains |)
 */
function isEnumDefinition(value: string): boolean {
  return value.includes('|') && !value.startsWith('->')
}

/**
 * Check if a string is a relation definition (starts with ->)
 */
function isRelationDefinition(value: string): boolean {
  return value.startsWith('->')
}

/**
 * Parse shorthand field syntax
 */
export function parseShorthandField(
  fieldName: string,
  fieldValue: string | Record<string, unknown>
): { field?: Field; relation?: Relation } {
  // Handle object-style field definition
  if (typeof fieldValue === 'object' && fieldValue !== null) {
    return parseObjectField(fieldName, fieldValue)
  }

  // Handle string-style shorthand
  const value = String(fieldValue).trim()

  // Check for optional field marker (? in field name or value)
  let isOptional = fieldName.endsWith('?')
  const cleanFieldName = fieldName.replace(/\?$/, '')

  // Handle "auto" for id and timestamp fields
  if (value === 'auto') {
    if (cleanFieldName === 'id') {
      return {
        field: {
          name: cleanFieldName,
          type: 'uuid',
          required: true,
          annotations: { primaryKey: true },
        },
      }
    }
    if (cleanFieldName === 'createdAt' || cleanFieldName === 'updatedAt') {
      return {
        field: {
          name: cleanFieldName,
          type: 'datetime',
          required: true,
          annotations: { readonly: true },
        },
      }
    }
  }

  // Handle enum definition: "low | medium | high"
  if (isEnumDefinition(value)) {
    const enumValues = value.split('|').map((v) => v.trim())
    return {
      field: {
        name: cleanFieldName,
        type: 'enum',
        required: !isOptional,
        annotations: { enumValues },
      },
    }
  }

  // Handle relation definition: "->ResourceName"
  // Relations don't create separate fields - the relation itself captures the FK
  if (isRelationDefinition(value)) {
    const targetResource = value.slice(2).trim()
    return {
      field: undefined,
      relation: {
        name: cleanFieldName,
        to: targetResource,
        cardinality: 'one',
        required: !isOptional,
      },
    }
  }

  // Handle basic types
  const normalizedType = normalizeFieldType(value)

  if (!VALID_FIELD_TYPES.has(value) && !VALID_FIELD_TYPES.has(normalizedType)) {
    throw new Error(`Invalid field type: ${value}`)
  }

  return {
    field: {
      name: cleanFieldName,
      type: normalizedType,
      required: !isOptional,
    },
  }
}

/**
 * Parse object-style field definition
 */
function parseObjectField(
  fieldName: string,
  fieldDef: Record<string, unknown>
): { field?: Field; relation?: Relation } {
  const type = String(fieldDef.type || 'string')
  const isOptional = fieldName.endsWith('?')
  const cleanFieldName = fieldName.replace(/\?$/, '')

  // Determine if required
  let required = !isOptional
  if (fieldDef.required !== undefined) {
    required = Boolean(fieldDef.required)
  }
  if (fieldDef.modifiers && typeof fieldDef.modifiers === 'object') {
    const modifiers = fieldDef.modifiers as ParsedFieldModifiers
    if (modifiers.required !== undefined) {
      required = modifiers.required
    }
    if (modifiers.optional !== undefined) {
      required = !modifiers.optional
    }
  }

  // Handle auto fields
  if (fieldDef.auto === true || (fieldDef.modifiers as ParsedFieldModifiers)?.auto === true) {
    if (cleanFieldName === 'id' || type === 'id') {
      return {
        field: {
          name: cleanFieldName,
          type: 'uuid',
          required: true,
          annotations: { primaryKey: true },
        },
      }
    }
  }

  // Handle relation type - relations don't create separate fields
  if (type === 'relation') {
    const target = String(fieldDef.target || fieldDef.to || '')
    return {
      field: undefined, // No field for relations
      relation: {
        name: cleanFieldName,
        to: target,
        cardinality: 'one',
        required,
      },
    }
  }

  // Handle select/enum type
  if (type === 'select' || type === 'enum') {
    const enumValues =
      (fieldDef.values as string[]) ||
      (fieldDef.options as string[]) ||
      (fieldDef.annotations as FieldAnnotations)?.enumValues ||
      []
    return {
      field: {
        name: cleanFieldName,
        type: 'enum',
        required,
        default: fieldDef.default,
        annotations: { enumValues },
      },
    }
  }

  // Build annotations
  const annotations: FieldAnnotations = {}
  if (fieldDef.unique === true || (fieldDef.modifiers as ParsedFieldModifiers)?.unique === true) {
    annotations.unique = true
  }
  if (
    fieldDef.indexed === true ||
    (fieldDef.annotations as FieldAnnotations)?.indexed === true
  ) {
    annotations.indexed = true
  }
  if (
    fieldDef.searchable === true ||
    (fieldDef.annotations as FieldAnnotations)?.searchable === true
  ) {
    annotations.searchable = true
  }
  if (fieldDef.pattern) {
    annotations.pattern = String(fieldDef.pattern)
  }
  if (fieldDef.min !== undefined) {
    annotations.min = Number(fieldDef.min)
  }
  if (fieldDef.max !== undefined) {
    annotations.max = Number(fieldDef.max)
  }
  if (fieldDef.annotations && typeof fieldDef.annotations === 'object') {
    Object.assign(annotations, fieldDef.annotations)
  }

  return {
    field: {
      name: cleanFieldName,
      type: normalizeFieldType(type),
      required,
      default: fieldDef.default,
      description: fieldDef.description as string | undefined,
      annotations: Object.keys(annotations).length > 0 ? annotations : undefined,
    },
  }
}

/**
 * Parse a verbose resource definition (array format)
 */
function parseVerboseResource(raw: ParsedResource, resourceNames: Set<string>): Resource {
  const fields: Field[] = []
  const relations: Relation[] = []

  // Parse fields array
  if (Array.isArray(raw.fields)) {
    for (const fieldDef of raw.fields) {
      const { field, relation } = parseObjectField(fieldDef.name, fieldDef as Record<string, unknown>)
      if (field) {
        fields.push(field)
      }
      if (relation) {
        relations.push(relation)
      }
    }
  }

  // Parse explicit relations
  if (Array.isArray(raw.relations)) {
    for (const rel of raw.relations) {
      relations.push({
        name: rel.name,
        to: rel.to,
        cardinality: rel.cardinality || 'one',
        foreignKey: rel.foreignKey,
        required: rel.required,
        inverse: rel.inverse,
        onDelete: rel.onDelete,
      })
    }
  }

  return {
    name: raw.name,
    pluralName: raw.pluralName,
    description: raw.description,
    fields,
    relations,
    timestamps: raw.timestamps,
    views: raw.views as ViewConfig[] | undefined,
    actions: raw.actions as Action[] | undefined,
  }
}

/**
 * Parse a shorthand resource definition (object format)
 */
function parseShorthandResource(
  name: string,
  resourceDef: ParsedShorthandResource,
  resourceNames: Set<string>
): Resource {
  const fields: Field[] = []
  const relations: Relation[] = []

  // Check if this is actually a verbose format with a "fields" key
  if (resourceDef.fields && typeof resourceDef.fields === 'object') {
    // This is nested fields format (project-tracker style)
    const fieldsObj = resourceDef.fields as Record<string, unknown>
    for (const [fieldName, fieldDef] of Object.entries(fieldsObj)) {
      const { field, relation } = parseShorthandField(fieldName, fieldDef as string | Record<string, unknown>)
      if (field) {
        fields.push(field)
      }
      if (relation) {
        relations.push(relation)
      }
    }
    return {
      name,
      fields,
      relations,
    }
  }

  // Pure shorthand format (todo style)
  for (const [fieldName, fieldValue] of Object.entries(resourceDef)) {
    const { field, relation } = parseShorthandField(fieldName, fieldValue as string | Record<string, unknown>)
    if (field) {
      fields.push(field)
    }
    if (relation) {
      relations.push(relation)
    }
  }

  return {
    name,
    fields,
    relations,
  }
}

/**
 * Add inverse relations based on the inverse property
 */
function addInverseRelations(resources: Resource[]): void {
  const resourceMap = new Map<string, Resource>()
  for (const resource of resources) {
    resourceMap.set(resource.name, resource)
  }

  for (const resource of resources) {
    for (const relation of resource.relations) {
      if (relation.inverse && relation.cardinality === 'one') {
        const targetResource = resourceMap.get(relation.to)
        if (targetResource) {
          // Check if inverse already exists
          const existingInverse = targetResource.relations.find((r) => r.name === relation.inverse)
          if (!existingInverse) {
            targetResource.relations.push({
              name: relation.inverse!,
              to: resource.name,
              cardinality: 'many',
            })
          }
        }
      }
    }
  }
}

/**
 * Validate that all relation targets exist (only if validation is enabled)
 */
function validateRelations(resources: Resource[], strict: boolean = false): void {
  if (!strict) return // Skip validation by default for flexibility

  const resourceNames = new Set(resources.map((r) => r.name))

  for (const resource of resources) {
    for (const relation of resource.relations) {
      if (!resourceNames.has(relation.to)) {
        throw new Error(
          `Resource "${resource.name}" has relation to non-existent resource "${relation.to}"`
        )
      }
    }
  }
}

/**
 * Parse workflows from YAML
 */
function parseWorkflows(rawWorkflows: ParsedWorkflow[] | undefined): Workflow[] | undefined {
  if (!rawWorkflows || rawWorkflows.length === 0) {
    return undefined
  }

  return rawWorkflows.map((w) => ({
    name: w.name,
    resource: w.resource,
    stateField: w.stateField,
    description: w.description,
    states: w.states.map((s) => ({
      name: s.name,
      description: s.description,
      initial: s.initial,
      final: s.final,
      onEnter: s.onEnter,
      onExit: s.onExit,
    })) as WorkflowState[],
    transitions: w.transitions.map((t) => ({
      name: t.name,
      from: t.from,
      to: t.to,
      trigger: t.trigger,
      condition: t.condition,
      actions: t.actions,
      permissions: t.permissions,
    })) as WorkflowTransition[],
  }))
}

// ============================================================================
// Main Parser Function
// ============================================================================

/**
 * Parse a YAML schema string into the unified SaaSSchema AST
 */
export function parseSchemaYaml(yamlString: string): SaaSSchema {
  // Parse YAML
  let parsed: ParsedYamlSchema
  try {
    parsed = parseYaml(yamlString) as ParsedYamlSchema
  } catch (e) {
    throw new Error(`Invalid YAML syntax: ${(e as Error).message}`)
  }

  // Extract metadata
  const rawMetadata = parsed.app || parsed.metadata
  if (!rawMetadata) {
    throw new Error('Schema must have either "app" or "metadata" section')
  }
  if (!rawMetadata.name) {
    throw new Error('Schema metadata must have a "name" field')
  }
  if (!rawMetadata.version) {
    throw new Error('Schema metadata must have a "version" field')
  }

  const metadata: SchemaMetadata = {
    name: rawMetadata.name,
    version: String(rawMetadata.version),
    description: rawMetadata.description,
    author: rawMetadata.author,
    license: rawMetadata.license,
  }

  // Parse resources (optional for metadata-only schemas)
  const resources: Resource[] = []
  const resourceNames = new Set<string>()

  if (parsed.resources) {
    if (Array.isArray(parsed.resources)) {
      // Verbose array format
      for (const raw of parsed.resources) {
        if (resourceNames.has(raw.name)) {
          throw new Error(`Duplicate resource name: ${raw.name}`)
        }
        resourceNames.add(raw.name)
      }
      for (const raw of parsed.resources) {
        resources.push(parseVerboseResource(raw, resourceNames))
      }
    } else if (typeof parsed.resources === 'object') {
      // Shorthand object format
      const keys = Object.keys(parsed.resources)
      for (const name of keys) {
        if (resourceNames.has(name)) {
          throw new Error(`Duplicate resource name: ${name}`)
        }
        resourceNames.add(name)
      }
      for (const [name, resourceDef] of Object.entries(parsed.resources)) {
        resources.push(parseShorthandResource(name, resourceDef, resourceNames))
      }
    }
  }

  // Add inverse relations
  addInverseRelations(resources)

  // Validate relations
  validateRelations(resources)

  // Parse workflows
  const workflows = parseWorkflows(parsed.workflows)

  return {
    metadata,
    resources,
    workflows,
    globalActions: parsed.globalActions as Action[] | undefined,
  }
}

/**
 * Helper function to convert parsed YAML to SaaSSchema
 * (Alias for parseSchemaYaml for backwards compatibility)
 */
export function convertParsedToSchema(parsed: ParsedYamlSchema): SaaSSchema {
  // Re-serialize and parse (simple approach)
  // This is for when you already have a parsed object
  const metadata = parsed.app || parsed.metadata
  if (!metadata) {
    throw new Error('Schema must have either "app" or "metadata" section')
  }

  return {
    metadata: {
      name: metadata.name,
      version: String(metadata.version),
      description: metadata.description,
      author: metadata.author,
      license: metadata.license,
    },
    resources: [],
    workflows: parseWorkflows(parsed.workflows),
  }
}
