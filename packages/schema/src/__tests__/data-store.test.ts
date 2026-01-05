import { describe, it, expect, beforeEach } from 'vitest'
import { DataStore } from '../data-store'
import { parseSchemaYaml } from '../yaml-parser'
import type { SaaSSchema } from '../types'

// ============================================================================
// Test Schema Definitions
// ============================================================================

const todoSchemaYaml = `
app:
  name: todos
  description: A simple todo list application
  version: 1.0.0

resources:
  List:
    id: auto
    name: text
    color?: text
    createdAt: auto
    updatedAt: auto

  Todo:
    id: auto
    title: text
    completed: boolean
    dueDate?: date
    createdAt: auto
    updatedAt: auto
    list: ->List
`

const blogSchemaYaml = `
app:
  name: blog
  version: "1.0.0"
  description: Blog platform

resources:
  Author:
    id: auto
    name: text
    email: email

  Post:
    id: auto
    title: text
    content?: text
    status: draft | published | archived
    createdAt: auto
    updatedAt: auto
    author: ->Author

  Tag:
    id: auto
    name: text

  PostTag:
    id: auto
    post: ->Post
    tag: ->Tag
`

describe('DataStore', () => {
  let schema: SaaSSchema
  let store: DataStore

  // ============================================================================
  // 1. Basic CRUD - Create
  // ============================================================================

  describe('create()', () => {
    beforeEach(() => {
      schema = parseSchemaYaml(todoSchemaYaml)
      store = new DataStore(schema)
    })

    it('should create a record with provided data', () => {
      const list = store.create('List', { name: 'Shopping' })

      expect(list.name).toBe('Shopping')
      expect(list.id).toBeDefined()
      expect(typeof list.id).toBe('string')
    })

    it('should auto-generate UUID for id field', () => {
      const list = store.create('List', { name: 'Work' })

      // UUID v4 format check
      expect(list.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should auto-set createdAt timestamp', () => {
      const before = new Date()
      const list = store.create('List', { name: 'Tasks' })
      const after = new Date()

      expect(list.createdAt).toBeDefined()
      const createdAt = new Date(list.createdAt as string)
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should auto-set updatedAt timestamp', () => {
      const before = new Date()
      const list = store.create('List', { name: 'Personal' })
      const after = new Date()

      expect(list.updatedAt).toBeDefined()
      const updatedAt = new Date(list.updatedAt as string)
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should store optional fields as null when not provided', () => {
      const list = store.create('List', { name: 'Minimal' })

      expect(list.color).toBeNull()
    })

    it('should store optional fields when provided', () => {
      const list = store.create('List', { name: 'Colorful', color: '#ff0000' })

      expect(list.color).toBe('#ff0000')
    })

    it('should create a record with a foreign key relation', () => {
      const list = store.create('List', { name: 'Work' })
      const todo = store.create('Todo', {
        title: 'Finish report',
        completed: false,
        listId: list.id
      })

      expect(todo.listId).toBe(list.id)
    })

    it('should throw error for unknown resource', () => {
      expect(() => store.create('Unknown', { name: 'Test' }))
        .toThrow(/resource.*not found|unknown resource/i)
    })
  })

  // ============================================================================
  // 2. Basic CRUD - Read (findById)
  // ============================================================================

  describe('findById()', () => {
    beforeEach(() => {
      schema = parseSchemaYaml(todoSchemaYaml)
      store = new DataStore(schema)
    })

    it('should find a record by id', () => {
      const created = store.create('List', { name: 'Groceries' })
      const found = store.findById('List', created.id as string)

      expect(found).not.toBeNull()
      expect(found!.id).toBe(created.id)
      expect(found!.name).toBe('Groceries')
    })

    it('should return null for non-existent id', () => {
      const found = store.findById('List', 'non-existent-id')

      expect(found).toBeNull()
    })

    it('should throw error for unknown resource', () => {
      expect(() => store.findById('Unknown', 'some-id'))
        .toThrow(/resource.*not found|unknown resource/i)
    })

    it('should return a copy of the record (immutability)', () => {
      const created = store.create('List', { name: 'Original' })
      const found = store.findById('List', created.id as string)

      // Modify the returned object
      found!.name = 'Modified'

      // The original in the store should be unchanged
      const refetched = store.findById('List', created.id as string)
      expect(refetched!.name).toBe('Original')
    })
  })

  // ============================================================================
  // 3. Basic CRUD - Read (findAll)
  // ============================================================================

  describe('findAll()', () => {
    beforeEach(() => {
      schema = parseSchemaYaml(todoSchemaYaml)
      store = new DataStore(schema)
    })

    it('should return all records for a resource', () => {
      store.create('List', { name: 'Work' })
      store.create('List', { name: 'Personal' })
      store.create('List', { name: 'Shopping' })

      const lists = store.findAll('List')

      expect(lists).toHaveLength(3)
    })

    it('should return empty array when no records exist', () => {
      const lists = store.findAll('List')

      expect(lists).toEqual([])
    })

    it('should filter records by where clause', () => {
      const list = store.create('List', { name: 'Work' })
      store.create('Todo', { title: 'Task 1', completed: false, listId: list.id })
      store.create('Todo', { title: 'Task 2', completed: true, listId: list.id })
      store.create('Todo', { title: 'Task 3', completed: false, listId: list.id })

      const incompleteTodos = store.findAll('Todo', { where: { completed: false } })

      expect(incompleteTodos).toHaveLength(2)
      expect(incompleteTodos.every(t => t.completed === false)).toBe(true)
    })

    it('should support limit option', () => {
      store.create('List', { name: 'List 1' })
      store.create('List', { name: 'List 2' })
      store.create('List', { name: 'List 3' })
      store.create('List', { name: 'List 4' })
      store.create('List', { name: 'List 5' })

      const lists = store.findAll('List', { limit: 3 })

      expect(lists).toHaveLength(3)
    })

    it('should support offset option', () => {
      store.create('List', { name: 'List 1' })
      store.create('List', { name: 'List 2' })
      store.create('List', { name: 'List 3' })
      store.create('List', { name: 'List 4' })
      store.create('List', { name: 'List 5' })

      const lists = store.findAll('List', { offset: 2 })

      expect(lists).toHaveLength(3)
    })

    it('should support combined limit and offset for pagination', () => {
      for (let i = 1; i <= 10; i++) {
        store.create('List', { name: `List ${i}` })
      }

      const page2 = store.findAll('List', { limit: 3, offset: 3 })

      expect(page2).toHaveLength(3)
    })

    it('should filter by multiple where conditions', () => {
      const list = store.create('List', { name: 'Work' })
      store.create('Todo', { title: 'Task A', completed: false, listId: list.id })
      store.create('Todo', { title: 'Task B', completed: true, listId: list.id })
      store.create('Todo', { title: 'Task A', completed: true, listId: list.id })

      const filtered = store.findAll('Todo', {
        where: { title: 'Task A', completed: true }
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].title).toBe('Task A')
      expect(filtered[0].completed).toBe(true)
    })

    it('should throw error for unknown resource', () => {
      expect(() => store.findAll('Unknown'))
        .toThrow(/resource.*not found|unknown resource/i)
    })
  })

  // ============================================================================
  // 4. Basic CRUD - Update
  // ============================================================================

  describe('update()', () => {
    beforeEach(() => {
      schema = parseSchemaYaml(todoSchemaYaml)
      store = new DataStore(schema)
    })

    it('should update a record and return the updated version', () => {
      const created = store.create('List', { name: 'Old Name' })
      const updated = store.update('List', created.id as string, { name: 'New Name' })

      expect(updated.name).toBe('New Name')
      expect(updated.id).toBe(created.id)
    })

    it('should update only specified fields', () => {
      const created = store.create('List', { name: 'My List', color: 'blue' })
      const updated = store.update('List', created.id as string, { name: 'Updated List' })

      expect(updated.name).toBe('Updated List')
      expect(updated.color).toBe('blue')
    })

    it('should update updatedAt timestamp', () => {
      const created = store.create('List', { name: 'Test' })
      const originalUpdatedAt = created.updatedAt

      // Wait a small amount to ensure different timestamp
      const start = Date.now()
      while (Date.now() - start < 10) { /* busy wait */ }

      const updated = store.update('List', created.id as string, { name: 'Updated' })

      expect(new Date(updated.updatedAt as string).getTime())
        .toBeGreaterThan(new Date(originalUpdatedAt as string).getTime())
    })

    it('should not modify createdAt on update', () => {
      const created = store.create('List', { name: 'Test' })
      const originalCreatedAt = created.createdAt

      const updated = store.update('List', created.id as string, { name: 'Updated' })

      expect(updated.createdAt).toBe(originalCreatedAt)
    })

    it('should throw error for non-existent record', () => {
      expect(() => store.update('List', 'non-existent', { name: 'Test' }))
        .toThrow(/not found/i)
    })

    it('should throw error for unknown resource', () => {
      expect(() => store.update('Unknown', 'some-id', { name: 'Test' }))
        .toThrow(/resource.*not found|unknown resource/i)
    })

    it('should not allow updating the id field', () => {
      const created = store.create('List', { name: 'Test' })
      const updated = store.update('List', created.id as string, {
        id: 'new-id',
        name: 'Updated'
      })

      expect(updated.id).toBe(created.id)
    })
  })

  // ============================================================================
  // 5. Basic CRUD - Delete
  // ============================================================================

  describe('delete()', () => {
    beforeEach(() => {
      schema = parseSchemaYaml(todoSchemaYaml)
      store = new DataStore(schema)
    })

    it('should delete a record and return true', () => {
      const created = store.create('List', { name: 'To Delete' })
      const result = store.delete('List', created.id as string)

      expect(result).toBe(true)
    })

    it('should remove the record from the store', () => {
      const created = store.create('List', { name: 'To Delete' })
      store.delete('List', created.id as string)

      const found = store.findById('List', created.id as string)
      expect(found).toBeNull()
    })

    it('should return false for non-existent record', () => {
      const result = store.delete('List', 'non-existent-id')

      expect(result).toBe(false)
    })

    it('should throw error for unknown resource', () => {
      expect(() => store.delete('Unknown', 'some-id'))
        .toThrow(/resource.*not found|unknown resource/i)
    })

    it('should not affect other records', () => {
      const list1 = store.create('List', { name: 'List 1' })
      const list2 = store.create('List', { name: 'List 2' })
      const list3 = store.create('List', { name: 'List 3' })

      store.delete('List', list2.id as string)

      expect(store.findById('List', list1.id as string)).not.toBeNull()
      expect(store.findById('List', list2.id as string)).toBeNull()
      expect(store.findById('List', list3.id as string)).not.toBeNull()
    })
  })

  // ============================================================================
  // 6. Relation Traversal - belongsTo
  // ============================================================================

  describe('getRelated() - belongsTo', () => {
    beforeEach(() => {
      schema = parseSchemaYaml(todoSchemaYaml)
      store = new DataStore(schema)
    })

    it('should get the related parent record (belongsTo)', () => {
      const list = store.create('List', { name: 'Work' })
      const todo = store.create('Todo', {
        title: 'Finish report',
        completed: false,
        listId: list.id
      })

      const relatedList = store.getRelated('Todo', todo.id as string, 'list')

      expect(relatedList).not.toBeNull()
      expect((relatedList as Record<string, unknown>).id).toBe(list.id)
      expect((relatedList as Record<string, unknown>).name).toBe('Work')
    })

    it('should return null when belongsTo relation is not set', () => {
      const todo = store.create('Todo', {
        title: 'Orphan task',
        completed: false
      })

      const relatedList = store.getRelated('Todo', todo.id as string, 'list')

      expect(relatedList).toBeNull()
    })

    it('should throw error for non-existent relation', () => {
      const list = store.create('List', { name: 'Test' })

      expect(() => store.getRelated('List', list.id as string, 'nonExistent'))
        .toThrow(/relation.*not found|unknown relation/i)
    })
  })

  // ============================================================================
  // 7. Relation Traversal - hasMany (inverse)
  // ============================================================================

  describe('getRelated() - hasMany (inverse)', () => {
    let schemaWithInverse: SaaSSchema
    let storeWithInverse: DataStore

    beforeEach(() => {
      // Use schema with explicit inverse relations
      const schemaYaml = `
metadata:
  name: test
  version: "1.0.0"

resources:
  - name: List
    fields:
      - name: id
        type: uuid
      - name: name
        type: string
    relations: []

  - name: Todo
    fields:
      - name: id
        type: uuid
      - name: title
        type: string
      - name: completed
        type: boolean
    relations:
      - name: list
        to: List
        cardinality: one
        inverse: todos
`
      schemaWithInverse = parseSchemaYaml(schemaYaml)
      storeWithInverse = new DataStore(schemaWithInverse)
    })

    it('should get all related child records (hasMany)', () => {
      const list = storeWithInverse.create('List', { name: 'Work' })
      storeWithInverse.create('Todo', { title: 'Task 1', completed: false, listId: list.id })
      storeWithInverse.create('Todo', { title: 'Task 2', completed: true, listId: list.id })
      storeWithInverse.create('Todo', { title: 'Task 3', completed: false, listId: list.id })

      const todos = storeWithInverse.getRelated('List', list.id as string, 'todos') as Record<string, unknown>[]

      expect(Array.isArray(todos)).toBe(true)
      expect(todos).toHaveLength(3)
    })

    it('should return empty array when no related records exist', () => {
      const list = storeWithInverse.create('List', { name: 'Empty' })

      const todos = storeWithInverse.getRelated('List', list.id as string, 'todos') as Record<string, unknown>[]

      expect(Array.isArray(todos)).toBe(true)
      expect(todos).toHaveLength(0)
    })

    it('should only return records related to the specific parent', () => {
      const list1 = storeWithInverse.create('List', { name: 'Work' })
      const list2 = storeWithInverse.create('List', { name: 'Personal' })

      storeWithInverse.create('Todo', { title: 'Work Task 1', completed: false, listId: list1.id })
      storeWithInverse.create('Todo', { title: 'Work Task 2', completed: false, listId: list1.id })
      storeWithInverse.create('Todo', { title: 'Personal Task', completed: false, listId: list2.id })

      const workTodos = storeWithInverse.getRelated('List', list1.id as string, 'todos') as Record<string, unknown>[]
      const personalTodos = storeWithInverse.getRelated('List', list2.id as string, 'todos') as Record<string, unknown>[]

      expect(workTodos).toHaveLength(2)
      expect(personalTodos).toHaveLength(1)
    })
  })

  // ============================================================================
  // 8. Complex Relations (Blog Schema)
  // ============================================================================

  describe('Complex relations (Blog schema)', () => {
    let blogStore: DataStore

    beforeEach(() => {
      const blogSchema = parseSchemaYaml(blogSchemaYaml)
      blogStore = new DataStore(blogSchema)
    })

    it('should handle multiple levels of relations', () => {
      const author = blogStore.create('Author', {
        name: 'John Doe',
        email: 'john@example.com'
      })
      const post = blogStore.create('Post', {
        title: 'My First Post',
        status: 'published',
        authorId: author.id
      })

      const relatedAuthor = blogStore.getRelated('Post', post.id as string, 'author')

      expect(relatedAuthor).not.toBeNull()
      expect((relatedAuthor as Record<string, unknown>).name).toBe('John Doe')
    })

    it('should handle junction table (many-to-many) relations', () => {
      const post = blogStore.create('Post', {
        title: 'Tagged Post',
        status: 'draft'
      })
      const tag1 = blogStore.create('Tag', { name: 'JavaScript' })
      const tag2 = blogStore.create('Tag', { name: 'TypeScript' })

      blogStore.create('PostTag', { postId: post.id, tagId: tag1.id })
      blogStore.create('PostTag', { postId: post.id, tagId: tag2.id })

      // Get the PostTags for this post
      const postTags = blogStore.findAll('PostTag', {
        where: { postId: post.id }
      })

      expect(postTags).toHaveLength(2)
    })
  })

  // ============================================================================
  // 9. Edge Cases and Error Handling
  // ============================================================================

  describe('Edge cases', () => {
    beforeEach(() => {
      schema = parseSchemaYaml(todoSchemaYaml)
      store = new DataStore(schema)
    })

    it('should handle creating many records', () => {
      for (let i = 0; i < 100; i++) {
        store.create('List', { name: `List ${i}` })
      }

      const lists = store.findAll('List')
      expect(lists).toHaveLength(100)
    })

    it('should handle records with all optional fields null', () => {
      const list = store.create('List', { name: 'Minimal' })

      expect(list.id).toBeDefined()
      expect(list.name).toBe('Minimal')
      expect(list.color).toBeNull()
    })

    it('should handle boolean false values correctly', () => {
      const list = store.create('List', { name: 'Test' })
      const todo = store.create('Todo', {
        title: 'Test',
        completed: false,
        listId: list.id
      })

      expect(todo.completed).toBe(false)

      const found = store.findAll('Todo', { where: { completed: false } })
      expect(found).toHaveLength(1)
    })

    it('should handle empty string values', () => {
      const list = store.create('List', { name: '', color: '' })

      expect(list.name).toBe('')
      expect(list.color).toBe('')
    })

    it('should handle special characters in string values', () => {
      const list = store.create('List', {
        name: 'Test "quotes" & <special> chars'
      })

      expect(list.name).toBe('Test "quotes" & <special> chars')
    })
  })

  // ============================================================================
  // 10. DataStore Initialization and State
  // ============================================================================

  describe('DataStore initialization', () => {
    it('should initialize with empty data for all resources', () => {
      schema = parseSchemaYaml(todoSchemaYaml)
      store = new DataStore(schema)

      expect(store.findAll('List')).toEqual([])
      expect(store.findAll('Todo')).toEqual([])
    })

    it('should isolate data between different DataStore instances', () => {
      schema = parseSchemaYaml(todoSchemaYaml)
      const store1 = new DataStore(schema)
      const store2 = new DataStore(schema)

      store1.create('List', { name: 'Store 1 List' })
      store2.create('List', { name: 'Store 2 List' })

      expect(store1.findAll('List')).toHaveLength(1)
      expect(store2.findAll('List')).toHaveLength(1)
      expect(store1.findAll('List')[0].name).toBe('Store 1 List')
      expect(store2.findAll('List')[0].name).toBe('Store 2 List')
    })

    it('should provide access to the schema', () => {
      schema = parseSchemaYaml(todoSchemaYaml)
      store = new DataStore(schema)

      expect(store.schema).toBe(schema)
    })
  })
})
