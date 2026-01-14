/**
 * YAML Parser Types
 *
 * Type definitions for raw parsed YAML schema structures.
 * These types represent the shape of data as it appears in YAML files
 * before being transformed into the unified SaaSSchema AST.
 */

import type { FieldAnnotations } from '../types'

// ============================================================================
// App/Metadata Types
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

// ============================================================================
// Field Types
// ============================================================================

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

// ============================================================================
// Relation Types
// ============================================================================

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

// ============================================================================
// Timestamps Types
// ============================================================================

/**
 * Timestamps configuration in YAML
 */
export interface ParsedTimestamps {
  createdAt?: boolean
  updatedAt?: boolean
  deletedAt?: boolean
}

// ============================================================================
// View Types
// ============================================================================

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

// ============================================================================
// Action Types
// ============================================================================

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

// ============================================================================
// Resource Types
// ============================================================================

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

// ============================================================================
// Workflow Types
// ============================================================================

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

// ============================================================================
// Top-Level Schema Type
// ============================================================================

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
