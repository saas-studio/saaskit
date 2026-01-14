import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { IDataStore, FindAllOptions } from '@saaskit/schema'
import type { SaaSSchema } from '@saaskit/schema'
import type {
  DataProvider,
  UpdateParams,
  UpdateResult,
  RaRecord,
  Identifier,
} from '../types'
import { createDataStoreProvider } from '../index'

// ============================================================================
// Mock DataStore for Testing
// ============================================================================

/**
 * Creates a mock DataStore for testing the DataProvider update method
 */
function createMockDataStore(initialData: Record<string, Map<string, Record<string, unknown>>> = {}): IDataStore {
  const data: Record<string, Map<string, Record<string, unknown>>> = {}

  // Initialize resources
  for (const [resource, records] of Object.entries(initialData)) {
    data[resource] = new Map(records)
  }

  const mockSchema: SaaSSchema = {
    metadata: { name: 'test', version: '1.0.0' },
    resources: [
      {
        name: 'users',
        fields: [
          { name: 'id', type: 'uuid', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'age', type: 'number', required: false },
          { name: 'createdAt', type: 'datetime', required: false },
          { name: 'updatedAt', type: 'datetime', required: false },
        ],
        relations: [],
      },
    ],
  }

  return {
    schema: mockSchema,

    create: vi.fn((resourceName: string, recordData: Record<string, unknown>) => {
      if (!data[resourceName]) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const record = {
        id,
        ...recordData,
        createdAt: now,
        updatedAt: now,
      }
      data[resourceName].set(id, record)
      return { ...record }
    }),

    findById: vi.fn((resourceName: string, id: string) => {
      if (!data[resourceName]) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      const record = data[resourceName].get(id)
      return record ? { ...record } : null
    }),

    findAll: vi.fn((resourceName: string, _options?: FindAllOptions) => {
      if (!data[resourceName]) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      return Array.from(data[resourceName].values()).map((r) => ({ ...r }))
    }),

    update: vi.fn((resourceName: string, id: string, updateData: Record<string, unknown>) => {
      if (!data[resourceName]) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      const existing = data[resourceName].get(id)
      if (!existing) {
        throw new Error(`Record with id "${id}" not found in resource "${resourceName}"`)
      }

      // Simulate update logic: merge fields, update timestamp, preserve id/createdAt
      const now = new Date().toISOString()
      const updated = {
        ...existing,
        ...updateData,
        id: existing.id, // Preserve original id
        createdAt: existing.createdAt, // Preserve createdAt
        updatedAt: now, // Refresh updatedAt
      }
      data[resourceName].set(id, updated)
      return { ...updated }
    }),

    delete: vi.fn((resourceName: string, id: string) => {
      if (!data[resourceName]) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      return data[resourceName].delete(id)
    }),

    getRelated: vi.fn(() => null),
  }
}

/**
 * Helper to create a mock DataStore with pre-populated test data
 */
function createMockDataStoreWithUser(): { dataStore: IDataStore; userId: string; originalUser: Record<string, unknown> } {
  const userId = '123e4567-e89b-12d3-a456-426614174000'
  const originalCreatedAt = '2024-01-01T00:00:00.000Z'
  const originalUpdatedAt = '2024-01-01T00:00:00.000Z'

  const originalUser = {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    createdAt: originalCreatedAt,
    updatedAt: originalUpdatedAt,
  }

  const usersMap = new Map<string, Record<string, unknown>>()
  usersMap.set(userId, { ...originalUser })

  const dataStore = createMockDataStore({ users: usersMap })

  return { dataStore, userId, originalUser }
}

// ============================================================================
// Test Interface for User Record
// ============================================================================

interface UserRecord extends RaRecord {
  id: Identifier
  name: string
  email: string
  age?: number
  createdAt?: string
  updatedAt?: string
}

// ============================================================================
// DataProvider update() Tests - RED Phase
// ============================================================================

describe('DataProvider.update()', () => {
  // --------------------------------------------------------------------------
  // Test: Updates record and returns { data: updatedRecord }
  // --------------------------------------------------------------------------
  describe('basic update functionality', () => {
    it('should update record and return { data: updatedRecord }', async () => {
      const { dataStore, userId, originalUser } = createMockDataStoreWithUser()
      const dataProvider = createDataStoreProvider({ dataStore })

      const params: UpdateParams<UserRecord> = {
        id: userId,
        data: { id: userId, name: 'Jane Doe', email: 'john@example.com' },
        previousData: originalUser as UserRecord,
      }

      const result = await dataProvider.update<UserRecord>('users', params)

      // Should return { data: updatedRecord }
      expect(result).toHaveProperty('data')
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(userId)
      expect(result.data.name).toBe('Jane Doe')
    })
  })

  // --------------------------------------------------------------------------
  // Test: Only specified fields are updated
  // --------------------------------------------------------------------------
  describe('partial updates', () => {
    it('should only update specified fields', async () => {
      const { dataStore, userId, originalUser } = createMockDataStoreWithUser()
      const dataProvider = createDataStoreProvider({ dataStore })

      const params: UpdateParams<UserRecord> = {
        id: userId,
        data: { id: userId, name: 'Jane Doe', email: originalUser.email as string },
        previousData: originalUser as UserRecord,
      }

      const result = await dataProvider.update<UserRecord>('users', params)

      // Name should be updated
      expect(result.data.name).toBe('Jane Doe')
      // Email should remain unchanged (was provided same value)
      expect(result.data.email).toBe('john@example.com')
    })

    it('should preserve other fields that were not specified for update', async () => {
      const { dataStore, userId, originalUser } = createMockDataStoreWithUser()
      const dataProvider = createDataStoreProvider({ dataStore })

      const params: UpdateParams<UserRecord> = {
        id: userId,
        data: { id: userId, name: 'Jane Doe', email: 'john@example.com' },
        previousData: originalUser as UserRecord,
      }

      const result = await dataProvider.update<UserRecord>('users', params)

      // Age field should remain unchanged
      expect(result.data.age).toBe(30)
    })
  })

  // --------------------------------------------------------------------------
  // Test: updatedAt timestamp is refreshed
  // --------------------------------------------------------------------------
  describe('timestamp handling', () => {
    it('should refresh updatedAt timestamp', async () => {
      const { dataStore, userId, originalUser } = createMockDataStoreWithUser()
      const dataProvider = createDataStoreProvider({ dataStore })

      const originalUpdatedAt = originalUser.updatedAt as string

      const params: UpdateParams<UserRecord> = {
        id: userId,
        data: { id: userId, name: 'Jane Doe', email: 'john@example.com' },
        previousData: originalUser as UserRecord,
      }

      const result = await dataProvider.update<UserRecord>('users', params)

      // updatedAt should be newer than the original
      expect(result.data.updatedAt).toBeDefined()
      expect(new Date(result.data.updatedAt as string).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      )
    })

    it('should preserve createdAt timestamp', async () => {
      const { dataStore, userId, originalUser } = createMockDataStoreWithUser()
      const dataProvider = createDataStoreProvider({ dataStore })

      const originalCreatedAt = originalUser.createdAt

      const params: UpdateParams<UserRecord> = {
        id: userId,
        data: { id: userId, name: 'Jane Doe', email: 'john@example.com' },
        previousData: originalUser as UserRecord,
      }

      const result = await dataProvider.update<UserRecord>('users', params)

      // createdAt should remain unchanged
      expect(result.data.createdAt).toBe(originalCreatedAt)
    })
  })

  // --------------------------------------------------------------------------
  // Test: Cannot update id field (ignored)
  // --------------------------------------------------------------------------
  describe('id field protection', () => {
    it('should not allow updating the id field (ignored)', async () => {
      const { dataStore, userId, originalUser } = createMockDataStoreWithUser()
      const dataProvider = createDataStoreProvider({ dataStore })

      const params: UpdateParams<UserRecord> = {
        id: userId,
        data: {
          id: 'new-fake-id-should-be-ignored',
          name: 'Jane Doe',
          email: 'john@example.com',
        },
        previousData: originalUser as UserRecord,
      }

      const result = await dataProvider.update<UserRecord>('users', params)

      // The id should remain the original value, not the new one
      expect(result.data.id).toBe(userId)
      expect(result.data.id).not.toBe('new-fake-id-should-be-ignored')
    })
  })

  // --------------------------------------------------------------------------
  // Test: Non-existent record throws error
  // --------------------------------------------------------------------------
  describe('error handling - non-existent record', () => {
    it('should throw error when updating non-existent record', async () => {
      const dataStore = createMockDataStore({ users: new Map() })
      const dataProvider = createDataStoreProvider({ dataStore })

      const params: UpdateParams<UserRecord> = {
        id: 'non-existent-id',
        data: { id: 'non-existent-id', name: 'Jane', email: 'jane@example.com' },
        previousData: { id: 'non-existent-id', name: 'John', email: 'john@example.com' },
      }

      await expect(dataProvider.update<UserRecord>('users', params)).rejects.toThrow(
        /not found/i
      )
    })
  })

  // --------------------------------------------------------------------------
  // Test: Non-existent resource throws error
  // --------------------------------------------------------------------------
  describe('error handling - non-existent resource', () => {
    it('should throw error when updating on non-existent resource', async () => {
      const dataStore = createMockDataStore({ users: new Map() })
      const dataProvider = createDataStoreProvider({ dataStore })

      const params: UpdateParams<UserRecord> = {
        id: 'some-id',
        data: { id: 'some-id', name: 'Jane', email: 'jane@example.com' },
        previousData: { id: 'some-id', name: 'John', email: 'john@example.com' },
      }

      await expect(
        dataProvider.update<UserRecord>('nonexistent_resource', params)
      ).rejects.toThrow(/resource.*not found|unknown resource/i)
    })
  })
})
