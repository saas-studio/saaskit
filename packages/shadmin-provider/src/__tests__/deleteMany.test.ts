import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createDataStoreProvider } from '../index'
import type {
  DataProvider,
  DeleteManyParams,
  DeleteManyResult,
  Identifier,
  RaRecord,
} from '../types'

// ============================================================================
// Mock DataStore Interface
// ============================================================================

/**
 * Mock DataStore interface for testing
 * Matches the IDataStore interface from @saaskit/schema
 */
interface MockDataStore {
  findById(resourceName: string, id: string): Record<string, unknown> | null
  findAll(resourceName: string, options?: { where?: Record<string, unknown> }): Record<string, unknown>[]
  delete(resourceName: string, id: string): boolean
}

// ============================================================================
// Test Setup
// ============================================================================

/**
 * Creates a mock DataStore with in-memory storage
 */
function createMockDataStore(initialData: Record<string, Record<string, unknown>[]> = {}): MockDataStore {
  const data: Map<string, Map<string, Record<string, unknown>>> = new Map()

  // Initialize data from provided records
  for (const [resource, records] of Object.entries(initialData)) {
    const resourceMap = new Map<string, Record<string, unknown>>()
    for (const record of records) {
      resourceMap.set(String(record.id), record)
    }
    data.set(resource, resourceMap)
  }

  return {
    findById(resourceName: string, id: string): Record<string, unknown> | null {
      const resourceData = data.get(resourceName)
      if (!resourceData) return null
      return resourceData.get(id) ?? null
    },

    findAll(resourceName: string, options?: { where?: Record<string, unknown> }): Record<string, unknown>[] {
      const resourceData = data.get(resourceName)
      if (!resourceData) return []

      let records = Array.from(resourceData.values())

      if (options?.where) {
        records = records.filter((record) => {
          for (const [key, value] of Object.entries(options.where!)) {
            if (record[key] !== value) return false
          }
          return true
        })
      }

      return records
    },

    delete(resourceName: string, id: string): boolean {
      const resourceData = data.get(resourceName)
      if (!resourceData) return false
      return resourceData.delete(id)
    },
  }
}

// ============================================================================
// deleteMany Tests
// ============================================================================

describe('DataProvider.deleteMany()', () => {
  let dataStore: MockDataStore
  let dataProvider: DataProvider

  const initialUsers = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com' },
    { id: '4', name: 'Diana', email: 'diana@example.com' },
    { id: '5', name: 'Eve', email: 'eve@example.com' },
  ]

  beforeEach(() => {
    dataStore = createMockDataStore({
      users: [...initialUsers],
    })
    dataProvider = createDataStoreProvider({ dataStore: dataStore as any })
  })

  // --------------------------------------------------------------------------
  // Test Case 1: Deletes all records with given IDs
  // --------------------------------------------------------------------------
  describe('deletes all records with given IDs', () => {
    it('should delete multiple records when given multiple valid IDs', async () => {
      const params: DeleteManyParams = {
        ids: ['1', '2', '3'],
      }

      const result = await dataProvider.deleteMany('users', params)

      // The records should be deleted from the store
      expect(dataStore.findById('users', '1')).toBeNull()
      expect(dataStore.findById('users', '2')).toBeNull()
      expect(dataStore.findById('users', '3')).toBeNull()
    })

    it('should delete a single record when given one ID', async () => {
      const params: DeleteManyParams = {
        ids: ['1'],
      }

      const result = await dataProvider.deleteMany('users', params)

      expect(dataStore.findById('users', '1')).toBeNull()
      // Other records should still exist
      expect(dataStore.findById('users', '2')).not.toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 2: Returns { data: deletedIds[] }
  // --------------------------------------------------------------------------
  describe('returns { data: deletedIds[] }', () => {
    it('should return the IDs of successfully deleted records', async () => {
      const params: DeleteManyParams = {
        ids: ['1', '2'],
      }

      const result = await dataProvider.deleteMany('users', params)

      expect(result).toHaveProperty('data')
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toContain('1')
      expect(result.data).toContain('2')
      expect(result.data).toHaveLength(2)
    })

    it('should return DeleteManyResult type', async () => {
      const params: DeleteManyParams = {
        ids: ['3'],
      }

      const result: DeleteManyResult = await dataProvider.deleteMany('users', params)

      expect(result.data).toEqual(['3'])
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 3: Records are actually removed
  // --------------------------------------------------------------------------
  describe('records are actually removed', () => {
    it('should ensure deleted records cannot be found afterwards', async () => {
      const params: DeleteManyParams = {
        ids: ['1', '3', '5'],
      }

      // Verify records exist before deletion
      expect(dataStore.findById('users', '1')).not.toBeNull()
      expect(dataStore.findById('users', '3')).not.toBeNull()
      expect(dataStore.findById('users', '5')).not.toBeNull()

      await dataProvider.deleteMany('users', params)

      // Verify records are actually removed
      expect(dataStore.findById('users', '1')).toBeNull()
      expect(dataStore.findById('users', '3')).toBeNull()
      expect(dataStore.findById('users', '5')).toBeNull()

      // Verify remaining records still exist
      expect(dataStore.findById('users', '2')).not.toBeNull()
      expect(dataStore.findById('users', '4')).not.toBeNull()
    })

    it('should reduce the total record count in the store', async () => {
      const initialCount = dataStore.findAll('users').length
      expect(initialCount).toBe(5)

      const params: DeleteManyParams = {
        ids: ['1', '2'],
      }

      await dataProvider.deleteMany('users', params)

      const finalCount = dataStore.findAll('users').length
      expect(finalCount).toBe(3)
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 4: Empty IDs array returns { data: [] }
  // --------------------------------------------------------------------------
  describe('empty IDs array returns { data: [] }', () => {
    it('should return empty data array when no IDs provided', async () => {
      const params: DeleteManyParams = {
        ids: [],
      }

      const result = await dataProvider.deleteMany('users', params)

      expect(result).toEqual({ data: [] })
    })

    it('should not modify any records when IDs array is empty', async () => {
      const initialCount = dataStore.findAll('users').length

      const params: DeleteManyParams = {
        ids: [],
      }

      await dataProvider.deleteMany('users', params)

      const finalCount = dataStore.findAll('users').length
      expect(finalCount).toBe(initialCount)
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 5: Some IDs exist, some don't - returns only successfully deleted IDs
  // --------------------------------------------------------------------------
  describe('partial deletion - some IDs exist, some do not', () => {
    it('should return only the IDs that were successfully deleted', async () => {
      const params: DeleteManyParams = {
        ids: ['1', 'nonexistent-1', '2', 'nonexistent-2'],
      }

      const result = await dataProvider.deleteMany('users', params)

      // Should only return IDs that actually existed and were deleted
      expect(result.data).toContain('1')
      expect(result.data).toContain('2')
      expect(result.data).not.toContain('nonexistent-1')
      expect(result.data).not.toContain('nonexistent-2')
      expect(result.data).toHaveLength(2)
    })

    it('should delete existing records even when some IDs are invalid', async () => {
      const params: DeleteManyParams = {
        ids: ['1', 'invalid-id', '3'],
      }

      await dataProvider.deleteMany('users', params)

      // Existing records should be deleted
      expect(dataStore.findById('users', '1')).toBeNull()
      expect(dataStore.findById('users', '3')).toBeNull()

      // Other records should remain
      expect(dataStore.findById('users', '2')).not.toBeNull()
    })

    it('should return empty array when all provided IDs are invalid', async () => {
      const params: DeleteManyParams = {
        ids: ['nonexistent-1', 'nonexistent-2', 'nonexistent-3'],
      }

      const result = await dataProvider.deleteMany('users', params)

      expect(result.data).toEqual([])
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 6: Does not throw for missing IDs (silent skip)
  // --------------------------------------------------------------------------
  describe('does not throw for missing IDs (silent skip)', () => {
    it('should not throw an error when deleting non-existent IDs', async () => {
      const params: DeleteManyParams = {
        ids: ['nonexistent-id'],
      }

      // Should not throw - resolves successfully
      const result = await dataProvider.deleteMany('users', params)
      expect(result).toBeDefined()
      expect(result.data).toEqual([])
    })

    it('should silently skip non-existent IDs and continue with valid ones', async () => {
      const params: DeleteManyParams = {
        ids: ['nonexistent', '1', 'also-nonexistent', '2'],
      }

      // Should not throw and should delete the valid records
      const result = await dataProvider.deleteMany('users', params)

      expect(result.data).toContain('1')
      expect(result.data).toContain('2')
      expect(dataStore.findById('users', '1')).toBeNull()
      expect(dataStore.findById('users', '2')).toBeNull()
    })

    it('should handle mixed valid and invalid IDs gracefully', async () => {
      const params: DeleteManyParams = {
        ids: ['1', '', '2', undefined as unknown as Identifier, '3', null as unknown as Identifier],
      }

      // Should handle gracefully without throwing
      const result = await dataProvider.deleteMany('users', params)

      // At minimum, valid IDs should be deleted
      expect(result.data).toContain('1')
      expect(result.data).toContain('2')
      expect(result.data).toContain('3')
    })
  })

  // --------------------------------------------------------------------------
  // Additional Edge Cases
  // --------------------------------------------------------------------------
  describe('edge cases', () => {
    it('should work with numeric IDs', async () => {
      // Create a store with numeric IDs
      const numericStore = createMockDataStore({
        posts: [
          { id: 1, title: 'Post 1' },
          { id: 2, title: 'Post 2' },
          { id: 3, title: 'Post 3' },
        ],
      })
      const numericProvider = createDataStoreProvider({ dataStore: numericStore as any })

      const params: DeleteManyParams = {
        ids: [1, 2],
      }

      const result = await numericProvider.deleteMany('posts', params)

      expect(result.data).toContain(1)
      expect(result.data).toContain(2)
    })

    it('should handle large batch deletions', async () => {
      // Create store with many records
      const manyRecords = Array.from({ length: 100 }, (_, i) => ({
        id: String(i + 1),
        name: `User ${i + 1}`,
      }))
      const largeStore = createMockDataStore({ users: manyRecords })
      const largeProvider = createDataStoreProvider({ dataStore: largeStore as any })

      // Delete 50 records
      const idsToDelete = Array.from({ length: 50 }, (_, i) => String(i + 1))
      const params: DeleteManyParams = {
        ids: idsToDelete,
      }

      const result = await largeProvider.deleteMany('users', params)

      expect(result.data).toHaveLength(50)
      expect(largeStore.findAll('users')).toHaveLength(50)
    })
  })
})
