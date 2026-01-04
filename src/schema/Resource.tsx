/**
 * Resource component - defines a data model in the app
 * Stub - to be implemented in GREEN phase
 */
import type React from 'react'

// Field types supported by the schema
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

// Relation configuration for relation fields
export interface FieldRelation {
  target: string
  many: boolean
}

// Field definition extracted from shorthand props
export interface FieldDefinition {
  name: string
  type: FieldType
  required: boolean
  unique?: boolean
  auto?: boolean
  options?: string[]
  relation?: FieldRelation
}

// Resource metadata extracted from JSX element
export interface ResourceMetadata {
  name: string
  fields: FieldDefinition[]
}

export interface ResourceProps {
  name: string
  children?: React.ReactNode
  // Shorthand field props will be parsed from additional props
  [key: string]: unknown
}

// Boolean field name patterns
const BOOLEAN_NAMES = new Set(['done', 'completed', 'active', 'enabled', 'visible'])

// Timestamp field names for auto type inference
const TIMESTAMP_NAMES = new Set(['createdAt', 'updatedAt', 'deletedAt'])

// Type-inferred field names
const TYPE_INFERRED_NAMES: Record<string, FieldType> = {
  email: 'email',
  url: 'url',
}

/**
 * Infers the type based on field name
 */
function inferTypeFromName(name: string): FieldType | null {
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
    // Skip reserved props
    if (key === 'name' || key === 'children') {
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
 * Extracts resource metadata from a Resource JSX element
 * Supports both shorthand props and expanded syntax children
 */
export function getResourceMetadata(element: React.ReactElement<ResourceProps>): ResourceMetadata {
  const props = element.props
  const shorthandFields = parseResourceProps(props as Record<string, unknown>)

  // Check if there are expanded syntax children
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
        // Include cascade if present
        if (meta.relation.cascade) {
          (field.relation as any).cascade = meta.relation.cascade
        }
      }
      // Include default and validation in extended FieldDefinition
      if (meta.default !== undefined) {
        (field as any).default = meta.default
      }
      if (meta.validation) {
        (field as any).validation = meta.validation
      }
      return field
    })
  }

  // Combine shorthand and expanded fields (expanded takes precedence if same name)
  const allFields = [...shorthandFields, ...expandedFields]

  return {
    name: props.name,
    fields: allFields,
  }
}

export function Resource(props: ResourceProps): React.ReactElement {
  // Resource component returns null - it's a declarative schema component
  // The actual rendering is handled by schema processors
  return null as unknown as React.ReactElement
}
