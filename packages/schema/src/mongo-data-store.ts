/**
 * MongoDataStore - MongoDB-backed data store for SaaSKit
 *
 * Wraps mongo.do to provide schema-driven data operations with
 * validation, auto-generated fields, and relation handling.
 *
 * For testing, uses an in-memory implementation that mimics MongoDB.
 */

import type { SaaSSchema, Resource, Field, Relation } from './types'

// ============================================================================
// In-Memory MongoDB Implementation (for testing)
// ============================================================================

/** Simple ObjectId-like string generator */
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

/** In-memory collection that mimics MongoDB Collection */
class InMemoryCollection {
  private documents: Map<string, Record<string, unknown>> = new Map()
  private snapshot: Map<string, Record<string, unknown>> | null = null

  /** Take a snapshot for transaction support */
  takeSnapshot(): void {
    this.snapshot = new Map(
      Array.from(this.documents.entries()).map(([k, v]) => [k, { ...v }])
    )
  }

  /** Restore from snapshot (rollback) */
  restoreSnapshot(): void {
    if (this.snapshot) {
      this.documents = this.snapshot
      this.snapshot = null
    }
  }

  /** Discard snapshot (commit) */
  discardSnapshot(): void {
    this.snapshot = null
  }

  async insertOne(
    doc: Record<string, unknown>,
    _options?: unknown
  ): Promise<{ acknowledged: boolean; insertedId: string }> {
    const _id = (doc._id as string) || generateObjectId()
    const docWithId = { ...doc, _id }
    this.documents.set(_id, docWithId)
    return { acknowledged: true, insertedId: _id }
  }

  async findOne(
    filter: Record<string, unknown>,
    _options?: unknown
  ): Promise<Record<string, unknown> | null> {
    for (const doc of this.documents.values()) {
      if (this.matchesFilter(doc, filter)) {
        return { ...doc }
      }
    }
    return null
  }

  find(
    filter: Record<string, unknown>,
    options?: { limit?: number; skip?: number; sort?: Record<string, 1 | -1> }
  ): { toArray: () => Promise<Record<string, unknown>[]> } {
    return {
      toArray: async () => {
        let results: Record<string, unknown>[] = []

        for (const doc of this.documents.values()) {
          if (this.matchesFilter(doc, filter)) {
            results.push({ ...doc })
          }
        }

        // Apply sort
        if (options?.sort) {
          results = this.sortDocuments(results, options.sort)
        }

        // Apply skip
        if (options?.skip && options.skip > 0) {
          results = results.slice(options.skip)
        }

        // Apply limit
        if (options?.limit && options.limit > 0) {
          results = results.slice(0, options.limit)
        }

        return results
      },
    }
  }

  async updateOne(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    _options?: unknown
  ): Promise<{ acknowledged: boolean; modifiedCount: number }> {
    for (const [id, doc] of this.documents.entries()) {
      if (this.matchesFilter(doc, filter)) {
        // Handle $set operator
        if (update.$set) {
          const updatedDoc = { ...doc, ...(update.$set as Record<string, unknown>) }
          this.documents.set(id, updatedDoc)
          return { acknowledged: true, modifiedCount: 1 }
        }
        // Direct update
        const updatedDoc = { ...doc, ...update }
        this.documents.set(id, updatedDoc)
        return { acknowledged: true, modifiedCount: 1 }
      }
    }
    return { acknowledged: true, modifiedCount: 0 }
  }

  async deleteOne(
    filter: Record<string, unknown>,
    _options?: unknown
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    for (const [id, doc] of this.documents.entries()) {
      if (this.matchesFilter(doc, filter)) {
        this.documents.delete(id)
        return { acknowledged: true, deletedCount: 1 }
      }
    }
    return { acknowledged: true, deletedCount: 0 }
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    let count = 0
    for (const doc of this.documents.values()) {
      if (this.matchesFilter(doc, filter)) {
        count++
      }
    }
    return count
  }

  aggregate(
    pipeline: Record<string, unknown>[]
  ): { toArray: () => Promise<Record<string, unknown>[]> } {
    return {
      toArray: async () => {
        let results: Record<string, unknown>[] = Array.from(this.documents.values()).map((d) => ({
          ...d,
        }))

        for (const stage of pipeline) {
          results = this.applyAggregationStage(results, stage)
        }

        return results
      },
    }
  }

  private matchesFilter(doc: Record<string, unknown>, filter: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(filter)) {
      // Handle logical operators
      if (key === '$and') {
        const conditions = value as Record<string, unknown>[]
        if (!conditions.every((c) => this.matchesFilter(doc, c))) {
          return false
        }
        continue
      }

      if (key === '$or') {
        const conditions = value as Record<string, unknown>[]
        if (!conditions.some((c) => this.matchesFilter(doc, c))) {
          return false
        }
        continue
      }

      // Handle field-level operators
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const ops = value as Record<string, unknown>
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
              // Handled with $regex
              break
            default:
              // Unknown operator, treat as nested object match
              if (docValue !== opValue) return false
          }
        }
        continue
      }

      // Simple equality
      if (doc[key] !== value) {
        return false
      }
    }

    return true
  }

  private sortDocuments(
    docs: Record<string, unknown>[],
    sort: Record<string, 1 | -1>
  ): Record<string, unknown>[] {
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

  private applyAggregationStage(
    docs: Record<string, unknown>[],
    stage: Record<string, unknown>
  ): Record<string, unknown>[] {
    const [stageName, stageValue] = Object.entries(stage)[0]

    switch (stageName) {
      case '$match':
        return docs.filter((doc) => this.matchesFilter(doc, stageValue as Record<string, unknown>))

      case '$group': {
        const groupSpec = stageValue as Record<string, unknown>
        const groupKey = groupSpec._id
        const accumulators = Object.entries(groupSpec).filter(([k]) => k !== '_id')

        // Group documents
        const groups = new Map<unknown, Record<string, unknown>[]>()
        for (const doc of docs) {
          const key = groupKey === null ? null : doc[groupKey as string]
          if (!groups.has(key)) {
            groups.set(key, [])
          }
          groups.get(key)!.push(doc)
        }

        // Apply accumulators
        const results: Record<string, unknown>[] = []
        for (const [key, groupDocs] of groups.entries()) {
          const result: Record<string, unknown> = { _id: key }

          for (const [accName, accSpec] of accumulators) {
            const spec = accSpec as Record<string, unknown>
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

/** In-memory database that mimics MongoDB Database */
class InMemoryDatabase {
  private collections: Map<string, InMemoryCollection> = new Map()
  private registeredCollections: Set<string> = new Set()

  collection(name: string): InMemoryCollection {
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryCollection())
    }
    return this.collections.get(name)!
  }

  async createCollection(name: string): Promise<InMemoryCollection> {
    this.registeredCollections.add(name)
    return this.collection(name)
  }

  listCollections(): { toArray: () => Promise<{ name: string }[]> } {
    return {
      toArray: async () => {
        return Array.from(this.registeredCollections).map((name) => ({ name }))
      },
    }
  }

  /** Take snapshots of all collections for transaction support */
  takeSnapshot(): void {
    for (const collection of this.collections.values()) {
      collection.takeSnapshot()
    }
  }

  /** Restore all collections from snapshots (rollback) */
  restoreSnapshot(): void {
    for (const collection of this.collections.values()) {
      collection.restoreSnapshot()
    }
  }

  /** Discard all collection snapshots (commit) */
  discardSnapshot(): void {
    for (const collection of this.collections.values()) {
      collection.discardSnapshot()
    }
  }
}

/** In-memory client that mimics MongoDB Client */
class InMemoryClient {
  private _isConnected = false
  private databases: Map<string, InMemoryDatabase> = new Map()
  private _defaultDatabase: string

  constructor(uri: string) {
    // Parse database from URI
    const match = uri.match(/\/([^/?]+)(?:\?|$)/)
    this._defaultDatabase = match?.[1] || 'test'
  }

  get isConnected(): boolean {
    return this._isConnected
  }

  async connect(): Promise<this> {
    this._isConnected = true
    return this
  }

  async close(): Promise<void> {
    this._isConnected = false
    this.databases.clear()
  }

  db(name?: string): InMemoryDatabase {
    const dbName = name || this._defaultDatabase
    if (!this.databases.has(dbName)) {
      this.databases.set(dbName, new InMemoryDatabase())
    }
    return this.databases.get(dbName)!
  }

  startSession(): InMemorySession {
    return new InMemorySession()
  }
}

/** In-memory session for transactions */
class InMemorySession {
  private _inTransaction = false
  private _aborted = false

  startTransaction(): void {
    this._inTransaction = true
    this._aborted = false
  }

  async commitTransaction(): Promise<void> {
    this._inTransaction = false
  }

  async abortTransaction(): Promise<void> {
    this._inTransaction = false
    this._aborted = true
  }

  endSession(): void {
    // No-op for in-memory
  }

  get inTransaction(): boolean {
    return this._inTransaction
  }
}

// ============================================================================
// Types
// ============================================================================

/** Configuration options for MongoDataStore */
export interface MongoDataStoreOptions {
  /** MongoDB connection URI */
  uri?: string
  /** Database name */
  database: string
  /** Use in-memory mode for testing */
  inMemory?: boolean
}

/** Options for findAll query */
export interface MongoFindAllOptions {
  /** Filter conditions (MongoDB-style) */
  where?: Record<string, unknown>
  /** Sort order */
  orderBy?: Record<string, 'asc' | 'desc'>
  /** Maximum number of records to return */
  limit?: number
  /** Number of records to skip */
  offset?: number
  /** Relations to include (eager load) */
  include?: string[]
}

/** Session options for transactional operations */
export interface SessionOptions {
  session?: InMemorySession
}

// ============================================================================
// MongoDataStore Implementation
// ============================================================================

/**
 * MongoDB-backed data store with schema validation
 */
export class MongoDataStore {
  /** The schema this store operates on */
  public readonly schema: SaaSSchema

  /** Store configuration */
  private readonly options: MongoDataStoreOptions

  /** MongoDB client (in-memory for testing) */
  private client: InMemoryClient | null = null

  /** MongoDB database */
  private db: InMemoryDatabase | null = null

  /** Resource lookup cache */
  private resourceMap: Map<string, Resource>

  /** Relation lookup cache: resourceName -> relationName -> Relation */
  private relationMap: Map<string, Map<string, Relation>>

  /** Inverse relation lookup: resourceName -> inverseName -> { sourceResource, sourceRelation } */
  private inverseRelationMap: Map<
    string,
    Map<string, { sourceResource: string; sourceRelation: Relation }>
  >

  constructor(schema: SaaSSchema, options: MongoDataStoreOptions) {
    this.schema = schema
    this.options = options
    this.resourceMap = new Map()
    this.relationMap = new Map()
    this.inverseRelationMap = new Map()

    // Build resource and relation lookups
    for (const resource of schema.resources) {
      this.resourceMap.set(resource.name, resource)

      const relations = new Map<string, Relation>()
      for (const relation of resource.relations) {
        relations.set(relation.name, relation)
      }
      this.relationMap.set(resource.name, relations)
    }

    // Build inverse relation lookup
    this.buildInverseRelationMap()
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  /** Check if connected */
  get isConnected(): boolean {
    return this.client?.isConnected ?? false
  }

  /** Connect to the database */
  async connect(): Promise<void> {
    if (this.client) {
      return
    }

    const uri = this.options.inMemory
      ? `mongodo://localhost:27017/${this.options.database}`
      : this.options.uri || `mongodo://localhost:27017/${this.options.database}`

    this.client = new InMemoryClient(uri)
    await this.client.connect()
    this.db = this.client.db(this.options.database)

    // Ensure collections exist for all resources
    for (const resource of this.schema.resources) {
      await this.db.createCollection(resource.name)
    }
  }

  /** Disconnect from the database */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }

  /** List all collections */
  async listCollections(): Promise<string[]> {
    if (!this.db) {
      throw new Error('Not connected')
    }
    const collections = await this.db.listCollections().toArray()
    return collections.map((c) => c.name)
  }

  // ============================================================================
  // Schema Access
  // ============================================================================

  /** Get list of resource names */
  getResources(): string[] {
    return Array.from(this.resourceMap.keys())
  }

  /** Get a resource by name */
  getResource(resourceName: string): Resource | undefined {
    return this.resourceMap.get(resourceName)
  }

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /** Create a new record */
  async create(
    resourceName: string,
    data: Record<string, unknown>,
    _options?: SessionOptions
  ): Promise<Record<string, unknown>> {
    const resource = this.getResourceOrThrow(resourceName)
    const collection = this.getCollection(resourceName)

    // Validate required fields
    this.validateRequiredFields(resource, data)

    // Build the document with auto-generated fields
    const doc = this.buildDocument(resource, data)

    // Validate enum fields
    for (const field of resource.fields) {
      if (field.name in doc) {
        this.validateEnumValue(field, doc[field.name], resourceName)
      }
    }

    // Insert into collection
    const result = await collection.insertOne(doc)
    doc._id = result.insertedId

    return this.formatDocument(doc)
  }

  /** Find a record by ID */
  async findById(
    resourceName: string,
    id: string,
    _options?: SessionOptions
  ): Promise<Record<string, unknown> | null> {
    this.getResourceOrThrow(resourceName)
    const collection = this.getCollection(resourceName)

    const doc = await collection.findOne({ _id: id })
    return doc ? this.formatDocument(doc) : null
  }

  /** Find all records matching criteria */
  async findAll(
    resourceName: string,
    options?: MongoFindAllOptions
  ): Promise<Record<string, unknown>[]> {
    this.getResourceOrThrow(resourceName)
    const collection = this.getCollection(resourceName)

    // Build MongoDB query
    const filter = options?.where || {}

    // Build options
    const findOptions: { limit?: number; skip?: number; sort?: Record<string, 1 | -1> } = {}
    if (options?.limit) {
      findOptions.limit = options.limit
    }
    if (options?.offset) {
      findOptions.skip = options.offset
    }
    if (options?.orderBy) {
      findOptions.sort = this.buildSort(options.orderBy)
    }

    // Execute query
    let docs = await collection.find(filter, findOptions).toArray()

    // Handle includes (eager loading)
    if (options?.include && options.include.length > 0) {
      docs = await Promise.all(
        docs.map(async (doc) => this.populateRelations(resourceName, doc, options.include!))
      )
    }

    return docs.map((doc) => this.formatDocument(doc))
  }

  /** Update a record by ID */
  async update(
    resourceName: string,
    id: string,
    data: Record<string, unknown>,
    _options?: SessionOptions
  ): Promise<Record<string, unknown>> {
    const resource = this.getResourceOrThrow(resourceName)
    const collection = this.getCollection(resourceName)

    // Check if record exists
    const existing = await collection.findOne({ _id: id })
    if (!existing) {
      throw new Error(`Record with id "${id}" not found in resource "${resourceName}"`)
    }

    // Build update document
    const updateData: Record<string, unknown> = { ...data }

    // Don't update _id or createdAt
    delete updateData._id
    delete updateData.createdAt
    delete updateData.created_at

    // Validate enum fields
    for (const field of resource.fields) {
      if (field.name in updateData) {
        this.validateEnumValue(field, updateData[field.name], resourceName)
      }
    }

    // Auto-update updatedAt
    const updatedAtField = resource.fields.find(
      (f) => f.name === 'updatedAt' || f.name === 'updated_at'
    )
    if (updatedAtField) {
      updateData[updatedAtField.name] = new Date().toISOString()
    }

    // Update in collection
    await collection.updateOne({ _id: id }, { $set: updateData })

    // Return updated document
    const updated = await collection.findOne({ _id: id })
    return this.formatDocument(updated!)
  }

  /** Delete a record by ID */
  async delete(
    resourceName: string,
    id: string,
    _options?: SessionOptions
  ): Promise<boolean> {
    this.getResourceOrThrow(resourceName)
    const collection = this.getCollection(resourceName)

    const result = await collection.deleteOne({ _id: id })
    return result.deletedCount > 0
  }

  // ============================================================================
  // Relations
  // ============================================================================

  /** Get related records for a relation */
  async getRelated(
    resourceName: string,
    id: string,
    relationName: string
  ): Promise<Record<string, unknown> | Record<string, unknown>[] | null> {
    this.getResourceOrThrow(resourceName)
    const record = await this.findById(resourceName, id)

    if (!record) {
      return null
    }

    // Check for direct relation (belongsTo)
    const relations = this.relationMap.get(resourceName)
    const directRelation = relations?.get(relationName)

    if (directRelation && directRelation.cardinality === 'one') {
      // belongsTo relation
      const fkField = this.getForeignKeyField(directRelation)
      const foreignKey = record[fkField] as string | null

      if (!foreignKey) {
        return null
      }

      return this.findById(directRelation.to, foreignKey)
    }

    // Check for inverse relation (hasMany)
    const inverseRelations = this.inverseRelationMap.get(resourceName)
    const inverseInfo = inverseRelations?.get(relationName)

    if (inverseInfo) {
      const { sourceResource, sourceRelation } = inverseInfo
      const fkField = this.getForeignKeyField(sourceRelation)

      return this.findAll(sourceResource, {
        where: { [fkField]: id },
      })
    }

    throw new Error(`Relation "${relationName}" not found on resource "${resourceName}"`)
  }

  // ============================================================================
  // Aggregations
  // ============================================================================

  /** Count records */
  async count(
    resourceName: string,
    options?: { where?: Record<string, unknown> }
  ): Promise<number> {
    this.getResourceOrThrow(resourceName)
    const collection = this.getCollection(resourceName)

    const filter = options?.where || {}
    return collection.countDocuments(filter)
  }

  /** Run aggregation pipeline */
  async aggregate(
    resourceName: string,
    pipeline: Record<string, unknown>[]
  ): Promise<Record<string, unknown>[]> {
    this.getResourceOrThrow(resourceName)
    const collection = this.getCollection(resourceName)

    return collection.aggregate(pipeline).toArray()
  }

  // ============================================================================
  // Transactions
  // ============================================================================

  /** Execute operations within a transaction */
  async withTransaction<T>(fn: (session: InMemorySession) => Promise<T>): Promise<T> {
    if (!this.client || !this.db) {
      throw new Error('Not connected')
    }

    const session = this.client.startSession()

    try {
      // Take snapshot before starting transaction
      this.db.takeSnapshot()
      session.startTransaction()

      const result = await fn(session)

      // Commit - discard snapshots
      await session.commitTransaction()
      this.db.discardSnapshot()
      return result
    } catch (error) {
      // Rollback - restore from snapshots
      await session.abortTransaction()
      this.db.restoreSnapshot()
      throw error
    } finally {
      session.endSession()
    }
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  /** Get resource or throw */
  private getResourceOrThrow(resourceName: string): Resource {
    const resource = this.resourceMap.get(resourceName)
    if (!resource) {
      throw new Error(`Resource "${resourceName}" not found`)
    }
    return resource
  }

  /** Get collection for a resource */
  private getCollection(resourceName: string): InMemoryCollection {
    if (!this.db) {
      throw new Error('Not connected')
    }
    return this.db.collection(resourceName)
  }

  /** Build inverse relation map */
  private buildInverseRelationMap(): void {
    for (const resource of this.schema.resources) {
      for (const relation of resource.relations) {
        if (relation.cardinality === 'one') {
          // This is a belongsTo relation - create hasMany inverse
          const targetResource = relation.to

          if (!this.inverseRelationMap.has(targetResource)) {
            this.inverseRelationMap.set(targetResource, new Map())
          }

          // Use explicit inverse name if provided, otherwise derive from source resource name
          const inverseName = relation.inverse || this.pluralize(resource.name.toLowerCase())

          this.inverseRelationMap.get(targetResource)!.set(inverseName, {
            sourceResource: resource.name,
            sourceRelation: relation,
          })
        }
      }
    }
  }

  /** Simple pluralization - adds 's' or 'es' */
  private pluralize(word: string): string {
    if (word.endsWith('s') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) {
      return word + 'es'
    }
    if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word.charAt(word.length - 2))) {
      return word.slice(0, -1) + 'ies'
    }
    return word + 's'
  }

  /** Get foreign key field name */
  private getForeignKeyField(relation: Relation): string {
    if (relation.foreignKey) {
      return relation.foreignKey
    }
    if (relation.name.endsWith('Id') || relation.name.endsWith('_id')) {
      return relation.name
    }
    return `${relation.name}Id`
  }

  /** Validate required fields */
  private validateRequiredFields(resource: Resource, data: Record<string, unknown>): void {
    const missingFields: string[] = []

    for (const field of resource.fields) {
      // Skip auto-generated fields
      if (this.isAutoIdField(resource, field.name)) continue
      if (this.isAutoTimestampField(field.name)) continue

      // Check if required field is missing
      if (field.required && !(field.name in data)) {
        if (field.default === undefined) {
          missingFields.push(field.name)
        }
      }
    }

    if (missingFields.length > 0) {
      const fieldList = missingFields.map((f) => `"${f}"`).join(', ')
      throw new Error(
        `Required field${missingFields.length > 1 ? 's' : ''} ${fieldList} missing on resource "${resource.name}"`
      )
    }
  }

  /** Validate enum value */
  private validateEnumValue(field: Field, value: unknown, resourceName: string): void {
    if (field.type !== 'enum') return

    const enumValues = field.annotations?.enumValues
    if (!enumValues || enumValues.length === 0) return
    if (value === null || value === undefined) return

    if (!enumValues.includes(value as string)) {
      throw new Error(
        `Invalid enum value "${value}" for field "${field.name}" on resource "${resourceName}". ` +
          `Allowed values: ${enumValues.join(', ')}`
      )
    }
  }

  /** Check if field is auto ID */
  private isAutoIdField(resource: Resource, fieldName: string): boolean {
    if (fieldName !== 'id') return false
    const field = resource.fields.find((f) => f.name === fieldName)
    return field?.type === 'uuid'
  }

  /** Check if field is auto timestamp */
  private isAutoTimestampField(fieldName: string): boolean {
    return ['createdAt', 'created_at', 'updatedAt', 'updated_at'].includes(fieldName)
  }

  /** Build document with auto-generated fields */
  private buildDocument(resource: Resource, data: Record<string, unknown>): Record<string, unknown> {
    const now = new Date().toISOString()
    const doc: Record<string, unknown> = {}

    // Process fields
    for (const field of resource.fields) {
      const fieldName = field.name

      if (this.isAutoIdField(resource, fieldName)) {
        doc._id = generateObjectId()
      } else if (fieldName === 'createdAt' || fieldName === 'created_at') {
        doc[fieldName] = now
      } else if (fieldName === 'updatedAt' || fieldName === 'updated_at') {
        doc[fieldName] = now
      } else if (fieldName in data) {
        doc[fieldName] = data[fieldName]
      } else if (!field.required) {
        doc[fieldName] = null
      } else if (field.default !== undefined) {
        doc[fieldName] = field.default
      } else {
        doc[fieldName] = null
      }
    }

    // Process foreign keys for belongsTo relations
    for (const relation of resource.relations) {
      if (relation.cardinality !== 'one') continue

      const fkField = this.getForeignKeyField(relation)
      if (fkField in data) {
        doc[fkField] = data[fkField]
      } else if (!relation.required) {
        doc[fkField] = null
      }
    }

    return doc
  }

  /** Format document for output */
  private formatDocument(doc: Record<string, unknown>): Record<string, unknown> {
    return { ...doc }
  }

  /** Build sort object */
  private buildSort(orderBy: Record<string, 'asc' | 'desc'>): Record<string, 1 | -1> {
    const sort: Record<string, 1 | -1> = {}
    for (const [field, direction] of Object.entries(orderBy)) {
      sort[field] = direction === 'asc' ? 1 : -1
    }
    return sort
  }

  /** Populate relations for a document */
  private async populateRelations(
    resourceName: string,
    doc: Record<string, unknown>,
    includes: string[]
  ): Promise<Record<string, unknown>> {
    const populated = { ...doc }
    const relations = this.relationMap.get(resourceName)

    for (const include of includes) {
      const relation = relations?.get(include)

      if (relation && relation.cardinality === 'one') {
        // belongsTo relation
        const fkField = this.getForeignKeyField(relation)
        const foreignKey = doc[fkField] as string | null

        if (foreignKey) {
          populated[include] = await this.findById(relation.to, foreignKey)
        } else {
          populated[include] = null
        }
      }
    }

    return populated
  }
}
