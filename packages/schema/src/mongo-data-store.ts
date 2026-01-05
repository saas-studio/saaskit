/**
 * MongoDataStore - MongoDB-backed data store for SaaSKit
 *
 * Provides schema-driven data operations with validation, auto-generated fields,
 * and relation handling. Supports multiple backends:
 *
 * - InMemoryBackend: Fast in-memory storage for unit tests
 * - BunSQLiteBackend: Uses mongo.do with SQLite persistence
 * - MiniflareBackend: Full Cloudflare Workers simulation (future)
 */

import type { SaaSSchema, Resource, Field, Relation } from './types'
import {
  type MongoBackend,
  type MongoSession,
  type Document,
  type BackendConfig,
  InMemoryBackend,
  createBackend,
} from './mongo-backend'

// ============================================================================
// Types
// ============================================================================

/** Configuration options for MongoDataStore */
export interface MongoDataStoreOptions {
  /** MongoDB connection URI (ignored for in-memory) */
  uri?: string
  /** Database name */
  database: string
  /** Use in-memory mode for testing */
  inMemory?: boolean
  /** Backend configuration */
  backend?: BackendConfig
}

/** Options for findAll query */
export interface MongoFindAllOptions {
  /** Filter conditions (MongoDB-style) */
  where?: Document
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
  session?: MongoSession
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

  /** Backend implementation */
  private backend: MongoBackend | null = null

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
    return this.backend?.isConnected ?? false
  }

  /** Connect to the database */
  async connect(): Promise<void> {
    if (this.backend) {
      return
    }

    // Determine backend type
    const backendConfig: BackendConfig = this.options.backend || {
      type: this.options.inMemory ? 'memory' : 'bun-sqlite',
      dataDir: './.mongo-data',
      database: this.options.database,
    }

    // For backwards compatibility: inMemory option overrides backend type
    if (this.options.inMemory) {
      this.backend = new InMemoryBackend()
    } else {
      this.backend = await createBackend(backendConfig)
    }

    await this.backend.connect()

    // Ensure collections exist for all resources
    for (const resource of this.schema.resources) {
      await this.backend.createCollection(resource.name)
    }
  }

  /** Disconnect from the database */
  async disconnect(): Promise<void> {
    if (this.backend) {
      await this.backend.disconnect()
      this.backend = null
    }
  }

  /** List all collections */
  async listCollections(): Promise<string[]> {
    this.ensureConnected()
    return this.backend!.listCollections()
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
    data: Document,
    _options?: SessionOptions
  ): Promise<Document> {
    this.ensureConnected()
    const resource = this.getResourceOrThrow(resourceName)

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

    // Insert into backend
    const result = await this.backend!.insertOne(resourceName, doc)
    doc._id = result.insertedId

    return this.formatDocument(doc)
  }

  /** Find a record by ID */
  async findById(
    resourceName: string,
    id: string,
    _options?: SessionOptions
  ): Promise<Document | null> {
    this.ensureConnected()
    this.getResourceOrThrow(resourceName)

    const doc = await this.backend!.findOne(resourceName, { _id: id })
    return doc ? this.formatDocument(doc) : null
  }

  /** Find all records matching criteria */
  async findAll(
    resourceName: string,
    options?: MongoFindAllOptions
  ): Promise<Document[]> {
    this.ensureConnected()
    this.getResourceOrThrow(resourceName)

    // Execute query
    let docs = await this.backend!.find(resourceName, {
      filter: options?.where || {},
      limit: options?.limit,
      skip: options?.offset,
      sort: options?.orderBy ? this.buildSort(options.orderBy) : undefined,
    })

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
    data: Document,
    _options?: SessionOptions
  ): Promise<Document> {
    this.ensureConnected()
    const resource = this.getResourceOrThrow(resourceName)

    // Check if record exists
    const existing = await this.backend!.findOne(resourceName, { _id: id })
    if (!existing) {
      throw new Error(`Record with id "${id}" not found in resource "${resourceName}"`)
    }

    // Build update document
    const updateData: Document = { ...data }

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

    // Update in backend
    await this.backend!.updateOne(resourceName, { _id: id }, { $set: updateData })

    // Return updated document
    const updated = await this.backend!.findOne(resourceName, { _id: id })
    return this.formatDocument(updated!)
  }

  /** Delete a record by ID */
  async delete(
    resourceName: string,
    id: string,
    _options?: SessionOptions
  ): Promise<boolean> {
    this.ensureConnected()
    this.getResourceOrThrow(resourceName)

    const result = await this.backend!.deleteOne(resourceName, { _id: id })
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
  ): Promise<Document | Document[] | null> {
    this.ensureConnected()
    this.getResourceOrThrow(resourceName)
    const record = await this.findById(resourceName, id)

    if (!record) {
      return null
    }

    // Check for direct relation (belongsTo)
    const relations = this.relationMap.get(resourceName)
    const directRelation = relations?.get(relationName)

    if (directRelation && directRelation.cardinality === 'one') {
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
    options?: { where?: Document }
  ): Promise<number> {
    this.ensureConnected()
    this.getResourceOrThrow(resourceName)

    return this.backend!.countDocuments(resourceName, options?.where)
  }

  /** Run aggregation pipeline */
  async aggregate(
    resourceName: string,
    pipeline: Document[]
  ): Promise<Document[]> {
    this.ensureConnected()
    this.getResourceOrThrow(resourceName)

    return this.backend!.aggregate(resourceName, pipeline)
  }

  // ============================================================================
  // Transactions
  // ============================================================================

  /** Execute operations within a transaction */
  async withTransaction<T>(fn: (session: MongoSession) => Promise<T>): Promise<T> {
    this.ensureConnected()

    const session = this.backend!.startSession()

    try {
      // Take snapshot before starting transaction
      this.backend!.takeSnapshot()
      session.startTransaction()

      const result = await fn(session)

      // Commit - discard snapshots
      await session.commitTransaction()
      this.backend!.discardSnapshot()
      return result
    } catch (error) {
      // Rollback - restore from snapshots
      await session.abortTransaction()
      this.backend!.restoreSnapshot()
      throw error
    } finally {
      session.endSession()
    }
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  /** Ensure backend is connected */
  private ensureConnected(): void {
    if (!this.backend || !this.backend.isConnected) {
      throw new Error('MongoDataStore is not connected. Call connect() first.')
    }
  }

  /** Get resource or throw */
  private getResourceOrThrow(resourceName: string): Resource {
    const resource = this.resourceMap.get(resourceName)
    if (!resource) {
      throw new Error(`Resource "${resourceName}" not found`)
    }
    return resource
  }

  /** Build inverse relation map */
  private buildInverseRelationMap(): void {
    for (const resource of this.schema.resources) {
      for (const relation of resource.relations) {
        if (relation.cardinality === 'one') {
          const targetResource = relation.to

          if (!this.inverseRelationMap.has(targetResource)) {
            this.inverseRelationMap.set(targetResource, new Map())
          }

          const inverseName = relation.inverse || this.pluralize(resource.name.toLowerCase())

          this.inverseRelationMap.get(targetResource)!.set(inverseName, {
            sourceResource: resource.name,
            sourceRelation: relation,
          })
        }
      }
    }
  }

  /** Simple pluralization */
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
  private validateRequiredFields(resource: Resource, data: Document): void {
    const missingFields: string[] = []

    for (const field of resource.fields) {
      if (this.isAutoIdField(resource, field.name)) continue
      if (this.isAutoTimestampField(field.name)) continue

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

  /** Generate UUID */
  private generateObjectId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /** Build document with auto-generated fields */
  private buildDocument(resource: Resource, data: Document): Document {
    const now = new Date().toISOString()
    const doc: Document = {}

    for (const field of resource.fields) {
      const fieldName = field.name

      if (this.isAutoIdField(resource, fieldName)) {
        doc._id = this.generateObjectId()
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
  private formatDocument(doc: Document): Document {
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
    doc: Document,
    includes: string[]
  ): Promise<Document> {
    const populated = { ...doc }
    const relations = this.relationMap.get(resourceName)

    for (const include of includes) {
      const relation = relations?.get(include)

      if (relation && relation.cardinality === 'one') {
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
