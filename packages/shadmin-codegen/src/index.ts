/**
 * @saaskit/shadmin-codegen
 *
 * Generate Shadmin/React-Admin components from SaaSKit schemas.
 *
 * @example
 * ```typescript
 * import { generateResource, mapFieldType } from '@saaskit/shadmin-codegen'
 * import { parseYamlSchema } from '@saaskit/schema'
 *
 * const schema = parseYamlSchema(yamlContent)
 * const resource = generateResource(schema, 'User')
 *
 * // Get field mapping for a specific field
 * const field = schema.resources[0].fields[0]
 * const mapping = mapFieldType(field)
 * ```
 */

// Re-export types
export * from './types'

// Export field mapper
export { mapFieldType } from './field-mapper'
export { mapRelationType } from './reference-mapper'

// Export generators
export { generateList } from './generators/list'
export { generateShow } from './generators/show'
export { generateCreate } from './generators/create'
export { generateEdit } from './generators/edit'
export { generateResource } from './generators/resource'
export { generateScaffold } from './generators/scaffold'
