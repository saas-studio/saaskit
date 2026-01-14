/**
 * Parser Constants
 *
 * Constants used for field type validation and auto-timestamp detection.
 */

/**
 * Valid field types recognized by the parser
 */
export const VALID_FIELD_TYPES: Set<string> = new Set([
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

/**
 * Auto-timestamp field names (both camelCase and snake_case conventions)
 */
export const AUTO_TIMESTAMP_FIELDS: Set<string> = new Set([
  'createdAt',
  'created_at',
  'updatedAt',
  'updated_at',
])

/**
 * Check if a field name is an auto-timestamp field
 */
export function isAutoTimestampField(fieldName: string): boolean {
  return AUTO_TIMESTAMP_FIELDS.has(fieldName)
}
