/**
 * Mock DurableObjectState for testing @dotdo/do integration
 *
 * This mock simulates the Cloudflare Workers Durable Objects API
 * with an in-memory SQLite-like storage backend.
 */

// Simple in-memory storage for the mock
interface MockStorage {
  data: Map<string, unknown>
  tables: Map<string, Map<string, Record<string, unknown>>>
}

/**
 * Mock SQL execution result
 */
export interface MockSqlResult {
  results: Record<string, unknown>[]
  changes: number
  lastInsertRowId: number
}

/**
 * Mock SQLite cursor for iteration
 */
export class MockSqlCursor {
  private results: Record<string, unknown>[]
  private index = 0

  constructor(results: Record<string, unknown>[]) {
    this.results = results
  }

  next(): { value: Record<string, unknown> | undefined; done: boolean } {
    if (this.index >= this.results.length) {
      return { value: undefined, done: true }
    }
    return { value: this.results[this.index++], done: false }
  }

  toArray(): Record<string, unknown>[] {
    return this.results
  }

  one(): Record<string, unknown> | undefined {
    return this.results[0]
  }

  [Symbol.iterator](): Iterator<Record<string, unknown>> {
    return {
      next: () => this.next()
    }
  }
}

/**
 * Mock SQL interface matching Cloudflare D1/SQLite API
 * Handles the DO class's SQL queries for documents table
 */
export class MockSql {
  private storage: MockStorage

  constructor(storage: MockStorage) {
    this.storage = storage
  }

  /**
   * Execute a SQL statement
   */
  exec(query: string, ...bindings: unknown[]): MockSqlCursor {
    // Simple query parsing for basic operations
    const queryLower = query.toLowerCase().trim()

    // Handle CREATE TABLE - just return empty
    if (queryLower.startsWith('create table') || queryLower.startsWith('create index')) {
      return new MockSqlCursor([])
    }

    // Handle INSERT INTO documents (collection, id, data) VALUES (?, ?, ?)
    if (queryLower.includes('insert into documents')) {
      const tableName = 'documents'
      if (!this.storage.tables.has(tableName)) {
        this.storage.tables.set(tableName, new Map())
      }
      const table = this.storage.tables.get(tableName)!

      // bindings: [collection, id, data]
      const collection = bindings[0] as string
      const id = bindings[1] as string
      const data = bindings[2] as string

      const record: Record<string, unknown> = {
        collection,
        id,
        data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Use composite key: collection:id
      table.set(`${collection}:${id}`, record)
      return new MockSqlCursor([record])
    }

    // Handle other INSERT INTO statements
    if (queryLower.startsWith('insert into')) {
      const tableMatch = query.match(/insert into\s+(\w+)/i)
      if (tableMatch) {
        const tableName = tableMatch[1]
        if (!this.storage.tables.has(tableName)) {
          this.storage.tables.set(tableName, new Map())
        }
        const table = this.storage.tables.get(tableName)!
        const id = bindings[0] as string || crypto.randomUUID()
        const record: Record<string, unknown> = { id }
        table.set(id, record)
        return new MockSqlCursor([record])
      }
    }

    // Handle SELECT data FROM documents WHERE collection = ? AND id = ?
    if (queryLower.includes('select') && queryLower.includes('from documents') && queryLower.includes('where collection = ?')) {
      const tableName = 'documents'
      const table = this.storage.tables.get(tableName)

      if (table) {
        const collection = bindings[0] as string

        // Check if querying by id
        if (queryLower.includes('and id = ?')) {
          const id = bindings[1] as string
          const record = table.get(`${collection}:${id}`)
          if (record) {
            return new MockSqlCursor([record])
          }
          return new MockSqlCursor([])
        }

        // Otherwise, list all in collection with pagination
        const results: Record<string, unknown>[] = []
        for (const [key, record] of table.entries()) {
          if (key.startsWith(`${collection}:`)) {
            results.push(record)
          }
        }

        // Handle LIMIT and OFFSET
        let limit = 100
        let offset = 0
        if (queryLower.includes('limit ?')) {
          const limitBindingIndex = queryLower.includes('offset ?') ? bindings.length - 2 : bindings.length - 1
          limit = bindings[limitBindingIndex] as number || 100
        }
        if (queryLower.includes('offset ?')) {
          offset = bindings[bindings.length - 1] as number || 0
        }

        return new MockSqlCursor(results.slice(offset, offset + limit))
      }
      return new MockSqlCursor([])
    }

    // Handle generic SELECT
    if (queryLower.startsWith('select')) {
      const tableMatch = query.match(/from\s+(\w+)/i)
      if (tableMatch) {
        const tableName = tableMatch[1]
        const table = this.storage.tables.get(tableName)
        if (table) {
          return new MockSqlCursor(Array.from(table.values()))
        }
      }
      return new MockSqlCursor([])
    }

    // Handle UPDATE documents SET data = ?, updated_at = ... WHERE collection = ? AND id = ?
    if (queryLower.includes('update documents')) {
      const tableName = 'documents'
      const table = this.storage.tables.get(tableName)
      if (table) {
        // Parse bindings - format varies but typically [data, ..., collection, id]
        // For: UPDATE documents SET data = ?, updated_at = ... WHERE collection = ? AND id = ?
        // bindings: [data, collection, id]
        const data = bindings[0] as string
        const collection = bindings[1] as string
        const id = bindings[2] as string

        const key = `${collection}:${id}`
        const existing = table.get(key)
        if (existing) {
          existing.data = data
          existing.updated_at = new Date().toISOString()
          return new MockSqlCursor([existing])
        }
      }
      return new MockSqlCursor([])
    }

    // Handle generic UPDATE
    if (queryLower.startsWith('update')) {
      const tableMatch = query.match(/update\s+(\w+)/i)
      if (tableMatch) {
        return new MockSqlCursor([])
      }
    }

    // Handle DELETE FROM documents WHERE collection = ? AND id = ?
    if (queryLower.includes('delete from documents')) {
      const tableName = 'documents'
      const table = this.storage.tables.get(tableName)
      if (table) {
        const collection = bindings[0] as string
        const id = bindings[1] as string
        table.delete(`${collection}:${id}`)
      }
      return new MockSqlCursor([])
    }

    // Handle generic DELETE
    if (queryLower.startsWith('delete')) {
      const tableMatch = query.match(/delete from\s+(\w+)/i)
      if (tableMatch) {
        const tableName = tableMatch[1]
        const table = this.storage.tables.get(tableName)
        if (table) {
          return new MockSqlCursor([])
        }
      }
    }

    return new MockSqlCursor([])
  }
}

/**
 * Mock DurableObjectStorage interface
 */
export interface MockDurableObjectStorage {
  sql: MockSql
  get<T = unknown>(key: string): Promise<T | undefined>
  get<T = unknown>(keys: string[]): Promise<Map<string, T>>
  put<T>(key: string, value: T): Promise<void>
  put<T>(entries: Record<string, T>): Promise<void>
  delete(key: string): Promise<boolean>
  delete(keys: string[]): Promise<number>
  deleteAll(): Promise<void>
  list<T = unknown>(options?: { prefix?: string; limit?: number }): Promise<Map<string, T>>
  transaction<T>(closure: (txn: MockDurableObjectStorage) => T | Promise<T>): Promise<T>
}

/**
 * Mock DurableObjectState interface
 * Matches Cloudflare Workers DurableObjectState
 */
export interface MockDurableObjectState {
  storage: MockDurableObjectStorage
  id: { toString(): string; name?: string }
  acceptWebSocket(ws: unknown, tags?: string[]): void
  getWebSockets(tag?: string): unknown[]
  setWebSocketAutoResponse(maybeReqResp?: unknown): void
  getWebSocketAutoResponse(): unknown | null
  getWebSocketAutoResponseTimestamp(): Date | null
  blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>
  waitUntil(promise: Promise<unknown>): void
}

/**
 * Create a mock DurableObjectState for testing
 *
 * @param options - Optional configuration
 * @returns A mock DurableObjectState instance
 */
export function createMockDurableObjectState(options?: {
  id?: string
  name?: string
}): MockDurableObjectState {
  const storage: MockStorage = {
    data: new Map(),
    tables: new Map()
  }

  const mockStorage: MockDurableObjectStorage = {
    sql: new MockSql(storage),

    async get<T = unknown>(keyOrKeys: string | string[]): Promise<T | undefined | Map<string, T>> {
      if (Array.isArray(keyOrKeys)) {
        const result = new Map<string, T>()
        for (const key of keyOrKeys) {
          const value = storage.data.get(key) as T | undefined
          if (value !== undefined) {
            result.set(key, value)
          }
        }
        return result
      }
      return storage.data.get(keyOrKeys) as T | undefined
    },

    async put<T>(keyOrEntries: string | Record<string, T>, value?: T): Promise<void> {
      if (typeof keyOrEntries === 'string') {
        storage.data.set(keyOrEntries, value)
      } else {
        for (const [k, v] of Object.entries(keyOrEntries)) {
          storage.data.set(k, v)
        }
      }
    },

    async delete(keyOrKeys: string | string[]): Promise<boolean | number> {
      if (Array.isArray(keyOrKeys)) {
        let count = 0
        for (const key of keyOrKeys) {
          if (storage.data.delete(key)) {
            count++
          }
        }
        return count
      }
      return storage.data.delete(keyOrKeys)
    },

    async deleteAll(): Promise<void> {
      storage.data.clear()
      storage.tables.clear()
    },

    async list<T = unknown>(options?: { prefix?: string; limit?: number }): Promise<Map<string, T>> {
      const result = new Map<string, T>()
      let count = 0
      for (const [key, value] of storage.data.entries()) {
        if (options?.prefix && !key.startsWith(options.prefix)) {
          continue
        }
        if (options?.limit && count >= options.limit) {
          break
        }
        result.set(key, value as T)
        count++
      }
      return result
    },

    async transaction<T>(closure: (txn: MockDurableObjectStorage) => T | Promise<T>): Promise<T> {
      // Simple mock - just execute the closure without real transaction semantics
      return closure(mockStorage)
    }
  }

  const webSockets: unknown[] = []

  return {
    storage: mockStorage,
    id: {
      toString: () => options?.id || 'mock-do-id',
      name: options?.name
    },
    acceptWebSocket(ws: unknown, _tags?: string[]): void {
      webSockets.push(ws)
    },
    getWebSockets(_tag?: string): unknown[] {
      return webSockets
    },
    setWebSocketAutoResponse(_maybeReqResp?: unknown): void {
      // No-op for mock
    },
    getWebSocketAutoResponse(): unknown | null {
      return null
    },
    getWebSocketAutoResponseTimestamp(): Date | null {
      return null
    },
    async blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T> {
      return callback()
    },
    waitUntil(_promise: Promise<unknown>): void {
      // No-op for mock
    }
  }
}

/**
 * Create a mock Env object for DO instantiation
 */
export function createMockEnv(bindings?: Record<string, unknown>): Record<string, unknown> {
  return {
    ...bindings
  }
}
