/**
 * Resource Component - Declarative Data Model Definition
 *
 * The Resource component defines a data model (entity) in your SaaSkit application.
 * Each Resource automatically gets CRUD operations, API endpoints, CLI commands,
 * and type-safe SDK methods generated.
 *
 * Resources support two syntax styles:
 * 1. **Shorthand syntax** - Concise, inline field definitions using props
 * 2. **Expanded syntax** - Verbose, component-based field definitions
 *
 * @example Shorthand Syntax
 * ```tsx
 * <Resource name="Task"
 *   title
 *   description?
 *   done
 *   priority="low | medium | high"
 *   assignee->User
 *   createdAt:auto
 * />
 * ```
 *
 * @example Expanded Syntax
 * ```tsx
 * <Resource name="Task">
 *   <Text name="title" minLength={1} maxLength={200} />
 *   <Text name="description" optional multiline />
 *   <Boolean name="done" default={false} />
 *   <Select name="priority" options={['low', 'medium', 'high']} default="medium" />
 *   <Relation name="assignee" to="User" optional />
 *   <Date name="createdAt" includeTime auto />
 * </Resource>
 * ```
 *
 * @module schema/Resource
 */
import type React from 'react'

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Field types supported by the schema.
 *
 * - `text` - String values (default type)
 * - `number` - Numeric values (integer or decimal)
 * - `boolean` - True/false values
 * - `date` - Date only (no time component)
 * - `datetime` - Date and time
 * - `email` - Email addresses (with validation)
 * - `url` - URLs (with validation)
 * - `select` - Enum/choice field with predefined options
 * - `relation` - Reference to another Resource
 */
export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'select'
  | 'relation'

/**
 * Relation configuration for relation fields.
 */
export interface FieldRelation {
  /** The target Resource name */
  target: string
  /** Whether this is a one-to-many (true) or one-to-one (false) relationship */
  many: boolean
  /** Cascade behavior when the related record is deleted */
  cascade?: 'delete' | 'nullify' | 'restrict'
}

/**
 * Field validation constraints.
 */
export interface FieldValidation {
  /** Minimum length for text fields */
  minLength?: number
  /** Maximum length for text fields */
  maxLength?: number
  /** Regex pattern for text fields */
  pattern?: string
  /** Minimum value for number fields */
  min?: number
  /** Maximum value for number fields */
  max?: number
  /** Step value for number fields */
  step?: number
  /** Date must be in the future */
  future?: boolean
  /** Date must be in the past */
  past?: boolean
}

/**
 * Complete field definition extracted from props or child components.
 */
export interface FieldDefinition {
  /** Field name (used as column/property name) */
  name: string
  /** Field type */
  type: FieldType
  /** Whether the field is required (true) or optional (false) */
  required: boolean
  /** Whether the field must have unique values */
  unique?: boolean
  /** Whether the field is auto-generated (e.g., timestamps) */
  auto?: boolean
  /** Default value for the field */
  default?: unknown
  /** Options for select fields */
  options?: string[]
  /** Relation configuration for relation fields */
  relation?: FieldRelation
  /** Validation constraints */
  validation?: FieldValidation
  /** Human-readable label for UI display */
  label?: string
  /** Description for documentation and help text */
  description?: string
}

/**
 * Resource metadata extracted from JSX element.
 */
export interface ResourceMetadata {
  /** Resource name (singular, PascalCase) */
  name: string
  /** Plural name for collections (auto-derived if not specified) */
  pluralName: string
  /** Table/collection name in the database */
  tableName: string
  /** Field definitions */
  fields: FieldDefinition[]
  /** Primary key field name */
  primaryKey: string
  /** Whether to include timestamp fields (createdAt, updatedAt) */
  timestamps: boolean
  /** Whether to use soft deletes (deletedAt instead of actual deletion) */
  softDelete: boolean
}

/**
 * Props for the Resource component.
 *
 * The `name` prop is required. All other props are either configuration
 * options or shorthand field definitions.
 */
export interface ResourceProps {
  /**
   * The Resource name (singular, PascalCase).
   *
   * Used to generate:
   * - Table/collection name (pluralized, snake_case)
   * - API endpoint paths (pluralized, kebab-case)
   * - TypeScript type names
   * - CLI command names
   *
   * @example "Task", "User", "BlogPost"
   */
  name: string

  /**
   * Custom API path for this resource.
   * @example "/api/v1/users" or "/tasks"
   */
  path?: string

  /**
   * Custom plural name (defaults to name + 's').
   * @example "People" for a "Person" resource
   */
  plural?: string

  /**
   * Custom table/collection name.
   * @example "blog_posts" instead of auto-generated "blog_posts"
   */
  tableName?: string

  /**
   * Primary key field name.
   * @default "id"
   */
  primaryKey?: string

  /**
   * Whether to automatically add createdAt and updatedAt fields.
   * @default true
   */
  timestamps?: boolean

  /**
   * Whether to use soft deletes (deletedAt field) instead of actual deletion.
   * @default false
   */
  softDelete?: boolean

  /**
   * Human-readable display name for the resource.
   * @example "Blog Post" for a "BlogPost" resource
   */
  displayName?: string

  /**
   * Description of what this resource represents.
   */
  description?: string

  /**
   * Icon name or emoji for the resource.
   */
  icon?: string

  /**
   * Child components (expanded syntax field definitions).
   */
  children?: React.ReactNode

  /**
   * Shorthand field props will be parsed from additional props.
   * @see parseResourceProps for supported syntax
   */
  [key: string]: unknown
}

// =============================================================================
// Constants and Defaults
// =============================================================================

/** Default primary key field name */
export const DEFAULT_PRIMARY_KEY = 'id'

/** Whether timestamps are enabled by default */
export const DEFAULT_TIMESTAMPS = true

/** Whether soft delete is enabled by default */
export const DEFAULT_SOFT_DELETE = false

/** Reserved prop names that are not field definitions */
const RESERVED_PROPS = new Set([
  'name',
  'children',
  'plural',
  'tableName',
  'primaryKey',
  'timestamps',
  'softDelete',
])

/** Boolean field name patterns (automatically infer boolean type) */
const BOOLEAN_NAMES = new Set(['done', 'completed', 'active', 'enabled', 'visible', 'published', 'archived'])

/** Timestamp field names for auto type inference */
const TIMESTAMP_NAMES = new Set(['createdAt', 'updatedAt', 'deletedAt'])

/** Type-inferred field names */
const TYPE_INFERRED_NAMES: Record<string, FieldType> = {
  email: 'email',
  url: 'url',
}

// =============================================================================
// Helper Functions
// =============================================================================

// Import pluralize from utils for local use
import { pluralize } from '../utils'

// Re-export pluralize from utils for backwards compatibility
export { pluralize } from '../utils'

/**
 * Converts PascalCase to snake_case for table names.
 *
 * @param name - The PascalCase resource name
 * @returns The snake_case table name
 *
 * @example
 * toTableName('Task')       // 'tasks'
 * toTableName('BlogPost')   // 'blog_posts'
 * toTableName('UserProfile') // 'user_profiles'
 */
export function toTableName(name: string): string {
  const plural = pluralize(name)
  return plural
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
}

/**
 * Infers the field type based on field name conventions.
 *
 * @param name - The field name
 * @returns The inferred field type, or null if no inference applies
 *
 * @example
 * inferTypeFromName('done')      // 'boolean'
 * inferTypeFromName('isActive')  // 'boolean'
 * inferTypeFromName('email')     // 'email'
 * inferTypeFromName('title')     // null (defaults to 'text')
 */
export function inferTypeFromName(name: string): FieldType | null {
  if (BOOLEAN_NAMES.has(name)) {
    return 'boolean'
  }
  if (name.startsWith('is') || name.startsWith('has')) {
    return 'boolean'
  }
  if (TYPE_INFERRED_NAMES[name]) {
    return TYPE_INFERRED_NAMES[name]
  }
  return null
}

/**
 * Parses resource props and extracts field definitions from shorthand syntax
 *
 * Shorthand patterns:
 * - `title` (true) - required text field
 * - `description?` - optional text field (? suffix)
 * - `done` - boolean inferred from name
 * - `status="open | closed"` - select from pipe-separated options
 * - `priority:number` - explicit typed field
 * - `assignee->User` - relation to another resource
 * - `tags->Tag[]` - many relation
 * - `createdAt:auto` - auto-generated field
 * - `email:unique` - unique constraint
 */
export function parseResourceProps(props: Record<string, unknown>): FieldDefinition[] {
  const fields: FieldDefinition[] = []

  for (const [key, value] of Object.entries(props)) {
    // Skip reserved props (configuration options, not field definitions)
    if (RESERVED_PROPS.has(key)) {
      continue
    }

    let fieldName = key
    let required = true
    let unique = false
    let auto = false
    let explicitType: FieldType | null = null
    let options: string[] | undefined
    let relation: FieldRelation | undefined

    // Check for optional marker (?)
    if (fieldName.includes('?')) {
      required = false
      fieldName = fieldName.replace('?', '')
    }

    // Check for relation (->)
    if (fieldName.includes('->')) {
      const [name, target] = fieldName.split('->')
      fieldName = name
      const many = target.endsWith('[]')
      relation = {
        target: many ? target.slice(0, -2) : target,
        many,
      }
      explicitType = 'relation'
    }

    // Check for type modifiers (:)
    if (fieldName.includes(':')) {
      const parts = fieldName.split(':')
      fieldName = parts[0]

      for (let i = 1; i < parts.length; i++) {
        const modifier = parts[i]
        if (modifier === 'auto') {
          auto = true
          required = false
          // Infer datetime for timestamp names
          if (TIMESTAMP_NAMES.has(fieldName)) {
            explicitType = 'datetime'
          }
        } else if (modifier === 'unique') {
          unique = true
        } else {
          // It's a type specifier
          explicitType = modifier as FieldType
        }
      }
    }

    // Check for select options (pipe-separated string value)
    if (typeof value === 'string' && value.includes('|')) {
      options = value.split('|').map((opt) => opt.trim())
      explicitType = 'select'
    }

    // Determine final type
    let type: FieldType
    if (explicitType) {
      type = explicitType
    } else {
      const inferredType = inferTypeFromName(fieldName)
      type = inferredType ?? 'text'
    }

    const field: FieldDefinition = {
      name: fieldName,
      type,
      required,
    }

    if (unique) {
      field.unique = true
    }

    if (auto) {
      field.auto = true
    }

    if (options) {
      field.options = options
    }

    if (relation) {
      field.relation = relation
    }

    fields.push(field)
  }

  return fields
}

/**
 * Extracts resource metadata from a Resource JSX element.
 *
 * Supports both shorthand props and expanded syntax children.
 * Applies sensible defaults for all configuration options.
 *
 * @param element - The Resource JSX element
 * @returns Complete ResourceMetadata with all fields and configuration
 *
 * @example
 * ```tsx
 * const resource = <Resource name="Task" title done priority="low | medium | high" />
 * const metadata = getResourceMetadata(resource)
 * console.log(metadata.name)       // "Task"
 * console.log(metadata.tableName)  // "tasks"
 * console.log(metadata.fields)     // [{ name: "title", type: "text", required: true }, ...]
 * ```
 */
export function getResourceMetadata(element: React.ReactElement<ResourceProps>): ResourceMetadata {
  const props = element.props

  // Validate required name prop
  if (!props.name) {
    throw new Error(
      'Resource component requires a "name" prop.\n\n' +
      'Example:\n' +
      '  <Resource name="Task" title done />\n' +
      '  <Resource name="User" name email:email />'
    )
  }

  // Parse shorthand field definitions from props
  const shorthandFields = parseResourceProps(props as Record<string, unknown>)

  // Extract expanded syntax children if present
  let expandedFields: FieldDefinition[] = []
  if (props.children) {
    // Dynamically import to avoid circular dependency
    const { extractFieldsFromChildren } = require('./fields')
    const fieldMetadata = extractFieldsFromChildren(props.children)

    // Convert FieldMetadata to FieldDefinition
    expandedFields = fieldMetadata.map((meta: any) => {
      const field: FieldDefinition = {
        name: meta.name,
        type: meta.type,
        required: meta.required,
      }
      if (meta.unique) {
        field.unique = meta.unique
      }
      if (meta.auto) {
        field.auto = meta.auto
      }
      if (meta.options) {
        field.options = meta.options
      }
      if (meta.relation) {
        field.relation = {
          target: meta.relation.target,
          many: meta.relation.many,
        }
        if (meta.relation.cascade) {
          field.relation.cascade = meta.relation.cascade
        }
      }
      if (meta.default !== undefined) {
        field.default = meta.default
      }
      if (meta.validation) {
        field.validation = meta.validation
      }
      return field
    })
  }

  // Merge fields: expanded fields take precedence over shorthand fields with same name
  const fieldMap = new Map<string, FieldDefinition>()
  for (const field of shorthandFields) {
    fieldMap.set(field.name, field)
  }
  for (const field of expandedFields) {
    fieldMap.set(field.name, field)
  }
  const allFields = Array.from(fieldMap.values())

  // Compute derived values with defaults
  const pluralName = props.plural ?? pluralize(props.name)
  const tableName = props.tableName ?? toTableName(props.name)
  const primaryKey = props.primaryKey ?? DEFAULT_PRIMARY_KEY
  const timestamps = props.timestamps ?? DEFAULT_TIMESTAMPS
  const softDelete = props.softDelete ?? DEFAULT_SOFT_DELETE

  return {
    name: props.name,
    pluralName,
    tableName,
    fields: allFields,
    primaryKey,
    timestamps,
    softDelete,
  }
}

export function Resource(props: ResourceProps): React.ReactElement {
  // Resource component returns null - it's a declarative schema component
  // The actual rendering is handled by schema processors
  return null as unknown as React.ReactElement
}
