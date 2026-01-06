/**
 * Schema-to-DO Resource Mapping
 *
 * RED Phase: Type definitions and stub functions for mapping SaaSKit schemas
 * to Durable Object resources. All functions throw "Not implemented" to make
 * tests fail, following TDD RED phase.
 *
 * @module @saaskit/core/schema-mapping
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Field definition in a resource schema
 */
export type FieldDefinition = string | {
  type: string
  required?: boolean
  enum?: string[]
  default?: unknown
}

/**
 * Relationship configuration in schema
 */
export interface RelationshipConfig {
  resource: string
  type: 'belongsTo' | 'hasMany'
  foreignKey?: string
  cascade?: 'delete' | 'nullify' | 'restrict'
}

/**
 * Resource definition in schema
 */
export interface ResourceDefinition {
  fields: Record<string, FieldDefinition>
  relationships?: Record<string, RelationshipConfig>
}

/**
 * Complete schema definition for a SaaSKit application
 */
export interface SchemaDefinition {
  name: string
  namespace: string
  resources: Record<string, ResourceDefinition>
}

/**
 * Thing type definition for DO resources
 * Represents a type of entity in the Durable Object graph
 */
export interface ThingDefinition {
  /** Namespace (domain) for this thing type */
  ns: string
  /** Type name (PascalCase, singular) */
  type: string
  /** URL pattern for accessing instances (e.g., /users/:id) */
  urlPattern: string
}

/**
 * Relationship definition extracted from schema
 * Describes how two resources are related
 */
export interface RelationshipDefinition {
  /** Name of the relationship (e.g., 'author', 'comments') */
  name: string
  /** Source resource (where the relationship is defined) */
  from: string
  /** Target resource (what the relationship points to) */
  to: string
  /** Type of relationship */
  type: 'belongsTo' | 'hasMany'
  /** Cardinality: 'one' for belongsTo, 'many' for hasMany */
  cardinality: 'one' | 'many'
}

// ============================================================================
// Stub Functions (RED Phase - All throw "Not implemented")
// ============================================================================

/**
 * Maps a schema to collection names
 *
 * Extracts the resource names from the schema definition,
 * which become collection names in the Durable Object storage.
 *
 * @param schema - The schema definition to map
 * @returns Array of collection names
 *
 * @example
 * ```typescript
 * const schema = {
 *   name: 'Blog',
 *   namespace: 'blog.example.com',
 *   resources: { users: {...}, posts: {...} }
 * }
 * const collections = mapSchemaToCollections(schema)
 * // Returns: ['users', 'posts']
 * ```
 */
export function mapSchemaToCollections(_schema: SchemaDefinition): string[] {
  throw new Error('Not implemented')
}

/**
 * Maps a schema to Thing type definitions
 *
 * Generates Thing definitions for each resource in the schema,
 * including namespace, type name, and URL pattern.
 *
 * @param schema - The schema definition to map
 * @returns Array of Thing definitions
 *
 * @example
 * ```typescript
 * const things = mapSchemaToThings(schema)
 * // Returns: [
 * //   { ns: 'blog.example.com', type: 'User', urlPattern: '/users/:id' },
 * //   { ns: 'blog.example.com', type: 'Post', urlPattern: '/posts/:id' }
 * // ]
 * ```
 */
export function mapSchemaToThings(_schema: SchemaDefinition): ThingDefinition[] {
  throw new Error('Not implemented')
}

/**
 * Maps a schema to relationship definitions
 *
 * Extracts all relationships defined in the schema resources,
 * normalizing them to a standard RelationshipDefinition format.
 *
 * @param schema - The schema definition to map
 * @returns Array of relationship definitions
 *
 * @example
 * ```typescript
 * const relationships = mapSchemaToRelationships(schema)
 * // Returns: [
 * //   { name: 'author', from: 'posts', to: 'users', type: 'belongsTo', cardinality: 'one' },
 * //   { name: 'comments', from: 'posts', to: 'comments', type: 'hasMany', cardinality: 'many' }
 * // ]
 * ```
 */
export function mapSchemaToRelationships(_schema: SchemaDefinition): RelationshipDefinition[] {
  throw new Error('Not implemented')
}
