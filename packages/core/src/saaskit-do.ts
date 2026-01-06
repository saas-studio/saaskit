/**
 * SaasKitDO - Schema-aware Durable Object base class
 *
 * Extends the base DO class with:
 * - Schema-driven CRUD operations
 * - Input validation against schema
 * - Dynamic resource methods (this.users.create, etc.)
 *
 * This class can be used in two modes:
 * 1. Test mode: Instantiate with just a schema for in-memory testing
 * 2. Production mode: Instantiate with (ctx, env, schema) for real DO usage
 */

import { DO } from '@dotdo/do'

/**
 * Schema field definition
 */
interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'date'
  required?: boolean
  enum?: string[]
}

/**
 * Schema resource definition
 */
interface SchemaResource {
  fields: Record<string, SchemaField>
}

/**
 * Schema definition
 */
interface Schema {
  name: string
  resources: Record<string, SchemaResource>
}

/**
 * Record type with auto-generated fields
 */
interface Record {
  id: string
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

/**
 * List result with pagination
 */
interface ListResult<T> {
  data: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

/**
 * List options
 */
interface ListOptions {
  limit?: number
  offset?: number
}

/**
 * Query options with filtering
 */
interface QueryOptions extends ListOptions {
  where?: Record<string, unknown>
}

/**
 * Resource accessor with typed CRUD methods
 */
interface ResourceAccessor<T extends Record = Record> {
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  read(id: string): Promise<T | null>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<boolean>
  list(options?: ListOptions): Promise<ListResult<T>>
}

/**
 * SaasKitDO - Schema-aware Durable Object base class
 *
 * Dynamic resource accessors are added at runtime (e.g., this.users, this.posts)
 */
export class SaasKitDO extends DO {
  readonly schema: Schema
  private store: Map<string, Map<string, Record>> = new Map()
  private _isTestMode: boolean = false;

  // These properties will be dynamically added based on schema
  // TypeScript allows this through the 'any' assertion in createResourceAccessors
  [resource: string]: ResourceAccessor | Schema | Map<string, Map<string, Record>> | boolean | unknown

  /**
   * Create a new SaasKitDO instance
   *
   * @param schemaOrCtx - Either a Schema (test mode) or DurableObjectState (production mode)
   * @param envOrSchema - Either env (production mode) or undefined (test mode)
   * @param schema - Schema (production mode only)
   */
  constructor(schemaOrCtx: Schema | DurableObjectState, envOrSchema?: unknown, schema?: Schema) {
    // Detect test mode: if first arg has 'resources' property, it's a schema
    const isTestMode = 'resources' in schemaOrCtx && 'name' in schemaOrCtx

    if (isTestMode) {
      // Test mode: create mock state
      const mockState = createMockState()
      super(mockState as unknown as DurableObjectState, {})
      this.schema = schemaOrCtx as Schema
      this._isTestMode = true
    } else {
      // Production mode
      super(schemaOrCtx as unknown as DurableObjectState, envOrSchema)
      this.schema = schema as Schema
    }

    // Initialize storage for each resource
    for (const resourceName of Object.keys(this.schema.resources)) {
      this.store.set(resourceName, new Map())
    }

    // Create dynamic resource accessors
    this.createResourceAccessors()
  }

  /**
   * Create dynamic resource accessors (e.g., this.users, this.posts)
   */
  private createResourceAccessors(): void {
    for (const resourceName of Object.keys(this.schema.resources)) {
      const accessor: ResourceAccessor = {
        create: (data) => this.create(resourceName, data),
        read: (id) => this.read(resourceName, id),
        update: (id, data) => this.update(resourceName, id, data),
        delete: (id) => this.delete(resourceName, id),
        list: (options) => this.list(resourceName, options),
      }
      this[resourceName] = accessor
    }
  }

  /**
   * Get the schema
   */
  getSchema(): Schema {
    return this.schema
  }

  /**
   * Get list of resource names
   */
  getResources(): string[] {
    return Object.keys(this.schema.resources)
  }

  /**
   * Validate that a collection exists
   */
  private validateCollection(collection: string): void {
    if (!this.schema.resources[collection]) {
      throw new Error(`Unknown resource: ${collection}`)
    }
  }

  /**
   * Validate data against schema
   */
  private validateData(collection: string, data: unknown, isUpdate = false): void {
    const resource = this.schema.resources[collection]
    if (!resource) {
      throw new Error(`Unknown resource: ${collection}`)
    }

    const record = data as Record<string, unknown>

    // Check required fields (only on create)
    if (!isUpdate) {
      const missingRequired: string[] = []
      for (const [fieldName, fieldDef] of Object.entries(resource.fields)) {
        if (fieldDef.required && record[fieldName] === undefined) {
          missingRequired.push(fieldName)
        }
      }
      if (missingRequired.length > 0) {
        throw new Error(`Required field(s) missing: ${missingRequired.join(', ')}`)
      }
    }

    // Validate field types and enums
    for (const [fieldName, value] of Object.entries(record)) {
      // Skip auto-generated fields
      if (['id', 'createdAt', 'updatedAt'].includes(fieldName)) {
        continue
      }

      const fieldDef = resource.fields[fieldName]
      if (!fieldDef) {
        // Allow extra fields not in schema
        continue
      }

      if (value !== undefined && value !== null) {
        // Type validation
        if (fieldDef.type === 'string' && typeof value !== 'string') {
          throw new Error(`Invalid type for field '${fieldName}': expected string`)
        }
        if (fieldDef.type === 'number' && typeof value !== 'number') {
          throw new Error(`Invalid type for field '${fieldName}': expected number`)
        }
        if (fieldDef.type === 'boolean' && typeof value !== 'boolean') {
          throw new Error(`Invalid type for field '${fieldName}': expected boolean`)
        }

        // Enum validation
        if (fieldDef.enum && !fieldDef.enum.includes(value as string)) {
          throw new Error(
            `Invalid enum value for field '${fieldName}': expected one of [${fieldDef.enum.join(', ')}]`
          )
        }
      }
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return crypto.randomUUID()
  }

  /**
   * Create a new record
   */
  async create(collection: string, data: unknown): Promise<Record> {
    this.validateCollection(collection)
    this.validateData(collection, data)

    const now = new Date().toISOString()
    const id = this.generateId()

    const resource = this.schema.resources[collection]
    const record: Record = {
      id,
      createdAt: now,
      updatedAt: now,
    }

    // Copy data fields, setting optional fields to null if not provided
    for (const [fieldName, fieldDef] of Object.entries(resource.fields)) {
      const value = (data as Record<string, unknown>)[fieldName]
      if (value !== undefined) {
        record[fieldName] = value
      } else if (!fieldDef.required) {
        record[fieldName] = null
      }
    }

    // Get or create collection store
    let collectionStore = this.store.get(collection)
    if (!collectionStore) {
      collectionStore = new Map()
      this.store.set(collection, collectionStore)
    }

    collectionStore.set(id, record)
    return record
  }

  /**
   * Read a record by ID
   */
  async read(collection: string, id: string): Promise<Record | null> {
    this.validateCollection(collection)

    const collectionStore = this.store.get(collection)
    if (!collectionStore) {
      return null
    }

    const record = collectionStore.get(id)
    if (!record) {
      return null
    }

    // Return a copy for immutability
    return { ...record }
  }

  /**
   * Update a record
   */
  async update(collection: string, id: string, data: Partial<unknown>): Promise<Record> {
    this.validateCollection(collection)
    this.validateData(collection, data, true)

    const collectionStore = this.store.get(collection)
    if (!collectionStore) {
      throw new Error(`Record not found: ${id}`)
    }

    const existing = collectionStore.get(id)
    if (!existing) {
      throw new Error(`Record not found: ${id}`)
    }

    const now = new Date().toISOString()
    const updates = data as Record<string, unknown>

    // Merge updates, but don't allow changing id or createdAt
    const updated: Record = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve original id
      createdAt: existing.createdAt, // Preserve original createdAt
      updatedAt: now,
    }

    collectionStore.set(id, updated)
    return updated
  }

  /**
   * Delete a record
   */
  async delete(collection: string, id: string): Promise<boolean> {
    this.validateCollection(collection)

    const collectionStore = this.store.get(collection)
    if (!collectionStore) {
      return false
    }

    const existed = collectionStore.has(id)
    collectionStore.delete(id)
    return existed
  }

  /**
   * List records in a collection
   */
  async list(collection: string, options?: ListOptions): Promise<ListResult<Record>> {
    this.validateCollection(collection)

    const collectionStore = this.store.get(collection)
    if (!collectionStore) {
      return {
        data: [],
        total: 0,
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
        hasMore: false,
      }
    }

    const allRecords = Array.from(collectionStore.values())
    const total = allRecords.length
    const limit = options?.limit ?? 100
    const offset = options?.offset ?? 0

    const data = allRecords.slice(offset, offset + limit)
    const hasMore = offset + data.length < total

    return {
      data,
      total,
      limit,
      offset,
      hasMore,
    }
  }

  /**
   * Query records with filtering
   */
  async query(collection: string, options?: QueryOptions): Promise<ListResult<Record>> {
    this.validateCollection(collection)

    const collectionStore = this.store.get(collection)
    if (!collectionStore) {
      return {
        data: [],
        total: 0,
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
        hasMore: false,
      }
    }

    let records = Array.from(collectionStore.values())

    // Apply where filters
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

    const total = records.length
    const limit = options?.limit ?? 100
    const offset = options?.offset ?? 0

    const data = records.slice(offset, offset + limit)
    const hasMore = offset + data.length < total

    return {
      data,
      total,
      limit,
      offset,
      hasMore,
    }
  }
}

/**
 * Create a mock DurableObjectState for testing
 */
function createMockState(): object {
  const storage = new Map<string, unknown>()
  const tables = new Map<string, Map<string, unknown>>()

  return {
    storage: {
      sql: {
        exec: (query: string, ..._params: unknown[]) => {
          // Simple mock - just return empty results
          return {
            toArray: () => [],
            one: () => undefined,
          }
        },
      },
      get: async (key: string) => storage.get(key),
      put: async (key: string, value: unknown) => storage.set(key, value),
      delete: async (key: string) => storage.delete(key),
      list: async () => new Map(),
    },
    id: {
      toString: () => 'mock-saaskit-do-id',
    },
    acceptWebSocket: () => {},
    getWebSockets: () => [],
    waitUntil: () => {},
    blockConcurrencyWhile: async <T>(fn: () => Promise<T>) => fn(),
  }
}

/**
 * DurableObjectState type for compatibility
 */
type DurableObjectState = {
  storage: {
    sql: {
      exec(query: string, ...params: unknown[]): { toArray(): unknown[] }
    }
  }
}
