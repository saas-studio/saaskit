/**
 * Tests for DataProvider.getMany method
 *
 * These tests verify the getMany implementation which fetches multiple records
 * by their IDs from a DataStore.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type { IDataStore, FindAllOptions } from '@saaskit/schema'
import type { SaaSSchema } from '@saaskit/schema'
import { createDataStoreProvider } from '../index'
import type { DataProvider, Identifier, RaRecord } from '../types'

// ============================================================================
// Mock DataStore
// ============================================================================

interface MockRecord extends RaRecord {
  id: Identifier
  name: string
  email?: string
}

/**
 * Creates a mock DataStore for testing
 */
function createMockDataStore(records: Record<string, MockRecord[]> = {}): IDataStore {
  const data: Record<string, Map<string, MockRecord>> = {}

  // Initialize data maps for each resource
  for (const [resourceName, resourceRecords] of Object.entries(records)) {
    data[resourceName] = new Map()
    for (const record of resourceRecords) {
      data[resourceName].set(String(record.id), record)
    }
  }

  const mockSchema: SaaSSchema = {
    name: 'test-schema',
    version: '1.0.0',
    resources: Object.keys(records).map((name) => ({
      name,
      fields: [
        { name: 'id', type: 'uuid' as const, required: true },
        { name: 'name', type: 'string' as const, required: true },
        { name: 'email', type: 'string' as const, required: false },
      ],
      relations: [],
    })),
  }

  return {
    schema: mockSchema,

    create(resourceName: string, inputData: Record<string, unknown>): Record<string, unknown> {
      if (!data[resourceName]) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      const id = inputData.id as string || crypto.randomUUID()
      const record = { ...inputData, id } as MockRecord
      data[resourceName].set(String(id), record)
      return record
    },

    findById(resourceName: string, id: string): Record<string, unknown> | null {
      if (!data[resourceName]) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      return data[resourceName].get(id) || null
    },

    findAll(resourceName: string, options?: FindAllOptions): Record<string, unknown>[] {
      if (!data[resourceName]) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      let results = Array.from(data[resourceName].values())

      if (options?.where) {
        results = results.filter((record) => {
          for (const [key, value] of Object.entries(options.where!)) {
            if (record[key as keyof MockRecord] !== value) {
              return false
            }
          }
          return true
        })
      }

      if (options?.offset) {
        results = results.slice(options.offset)
      }

      if (options?.limit) {
        results = results.slice(0, options.limit)
      }

      return results
    },

    update(resourceName: string, id: string, inputData: Record<string, unknown>): Record<string, unknown> {
      if (!data[resourceName]) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      const existing = data[resourceName].get(id)
      if (!existing) {
        throw new Error(`Record with id "${id}" not found`)
      }
      const updated = { ...existing, ...inputData, id } as MockRecord
      data[resourceName].set(id, updated)
      return updated
    },

    delete(resourceName: string, id: string): boolean {
      if (!data[resourceName]) {
        throw new Error(`Resource "${resourceName}" not found`)
      }
      return data[resourceName].delete(id)
    },

    getRelated(
      _resourceName: string,
      _id: string,
      _relationName: string
    ): Record<string, unknown> | Record<string, unknown>[] | null {
      return null
    },
  }
}

// ============================================================================
// Test Data
// ============================================================================

const testUsers: MockRecord[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com' },
  { id: '4', name: 'Diana', email: 'diana@example.com' },
  { id: '5', name: 'Eve', email: 'eve@example.com' },
]

// ============================================================================
// Tests
// ============================================================================

describe('DataProvider.getMany', () => {
  let dataStore: IDataStore
  let dataProvider: DataProvider

  beforeEach(() => {
    dataStore = createMockDataStore({ users: testUsers })
    dataProvider = createDataStoreProvider({ dataStore })
  })

  describe('empty ids array', () => {
    it('returns { data: [] } for empty ids array', async () => {
      const result = await dataProvider.getMany('users', { ids: [] })

      expect(result).toEqual({ data: [] })
    })
  })

  describe('valid IDs', () => {
    it('returns matching records for valid IDs', async () => {
      const result = await dataProvider.getMany<MockRecord>('users', {
        ids: ['1', '3'],
      })

      expect(result.data).toHaveLength(2)
      expect(result.data.map((r) => r.name)).toContain('Alice')
      expect(result.data.map((r) => r.name)).toContain('Charlie')
    })

    it('returns all records when all IDs are valid', async () => {
      const result = await dataProvider.getMany<MockRecord>('users', {
        ids: ['1', '2', '3', '4', '5'],
      })

      expect(result.data).toHaveLength(5)
    })
  })

  describe('order preservation', () => {
    it('returns records in same order as input IDs', async () => {
      const result = await dataProvider.getMany<MockRecord>('users', {
        ids: ['3', '1', '5', '2'],
      })

      expect(result.data).toHaveLength(4)
      expect(result.data[0].id).toBe('3')
      expect(result.data[1].id).toBe('1')
      expect(result.data[2].id).toBe('5')
      expect(result.data[3].id).toBe('2')
    })

    it('maintains order with reverse ID sequence', async () => {
      const result = await dataProvider.getMany<MockRecord>('users', {
        ids: ['5', '4', '3', '2', '1'],
      })

      expect(result.data).toHaveLength(5)
      expect(result.data[0].id).toBe('5')
      expect(result.data[1].id).toBe('4')
      expect(result.data[2].id).toBe('3')
      expect(result.data[3].id).toBe('2')
      expect(result.data[4].id).toBe('1')
    })
  })

  describe('mixed existing and non-existing IDs', () => {
    it('returns only existing records for mix of valid and invalid IDs', async () => {
      const result = await dataProvider.getMany<MockRecord>('users', {
        ids: ['1', 'nonexistent', '3', 'also-missing'],
      })

      expect(result.data).toHaveLength(2)
      expect(result.data.map((r) => r.id)).toContain('1')
      expect(result.data.map((r) => r.id)).toContain('3')
    })

    it('returns empty array when all IDs are non-existing', async () => {
      const result = await dataProvider.getMany('users', {
        ids: ['nonexistent1', 'nonexistent2', 'nonexistent3'],
      })

      expect(result).toEqual({ data: [] })
    })

    it('preserves order for existing records when mixed with non-existing', async () => {
      const result = await dataProvider.getMany<MockRecord>('users', {
        ids: ['nonexistent', '3', 'missing', '1'],
      })

      expect(result.data).toHaveLength(2)
      // Order should be: 3 then 1 (existing IDs in their original order)
      expect(result.data[0].id).toBe('3')
      expect(result.data[1].id).toBe('1')
    })
  })

  describe('duplicate IDs', () => {
    it('handles duplicate IDs in input correctly', async () => {
      const result = await dataProvider.getMany<MockRecord>('users', {
        ids: ['1', '1', '2', '2', '1'],
      })

      // Should return each record only once, but preserve the order of first occurrence
      expect(result.data).toHaveLength(2)
      expect(result.data[0].id).toBe('1')
      expect(result.data[1].id).toBe('2')
    })

    it('handles single duplicate ID', async () => {
      const result = await dataProvider.getMany<MockRecord>('users', {
        ids: ['3', '3'],
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('3')
      expect(result.data[0].name).toBe('Charlie')
    })
  })

  describe('invalid resource', () => {
    it('throws error for invalid resource name', async () => {
      await expect(
        dataProvider.getMany('nonexistent_resource', { ids: ['1'] })
      ).rejects.toThrow()
    })

    it('throws error with descriptive message for unknown resource', async () => {
      await expect(
        dataProvider.getMany('unknown_table', { ids: ['1', '2'] })
      ).rejects.toThrow(/unknown_table|not found|Resource/i)
    })
  })

  describe('identifier types', () => {
    it('handles numeric IDs', async () => {
      // Create a store with numeric IDs
      const numericUsers: MockRecord[] = [
        { id: 1, name: 'User One' },
        { id: 2, name: 'User Two' },
        { id: 3, name: 'User Three' },
      ]
      const numericStore = createMockDataStore({ users: numericUsers })
      const provider = createDataStoreProvider({ dataStore: numericStore })

      const result = await provider.getMany<MockRecord>('users', {
        ids: [1, 3],
      })

      expect(result.data).toHaveLength(2)
      expect(result.data.map((r) => r.id)).toContain(1)
      expect(result.data.map((r) => r.id)).toContain(3)
    })

    it('handles mixed string and numeric IDs', async () => {
      // The DataStore converts IDs to strings, so test coercion handling
      const result = await dataProvider.getMany<MockRecord>('users', {
        ids: [1, '2', 3] as Identifier[],
      })

      expect(result.data).toHaveLength(3)
    })
  })
})
