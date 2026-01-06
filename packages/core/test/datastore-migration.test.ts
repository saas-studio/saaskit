/**
 * DataStore to DO Migration Tests - RED Phase
 *
 * These tests define the expected behavior for:
 * 1. DOAdapter - wraps SaasKitDO to provide IDataStore interface for backwards compatibility
 * 2. Deprecation warnings - logs warnings when using IDataStore methods
 * 3. Migration helper - moves data from legacy DataStore to DO
 *
 * TDD RED Phase: Tests should compile but FAIL because implementations don't exist yet.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  createDOAdapter,
  migrateDataStore,
  resetDeprecationWarnings,
  SaasKitDO,
  type IDataStore,
  type DataStoreMigrationResult,
} from '@saaskit/core'
import { createMockDurableObjectState } from './helpers/mock-do-state'

// ============================================================================
// Test Schema Definition
// ============================================================================

const testSchema = {
  name: 'TestApp',
  resources: {
    users: {
      fields: {
        name: { type: 'string' as const },
        email: { type: 'string' as const, required: true },
      },
    },
    posts: {
      fields: {
        title: { type: 'string' as const, required: true },
        content: { type: 'string' as const },
        authorId: { type: 'string' as const, required: true },
      },
    },
  },
}

// ============================================================================
// Mock Legacy DataStore
// ============================================================================

/**
 * Mock implementation of legacy IDataStore for testing migration
 */
function createMockLegacyDataStore(): IDataStore {
  const store = new Map<string, Map<string, unknown>>()

  return {
    async create(collection: string, data: Record<string, unknown>) {
      if (!store.has(collection)) {
        store.set(collection, new Map())
      }
      const id = data.id as string || crypto.randomUUID()
      const record = { ...data, id }
      store.get(collection)!.set(id, record)
      return record
    },

    async read(collection: string, id: string) {
      return store.get(collection)?.get(id) ?? null
    },

    async list(collection: string, options?: { limit?: number; offset?: number }) {
      const records = Array.from(store.get(collection)?.values() ?? [])
      const offset = options?.offset ?? 0
      const limit = options?.limit ?? 100
      return {
        data: records.slice(offset, offset + limit),
        total: records.length,
      }
    },

    async update(collection: string, id: string, data: Record<string, unknown>) {
      const existing = store.get(collection)?.get(id)
      if (!existing) {
        throw new Error(`Record not found: ${id}`)
      }
      const updated = { ...existing, ...data, id }
      store.get(collection)!.set(id, updated)
      return updated
    },

    async delete(collection: string, id: string) {
      return store.get(collection)?.delete(id) ?? false
    },
  }
}

// ============================================================================
// DOAdapter Tests
// ============================================================================

describe('DOAdapter - IDataStore compatibility layer', () => {
  let mockState: ReturnType<typeof createMockDurableObjectState>
  let doInstance: SaasKitDO
  let adapter: IDataStore

  beforeEach(() => {
    mockState = createMockDurableObjectState()
    doInstance = new SaasKitDO(testSchema)
    adapter = createDOAdapter(doInstance)
  })

  describe('Interface compliance', () => {
    it('should implement IDataStore interface', () => {
      expect(adapter).toBeDefined()
      expect(typeof adapter.create).toBe('function')
      expect(typeof adapter.read).toBe('function')
      expect(typeof adapter.list).toBe('function')
      expect(typeof adapter.update).toBe('function')
      expect(typeof adapter.delete).toBe('function')
    })

    it('should return IDataStore from createDOAdapter', () => {
      const result = createDOAdapter(doInstance)
      expect(result).toBeDefined()
      // Duck typing check - has all IDataStore methods
      expect(result.create).toBeDefined()
      expect(result.read).toBeDefined()
      expect(result.list).toBeDefined()
      expect(result.update).toBeDefined()
      expect(result.delete).toBeDefined()
    })
  })

  describe('create() mapping', () => {
    it('should map create() to DO.create()', async () => {
      const userData = { name: 'John', email: 'john@example.com' }
      const result = await adapter.create('users', userData)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.name).toBe('John')
      expect(result.email).toBe('john@example.com')
    })

    it('should store record accessible via DO.read()', async () => {
      const userData = { name: 'Jane', email: 'jane@example.com' }
      const created = await adapter.create('users', userData)

      // Verify via DO directly
      const fromDO = await doInstance.read('users', created.id)
      expect(fromDO).not.toBeNull()
      expect(fromDO!.name).toBe('Jane')
    })

    it('should auto-generate id if not provided', async () => {
      const result = await adapter.create('users', { email: 'noid@example.com' })
      expect(result.id).toBeDefined()
      expect(typeof result.id).toBe('string')
      expect(result.id.length).toBeGreaterThan(0)
    })
  })

  describe('read() mapping', () => {
    it('should map read() to DO.get()', async () => {
      const created = await doInstance.create('users', { name: 'Test', email: 'test@example.com' })
      const result = await adapter.read('users', created.id)

      expect(result).not.toBeNull()
      expect(result!.id).toBe(created.id)
      expect(result!.name).toBe('Test')
    })

    it('should return null for non-existent records', async () => {
      const result = await adapter.read('users', 'non-existent-id')
      expect(result).toBeNull()
    })

    it('should preserve all fields from DO', async () => {
      const created = await doInstance.create('users', { name: 'Full', email: 'full@example.com' })
      const result = await adapter.read('users', created.id)

      expect(result).toMatchObject({
        id: created.id,
        name: 'Full',
        email: 'full@example.com',
      })
    })
  })

  describe('list() mapping', () => {
    it('should map list() to DO.list()', async () => {
      await doInstance.create('users', { name: 'User 1', email: 'u1@example.com' })
      await doInstance.create('users', { name: 'User 2', email: 'u2@example.com' })

      const result = await adapter.list('users')

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should support limit option', async () => {
      for (let i = 1; i <= 5; i++) {
        await doInstance.create('users', { name: `User ${i}`, email: `u${i}@example.com` })
      }

      const result = await adapter.list('users', { limit: 2 })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(5)
    })

    it('should support offset option', async () => {
      for (let i = 1; i <= 5; i++) {
        await doInstance.create('users', { name: `User ${i}`, email: `u${i}@example.com` })
      }

      const result = await adapter.list('users', { offset: 3 })

      expect(result.data).toHaveLength(2)
    })

    it('should return empty array when no records exist', async () => {
      const result = await adapter.list('users')

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('update() mapping', () => {
    it('should map update() to DO.update()', async () => {
      const created = await doInstance.create('users', { name: 'Old', email: 'old@example.com' })
      const result = await adapter.update('users', created.id, { name: 'New' })

      expect(result.name).toBe('New')
      expect(result.email).toBe('old@example.com') // Unchanged
    })

    it('should persist updates to DO storage', async () => {
      const created = await doInstance.create('users', { name: 'Before', email: 'before@example.com' })
      await adapter.update('users', created.id, { name: 'After' })

      const fromDO = await doInstance.read('users', created.id)
      expect(fromDO!.name).toBe('After')
    })

    it('should throw for non-existent record', async () => {
      await expect(adapter.update('users', 'non-existent', { name: 'Test' }))
        .rejects.toThrow(/not found/i)
    })
  })

  describe('delete() mapping', () => {
    it('should map delete() to DO.delete()', async () => {
      const created = await doInstance.create('users', { name: 'ToDelete', email: 'del@example.com' })
      const result = await adapter.delete('users', created.id)

      expect(result).toBe(true)
    })

    it('should remove record from DO storage', async () => {
      const created = await doInstance.create('users', { name: 'ToDelete', email: 'del@example.com' })
      await adapter.delete('users', created.id)

      const fromDO = await doInstance.read('users', created.id)
      expect(fromDO).toBeNull()
    })

    it('should return false for non-existent record', async () => {
      const result = await adapter.delete('users', 'non-existent')
      expect(result).toBe(false)
    })
  })
})

// ============================================================================
// Deprecation Warning Tests
// ============================================================================

describe('Deprecation warnings', () => {
  let mockState: ReturnType<typeof createMockDurableObjectState>
  let doInstance: SaasKitDO
  let adapter: IDataStore
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Reset warnings before each test so we can test fresh
    resetDeprecationWarnings()
    // Set up spy BEFORE creating adapter so we capture the warnings
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockState = createMockDurableObjectState()
    doInstance = new SaasKitDO(testSchema)
    adapter = createDOAdapter(doInstance)
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should log deprecation warning on create()', async () => {
    await adapter.create('users', { email: 'test@example.com' })

    expect(consoleWarnSpy).toHaveBeenCalled()
    expect(consoleWarnSpy.mock.calls[0][0]).toMatch(/deprecat/i)
  })

  it('should log deprecation warning on read()', async () => {
    const created = await doInstance.create('users', { email: 'test@example.com' })
    consoleWarnSpy.mockClear()

    await adapter.read('users', created.id)

    expect(consoleWarnSpy).toHaveBeenCalled()
    expect(consoleWarnSpy.mock.calls[0][0]).toMatch(/deprecat/i)
  })

  it('should log deprecation warning on list()', async () => {
    await adapter.list('users')

    expect(consoleWarnSpy).toHaveBeenCalled()
    expect(consoleWarnSpy.mock.calls[0][0]).toMatch(/deprecat/i)
  })

  it('should log deprecation warning on update()', async () => {
    const created = await doInstance.create('users', { email: 'test@example.com' })
    consoleWarnSpy.mockClear()

    await adapter.update('users', created.id, { name: 'Updated' })

    expect(consoleWarnSpy).toHaveBeenCalled()
    expect(consoleWarnSpy.mock.calls[0][0]).toMatch(/deprecat/i)
  })

  it('should log deprecation warning on delete()', async () => {
    const created = await doInstance.create('users', { email: 'test@example.com' })
    consoleWarnSpy.mockClear()

    await adapter.delete('users', created.id)

    expect(consoleWarnSpy).toHaveBeenCalled()
    expect(consoleWarnSpy.mock.calls[0][0]).toMatch(/deprecat/i)
  })

  it('should include migration guidance in warning message', async () => {
    await adapter.create('users', { email: 'test@example.com' })

    const warningMessage = consoleWarnSpy.mock.calls[0][0]
    expect(warningMessage).toMatch(/SaasKitDO|migrate|DO/i)
  })

  it('should only warn once per method (memoized warning)', async () => {
    await adapter.create('users', { email: 'test1@example.com' })
    await adapter.create('users', { email: 'test2@example.com' })
    await adapter.create('users', { email: 'test3@example.com' })

    // Should only have one warning for create, not three
    const createWarnings = consoleWarnSpy.mock.calls.filter(
      (call) => call[0].includes('create')
    )
    expect(createWarnings.length).toBeLessThanOrEqual(1)
  })
})

// ============================================================================
// Migration Helper Tests
// ============================================================================

describe('migrateDataStore() - Migration helper', () => {
  let targetDO: SaasKitDO
  let legacyStore: IDataStore

  beforeEach(() => {
    targetDO = new SaasKitDO(testSchema)
    legacyStore = createMockLegacyDataStore()
  })

  describe('Basic migration', () => {
    it('should migrate all records from legacy DataStore to DO', async () => {
      // Setup legacy data
      await legacyStore.create('users', { id: 'u1', name: 'User 1', email: 'u1@example.com' })
      await legacyStore.create('users', { id: 'u2', name: 'User 2', email: 'u2@example.com' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema)

      expect(result.success).toBe(true)
      expect(result.migratedCount).toBe(2)

      // Verify data in target DO
      const users = await targetDO.list('users')
      expect(users.data).toHaveLength(2)
    })

    it('should migrate multiple collections', async () => {
      await legacyStore.create('users', { id: 'u1', name: 'User 1', email: 'u1@example.com' })
      await legacyStore.create('posts', { id: 'p1', title: 'Post 1', authorId: 'u1' })
      await legacyStore.create('posts', { id: 'p2', title: 'Post 2', authorId: 'u1' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema)

      expect(result.success).toBe(true)
      expect(result.migratedCount).toBe(3)

      const users = await targetDO.list('users')
      const posts = await targetDO.list('posts')
      expect(users.data).toHaveLength(1)
      expect(posts.data).toHaveLength(2)
    })

    it('should preserve record IDs during migration', async () => {
      const originalId = 'preserved-user-id'
      await legacyStore.create('users', { id: originalId, name: 'Test', email: 'test@example.com' })

      await migrateDataStore(legacyStore, targetDO, testSchema)

      const migrated = await targetDO.read('users', originalId)
      expect(migrated).not.toBeNull()
      expect(migrated!.id).toBe(originalId)
    })

    it('should preserve all field values', async () => {
      await legacyStore.create('users', {
        id: 'full-user',
        name: 'Full Name',
        email: 'full@example.com',
      })

      await migrateDataStore(legacyStore, targetDO, testSchema)

      const migrated = await targetDO.read('users', 'full-user')
      expect(migrated).toMatchObject({
        id: 'full-user',
        name: 'Full Name',
        email: 'full@example.com',
      })
    })
  })

  describe('Migration result', () => {
    it('should return migration result with success status', async () => {
      await legacyStore.create('users', { id: 'u1', email: 'u1@example.com' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema)

      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
      expect(result.success).toBe(true)
    })

    it('should return count of migrated records', async () => {
      await legacyStore.create('users', { id: 'u1', email: 'u1@example.com' })
      await legacyStore.create('users', { id: 'u2', email: 'u2@example.com' })
      await legacyStore.create('users', { id: 'u3', email: 'u3@example.com' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema)

      expect(result.migratedCount).toBe(3)
    })

    it('should return breakdown by collection', async () => {
      await legacyStore.create('users', { id: 'u1', email: 'u1@example.com' })
      await legacyStore.create('posts', { id: 'p1', title: 'Post', authorId: 'u1' })
      await legacyStore.create('posts', { id: 'p2', title: 'Post 2', authorId: 'u1' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema)

      expect(result.byCollection).toBeDefined()
      expect(result.byCollection.users).toBe(1)
      expect(result.byCollection.posts).toBe(2)
    })

    it('should return empty result for empty source', async () => {
      const result = await migrateDataStore(legacyStore, targetDO, testSchema)

      expect(result.success).toBe(true)
      expect(result.migratedCount).toBe(0)
    })
  })

  describe('Error handling', () => {
    it('should handle validation errors gracefully', async () => {
      // Create record missing required field
      await legacyStore.create('users', { id: 'invalid', name: 'No Email' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema)

      expect(result.errors).toBeDefined()
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toMatch(/users|invalid|required/i)
    })

    it('should continue migration after individual errors', async () => {
      // One invalid, two valid
      await legacyStore.create('users', { id: 'invalid', name: 'No Email' })
      await legacyStore.create('users', { id: 'valid1', email: 'valid1@example.com' })
      await legacyStore.create('users', { id: 'valid2', email: 'valid2@example.com' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema)

      expect(result.migratedCount).toBe(2)
      expect(result.errors.length).toBe(1)
    })

    it('should report partial success when some records fail', async () => {
      await legacyStore.create('users', { id: 'invalid', name: 'No Email' })
      await legacyStore.create('users', { id: 'valid', email: 'valid@example.com' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema)

      expect(result.success).toBe(false) // Partial failure
      expect(result.migratedCount).toBe(1)
      expect(result.failedCount).toBe(1)
    })
  })

  describe('Migration options', () => {
    it('should support dry-run mode', async () => {
      await legacyStore.create('users', { id: 'u1', email: 'u1@example.com' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema, { dryRun: true })

      expect(result.dryRun).toBe(true)
      expect(result.migratedCount).toBe(1)

      // Verify nothing was actually written
      const users = await targetDO.list('users')
      expect(users.data).toHaveLength(0)
    })

    it('should support selective collection migration', async () => {
      await legacyStore.create('users', { id: 'u1', email: 'u1@example.com' })
      await legacyStore.create('posts', { id: 'p1', title: 'Post', authorId: 'u1' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema, {
        collections: ['users'],
      })

      expect(result.migratedCount).toBe(1)
      expect(result.byCollection.users).toBe(1)
      expect(result.byCollection.posts).toBeUndefined()
    })

    it('should support batch size option', async () => {
      // Create many records
      for (let i = 1; i <= 100; i++) {
        await legacyStore.create('users', { id: `u${i}`, email: `u${i}@example.com` })
      }

      const result = await migrateDataStore(legacyStore, targetDO, testSchema, {
        batchSize: 10,
      })

      expect(result.success).toBe(true)
      expect(result.migratedCount).toBe(100)
    })

    it('should support progress callback', async () => {
      await legacyStore.create('users', { id: 'u1', email: 'u1@example.com' })
      await legacyStore.create('users', { id: 'u2', email: 'u2@example.com' })

      const progressCalls: Array<{ current: number; total: number }> = []
      const onProgress = (current: number, total: number) => {
        progressCalls.push({ current, total })
      }

      await migrateDataStore(legacyStore, targetDO, testSchema, { onProgress })

      expect(progressCalls.length).toBeGreaterThan(0)
      expect(progressCalls[progressCalls.length - 1].current).toBe(
        progressCalls[progressCalls.length - 1].total
      )
    })
  })

  describe('Idempotency', () => {
    it('should skip records that already exist in target', async () => {
      // Create record in both source and target with same ID
      await legacyStore.create('users', { id: 'existing', email: 'existing@example.com', name: 'Original' })
      await targetDO.create('users', { id: 'existing', email: 'existing@example.com' })

      const result = await migrateDataStore(legacyStore, targetDO, testSchema)

      expect(result.skippedCount).toBe(1)
    })

    it('should support upsert mode to overwrite existing', async () => {
      await legacyStore.create('users', { id: 'existing', email: 'new@example.com', name: 'Updated' })
      const existingInTarget = await targetDO.create('users', { email: 'old@example.com', name: 'Old' })

      await migrateDataStore(legacyStore, targetDO, testSchema, {
        upsert: true,
        idMapping: { existing: existingInTarget.id },
      })

      const updated = await targetDO.read('users', existingInTarget.id)
      expect(updated!.name).toBe('Updated')
    })
  })
})
