/**
 * Shared Utilities for Shadmin Codegen
 *
 * @see saaskit-03e
 */

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Pluralize a resource name using simple English rules
 *
 * @example
 * pluralize('User') // 'users'
 * pluralize('Category') // 'categories'
 * pluralize('Box') // 'boxes'
 */
export function pluralize(name: string): string {
  const lower = name.toLowerCase()

  // Words ending in 's', 'x', 'z', 'ch', 'sh' add 'es'
  if (/(?:s|x|z|ch|sh)$/.test(lower)) {
    return lower + 'es'
  }

  // Words ending in consonant + 'y' change to 'ies'
  if (/[^aeiou]y$/.test(lower)) {
    return lower.slice(0, -1) + 'ies'
  }

  // Default: add 's'
  return lower + 's'
}
