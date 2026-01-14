/**
 * DataProvider Types for Shadmin/React-Admin
 *
 * These types define the interface that bridges SaaSKit's DataStore
 * to Shadmin/React-Admin's DataProvider interface.
 */

// ============================================================================
// Identifier Types
// ============================================================================

/**
 * Identifier type - can be string or number
 */
export type Identifier = string | number

/**
 * Base record type with required id field
 */
export interface RaRecord {
  id: Identifier
  [key: string]: unknown
}

// ============================================================================
// Sort & Filter Types
// ============================================================================

/**
 * Sort parameters for list queries
 */
export interface SortPayload {
  /** Field to sort by */
  field: string
  /** Sort order */
  order: 'ASC' | 'DESC'
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationPayload {
  /** Current page number (1-indexed) */
  page: number
  /** Number of records per page */
  perPage: number
}

/**
 * Filter object - key-value pairs for filtering records
 */
export type FilterPayload = Record<string, unknown>

// ============================================================================
// GetList
// ============================================================================

/**
 * Parameters for getList method
 */
export interface GetListParams {
  /** Pagination settings */
  pagination: PaginationPayload
  /** Sort settings */
  sort: SortPayload
  /** Filter conditions */
  filter: FilterPayload
}

/**
 * Result from getList method
 */
export interface GetListResult<RecordType extends RaRecord = RaRecord> {
  /** Array of records */
  data: RecordType[]
  /** Total count of records matching the filter (before pagination) */
  total: number
}

// ============================================================================
// GetOne
// ============================================================================

/**
 * Parameters for getOne method
 */
export interface GetOneParams {
  /** ID of the record to fetch */
  id: Identifier
}

/**
 * Result from getOne method
 */
export interface GetOneResult<RecordType extends RaRecord = RaRecord> {
  /** The fetched record */
  data: RecordType
}

// ============================================================================
// GetMany
// ============================================================================

/**
 * Parameters for getMany method
 */
export interface GetManyParams {
  /** Array of IDs to fetch */
  ids: Identifier[]
}

/**
 * Result from getMany method
 */
export interface GetManyResult<RecordType extends RaRecord = RaRecord> {
  /** Array of fetched records */
  data: RecordType[]
}

// ============================================================================
// GetManyReference
// ============================================================================

/**
 * Parameters for getManyReference method
 */
export interface GetManyReferenceParams {
  /** Field name containing the foreign key */
  target: string
  /** ID value to filter by */
  id: Identifier
  /** Pagination settings */
  pagination: PaginationPayload
  /** Sort settings */
  sort: SortPayload
  /** Additional filter conditions */
  filter: FilterPayload
}

/**
 * Result from getManyReference method
 */
export interface GetManyReferenceResult<RecordType extends RaRecord = RaRecord> {
  /** Array of records */
  data: RecordType[]
  /** Total count of records matching the filter (before pagination) */
  total: number
}

// ============================================================================
// Create
// ============================================================================

/**
 * Parameters for create method
 */
export interface CreateParams<RecordType extends Partial<RaRecord> = Partial<RaRecord>> {
  /** Data for the new record (without id) */
  data: RecordType
}

/**
 * Result from create method
 */
export interface CreateResult<RecordType extends RaRecord = RaRecord> {
  /** The created record (with id) */
  data: RecordType
}

// ============================================================================
// Update
// ============================================================================

/**
 * Parameters for update method
 */
export interface UpdateParams<RecordType extends RaRecord = RaRecord> {
  /** ID of the record to update */
  id: Identifier
  /** Updated data */
  data: RecordType
  /** Previous data (for optimistic updates) */
  previousData: RecordType
}

/**
 * Result from update method
 */
export interface UpdateResult<RecordType extends RaRecord = RaRecord> {
  /** The updated record */
  data: RecordType
}

// ============================================================================
// UpdateMany
// ============================================================================

/**
 * Parameters for updateMany method
 */
export interface UpdateManyParams<RecordType extends RaRecord = RaRecord> {
  /** Array of IDs to update */
  ids: Identifier[]
  /** Data to apply to all records */
  data: Partial<RecordType>
}

/**
 * Result from updateMany method
 */
export interface UpdateManyResult {
  /** Array of updated record IDs */
  data: Identifier[]
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Parameters for delete method
 */
export interface DeleteParams<RecordType extends RaRecord = RaRecord> {
  /** ID of the record to delete */
  id: Identifier
  /** Previous data (for optimistic updates) */
  previousData?: RecordType
}

/**
 * Result from delete method
 */
export interface DeleteResult<RecordType extends RaRecord = RaRecord> {
  /** The deleted record */
  data: RecordType
}

// ============================================================================
// DeleteMany
// ============================================================================

/**
 * Parameters for deleteMany method
 */
export interface DeleteManyParams {
  /** Array of IDs to delete */
  ids: Identifier[]
}

/**
 * Result from deleteMany method
 */
export interface DeleteManyResult {
  /** Array of deleted record IDs */
  data: Identifier[]
}

// ============================================================================
// DataProvider Interface
// ============================================================================

/**
 * DataProvider interface compatible with Shadmin/React-Admin
 *
 * This interface defines the 9 standard methods that React-Admin expects
 * from a data provider. Implementations of this interface bridge the gap
 * between React-Admin's data fetching expectations and the underlying
 * data store.
 */
export interface DataProvider {
  /**
   * Get a list of records with pagination, sorting, and filtering
   *
   * @param resource - The resource name (e.g., 'users', 'posts')
   * @param params - Pagination, sort, and filter parameters
   * @returns Promise resolving to records and total count
   *
   * @example
   * const { data, total } = await dataProvider.getList('users', {
   *   pagination: { page: 1, perPage: 10 },
   *   sort: { field: 'name', order: 'ASC' },
   *   filter: { status: 'active' }
   * })
   */
  getList<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: GetListParams
  ): Promise<GetListResult<RecordType>>

  /**
   * Get a single record by ID
   *
   * @param resource - The resource name
   * @param params - Contains the record ID
   * @returns Promise resolving to the record
   *
   * @example
   * const { data } = await dataProvider.getOne('users', { id: 123 })
   */
  getOne<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: GetOneParams
  ): Promise<GetOneResult<RecordType>>

  /**
   * Get multiple records by their IDs
   *
   * @param resource - The resource name
   * @param params - Contains array of IDs
   * @returns Promise resolving to array of records
   *
   * @example
   * const { data } = await dataProvider.getMany('users', { ids: [1, 2, 3] })
   */
  getMany<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: GetManyParams
  ): Promise<GetManyResult<RecordType>>

  /**
   * Get records that reference another record
   *
   * Used for one-to-many relationships to fetch related records.
   *
   * @param resource - The resource name to fetch from
   * @param params - Reference target, ID, and query parameters
   * @returns Promise resolving to records and total count
   *
   * @example
   * // Get all posts by user 123
   * const { data, total } = await dataProvider.getManyReference('posts', {
   *   target: 'userId',
   *   id: 123,
   *   pagination: { page: 1, perPage: 10 },
   *   sort: { field: 'createdAt', order: 'DESC' },
   *   filter: {}
   * })
   */
  getManyReference<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: GetManyReferenceParams
  ): Promise<GetManyReferenceResult<RecordType>>

  /**
   * Create a new record
   *
   * @param resource - The resource name
   * @param params - Contains the data for the new record
   * @returns Promise resolving to the created record with ID
   *
   * @example
   * const { data } = await dataProvider.create('users', {
   *   data: { name: 'John', email: 'john@example.com' }
   * })
   */
  create<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: CreateParams
  ): Promise<CreateResult<RecordType>>

  /**
   * Update a single record
   *
   * @param resource - The resource name
   * @param params - Contains ID, new data, and previous data
   * @returns Promise resolving to the updated record
   *
   * @example
   * const { data } = await dataProvider.update('users', {
   *   id: 123,
   *   data: { name: 'Jane' },
   *   previousData: { id: 123, name: 'John' }
   * })
   */
  update<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: UpdateParams<RecordType>
  ): Promise<UpdateResult<RecordType>>

  /**
   * Update multiple records with the same data
   *
   * @param resource - The resource name
   * @param params - Contains array of IDs and data to apply
   * @returns Promise resolving to array of updated IDs
   *
   * @example
   * const { data } = await dataProvider.updateMany('users', {
   *   ids: [1, 2, 3],
   *   data: { status: 'archived' }
   * })
   */
  updateMany<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: UpdateManyParams<RecordType>
  ): Promise<UpdateManyResult>

  /**
   * Delete a single record
   *
   * @param resource - The resource name
   * @param params - Contains the ID to delete
   * @returns Promise resolving to the deleted record
   *
   * @example
   * const { data } = await dataProvider.delete('users', { id: 123 })
   */
  delete<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: DeleteParams<RecordType>
  ): Promise<DeleteResult<RecordType>>

  /**
   * Delete multiple records
   *
   * @param resource - The resource name
   * @param params - Contains array of IDs to delete
   * @returns Promise resolving to array of deleted IDs
   *
   * @example
   * const { data } = await dataProvider.deleteMany('users', { ids: [1, 2, 3] })
   */
  deleteMany(resource: string, params: DeleteManyParams): Promise<DeleteManyResult>
}
