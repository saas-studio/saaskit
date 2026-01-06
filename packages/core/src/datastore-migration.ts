/**
 * DataStore Migration - Stubs for TDD RED Phase
 *
 * This file contains type definitions and stub implementations for:
 * - IDataStore interface
 * - DOAdapter (createDOAdapter)
 * - Migration helper (migrateDataStore)
 *
 * All functions throw "Not implemented" - this is the RED phase of TDD.
 * Tests should compile but FAIL when run.
 */

import type { SaasKitDO } from './saaskit-do'

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Legacy IDataStore interface for backwards compatibility
 * @deprecated Use SaasKitDO directly instead
 */
export interface IDataStore {
  create(collection: string, data: Record<string, unknown>): Promise<Record<string, unknown>>
  read(collection: string, id: string): Promise<Record<string, unknown> | null>
  list(
    collection: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ data: Record<string, unknown>[]; total: number }>
  update(collection: string, id: string, data: Record<string, unknown>): Promise<Record<string, unknown>>
  delete(collection: string, id: string): Promise<boolean>
}

/**
 * Result of a migration operation
 */
export interface DataStoreMigrationResult {
  /** Whether the migration was fully successful */
  success: boolean
  /** Total number of records migrated */
  migratedCount: number
  /** Number of records that failed to migrate */
  failedCount?: number
  /** Number of records skipped (already exist in target) */
  skippedCount?: number
  /** Count breakdown by collection */
  byCollection: Record<string, number>
  /** Array of error messages for failed records */
  errors: string[]
  /** Whether this was a dry-run */
  dryRun?: boolean
}

/**
 * Options for migration operation
 */
export interface DataStoreMigrationOptions {
  /** If true, simulate migration without writing */
  dryRun?: boolean
  /** Only migrate specific collections */
  collections?: string[]
  /** Number of records to process at once */
  batchSize?: number
  /** Callback for progress updates */
  onProgress?: (current: number, total: number) => void
  /** If true, overwrite existing records in target */
  upsert?: boolean
  /** Map source IDs to target IDs for upsert mode */
  idMapping?: Record<string, string>
}

/**
 * Schema definition for migration
 */
interface Schema {
  name: string
  resources: Record<string, { fields: Record<string, unknown> }>
}

// ============================================================================
// Stub Implementations (RED phase - all throw "Not implemented")
// ============================================================================

/**
 * Creates an IDataStore adapter that wraps a SaasKitDO instance
 * for backwards compatibility with legacy code.
 *
 * @deprecated This adapter is provided for migration purposes only.
 *             Migrate to using SaasKitDO directly.
 *
 * @param doInstance - The SaasKitDO instance to wrap
 * @returns An IDataStore-compatible adapter
 *
 * @example
 * ```typescript
 * const do = new SaasKitDO(schema)
 * const adapter = createDOAdapter(do)
 *
 * // Use legacy IDataStore API
 * const user = await adapter.create('users', { name: 'John' })
 * ```
 */
export function createDOAdapter(_doInstance: SaasKitDO): IDataStore {
  throw new Error('Not implemented: createDOAdapter')
}

/**
 * Migrates data from a legacy DataStore to a SaasKitDO instance.
 *
 * @param source - The legacy IDataStore to migrate from
 * @param target - The target SaasKitDO instance
 * @param schema - Schema defining the collections to migrate
 * @param options - Migration options
 * @returns Migration result with success status and counts
 *
 * @example
 * ```typescript
 * const result = await migrateDataStore(legacyStore, newDO, schema)
 * console.log(`Migrated ${result.migratedCount} records`)
 * ```
 */
export function migrateDataStore(
  _source: IDataStore,
  _target: SaasKitDO,
  _schema: Schema,
  _options?: DataStoreMigrationOptions
): Promise<DataStoreMigrationResult> {
  throw new Error('Not implemented: migrateDataStore')
}
