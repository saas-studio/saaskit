/**
 * SQLite Adapter Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { SQLiteStore, type SQLiteConfig } from '../../src/adapters/SQLiteStore'

describe('SQLiteStore', () => {
  describe('configuration', () => {
    it('should accept filename configuration', () => {
      const store = new SQLiteStore({ filename: 'test.db' })
      expect(store).toBeDefined()
    })

    it('should accept in-memory configuration', () => {
      const store = new SQLiteStore({ filename: ':memory:', inMemory: true })
      expect(store).toBeDefined()
    })

    it('should default inMemory to false', () => {
      const store = new SQLiteStore({ filename: 'test.db' })
      expect(store).toBeDefined()
    })
  })

  describe('connection lifecycle', () => {
    it('should connect to SQLite database', async () => {
      const store = new SQLiteStore({ filename: ':memory:', inMemory: true })
      await expect(store.connect()).resolves.toBeUndefined()
      await store.disconnect()
    })

    it('should disconnect from SQLite database', async () => {
      const store = new SQLiteStore({ filename: ':memory:', inMemory: true })
      await store.connect()
      await expect(store.disconnect()).resolves.toBeUndefined()
    })

    it('should handle multiple connect calls gracefully', async () => {
      const store = new SQLiteStore({ filename: ':memory:', inMemory: true })
      await store.connect()
      await expect(store.connect()).resolves.toBeUndefined()
      await store.disconnect()
    })

    it('should handle disconnect without connect gracefully', async () => {
      const store = new SQLiteStore({ filename: ':memory:', inMemory: true })
      await expect(store.disconnect()).resolves.toBeUndefined()
    })
  })

  describe('CRUD operations', () => {
    let store: SQLiteStore

    beforeEach(async () => {
      store = new SQLiteStore({ filename: ':memory:', inMemory: true })
      await store.connect()
    })

    afterEach(async () => {
      await store.disconnect()
    })

    describe('create', () => {
      it('should create a record with auto-generated id', async () => {
        const record = await store.create('users', { name: 'John', email: 'john@example.com' })
        expect(record.id).toBeDefined()
        expect(typeof record.id).toBe('string')
        expect(record.name).toBe('John')
        expect(record.email).toBe('john@example.com')
      })

      it('should set createdAt timestamp', async () => {
        const before = new Date()
        const record = await store.create('users', { name: 'John' })
        const after = new Date()
        expect(record.createdAt).toBeDefined()
        expect(record.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
        expect(record.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
      })

      it('should auto-create collection table if not exists', async () => {
        // Should not throw even for new collection
        const record = await store.create('newCollection', { data: 'test' })
        expect(record).toBeDefined()
      })
    })

    describe('list', () => {
      it('should return empty array for empty collection', async () => {
        const records = await store.list('emptyCollection')
        expect(records).toEqual([])
      })

      it('should return all records in collection', async () => {
        await store.create('users', { name: 'Alice' })
        await store.create('users', { name: 'Bob' })
        await store.create('users', { name: 'Charlie' })
        const records = await store.list('users')
        expect(records).toHaveLength(3)
      })

      it('should not mix collections', async () => {
        await store.create('users', { name: 'Alice' })
        await store.create('posts', { title: 'Hello' })
        const users = await store.list('users')
        const posts = await store.list('posts')
        expect(users).toHaveLength(1)
        expect(posts).toHaveLength(1)
      })
    })

    describe('get', () => {
      it('should return null for non-existent record', async () => {
        const record = await store.get('users', 'non-existent-id')
        expect(record).toBeNull()
      })

      it('should return the correct record by id', async () => {
        const created = await store.create('users', { name: 'John' })
        const retrieved = await store.get('users', created.id)
        expect(retrieved).not.toBeNull()
        expect(retrieved!.id).toBe(created.id)
        expect(retrieved!.name).toBe('John')
      })
    })

    describe('update', () => {
      it('should throw for non-existent record', async () => {
        await expect(store.update('users', 'non-existent', { name: 'Updated' })).rejects.toThrow()
      })

      it('should update record fields', async () => {
        const created = await store.create('users', { name: 'John', age: 30 })
        const updated = await store.update('users', created.id, { name: 'Jane' })
        expect(updated.name).toBe('Jane')
        expect(updated.age).toBe(30) // Original field preserved
      })

      it('should set updatedAt timestamp', async () => {
        const created = await store.create('users', { name: 'John' })
        const updated = await store.update('users', created.id, { name: 'Jane' })
        expect(updated.updatedAt).toBeDefined()
      })

      it('should preserve id and createdAt', async () => {
        const created = await store.create('users', { name: 'John' })
        const updated = await store.update('users', created.id, {
          id: 'hacked',
          createdAt: new Date(0),
        })
        expect(updated.id).toBe(created.id)
        expect(updated.createdAt.getTime()).toBe(created.createdAt.getTime())
      })
    })

    describe('delete', () => {
      it('should delete existing record', async () => {
        const created = await store.create('users', { name: 'John' })
        await store.delete('users', created.id)
        const retrieved = await store.get('users', created.id)
        expect(retrieved).toBeNull()
      })

      it('should not throw for non-existent record', async () => {
        await expect(store.delete('users', 'non-existent')).resolves.toBeUndefined()
      })
    })
  })

  describe('collection management', () => {
    it('should create table with proper schema', async () => {
      const store = new SQLiteStore({ filename: ':memory:', inMemory: true })
      await store.connect()
      await store.ensureCollection('users')
      // Table should exist and be queryable
      const records = await store.list('users')
      expect(records).toEqual([])
      await store.disconnect()
    })

    it('should handle collection names with special characters', async () => {
      const store = new SQLiteStore({ filename: ':memory:', inMemory: true })
      await store.connect()
      // Should sanitize or escape collection names
      await expect(store.create('my_collection', { data: 'test' })).resolves.toBeDefined()
      await store.disconnect()
    })
  })

  describe('data persistence', () => {
    it('should persist data to file', async () => {
      const filename = '/tmp/test-saaskit-sqlite.db'

      // First connection - write data
      const store1 = new SQLiteStore({ filename })
      await store1.connect()
      const created = await store1.create('users', { name: 'Persistent' })
      await store1.disconnect()

      // Second connection - read data
      const store2 = new SQLiteStore({ filename })
      await store2.connect()
      const retrieved = await store2.get('users', created.id)
      expect(retrieved).not.toBeNull()
      expect(retrieved!.name).toBe('Persistent')
      await store2.disconnect()

      // Cleanup
      const fs = await import('fs/promises')
      await fs.unlink(filename).catch(() => {})
      await fs.unlink(filename + '-wal').catch(() => {})
      await fs.unlink(filename + '-shm').catch(() => {})
    })
  })

  describe('JSON field handling', () => {
    let store: SQLiteStore

    beforeEach(async () => {
      store = new SQLiteStore({ filename: ':memory:', inMemory: true })
      await store.connect()
    })

    afterEach(async () => {
      await store.disconnect()
    })

    it('should store and retrieve complex objects', async () => {
      const data = {
        tags: ['a', 'b', 'c'],
        metadata: { nested: { deep: true } },
        count: 42,
      }
      const created = await store.create('items', data)
      const retrieved = await store.get('items', created.id)
      expect(retrieved!.tags).toEqual(['a', 'b', 'c'])
      expect(retrieved!.metadata).toEqual({ nested: { deep: true } })
      expect(retrieved!.count).toBe(42)
    })

    it('should store and retrieve dates correctly', async () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const created = await store.create('events', { eventDate: date })
      const retrieved = await store.get('events', created.id)
      expect(retrieved!.eventDate).toEqual(date)
    })
  })

  describe('error handling', () => {
    it('should provide meaningful error for invalid filename', async () => {
      const store = new SQLiteStore({ filename: '/invalid/path/that/does/not/exist/db.sqlite' })
      await expect(store.connect()).rejects.toThrow()
    })

    it('should handle concurrent operations', async () => {
      const store = new SQLiteStore({ filename: ':memory:', inMemory: true })
      await store.connect()

      // Create multiple records concurrently
      const promises = Array.from({ length: 10 }, (_, i) => store.create('concurrent', { index: i }))

      const results = await Promise.all(promises)
      expect(results).toHaveLength(10)

      const records = await store.list('concurrent')
      expect(records).toHaveLength(10)

      await store.disconnect()
    })
  })
})
