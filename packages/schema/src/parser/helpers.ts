/**
 * Parser Helper Functions
 *
 * Utility functions for detecting format types and normalizing field types.
 */

import type { FieldType } from '../types'
import type { ParsedResource, ParsedShorthandResource } from './types'

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
export function isEnumDefinition(value: string): boolean {
  return value.includes('|') && !value.startsWith('->')
}

/**
 * Check if a string is a relation definition (starts with ->)
 */
export function isRelationDefinition(value: string): boolean {
  return value.startsWith('->')
}
