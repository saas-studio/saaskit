import { describe, it, expect, beforeEach, vi } from 'vitest'
import type {
  DataProvider,
  UpdateManyParams,
  UpdateManyResult,
  RaRecord,
  Identifier,
} from '../types'
import type { IDataStore } from '@saaskit/schema'

// ============================================================================
// Mock DataStore
// ============================================================================

/**
 * Creates a mock DataStore for testing the DataProvider
 */
function createMockDataStore(): IDataStore & {
  _records: Map<string, Map<string, Record<string, unknown>>>
} {
  const records = new Map<string, Map<string, Record<string, unknown>>>()

  return {
    _records: records,
    schema: {
      metadata: { name: 'test', version: '1.0.0' },
      resources: [],
    },

    create: vi.fn((resourceName: string, data: Record<string, unknown>) => {
      if (!records.has(resourceName)) {
        records.set(resourceName, new Map())
      }
      const id = data.id as string || crypto.randomUUID()
      const record = { ...data, id }
      records.get(resourceName)!.set(id, record)
      return { ...record }
    }),

    findById: vi.fn((resourceName: string, id: string) => {
      const resourceRecords = records.get(resourceName)
      if (!resourceRecords) return null
      const record = resourceRecords.get(id)
      return record ? { ...record } : null
    }),

    findAll: vi.fn((resourceName: string) => {
      const resourceRecords = records.get(resourceName)
      if (!resourceRecords) return []
      return Array.from(resourceRecords.values()).map((r) => ({ ...r }))
    }),

    update: vi.fn((resourceName: string, id: string, data: Record<string, unknown>) => {
      const resourceRecords = records.get(resourceName)
      if (!resourceRecords) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      const existing = resourceRecords.get(id)
      if (!existing) {
        throw new Error(`Record with id "${id}" not found in resource "${resourceName}"`)
      }
      const updated = { ...existing, ...data, id }
      resourceRecords.set(id, updated)
      return { ...updated }
    }),

    delete: vi.fn((resourceName: string, id: string) => {
      const resourceRecords = records.get(resourceName)
      if (!resourceRecords) return false
      return resourceRecords.delete(id)
    }),

    getRelated: vi.fn(() => null),
  }
}

// ============================================================================
// Stub DataProvider factory (to be implemented)
// ============================================================================

/**
 * Creates a DataProvider that wraps a DataStore
 * This is the function under test - it should be imported from ../index
 * For now, we import and use it to make tests fail (RED phase)
 */
import { createDataStoreProvider } from '../index'

// ============================================================================
// Tests for updateMany
// ============================================================================

describe('DataProvider.updateMany()', () => {
  let mockDataStore: ReturnType<typeof createMockDataStore>
  let dataProvider: DataProvider

  beforeEach(() => {
    mockDataStore = createMockDataStore()
    dataProvider = createDataStoreProvider({ dataStore: mockDataStore })
  })

  // --------------------------------------------------------------------------
  // Test Case 1: Updates all records with given IDs
  // --------------------------------------------------------------------------
  describe('updates all records with given IDs', () => {
    it('should update all records matching the provided IDs', async () => {
      // Seed data
      mockDataStore.create('posts', { id: '1', title: 'Post 1', status: 'draft' })
      mockDataStore.create('posts', { id: '2', title: 'Post 2', status: 'draft' })
      mockDataStore.create('posts', { id: '3', title: 'Post 3', status: 'draft' })

      const params: UpdateManyParams = {
        ids: ['1', '2', '3'],
        data: { status: 'published' },
      }

      const result = await dataProvider.updateMany('posts', params)

      // Verify all records were updated
      const post1 = mockDataStore.findById('posts', '1')
      const post2 = mockDataStore.findById('posts', '2')
      const post3 = mockDataStore.findById('posts', '3')

      expect(post1?.status).toBe('published')
      expect(post2?.status).toBe('published')
      expect(post3?.status).toBe('published')
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 2: Returns { data: updatedIds[] }
  // --------------------------------------------------------------------------
  describe('returns { data: updatedIds[] }', () => {
    it('should return an object with data array containing updated IDs', async () => {
      // Seed data
      mockDataStore.create('posts', { id: '1', title: 'Post 1', status: 'draft' })
      mockDataStore.create('posts', { id: '2', title: 'Post 2', status: 'draft' })

      const params: UpdateManyParams = {
        ids: ['1', '2'],
        data: { status: 'archived' },
      }

      const result = await dataProvider.updateMany('posts', params)

      expect(result).toHaveProperty('data')
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toContain('1')
      expect(result.data).toContain('2')
      expect(result.data).toHaveLength(2)
    })

    it('should return IDs in the same type as provided (string)', async () => {
      mockDataStore.create('posts', { id: 'abc', title: 'Post ABC', status: 'draft' })

      const params: UpdateManyParams = {
        ids: ['abc'],
        data: { status: 'published' },
      }

      const result = await dataProvider.updateMany('posts', params)

      expect(result.data).toEqual(['abc'])
      expect(typeof result.data[0]).toBe('string')
    })

    it('should return IDs in the same type as provided (number)', async () => {
      mockDataStore.create('posts', { id: '123', title: 'Post 123', status: 'draft' })

      const params: UpdateManyParams = {
        ids: [123],
        data: { status: 'published' },
      }

      const result = await dataProvider.updateMany('posts', params)

      // The returned IDs should match the input type
      expect(result.data).toContain(123)
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 3: Same patch applied to all records
  // --------------------------------------------------------------------------
  describe('same patch applied to all records', () => {
    it('should apply the same data patch to every record', async () => {
      // Seed data with different initial values
      mockDataStore.create('users', { id: '1', name: 'Alice', role: 'user', active: true })
      mockDataStore.create('users', { id: '2', name: 'Bob', role: 'admin', active: false })
      mockDataStore.create('users', { id: '3', name: 'Charlie', role: 'moderator', active: true })

      const params: UpdateManyParams = {
        ids: ['1', '2', '3'],
        data: { role: 'guest', active: false },
      }

      await dataProvider.updateMany('users', params)

      // All records should have the same patch values
      const user1 = mockDataStore.findById('users', '1')
      const user2 = mockDataStore.findById('users', '2')
      const user3 = mockDataStore.findById('users', '3')

      // The patch data should be identical for all
      expect(user1?.role).toBe('guest')
      expect(user1?.active).toBe(false)

      expect(user2?.role).toBe('guest')
      expect(user2?.active).toBe(false)

      expect(user3?.role).toBe('guest')
      expect(user3?.active).toBe(false)

      // Original non-patched fields should remain unchanged
      expect(user1?.name).toBe('Alice')
      expect(user2?.name).toBe('Bob')
      expect(user3?.name).toBe('Charlie')
    })

    it('should support partial updates (not overwrite entire record)', async () => {
      mockDataStore.create('posts', {
        id: '1',
        title: 'Original Title',
        content: 'Original Content',
        status: 'draft',
      })

      const params: UpdateManyParams = {
        ids: ['1'],
        data: { status: 'published' },
      }

      await dataProvider.updateMany('posts', params)

      const post = mockDataStore.findById('posts', '1')
      expect(post?.title).toBe('Original Title')
      expect(post?.content).toBe('Original Content')
      expect(post?.status).toBe('published')
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 4: Empty IDs array returns { data: [] }
  // --------------------------------------------------------------------------
  describe('empty IDs array returns { data: [] }', () => {
    it('should return { data: [] } when ids array is empty', async () => {
      // Seed some data (should not be affected)
      mockDataStore.create('posts', { id: '1', title: 'Post 1', status: 'draft' })

      const params: UpdateManyParams = {
        ids: [],
        data: { status: 'published' },
      }

      const result = await dataProvider.updateMany('posts', params)

      expect(result).toEqual({ data: [] })

      // Verify existing records were not modified
      const post = mockDataStore.findById('posts', '1')
      expect(post?.status).toBe('draft')
    })

    it('should not call update on the dataStore when ids is empty', async () => {
      const params: UpdateManyParams = {
        ids: [],
        data: { status: 'published' },
      }

      await dataProvider.updateMany('posts', params)

      expect(mockDataStore.update).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 5: Some IDs exist, some don't - returns only successfully updated IDs
  // --------------------------------------------------------------------------
  describe('some IDs exist, some do not - returns only successfully updated IDs', () => {
    it('should return only the IDs that were successfully updated', async () => {
      // Only create records for some IDs
      mockDataStore.create('posts', { id: '1', title: 'Post 1', status: 'draft' })
      mockDataStore.create('posts', { id: '3', title: 'Post 3', status: 'draft' })
      // Note: '2' and '4' do not exist

      const params: UpdateManyParams = {
        ids: ['1', '2', '3', '4'],
        data: { status: 'published' },
      }

      const result = await dataProvider.updateMany('posts', params)

      // Only existing records should be in the result
      expect(result.data).toContain('1')
      expect(result.data).toContain('3')
      expect(result.data).not.toContain('2')
      expect(result.data).not.toContain('4')
      expect(result.data).toHaveLength(2)
    })

    it('should update existing records even when some IDs are missing', async () => {
      mockDataStore.create('posts', { id: 'exists', title: 'Existing Post', status: 'draft' })

      const params: UpdateManyParams = {
        ids: ['exists', 'missing'],
        data: { status: 'archived' },
      }

      await dataProvider.updateMany('posts', params)

      // The existing record should be updated
      const post = mockDataStore.findById('posts', 'exists')
      expect(post?.status).toBe('archived')
    })

    it('should return empty array when none of the IDs exist', async () => {
      // Don't create any records

      const params: UpdateManyParams = {
        ids: ['nonexistent1', 'nonexistent2'],
        data: { status: 'published' },
      }

      const result = await dataProvider.updateMany('posts', params)

      expect(result).toEqual({ data: [] })
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 6: Does not throw for missing IDs (silent skip)
  // --------------------------------------------------------------------------
  describe('does not throw for missing IDs (silent skip)', () => {
    it('should not throw an error when some IDs do not exist', async () => {
      mockDataStore.create('posts', { id: '1', title: 'Post 1', status: 'draft' })

      const params: UpdateManyParams = {
        ids: ['1', 'nonexistent'],
        data: { status: 'published' },
      }

      // Should not throw - resolves successfully with updated IDs
      const result = await dataProvider.updateMany('posts', params)
      expect(result).toBeDefined()
      expect(result.data).toContain('1')
    })

    it('should not throw an error when all IDs do not exist', async () => {
      const params: UpdateManyParams = {
        ids: ['nonexistent1', 'nonexistent2', 'nonexistent3'],
        data: { status: 'published' },
      }

      // Should not throw - resolves successfully with empty array
      const result = await dataProvider.updateMany('posts', params)
      expect(result).toBeDefined()
      expect(result.data).toEqual([])
    })

    it('should silently skip missing IDs and continue processing others', async () => {
      mockDataStore.create('posts', { id: 'a', title: 'Post A', status: 'draft' })
      mockDataStore.create('posts', { id: 'c', title: 'Post C', status: 'draft' })

      const params: UpdateManyParams = {
        ids: ['a', 'b', 'c'], // 'b' does not exist
        data: { status: 'published' },
      }

      const result = await dataProvider.updateMany('posts', params)

      // Both existing records should be updated
      expect(mockDataStore.findById('posts', 'a')?.status).toBe('published')
      expect(mockDataStore.findById('posts', 'c')?.status).toBe('published')

      // Result should only include the existing IDs
      expect(result.data).toEqual(['a', 'c'])
    })

    it('should complete the operation even if the first ID is missing', async () => {
      mockDataStore.create('posts', { id: '2', title: 'Post 2', status: 'draft' })
      mockDataStore.create('posts', { id: '3', title: 'Post 3', status: 'draft' })

      const params: UpdateManyParams = {
        ids: ['1', '2', '3'], // '1' does not exist
        data: { status: 'archived' },
      }

      const result = await dataProvider.updateMany('posts', params)

      expect(result.data).toContain('2')
      expect(result.data).toContain('3')
      expect(result.data).not.toContain('1')
    })
  })

  // --------------------------------------------------------------------------
  // Additional edge cases
  // --------------------------------------------------------------------------
  describe('edge cases', () => {
    it('should handle updating a single record', async () => {
      mockDataStore.create('posts', { id: 'solo', title: 'Solo Post', status: 'draft' })

      const params: UpdateManyParams = {
        ids: ['solo'],
        data: { status: 'published' },
      }

      const result = await dataProvider.updateMany('posts', params)

      expect(result.data).toEqual(['solo'])
      expect(mockDataStore.findById('posts', 'solo')?.status).toBe('published')
    })

    it('should handle empty data object (no-op update)', async () => {
      mockDataStore.create('posts', { id: '1', title: 'Post 1', status: 'draft' })

      const params: UpdateManyParams = {
        ids: ['1'],
        data: {},
      }

      const result = await dataProvider.updateMany('posts', params)

      expect(result.data).toEqual(['1'])
      // Record should remain unchanged
      const post = mockDataStore.findById('posts', '1')
      expect(post?.title).toBe('Post 1')
      expect(post?.status).toBe('draft')
    })
  })
})
