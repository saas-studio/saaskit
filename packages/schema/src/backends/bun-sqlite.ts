/**
 * BunSQLiteBackend - Uses mongo.do's LocalSQLiteBackend for persistent storage
 *
 * This backend provides:
 * - Real MongoDB-compatible operations via mongo.do
 * - SQLite persistence (survives between test runs)
 * - Same code path as production (catches real bugs)
 * - Can stream to cloud/ClickHouse in the future
 *
 * Requires Bun runtime (uses bun:sqlite under the hood)
 */

import type {
  MongoBackend,
  MongoSession,
  Document,
  FindOptions,
  PipelineStage,
} from '../mongo-backend'

// We'll lazy-load the mongo.do backend to avoid import issues in non-Bun environments

/** Session wrapper for Bun SQLite backend */
class BunSQLiteSession implements MongoSession {
  startTransaction(): void {
    // SQLite transactions are handled at the backend level
  }

  async commitTransaction(): Promise<void> {
    // No-op - mongo.do handles this
  }

  async abortTransaction(): Promise<void> {
    // No-op - mongo.do handles this
  }

  endSession(): void {
    // No-op
  }
}

/**
 * Backend that uses mongo.do's LocalSQLiteBackend
 *
 * This provides real MongoDB-compatible storage with SQLite persistence.
 */
export class BunSQLiteBackend implements MongoBackend {
  private backend: any = null
  private _isConnected = false
  private dataDir: string
  private database: string
  private collections: Set<string> = new Set()

  // Snapshot support (for transaction rollback simulation)
  private snapshots: Map<string, Document[]> = new Map()

  constructor(dataDir: string = './.mongo-data', database: string = 'test') {
    this.dataDir = dataDir
    this.database = database
  }

  get isConnected(): boolean {
    return this._isConnected
  }

  async connect(): Promise<void> {
    if (this._isConnected) return

    try {
      // Dynamically import mongo.do's LocalSQLiteBackend
      // This requires Bun runtime
      // @ts-expect-error - Module path only available at runtime in Bun
      const { LocalSQLiteBackend } = await import('mongo.do/src/wire/backend/local-sqlite')
      this.backend = new LocalSQLiteBackend(this.dataDir)
      this._isConnected = true
    } catch (e) {
      throw new Error(
        `Failed to load BunSQLiteBackend: ${e instanceof Error ? e.message : String(e)}. ` +
          'Make sure you are running in Bun and mongo.do is installed.'
      )
    }
  }

  async disconnect(): Promise<void> {
    if (!this._isConnected) return
    // LocalSQLiteBackend doesn't have a close method, but we can clear state
    this.backend = null
    this._isConnected = false
    this.collections.clear()
  }

  async createCollection(name: string): Promise<void> {
    this.ensureConnected()
    this.collections.add(name)
    // LocalSQLiteBackend creates collections lazily on first write
  }

  async listCollections(): Promise<string[]> {
    this.ensureConnected()
    try {
      const result = await this.backend.listCollections(this.database)
      return result.collections.map((c: { name: string }) => c.name)
    } catch {
      // Fallback to tracked collections if backend doesn't support listing
      return Array.from(this.collections)
    }
  }

  async insertOne(collection: string, doc: Document): Promise<{ insertedId: string }> {
    this.ensureConnected()
    this.collections.add(collection)

    const result = await this.backend.insert(this.database, collection, {
      documents: [doc],
    })

    return {
      insertedId: result.insertedIds?.[0]?.toString() || doc._id?.toString() || '',
    }
  }

  async findOne(collection: string, filter: Document): Promise<Document | null> {
    this.ensureConnected()

    const result = await this.backend.find(this.database, collection, {
      filter,
      limit: 1,
    })

    return result.documents?.[0] || null
  }

  async find(collection: string, options?: FindOptions): Promise<Document[]> {
    this.ensureConnected()

    const result = await this.backend.find(this.database, collection, {
      filter: options?.filter || {},
      limit: options?.limit,
      skip: options?.skip,
      sort: options?.sort,
    })

    return result.documents || []
  }

  async updateOne(
    collection: string,
    filter: Document,
    update: Document
  ): Promise<{ modifiedCount: number }> {
    this.ensureConnected()

    const result = await this.backend.update(this.database, collection, {
      filter,
      update,
      multi: false,
    })

    return {
      modifiedCount: result.modifiedCount || 0,
    }
  }

  async deleteOne(collection: string, filter: Document): Promise<{ deletedCount: number }> {
    this.ensureConnected()

    const result = await this.backend.delete(this.database, collection, {
      filter,
      limit: 1,
    })

    return {
      deletedCount: result.deletedCount || 0,
    }
  }

  async countDocuments(collection: string, filter?: Document): Promise<number> {
    this.ensureConnected()

    const result = await this.backend.find(this.database, collection, {
      filter: filter || {},
    })

    return result.documents?.length || 0
  }

  async aggregate(collection: string, pipeline: PipelineStage[]): Promise<Document[]> {
    this.ensureConnected()

    const result = await this.backend.aggregate(this.database, collection, {
      pipeline,
    })

    return result.documents || []
  }

  startSession(): MongoSession {
    return new BunSQLiteSession()
  }

  // Snapshot support for transaction simulation
  // Note: Real SQLite transactions would be better, but this works for testing

  async takeSnapshot(): Promise<void> {
    this.ensureConnected()
    this.snapshots.clear()

    for (const collection of this.collections) {
      const result = await this.backend.find(this.database, collection, {})
      this.snapshots.set(collection, result.documents || [])
    }
  }

  async restoreSnapshot(): Promise<void> {
    this.ensureConnected()

    for (const [collection, docs] of this.snapshots) {
      // Delete all current documents
      await this.backend.delete(this.database, collection, {
        filter: {},
        limit: 0, // 0 = no limit = delete all
      })

      // Re-insert snapshot documents
      if (docs.length > 0) {
        await this.backend.insert(this.database, collection, {
          documents: docs,
        })
      }
    }

    this.snapshots.clear()
  }

  discardSnapshot(): void {
    this.snapshots.clear()
  }

  private ensureConnected(): void {
    if (!this._isConnected || !this.backend) {
      throw new Error('BunSQLiteBackend is not connected. Call connect() first.')
    }
  }
}
