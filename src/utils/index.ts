/**
 * Shared Utilities
 *
 * Common utility functions used throughout the SaaSkit codebase.
 * These have been consolidated from multiple locations to ensure
 * consistent behavior across all modules.
 *
 * @module utils
 */

// =============================================================================
// String Transformation Utilities
// =============================================================================

/**
 * Normalizes a name to lowercase with hyphens (kebab-case).
 *
 * @param name - The raw name (can be camelCase, PascalCase, snake_case, or with spaces)
 * @returns The normalized name (lowercase, with hyphens)
 *
 * @example
 * normalizeName('MyApp')      // 'my-app'
 * normalizeName('my_app')     // 'my-app'
 * normalizeName('My App')     // 'my-app'
 * normalizeName('my-app')     // 'my-app'
 * normalizeName('MyAppName')  // 'my-app-name'
 */
export function normalizeName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase/PascalCase -> kebab-case
    .replace(/[\s_]+/g, '-') // spaces and underscores -> hyphens
    .toLowerCase()
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, '') // trim leading/trailing hyphens
}

/**
 * Converts a name to a human-readable display name (Title Case).
 *
 * @param name - The normalized or raw name
 * @returns A capitalized, human-readable display name
 *
 * @example
 * toDisplayName('my-app')     // 'My App'
 * toDisplayName('todos')      // 'Todos'
 * toDisplayName('my_crm')     // 'My Crm'
 * toDisplayName('myApp')      // 'My App'
 */
export function toDisplayName(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Pluralizes a name using simple English rules.
 *
 * @param name - The singular name
 * @returns The pluralized name
 *
 * @example
 * pluralize('Task')      // 'Tasks'
 * pluralize('Person')    // 'Persons' (use 'plural' prop for 'People')
 * pluralize('Category')  // 'Categories'
 * pluralize('Box')       // 'Boxes'
 * pluralize('Class')     // 'Classes'
 * pluralize('Bush')      // 'Bushes'
 * pluralize('Catch')     // 'Catches'
 */
export function pluralize(name: string): string {
  // Handle words ending in 'y' preceded by a consonant
  if (name.endsWith('y') && !/[aeiou]y$/i.test(name)) {
    return name.slice(0, -1) + 'ies'
  }
  // Handle words ending in 's', 'x', 'ch', 'sh'
  if (name.endsWith('s') || name.endsWith('x') || name.endsWith('ch') || name.endsWith('sh')) {
    return name + 'es'
  }
  return name + 's'
}

// =============================================================================
// Type Conversion Utilities
// =============================================================================

/**
 * Field information needed for TypeScript type mapping.
 * Uses a minimal interface to avoid circular dependencies.
 */
export interface FieldTypeInfo {
  type: string
  values?: string[]
}

/**
 * Maps field types to TypeScript types.
 *
 * @param field - The field information containing type and optional values
 * @returns The corresponding TypeScript type as a string
 *
 * @example
 * fieldTypeToTS({ type: 'text' })                    // 'string'
 * fieldTypeToTS({ type: 'number' })                  // 'number'
 * fieldTypeToTS({ type: 'boolean' })                 // 'boolean'
 * fieldTypeToTS({ type: 'select', values: ['a', 'b'] }) // "'a' | 'b'"
 * fieldTypeToTS({ type: 'json' })                    // 'Record<string, unknown>'
 */
export function fieldTypeToTS(field: FieldTypeInfo): string {
  // Handle select fields with enum values
  if (field.type === 'select' && field.values && field.values.length > 0) {
    return field.values.map((v) => `'${v}'`).join(' | ')
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
    case 'phone':
    case 'password':
    case 'textarea':
    case 'relation':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'date':
      return 'Date'
    case 'json':
      return 'Record<string, unknown>'
    case 'select':
      return 'string'
    default:
      return 'unknown'
  }
}
