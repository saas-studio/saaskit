/**
 * SQLite Adapter
 *
 * Persistent storage adapter using SQLite database.
 * Uses Bun's built-in SQLite support for high performance.
 *
 * @module adapters/SQLiteStore
 */

import { Database } from 'bun:sqlite'

/**
 * Record type matching MemoryStore interface
 */
export interface Record {
  id: string
  createdAt: Date
  updatedAt?: Date
  [key: string]: unknown
}

/**
 * SQLite store configuration
 */
export interface SQLiteConfig {
  /** Database filename or ':memory:' for in-memory */
  filename: string
  /** Use in-memory database */
  inMemory?: boolean
}

/**
 * SQLite-backed persistent store
 *
 * Provides the same interface as MemoryStore but persists data to SQLite.
 * Automatically creates collection tables and manages JSON serialization.
 */
export class SQLiteStore {
  private filename: string
  private inMemory: boolean
  private db: Database | null = null
  private collections: Set<string> = new Set()

  constructor(config: SQLiteConfig) {
    this.filename = config.filename
    this.inMemory = config.inMemory ?? false
  }

  /**
   * Connect to the SQLite database
   */
  async connect(): Promise<void> {
    if (this.db) return // Already connected

    this.db = new Database(this.filename)

    // Enable WAL mode for better concurrent performance
    this.db.run('PRAGMA journal_mode=WAL')

    // Create metadata table to track collections
    this.db.run(`
      CREATE TABLE IF NOT EXISTS __collections (
        name TEXT PRIMARY KEY,
        created_at TEXT NOT NULL
      )
    `)

    // Load existing collections
    const rows = this.db.query('SELECT name FROM __collections').all() as { name: string }[]
    for (const row of rows) {
      this.collections.add(row.name)
    }
  }

  /**
   * Disconnect from the SQLite database
   */
  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.collections.clear()
  }

  /**
   * Ensure a collection table exists
   */
  async ensureCollection(collection: string): Promise<void> {
    if (!this.db) throw new Error('Database not connected')
    if (this.collections.has(collection)) return

    const tableName = this.sanitizeTableName(collection)

    // Create collection table with JSON data storage
    this.db.run(`
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT
      )
    `)

    // Register collection
    this.db.run('INSERT OR IGNORE INTO __collections (name, created_at) VALUES (?, ?)', [
      collection,
      new Date().toISOString(),
    ])

    this.collections.add(collection)
  }

  /**
   * Create a new record in a collection
   */
  async create(collection: string, data: object): Promise<Record> {
    if (!this.db) throw new Error('Database not connected')

    await this.ensureCollection(collection)
    const tableName = this.sanitizeTableName(collection)

    const id = crypto.randomUUID()
    const createdAt = new Date()

    const record: Record = {
      ...data,
      id,
      createdAt,
    }

    // Store data as JSON, excluding id, createdAt, updatedAt which are in columns
    const { id: _, createdAt: __, updatedAt: ___, ...jsonData } = record

    this.db.run(`INSERT INTO "${tableName}" (id, data, created_at) VALUES (?, ?, ?)`, [
      id,
      JSON.stringify(jsonData),
      createdAt.toISOString(),
    ])

    return record
  }

  /**
   * List all records in a collection
   */
  async list(collection: string): Promise<Record[]> {
    if (!this.db) throw new Error('Database not connected')

    await this.ensureCollection(collection)
    const tableName = this.sanitizeTableName(collection)

    const rows = this.db.query(`SELECT id, data, created_at, updated_at FROM "${tableName}"`).all() as {
      id: string
      data: string
      created_at: string
      updated_at: string | null
    }[]

    return rows.map((row) => this.rowToRecord(row))
  }

  /**
   * Get a record by ID
   */
  async get(collection: string, id: string): Promise<Record | null> {
    if (!this.db) throw new Error('Database not connected')

    await this.ensureCollection(collection)
    const tableName = this.sanitizeTableName(collection)

    const row = this.db
      .query(`SELECT id, data, created_at, updated_at FROM "${tableName}" WHERE id = ?`)
      .get(id) as {
      id: string
      data: string
      created_at: string
      updated_at: string | null
    } | null

    if (!row) return null

    return this.rowToRecord(row)
  }

  /**
   * Update a record by ID
   */
  async update(collection: string, id: string, data: object): Promise<Record> {
    if (!this.db) throw new Error('Database not connected')

    await this.ensureCollection(collection)
    const tableName = this.sanitizeTableName(collection)

    // Get existing record
    const existing = await this.get(collection, id)
    if (!existing) {
      throw new Error(`Record with id ${id} not found in collection ${collection}`)
    }

    const updatedAt = new Date()

    // Merge with existing data
    const updated: Record = {
      ...existing,
      ...data,
      id: existing.id, // Preserve original ID
      createdAt: existing.createdAt, // Preserve original createdAt
      updatedAt,
    }

    // Store data as JSON
    const { id: _, createdAt: __, updatedAt: ___, ...jsonData } = updated

    this.db.run(`UPDATE "${tableName}" SET data = ?, updated_at = ? WHERE id = ?`, [
      JSON.stringify(jsonData),
      updatedAt.toISOString(),
      id,
    ])

    return updated
  }

  /**
   * Delete a record by ID
   */
  async delete(collection: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not connected')

    await this.ensureCollection(collection)
    const tableName = this.sanitizeTableName(collection)

    this.db.run(`DELETE FROM "${tableName}" WHERE id = ?`, [id])
  }

  /**
   * Sanitize table name to prevent SQL injection
   */
  private sanitizeTableName(name: string): string {
    // Only allow alphanumeric and underscore
    return name.replace(/[^a-zA-Z0-9_]/g, '_')
  }

  /**
   * Convert a database row to a Record
   */
  private rowToRecord(row: {
    id: string
    data: string
    created_at: string
    updated_at: string | null
  }): Record {
    const data = JSON.parse(row.data)

    // Parse dates from stored data
    const parsedData = this.parseDates(data)

    return {
      ...parsedData,
      id: row.id,
      createdAt: new Date(row.created_at),
      ...(row.updated_at && { updatedAt: new Date(row.updated_at) }),
    }
  }

  /**
   * Parse date strings in data back to Date objects
   */
  private parseDates(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'string') {
        // Check if it looks like an ISO date string
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            result[key] = date
            continue
          }
        }
      }
      result[key] = value
    }

    return result
  }
}
