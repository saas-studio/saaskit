import { describe, it, expect, beforeEach } from 'vitest'
import type {
  DataProvider,
  GetListParams,
  GetListResult,
  RaRecord,
  SortPayload,
  PaginationPayload,
  FilterPayload,
} from '../types'
import type { IDataStore, FindAllOptions } from '@saaskit/schema'
import { createDataStoreProvider } from '../index'

// ============================================================================
// Mock DataStore Implementation
// ============================================================================

interface MockRecord extends RaRecord {
  id: string
  name?: string
  status?: string
  priority?: number
  createdAt?: string
}

/**
 * Mock DataStore for testing the DataProvider adapter.
 * Implements IDataStore interface with in-memory storage.
 */
class MockDataStore implements IDataStore {
  private data: Map<string, Map<string, MockRecord>> = new Map()

  // IDataStore requires a schema property, but we only need a minimal stub for testing
  public readonly schema = {
    metadata: { name: 'test', version: '1.0.0' },
    resources: [],
  } as unknown as IDataStore['schema']

  constructor(initialData?: Record<string, MockRecord[]>) {
    if (initialData) {
      for (const [resource, records] of Object.entries(initialData)) {
        const resourceMap = new Map<string, MockRecord>()
        for (const record of records) {
          resourceMap.set(String(record.id), record)
        }
        this.data.set(resource, resourceMap)
      }
    }
  }

  /**
   * Register a resource (allows tests to set up empty resources)
   */
  registerResource(resourceName: string): void {
    if (!this.data.has(resourceName)) {
      this.data.set(resourceName, new Map())
    }
  }

  create(resourceName: string, data: Record<string, unknown>): Record<string, unknown> {
    const resourceData = this.data.get(resourceName)
    if (!resourceData) {
      throw new Error(`Resource "${resourceName}" not found`)
    }
    const id = data.id as string || crypto.randomUUID()
    const record = { ...data, id }
    resourceData.set(id, record as MockRecord)
    return record
  }

  findById(resourceName: string, id: string): Record<string, unknown> | null {
    const resourceData = this.data.get(resourceName)
    if (!resourceData) {
      throw new Error(`Resource "${resourceName}" not found`)
    }
    return resourceData.get(id) || null
  }

  findAll(resourceName: string, options?: FindAllOptions): Record<string, unknown>[] {
    const resourceData = this.data.get(resourceName)
    if (!resourceData) {
      throw new Error(`Resource "${resourceName}" not found`)
    }

    let records = Array.from(resourceData.values())

    // Apply where filter
    if (options?.where) {
      records = records.filter((record) => {
        for (const [key, value] of Object.entries(options.where!)) {
          if (record[key as keyof MockRecord] !== value) {
            return false
          }
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

    return records
  }

  update(resourceName: string, id: string, data: Record<string, unknown>): Record<string, unknown> {
    const resourceData = this.data.get(resourceName)
    if (!resourceData) {
      throw new Error(`Resource "${resourceName}" not found`)
    }
    const existing = resourceData.get(id)
    if (!existing) {
      throw new Error(`Record with id "${id}" not found`)
    }
    const updated = { ...existing, ...data, id }
    resourceData.set(id, updated as MockRecord)
    return updated
  }

  delete(resourceName: string, id: string): boolean {
    const resourceData = this.data.get(resourceName)
    if (!resourceData) {
      throw new Error(`Resource "${resourceName}" not found`)
    }
    return resourceData.delete(id)
  }

  getRelated(
    _resourceName: string,
    _id: string,
    _relationName: string
  ): Record<string, unknown> | Record<string, unknown>[] | null {
    // Not needed for getList tests
    return null
  }

  /**
   * Helper to get total count for a resource (with optional filter)
   * Used by tests to verify total count behavior
   */
  count(resourceName: string, where?: Record<string, unknown>): number {
    const resourceData = this.data.get(resourceName)
    if (!resourceData) {
      throw new Error(`Resource "${resourceName}" not found`)
    }

    if (!where) {
      return resourceData.size
    }

    let count = 0
    for (const record of resourceData.values()) {
      let matches = true
      for (const [key, value] of Object.entries(where)) {
        if (record[key as keyof MockRecord] !== value) {
          matches = false
          break
        }
      }
      if (matches) count++
    }
    return count
  }
}

// ============================================================================
// Test Helper Functions
// ============================================================================

/**
 * Create default GetListParams for testing
 */
function createGetListParams(overrides?: Partial<GetListParams>): GetListParams {
  return {
    pagination: { page: 1, perPage: 10 },
    sort: { field: 'id', order: 'ASC' },
    filter: {},
    ...overrides,
  }
}

/**
 * Generate test records with sequential IDs
 * Uses zero-padded IDs for correct alphabetic sorting
 */
function generateTestRecords(count: number, overrides?: Partial<MockRecord>): MockRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${String(i + 1).padStart(2, '0')}`,
    name: `Record ${i + 1}`,
    status: 'active',
    priority: i + 1,
    createdAt: new Date(2024, 0, i + 1).toISOString(),
    ...overrides,
  }))
}

// ============================================================================
// Tests
// ============================================================================

describe('DataProvider.getList()', () => {
  let mockDataStore: MockDataStore
  let dataProvider: DataProvider

  // ============================================================================
  // Empty Resource
  // ============================================================================

  describe('empty resource', () => {
    beforeEach(() => {
      mockDataStore = new MockDataStore()
      mockDataStore.registerResource('users')
      dataProvider = createDataStoreProvider({ dataStore: mockDataStore })
    })

    it('should return { data: [], total: 0 } for empty resource', async () => {
      const params = createGetListParams()
      const result = await dataProvider.getList('users', params)

      expect(result).toEqual({
        data: [],
        total: 0,
      })
    })
  })

  // ============================================================================
  // All Records (No Filters)
  // ============================================================================

  describe('all records (no filters)', () => {
    beforeEach(() => {
      const records = generateTestRecords(5)
      mockDataStore = new MockDataStore({ users: records })
      dataProvider = createDataStoreProvider({ dataStore: mockDataStore })
    })

    it('should return all records when no filters are applied', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 100 }, // Large enough to get all
      })
      const result = await dataProvider.getList('users', params)

      expect(result.data).toHaveLength(5)
      expect(result.total).toBe(5)
    })

    it('should include all record properties in returned data', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 100 },
      })
      const result = await dataProvider.getList<MockRecord>('users', params)

      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('name')
      expect(result.data[0]).toHaveProperty('status')
      expect(result.data[0]).toHaveProperty('priority')
    })
  })

  // ============================================================================
  // Pagination
  // ============================================================================

  describe('pagination', () => {
    beforeEach(() => {
      const records = generateTestRecords(25)
      mockDataStore = new MockDataStore({ users: records })
      dataProvider = createDataStoreProvider({ dataStore: mockDataStore })
    })

    it('should respect page parameter (1-indexed)', async () => {
      // Page 1 should return first 10 records
      const page1Params = createGetListParams({
        pagination: { page: 1, perPage: 10 },
      })
      const page1Result = await dataProvider.getList<MockRecord>('users', page1Params)

      expect(page1Result.data).toHaveLength(10)
      expect(page1Result.data[0].id).toBe('id-01')
      expect(page1Result.data[9].id).toBe('id-10')

      // Page 2 should return next 10 records
      const page2Params = createGetListParams({
        pagination: { page: 2, perPage: 10 },
      })
      const page2Result = await dataProvider.getList<MockRecord>('users', page2Params)

      expect(page2Result.data).toHaveLength(10)
      expect(page2Result.data[0].id).toBe('id-11')
      expect(page2Result.data[9].id).toBe('id-20')

      // Page 3 should return remaining 5 records
      const page3Params = createGetListParams({
        pagination: { page: 3, perPage: 10 },
      })
      const page3Result = await dataProvider.getList<MockRecord>('users', page3Params)

      expect(page3Result.data).toHaveLength(5)
      expect(page3Result.data[0].id).toBe('id-21')
      expect(page3Result.data[4].id).toBe('id-25')
    })

    it('should respect perPage parameter', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 5 },
      })
      const result = await dataProvider.getList('users', params)

      expect(result.data).toHaveLength(5)
    })

    it('should return empty data for page beyond total records', async () => {
      const params = createGetListParams({
        pagination: { page: 100, perPage: 10 },
      })
      const result = await dataProvider.getList('users', params)

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(25) // Total should still reflect all records
    })

    it('should handle perPage larger than total records', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 100 },
      })
      const result = await dataProvider.getList('users', params)

      expect(result.data).toHaveLength(25) // All records
      expect(result.total).toBe(25)
    })
  })

  // ============================================================================
  // Total Count
  // ============================================================================

  describe('total count', () => {
    beforeEach(() => {
      const records = [
        ...generateTestRecords(10, { status: 'active' }),
        ...generateTestRecords(5, { status: 'inactive' }).map((r, i) => ({
          ...r,
          id: `inactive-${i + 1}`,
        })),
      ]
      mockDataStore = new MockDataStore({ users: records })
      dataProvider = createDataStoreProvider({ dataStore: mockDataStore })
    })

    it('should return correct total count before pagination', async () => {
      // Request page 1 with perPage=3, but total should reflect all 15 records
      const params = createGetListParams({
        pagination: { page: 1, perPage: 3 },
      })
      const result = await dataProvider.getList('users', params)

      expect(result.data).toHaveLength(3)
      expect(result.total).toBe(15) // All records, not just page
    })

    it('should return correct total count with filter applied', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 3 },
        filter: { status: 'active' },
      })
      const result = await dataProvider.getList('users', params)

      expect(result.data).toHaveLength(3)
      expect(result.total).toBe(10) // Only active records count
    })
  })

  // ============================================================================
  // Sorting
  // ============================================================================

  describe('sorting', () => {
    beforeEach(() => {
      const records: MockRecord[] = [
        { id: 'id-3', name: 'Charlie', priority: 3, status: 'active' },
        { id: 'id-1', name: 'Alice', priority: 1, status: 'active' },
        { id: 'id-2', name: 'Bob', priority: 2, status: 'inactive' },
        { id: 'id-5', name: 'Eve', priority: 5, status: 'active' },
        { id: 'id-4', name: 'Diana', priority: 4, status: 'inactive' },
      ]
      mockDataStore = new MockDataStore({ users: records })
      dataProvider = createDataStoreProvider({ dataStore: mockDataStore })
    })

    it('should sort by field in ASC order', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'name', order: 'ASC' },
      })
      const result = await dataProvider.getList<MockRecord>('users', params)

      expect(result.data[0].name).toBe('Alice')
      expect(result.data[1].name).toBe('Bob')
      expect(result.data[2].name).toBe('Charlie')
      expect(result.data[3].name).toBe('Diana')
      expect(result.data[4].name).toBe('Eve')
    })

    it('should sort by field in DESC order', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'name', order: 'DESC' },
      })
      const result = await dataProvider.getList<MockRecord>('users', params)

      expect(result.data[0].name).toBe('Eve')
      expect(result.data[1].name).toBe('Diana')
      expect(result.data[2].name).toBe('Charlie')
      expect(result.data[3].name).toBe('Bob')
      expect(result.data[4].name).toBe('Alice')
    })

    it('should sort numeric fields correctly', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'priority', order: 'ASC' },
      })
      const result = await dataProvider.getList<MockRecord>('users', params)

      expect(result.data[0].priority).toBe(1)
      expect(result.data[1].priority).toBe(2)
      expect(result.data[2].priority).toBe(3)
      expect(result.data[3].priority).toBe(4)
      expect(result.data[4].priority).toBe(5)
    })

    it('should sort numeric fields in DESC order correctly', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'priority', order: 'DESC' },
      })
      const result = await dataProvider.getList<MockRecord>('users', params)

      expect(result.data[0].priority).toBe(5)
      expect(result.data[1].priority).toBe(4)
      expect(result.data[2].priority).toBe(3)
      expect(result.data[3].priority).toBe(2)
      expect(result.data[4].priority).toBe(1)
    })

    it('should apply sorting before pagination', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 2 },
        sort: { field: 'priority', order: 'DESC' },
      })
      const result = await dataProvider.getList<MockRecord>('users', params)

      // Should get highest priority items first, then paginate
      expect(result.data).toHaveLength(2)
      expect(result.data[0].priority).toBe(5)
      expect(result.data[1].priority).toBe(4)
    })
  })

  // ============================================================================
  // Filtering
  // ============================================================================

  describe('filtering', () => {
    beforeEach(() => {
      const records: MockRecord[] = [
        { id: 'id-1', name: 'Alice', status: 'active', priority: 1 },
        { id: 'id-2', name: 'Bob', status: 'inactive', priority: 2 },
        { id: 'id-3', name: 'Charlie', status: 'active', priority: 1 },
        { id: 'id-4', name: 'Diana', status: 'pending', priority: 3 },
        { id: 'id-5', name: 'Eve', status: 'active', priority: 2 },
      ]
      mockDataStore = new MockDataStore({ users: records })
      dataProvider = createDataStoreProvider({ dataStore: mockDataStore })
    })

    it('should filter by exact match on single field', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 10 },
        filter: { status: 'active' },
      })
      const result = await dataProvider.getList<MockRecord>('users', params)

      expect(result.data).toHaveLength(3)
      expect(result.data.every((r) => r.status === 'active')).toBe(true)
      expect(result.total).toBe(3)
    })

    it('should filter by multiple fields with AND logic', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 10 },
        filter: { status: 'active', priority: 1 },
      })
      const result = await dataProvider.getList<MockRecord>('users', params)

      expect(result.data).toHaveLength(2)
      expect(result.data.every((r) => r.status === 'active' && r.priority === 1)).toBe(true)
      expect(result.total).toBe(2)
    })

    it('should return empty array when no records match filter', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 10 },
        filter: { status: 'nonexistent' },
      })
      const result = await dataProvider.getList('users', params)

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should apply filter before sorting and pagination', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 2 },
        sort: { field: 'name', order: 'ASC' },
        filter: { status: 'active' },
      })
      const result = await dataProvider.getList<MockRecord>('users', params)

      // Filter to active (Alice, Charlie, Eve), sort by name ASC, then paginate
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Alice')
      expect(result.data[1].name).toBe('Charlie')
      expect(result.total).toBe(3) // Total active records
    })
  })

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    beforeEach(() => {
      const records = generateTestRecords(10)
      mockDataStore = new MockDataStore({ users: records })
      dataProvider = createDataStoreProvider({ dataStore: mockDataStore })
    })

    it('should throw error for invalid/unknown resource', async () => {
      const params = createGetListParams()

      await expect(
        dataProvider.getList('nonexistent_resource', params)
      ).rejects.toThrow(/resource.*not found|unknown resource|invalid resource/i)
    })

    it('should handle negative page number gracefully', async () => {
      const params = createGetListParams({
        pagination: { page: -1, perPage: 10 },
      })

      // Should either throw an error or treat as page 1
      // Implementation can choose either behavior
      await expect(async () => {
        const result = await dataProvider.getList('users', params)
        // If it doesn't throw, it should return sensible results
        expect(result.data.length).toBeGreaterThanOrEqual(0)
        expect(result.total).toBe(10)
      }).not.toThrow()
    })

    it('should handle page 0 gracefully', async () => {
      const params = createGetListParams({
        pagination: { page: 0, perPage: 10 },
      })

      // Should either throw an error or treat as page 1
      await expect(async () => {
        const result = await dataProvider.getList('users', params)
        expect(result.data.length).toBeGreaterThanOrEqual(0)
      }).not.toThrow()
    })

    it('should handle perPage of 0', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: 0 },
      })

      const result = await dataProvider.getList('users', params)
      // perPage of 0 should return empty data but correct total
      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(10)
    })

    it('should handle negative perPage gracefully', async () => {
      const params = createGetListParams({
        pagination: { page: 1, perPage: -5 },
      })

      // Should either throw an error or return empty/sensible results
      await expect(async () => {
        const result = await dataProvider.getList('users', params)
        expect(result.total).toBe(10)
      }).not.toThrow()
    })
  })

  // ============================================================================
  // Return Type Validation
  // ============================================================================

  describe('return type validation', () => {
    beforeEach(() => {
      const records = generateTestRecords(3)
      mockDataStore = new MockDataStore({ users: records })
      dataProvider = createDataStoreProvider({ dataStore: mockDataStore })
    })

    it('should return object with data array and total number', async () => {
      const params = createGetListParams()
      const result = await dataProvider.getList('users', params)

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(Array.isArray(result.data)).toBe(true)
      expect(typeof result.total).toBe('number')
    })

    it('should return records with id property', async () => {
      const params = createGetListParams()
      const result = await dataProvider.getList<MockRecord>('users', params)

      for (const record of result.data) {
        expect(record).toHaveProperty('id')
        expect(record.id).toBeDefined()
      }
    })
  })
})
