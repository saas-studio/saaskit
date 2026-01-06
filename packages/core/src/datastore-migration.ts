/**
 * DataStore Migration
 *
 * Provides backwards compatibility for migrating from legacy IDataStore
 * to the new SaasKitDO system:
 * - IDataStore interface
 * - DOAdapter (createDOAdapter) - wraps SaasKitDO with IDataStore interface
 * - Migration helper (migrateDataStore) - migrates data from legacy to new
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
// Deprecation Warning System
// ============================================================================

/** Track which methods have already logged warnings */
const warnedMethods = new Set<string>()

/**
 * Reset the warning tracker (for testing purposes)
 * @internal
 */
export function resetDeprecationWarnings(): void {
  warnedMethods.clear()
}

/**
 * Log a deprecation warning once per method
 */
function logDeprecationWarning(method: string): void {
  if (warnedMethods.has(method)) return
  warnedMethods.add(method)
  console.warn(
    `[DEPRECATED] IDataStore.${method}() is deprecated. Migrate to using SaasKitDO directly.`
  )
}

// ============================================================================
// Implementation
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
export function createDOAdapter(doInstance: SaasKitDO): IDataStore {
  return {
    async create(collection: string, data: Record<string, unknown>) {
      logDeprecationWarning('create')
      const result = await doInstance.create(collection, data)
      return result as Record<string, unknown>
    },

    async read(collection: string, id: string) {
      logDeprecationWarning('read')
      const result = await doInstance.read(collection, id)
      return result as Record<string, unknown> | null
    },

    async list(collection: string, options?: { limit?: number; offset?: number }) {
      logDeprecationWarning('list')
      const result = await doInstance.list(collection, options)
      return {
        data: result.data as Record<string, unknown>[],
        total: result.total
      }
    },

    async update(collection: string, id: string, data: Record<string, unknown>) {
      logDeprecationWarning('update')
      const result = await doInstance.update(collection, id, data)
      return result as Record<string, unknown>
    },

    async delete(collection: string, id: string) {
      logDeprecationWarning('delete')
      return doInstance.delete(collection, id)
    }
  }
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
export async function migrateDataStore(
  source: IDataStore,
  target: SaasKitDO,
  schema: Schema,
  options?: DataStoreMigrationOptions
): Promise<DataStoreMigrationResult> {
  const dryRun = options?.dryRun ?? false
  const collectionsToMigrate = options?.collections ?? Object.keys(schema.resources)
  const batchSize = options?.batchSize ?? 100
  const onProgress = options?.onProgress
  const upsert = options?.upsert ?? false
  const idMapping = options?.idMapping ?? {}

  const result: DataStoreMigrationResult = {
    success: true,
    migratedCount: 0,
    failedCount: 0,
    skippedCount: 0,
    byCollection: {},
    errors: [],
    dryRun
  }

  // Count total records for progress tracking
  let totalRecords = 0
  let processedRecords = 0

  for (const collection of collectionsToMigrate) {
    const listResult = await source.list(collection, { limit: 1 })
    totalRecords += listResult.total
  }

  // Migrate each collection
  for (const collection of collectionsToMigrate) {
    result.byCollection[collection] = 0
    let offset = 0

    while (true) {
      const batch = await source.list(collection, { limit: batchSize, offset })
      if (batch.data.length === 0) break

      for (const record of batch.data) {
        processedRecords++
        onProgress?.(processedRecords, totalRecords)

        try {
          const recordId = record.id as string

          // When idMapping is provided, use mapped ID for lookups
          const targetId = idMapping[recordId] ?? recordId

          // Check if record already exists in target (by mapped ID if provided)
          const existing = await target.read(collection, targetId)

          if (existing && !upsert) {
            result.skippedCount = (result.skippedCount ?? 0) + 1
            continue
          }

          if (!dryRun) {
            if (existing && upsert) {
              // Update existing record, excluding id from updates
              const { id: _sourceId, ...updateData } = record
              await target.update(collection, targetId, updateData)
            } else {
              // Create new record, preserving source ID
              await target.create(collection, record)
            }
          }

          result.migratedCount++
          result.byCollection[collection]++
        } catch (error) {
          result.failedCount = (result.failedCount ?? 0) + 1
          result.success = false
          const errorMessage = error instanceof Error ? error.message : String(error)
          result.errors.push(`${collection}/${record.id}: ${errorMessage}`)
        }
      }

      offset += batch.data.length
      if (offset >= batch.total) break
    }
  }

  return result
}
