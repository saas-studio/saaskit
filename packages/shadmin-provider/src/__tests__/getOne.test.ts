import { describe, it, expect, beforeEach } from 'vitest'
import type { IDataStore } from '@saaskit/schema'
import { createDataStoreProvider } from '../index'
import type {
  DataProvider,
  GetOneParams,
  GetOneResult,
  RaRecord,
  Identifier,
} from '../types'

// ============================================================================
// Mock DataStore
// ============================================================================

/**
 * Minimal IDataStore interface for testing
 */
interface MockDataStore {
  findById(resourceName: string, id: string): Record<string, unknown> | null
}

/**
 * Creates a mock DataStore for testing getOne functionality
 */
function createMockDataStore(
  data: Record<string, Record<string, Record<string, unknown>>>
): MockDataStore {
  return {
    findById(resourceName: string, id: string): Record<string, unknown> | null {
      const resource = data[resourceName]
      if (!resource) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      return resource[id] ?? null
    },
  }
}

// ============================================================================
// Test Data
// ============================================================================

const testUser: RaRecord = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  isActive: true,
}

const testUserWithUUID: RaRecord = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Jane Smith',
  email: 'jane@example.com',
  department: 'Engineering',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
}

const testPost: RaRecord = {
  id: '456',
  title: 'Hello World',
  content: 'This is my first post',
  authorId: '123',
  status: 'published',
}

// ============================================================================
// Tests
// ============================================================================

describe('DataProvider.getOne()', () => {
  let dataProvider: DataProvider
  let mockDataStore: MockDataStore

  beforeEach(() => {
    mockDataStore = createMockDataStore({
      users: {
        '123': { ...testUser },
        '550e8400-e29b-41d4-a716-446655440000': { ...testUserWithUUID },
      },
      posts: {
        '456': { ...testPost },
      },
    })

    dataProvider = createDataStoreProvider({ dataStore: mockDataStore as unknown as IDataStore })
  })

  // --------------------------------------------------------------------------
  // Test Case 1: Returns { data: record } for existing record
  // --------------------------------------------------------------------------
  describe('returns { data: record } for existing record', () => {
    it('should return data wrapped in object with data property', async () => {
      const params: GetOneParams = { id: '123' }
      const result: GetOneResult = await dataProvider.getOne('users', params)

      expect(result).toHaveProperty('data')
      expect(typeof result.data).toBe('object')
    })

    it('should return the correct record matching the id', async () => {
      const params: GetOneParams = { id: '123' }
      const result = await dataProvider.getOne('users', params)

      expect(result.data.id).toBe('123')
      expect(result.data.name).toBe('John Doe')
    })

    it('should return record from different resources', async () => {
      const postResult = await dataProvider.getOne('posts', { id: '456' })

      expect(postResult.data.id).toBe('456')
      expect(postResult.data.title).toBe('Hello World')
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 2: Record includes all fields including id
  // --------------------------------------------------------------------------
  describe('record includes all fields including id', () => {
    it('should include the id field in the returned record', async () => {
      const result = await dataProvider.getOne('users', { id: '123' })

      expect(result.data.id).toBeDefined()
      expect(result.data.id).toBe('123')
    })

    it('should include all scalar fields', async () => {
      const result = await dataProvider.getOne('users', { id: '123' })

      expect(result.data.name).toBe('John Doe')
      expect(result.data.email).toBe('john@example.com')
      expect(result.data.age).toBe(30)
      expect(result.data.isActive).toBe(true)
    })

    it('should include all fields for complex records', async () => {
      const result = await dataProvider.getOne('posts', { id: '456' })

      expect(result.data).toEqual({
        id: '456',
        title: 'Hello World',
        content: 'This is my first post',
        authorId: '123',
        status: 'published',
      })
    })

    it('should include timestamp fields when present', async () => {
      const result = await dataProvider.getOne('users', {
        id: '550e8400-e29b-41d4-a716-446655440000',
      })

      expect(result.data.createdAt).toBe('2024-01-15T10:30:00Z')
      expect(result.data.updatedAt).toBe('2024-01-15T10:30:00Z')
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 3: Throws error for non-existent ID
  // --------------------------------------------------------------------------
  describe('throws error for non-existent ID', () => {
    it('should throw an error when record with given id does not exist', async () => {
      await expect(
        dataProvider.getOne('users', { id: 'non-existent-id' })
      ).rejects.toThrow()
    })

    it('should throw an error with meaningful message for missing record', async () => {
      await expect(
        dataProvider.getOne('users', { id: '999' })
      ).rejects.toThrow(/not found|does not exist/i)
    })

    it('should throw for empty string id', async () => {
      await expect(dataProvider.getOne('users', { id: '' })).rejects.toThrow()
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 4: Throws error for invalid resource name
  // --------------------------------------------------------------------------
  describe('throws error for invalid resource name', () => {
    it('should throw an error for non-existent resource', async () => {
      await expect(
        dataProvider.getOne('nonExistentResource', { id: '123' })
      ).rejects.toThrow()
    })

    it('should throw an error with resource name in message', async () => {
      await expect(
        dataProvider.getOne('invalidResource', { id: '123' })
      ).rejects.toThrow(/invalidResource|not found|unknown resource/i)
    })

    it('should throw for empty resource name', async () => {
      await expect(dataProvider.getOne('', { id: '123' })).rejects.toThrow()
    })
  })

  // --------------------------------------------------------------------------
  // Test Case 5: Works with UUID format IDs
  // --------------------------------------------------------------------------
  describe('works with UUID format IDs', () => {
    it('should fetch record with UUID format id', async () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000'
      const result = await dataProvider.getOne('users', { id: uuidId })

      expect(result.data.id).toBe(uuidId)
      expect(result.data.name).toBe('Jane Smith')
    })

    it('should handle different UUID variations', async () => {
      // The standard UUID format with hyphens
      const result = await dataProvider.getOne('users', {
        id: '550e8400-e29b-41d4-a716-446655440000',
      })

      expect(result.data).toBeDefined()
      expect(result.data.department).toBe('Engineering')
    })

    it('should work with UUID as Identifier type (string)', async () => {
      const id: Identifier = '550e8400-e29b-41d4-a716-446655440000'
      const params: GetOneParams = { id }

      const result = await dataProvider.getOne('users', params)

      expect(result.data.id).toBe(id)
    })
  })

  // --------------------------------------------------------------------------
  // Additional Edge Cases
  // --------------------------------------------------------------------------
  describe('edge cases', () => {
    it('should handle numeric string ids', async () => {
      const result = await dataProvider.getOne('users', { id: '123' })
      expect(result.data.id).toBe('123')
    })

    it('should handle numeric ids when Identifier allows number', async () => {
      // Create a new mock with numeric id
      const numericMockStore = createMockDataStore({
        items: {
          '42': { id: 42, name: 'Numeric ID Item' },
        },
      })
      const numericProvider = createDataStoreProvider({
        dataStore: numericMockStore as unknown as IDataStore,
      })

      const result = await numericProvider.getOne('items', { id: 42 })
      expect(result.data.id).toBe(42)
    })
  })
})
