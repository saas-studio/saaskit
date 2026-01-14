/**
 * TDD RED Tests: Relation-Aware Query Builder
 *
 * These tests define the expected behavior for building MongoDB aggregation
 * pipelines from schema relations. All tests are expected to FAIL until
 * the query builder is implemented.
 *
 * @see saaskit-8sk
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { SaaSSchema, Resource, Field, Relation } from '../types'
import { MongoDataStore, type MongoFindAllOptions } from '../mongo-data-store'

// Helper type for records with populated relations
type RecordWithRelations = Record<string, unknown> & {
  author?: RecordWithRelations
  company?: RecordWithRelations & { contacts?: RecordWithRelations[] }
  contact?: RecordWithRelations
  category?: RecordWithRelations
  comments?: Array<RecordWithRelations & { author?: RecordWithRelations }>
  tags?: RecordWithRelations[]
  posts?: RecordWithRelations[]
  todos?: RecordWithRelations[]
  list?: RecordWithRelations
  name?: string
  email?: string
  id?: string
  title?: string
}

// ============================================================================
// Test Fixtures: Schema with Relations
// ============================================================================

const createField = (overrides: Partial<Field>): Field => ({
  name: 'testField',
  type: 'string',
  required: true,
  ...overrides,
})

const testSchema: SaaSSchema = {
  metadata: {
    name: 'test-app',
    version: '1.0.0',
    description: 'Test schema with relations',
  },
  resources: [
    // User resource
    {
      name: 'User',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'name', type: 'string', required: true }),
        createField({ name: 'email', type: 'email', required: true }),
      ],
      relations: [],
    },
    // Category resource
    {
      name: 'Category',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'name', type: 'string', required: true }),
        createField({ name: 'slug', type: 'string', required: true }),
      ],
      relations: [],
    },
    // Tag resource
    {
      name: 'Tag',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'name', type: 'string', required: true }),
      ],
      relations: [],
    },
    // Post resource with belongsTo User and hasMany Tags via junction
    {
      name: 'Post',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'title', type: 'string', required: true }),
        createField({ name: 'content', type: 'string', required: false }),
        createField({
          name: 'status',
          type: 'enum',
          required: true,
          annotations: { enumValues: ['draft', 'published', 'archived'] },
        }),
        createField({ name: 'authorId', type: 'string', required: true }),
        createField({ name: 'categoryId', type: 'string', required: false }),
      ],
      relations: [
        // belongsTo User
        { name: 'author', to: 'User', cardinality: 'one', required: true },
        // belongsTo Category (optional)
        { name: 'category', to: 'Category', cardinality: 'one', required: false },
      ],
    },
    // PostTag junction table for many-to-many
    {
      name: 'PostTag',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'postId', type: 'string', required: true }),
        createField({ name: 'tagId', type: 'string', required: true }),
      ],
      relations: [
        { name: 'post', to: 'Post', cardinality: 'one', required: true },
        { name: 'tag', to: 'Tag', cardinality: 'one', required: true },
      ],
    },
    // Comment resource with belongsTo Post
    {
      name: 'Comment',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'body', type: 'string', required: true }),
        createField({ name: 'postId', type: 'string', required: true }),
        createField({ name: 'authorId', type: 'string', required: true }),
      ],
      relations: [
        { name: 'post', to: 'Post', cardinality: 'one', required: true },
        { name: 'author', to: 'User', cardinality: 'one', required: true },
      ],
    },
    // Company resource
    {
      name: 'Company',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'name', type: 'string', required: true }),
      ],
      relations: [],
    },
    // Contact resource with belongsTo Company
    {
      name: 'Contact',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'name', type: 'string', required: true }),
        createField({ name: 'email', type: 'email', required: true }),
        createField({ name: 'companyId', type: 'string', required: true }),
      ],
      relations: [
        { name: 'company', to: 'Company', cardinality: 'one', required: true },
      ],
    },
    // Deal resource with nested relations
    {
      name: 'Deal',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'title', type: 'string', required: true }),
        createField({ name: 'value', type: 'number', required: true }),
        createField({ name: 'companyId', type: 'string', required: true }),
        createField({ name: 'contactId', type: 'string', required: false }),
      ],
      relations: [
        { name: 'company', to: 'Company', cardinality: 'one', required: true },
        { name: 'contact', to: 'Contact', cardinality: 'one', required: false },
      ],
    },
    // List resource (for Todo app example)
    {
      name: 'List',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'name', type: 'string', required: true }),
      ],
      relations: [],
    },
    // Todo resource with belongsTo List
    {
      name: 'Todo',
      fields: [
        createField({ name: 'id', type: 'string', required: false }),
        createField({ name: 'title', type: 'string', required: true }),
        createField({ name: 'completed', type: 'boolean', required: true }),
        createField({ name: 'listId', type: 'string', required: true }),
      ],
      relations: [
        { name: 'list', to: 'List', cardinality: 'one', required: true },
      ],
    },
  ],
}

// ============================================================================
// Test Suite
// ============================================================================

describe('Relation-Aware Query Builder', () => {
  let store: MongoDataStore

  beforeEach(async () => {
    store = new MongoDataStore(testSchema, {
      database: 'test_query_builder',
      inMemory: true,
    })
    await store.connect()
  })

  afterEach(async () => {
    await store.disconnect()
  })

  // ==========================================================================
  // Test 1: belongsTo lookup - Todo.list → $lookup to List collection
  // ==========================================================================

  describe('belongsTo Relations', () => {
    it('should populate belongsTo relation with include option', async () => {
      // Create test data
      const list = await store.create('List', { name: 'Shopping' })
      const todo = await store.create('Todo', {
        title: 'Buy milk',
        completed: false,
        listId: list.id,
      })

      // Query with include
      const todos = await store.findAll('Todo', {
        include: ['list'],
      }) as RecordWithRelations[]

      expect(todos).toHaveLength(1)
      expect(todos[0].title).toBe('Buy milk')
      // The list relation should be populated
      expect(todos[0].list).toBeDefined()
      expect(todos[0].list!.name).toBe('Shopping')
      expect(todos[0].list!.id).toBe(list.id as string)
    })

    it('should populate Post.author relation', async () => {
      const user = await store.create('User', {
        name: 'Alice',
        email: 'alice@example.com',
      })
      const post = await store.create('Post', {
        title: 'Hello World',
        status: 'published',
        authorId: user.id,
      })

      const posts = await store.findAll('Post', {
        include: ['author'],
      }) as RecordWithRelations[]

      expect(posts).toHaveLength(1)
      expect(posts[0].author).toBeDefined()
      expect(posts[0].author!.name).toBe('Alice')
      expect(posts[0].author!.email).toBe('alice@example.com')
    })

    it('should handle null optional belongsTo relations', async () => {
      const user = await store.create('User', {
        name: 'Alice',
        email: 'alice@example.com',
      })
      const post = await store.create('Post', {
        title: 'Hello World',
        status: 'published',
        authorId: user.id,
        // categoryId is not set (optional relation)
      })

      const posts = await store.findAll('Post', {
        include: ['author', 'category'],
      }) as RecordWithRelations[]

      expect(posts).toHaveLength(1)
      expect(posts[0].author).toBeDefined()
      expect(posts[0].category).toBeNull() // Optional relation not set
    })
  })

  // ==========================================================================
  // Test 2: hasMany lookup - List.todos → $lookup with localField
  // ==========================================================================

  describe('hasMany Relations (Inverse)', () => {
    it('should populate hasMany relation via inverse lookup', async () => {
      const list = await store.create('List', { name: 'Work Tasks' })
      await store.create('Todo', {
        title: 'Task 1',
        completed: false,
        listId: list.id,
      })
      await store.create('Todo', {
        title: 'Task 2',
        completed: true,
        listId: list.id,
      })
      await store.create('Todo', {
        title: 'Task 3',
        completed: false,
        listId: list.id,
      })

      // Query List with its todos populated
      const lists = await store.findAll('List', {
        include: ['todos'], // hasMany - inverse of Todo.list
      }) as RecordWithRelations[]

      expect(lists).toHaveLength(1)
      expect(lists[0].name).toBe('Work Tasks')
      expect(lists[0].todos).toBeDefined()
      expect(lists[0].todos).toHaveLength(3)
      expect(lists[0].todos!.map((t) => t.title)).toEqual(
        expect.arrayContaining(['Task 1', 'Task 2', 'Task 3'])
      )
    })

    it('should return empty array for hasMany with no related records', async () => {
      const list = await store.create('List', { name: 'Empty List' })

      const lists = await store.findAll('List', {
        include: ['todos'],
      })

      expect(lists).toHaveLength(1)
      expect(lists[0].todos).toBeDefined()
      expect(lists[0].todos).toHaveLength(0)
      expect(lists[0].todos).toEqual([])
    })
  })

  // ==========================================================================
  // Test 3: Many-to-many via junction - Post.tags → double $lookup via PostTag
  // ==========================================================================

  describe('Many-to-Many Relations via Junction', () => {
    it('should populate many-to-many relation via junction table', async () => {
      const user = await store.create('User', {
        name: 'Alice',
        email: 'alice@example.com',
      })
      const post = await store.create('Post', {
        title: 'TypeScript Tips',
        status: 'published',
        authorId: user.id,
      })
      const tag1 = await store.create('Tag', { name: 'typescript' })
      const tag2 = await store.create('Tag', { name: 'javascript' })
      const tag3 = await store.create('Tag', { name: 'programming' })

      // Create junction records
      await store.create('PostTag', { postId: post.id, tagId: tag1.id })
      await store.create('PostTag', { postId: post.id, tagId: tag2.id })
      await store.create('PostTag', { postId: post.id, tagId: tag3.id })

      // Query posts with tags populated
      const posts = await store.findAll('Post', {
        include: ['tags'], // many-to-many via PostTag junction
      }) as RecordWithRelations[]

      expect(posts).toHaveLength(1)
      expect(posts[0].tags).toBeDefined()
      expect(posts[0].tags).toHaveLength(3)
      expect(posts[0].tags!.map((t) => t.name)).toEqual(
        expect.arrayContaining(['typescript', 'javascript', 'programming'])
      )
    })

    it('should handle posts with no tags', async () => {
      const user = await store.create('User', {
        name: 'Bob',
        email: 'bob@example.com',
      })
      const post = await store.create('Post', {
        title: 'No Tags Post',
        status: 'draft',
        authorId: user.id,
      })

      const posts = await store.findAll('Post', {
        include: ['tags'],
      })

      expect(posts).toHaveLength(1)
      expect(posts[0].tags).toBeDefined()
      expect(posts[0].tags).toHaveLength(0)
    })
  })

  // ==========================================================================
  // Test 4: Nested relations - Deal.company.contacts → chained $lookup
  // ==========================================================================

  describe('Nested Relations (Chained Lookups)', () => {
    it('should populate nested relations with dot notation', async () => {
      const company = await store.create('Company', { name: 'Acme Corp' })
      const contact1 = await store.create('Contact', {
        name: 'John',
        email: 'john@acme.com',
        companyId: company.id,
      })
      const contact2 = await store.create('Contact', {
        name: 'Jane',
        email: 'jane@acme.com',
        companyId: company.id,
      })
      const deal = await store.create('Deal', {
        title: 'Big Deal',
        value: 100000,
        companyId: company.id,
        contactId: contact1.id,
      })

      // Query deals with nested relations
      const deals = await store.findAll('Deal', {
        include: ['company.contacts'], // Nested: company and its contacts
      }) as RecordWithRelations[]

      expect(deals).toHaveLength(1)
      expect(deals[0].company).toBeDefined()
      expect(deals[0].company!.name).toBe('Acme Corp')
      expect(deals[0].company!.contacts).toBeDefined()
      expect(deals[0].company!.contacts).toHaveLength(2)
      expect(deals[0].company!.contacts!.map((c) => c.name)).toEqual(
        expect.arrayContaining(['John', 'Jane'])
      )
    })

    it('should populate deeply nested relations', async () => {
      const user = await store.create('User', {
        name: 'Author',
        email: 'author@example.com',
      })
      const post = await store.create('Post', {
        title: 'Popular Post',
        status: 'published',
        authorId: user.id,
      })
      const commenter = await store.create('User', {
        name: 'Commenter',
        email: 'commenter@example.com',
      })
      await store.create('Comment', {
        body: 'Great post!',
        postId: post.id,
        authorId: commenter.id,
      })

      // Query posts with comments and their authors
      const posts = await store.findAll('Post', {
        include: ['author', 'comments.author'],
      }) as RecordWithRelations[]

      expect(posts).toHaveLength(1)
      expect(posts[0].author!.name).toBe('Author')
      expect(posts[0].comments).toBeDefined()
      expect(posts[0].comments).toHaveLength(1)
      expect(posts[0].comments![0].author!.name).toBe('Commenter')
    })
  })

  // ==========================================================================
  // Test 5: Eager loading syntax - { include: ['author', 'tags'] }
  // ==========================================================================

  describe('Eager Loading Syntax', () => {
    it('should support multiple includes in single query', async () => {
      const user = await store.create('User', {
        name: 'Alice',
        email: 'alice@example.com',
      })
      const category = await store.create('Category', {
        name: 'Technology',
        slug: 'tech',
      })
      const post = await store.create('Post', {
        title: 'Tech Article',
        status: 'published',
        authorId: user.id,
        categoryId: category.id,
      })
      const tag = await store.create('Tag', { name: 'tech' })
      await store.create('PostTag', { postId: post.id, tagId: tag.id })

      // Multiple includes
      const posts = await store.findAll('Post', {
        include: ['author', 'category', 'tags'],
      }) as RecordWithRelations[]

      expect(posts).toHaveLength(1)
      expect(posts[0].author!.name).toBe('Alice')
      expect(posts[0].category!.name).toBe('Technology')
      expect(posts[0].tags).toHaveLength(1)
      expect(posts[0].tags![0].name).toBe('tech')
    })

    it('should work with where clause and include', async () => {
      const user = await store.create('User', {
        name: 'Alice',
        email: 'alice@example.com',
      })
      await store.create('Post', {
        title: 'Draft Post',
        status: 'draft',
        authorId: user.id,
      })
      await store.create('Post', {
        title: 'Published Post',
        status: 'published',
        authorId: user.id,
      })

      const posts = await store.findAll('Post', {
        where: { status: 'published' },
        include: ['author'],
      }) as RecordWithRelations[]

      expect(posts).toHaveLength(1)
      expect(posts[0].title).toBe('Published Post')
      expect(posts[0].author!.name).toBe('Alice')
    })

    it('should work with orderBy and include', async () => {
      const user = await store.create('User', {
        name: 'Alice',
        email: 'alice@example.com',
      })
      await store.create('Post', {
        title: 'First Post',
        status: 'published',
        authorId: user.id,
      })
      await store.create('Post', {
        title: 'Second Post',
        status: 'published',
        authorId: user.id,
      })

      const posts = await store.findAll('Post', {
        orderBy: { title: 'desc' },
        include: ['author'],
      }) as RecordWithRelations[]

      expect(posts).toHaveLength(2)
      expect(posts[0].title).toBe('Second Post')
      expect(posts[1].title).toBe('First Post')
      expect(posts[0].author!.name).toBe('Alice')
    })

    it('should work with limit/offset and include', async () => {
      const user = await store.create('User', {
        name: 'Alice',
        email: 'alice@example.com',
      })
      for (let i = 1; i <= 5; i++) {
        await store.create('Post', {
          title: `Post ${i}`,
          status: 'published',
          authorId: user.id,
        })
      }

      const posts = await store.findAll('Post', {
        limit: 2,
        offset: 1,
        orderBy: { title: 'asc' },
        include: ['author'],
      })

      expect(posts).toHaveLength(2)
      expect(posts[0].title).toBe('Post 2')
      expect(posts[1].title).toBe('Post 3')
      expect(posts[0].author).toBeDefined()
    })
  })

  // ==========================================================================
  // Test 6: Populate selected fields only
  // ==========================================================================

  describe('Field Selection in Relations', () => {
    it('should support selecting specific fields from relations', async () => {
      const user = await store.create('User', {
        name: 'Alice',
        email: 'alice@example.com',
      })
      const post = await store.create('Post', {
        title: 'Hello',
        status: 'published',
        authorId: user.id,
      })

      // Select only specific fields from author
      const posts = await store.findAll('Post', {
        include: [{ relation: 'author', select: ['name'] }],
      } as MongoFindAllOptions) as RecordWithRelations[]

      expect(posts).toHaveLength(1)
      expect(posts[0].author).toBeDefined()
      expect(posts[0].author!.name).toBe('Alice')
      // Email should not be included
      expect(posts[0].author!.email).toBeUndefined()
    })

    it('should support excluding fields from relations', async () => {
      const user = await store.create('User', {
        name: 'Alice',
        email: 'alice@example.com',
      })
      const post = await store.create('Post', {
        title: 'Hello',
        content: 'World',
        status: 'published',
        authorId: user.id,
      })

      // Exclude content field from response
      const posts = await store.findAll('Post', {
        include: ['author'],
        select: ['id', 'title', 'status', 'authorId'],
      }) as RecordWithRelations[]

      expect(posts).toHaveLength(1)
      expect(posts[0].title).toBe('Hello')
      expect(posts[0].content).toBeUndefined() // Excluded
      expect(posts[0].author!.name).toBe('Alice')
    })
  })

  // ==========================================================================
  // Additional Tests: Query Builder Aggregation Pipeline
  // ==========================================================================

  describe('Aggregation Pipeline Generation', () => {
    it('should generate correct $lookup stage for belongsTo', async () => {
      // This tests the internal pipeline generation
      // The store should generate a pipeline like:
      // [
      //   { $lookup: { from: 'List', localField: 'listId', foreignField: '_id', as: 'list' } },
      //   { $unwind: { path: '$list', preserveNullAndEmptyArrays: true } }
      // ]

      const list = await store.create('List', { name: 'Test' })
      const todo = await store.create('Todo', {
        title: 'Test Todo',
        completed: false,
        listId: list.id,
      })

      // @ts-expect-error - accessing private method for testing
      const pipeline = store.buildAggregationPipeline?.('Todo', { include: ['list'] })

      // If the method exists, verify pipeline structure
      if (pipeline) {
        expect(pipeline).toContainEqual(
          expect.objectContaining({
            $lookup: expect.objectContaining({
              from: 'List',
              as: 'list',
            }),
          })
        )
      }

      // Verify the result works correctly
      const todos = await store.findAll('Todo', { include: ['list'] })
      expect(todos[0].list).toBeDefined()
    })

    it('should handle circular relations without infinite loop', async () => {
      // Post has author (User), Comment has author (User) and post (Post)
      // Querying with nested includes should not create infinite loops

      const user = await store.create('User', {
        name: 'Alice',
        email: 'alice@example.com',
      })
      const post = await store.create('Post', {
        title: 'Post',
        status: 'published',
        authorId: user.id,
      })
      await store.create('Comment', {
        body: 'Comment',
        postId: post.id,
        authorId: user.id,
      })

      // This should not cause infinite recursion
      const posts = await store.findAll('Post', {
        include: ['author', 'comments.author'],
      }) as RecordWithRelations[]

      expect(posts).toHaveLength(1)
      expect(posts[0].comments![0].author!.id).toBe(user.id as string)
    })
  })
})
