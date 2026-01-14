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
import { pluralize as corePluralize } from '@saaskit/core'

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

/** Include option can be a string or an object with field selection */
export type IncludeOption = string | { relation: string; select?: string[] }

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
  include?: IncludeOption[]
  /** Fields to select (projection) */
  select?: string[]
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

    // Format documents
    let results = docs.map((doc) => this.formatDocument(doc))

    // Apply top-level field selection (preserve included relations)
    if (options?.select && options.select.length > 0) {
      // Build list of relation names that were included
      const includedRelations = (options.include || []).map((inc) =>
        typeof inc === 'string' ? inc : inc.relation
      )
      // Add relation names to fields to preserve them
      const fieldsWithRelations = [
        ...options.select,
        ...includedRelations.filter((rel) => !options.select!.includes(rel)),
      ]
      results = results.map((doc) => this.selectFields(doc, fieldsWithRelations))
    }

    return results
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

  /** Simple pluralization - delegates to @saaskit/core */
  private pluralize(word: string): string {
    return corePluralize(word).toLowerCase()
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
    const result = { ...doc }
    // Always expose id from _id (overwrite null or undefined id field)
    if (result._id !== undefined) {
      result.id = result._id
    }
    return result
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
    includes: (string | { relation: string; select?: string[] })[]
  ): Promise<Document> {
    const populated = { ...doc }
    const relations = this.relationMap.get(resourceName)
    const inverseRelations = this.inverseRelationMap.get(resourceName)

    for (const includeItem of includes) {
      // Handle object-style includes: { relation: 'author', select: ['name'] }
      const include = typeof includeItem === 'string' ? includeItem : includeItem.relation
      const selectFields = typeof includeItem === 'object' ? includeItem.select : undefined

      // Handle nested includes (e.g., "company.contacts")
      if (include.includes('.')) {
        await this.populateNestedRelation(resourceName, populated, include)
        continue
      }

      // Check for direct relation (belongsTo)
      const relation = relations?.get(include)
      if (relation && relation.cardinality === 'one') {
        const fkField = this.getForeignKeyField(relation)
        const foreignKey = doc[fkField] as string | null

        if (foreignKey) {
          let related = await this.findById(relation.to, foreignKey)
          // Apply field selection if specified
          if (related && selectFields) {
            related = this.selectFields(related, selectFields)
          }
          populated[include] = related
        } else {
          populated[include] = null
        }
        continue
      }

      // Check for inverse relation (hasMany)
      const inverseInfo = inverseRelations?.get(include)
      if (inverseInfo) {
        const { sourceResource, sourceRelation } = inverseInfo
        const fkField = this.getForeignKeyField(sourceRelation)
        const id = doc._id || doc.id

        populated[include] = await this.findAll(sourceResource, {
          where: { [fkField]: id },
        })
        continue
      }

      // Check for many-to-many via junction table
      const manyToManyResult = await this.populateManyToMany(resourceName, doc, include)
      if (manyToManyResult !== undefined) {
        populated[include] = manyToManyResult
        continue
      }
    }

    return populated
  }

  /** Populate nested relations (e.g., "company.contacts") */
  private async populateNestedRelation(
    resourceName: string,
    doc: Document,
    nestedInclude: string
  ): Promise<void> {
    const parts = nestedInclude.split('.')
    const [firstRelation, ...rest] = parts
    const nestedPath = rest.join('.')

    // First populate the immediate relation
    const relations = this.relationMap.get(resourceName)
    const relation = relations?.get(firstRelation)

    if (relation && relation.cardinality === 'one') {
      const fkField = this.getForeignKeyField(relation)
      const foreignKey = doc[fkField] as string | null

      if (foreignKey && !doc[firstRelation]) {
        doc[firstRelation] = await this.findById(relation.to, foreignKey)
      }

      // Then populate nested relations on the related document
      if (doc[firstRelation] && nestedPath) {
        doc[firstRelation] = await this.populateRelations(
          relation.to,
          doc[firstRelation] as Document,
          [nestedPath]
        )
      }
    }

    // Also handle inverse relations for nested paths
    const inverseRelations = this.inverseRelationMap.get(resourceName)
    const inverseInfo = inverseRelations?.get(firstRelation)

    if (inverseInfo) {
      const { sourceResource, sourceRelation } = inverseInfo
      const fkField = this.getForeignKeyField(sourceRelation)
      const id = doc._id || doc.id

      if (!doc[firstRelation]) {
        doc[firstRelation] = await this.findAll(sourceResource, {
          where: { [fkField]: id },
        })
      }

      // Populate nested on each item in the array
      if (doc[firstRelation] && nestedPath) {
        const items = doc[firstRelation] as Document[]
        doc[firstRelation] = await Promise.all(
          items.map((item) =>
            this.populateRelations(sourceResource, item, [nestedPath])
          )
        )
      }
    }
  }

  /** Populate many-to-many relation via junction table */
  private async populateManyToMany(
    resourceName: string,
    doc: Document,
    relationName: string
  ): Promise<Document[] | undefined> {
    // Look for junction table pattern: Post.tags -> PostTag -> Tag
    // The junction table is named {ResourceName}{TargetName} or {TargetName}{ResourceName}
    const id = doc._id || doc.id
    if (!id) return undefined

    // Derive target resource name from plural relation name
    const targetName = this.singularize(relationName)
    const targetResourceName = this.capitalizeFirst(targetName)

    // Check if target resource exists
    if (!this.resourceMap.has(targetResourceName)) {
      return undefined
    }

    // Look for junction table
    const junctionName1 = `${resourceName}${targetResourceName}`
    const junctionName2 = `${targetResourceName}${resourceName}`

    let junctionResource: Resource | undefined
    let junctionName: string | undefined
    let localFkField = ''
    let foreignFkField = ''

    if (this.resourceMap.has(junctionName1)) {
      junctionResource = this.resourceMap.get(junctionName1)
      junctionName = junctionName1
      localFkField = `${this.lowercaseFirst(resourceName)}Id`
      foreignFkField = `${this.lowercaseFirst(targetResourceName)}Id`
    } else if (this.resourceMap.has(junctionName2)) {
      junctionResource = this.resourceMap.get(junctionName2)
      junctionName = junctionName2
      localFkField = `${this.lowercaseFirst(resourceName)}Id`
      foreignFkField = `${this.lowercaseFirst(targetResourceName)}Id`
    }

    if (!junctionResource || !junctionName) {
      return undefined
    }

    // Find junction records
    const junctionRecords = await this.findAll(junctionName, {
      where: { [localFkField]: id },
    })

    if (junctionRecords.length === 0) {
      return []
    }

    // Get target IDs from junction records
    const targetIds = junctionRecords
      .map((jr) => jr[foreignFkField] as string)
      .filter(Boolean)

    if (targetIds.length === 0) {
      return []
    }

    // Fetch target records
    const targetRecords = await Promise.all(
      targetIds.map((targetId) => this.findById(targetResourceName, targetId))
    )

    return targetRecords.filter((r): r is Document => r !== null)
  }

  /** Simple singularization */
  private singularize(word: string): string {
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y'
    }
    if (word.endsWith('es') && (word.endsWith('sses') || word.endsWith('xes') || word.endsWith('ches') || word.endsWith('shes'))) {
      return word.slice(0, -2)
    }
    if (word.endsWith('s') && !word.endsWith('ss')) {
      return word.slice(0, -1)
    }
    return word
  }

  /** Capitalize first letter */
  private capitalizeFirst(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }

  /** Lowercase first letter */
  private lowercaseFirst(word: string): string {
    return word.charAt(0).toLowerCase() + word.slice(1)
  }

  /** Select specific fields from a document */
  private selectFields(doc: Document, fields: string[]): Document {
    const result: Document = {}
    for (const field of fields) {
      if (field in doc) {
        result[field] = doc[field]
      }
    }
    // Always include _id/id if not explicitly excluded
    if (doc._id !== undefined && !('_id' in result)) {
      result._id = doc._id
    }
    if (doc.id !== undefined && !('id' in result)) {
      result.id = doc.id
    }
    return result
  }
}
