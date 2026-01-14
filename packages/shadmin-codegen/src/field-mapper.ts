/**
 * Field Type Mapper
 *
 * Maps SaaSKit schema field types to React-Admin components.
 *
 * @see saaskit-tlw, saaskit-cr3
 */

import type { Field } from '@saaskit/schema'
import type { FieldMapping, FieldMappingOptions } from './types'

// ============================================================================
// Type Mapping Tables
// ============================================================================

interface ComponentMapping {
  listComponent: string
  showComponent: string
  inputComponent: string
  extraProps?: Record<string, unknown>
}

const TYPE_MAPPINGS: Record<string, ComponentMapping> = {
  string: {
    listComponent: 'TextField',
    showComponent: 'TextField',
    inputComponent: 'TextInput',
  },
  number: {
    listComponent: 'NumberField',
    showComponent: 'NumberField',
    inputComponent: 'NumberInput',
  },
  boolean: {
    listComponent: 'BooleanField',
    showComponent: 'BooleanField',
    inputComponent: 'BooleanInput',
  },
  uuid: {
    listComponent: 'TextField',
    showComponent: 'TextField',
    inputComponent: 'TextInput',
    extraProps: { disabled: true },
  },
  date: {
    listComponent: 'DateField',
    showComponent: 'DateField',
    inputComponent: 'DateInput',
  },
  datetime: {
    listComponent: 'DateField',
    showComponent: 'DateField',
    inputComponent: 'DateTimeInput',
    extraProps: { showTime: true },
  },
  email: {
    listComponent: 'EmailField',
    showComponent: 'EmailField',
    inputComponent: 'TextInput',
    extraProps: { type: 'email' },
  },
  url: {
    listComponent: 'UrlField',
    showComponent: 'UrlField',
    inputComponent: 'TextInput',
    extraProps: { type: 'url' },
  },
  json: {
    listComponent: 'FunctionField',
    showComponent: 'FunctionField',
    inputComponent: 'TextInput',
    extraProps: { multiline: true },
  },
  array: {
    listComponent: 'ArrayField',
    showComponent: 'ArrayField',
    inputComponent: 'ArrayInput',
  },
  enum: {
    listComponent: 'ChipField',
    showComponent: 'TextField',
    inputComponent: 'SelectInput',
  },
}

// Default mapping for unknown types
const DEFAULT_MAPPING: ComponentMapping = {
  listComponent: 'TextField',
  showComponent: 'TextField',
  inputComponent: 'TextInput',
}

// ============================================================================
// Main Mapper Function
// ============================================================================

/**
 * Maps a schema field to React-Admin components
 *
 * @param field - The field from the schema
 * @param options - Mapping options
 * @returns Field mapping with component names and props
 */
export function mapFieldType(
  field: Field,
  options: FieldMappingOptions = {}
): FieldMapping {
  const { isEdit = false, includeValidation = true } = options
  const mapping = TYPE_MAPPINGS[field.type] || DEFAULT_MAPPING

  // Build props
  const props: Record<string, unknown> = {
    source: field.name,
    ...mapping.extraProps,
  }

  // Handle required field
  if (field.required && includeValidation) {
    props.required = true
    props.validate = 'required'
  }

  // Handle default value
  if (field.default !== undefined) {
    props.defaultValue = field.default
  }

  // Handle annotations
  if (field.annotations) {
    // Description -> helperText
    if (field.annotations.description) {
      props.helperText = field.annotations.description
    }

    // Primary key -> disabled in edit mode
    if (field.annotations.primaryKey && isEdit) {
      props.disabled = true
    }

    // UUID type is always disabled
    if (field.type === 'uuid') {
      props.disabled = true
    }

    // Validation annotations
    if (field.annotations.min !== undefined) {
      props.minLength = field.annotations.min
    }
    if (field.annotations.max !== undefined) {
      props.maxLength = field.annotations.max
    }
    if (field.annotations.pattern) {
      props.pattern = field.annotations.pattern
    }

    // Enum choices
    if (field.type === 'enum') {
      const enumValues = field.annotations.enumValues || []
      props.choices = enumValues.map((value: string) => ({
        id: value,
        name: value,
      }))
    }
  }

  // Build imports list
  const imports = new Set<string>()
  imports.add(mapping.listComponent)
  imports.add(mapping.showComponent)
  imports.add(mapping.inputComponent)

  return {
    listComponent: mapping.listComponent,
    showComponent: mapping.showComponent,
    inputComponent: mapping.inputComponent,
    props,
    imports: Array.from(imports),
  }
}
