import { describe, it, expect, beforeEach } from 'vitest'
import { createDataStoreProvider } from '../index'
import type { DataProvider, CreateParams, CreateResult, RaRecord } from '../types'
import type { IDataStore, FindAllOptions } from '@saaskit/schema'
import type { SaaSSchema, Resource } from '@saaskit/schema'

// ============================================================================
// Mock DataStore
// ============================================================================

/**
 * Mock DataStore for testing the DataProvider create method.
 * Simulates the behavior of a real DataStore for testing purposes.
 */
class MockDataStore implements IDataStore {
  public readonly schema: SaaSSchema
  private data: Map<string, Map<string, Record<string, unknown>>>

  constructor(schema: SaaSSchema) {
    this.schema = schema
    this.data = new Map()

    // Initialize data structures for each resource
    for (const resource of schema.resources) {
      this.data.set(resource.name, new Map())
    }
  }

  create(resourceName: string, data: Record<string, unknown>): Record<string, unknown> {
    const resource = this.schema.resources.find((r) => r.name === resourceName)
    if (!resource) {
      throw new Error(`Resource "${resourceName}" not found`)
    }

    // Validate required fields
    const missingFields: string[] = []
    for (const field of resource.fields) {
      // Skip auto-generated fields
      if (field.name === 'id' && field.type === 'uuid') continue
      if (field.name === 'createdAt' || field.name === 'updatedAt') continue

      if (field.required && !(field.name in data)) {
        if (field.default === undefined) {
          missingFields.push(field.name)
        }
      }
    }

    if (missingFields.length > 0) {
      const fieldList = missingFields.map((f) => `"${f}"`).join(', ')
      throw new Error(
        `Required field${missingFields.length > 1 ? 's' : ''} ${fieldList} missing on resource "${resourceName}"`
      )
    }

    const now = new Date().toISOString()
    const record: Record<string, unknown> = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }

    const dataMap = this.data.get(resourceName)!
    dataMap.set(record.id as string, record)

    return { ...record }
  }

  findById(resourceName: string, id: string): Record<string, unknown> | null {
    const resource = this.schema.resources.find((r) => r.name === resourceName)
    if (!resource) {
      throw new Error(`Resource "${resourceName}" not found`)
    }

    const dataMap = this.data.get(resourceName)
    if (!dataMap) return null

    const record = dataMap.get(id)
    return record ? { ...record } : null
  }

  findAll(resourceName: string, options?: FindAllOptions): Record<string, unknown>[] {
    const resource = this.schema.resources.find((r) => r.name === resourceName)
    if (!resource) {
      throw new Error(`Resource "${resourceName}" not found`)
    }

    const dataMap = this.data.get(resourceName)
    if (!dataMap) return []

    let records = Array.from(dataMap.values())

    // Apply where filter
    if (options?.where) {
      records = records.filter((record) => {
        for (const [key, value] of Object.entries(options.where!)) {
          if (record[key] !== value) return false
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

    return records.map((r) => ({ ...r }))
  }

  update(resourceName: string, id: string, data: Record<string, unknown>): Record<string, unknown> {
    const resource = this.schema.resources.find((r) => r.name === resourceName)
    if (!resource) {
      throw new Error(`Resource "${resourceName}" not found`)
    }

    const dataMap = this.data.get(resourceName)
    if (!dataMap) {
      throw new Error(`Record with id "${id}" not found in resource "${resourceName}"`)
    }

    const existing = dataMap.get(id)
    if (!existing) {
      throw new Error(`Record with id "${id}" not found in resource "${resourceName}"`)
    }

    const updated = {
      ...existing,
      ...data,
      id: existing.id, // Don't allow changing id
      createdAt: existing.createdAt, // Don't allow changing createdAt
      updatedAt: new Date().toISOString(),
    }

    dataMap.set(id, updated)
    return { ...updated }
  }

  delete(resourceName: string, id: string): boolean {
    const resource = this.schema.resources.find((r) => r.name === resourceName)
    if (!resource) {
      throw new Error(`Resource "${resourceName}" not found`)
    }

    const dataMap = this.data.get(resourceName)
    if (!dataMap) return false

    return dataMap.delete(id)
  }

  getRelated(
    resourceName: string,
    id: string,
    relationName: string
  ): Record<string, unknown> | Record<string, unknown>[] | null {
    throw new Error('Not implemented in mock')
  }
}

// ============================================================================
// Test Schema
// ============================================================================

const testSchema: SaaSSchema = {
  metadata: {
    name: 'test-schema',
    version: '1.0.0',
    description: 'Test schema for DataProvider create tests',
  },
  resources: [
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'uuid', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'age', type: 'number', required: false },
        { name: 'createdAt', type: 'datetime', required: true },
        { name: 'updatedAt', type: 'datetime', required: true },
      ],
      relations: [],
    },
    {
      name: 'Post',
      fields: [
        { name: 'id', type: 'uuid', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'content', type: 'string', required: false },
        { name: 'published', type: 'boolean', required: true },
        { name: 'createdAt', type: 'datetime', required: true },
        { name: 'updatedAt', type: 'datetime', required: true },
      ],
      relations: [
        { name: 'author', to: 'User', cardinality: 'one' },
      ],
    },
  ],
}

// ============================================================================
// Tests: DataProvider.create()
// ============================================================================

describe('DataProvider.create()', () => {
  let dataStore: MockDataStore
  let dataProvider: DataProvider

  beforeEach(() => {
    dataStore = new MockDataStore(testSchema)
    dataProvider = createDataStoreProvider({ dataStore })
  })

  // --------------------------------------------------------------------------
  // Test Case 1: Creates record and returns { data: createdRecord }
  // --------------------------------------------------------------------------
  describe('creates record and returns { data: createdRecord }', () => {
    it('should create a record and return it in the correct format', async () => {
      const result = await dataProvider.create('User', {
        data: { name: 'John Doe', email: 'john@example.com' },
      })

      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('name', 'John Doe')
      expect(result.data).toHaveProperty('email', 'john@example.com')
    })

    it('should persist the record in the data store', async () => {
      const result = await dataProvider.create('User', {
        data: { name: 'Jane Doe', email: 'jane@example.com' },
      })

      const stored = dataStore.findById('User', result.data.id as string)
      expect(stored).not.toBeNull()
      expect(stored!.name).toBe('Jane Doe')
      expect(stored!.email).toBe('jane@example.com')
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 2: Generated ID is included in response
  // --------------------------------------------------------------------------
  describe('generated ID is included in response', () => {
    it('should include a generated id in the response', async () => {
      const result = await dataProvider.create('User', {
        data: { name: 'Bob Smith', email: 'bob@example.com' },
      })

      expect(result.data).toHaveProperty('id')
      expect(result.data.id).toBeDefined()
      expect(typeof result.data.id).toBe('string')
    })

    it('should generate a valid UUID for the id', async () => {
      const result = await dataProvider.create('User', {
        data: { name: 'Alice Johnson', email: 'alice@example.com' },
      })

      // UUID v4 format check
      expect(result.data.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    })

    it('should generate unique IDs for each record', async () => {
      const result1 = await dataProvider.create('User', {
        data: { name: 'User 1', email: 'user1@example.com' },
      })
      const result2 = await dataProvider.create('User', {
        data: { name: 'User 2', email: 'user2@example.com' },
      })

      expect(result1.data.id).not.toBe(result2.data.id)
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 3: Timestamps are auto-generated (createdAt, updatedAt)
  // --------------------------------------------------------------------------
  describe('timestamps are auto-generated', () => {
    it('should auto-generate createdAt timestamp', async () => {
      const before = new Date()
      const result = await dataProvider.create('User', {
        data: { name: 'Test User', email: 'test@example.com' },
      })
      const after = new Date()

      expect(result.data).toHaveProperty('createdAt')
      const createdAt = new Date(result.data.createdAt as string)
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should auto-generate updatedAt timestamp', async () => {
      const before = new Date()
      const result = await dataProvider.create('User', {
        data: { name: 'Test User', email: 'test@example.com' },
      })
      const after = new Date()

      expect(result.data).toHaveProperty('updatedAt')
      const updatedAt = new Date(result.data.updatedAt as string)
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should set createdAt and updatedAt to the same value on create', async () => {
      const result = await dataProvider.create('User', {
        data: { name: 'Test User', email: 'test@example.com' },
      })

      expect(result.data.createdAt).toBe(result.data.updatedAt)
    })

    it('should generate ISO 8601 formatted timestamps', async () => {
      const result = await dataProvider.create('User', {
        data: { name: 'Test User', email: 'test@example.com' },
      })

      // ISO 8601 format check
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      expect(result.data.createdAt).toMatch(isoRegex)
      expect(result.data.updatedAt).toMatch(isoRegex)
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 4: All provided fields are saved
  // --------------------------------------------------------------------------
  describe('all provided fields are saved', () => {
    it('should save all provided required fields', async () => {
      const result = await dataProvider.create('User', {
        data: { name: 'Complete User', email: 'complete@example.com' },
      })

      expect(result.data.name).toBe('Complete User')
      expect(result.data.email).toBe('complete@example.com')
    })

    it('should save optional fields when provided', async () => {
      const result = await dataProvider.create('User', {
        data: { name: 'User With Age', email: 'age@example.com', age: 30 },
      })

      expect(result.data.age).toBe(30)
    })

    it('should handle boolean fields correctly', async () => {
      const result = await dataProvider.create('Post', {
        data: { title: 'Test Post', published: false },
      })

      expect(result.data.published).toBe(false)
    })

    it('should handle null values for optional fields', async () => {
      const result = await dataProvider.create('Post', {
        data: { title: 'Post Without Content', published: true, content: null },
      })

      expect(result.data.content).toBeNull()
    })

    it('should save all fields for a complex record', async () => {
      const result = await dataProvider.create('Post', {
        data: {
          title: 'Complex Post',
          content: 'This is the content of the post',
          published: true,
        },
      })

      expect(result.data.title).toBe('Complex Post')
      expect(result.data.content).toBe('This is the content of the post')
      expect(result.data.published).toBe(true)
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 5: Required fields must be present (throws if missing)
  // --------------------------------------------------------------------------
  describe('required fields must be present', () => {
    it('should throw error when required field is missing', async () => {
      await expect(
        dataProvider.create('User', {
          data: { name: 'Missing Email' }, // email is required
        })
      ).rejects.toThrow(/required.*field|missing/i)
    })

    it('should throw error listing the missing field name', async () => {
      await expect(
        dataProvider.create('User', {
          data: { email: 'noemail@example.com' }, // name is required
        })
      ).rejects.toThrow(/name/i)
    })

    it('should throw error when multiple required fields are missing', async () => {
      await expect(
        dataProvider.create('User', {
          data: {}, // both name and email are required
        })
      ).rejects.toThrow(/required.*field/i)
    })

    it('should not require auto-generated fields (id, createdAt, updatedAt)', async () => {
      // Should succeed without providing id, createdAt, or updatedAt
      const result = await dataProvider.create('User', {
        data: { name: 'Auto Fields User', email: 'auto@example.com' },
      })

      expect(result.data.id).toBeDefined()
      expect(result.data.createdAt).toBeDefined()
      expect(result.data.updatedAt).toBeDefined()
    })

    it('should succeed when all required fields are provided', async () => {
      const result = await dataProvider.create('Post', {
        data: { title: 'Required Fields Post', published: true },
      })

      expect(result.data.title).toBe('Required Fields Post')
      expect(result.data.published).toBe(true)
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 6: Creating in non-existent resource throws error
  // --------------------------------------------------------------------------
  describe('creating in non-existent resource throws error', () => {
    it('should throw error when resource does not exist', async () => {
      await expect(
        dataProvider.create('NonExistentResource', {
          data: { foo: 'bar' },
        })
      ).rejects.toThrow(/resource.*not found|unknown resource/i)
    })

    it('should throw error with resource name in message', async () => {
      await expect(
        dataProvider.create('InvalidResource', {
          data: { test: 'data' },
        })
      ).rejects.toThrow(/InvalidResource/i)
    })

    it('should be case-sensitive for resource names', async () => {
      // 'user' (lowercase) should not match 'User' (PascalCase)
      await expect(
        dataProvider.create('user', {
          data: { name: 'Test', email: 'test@example.com' },
        })
      ).rejects.toThrow(/resource.*not found|unknown resource/i)
    })
  })
})
