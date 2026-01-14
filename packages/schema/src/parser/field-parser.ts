/**
 * Field Parser
 *
 * Functions for parsing field definitions from YAML into Field and Relation objects.
 */

import type { Field, FieldAnnotations, Relation } from '../types'
import type { ParsedFieldModifiers } from './types'
import { VALID_FIELD_TYPES, isAutoTimestampField } from './constants'
import { normalizeFieldType, isEnumDefinition, isRelationDefinition } from './helpers'

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
  const isOptional = fieldName.endsWith('?')
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
    if (isAutoTimestampField(cleanFieldName)) {
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
export function parseObjectField(
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
