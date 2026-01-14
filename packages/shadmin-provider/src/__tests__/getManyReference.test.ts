import { describe, it, expect, beforeEach } from 'vitest'
import { createDataStoreProvider } from '../index'
import type { IDataStore, SaaSSchema, FindAllOptions } from '@saaskit/schema'
import type {
  DataProvider,
  GetManyReferenceParams,
  GetManyReferenceResult,
  RaRecord,
  Identifier,
} from '../types'

// ============================================================================
// Mock DataStore Implementation
// ============================================================================

/** Empty schema for testing - getManyReference only uses findAll */
const mockSchema: SaaSSchema = {
  name: 'test-schema',
  version: '1.0.0',
  resources: [],
}

/**
 * Creates a mock DataStore implementing IDataStore interface
 */
function createMockDataStore(initialData: Record<string, Record<string, unknown>[]>): IDataStore {
  const data = { ...initialData }

  return {
    schema: mockSchema,

    create(resourceName: string, data: Record<string, unknown>): Record<string, unknown> {
      throw new Error('create not implemented in mock')
    },

    findById(resourceName: string, id: string): Record<string, unknown> | null {
      const records = data[resourceName] || []
      return records.find((r) => String(r.id) === id) ?? null
    },

    findAll(resourceName: string, options?: FindAllOptions): Record<string, unknown>[] {
      let records = [...(data[resourceName] || [])]

      // Apply where filter
      if (options?.where) {
        records = records.filter((record) => {
          for (const [key, value] of Object.entries(options.where!)) {
            if (record[key] !== value) {
              return false
            }
          }
          return true
        })
      }

      // Apply offset
      if (options?.offset !== undefined) {
        records = records.slice(options.offset)
      }

      // Apply limit
      if (options?.limit !== undefined) {
        records = records.slice(0, options.limit)
      }

      return records
    },

    update(resourceName: string, id: string, data: Record<string, unknown>): Record<string, unknown> {
      throw new Error('update not implemented in mock')
    },

    delete(resourceName: string, id: string): boolean {
      throw new Error('delete not implemented in mock')
    },

    getRelated(
      resourceName: string,
      id: string,
      relationName: string
    ): Record<string, unknown> | Record<string, unknown>[] | null {
      throw new Error('getRelated not implemented in mock')
    },
  }
}

// ============================================================================
// Test Data
// ============================================================================

interface Post extends RaRecord {
  id: Identifier
  title: string
  authorId: Identifier
  createdAt: string
}

interface Comment extends RaRecord {
  id: Identifier
  body: string
  postId: Identifier
  authorId: Identifier
  createdAt: string
  approved: boolean
}

const testPosts: Post[] = [
  { id: '1', title: 'First Post', authorId: 'author-1', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', title: 'Second Post', authorId: 'author-1', createdAt: '2024-01-02T00:00:00Z' },
  { id: '3', title: 'Third Post', authorId: 'author-2', createdAt: '2024-01-03T00:00:00Z' },
]

const testComments: Comment[] = [
  { id: 'c1', body: 'Comment 1 on Post 1', postId: '1', authorId: 'author-1', createdAt: '2024-01-01T10:00:00Z', approved: true },
  { id: 'c2', body: 'Comment 2 on Post 1', postId: '1', authorId: 'author-2', createdAt: '2024-01-01T11:00:00Z', approved: true },
  { id: 'c3', body: 'Comment 3 on Post 1', postId: '1', authorId: 'author-3', createdAt: '2024-01-01T12:00:00Z', approved: false },
  { id: 'c4', body: 'Comment 1 on Post 2', postId: '2', authorId: 'author-1', createdAt: '2024-01-02T10:00:00Z', approved: true },
  { id: 'c5', body: 'Comment 2 on Post 2', postId: '2', authorId: 'author-2', createdAt: '2024-01-02T11:00:00Z', approved: true },
  // Post 3 has no comments
]

// ============================================================================
// Tests for getManyReference
// ============================================================================

describe('getManyReference', () => {
  let dataStore: IDataStore
  let dataProvider: DataProvider

  beforeEach(() => {
    dataStore = createMockDataStore({
      posts: testPosts as Record<string, unknown>[],
      comments: testComments as Record<string, unknown>[],
    })
    dataProvider = createDataStoreProvider({ dataStore })
  })

  // ==========================================================================
  // Test Case 1: Returns records referencing the target ID
  // ==========================================================================

  describe('returns records referencing the target ID', () => {
    it('should return all comments for a specific post via postId FK', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'id', order: 'ASC' },
        filter: {},
      })

      expect(result.data).toHaveLength(3)
      expect(result.total).toBe(3)
      expect(result.data.every((comment) => comment.postId === '1')).toBe(true)
      expect(result.data.map((c) => c.id)).toEqual(['c1', 'c2', 'c3'])
    })

    it('should return all posts for a specific author via authorId FK', async () => {
      const result = await dataProvider.getManyReference<Post>('posts', {
        target: 'authorId',
        id: 'author-1',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'id', order: 'ASC' },
        filter: {},
      })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.data.every((post) => post.authorId === 'author-1')).toBe(true)
    })
  })

  // ==========================================================================
  // Test Case 2: Returns empty when no references exist
  // ==========================================================================

  describe('returns empty when no references exist', () => {
    it('should return { data: [], total: 0 } when no comments exist for a post', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '3', // Post 3 has no comments
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'id', order: 'ASC' },
        filter: {},
      })

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should return { data: [], total: 0 } for non-existent target ID', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: 'non-existent-post-id',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'id', order: 'ASC' },
        filter: {},
      })

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  // ==========================================================================
  // Test Case 3: Pagination works (page, perPage)
  // ==========================================================================

  describe('pagination works', () => {
    it('should return first page with correct perPage limit', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 1, perPage: 2 },
        sort: { field: 'id', order: 'ASC' },
        filter: {},
      })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(3) // Total should still be 3
      expect(result.data.map((c) => c.id)).toEqual(['c1', 'c2'])
    })

    it('should return second page correctly', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 2, perPage: 2 },
        sort: { field: 'id', order: 'ASC' },
        filter: {},
      })

      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(3)
      expect(result.data.map((c) => c.id)).toEqual(['c3'])
    })

    it('should return empty array when page exceeds available data', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 10, perPage: 2 },
        sort: { field: 'id', order: 'ASC' },
        filter: {},
      })

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(3)
    })

    it('should handle perPage larger than total records', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'id', order: 'ASC' },
        filter: {},
      })

      expect(result.data).toHaveLength(3)
      expect(result.total).toBe(3)
    })
  })

  // ==========================================================================
  // Test Case 4: Sorting works (ASC/DESC)
  // ==========================================================================

  describe('sorting works', () => {
    it('should sort by field in ASC order', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'createdAt', order: 'ASC' },
        filter: {},
      })

      expect(result.data.map((c) => c.id)).toEqual(['c1', 'c2', 'c3'])
    })

    it('should sort by field in DESC order', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'createdAt', order: 'DESC' },
        filter: {},
      })

      expect(result.data.map((c) => c.id)).toEqual(['c3', 'c2', 'c1'])
    })

    it('should sort by different fields', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'body', order: 'DESC' },
        filter: {},
      })

      // "Comment 3..." > "Comment 2..." > "Comment 1..."
      expect(result.data.map((c) => c.id)).toEqual(['c3', 'c2', 'c1'])
    })
  })

  // ==========================================================================
  // Test Case 5: Additional filters combined with reference filter
  // ==========================================================================

  describe('additional filters combined with reference filter', () => {
    it('should filter by both reference and additional filter', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'id', order: 'ASC' },
        filter: { approved: true },
      })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.data.every((c) => c.approved === true)).toBe(true)
      expect(result.data.every((c) => c.postId === '1')).toBe(true)
    })

    it('should filter by multiple additional filters', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'id', order: 'ASC' },
        filter: { approved: true, authorId: 'author-1' },
      })

      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.data[0].id).toBe('c1')
    })

    it('should return empty when filter eliminates all records', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'id', order: 'ASC' },
        filter: { authorId: 'non-existent-author' },
      })

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should correctly calculate total with filters applied', async () => {
      // There are 3 comments on post 1, but only 2 are approved
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'postId',
        id: '1',
        pagination: { page: 1, perPage: 1 }, // Only get 1 per page
        sort: { field: 'id', order: 'ASC' },
        filter: { approved: true },
      })

      expect(result.data).toHaveLength(1) // Only 1 due to perPage
      expect(result.total).toBe(2) // But total should be 2 (all approved comments on post 1)
    })
  })

  // ==========================================================================
  // Test Case 6: Invalid target field returns empty
  // ==========================================================================

  describe('invalid target field returns empty', () => {
    it('should return { data: [], total: 0 } when target field does not exist', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: 'nonExistentField',
        id: '1',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'id', order: 'ASC' },
        filter: {},
      })

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should return empty for empty target field name', async () => {
      const result = await dataProvider.getManyReference<Comment>('comments', {
        target: '',
        id: '1',
        pagination: { page: 1, perPage: 25 },
        sort: { field: 'id', order: 'ASC' },
        filter: {},
      })

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })
})
