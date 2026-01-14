/**
 * @saaskit/core
 *
 * Core utilities and types for the SaaSKit ecosystem.
 *
 * @module @saaskit/core
 */

// @dotdo/do re-exports (disabled until package is published)
// export { DO } from '@dotdo/do'
// export { RpcTarget } from '@dotdo/do/rpc'

// SaasKitDO base class
export { SaasKitDO } from './saaskit-do'

// SaaS Metric Types
export type {
  Metric,
  MRRMetric,
  ChurnMetric,
  NRRMetric,
  CACMetric,
  LTVMetric
} from './types'

// Utilities
export { pluralize, singularize, isPlural } from './utils'

// DataStore Migration
export { createDOAdapter, migrateDataStore, resetDeprecationWarnings } from './datastore-migration'
export type { IDataStore, DataStoreMigrationResult, DataStoreMigrationOptions } from './datastore-migration'

// Schema mapping
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
