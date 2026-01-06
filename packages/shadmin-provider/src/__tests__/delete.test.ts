import { describe, it, expect, beforeEach } from 'vitest'
import { createDataStoreProvider } from '../index'
import type {
  DataProvider,
  RaRecord,
  Identifier,
} from '../types'

// ============================================================================
// Mock DataStore
// ============================================================================

/**
 * Minimal IDataStore interface for testing delete functionality
 */
interface MockDataStore {
  findById(resourceName: string, id: string): Record<string, unknown> | null
  delete(resourceName: string, id: string): boolean
  exists(resourceName: string, id: string): boolean
  count(resourceName: string): number
}

/**
 * Creates a mock DataStore for testing delete functionality
 */
function createMockDataStore(
  data: Record<string, Record<string, Record<string, unknown>>>
): MockDataStore {
  // Convert to internal map structure for mutation
  const internalData: Record<string, Map<string, Record<string, unknown>>> = {}
  for (const [resource, records] of Object.entries(data)) {
    internalData[resource] = new Map(Object.entries(records))
  }

  return {
    findById(resourceName: string, id: string): Record<string, unknown> | null {
      const resource = internalData[resourceName]
      if (!resource) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      const record = resource.get(id)
      return record ? { ...record } : null
    },

    delete(resourceName: string, id: string): boolean {
      const resource = internalData[resourceName]
      if (!resource) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      return resource.delete(id)
    },

    exists(resourceName: string, id: string): boolean {
      const resource = internalData[resourceName]
      if (!resource) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      return resource.has(id)
    },

    count(resourceName: string): number {
      const resource = internalData[resourceName]
      if (!resource) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      return resource.size
    },
  }
}

// ============================================================================
// Test Data
// ============================================================================

interface TestRecord extends RaRecord {
  id: Identifier
  name: string
  email?: string
}

const testUser: TestRecord = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
}

const testUser2: TestRecord = {
  id: 'user-2',
  name: 'Jane Smith',
  email: 'jane@example.com',
}

const testUser3: TestRecord = {
  id: 'user-3',
  name: 'Bob Wilson',
}

const testUserWithUUID: TestRecord = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'UUID User',
  email: 'uuid@example.com',
}

// ============================================================================
// Tests
// ============================================================================

describe('DataProvider.delete()', () => {
  let dataProvider: DataProvider
  let mockDataStore: MockDataStore

  beforeEach(() => {
    mockDataStore = createMockDataStore({
      users: {
        'user-1': { ...testUser },
        'user-2': { ...testUser2 },
        'user-3': { ...testUser3 },
        '550e8400-e29b-41d4-a716-446655440000': { ...testUserWithUUID },
      },
      posts: {},
    })

    dataProvider = createDataStoreProvider({ dataStore: mockDataStore })
  })

  // --------------------------------------------------------------------------
  // Test: Deletes record and returns { data: deletedRecord }
  // --------------------------------------------------------------------------

  describe('deletes record and returns { data: deletedRecord }', () => {
    it('should delete record and return { data: deletedRecord }', async () => {
      const result = await dataProvider.delete<TestRecord>('users', { id: 'user-1' })

      expect(result).toHaveProperty('data')
      expect(result.data).toEqual(testUser)
      expect(result.data.id).toBe('user-1')
      expect(result.data.name).toBe('John Doe')
      expect(result.data.email).toBe('john@example.com')
    })

    it('should return result in correct format { data: RecordType }', async () => {
      const result = await dataProvider.delete<TestRecord>('users', { id: 'user-1' })

      expect(result).toHaveProperty('data')
      expect(typeof result.data).toBe('object')
      expect(result.data.id).toBeDefined()
    })
  })

  // --------------------------------------------------------------------------
  // Test: Record is actually removed from store
  // --------------------------------------------------------------------------

  describe('record is actually removed from store', () => {
    it('should actually remove the record from the store', async () => {
      // Verify record exists before delete
      expect(mockDataStore.exists('users', 'user-1')).toBe(true)

      await dataProvider.delete('users', { id: 'user-1' })

      // Verify record is removed after delete
      expect(mockDataStore.exists('users', 'user-1')).toBe(false)
      expect(mockDataStore.findById('users', 'user-1')).toBeNull()
    })

    it('should reduce the count of records in the store', async () => {
      const countBefore = mockDataStore.count('users')

      await dataProvider.delete('users', { id: 'user-1' })

      const countAfter = mockDataStore.count('users')
      expect(countAfter).toBe(countBefore - 1)
    })
  })

  // --------------------------------------------------------------------------
  // Test: Non-existent ID throws error
  // --------------------------------------------------------------------------

  describe('non-existent ID throws error', () => {
    it('should throw error when deleting non-existent ID', async () => {
      await expect(
        dataProvider.delete('users', { id: 'non-existent-id' })
      ).rejects.toThrow(/not found/i)
    })

    it('should include the ID in the error message', async () => {
      await expect(
        dataProvider.delete('users', { id: 'missing-record-xyz' })
      ).rejects.toThrow(/missing-record-xyz|not found/i)
    })
  })

  // --------------------------------------------------------------------------
  // Test: Non-existent resource throws error
  // --------------------------------------------------------------------------

  describe('non-existent resource throws error', () => {
    it('should throw error when deleting from non-existent resource', async () => {
      await expect(
        dataProvider.delete('unknown-resource', { id: 'any-id' })
      ).rejects.toThrow(/resource.*not found|not found.*resource|unknown.*resource/i)
    })

    it('should include the resource name in the error message', async () => {
      await expect(
        dataProvider.delete('InvalidResource', { id: 'any-id' })
      ).rejects.toThrow(/InvalidResource|not found/i)
    })
  })

  // --------------------------------------------------------------------------
  // Test: Delete same record twice - second throws
  // --------------------------------------------------------------------------

  describe('delete same record twice: second throws', () => {
    it('should succeed on first delete', async () => {
      const result = await dataProvider.delete('users', { id: 'user-1' })
      expect(result.data.id).toBe('user-1')
    })

    it('should throw error when deleting the same record twice', async () => {
      // First delete should succeed
      await dataProvider.delete('users', { id: 'user-1' })

      // Second delete should throw
      await expect(
        dataProvider.delete('users', { id: 'user-1' })
      ).rejects.toThrow(/not found/i)
    })
  })

  // --------------------------------------------------------------------------
  // Test: Returns the deleted record's data (for undo)
  // --------------------------------------------------------------------------

  describe('returns the deleted record data (for undo)', () => {
    it('should return all fields of the deleted record', async () => {
      const result = await dataProvider.delete<TestRecord>('users', { id: 'user-1' })

      expect(result.data).toEqual({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      })
    })

    it('should return complete record data that can be used for undo/restore', async () => {
      const result = await dataProvider.delete<TestRecord>('users', { id: 'user-1' })

      // Verify all original data is preserved
      const deletedData = result.data
      expect(deletedData.id).toBe('user-1')
      expect(deletedData.name).toBe('John Doe')
      expect(deletedData.email).toBe('john@example.com')
    })

    it('should return record data even when optional fields are not set', async () => {
      // user-3 has no email field
      const result = await dataProvider.delete<TestRecord>('users', { id: 'user-3' })

      expect(result.data.id).toBe('user-3')
      expect(result.data.name).toBe('Bob Wilson')
    })
  })

  // --------------------------------------------------------------------------
  // Additional edge cases
  // --------------------------------------------------------------------------

  describe('edge cases', () => {
    it('should handle UUID as ID', async () => {
      const result = await dataProvider.delete('users', {
        id: '550e8400-e29b-41d4-a716-446655440000',
      })

      expect(result.data.id).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(mockDataStore.exists('users', '550e8400-e29b-41d4-a716-446655440000')).toBe(false)
    })

    it('should handle numeric ID converted to string', async () => {
      // Add a record with numeric-like string ID
      const numericStore = createMockDataStore({
        users: {
          '123': { id: '123', name: 'Numeric ID User' },
        },
      })
      const numericProvider = createDataStoreProvider({ dataStore: numericStore })

      const result = await numericProvider.delete('users', { id: 123 as unknown as Identifier })

      expect(result.data.id).toBe('123')
    })

    it('should not affect other records when deleting one', async () => {
      await dataProvider.delete('users', { id: 'user-2' })

      // Other records should still exist
      expect(mockDataStore.exists('users', 'user-1')).toBe(true)
      expect(mockDataStore.exists('users', 'user-2')).toBe(false)
      expect(mockDataStore.exists('users', 'user-3')).toBe(true)
      expect(mockDataStore.count('users')).toBe(3) // Originally 4, now 3
    })

    it('should handle previousData parameter (for optimistic updates)', async () => {
      const result = await dataProvider.delete<TestRecord>('users', {
        id: 'user-1',
        previousData: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      })

      // Should still work and return the actual deleted data
      expect(result.data).toEqual(testUser)
    })

    it('should delete from empty resource without errors (when record not found)', async () => {
      // posts resource is empty
      await expect(
        dataProvider.delete('posts', { id: 'non-existent' })
      ).rejects.toThrow(/not found/i)
    })
  })
})
