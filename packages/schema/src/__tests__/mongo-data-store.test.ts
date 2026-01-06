import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { MongoDataStore } from '../mongo-data-store'
import { parseSchemaYaml } from '../yaml-parser'
import type { SaaSSchema } from '../types'

// Helper type for records with populated relations
type RecordWithRelations = Record<string, unknown> & {
  company?: RecordWithRelations
  contact?: RecordWithRelations
  name?: string
  _id?: string
}

/**
 * MongoDataStore Tests (TDD Red Phase)
 *
 * These tests define the expected behavior of MongoDataStore,
 * which wraps mongo.do for schema-driven data operations.
 */

// ============================================================================
// Test Schema Definitions
// ============================================================================

const todoSchemaYaml = `
app:
  name: todos
  version: "1.0.0"

resources:
  List:
    id: auto
    name: text
    color?: text
    createdAt: auto
    updatedAt: auto

  Todo:
    id: auto
    title: text
    completed: boolean
    priority: low | medium | high
    dueDate?: date
    createdAt: auto
    updatedAt: auto
    list: ->List
`

const crmSchemaYaml = `
app:
  name: crm
  version: "1.0.0"

resources:
  Company:
    id: auto
    name: text
    industry?: text
    createdAt: auto

  Contact:
    id: auto
    name: text
    email: email
    company: ->Company
    createdAt: auto

  Deal:
    id: auto
    title: text
    value: number
    stage: discovery | proposal | negotiation | won | lost
    company: ->Company
    contact: ->Contact
    createdAt: auto
`

// ============================================================================
// 1. Connection Tests
// ============================================================================

describe('MongoDataStore - Connection', () => {
  let schema: SaaSSchema
  let store: MongoDataStore

  beforeEach(() => {
    schema = parseSchemaYaml(todoSchemaYaml)
  })

  afterEach(async () => {
    if (store) {
      await store.disconnect()
    }
  })

  it('should connect to mongo.do with URI', async () => {
    store = new MongoDataStore(schema, {
      uri: 'mongodb://localhost:27017',
      database: 'saaskit-test',
    })

    await store.connect()
    expect(store.isConnected).toBe(true)
  })

  it('should connect in-memory mode for testing', async () => {
    store = new MongoDataStore(schema, {
      inMemory: true,
      database: 'test',
    })

    await store.connect()
    expect(store.isConnected).toBe(true)
  })

  it('should disconnect cleanly', async () => {
    store = new MongoDataStore(schema, { inMemory: true, database: 'test' })
    await store.connect()
    await store.disconnect()
    expect(store.isConnected).toBe(false)
  })

  it('should auto-create collections for schema resources', async () => {
    store = new MongoDataStore(schema, { inMemory: true, database: 'test' })
    await store.connect()

    const collections = await store.listCollections()
    expect(collections).toContain('List')
    expect(collections).toContain('Todo')
  })
})

// ============================================================================
// 2. CRUD Operations Tests
// ============================================================================

describe('MongoDataStore - CRUD Operations', () => {
  let schema: SaaSSchema
  let store: MongoDataStore

  beforeEach(async () => {
    schema = parseSchemaYaml(todoSchemaYaml)
    store = new MongoDataStore(schema, { inMemory: true, database: 'test' })
    await store.connect()
  })

  afterEach(async () => {
    await store.disconnect()
  })

  describe('create()', () => {
    it('should create a record with auto-generated _id', async () => {
      const list = await store.create('List', { name: 'Work' })

      expect(list._id).toBeDefined()
      expect(typeof list._id).toBe('string')
      expect(list.name).toBe('Work')
    })

    it('should auto-set createdAt timestamp', async () => {
      const before = new Date()
      const list = await store.create('List', { name: 'Tasks' })
      const after = new Date()

      expect(list.createdAt).toBeDefined()
      const createdAt = new Date(list.createdAt as string)
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should validate required fields', async () => {
      await expect(store.create('List', {})).rejects.toThrow(/required/i)
    })

    it('should validate enum values', async () => {
      const list = await store.create('List', { name: 'Work' })
      await expect(
        store.create('Todo', {
          title: 'Task',
          completed: false,
          priority: 'invalid',
          listId: list._id,
        })
      ).rejects.toThrow(/invalid.*priority/i)
    })

    it('should store optional fields as null when not provided', async () => {
      const list = await store.create('List', { name: 'Minimal' })
      expect(list.color).toBeNull()
    })

    it('should create record with foreign key', async () => {
      const list = await store.create('List', { name: 'Work' })
      const todo = await store.create('Todo', {
        title: 'Finish report',
        completed: false,
        priority: 'high',
        listId: list._id,
      })

      expect(todo.listId).toBe(list._id)
    })
  })

  describe('findById()', () => {
    it('should find a record by _id', async () => {
      const created = await store.create('List', { name: 'Groceries' })
      const found = await store.findById('List', created._id as string)

      expect(found).not.toBeNull()
      expect(found!._id).toBe(created._id)
      expect(found!.name).toBe('Groceries')
    })

    it('should return null for non-existent _id', async () => {
      const found = await store.findById('List', 'non-existent-id')
      expect(found).toBeNull()
    })

    it('should throw for unknown resource', async () => {
      await expect(store.findById('Unknown', 'some-id')).rejects.toThrow(
        /resource.*not found/i
      )
    })
  })

  describe('update()', () => {
    it('should update a record and return updated version', async () => {
      const created = await store.create('List', { name: 'Old Name' })
      const updated = await store.update('List', created._id as string, {
        name: 'New Name',
      })

      expect(updated.name).toBe('New Name')
      expect(updated._id).toBe(created._id)
    })

    it('should update updatedAt timestamp', async () => {
      const created = await store.create('List', { name: 'Test' })
      const originalUpdatedAt = created.updatedAt

      // Small delay to ensure different timestamp
      await new Promise((r) => setTimeout(r, 10))

      const updated = await store.update('List', created._id as string, {
        name: 'Updated',
      })

      expect(new Date(updated.updatedAt as string).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt as string).getTime()
      )
    })

    it('should throw for non-existent record', async () => {
      await expect(
        store.update('List', 'non-existent', { name: 'Test' })
      ).rejects.toThrow(/not found/i)
    })
  })

  describe('delete()', () => {
    it('should delete a record and return true', async () => {
      const created = await store.create('List', { name: 'To Delete' })
      const result = await store.delete('List', created._id as string)

      expect(result).toBe(true)
    })

    it('should remove the record from the store', async () => {
      const created = await store.create('List', { name: 'To Delete' })
      await store.delete('List', created._id as string)

      const found = await store.findById('List', created._id as string)
      expect(found).toBeNull()
    })

    it('should return false for non-existent record', async () => {
      const result = await store.delete('List', 'non-existent-id')
      expect(result).toBe(false)
    })
  })
})

// ============================================================================
// 3. Query Operator Tests (MongoDB-style)
// ============================================================================

describe('MongoDataStore - Query Operators', () => {
  let schema: SaaSSchema
  let store: MongoDataStore

  beforeEach(async () => {
    schema = parseSchemaYaml(crmSchemaYaml)
    store = new MongoDataStore(schema, { inMemory: true, database: 'test' })
    await store.connect()

    // Seed test data
    const company = await store.create('Company', {
      name: 'Acme Corp',
      industry: 'Technology',
    })

    await store.create('Deal', {
      title: 'Small Deal',
      value: 10000,
      stage: 'discovery',
      companyId: company._id,
    })
    await store.create('Deal', {
      title: 'Medium Deal',
      value: 50000,
      stage: 'proposal',
      companyId: company._id,
    })
    await store.create('Deal', {
      title: 'Large Deal',
      value: 100000,
      stage: 'negotiation',
      companyId: company._id,
    })
    await store.create('Deal', {
      title: 'Won Deal',
      value: 75000,
      stage: 'won',
      companyId: company._id,
    })
  })

  afterEach(async () => {
    await store.disconnect()
  })

  describe('Comparison Operators', () => {
    it('should support $gt (greater than)', async () => {
      const deals = await store.findAll('Deal', {
        where: { value: { $gt: 50000 } },
      })

      expect(deals).toHaveLength(2)
      expect(deals.every((d) => (d.value as number) > 50000)).toBe(true)
    })

    it('should support $gte (greater than or equal)', async () => {
      const deals = await store.findAll('Deal', {
        where: { value: { $gte: 50000 } },
      })

      expect(deals).toHaveLength(3)
    })

    it('should support $lt (less than)', async () => {
      const deals = await store.findAll('Deal', {
        where: { value: { $lt: 50000 } },
      })

      expect(deals).toHaveLength(1)
      expect(deals[0].title).toBe('Small Deal')
    })

    it('should support $lte (less than or equal)', async () => {
      const deals = await store.findAll('Deal', {
        where: { value: { $lte: 50000 } },
      })

      expect(deals).toHaveLength(2)
    })

    it('should support $ne (not equal)', async () => {
      const deals = await store.findAll('Deal', {
        where: { stage: { $ne: 'won' } },
      })

      expect(deals).toHaveLength(3)
      expect(deals.every((d) => d.stage !== 'won')).toBe(true)
    })
  })

  describe('Array Operators', () => {
    it('should support $in (value in array)', async () => {
      const deals = await store.findAll('Deal', {
        where: { stage: { $in: ['proposal', 'negotiation'] } },
      })

      expect(deals).toHaveLength(2)
    })

    it('should support $nin (value not in array)', async () => {
      const deals = await store.findAll('Deal', {
        where: { stage: { $nin: ['won', 'lost'] } },
      })

      expect(deals).toHaveLength(3)
    })
  })

  describe('Logical Operators', () => {
    it('should support $and (all conditions must match)', async () => {
      const deals = await store.findAll('Deal', {
        where: {
          $and: [{ value: { $gte: 50000 } }, { stage: { $ne: 'won' } }],
        },
      })

      expect(deals).toHaveLength(2)
    })

    it('should support $or (any condition can match)', async () => {
      const deals = await store.findAll('Deal', {
        where: {
          $or: [{ stage: 'discovery' }, { stage: 'won' }],
        },
      })

      expect(deals).toHaveLength(2)
    })

    it('should support $not (negate condition)', async () => {
      const deals = await store.findAll('Deal', {
        where: {
          value: { $not: { $gt: 50000 } },
        },
      })

      expect(deals).toHaveLength(2) // 10000 and 50000
    })
  })

  describe('String Operators', () => {
    it('should support $regex (pattern matching)', async () => {
      const deals = await store.findAll('Deal', {
        where: { title: { $regex: 'Deal$' } },
      })

      expect(deals).toHaveLength(4)
    })

    it('should support case-insensitive $regex', async () => {
      const deals = await store.findAll('Deal', {
        where: { title: { $regex: 'small', $options: 'i' } },
      })

      expect(deals).toHaveLength(1)
      expect(deals[0].title).toBe('Small Deal')
    })
  })
})

// ============================================================================
// 4. Sorting Tests
// ============================================================================

describe('MongoDataStore - Sorting', () => {
  let schema: SaaSSchema
  let store: MongoDataStore

  beforeEach(async () => {
    schema = parseSchemaYaml(crmSchemaYaml)
    store = new MongoDataStore(schema, { inMemory: true, database: 'test' })
    await store.connect()

    // Create deals with different values
    await store.create('Deal', { title: 'C Deal', value: 30000, stage: 'proposal' })
    await store.create('Deal', { title: 'A Deal', value: 10000, stage: 'discovery' })
    await store.create('Deal', { title: 'B Deal', value: 20000, stage: 'negotiation' })
  })

  afterEach(async () => {
    await store.disconnect()
  })

  it('should sort ascending by single field', async () => {
    const deals = await store.findAll('Deal', {
      orderBy: { value: 'asc' },
    })

    expect(deals[0].value).toBe(10000)
    expect(deals[1].value).toBe(20000)
    expect(deals[2].value).toBe(30000)
  })

  it('should sort descending by single field', async () => {
    const deals = await store.findAll('Deal', {
      orderBy: { value: 'desc' },
    })

    expect(deals[0].value).toBe(30000)
    expect(deals[1].value).toBe(20000)
    expect(deals[2].value).toBe(10000)
  })

  it('should sort by string field', async () => {
    const deals = await store.findAll('Deal', {
      orderBy: { title: 'asc' },
    })

    expect(deals[0].title).toBe('A Deal')
    expect(deals[1].title).toBe('B Deal')
    expect(deals[2].title).toBe('C Deal')
  })

  it('should support multiple sort fields', async () => {
    await store.create('Deal', { title: 'D Deal', value: 10000, stage: 'won' })

    const deals = await store.findAll('Deal', {
      orderBy: { value: 'asc', title: 'desc' },
    })

    // Both have value 10000, so sorted by title descending
    expect(deals[0].title).toBe('D Deal')
    expect(deals[1].title).toBe('A Deal')
  })
})

// ============================================================================
// 5. Relation Tests ($lookup)
// ============================================================================

describe('MongoDataStore - Relations', () => {
  let schema: SaaSSchema
  let store: MongoDataStore
  let companyId: string
  let contactId: string

  beforeEach(async () => {
    schema = parseSchemaYaml(crmSchemaYaml)
    store = new MongoDataStore(schema, { inMemory: true, database: 'test' })
    await store.connect()

    // Create related records
    const company = await store.create('Company', {
      name: 'Acme Corp',
      industry: 'Technology',
    })
    companyId = company._id as string

    const contact = await store.create('Contact', {
      name: 'John Doe',
      email: 'john@acme.com',
      companyId,
    })
    contactId = contact._id as string

    await store.create('Deal', {
      title: 'Enterprise License',
      value: 100000,
      stage: 'proposal',
      companyId,
      contactId,
    })
  })

  afterEach(async () => {
    await store.disconnect()
  })

  describe('include (eager loading)', () => {
    it('should include belongsTo relation', async () => {
      const deals = await store.findAll('Deal', {
        include: ['company'],
      }) as RecordWithRelations[]

      expect(deals[0].company).toBeDefined()
      expect(deals[0].company!.name).toBe('Acme Corp')
    })

    it('should include multiple relations', async () => {
      const deals = await store.findAll('Deal', {
        include: ['company', 'contact'],
      }) as RecordWithRelations[]

      expect(deals[0].company).toBeDefined()
      expect(deals[0].company!.name).toBe('Acme Corp')
      expect(deals[0].contact).toBeDefined()
      expect(deals[0].contact!.name).toBe('John Doe')
    })

    it('should handle null relation gracefully', async () => {
      await store.create('Deal', {
        title: 'No Contact Deal',
        value: 50000,
        stage: 'discovery',
        companyId,
        // No contactId
      })

      const deals = await store.findAll('Deal', {
        where: { title: 'No Contact Deal' },
        include: ['contact'],
      })

      expect(deals[0].contact).toBeNull()
    })
  })

  describe('getRelated()', () => {
    it('should get belongsTo relation', async () => {
      const deals = await store.findAll('Deal')
      const company = await store.getRelated('Deal', deals[0]._id as string, 'company')

      expect(company).not.toBeNull()
      expect((company as Record<string, unknown>).name).toBe('Acme Corp')
    })

    it('should get hasMany relation (inverse)', async () => {
      // Create more contacts for the company
      await store.create('Contact', {
        name: 'Jane Doe',
        email: 'jane@acme.com',
        companyId,
      })

      const contacts = await store.getRelated('Company', companyId, 'contacts')

      expect(Array.isArray(contacts)).toBe(true)
      expect(contacts).toHaveLength(2)
    })
  })
})

// ============================================================================
// 6. Aggregation Tests
// ============================================================================

describe('MongoDataStore - Aggregations', () => {
  let schema: SaaSSchema
  let store: MongoDataStore

  beforeEach(async () => {
    schema = parseSchemaYaml(crmSchemaYaml)
    store = new MongoDataStore(schema, { inMemory: true, database: 'test' })
    await store.connect()

    const company = await store.create('Company', { name: 'Acme' })
    await store.create('Deal', { title: 'D1', value: 10000, stage: 'won', companyId: company._id })
    await store.create('Deal', { title: 'D2', value: 20000, stage: 'won', companyId: company._id })
    await store.create('Deal', { title: 'D3', value: 30000, stage: 'lost', companyId: company._id })
  })

  afterEach(async () => {
    await store.disconnect()
  })

  it('should count records', async () => {
    const count = await store.count('Deal')
    expect(count).toBe(3)
  })

  it('should count with filter', async () => {
    const count = await store.count('Deal', { where: { stage: 'won' } })
    expect(count).toBe(2)
  })

  it('should support custom aggregation pipeline', async () => {
    const result = await store.aggregate('Deal', [
      { $match: { stage: 'won' } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ])

    expect(result[0].total).toBe(30000)
  })
})

// ============================================================================
// 7. Transaction Tests
// ============================================================================

describe('MongoDataStore - Transactions', () => {
  let schema: SaaSSchema
  let store: MongoDataStore

  beforeEach(async () => {
    schema = parseSchemaYaml(crmSchemaYaml)
    store = new MongoDataStore(schema, { inMemory: true, database: 'test' })
    await store.connect()
  })

  afterEach(async () => {
    await store.disconnect()
  })

  it('should commit transaction on success', async () => {
    await store.withTransaction(async (session) => {
      await store.create('Company', { name: 'Acme' }, { session })
      await store.create('Company', { name: 'Beta' }, { session })
    })

    const companies = await store.findAll('Company')
    expect(companies).toHaveLength(2)
  })

  it('should rollback transaction on error', async () => {
    try {
      await store.withTransaction(async (session) => {
        await store.create('Company', { name: 'Acme' }, { session })
        throw new Error('Intentional failure')
      })
    } catch {
      // Expected
    }

    const companies = await store.findAll('Company')
    expect(companies).toHaveLength(0)
  })
})

// ============================================================================
// 8. Schema Access
// ============================================================================

describe('MongoDataStore - Schema Access', () => {
  let schema: SaaSSchema
  let store: MongoDataStore

  beforeEach(async () => {
    schema = parseSchemaYaml(todoSchemaYaml)
    store = new MongoDataStore(schema, { inMemory: true, database: 'test' })
    await store.connect()
  })

  afterEach(async () => {
    await store.disconnect()
  })

  it('should expose the schema', () => {
    expect(store.schema).toBe(schema)
  })

  it('should list available resources', () => {
    const resources = store.getResources()
    expect(resources).toContain('List')
    expect(resources).toContain('Todo')
  })

  it('should get resource metadata', () => {
    const todoResource = store.getResource('Todo')
    expect(todoResource).toBeDefined()
    expect(todoResource!.name).toBe('Todo')
    expect(todoResource!.fields.length).toBeGreaterThan(0)
  })
})
