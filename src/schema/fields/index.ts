/**
 * Expanded Syntax Field Components
 *
 * Export all field components for use in expanded syntax:
 *
 * <Task>
 *   <Text name="title" required />
 *   <Text name="description" />
 *   <Boolean name="done" default={false} />
 *   <Select name="priority" options={['low', 'medium', 'high']} default="medium" />
 *   <Relation name="assignee" to="User" />
 * </Task>
 */

import React from 'react'

export { Text, type TextFieldProps } from './Text'
export { Number, type NumberFieldProps } from './Number'
export { Boolean, type BooleanFieldProps } from './Boolean'
export { Date, type DateFieldProps } from './Date'
export { Select, type SelectFieldProps } from './Select'
export { Relation, type RelationFieldProps, type CascadeType } from './Relation'

// Field metadata types
export type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'select' | 'relation'

export interface FieldValidation {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  future?: boolean
  past?: boolean
  step?: number
}

export interface FieldRelationMetadata {
  target: string
  many: boolean
  cascade?: 'delete' | 'nullify' | 'restrict'
}

export interface FieldMetadata {
  name: string
  type: FieldType
  required: boolean
  unique?: boolean
  auto?: boolean
  default?: unknown
  options?: string[]
  relation?: FieldRelationMetadata
  validation?: FieldValidation
}

// Reserved field names that cannot be used
const RESERVED_FIELD_NAMES = new Set(['id', '_id', '__proto__', 'constructor', 'prototype'])

// Valid field name pattern: starts with letter or underscore, contains letters, numbers, underscores
const VALID_FIELD_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/

// Valid text field types
const VALID_TEXT_TYPES = new Set(['text', 'email', 'url'])

// Valid cascade types
const VALID_CASCADE_TYPES = new Set(['delete', 'nullify', 'restrict'])

/**
 * Validates a field name and throws an error if invalid
 */
function validateFieldName(name: unknown): asserts name is string {
  if (name === undefined || name === null) {
    throw new Error('Field name is required')
  }
  if (typeof name !== 'string') {
    throw new Error('Field name must be a string')
  }
  if (name === '') {
    throw new Error('Field name cannot be empty')
  }
  if (name.includes(' ')) {
    throw new Error(`Field name "${name}" cannot contain spaces`)
  }
  if (/^\d/.test(name)) {
    throw new Error(`Field name "${name}" cannot start with a number`)
  }
  if (RESERVED_FIELD_NAMES.has(name)) {
    throw new Error(`Field name "${name}" is reserved and cannot be used`)
  }
  if (!VALID_FIELD_NAME_PATTERN.test(name)) {
    throw new Error(`Field name "${name}" contains invalid characters`)
  }
}

/**
 * Checks if a JSX element is a field component
 */
export function isFieldElement(element: unknown): element is React.ReactElement {
  if (!React.isValidElement(element)) {
    return false
  }
  const elementType = element.type
  if (typeof elementType !== 'function') {
    return false
  }
  return 'fieldType' in elementType
}

/**
 * Extracts field metadata from a field JSX element
 */
export function getFieldMetadata(element: React.ReactElement): FieldMetadata {
  // Validate element is a valid field element
  if (!React.isValidElement(element)) {
    throw new Error('Invalid element: expected a React element')
  }

  const elementType = element.type
  if (typeof elementType !== 'function' || !('fieldType' in elementType)) {
    throw new Error('Invalid element: expected a field component with fieldType property')
  }

  const fieldType = (elementType as { fieldType: string }).fieldType
  const props = element.props as Record<string, unknown>

  // Validate field name
  validateFieldName(props.name)
  const name = props.name as string

  // Extract common props
  const optional = props.optional === true
  const required = props.auto === true ? false : (props.required !== false && !optional)
  const unique = props.unique === true ? true : undefined
  const auto = props.auto === true ? true : undefined
  const defaultValue = props.default

  // Build base metadata
  const metadata: FieldMetadata = {
    name,
    type: fieldType as FieldType,
    required,
  }

  // Add optional properties
  if (unique !== undefined) {
    metadata.unique = unique
  }
  if (auto !== undefined) {
    metadata.auto = auto
  }
  if (defaultValue !== undefined) {
    metadata.default = defaultValue
  }

  // Process field-type specific props
  switch (fieldType) {
    case 'text':
      processTextFieldProps(props, metadata)
      break
    case 'number':
      processNumberFieldProps(props, metadata)
      break
    case 'boolean':
      // Boolean has no additional special processing
      break
    case 'date':
      processDateFieldProps(props, metadata)
      break
    case 'select':
      processSelectFieldProps(props, metadata)
      break
    case 'relation':
      processRelationFieldProps(props, metadata)
      break
  }

  return metadata
}

/**
 * Process Text field specific props
 */
function processTextFieldProps(props: Record<string, unknown>, metadata: FieldMetadata): void {
  const textType = props.type as string | undefined

  // Validate text type if provided
  if (textType !== undefined && !VALID_TEXT_TYPES.has(textType)) {
    throw new Error(`Invalid text type "${textType}". Valid types are: text, email, url`)
  }

  const minLength = props.minLength as number | undefined
  const maxLength = props.maxLength as number | undefined
  const pattern = props.pattern as string | undefined

  // Validate minLength
  if (minLength !== undefined && minLength < 0) {
    throw new Error('minLength cannot be negative')
  }

  // Validate minLength <= maxLength
  if (minLength !== undefined && maxLength !== undefined && minLength > maxLength) {
    throw new Error('minLength cannot be greater than maxLength')
  }

  // Build validation object
  const validation: FieldValidation = {}
  let hasValidation = false

  if (minLength !== undefined) {
    validation.minLength = minLength
    hasValidation = true
  }
  if (maxLength !== undefined) {
    validation.maxLength = maxLength
    hasValidation = true
  }
  if (pattern !== undefined) {
    validation.pattern = pattern
    hasValidation = true
  }

  // Add validation object for email/url types
  if (textType === 'email' || textType === 'url') {
    hasValidation = true
  }

  if (hasValidation) {
    metadata.validation = validation
  }
}

/**
 * Process Number field specific props
 */
function processNumberFieldProps(props: Record<string, unknown>, metadata: FieldMetadata): void {
  const min = props.min as number | undefined
  const max = props.max as number | undefined
  const step = props.step as number | undefined

  // Validate min <= max
  if (min !== undefined && max !== undefined && min > max) {
    throw new Error('min cannot be greater than max')
  }

  // Build validation object
  const validation: FieldValidation = {}
  let hasValidation = false

  if (min !== undefined) {
    validation.min = min
    hasValidation = true
  }
  if (max !== undefined) {
    validation.max = max
    hasValidation = true
  }
  if (step !== undefined) {
    validation.step = step
    hasValidation = true
  }

  if (hasValidation) {
    metadata.validation = validation
  }
}

/**
 * Process Date field specific props
 */
function processDateFieldProps(props: Record<string, unknown>, metadata: FieldMetadata): void {
  const includeTime = props.includeTime === true
  const future = props.future === true
  const past = props.past === true

  // Validate future and past are mutually exclusive
  if (future && past) {
    throw new Error('Date field cannot have both future and past constraints')
  }

  // Update type to datetime if includeTime is true
  if (includeTime) {
    metadata.type = 'datetime'
  }

  // Build validation object
  if (future || past) {
    metadata.validation = {}
    if (future) {
      metadata.validation.future = true
    }
    if (past) {
      metadata.validation.past = true
    }
  }
}

/**
 * Process Select field specific props
 */
function processSelectFieldProps(props: Record<string, unknown>, metadata: FieldMetadata): void {
  const options = props.options as string[] | undefined
  const multiple = props.multiple === true
  const defaultValue = metadata.default

  // Validate options is provided
  if (options === undefined) {
    throw new Error('Select field requires options prop')
  }

  // Validate options is not empty
  if (options.length === 0) {
    throw new Error('Select field options cannot be empty')
  }

  // Validate default value is in options (for single select)
  if (defaultValue !== undefined && !multiple) {
    if (!options.includes(defaultValue as string)) {
      throw new Error(`Select default value "${defaultValue}" must be one of the options`)
    }
  }

  // Validate array default values for multiple select
  if (defaultValue !== undefined && multiple && Array.isArray(defaultValue)) {
    for (const val of defaultValue) {
      if (!options.includes(val as string)) {
        throw new Error(`Select default value "${val}" must be one of the options`)
      }
    }
  }

  metadata.options = options
}

/**
 * Process Relation field specific props
 */
function processRelationFieldProps(props: Record<string, unknown>, metadata: FieldMetadata): void {
  const to = props.to as string | undefined
  const many = props.many === true
  const cascade = props.cascade as string | undefined

  // Validate 'to' is provided
  if (to === undefined) {
    throw new Error('Relation field requires "to" prop specifying the target resource')
  }

  // Validate cascade type
  if (cascade !== undefined && !VALID_CASCADE_TYPES.has(cascade)) {
    throw new Error(`Invalid cascade type "${cascade}". Valid types are: delete, nullify, restrict`)
  }

  // Build relation metadata
  metadata.relation = {
    target: to,
    many,
  }

  if (cascade !== undefined) {
    metadata.relation.cascade = cascade as 'delete' | 'nullify' | 'restrict'
  }
}

/**
 * Extracts all field metadata from children of a Resource component
 */
export function extractFieldsFromChildren(children: React.ReactNode): FieldMetadata[] {
  const fields: FieldMetadata[] = []
  const childArray = React.Children.toArray(children)

  for (const child of childArray) {
    if (isFieldElement(child)) {
      fields.push(getFieldMetadata(child))
    }
  }

  return fields
}
