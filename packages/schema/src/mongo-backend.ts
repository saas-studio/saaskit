/**
 * MongoBackend - Abstract backend interface for MongoDataStore
 *
 * Supports multiple implementations:
 * - InMemoryBackend: Fast in-memory storage for unit tests
 * - BunSQLiteBackend: Uses mongo.do LocalSQLiteBackend for persistence
 * - MiniflareBackend: Full Cloudflare Workers simulation (future)
 */

// ============================================================================
// Backend Interface
// ============================================================================

/** MongoDB-style document */
export type Document = Record<string, unknown>

/** Find query options */
export interface FindOptions {
  filter?: Document
  limit?: number
  skip?: number
  sort?: Record<string, 1 | -1>
}

/** Aggregation pipeline stage */
export type PipelineStage = Document

/** Session for transactions */
export interface MongoSession {
  startTransaction(): void
  commitTransaction(): Promise<void>
  abortTransaction(): Promise<void>
  endSession(): void
}

/**
 * Abstract backend interface for MongoDB operations
 */
export interface MongoBackend {
  /** Connect to the backend */
  connect(): Promise<void>

  /** Disconnect from the backend */
  disconnect(): Promise<void>

  /** Check if connected */
  readonly isConnected: boolean

  /** Create a collection */
  createCollection(name: string): Promise<void>

  /** List all collections */
  listCollections(): Promise<string[]>

  /** Insert a document */
  insertOne(collection: string, doc: Document): Promise<{ insertedId: string }>

  /** Find one document */
  findOne(collection: string, filter: Document): Promise<Document | null>

  /** Find multiple documents */
  find(collection: string, options?: FindOptions): Promise<Document[]>

  /** Update one document */
  updateOne(
    collection: string,
    filter: Document,
    update: Document
  ): Promise<{ modifiedCount: number }>

  /** Delete one document */
  deleteOne(collection: string, filter: Document): Promise<{ deletedCount: number }>

  /** Count documents */
  countDocuments(collection: string, filter?: Document): Promise<number>

  /** Run aggregation pipeline */
  aggregate(collection: string, pipeline: PipelineStage[]): Promise<Document[]>

  /** Start a session for transactions */
  startSession(): MongoSession

  /** Take snapshot for transaction rollback */
  takeSnapshot(): void

  /** Restore from snapshot (rollback) */
  restoreSnapshot(): void

  /** Discard snapshot (commit) */
  discardSnapshot(): void
}

// ============================================================================
// In-Memory Backend Implementation
// ============================================================================

/** Generate UUID */
function generateObjectId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** In-memory collection */
class InMemoryCollection {
  private documents: Map<string, Document> = new Map()
  private snapshot: Map<string, Document> | null = null

  takeSnapshot(): void {
    this.snapshot = new Map(
      Array.from(this.documents.entries()).map(([k, v]) => [k, { ...v }])
    )
  }

  restoreSnapshot(): void {
    if (this.snapshot) {
      this.documents = this.snapshot
      this.snapshot = null
    }
  }

  discardSnapshot(): void {
    this.snapshot = null
  }

  async insertOne(doc: Document): Promise<{ insertedId: string }> {
    const _id = (doc._id as string) || generateObjectId()
    const docWithId = { ...doc, _id }
    this.documents.set(_id, docWithId)
    return { insertedId: _id }
  }

  async findOne(filter: Document): Promise<Document | null> {
    for (const doc of this.documents.values()) {
      if (this.matchesFilter(doc, filter)) {
        return { ...doc }
      }
    }
    return null
  }

  async find(options?: FindOptions): Promise<Document[]> {
    let results: Document[] = []
    const filter = options?.filter || {}

    for (const doc of this.documents.values()) {
      if (this.matchesFilter(doc, filter)) {
        results.push({ ...doc })
      }
    }

    if (options?.sort) {
      results = this.sortDocuments(results, options.sort)
    }

    if (options?.skip && options.skip > 0) {
      results = results.slice(options.skip)
    }

    if (options?.limit && options.limit > 0) {
      results = results.slice(0, options.limit)
    }

    return results
  }

  async updateOne(
    filter: Document,
    update: Document
  ): Promise<{ modifiedCount: number }> {
    for (const [id, doc] of this.documents.entries()) {
      if (this.matchesFilter(doc, filter)) {
        if (update.$set) {
          const updatedDoc = { ...doc, ...(update.$set as Document) }
          this.documents.set(id, updatedDoc)
        } else {
          const updatedDoc = { ...doc, ...update }
          this.documents.set(id, updatedDoc)
        }
        return { modifiedCount: 1 }
      }
    }
    return { modifiedCount: 0 }
  }

  async deleteOne(filter: Document): Promise<{ deletedCount: number }> {
    for (const [id, doc] of this.documents.entries()) {
      if (this.matchesFilter(doc, filter)) {
        this.documents.delete(id)
        return { deletedCount: 1 }
      }
    }
    return { deletedCount: 0 }
  }

  async countDocuments(filter?: Document): Promise<number> {
    let count = 0
    const f = filter || {}
    for (const doc of this.documents.values()) {
      if (this.matchesFilter(doc, f)) {
        count++
      }
    }
    return count
  }

  async aggregate(pipeline: PipelineStage[]): Promise<Document[]> {
    let results: Document[] = Array.from(this.documents.values()).map((d) => ({ ...d }))

    for (const stage of pipeline) {
      results = this.applyAggregationStage(results, stage)
    }

    return results
  }

  private matchesFilter(doc: Document, filter: Document): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (key === '$and') {
        const conditions = value as Document[]
        if (!conditions.every((c) => this.matchesFilter(doc, c))) {
          return false
        }
        continue
      }

      if (key === '$or') {
        const conditions = value as Document[]
        if (!conditions.some((c) => this.matchesFilter(doc, c))) {
          return false
        }
        continue
      }

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const ops = value as Document
        const docValue = doc[key]

        for (const [op, opValue] of Object.entries(ops)) {
          switch (op) {
            case '$gt':
              if (!((docValue as number) > (opValue as number))) return false
              break
            case '$gte':
              if (!((docValue as number) >= (opValue as number))) return false
              break
            case '$lt':
              if (!((docValue as number) < (opValue as number))) return false
              break
            case '$lte':
              if (!((docValue as number) <= (opValue as number))) return false
              break
            case '$ne':
              if (docValue === opValue) return false
              break
            case '$in':
              if (!(opValue as unknown[]).includes(docValue)) return false
              break
            case '$nin':
              if ((opValue as unknown[]).includes(docValue)) return false
              break
            case '$not': {
              const notFilter = { [key]: opValue }
              if (this.matchesFilter(doc, notFilter)) return false
              break
            }
            case '$regex': {
              const pattern = opValue as string
              const options = (ops.$options as string) || ''
              const regex = new RegExp(pattern, options)
              if (!regex.test(docValue as string)) return false
              break
            }
            case '$options':
              break
            default:
              if (docValue !== opValue) return false
          }
        }
        continue
      }

      if (doc[key] !== value) {
        return false
      }
    }

    return true
  }

  private sortDocuments(docs: Document[], sort: Record<string, 1 | -1>): Document[] {
    return [...docs].sort((a, b) => {
      for (const [field, direction] of Object.entries(sort)) {
        const aVal = a[field]
        const bVal = b[field]

        if (aVal === bVal) continue
        if (aVal === null || aVal === undefined) return direction
        if (bVal === null || bVal === undefined) return -direction

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const cmp = aVal.localeCompare(bVal)
          if (cmp !== 0) return cmp * direction
        } else {
          if (aVal < bVal) return -direction
          if (aVal > bVal) return direction
        }
      }
      return 0
    })
  }

  private applyAggregationStage(docs: Document[], stage: Document): Document[] {
    const [stageName, stageValue] = Object.entries(stage)[0]

    switch (stageName) {
      case '$match':
        return docs.filter((doc) => this.matchesFilter(doc, stageValue as Document))

      case '$group': {
        const groupSpec = stageValue as Document
        const groupKey = groupSpec._id
        const accumulators = Object.entries(groupSpec).filter(([k]) => k !== '_id')

        const groups = new Map<unknown, Document[]>()
        for (const doc of docs) {
          const key = groupKey === null ? null : doc[groupKey as string]
          if (!groups.has(key)) {
            groups.set(key, [])
          }
          groups.get(key)!.push(doc)
        }

        const results: Document[] = []
        for (const [key, groupDocs] of groups.entries()) {
          const result: Document = { _id: key }

          for (const [accName, accSpec] of accumulators) {
            const spec = accSpec as Document
            const [accOp, accField] = Object.entries(spec)[0]

            switch (accOp) {
              case '$sum': {
                if (typeof accField === 'string' && accField.startsWith('$')) {
                  const fieldName = accField.slice(1)
                  result[accName] = groupDocs.reduce(
                    (sum, doc) => sum + ((doc[fieldName] as number) || 0),
                    0
                  )
                } else {
                  result[accName] = groupDocs.length * (accField as number)
                }
                break
              }
              case '$count':
                result[accName] = groupDocs.length
                break
              case '$avg': {
                if (typeof accField === 'string' && accField.startsWith('$')) {
                  const fieldName = accField.slice(1)
                  const sum = groupDocs.reduce(
                    (s, doc) => s + ((doc[fieldName] as number) || 0),
                    0
                  )
                  result[accName] = sum / groupDocs.length
                }
                break
              }
            }
          }

          results.push(result)
        }
        return results
      }

      default:
        return docs
    }
  }
}

/** In-memory session */
class InMemorySession implements MongoSession {
  private _inTransaction = false

  startTransaction(): void {
    this._inTransaction = true
  }

  async commitTransaction(): Promise<void> {
    this._inTransaction = false
  }

  async abortTransaction(): Promise<void> {
    this._inTransaction = false
  }

  endSession(): void {
    // No-op
  }
}

/**
 * In-memory backend for fast unit testing
 */
export class InMemoryBackend implements MongoBackend {
  private collections: Map<string, InMemoryCollection> = new Map()
  private registeredCollections: Set<string> = new Set()
  private _isConnected = false

  get isConnected(): boolean {
    return this._isConnected
  }

  async connect(): Promise<void> {
    this._isConnected = true
  }

  async disconnect(): Promise<void> {
    this._isConnected = false
    this.collections.clear()
    this.registeredCollections.clear()
  }

  async createCollection(name: string): Promise<void> {
    this.registeredCollections.add(name)
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryCollection())
    }
  }

  async listCollections(): Promise<string[]> {
    return Array.from(this.registeredCollections)
  }

  private getCollection(name: string): InMemoryCollection {
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryCollection())
    }
    return this.collections.get(name)!
  }

  async insertOne(collection: string, doc: Document): Promise<{ insertedId: string }> {
    return this.getCollection(collection).insertOne(doc)
  }

  async findOne(collection: string, filter: Document): Promise<Document | null> {
    return this.getCollection(collection).findOne(filter)
  }

  async find(collection: string, options?: FindOptions): Promise<Document[]> {
    return this.getCollection(collection).find(options)
  }

  async updateOne(
    collection: string,
    filter: Document,
    update: Document
  ): Promise<{ modifiedCount: number }> {
    return this.getCollection(collection).updateOne(filter, update)
  }

  async deleteOne(collection: string, filter: Document): Promise<{ deletedCount: number }> {
    return this.getCollection(collection).deleteOne(filter)
  }

  async countDocuments(collection: string, filter?: Document): Promise<number> {
    return this.getCollection(collection).countDocuments(filter)
  }

  async aggregate(collection: string, pipeline: PipelineStage[]): Promise<Document[]> {
    return this.getCollection(collection).aggregate(pipeline)
  }

  startSession(): MongoSession {
    return new InMemorySession()
  }

  takeSnapshot(): void {
    for (const col of this.collections.values()) {
      col.takeSnapshot()
    }
  }

  restoreSnapshot(): void {
    for (const col of this.collections.values()) {
      col.restoreSnapshot()
    }
  }

  discardSnapshot(): void {
    for (const col of this.collections.values()) {
      col.discardSnapshot()
    }
  }
}

// ============================================================================
// Backend Factory
// ============================================================================

/** Backend type selection */
export type BackendType = 'memory' | 'bun-sqlite' | 'miniflare'

/** Backend configuration */
export interface BackendConfig {
  type?: BackendType
  /** Data directory for SQLite persistence */
  dataDir?: string
  /** Database name */
  database?: string
}

/**
 * Create a backend instance based on configuration
 */
export async function createBackend(config: BackendConfig = {}): Promise<MongoBackend> {
  const type = config.type || 'memory'

  switch (type) {
    case 'memory':
      return new InMemoryBackend()

    case 'bun-sqlite': {
      // Dynamically import to avoid bundling issues
      try {
        const { BunSQLiteBackend } = await import('./backends/bun-sqlite')
        return new BunSQLiteBackend(config.dataDir || './.mongo-data', config.database || 'test')
      } catch (e) {
        console.warn('BunSQLiteBackend not available, falling back to in-memory')
        return new InMemoryBackend()
      }
    }

    case 'miniflare': {
      // Future: Miniflare backend
      console.warn('MiniflareBackend not yet implemented, falling back to in-memory')
      return new InMemoryBackend()
    }

    default:
      return new InMemoryBackend()
  }
}
