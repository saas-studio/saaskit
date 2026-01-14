/**
 * Shared Utilities for Shadmin Codegen
 *
 * @see saaskit-03e, saaskit-ncy9
 */

import { pluralize as corePluralize, singularize } from '@saaskit/core'

// Re-export core utilities
export { singularize }

/**
 * Pluralize a resource name using simple English rules.
 * Returns lowercase for URL/collection naming conventions.
 *
 * @example
 * pluralize('User') // 'users'
 * pluralize('Category') // 'categories'
 * pluralize('Box') // 'boxes'
 */
export function pluralize(name: string): string {
  return corePluralize(name).toLowerCase()
}
