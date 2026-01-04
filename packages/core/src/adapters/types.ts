/**
 * Adapter Types for SaaSkit Persistence Layer
 *
 * These types define the contract for all storage adapters (SQLite, PostgreSQL, etc.)
 */

import type { FieldDefinition, ResourceMetadata } from '../../../schema/Resource'

/**
 * Base record type that all stored records must extend
 */
export interface BaseRecord {
  id: string
  createdAt: Date
  updatedAt?: Date
}

/**
 * Generic record type with additional fields
 */
export type Record<T extends object = object> = BaseRecord & T

/**
 * Comparison operators for query filters
 */
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'notIn'

/**
 * Single where condition
 */
export interface WhereCondition {
  field: string
  operator: ComparisonOperator
  value: unknown
}

/**
 * Logical grouping of where conditions
 */
export interface WhereClause {
  and?: WhereCondition[]
  or?: WhereCondition[]
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Order by specification
 */
export interface OrderBy {
  field: string
  direction: SortDirection
}

/**
 * Query options for list/query operations
 */
export interface QueryOptions {
  where?: WhereClause | WhereCondition[]
  orderBy?: OrderBy | OrderBy[]
  limit?: number
  offset?: number
}

/**
 * Count options - same as query but without ordering/pagination
 */
export interface CountOptions {
  where?: WhereClause | WhereCondition[]
}

/**
 * Pagination result wrapper
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

/**
 * Migration definition for schema changes
 */
export interface Migration {
  version: number
  name: string
  up: string // SQL statement(s) to apply
  down: string // SQL statement(s) to rollback
}

/**
 * SQLite-specific adapter configuration
 */
export interface SQLiteAdapterConfig {
  /** Path to SQLite database file. Use ':memory:' for in-memory database */
  path: string
  /** Optional migrations to run on initialization */
  migrations?: Migration[]
  /** Enable WAL mode for better concurrent access (default: true) */
  walMode?: boolean
  /** Enable foreign key enforcement (default: true) */
  foreignKeys?: boolean
  /** Busy timeout in milliseconds (default: 5000) */
  busyTimeout?: number
}

/**
 * Table creation options derived from Resource metadata
 */
export interface TableSchema {
  name: string
  columns: ColumnDefinition[]
  indexes?: IndexDefinition[]
}

/**
 * Column definition for table creation
 */
export interface ColumnDefinition {
  name: string
  type: SQLiteColumnType
  nullable: boolean
  unique?: boolean
  primaryKey?: boolean
  defaultValue?: unknown
  references?: ForeignKeyReference
}

/**
 * SQLite column types
 */
export type SQLiteColumnType = 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB' | 'DATETIME'

/**
 * Foreign key reference
 */
export interface ForeignKeyReference {
  table: string
  column: string
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
}

/**
 * Index definition
 */
export interface IndexDefinition {
  name: string
  columns: string[]
  unique?: boolean
}

/**
 * Adapter interface - the main contract for persistence adapters
 *
 * All adapters must implement these methods to be compatible with SaaSkit.
 * The interface is async-first to support both sync and async backends.
 */
export interface Adapter {
  /**
   * Create a new record in the specified collection/table
   * @param collection - The table/collection name
   * @param data - The data to insert (without id, createdAt, updatedAt)
   * @returns The created record with generated id and timestamps
   */
  create<T extends object>(collection: string, data: T): Promise<Record<T>>

  /**
   * Read/find a single record by ID
   * @param collection - The table/collection name
   * @param id - The record ID
   * @returns The record if found, null otherwise
   */
  read<T extends object>(collection: string, id: string): Promise<Record<T> | null>

  /**
   * Update an existing record
   * @param collection - The table/collection name
   * @param id - The record ID
   * @param data - The fields to update (partial update)
   * @returns The updated record
   * @throws Error if record not found
   */
  update<T extends object>(collection: string, id: string, data: Partial<T>): Promise<Record<T>>

  /**
   * Delete a record by ID
   * @param collection - The table/collection name
   * @param id - The record ID
   * @throws Error if record not found
   */
  delete(collection: string, id: string): Promise<void>

  /**
   * List records with optional pagination and ordering
   * @param collection - The table/collection name
   * @param options - Query options (limit, offset, orderBy)
   * @returns Paginated result with records
   */
  list<T extends object>(collection: string, options?: QueryOptions): Promise<PaginatedResult<Record<T>>>

  /**
   * Query records with filters
   * @param collection - The table/collection name
   * @param options - Query options including where conditions
   * @returns Paginated result with matching records
   */
  query<T extends object>(collection: string, options: QueryOptions): Promise<PaginatedResult<Record<T>>>

  /**
   * Count records matching criteria
   * @param collection - The table/collection name
   * @param options - Count options with where conditions
   * @returns The count of matching records
   */
  count(collection: string, options?: CountOptions): Promise<number>

  /**
   * Create a table from a Resource definition
   * @param resource - The resource metadata
   */
  createTable(resource: ResourceMetadata): Promise<void>

  /**
   * Sync schema - create tables for resources that don't exist
   * @param resources - Array of resource metadata
   */
  syncSchema(resources: ResourceMetadata[]): Promise<void>

  /**
   * Check if a table exists
   * @param tableName - The table name
   */
  tableExists(tableName: string): Promise<boolean>

  /**
   * Run migrations
   * @param migrations - Array of migrations to run
   */
  migrate(migrations: Migration[]): Promise<void>

  /**
   * Get current migration version
   */
  getMigrationVersion(): Promise<number>

  /**
   * Close the database connection
   */
  close(): Promise<void>
}

/**
 * Map SaaSkit field types to SQLite column types
 */
export function fieldTypeToSQLiteType(fieldType: FieldDefinition['type']): SQLiteColumnType {
  switch (fieldType) {
    case 'text':
    case 'email':
    case 'url':
    case 'select':
      return 'TEXT'
    case 'number':
      return 'REAL'
    case 'boolean':
      return 'INTEGER' // SQLite stores booleans as 0/1
    case 'date':
    case 'datetime':
      return 'DATETIME'
    case 'relation':
      return 'TEXT' // Foreign key stored as TEXT (UUID reference)
    default:
      return 'TEXT'
  }
}

/**
 * Convert ResourceMetadata to TableSchema
 */
export function resourceToTableSchema(resource: ResourceMetadata): TableSchema {
  const columns: ColumnDefinition[] = [
    {
      name: 'id',
      type: 'TEXT',
      nullable: false,
      primaryKey: true,
    },
    {
      name: 'createdAt',
      type: 'DATETIME',
      nullable: false,
    },
    {
      name: 'updatedAt',
      type: 'DATETIME',
      nullable: true,
    },
  ]

  const indexes: IndexDefinition[] = []

  for (const field of resource.fields) {
    const column: ColumnDefinition = {
      name: field.name,
      type: fieldTypeToSQLiteType(field.type),
      nullable: !field.required,
      unique: field.unique,
    }

    // Add foreign key reference for relations
    if (field.type === 'relation' && field.relation) {
      column.references = {
        table: field.relation.target.toLowerCase(),
        column: 'id',
        onDelete: 'CASCADE',
      }
    }

    columns.push(column)

    // Create index for unique fields
    if (field.unique) {
      indexes.push({
        name: `idx_${resource.name.toLowerCase()}_${field.name}`,
        columns: [field.name],
        unique: true,
      })
    }
  }

  return {
    name: resource.name.toLowerCase(),
    columns,
    indexes: indexes.length > 0 ? indexes : undefined,
  }
}
