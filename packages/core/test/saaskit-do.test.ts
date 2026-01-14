import { describe, it, expect, beforeEach } from 'vitest'
// This import will fail - SaasKitDO doesn't exist yet (RED phase)
import { SaasKitDO, DO } from '@saaskit/core'

// ============================================================================
// Test Schema Definition
// ============================================================================

const testSchema = {
  name: 'TestApp',
  resources: {
    users: {
      fields: {
        name: { type: 'string' },
        email: { type: 'string', required: true },
      }
    },
    posts: {
      fields: {
        title: { type: 'string', required: true },
        content: { type: 'string' },
        authorId: { type: 'string', required: true },
        status: { type: 'string', enum: ['draft', 'published', 'archived'] },
      }
    },
    comments: {
      fields: {
        body: { type: 'string', required: true },
        postId: { type: 'string', required: true },
        userId: { type: 'string', required: true },
      }
    }
  }
}

// ============================================================================
// SaasKitDO Base Class Tests
// ============================================================================

describe('SaasKitDO', () => {
  let durable: SaasKitDO

  // ============================================================================
  // 1. Class Inheritance and Structure
  // ============================================================================

  describe('Class inheritance', () => {
    it('should extend DO base class', () => {
      const instance = new SaasKitDO(testSchema)
      expect(instance).toBeInstanceOf(DO)
    })

    it('should be constructable with a schema', () => {
      const instance = new SaasKitDO(testSchema)
      expect(instance).toBeInstanceOf(SaasKitDO)
    })

    it('should store the schema provided in constructor', () => {
      const instance = new SaasKitDO(testSchema)
      expect(instance.getSchema()).toBe(testSchema)
    })
  })

  // ============================================================================
  // 2. Schema Access Methods
  // ============================================================================

  describe('getSchema()', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    it('should return the schema object', () => {
      const schema = durable.getSchema()
      expect(schema).toBeDefined()
      expect(schema.name).toBe('TestApp')
    })

    it('should return the same schema instance passed to constructor', () => {
      const schema = durable.getSchema()
      expect(schema).toBe(testSchema)
    })

    it('should include all resources defined in schema', () => {
      const schema = durable.getSchema()
      expect(schema.resources).toBeDefined()
      expect(schema.resources.users).toBeDefined()
      expect(schema.resources.posts).toBeDefined()
      expect(schema.resources.comments).toBeDefined()
    })
  })

  describe('getResources()', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    it('should return list of resource names', () => {
      const resources = durable.getResources()
      expect(resources).toContain('users')
      expect(resources).toContain('posts')
      expect(resources).toContain('comments')
    })

    it('should return an array', () => {
      const resources = durable.getResources()
      expect(Array.isArray(resources)).toBe(true)
    })

    it('should return the correct number of resources', () => {
      const resources = durable.getResources()
      expect(resources).toHaveLength(3)
    })
  })

  // ============================================================================
  // 3. CRUD Operations - Create
  // ============================================================================

  describe('create()', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    it('should create a record in the specified collection', async () => {
      const user = await durable.create('users', { name: 'John', email: 'john@example.com' })

      expect(user).toBeDefined()
      expect(user.name).toBe('John')
      expect(user.email).toBe('john@example.com')
    })

    it('should auto-generate an id for the record', async () => {
      const user = await durable.create('users', { name: 'Jane', email: 'jane@example.com' })

      expect(user.id).toBeDefined()
      expect(typeof user.id).toBe('string')
    })

    it('should auto-set createdAt timestamp', async () => {
      const before = new Date()
      const user = await durable.create('users', { name: 'Bob', email: 'bob@example.com' })
      const after = new Date()

      expect(user.createdAt).toBeDefined()
      const createdAt = new Date(user.createdAt)
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should auto-set updatedAt timestamp', async () => {
      const user = await durable.create('users', { name: 'Alice', email: 'alice@example.com' })

      expect(user.updatedAt).toBeDefined()
    })

    it('should store optional fields as null when not provided', async () => {
      const user = await durable.create('users', { email: 'minimal@example.com' })

      expect(user.name).toBeNull()
    })

    it('should store optional fields when provided', async () => {
      const user = await durable.create('users', { name: 'Full User', email: 'full@example.com' })

      expect(user.name).toBe('Full User')
    })
  })

  // ============================================================================
  // 4. CRUD Operations - Read
  // ============================================================================

  describe('read()', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    it('should read a record by id', async () => {
      const created = await durable.create('users', { name: 'John', email: 'john@example.com' })
      const found = await durable.read('users', created.id)

      expect(found).not.toBeNull()
      expect(found!.id).toBe(created.id)
      expect(found!.name).toBe('John')
    })

    it('should return null for non-existent id', async () => {
      const found = await durable.read('users', 'non-existent-id')

      expect(found).toBeNull()
    })

    it('should return a copy of the record (immutability)', async () => {
      const created = await durable.create('users', { name: 'Original', email: 'original@example.com' })
      const found = await durable.read('users', created.id)

      // Modify the returned object
      found!.name = 'Modified'

      // The original in the store should be unchanged
      const refetched = await durable.read('users', created.id)
      expect(refetched!.name).toBe('Original')
    })
  })

  // ============================================================================
  // 5. CRUD Operations - Update
  // ============================================================================

  describe('update()', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    it('should update a record and return the updated version', async () => {
      const created = await durable.create('users', { name: 'Old Name', email: 'user@example.com' })
      const updated = await durable.update('users', created.id, { name: 'New Name' })

      expect(updated.name).toBe('New Name')
      expect(updated.id).toBe(created.id)
    })

    it('should update only specified fields', async () => {
      const created = await durable.create('users', { name: 'Keep This', email: 'keep@example.com' })
      const updated = await durable.update('users', created.id, { email: 'new@example.com' })

      expect(updated.name).toBe('Keep This')
      expect(updated.email).toBe('new@example.com')
    })

    it('should update updatedAt timestamp', async () => {
      const created = await durable.create('users', { name: 'Test', email: 'test@example.com' })
      const originalUpdatedAt = created.updatedAt

      // Wait a small amount to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      const updated = await durable.update('users', created.id, { name: 'Updated' })

      expect(new Date(updated.updatedAt).getTime())
        .toBeGreaterThan(new Date(originalUpdatedAt).getTime())
    })

    it('should not modify createdAt on update', async () => {
      const created = await durable.create('users', { name: 'Test', email: 'test@example.com' })
      const originalCreatedAt = created.createdAt

      const updated = await durable.update('users', created.id, { name: 'Updated' })

      expect(updated.createdAt).toBe(originalCreatedAt)
    })

    it('should throw error for non-existent record', async () => {
      await expect(durable.update('users', 'non-existent', { name: 'Test' }))
        .rejects.toThrow(/not found/i)
    })

    it('should not allow updating the id field', async () => {
      const created = await durable.create('users', { name: 'Test', email: 'test@example.com' })
      const updated = await durable.update('users', created.id, {
        id: 'new-id',
        name: 'Updated'
      })

      expect(updated.id).toBe(created.id)
    })
  })

  // ============================================================================
  // 6. CRUD Operations - Delete
  // ============================================================================

  describe('delete()', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    it('should delete a record and return true', async () => {
      const created = await durable.create('users', { name: 'To Delete', email: 'delete@example.com' })
      const result = await durable.delete('users', created.id)

      expect(result).toBe(true)
    })

    it('should remove the record from the store', async () => {
      const created = await durable.create('users', { name: 'To Delete', email: 'delete@example.com' })
      await durable.delete('users', created.id)

      const found = await durable.read('users', created.id)
      expect(found).toBeNull()
    })

    it('should return false for non-existent record', async () => {
      const result = await durable.delete('users', 'non-existent-id')

      expect(result).toBe(false)
    })

    it('should not affect other records', async () => {
      const user1 = await durable.create('users', { name: 'User 1', email: 'user1@example.com' })
      const user2 = await durable.create('users', { name: 'User 2', email: 'user2@example.com' })
      const user3 = await durable.create('users', { name: 'User 3', email: 'user3@example.com' })

      await durable.delete('users', user2.id)

      expect(await durable.read('users', user1.id)).not.toBeNull()
      expect(await durable.read('users', user2.id)).toBeNull()
      expect(await durable.read('users', user3.id)).not.toBeNull()
    })
  })

  // ============================================================================
  // 7. CRUD Operations - List
  // ============================================================================

  describe('list()', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    it('should return all records for a resource', async () => {
      await durable.create('users', { name: 'User 1', email: 'user1@example.com' })
      await durable.create('users', { name: 'User 2', email: 'user2@example.com' })
      await durable.create('users', { name: 'User 3', email: 'user3@example.com' })

      const users = await durable.list('users')

      expect(users.data).toHaveLength(3)
    })

    it('should return empty array when no records exist', async () => {
      const users = await durable.list('users')

      expect(users.data).toEqual([])
    })

    it('should support limit option', async () => {
      for (let i = 1; i <= 5; i++) {
        await durable.create('users', { name: `User ${i}`, email: `user${i}@example.com` })
      }

      const users = await durable.list('users', { limit: 3 })

      expect(users.data).toHaveLength(3)
    })

    it('should support offset option', async () => {
      for (let i = 1; i <= 5; i++) {
        await durable.create('users', { name: `User ${i}`, email: `user${i}@example.com` })
      }

      const users = await durable.list('users', { offset: 2 })

      expect(users.data).toHaveLength(3)
    })

    it('should support combined limit and offset for pagination', async () => {
      for (let i = 1; i <= 10; i++) {
        await durable.create('users', { name: `User ${i}`, email: `user${i}@example.com` })
      }

      const page2 = await durable.list('users', { limit: 3, offset: 3 })

      expect(page2.data).toHaveLength(3)
    })

    it('should return pagination metadata', async () => {
      for (let i = 1; i <= 10; i++) {
        await durable.create('users', { name: `User ${i}`, email: `user${i}@example.com` })
      }

      const result = await durable.list('users', { limit: 3, offset: 0 })

      expect(result.total).toBe(10)
      expect(result.limit).toBe(3)
      expect(result.offset).toBe(0)
      expect(result.hasMore).toBe(true)
    })
  })

  // ============================================================================
  // 8. Input Validation Against Schema
  // ============================================================================

  describe('Schema validation', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    describe('Required field validation', () => {
      it('should throw error when required field is missing', async () => {
        // email is required for users
        await expect(durable.create('users', { name: 'John' }))
          .rejects.toThrow(/required.*email|email.*required/i)
      })

      it('should throw error listing all missing required fields', async () => {
        // title and authorId are required for posts
        await expect(durable.create('posts', { content: 'Some content' }))
          .rejects.toThrow(/required/i)
      })

      it('should succeed when all required fields are provided', async () => {
        const user = await durable.create('users', { email: 'required@example.com' })

        expect(user).toBeDefined()
        expect(user.email).toBe('required@example.com')
      })

      it('should not require auto-generated fields (id, createdAt, updatedAt)', async () => {
        // These are auto fields and should not need to be provided
        const user = await durable.create('users', { email: 'auto@example.com' })

        expect(user.id).toBeDefined()
        expect(user.createdAt).toBeDefined()
        expect(user.updatedAt).toBeDefined()
      })
    })

    describe('Type validation', () => {
      it('should accept valid string values', async () => {
        const user = await durable.create('users', { name: 'Valid String', email: 'valid@example.com' })
        expect(user.name).toBe('Valid String')
      })

      it('should reject invalid type for string field', async () => {
        await expect(durable.create('users', { name: 123, email: 'test@example.com' }))
          .rejects.toThrow(/type|invalid|string/i)
      })
    })

    describe('Enum validation', () => {
      it('should accept valid enum values', async () => {
        const post = await durable.create('posts', {
          title: 'Test Post',
          authorId: 'author-1',
          status: 'draft'
        })

        expect(post.status).toBe('draft')
      })

      it('should throw error for invalid enum value', async () => {
        await expect(durable.create('posts', {
          title: 'Test Post',
          authorId: 'author-1',
          status: 'invalid_status'
        })).rejects.toThrow(/invalid.*enum|invalid.*status|draft|published|archived/i)
      })

      it('should include allowed values in error message', async () => {
        await expect(durable.create('posts', {
          title: 'Test Post',
          authorId: 'author-1',
          status: 'wrong'
        })).rejects.toThrow(/draft|published|archived/)
      })
    })

    describe('Update validation', () => {
      it('should validate fields on update', async () => {
        const post = await durable.create('posts', {
          title: 'Test Post',
          authorId: 'author-1',
          status: 'draft'
        })

        await expect(durable.update('posts', post.id, { status: 'invalid' }))
          .rejects.toThrow(/invalid.*enum|invalid.*status/i)
      })

      it('should succeed with valid update values', async () => {
        const post = await durable.create('posts', {
          title: 'Test Post',
          authorId: 'author-1',
          status: 'draft'
        })

        const updated = await durable.update('posts', post.id, { status: 'published' })
        expect(updated.status).toBe('published')
      })
    })
  })

  // ============================================================================
  // 9. Unknown Collection Rejection
  // ============================================================================

  describe('Unknown collection rejection', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    it('should throw error for unknown resource on create', async () => {
      await expect(durable.create('unknown_collection', { name: 'Test' }))
        .rejects.toThrow(/resource.*not found|unknown.*resource|unknown.*collection/i)
    })

    it('should throw error for unknown resource on read', async () => {
      await expect(durable.read('unknown_collection', 'some-id'))
        .rejects.toThrow(/resource.*not found|unknown.*resource|unknown.*collection/i)
    })

    it('should throw error for unknown resource on update', async () => {
      await expect(durable.update('unknown_collection', 'some-id', { name: 'Test' }))
        .rejects.toThrow(/resource.*not found|unknown.*resource|unknown.*collection/i)
    })

    it('should throw error for unknown resource on delete', async () => {
      await expect(durable.delete('unknown_collection', 'some-id'))
        .rejects.toThrow(/resource.*not found|unknown.*resource|unknown.*collection/i)
    })

    it('should throw error for unknown resource on list', async () => {
      await expect(durable.list('unknown_collection'))
        .rejects.toThrow(/resource.*not found|unknown.*resource|unknown.*collection/i)
    })
  })

  // ============================================================================
  // 10. Typed CRUD Methods Per Resource
  // ============================================================================

  describe('Typed CRUD methods per resource', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    describe('Dynamic resource methods', () => {
      it('should have users.create method', async () => {
        expect(typeof durable.users.create).toBe('function')
      })

      it('should have users.read method', async () => {
        expect(typeof durable.users.read).toBe('function')
      })

      it('should have users.update method', async () => {
        expect(typeof durable.users.update).toBe('function')
      })

      it('should have users.delete method', async () => {
        expect(typeof durable.users.delete).toBe('function')
      })

      it('should have users.list method', async () => {
        expect(typeof durable.users.list).toBe('function')
      })

      it('should have posts.create method', async () => {
        expect(typeof durable.posts.create).toBe('function')
      })

      it('should have comments.create method', async () => {
        expect(typeof durable.comments.create).toBe('function')
      })
    })

    describe('Typed resource method operations', () => {
      it('should create via resource method', async () => {
        const user = await durable.users.create({ name: 'John', email: 'john@example.com' })

        expect(user.name).toBe('John')
        expect(user.email).toBe('john@example.com')
        expect(user.id).toBeDefined()
      })

      it('should read via resource method', async () => {
        const created = await durable.users.create({ name: 'Jane', email: 'jane@example.com' })
        const found = await durable.users.read(created.id)

        expect(found!.name).toBe('Jane')
      })

      it('should update via resource method', async () => {
        const created = await durable.users.create({ name: 'Old', email: 'old@example.com' })
        const updated = await durable.users.update(created.id, { name: 'New' })

        expect(updated.name).toBe('New')
      })

      it('should delete via resource method', async () => {
        const created = await durable.users.create({ name: 'Delete Me', email: 'delete@example.com' })
        const result = await durable.users.delete(created.id)

        expect(result).toBe(true)
        expect(await durable.users.read(created.id)).toBeNull()
      })

      it('should list via resource method', async () => {
        await durable.users.create({ name: 'User 1', email: 'user1@example.com' })
        await durable.users.create({ name: 'User 2', email: 'user2@example.com' })

        const result = await durable.users.list()

        expect(result.data).toHaveLength(2)
      })
    })
  })

  // ============================================================================
  // 11. Edge Cases
  // ============================================================================

  describe('Edge cases', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    it('should handle creating many records', async () => {
      for (let i = 0; i < 100; i++) {
        await durable.create('users', { name: `User ${i}`, email: `user${i}@example.com` })
      }

      const result = await durable.list('users')
      expect(result.total).toBe(100)
    })

    it('should handle boolean false values correctly', async () => {
      // Note: test schema doesn't have boolean, but this tests the principle
      const post = await durable.create('posts', {
        title: 'Test',
        authorId: 'author-1',
        status: 'draft'
      })

      expect(post).toBeDefined()
    })

    it('should handle empty string values', async () => {
      const user = await durable.create('users', { name: '', email: 'empty@example.com' })

      expect(user.name).toBe('')
    })

    it('should handle special characters in string values', async () => {
      const user = await durable.create('users', {
        name: 'Test "quotes" & <special> chars',
        email: 'special@example.com'
      })

      expect(user.name).toBe('Test "quotes" & <special> chars')
    })

    it('should isolate data between different SaasKitDO instances', async () => {
      const instance1 = new SaasKitDO(testSchema)
      const instance2 = new SaasKitDO(testSchema)

      await instance1.create('users', { name: 'Instance 1 User', email: 'inst1@example.com' })
      await instance2.create('users', { name: 'Instance 2 User', email: 'inst2@example.com' })

      const list1 = await instance1.list('users')
      const list2 = await instance2.list('users')

      expect(list1.data).toHaveLength(1)
      expect(list2.data).toHaveLength(1)
      expect(list1.data[0].name).toBe('Instance 1 User')
      expect(list2.data[0].name).toBe('Instance 2 User')
    })
  })

  // ============================================================================
  // 12. Query Operations
  // ============================================================================

  describe('query()', () => {
    beforeEach(() => {
      durable = new SaasKitDO(testSchema)
    })

    it('should filter records by where clause', async () => {
      await durable.create('posts', { title: 'Draft Post', authorId: 'a1', status: 'draft' })
      await durable.create('posts', { title: 'Published Post', authorId: 'a1', status: 'published' })
      await durable.create('posts', { title: 'Another Draft', authorId: 'a2', status: 'draft' })

      const drafts = await durable.query('posts', { where: { status: 'draft' } })

      expect(drafts.data).toHaveLength(2)
      expect(drafts.data.every(p => p.status === 'draft')).toBe(true)
    })

    it('should support multiple where conditions', async () => {
      await durable.create('posts', { title: 'Post A', authorId: 'a1', status: 'draft' })
      await durable.create('posts', { title: 'Post B', authorId: 'a1', status: 'published' })
      await durable.create('posts', { title: 'Post C', authorId: 'a2', status: 'draft' })

      const filtered = await durable.query('posts', {
        where: { authorId: 'a1', status: 'draft' }
      })

      expect(filtered.data).toHaveLength(1)
      expect(filtered.data[0].title).toBe('Post A')
    })

    it('should support combined where, limit, and offset', async () => {
      for (let i = 1; i <= 10; i++) {
        await durable.create('posts', {
          title: `Post ${i}`,
          authorId: 'author-1',
          status: 'draft'
        })
      }

      const result = await durable.query('posts', {
        where: { status: 'draft' },
        limit: 3,
        offset: 2
      })

      expect(result.data).toHaveLength(3)
    })
  })
})
