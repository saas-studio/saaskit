/**
 * @saaskit/shadmin-provider
 *
 * Adapts SaaSKit's DataStore interface to Shadmin/React-Admin's DataProvider interface.
 */

import type { IDataStore } from '@saaskit/schema'
import type {
  DataProvider,
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult,
  GetManyParams,
  GetManyResult,
  GetManyReferenceParams,
  GetManyReferenceResult,
  CreateParams,
  CreateResult,
  UpdateParams,
  UpdateResult,
  UpdateManyParams,
  UpdateManyResult,
  DeleteParams,
  DeleteResult,
  DeleteManyParams,
  DeleteManyResult,
  RaRecord,
  Identifier,
} from './types'

// Re-export all types
export * from './types'

/**
 * Options for creating a DataStore-backed DataProvider
 */
export interface CreateDataStoreProviderOptions {
  /**
   * The SaaSKit DataStore instance to wrap
   */
  dataStore: IDataStore
}

/**
 * Sort an array of records by a field
 */
function sortRecords<T extends Record<string, unknown>>(
  records: T[],
  field: string,
  order: 'ASC' | 'DESC'
): T[] {
  return [...records].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    // Handle null/undefined values
    if (aVal === null || aVal === undefined) return order === 'ASC' ? 1 : -1
    if (bVal === null || bVal === undefined) return order === 'ASC' ? -1 : 1

    // Compare values
    let comparison = 0
    if (aVal < bVal) comparison = -1
    else if (aVal > bVal) comparison = 1

    return order === 'DESC' ? -comparison : comparison
  })
}

/**
 * Creates a DataProvider that wraps a SaaSKit DataStore
 *
 * This function adapts the SaaSKit DataStore interface to the
 * Shadmin/React-Admin DataProvider interface, allowing you to use
 * any SaaSKit DataStore implementation as a backend for React-Admin.
 *
 * @param options - Configuration options including the DataStore instance
 * @returns A DataProvider compatible with React-Admin
 *
 * @example
 * import { DataStore } from '@saaskit/schema'
 * import { createDataStoreProvider } from '@saaskit/shadmin-provider'
 *
 * const dataStore = new DataStore(mySchema)
 * const dataProvider = createDataStoreProvider({ dataStore })
 *
 * // Use with React-Admin
 * <Admin dataProvider={dataProvider}>
 *   <Resource name="users" list={UserList} />
 * </Admin>
 */
export function createDataStoreProvider(
  options: CreateDataStoreProviderOptions
): DataProvider {
  const { dataStore } = options

  return {
    /**
     * Get a list of records with pagination, sorting, and filtering
     */
    async getList<RecordType extends RaRecord = RaRecord>(
      resource: string,
      params: GetListParams
    ): Promise<GetListResult<RecordType>> {
      const { pagination, sort, filter } = params
      const { page, perPage } = pagination

      // Build where clause from filter
      const where = Object.keys(filter).length > 0 ? filter : undefined

      // Get all records matching filter (without pagination for total count)
      const allRecords = dataStore.findAll(resource, { where })

      // Sort the records (DataStore doesn't support sorting)
      const sortedRecords = sortRecords(allRecords, sort.field, sort.order)

      // Calculate total before pagination
      const total = sortedRecords.length

      // Apply pagination (page is 1-indexed)
      const offset = Math.max(0, (page - 1) * perPage)
      const paginatedRecords =
        perPage > 0 ? sortedRecords.slice(offset, offset + perPage) : []

      return {
        data: paginatedRecords as RecordType[],
        total,
      }
    },

    /**
     * Get a single record by ID
     */
    async getOne<RecordType extends RaRecord = RaRecord>(
      resource: string,
      params: GetOneParams
    ): Promise<GetOneResult<RecordType>> {
      const id = String(params.id)
      const record = dataStore.findById(resource, id)

      if (!record) {
        throw new Error(`Record with id "${id}" not found in resource "${resource}"`)
      }

      return { data: record as RecordType }
    },

    /**
     * Get multiple records by their IDs
     */
    async getMany<RecordType extends RaRecord = RaRecord>(
      resource: string,
      params: GetManyParams
    ): Promise<GetManyResult<RecordType>> {
      const { ids } = params

      if (ids.length === 0) {
        return { data: [] }
      }

      // Deduplicate IDs while preserving order
      const seenIds = new Set<string>()
      const uniqueIds: Identifier[] = []
      for (const id of ids) {
        const idStr = String(id)
        if (!seenIds.has(idStr)) {
          seenIds.add(idStr)
          uniqueIds.push(id)
        }
      }

      // Fetch records in the order of unique IDs
      const records: RecordType[] = []
      for (const id of uniqueIds) {
        const record = dataStore.findById(resource, String(id))
        if (record) {
          records.push(record as RecordType)
        }
      }

      return { data: records }
    },

    /**
     * Get records that reference another record (foreign key lookup)
     */
    async getManyReference<RecordType extends RaRecord = RaRecord>(
      resource: string,
      params: GetManyReferenceParams
    ): Promise<GetManyReferenceResult<RecordType>> {
      const { target, id, pagination, sort, filter } = params
      const { page, perPage } = pagination

      // Build where clause: combine target filter with additional filters
      const where: Record<string, unknown> = {
        ...filter,
        [target]: id,
      }

      // Get all matching records
      const allRecords = dataStore.findAll(resource, { where })

      // Sort the records
      const sortedRecords = sortRecords(allRecords, sort.field, sort.order)

      // Calculate total before pagination
      const total = sortedRecords.length

      // Apply pagination
      const offset = Math.max(0, (page - 1) * perPage)
      const paginatedRecords = sortedRecords.slice(offset, offset + perPage)

      return {
        data: paginatedRecords as RecordType[],
        total,
      }
    },

    /**
     * Create a new record
     */
    async create<RecordType extends RaRecord = RaRecord>(
      resource: string,
      params: CreateParams
    ): Promise<CreateResult<RecordType>> {
      const record = dataStore.create(resource, params.data as Record<string, unknown>)
      return { data: record as RecordType }
    },

    /**
     * Update a single record
     */
    async update<RecordType extends RaRecord = RaRecord>(
      resource: string,
      params: UpdateParams<RecordType>
    ): Promise<UpdateResult<RecordType>> {
      const id = String(params.id)
      const record = dataStore.update(resource, id, params.data as Record<string, unknown>)
      return { data: record as RecordType }
    },

    /**
     * Update multiple records with the same data
     */
    async updateMany<RecordType extends RaRecord = RaRecord>(
      resource: string,
      params: UpdateManyParams<RecordType>
    ): Promise<UpdateManyResult> {
      const { ids, data } = params

      if (ids.length === 0) {
        return { data: [] }
      }

      const updatedIds: Identifier[] = []

      for (const id of ids) {
        const idStr = String(id)
        try {
          // Check if record exists first
          const existing = dataStore.findById(resource, idStr)
          if (existing) {
            dataStore.update(resource, idStr, data as Record<string, unknown>)
            updatedIds.push(id)
          }
        } catch {
          // Silently skip records that fail to update
        }
      }

      return { data: updatedIds }
    },

    /**
     * Delete a single record
     */
    async delete<RecordType extends RaRecord = RaRecord>(
      resource: string,
      params: DeleteParams<RecordType>
    ): Promise<DeleteResult<RecordType>> {
      const id = String(params.id)

      // Get the record first to return it
      const record = dataStore.findById(resource, id)
      if (!record) {
        throw new Error(`Record with id "${id}" not found in resource "${resource}"`)
      }

      // Delete the record
      const deleted = dataStore.delete(resource, id)
      if (!deleted) {
        throw new Error(`Failed to delete record with id "${id}" from resource "${resource}"`)
      }

      return { data: record as RecordType }
    },

    /**
     * Delete multiple records
     */
    async deleteMany(
      resource: string,
      params: DeleteManyParams
    ): Promise<DeleteManyResult> {
      const { ids } = params

      if (ids.length === 0) {
        return { data: [] }
      }

      const deletedIds: Identifier[] = []

      for (const id of ids) {
        // Skip invalid IDs
        if (id === null || id === undefined || id === '') {
          continue
        }

        const idStr = String(id)
        try {
          const deleted = dataStore.delete(resource, idStr)
          if (deleted) {
            deletedIds.push(id)
          }
        } catch {
          // Silently skip records that fail to delete
        }
      }

      return { data: deletedIds }
    },
  }
}
