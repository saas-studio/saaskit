/**
 * Runtime Data Store for SaaSKit
 *
 * Provides an in-memory data store with CRUD operations for SaaS schemas.
 * Supports auto-generation of UUIDs, timestamps, and relation traversal.
 */

import type { SaaSSchema, Resource, Relation } from './types'

// ============================================================================
// Types
// ============================================================================

/**
 * Options for findAll query
 */
export interface FindAllOptions {
  /** Filter conditions (AND logic) */
  where?: Record<string, unknown>
  /** Maximum number of records to return */
  limit?: number
  /** Number of records to skip */
  offset?: number
}

/**
 * DataStore interface for CRUD operations
 */
export interface IDataStore {
  /** The schema this store operates on */
  readonly schema: SaaSSchema

  /** Create a new record */
  create(resourceName: string, data: Record<string, unknown>): Record<string, unknown>

  /** Find a record by ID */
  findById(resourceName: string, id: string): Record<string, unknown> | null

  /** Find all records matching optional criteria */
  findAll(resourceName: string, options?: FindAllOptions): Record<string, unknown>[]

  /** Update a record by ID */
  update(resourceName: string, id: string, data: Record<string, unknown>): Record<string, unknown>

  /** Delete a record by ID */
  delete(resourceName: string, id: string): boolean

  /** Get related records for a given relation */
  getRelated(
    resourceName: string,
    id: string,
    relationName: string
  ): Record<string, unknown> | Record<string, unknown>[] | null
}

// ============================================================================
// UUID Generation
// ============================================================================

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  // Use crypto.randomUUID if available (Node.js 14.17+, browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ============================================================================
// DataStore Implementation
// ============================================================================

/**
 * In-memory data store with CRUD operations
 */
export class DataStore implements IDataStore {
  /** The schema this store operates on */
  public readonly schema: SaaSSchema

  /** Internal data storage: resourceName -> id -> record */
  private data: Map<string, Map<string, Record<string, unknown>>>

  /** Resource lookup cache */
  private resourceMap: Map<string, Resource>

  /** Relation lookup cache: resourceName -> relationName -> Relation */
  private relationMap: Map<string, Map<string, Relation>>

  /** Inverse relation lookup: resourceName -> inverseName -> { sourceResource, sourceRelation } */
  private inverseRelationMap: Map<
    string,
    Map<string, { sourceResource: string; sourceRelation: Relation }>
  >

  constructor(schema: SaaSSchema) {
    this.schema = schema
    this.data = new Map()
    this.resourceMap = new Map()
    this.relationMap = new Map()
    this.inverseRelationMap = new Map()

    // Initialize data structures for each resource
    for (const resource of schema.resources) {
      this.data.set(resource.name, new Map())
      this.resourceMap.set(resource.name, resource)

      // Build relation lookup
      const relations = new Map<string, Relation>()
      for (const relation of resource.relations) {
        relations.set(relation.name, relation)
      }
      this.relationMap.set(resource.name, relations)
    }

    // Build inverse relation lookup (for hasMany traversal)
    this.buildInverseRelationMap()
  }

  /**
   * Build the inverse relation map for hasMany traversal
   */
  private buildInverseRelationMap(): void {
    for (const resource of this.schema.resources) {
      for (const relation of resource.relations) {
        if (relation.inverse && relation.cardinality === 'one') {
          // This is a belongsTo relation with an inverse
          // The target resource has a hasMany relation pointing back
          const targetResource = relation.to

          if (!this.inverseRelationMap.has(targetResource)) {
            this.inverseRelationMap.set(targetResource, new Map())
          }

          this.inverseRelationMap.get(targetResource)!.set(relation.inverse, {
            sourceResource: resource.name,
            sourceRelation: relation,
          })
        }
      }
    }
  }

  /**
   * Get a resource by name, throwing if not found
   */
  private getResource(resourceName: string): Resource {
    const resource = this.resourceMap.get(resourceName)
    if (!resource) {
      throw new Error(`Resource "${resourceName}" not found`)
    }
    return resource
  }

  /**
   * Get the data map for a resource, throwing if not found
   */
  private getDataMap(resourceName: string): Map<string, Record<string, unknown>> {
    const dataMap = this.data.get(resourceName)
    if (!dataMap) {
      throw new Error(`Resource "${resourceName}" not found`)
    }
    return dataMap
  }

  /**
   * Get the foreign key field name for a relation
   */
  private getForeignKeyField(relation: Relation): string {
    return relation.foreignKey || `${relation.name}Id`
  }

  /**
   * Check if a field is an auto-generated ID field
   * Auto-generates UUID for 'id' fields of type 'uuid'
   */
  private isAutoIdField(resource: Resource, fieldName: string): boolean {
    if (fieldName !== 'id') return false
    const field = resource.fields.find((f) => f.name === fieldName)
    // Auto-generate if it's a uuid type id field (with or without primaryKey annotation)
    return field?.type === 'uuid'
  }

  /**
   * Check if a field is an auto-generated timestamp field
   */
  private isAutoTimestampField(fieldName: string): boolean {
    return fieldName === 'createdAt' || fieldName === 'updatedAt'
  }

  /**
   * Create a deep copy of a record
   */
  private cloneRecord(record: Record<string, unknown>): Record<string, unknown> {
    return JSON.parse(JSON.stringify(record))
  }

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Create a new record
   */
  create(resourceName: string, data: Record<string, unknown>): Record<string, unknown> {
    const resource = this.getResource(resourceName)
    const dataMap = this.getDataMap(resourceName)

    const now = new Date().toISOString()
    const record: Record<string, unknown> = {}

    // Process all fields defined in the resource
    for (const field of resource.fields) {
      const fieldName = field.name

      // Auto-generate UUID for id fields
      if (this.isAutoIdField(resource, fieldName)) {
        record[fieldName] = generateUUID()
      }
      // Auto-set timestamps
      else if (fieldName === 'createdAt' && this.isAutoTimestampField(fieldName)) {
        record[fieldName] = now
      } else if (fieldName === 'updatedAt' && this.isAutoTimestampField(fieldName)) {
        record[fieldName] = now
      }
      // Use provided value or null for optional fields
      else if (fieldName in data) {
        record[fieldName] = data[fieldName]
      } else if (!field.required) {
        record[fieldName] = null
      } else if (field.default !== undefined) {
        record[fieldName] = field.default
      } else {
        record[fieldName] = null
      }
    }

    // Process foreign key fields for relations
    for (const relation of resource.relations) {
      const fkField = this.getForeignKeyField(relation)
      if (fkField in data) {
        record[fkField] = data[fkField]
      } else if (!relation.required) {
        record[fkField] = null
      }
    }

    // Store the record
    dataMap.set(record.id as string, record)

    return this.cloneRecord(record)
  }

  /**
   * Find a record by ID
   */
  findById(resourceName: string, id: string): Record<string, unknown> | null {
    this.getResource(resourceName) // Validate resource exists
    const dataMap = this.getDataMap(resourceName)

    const record = dataMap.get(id)
    if (!record) {
      return null
    }

    return this.cloneRecord(record)
  }

  /**
   * Find all records matching optional criteria
   */
  findAll(resourceName: string, options?: FindAllOptions): Record<string, unknown>[] {
    this.getResource(resourceName) // Validate resource exists
    const dataMap = this.getDataMap(resourceName)

    let records = Array.from(dataMap.values())

    // Apply where filter
    if (options?.where) {
      records = records.filter((record) => {
        for (const [key, value] of Object.entries(options.where!)) {
          if (record[key] !== value) {
            return false
          }
        }
        return true
      })
    }

    // Apply offset
    if (options?.offset !== undefined && options.offset > 0) {
      records = records.slice(options.offset)
    }

    // Apply limit
    if (options?.limit !== undefined && options.limit > 0) {
      records = records.slice(0, options.limit)
    }

    // Return cloned records
    return records.map((r) => this.cloneRecord(r))
  }

  /**
   * Update a record by ID
   */
  update(
    resourceName: string,
    id: string,
    data: Record<string, unknown>
  ): Record<string, unknown> {
    const resource = this.getResource(resourceName)
    const dataMap = this.getDataMap(resourceName)

    const existing = dataMap.get(id)
    if (!existing) {
      throw new Error(`Record with id "${id}" not found in resource "${resourceName}"`)
    }

    // Update fields (excluding id and createdAt)
    for (const [key, value] of Object.entries(data)) {
      // Don't allow updating id or createdAt
      if (key === 'id' || key === 'createdAt') {
        continue
      }
      existing[key] = value
    }

    // Update updatedAt timestamp
    const hasUpdatedAt = resource.fields.some((f) => f.name === 'updatedAt')
    if (hasUpdatedAt) {
      existing.updatedAt = new Date().toISOString()
    }

    return this.cloneRecord(existing)
  }

  /**
   * Delete a record by ID
   */
  delete(resourceName: string, id: string): boolean {
    this.getResource(resourceName) // Validate resource exists
    const dataMap = this.getDataMap(resourceName)

    return dataMap.delete(id)
  }

  // ============================================================================
  // Relation Traversal
  // ============================================================================

  /**
   * Get related records for a given relation
   */
  getRelated(
    resourceName: string,
    id: string,
    relationName: string
  ): Record<string, unknown> | Record<string, unknown>[] | null {
    this.getResource(resourceName) // Validate resource exists
    const record = this.findById(resourceName, id)

    if (!record) {
      return null
    }

    // Check for direct relation (belongsTo)
    const relations = this.relationMap.get(resourceName)
    const directRelation = relations?.get(relationName)

    if (directRelation && directRelation.cardinality === 'one') {
      // This is a belongsTo relation
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
      // This is a hasMany relation (inverse of belongsTo)
      const { sourceResource, sourceRelation } = inverseInfo
      const fkField = this.getForeignKeyField(sourceRelation)

      // Find all records in the source resource where FK matches this record's id
      return this.findAll(sourceResource, {
        where: { [fkField]: id },
      })
    }

    // Check if this is a many relation defined directly on the resource
    if (directRelation && directRelation.cardinality === 'many') {
      // Find all records in the target resource where FK matches this record's id
      // The FK is on the target resource, pointing to this resource
      const fkField = `${resourceName.charAt(0).toLowerCase() + resourceName.slice(1)}Id`
      return this.findAll(directRelation.to, {
        where: { [fkField]: id },
      })
    }

    throw new Error(`Relation "${relationName}" not found on resource "${resourceName}"`)
  }
}
