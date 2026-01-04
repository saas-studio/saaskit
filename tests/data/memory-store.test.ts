import { describe, expect, test, beforeEach } from 'bun:test'

describe('MemoryStore', () => {
  let store: any

  beforeEach(async () => {
    const { MemoryStore } = await import('../../src/data/MemoryStore')
    store = new MemoryStore()
  })

  test('MemoryStore class exists', async () => {
    const { MemoryStore } = await import('../../src/data/MemoryStore')
    expect(MemoryStore).toBeDefined()
  })

  test('store.create() adds record with generated id', async () => {
    const record = await store.create('tasks', { title: 'Test task' })

    expect(record.id).toBeDefined()
    expect(record.title).toBe('Test task')
    expect(record.createdAt).toBeDefined()
  })

  test('store.list() returns all records', async () => {
    await store.create('tasks', { title: 'Task 1' })
    await store.create('tasks', { title: 'Task 2' })

    const records = await store.list('tasks')

    expect(records).toHaveLength(2)
    expect(records[0].title).toBe('Task 1')
    expect(records[1].title).toBe('Task 2')
  })

  test('store.get(id) returns single record', async () => {
    const created = await store.create('tasks', { title: 'Test task' })
    const record = await store.get('tasks', created.id)

    expect(record).toBeDefined()
    expect(record.id).toBe(created.id)
    expect(record.title).toBe('Test task')
  })

  test('store.get(id) returns null for non-existent record', async () => {
    const record = await store.get('tasks', 'non-existent-id')
    expect(record).toBeNull()
  })

  test('store.update(id, data) modifies record', async () => {
    const created = await store.create('tasks', { title: 'Original', done: false })
    const updated = await store.update('tasks', created.id, { done: true })

    expect(updated.done).toBe(true)
    expect(updated.title).toBe('Original')
    expect(updated.updatedAt).toBeDefined()
  })

  test('store.delete(id) removes record', async () => {
    const created = await store.create('tasks', { title: 'To delete' })
    await store.delete('tasks', created.id)

    const record = await store.get('tasks', created.id)
    expect(record).toBeNull()
  })

  test('store isolates collections', async () => {
    await store.create('tasks', { title: 'Task' })
    await store.create('users', { name: 'User' })

    const tasks = await store.list('tasks')
    const users = await store.list('users')

    expect(tasks).toHaveLength(1)
    expect(users).toHaveLength(1)
  })

  test('store persists between operations', async () => {
    await store.create('tasks', { title: 'Task 1' })
    await store.create('tasks', { title: 'Task 2' })

    const list1 = await store.list('tasks')
    expect(list1).toHaveLength(2)

    await store.delete('tasks', list1[0].id)

    const list2 = await store.list('tasks')
    expect(list2).toHaveLength(1)
  })
})
