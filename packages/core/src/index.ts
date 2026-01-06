/**
 * @saaskit/core
 *
 * Core utilities and types for the SaaSKit ecosystem.
 *
 * @module @saaskit/core
 */

// @dotdo/do re-exports
export { DO } from '@dotdo/do'
export { RpcTarget } from '@dotdo/do/rpc'

// SaasKitDO base class
export { SaasKitDO } from './saaskit-do'

// Utilities
export { pluralize, singularize, isPlural } from './utils'

// DataStore Migration (RED phase - stubs that throw "Not implemented")
export { createDOAdapter, migrateDataStore } from './datastore-migration'
export type { IDataStore, DataStoreMigrationResult, DataStoreMigrationOptions } from './datastore-migration'

// Schema mapping (RED phase - stubs that throw "Not implemented")
export {
  mapSchemaToCollections,
  mapSchemaToThings,
  mapSchemaToRelationships,
  type SchemaDefinition,
  type ResourceDefinition,
  type FieldDefinition,
  type RelationshipConfig,
  type ThingDefinition,
  type RelationshipDefinition
} from './schema-mapping'
