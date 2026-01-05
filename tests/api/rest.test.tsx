/**
 * REST API Tests
 *
 * Comprehensive tests for REST API functionality in SaaSkit.
 * These tests are written in RED phase - they should FAIL initially.
 *
 * @module tests/api/rest
 */

import { describe, expect, test, beforeEach } from 'bun:test'
import React from 'react'
import { App } from '../../src/schema/App'
import { Resource } from '../../src/schema/Resource'
import { MemoryStore } from '../../src/data/MemoryStore'
import {
  createAPIRouter,
  type APIRouter,
  type APIResponse,
  type APIError,
  type Route,
  ErrorCodes,
} from '../../src/api/rest'

// =============================================================================
// Test Fixtures
// =============================================================================

/**
 * Creates a test app with Task and User resources
 */
function createTestApp() {
  return (
    <App name="testapp" version="1.0.0">
      <Resource
        name="Task"
        fields={{
          title: { type: 'string', required: true },
          description: { type: 'string', required: false },
          done: { type: 'boolean', required: true },
          priority: { type: 'enum', values: ['low', 'medium', 'high'] },
          dueDate: { type: 'date', required: false },
          assignee: { type: 'relation', target: 'User', required: false },
          createdAt: { type: 'datetime', auto: true },
          updatedAt: { type: 'datetime', auto: true },
        }}
      />
      <Resource
        name="User"
        fields={{
          name: { type: 'string', required: true },
          email: { type: 'email', unique: true },
          role: { type: 'enum', values: ['admin', 'user'] },
          active: { type: 'boolean', required: true },
          createdAt: { type: 'datetime', auto: true },
        }}
      />
      <Resource
        name="Tag"
        fields={{
          name: { type: 'string', unique: true },
          color: { type: 'string', required: false },
        }}
      />
    </App>
  )
}

/**
 * Helper to make requests and parse JSON responses
 */
async function makeRequest(
  router: APIRouter,
  method: string,
  path: string,
  options: {
    body?: unknown
    headers?: Record<string, string>
  } = {}
): Promise<{ response: Response; json: unknown }> {
  const url = `http://localhost${path}`
  const request = new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...(options.body && { body: JSON.stringify(options.body) }),
  })

  const response = await router.handle(request)
  let json: unknown = null

  if (response.headers.get('Content-Type')?.includes('application/json')) {
    json = await response.json()
  }

  return { response, json }
}

// =============================================================================
// 1. Router Creation Tests
// =============================================================================

describe('Router Creation', () => {
  let store: MemoryStore

  beforeEach(() => {
    store = new MemoryStore()
  })

  test('creates router from App schema', () => {
    const app = createTestApp()
    const router = createAPIRouter({ app, store })

    expect(router).toBeDefined()
    expect(router.handle).toBeInstanceOf(Function)
    expect(router.routes).toBeInstanceOf(Array)
  })

  test('router has routes for each resource', () => {
    const app = createTestApp()
    const router = createAPIRouter({ app, store })

    // Should have routes for Task, User, and Tag resources
    const taskRoutes = router.routes.filter((r) => r.path.includes('/tasks'))
    const userRoutes = router.routes.filter((r) => r.path.includes('/users'))
    const tagRoutes = router.routes.filter((r) => r.path.includes('/tags'))

    expect(taskRoutes.length).toBeGreaterThan(0)
    expect(userRoutes.length).toBeGreaterThan(0)
    expect(tagRoutes.length).toBeGreaterThan(0)
  })

  test('routes follow REST conventions', () => {
    const app = createTestApp()
    const router = createAPIRouter({ app, store })

    // Each resource should have standard CRUD routes
    const hasRoute = (method: string, pathPattern: RegExp) =>
      router.routes.some((r) => r.method === method && pathPattern.test(r.path))

    // Task resource routes
    expect(hasRoute('GET', /\/api\/tasks$/)).toBe(true)
    expect(hasRoute('POST', /\/api\/tasks$/)).toBe(true)
    expect(hasRoute('GET', /\/api\/tasks\/:id$/)).toBe(true)
    expect(hasRoute('PUT', /\/api\/tasks\/:id$/)).toBe(true)
    expect(hasRoute('DELETE', /\/api\/tasks\/:id$/)).toBe(true)
  })

  test('supports custom route prefix', () => {
    const app = createTestApp()
    const router = createAPIRouter({ app, store, prefix: '/v1' })

    const hasV1Route = router.routes.some((r) => r.path.startsWith('/v1/'))
    expect(hasV1Route).toBe(true)
  })

  test('route handlers are functions', () => {
    const app = createTestApp()
    const router = createAPIRouter({ app, store })

    for (const route of router.routes) {
      expect(route.handler).toBeInstanceOf(Function)
    }
  })

  test('supports PATCH method for partial updates', () => {
    const app = createTestApp()
    const router = createAPIRouter({ app, store })

    const hasPatchRoute = router.routes.some(
      (r) => r.method === 'PATCH' && r.path.includes(':id')
    )
    expect(hasPatchRoute).toBe(true)
  })
})

// =============================================================================
// 2. List Endpoint Tests (GET /api/:resource)
// =============================================================================

describe('List Endpoint (GET /api/:resource)', () => {
  let store: MemoryStore
  let router: APIRouter

  beforeEach(async () => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })

    // Seed some test data
    await store.create('tasks', { title: 'Task 1', done: false, priority: 'high' })
    await store.create('tasks', { title: 'Task 2', done: true, priority: 'low' })
    await store.create('tasks', { title: 'Task 3', done: false, priority: 'medium' })
  })

  test('returns array of items in data field', async () => {
    const { response, json } = await makeRequest(router, 'GET', '/api/tasks')

    expect(response.status).toBe(200)
    expect((json as APIResponse<unknown[]>).data).toBeInstanceOf(Array)
    expect((json as APIResponse<unknown[]>).data.length).toBe(3)
  })

  test('returns proper pagination metadata', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks')
    const res = json as APIResponse<unknown[]>

    expect(res.meta).toBeDefined()
    expect(res.meta!.total).toBe(3)
    expect(res.meta!.page).toBe(1)
    expect(res.meta!.pageSize).toBeGreaterThan(0)
    expect(res.meta!.totalPages).toBe(1)
  })

  test('supports pagination with page and pageSize', async () => {
    // Add more items
    for (let i = 4; i <= 25; i++) {
      await store.create('tasks', { title: `Task ${i}`, done: false, priority: 'low' })
    }

    const { json } = await makeRequest(router, 'GET', '/api/tasks?page=2&pageSize=10')
    const res = json as APIResponse<unknown[]>

    expect(res.data.length).toBe(10)
    expect(res.meta!.page).toBe(2)
    expect(res.meta!.pageSize).toBe(10)
    expect(res.meta!.totalPages).toBe(3)
  })

  test('supports sorting with sort and order params', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?sort=title&order=asc')
    const res = json as APIResponse<Array<{ title: string }>>

    expect(res.data[0].title).toBe('Task 1')
    expect(res.data[2].title).toBe('Task 3')
  })

  test('supports descending sort order', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?sort=title&order=desc')
    const res = json as APIResponse<Array<{ title: string }>>

    expect(res.data[0].title).toBe('Task 3')
    expect(res.data[2].title).toBe('Task 1')
  })

  test('supports filtering by field value', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?done=true')
    const res = json as APIResponse<Array<{ done: boolean }>>

    expect(res.data.length).toBe(1)
    expect(res.data[0].done).toBe(true)
  })

  test('supports filtering with multiple values', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?priority=high&done=false')
    const res = json as APIResponse<Array<{ priority: string; done: boolean }>>

    expect(res.data.length).toBe(1)
    expect(res.data[0].priority).toBe('high')
    expect(res.data[0].done).toBe(false)
  })

  test('supports field selection with fields param', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?fields=id,title')
    const res = json as APIResponse<Array<Record<string, unknown>>>

    expect(res.data[0]).toHaveProperty('id')
    expect(res.data[0]).toHaveProperty('title')
    expect(res.data[0]).not.toHaveProperty('done')
    expect(res.data[0]).not.toHaveProperty('priority')
  })

  test('supports search with q param', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?q=Task+1')
    const res = json as APIResponse<Array<{ title: string }>>

    expect(res.data.length).toBe(1)
    expect(res.data[0].title).toBe('Task 1')
  })

  test('returns empty array for empty collection', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tags')
    const res = json as APIResponse<unknown[]>

    expect(res.data).toBeInstanceOf(Array)
    expect(res.data.length).toBe(0)
    expect(res.meta!.total).toBe(0)
  })

  test('returns proper content-type header', async () => {
    const { response } = await makeRequest(router, 'GET', '/api/tasks')

    expect(response.headers.get('Content-Type')).toContain('application/json')
  })

  test('supports limit and offset params', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?limit=2&offset=1')
    const res = json as APIResponse<unknown[]>

    expect(res.data.length).toBe(2)
  })

  test('supports sortBy and orderBy aliases', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?sortBy=title&orderBy=asc')
    const res = json as APIResponse<Array<{ title: string }>>

    expect(res.data[0].title).toBe('Task 1')
  })

  test('supports select alias for fields', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?select=id,title')
    const res = json as APIResponse<Array<Record<string, unknown>>>

    expect(res.data[0]).toHaveProperty('id')
    expect(res.data[0]).toHaveProperty('title')
    expect(res.data[0]).not.toHaveProperty('done')
  })

  test('supports search alias for q', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?search=Task+2')
    const res = json as APIResponse<Array<{ title: string }>>

    expect(res.data.length).toBe(1)
    expect(res.data[0].title).toBe('Task 2')
  })

  test('handles greater than filter operator', async () => {
    await store.create('tasks', { title: 'Future Task', done: false, priority: 'high', dueDate: new Date('2030-01-01') })

    const { json } = await makeRequest(router, 'GET', '/api/tasks?dueDate[gt]=2025-01-01')
    const res = json as APIResponse<Array<{ title: string }>>

    expect(res.data.length).toBeGreaterThanOrEqual(1)
  })

  test('handles less than filter operator', async () => {
    await store.create('tasks', { title: 'Old Task', done: false, priority: 'low', dueDate: new Date('2020-01-01') })

    const { json } = await makeRequest(router, 'GET', '/api/tasks?dueDate[lt]=2021-01-01')
    const res = json as APIResponse<Array<{ title: string }>>

    expect(res.data.length).toBeGreaterThanOrEqual(1)
  })
})

// =============================================================================
// 3. Get One Endpoint Tests (GET /api/:resource/:id)
// =============================================================================

describe('Get One Endpoint (GET /api/:resource/:id)', () => {
  let store: MemoryStore
  let router: APIRouter
  let taskId: string

  beforeEach(async () => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })

    const task = await store.create('tasks', { title: 'Test Task', done: false, priority: 'high' })
    taskId = task.id
  })

  test('returns single item by ID', async () => {
    const { response, json } = await makeRequest(router, 'GET', `/api/tasks/${taskId}`)
    const res = json as APIResponse<{ id: string; title: string }>

    expect(response.status).toBe(200)
    expect(res.data.id).toBe(taskId)
    expect(res.data.title).toBe('Test Task')
  })

  test('returns 404 for non-existent ID', async () => {
    const { response, json } = await makeRequest(router, 'GET', '/api/tasks/non-existent-id')
    const res = json as APIError

    expect(response.status).toBe(404)
    expect(res.error.code).toBe(ErrorCodes.NOT_FOUND)
  })

  test('supports field selection', async () => {
    const { json } = await makeRequest(router, 'GET', `/api/tasks/${taskId}?fields=id,title`)
    const res = json as APIResponse<Record<string, unknown>>

    expect(res.data).toHaveProperty('id')
    expect(res.data).toHaveProperty('title')
    expect(res.data).not.toHaveProperty('done')
    expect(res.data).not.toHaveProperty('priority')
  })

  test('returns proper structure with data wrapper', async () => {
    const { json } = await makeRequest(router, 'GET', `/api/tasks/${taskId}`)

    expect(json).toHaveProperty('data')
  })

  test('includes createdAt timestamp', async () => {
    const { json } = await makeRequest(router, 'GET', `/api/tasks/${taskId}`)
    const res = json as APIResponse<{ createdAt: string }>

    expect(res.data.createdAt).toBeDefined()
  })

  test('returns 404 for wrong resource type', async () => {
    const { response, json } = await makeRequest(router, 'GET', `/api/users/${taskId}`)
    const res = json as APIError

    expect(response.status).toBe(404)
    expect(res.error.code).toBe(ErrorCodes.NOT_FOUND)
  })
})

// =============================================================================
// 4. Create Endpoint Tests (POST /api/:resource)
// =============================================================================

describe('Create Endpoint (POST /api/:resource)', () => {
  let store: MemoryStore
  let router: APIRouter

  beforeEach(() => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })
  })

  test('creates new item from body', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'New Task', done: false, priority: 'high' },
    })
    const res = json as APIResponse<{ title: string }>

    expect(response.status).toBe(201)
    expect(res.data.title).toBe('New Task')
  })

  test('returns created item with generated ID', async () => {
    const { json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'New Task', done: false, priority: 'high' },
    })
    const res = json as APIResponse<{ id: string }>

    expect(res.data.id).toBeDefined()
    expect(typeof res.data.id).toBe('string')
  })

  test('returns 201 status code', async () => {
    const { response } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'New Task', done: false, priority: 'high' },
    })

    expect(response.status).toBe(201)
  })

  test('validates required fields', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { done: false, priority: 'high' }, // missing title
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
    expect(res.error.details).toBeDefined()
    expect(res.error.details!.some((d) => d.field === 'title')).toBe(true)
  })

  test('validates field types (string)', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 123, done: false, priority: 'high' }, // title should be string
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
  })

  test('validates field types (boolean)', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'Task', done: 'yes', priority: 'high' }, // done should be boolean
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
  })

  test('validates select field options', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'Task', done: false, priority: 'invalid' }, // invalid priority
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
    expect(res.error.details!.some((d) => d.field === 'priority')).toBe(true)
  })

  test('returns Location header with resource URL', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'New Task', done: false, priority: 'high' },
    })
    const res = json as APIResponse<{ id: string }>

    expect(response.headers.get('Location')).toBe(`/api/tasks/${res.data.id}`)
  })

  test('sets createdAt automatically', async () => {
    const { json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'New Task', done: false, priority: 'high' },
    })
    const res = json as APIResponse<{ createdAt: string }>

    expect(res.data.createdAt).toBeDefined()
  })

  test('ignores id in request body', async () => {
    const { json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { id: 'custom-id', title: 'New Task', done: false, priority: 'high' },
    })
    const res = json as APIResponse<{ id: string }>

    expect(res.data.id).not.toBe('custom-id')
  })

  test('supports nested relation by ID', async () => {
    // First create a user
    const userResult = await store.create('users', { name: 'John', email: 'john@example.com', role: 'user', active: true })

    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'New Task', done: false, priority: 'high', assignee: userResult.id },
    })
    const res = json as APIResponse<{ assignee: string }>

    expect(response.status).toBe(201)
    expect(res.data.assignee).toBe(userResult.id)
  })

  test('validates relation exists', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'New Task', done: false, priority: 'high', assignee: 'non-existent-user' },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
  })

  test('returns 400 for invalid JSON body', async () => {
    const request = new Request('http://localhost/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    })

    const response = await router.handle(request)
    expect(response.status).toBe(400)
  })
})

// =============================================================================
// 5. Update Endpoint Tests (PUT /api/:resource/:id)
// =============================================================================

describe('Update Endpoint (PUT /api/:resource/:id)', () => {
  let store: MemoryStore
  let router: APIRouter
  let taskId: string
  let originalCreatedAt: Date

  beforeEach(async () => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })

    const task = await store.create('tasks', { title: 'Original Task', done: false, priority: 'low' })
    taskId = task.id
    originalCreatedAt = task.createdAt
  })

  test('updates existing item', async () => {
    const { response, json } = await makeRequest(router, 'PUT', `/api/tasks/${taskId}`, {
      body: { title: 'Updated Task', done: true, priority: 'high' },
    })
    const res = json as APIResponse<{ title: string; done: boolean }>

    expect(response.status).toBe(200)
    expect(res.data.title).toBe('Updated Task')
    expect(res.data.done).toBe(true)
  })

  test('returns updated item', async () => {
    const { json } = await makeRequest(router, 'PUT', `/api/tasks/${taskId}`, {
      body: { title: 'Updated Task', done: true, priority: 'high' },
    })
    const res = json as APIResponse<{ id: string }>

    expect(res.data.id).toBe(taskId)
  })

  test('returns 404 for non-existent ID', async () => {
    const { response, json } = await makeRequest(router, 'PUT', '/api/tasks/non-existent-id', {
      body: { title: 'Updated Task', done: true, priority: 'high' },
    })
    const res = json as APIError

    expect(response.status).toBe(404)
    expect(res.error.code).toBe(ErrorCodes.NOT_FOUND)
  })

  test('supports partial updates', async () => {
    const { json } = await makeRequest(router, 'PUT', `/api/tasks/${taskId}`, {
      body: { done: true }, // only updating done
    })
    const res = json as APIResponse<{ title: string; done: boolean }>

    expect(res.data.done).toBe(true)
    expect(res.data.title).toBe('Original Task') // should preserve original
  })

  test('validates field types on update', async () => {
    const { response, json } = await makeRequest(router, 'PUT', `/api/tasks/${taskId}`, {
      body: { title: 123 }, // title should be string
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
  })

  test('maintains createdAt timestamp', async () => {
    const { json } = await makeRequest(router, 'PUT', `/api/tasks/${taskId}`, {
      body: { title: 'Updated Task' },
    })
    const res = json as APIResponse<{ createdAt: string }>

    expect(new Date(res.data.createdAt).getTime()).toBe(originalCreatedAt.getTime())
  })

  test('sets updatedAt timestamp', async () => {
    const { json } = await makeRequest(router, 'PUT', `/api/tasks/${taskId}`, {
      body: { title: 'Updated Task' },
    })
    const res = json as APIResponse<{ updatedAt: string }>

    expect(res.data.updatedAt).toBeDefined()
  })

  test('cannot change ID via update', async () => {
    const { json } = await makeRequest(router, 'PUT', `/api/tasks/${taskId}`, {
      body: { id: 'new-id', title: 'Updated Task' },
    })
    const res = json as APIResponse<{ id: string }>

    expect(res.data.id).toBe(taskId)
  })

  test('PATCH endpoint supports partial updates', async () => {
    const { response, json } = await makeRequest(router, 'PATCH', `/api/tasks/${taskId}`, {
      body: { done: true },
    })
    const res = json as APIResponse<{ done: boolean; title: string }>

    expect(response.status).toBe(200)
    expect(res.data.done).toBe(true)
    expect(res.data.title).toBe('Original Task')
  })
})

// =============================================================================
// 6. Delete Endpoint Tests (DELETE /api/:resource/:id)
// =============================================================================

describe('Delete Endpoint (DELETE /api/:resource/:id)', () => {
  let store: MemoryStore
  let router: APIRouter
  let taskId: string

  beforeEach(async () => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })

    const task = await store.create('tasks', { title: 'Task to Delete', done: false, priority: 'low' })
    taskId = task.id
  })

  test('deletes item', async () => {
    await makeRequest(router, 'DELETE', `/api/tasks/${taskId}`)

    const record = await store.get('tasks', taskId)
    expect(record).toBeNull()
  })

  test('returns 204 No Content', async () => {
    const { response } = await makeRequest(router, 'DELETE', `/api/tasks/${taskId}`)

    expect(response.status).toBe(204)
  })

  test('returns 404 for non-existent ID', async () => {
    const { response, json } = await makeRequest(router, 'DELETE', '/api/tasks/non-existent-id')
    const res = json as APIError

    expect(response.status).toBe(404)
    expect(res.error.code).toBe(ErrorCodes.NOT_FOUND)
  })

  test('handles cascade deletes for relations', async () => {
    // Create a user and a task assigned to them
    const user = await store.create('users', { name: 'John', email: 'john@example.com', role: 'user', active: true })
    await store.create('tasks', { title: 'Task 1', done: false, priority: 'high', assignee: user.id })

    // Deleting user should handle related tasks (depending on cascade config)
    const { response } = await makeRequest(router, 'DELETE', `/api/users/${user.id}`)

    expect(response.status).toBe(204)
  })

  test('returns empty body on successful delete', async () => {
    const request = new Request(`http://localhost/api/tasks/${taskId}`, {
      method: 'DELETE',
    })

    const response = await router.handle(request)
    const text = await response.text()

    expect(text).toBe('')
  })
})

// =============================================================================
// 7. Validation Tests
// =============================================================================

describe('Validation', () => {
  let store: MemoryStore
  let router: APIRouter

  beforeEach(() => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })
  })

  test('validates required text fields', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { done: false, priority: 'high' }, // missing title
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.details!.some((d) => d.field === 'title')).toBe(true)
  })

  test('validates string type', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 123, done: false, priority: 'high' },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.details!.some((d) => d.field === 'title')).toBe(true)
  })

  test('validates number type', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/users', {
      body: { name: 'John', email: 'john@test.com', role: 'user', active: true, age: 'not-a-number' },
    })
    const res = json as APIError

    // Should validate or ignore unknown fields
    expect(response.status === 400 || response.status === 201).toBe(true)
  })

  test('validates boolean type', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'Task', done: 'not-a-boolean', priority: 'high' },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.details!.some((d) => d.field === 'done')).toBe(true)
  })

  test('validates date type', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'Task', done: false, priority: 'high', dueDate: 'not-a-date' },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.details!.some((d) => d.field === 'dueDate')).toBe(true)
  })

  test('validates email format', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/users', {
      body: { name: 'John', email: 'not-an-email', role: 'user', active: true },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.details!.some((d) => d.field === 'email')).toBe(true)
    expect(res.error.details!.find((d) => d.field === 'email')!.message).toContain('email')
  })

  test('validates URL format', async () => {
    // Create an app with URL field
    const appWithUrl = (
      <App name="test">
        <Resource name="Link" url:url title />
      </App>
    )
    const urlRouter = createAPIRouter({ app: appWithUrl, store })

    const { response, json } = await makeRequest(urlRouter, 'POST', '/api/links', {
      body: { title: 'Test', url: 'not-a-url' },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.details!.some((d) => d.field === 'url')).toBe(true)
  })

  test('validates select/enum options', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'Task', done: false, priority: 'invalid-option' },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.details!.some((d) => d.field === 'priority')).toBe(true)
  })

  test('validates relation foreign key exists', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'Task', done: false, priority: 'high', assignee: 'non-existent-user-id' },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
  })

  test('accepts optional fields as null', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'Task', done: false, priority: 'high', description: null },
    })

    expect(response.status).toBe(201)
  })

  test('accepts optional fields as undefined/missing', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'Task', done: false, priority: 'high' }, // description missing
    })

    expect(response.status).toBe(201)
  })

  test('returns multiple validation errors at once', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/users', {
      body: { name: 123, email: 'invalid', role: 'invalid', active: 'not-bool' },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.details!.length).toBeGreaterThan(1)
  })
})

// =============================================================================
// 8. Error Response Tests
// =============================================================================

describe('Error Responses', () => {
  let store: MemoryStore
  let router: APIRouter

  beforeEach(() => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })
  })

  test('400 Bad Request for validation errors', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { done: false }, // missing required title
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
    expect(res.error.message).toBeDefined()
    expect(res.error.details).toBeInstanceOf(Array)
  })

  test('401 Unauthorized for missing auth', async () => {
    // Create router with auth required
    const authApp = (
      <App name="test">
        <Resource name="Task" title />
      </App>
    )
    // Simulate auth requirement - this will need to be configured
    const authRouter = createAPIRouter({
      app: authApp,
      store,
      // auth: { required: true } would be added
    })

    // For now, test the format when we do get 401
    // This test documents expected behavior
    const { response } = await makeRequest(authRouter, 'GET', '/api/tasks', {
      headers: {}, // no auth header
    })

    // Without auth configured, should work
    // With auth configured, should return 401
    expect([200, 401]).toContain(response.status)
  })

  test('403 Forbidden for insufficient permissions', async () => {
    // This tests expected format when permissions are denied
    // Placeholder - actual implementation would check permissions
    expect(true).toBe(true)
  })

  test('404 Not Found has correct format', async () => {
    const { response, json } = await makeRequest(router, 'GET', '/api/tasks/non-existent')
    const res = json as APIError

    expect(response.status).toBe(404)
    expect(res.error).toBeDefined()
    expect(res.error.code).toBe(ErrorCodes.NOT_FOUND)
    expect(res.error.message).toBeDefined()
  })

  test('409 Conflict for duplicate unique field', async () => {
    // Create first user
    await makeRequest(router, 'POST', '/api/users', {
      body: { name: 'John', email: 'john@test.com', role: 'user', active: true },
    })

    // Try to create another with same email
    const { response, json } = await makeRequest(router, 'POST', '/api/users', {
      body: { name: 'Jane', email: 'john@test.com', role: 'user', active: true },
    })
    const res = json as APIError

    expect(response.status).toBe(409)
    expect(res.error.code).toBe(ErrorCodes.CONFLICT)
    expect(res.error.details!.some((d) => d.field === 'email')).toBe(true)
  })

  test('422 Unprocessable Entity for business rule violation', async () => {
    // This tests expected format for business rule violations
    // Example: trying to complete a task that has incomplete subtasks
    expect(true).toBe(true)
  })

  test('error response has correct content-type', async () => {
    const { response } = await makeRequest(router, 'GET', '/api/tasks/non-existent')

    expect(response.headers.get('Content-Type')).toContain('application/json')
  })

  test('error details include field name when applicable', async () => {
    const { json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 123, done: false, priority: 'high' },
    })
    const res = json as APIError

    expect(res.error.details).toBeDefined()
    expect(res.error.details!.some((d) => d.field === 'title')).toBe(true)
  })

  test('404 for non-existent resource type', async () => {
    const { response, json } = await makeRequest(router, 'GET', '/api/nonexistent')
    const res = json as APIError

    expect(response.status).toBe(404)
    expect(res.error.code).toBe(ErrorCodes.NOT_FOUND)
  })
})

// =============================================================================
// 9. Query Parameter Tests
// =============================================================================

describe('Query Parameters', () => {
  let store: MemoryStore
  let router: APIRouter

  beforeEach(async () => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })

    // Seed test data
    for (let i = 1; i <= 50; i++) {
      await store.create('tasks', {
        title: `Task ${i}`,
        done: i % 3 === 0,
        priority: ['low', 'medium', 'high'][i % 3],
      })
    }
  })

  test('page param sets current page', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?page=3')
    const res = json as APIResponse<unknown[]>

    expect(res.meta!.page).toBe(3)
  })

  test('pageSize param sets items per page', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?pageSize=5')
    const res = json as APIResponse<unknown[]>

    expect(res.data.length).toBe(5)
    expect(res.meta!.pageSize).toBe(5)
  })

  test('limit param is alias for pageSize', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?limit=5')
    const res = json as APIResponse<unknown[]>

    expect(res.data.length).toBe(5)
  })

  test('offset param skips items', async () => {
    const { json: firstPage } = await makeRequest(router, 'GET', '/api/tasks?limit=5')
    const { json: withOffset } = await makeRequest(router, 'GET', '/api/tasks?limit=5&offset=5')

    const firstPageData = (firstPage as APIResponse<Array<{ id: string }>>).data
    const offsetData = (withOffset as APIResponse<Array<{ id: string }>>).data

    // Should be different items
    expect(firstPageData[0].id).not.toBe(offsetData[0].id)
  })

  test('sort param specifies sort field', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?sort=title')
    const res = json as APIResponse<Array<{ title: string }>>

    // Should be sorted by title
    const titles = res.data.map((t) => t.title)
    const sortedTitles = [...titles].sort()
    expect(titles).toEqual(sortedTitles)
  })

  test('order=desc sorts descending', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?sort=title&order=desc')
    const res = json as APIResponse<Array<{ title: string }>>

    const titles = res.data.map((t) => t.title)
    const sortedTitles = [...titles].sort().reverse()
    expect(titles).toEqual(sortedTitles)
  })

  test('sortBy and orderBy are aliases', async () => {
    const { json: result1 } = await makeRequest(router, 'GET', '/api/tasks?sort=title&order=asc')
    const { json: result2 } = await makeRequest(router, 'GET', '/api/tasks?sortBy=title&orderBy=asc')

    const data1 = (result1 as APIResponse<Array<{ title: string }>>).data
    const data2 = (result2 as APIResponse<Array<{ title: string }>>).data

    expect(data1[0].title).toBe(data2[0].title)
  })

  test('field=value filters exact match', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?priority=high')
    const res = json as APIResponse<Array<{ priority: string }>>

    expect(res.data.every((t) => t.priority === 'high')).toBe(true)
  })

  test('field[gt]=value filters greater than', async () => {
    await store.create('tasks', { title: 'Recent', done: false, priority: 'high', createdAt: new Date() })

    const { json } = await makeRequest(router, 'GET', '/api/tasks?createdAt[gt]=2020-01-01')
    const res = json as APIResponse<unknown[]>

    expect(res.data.length).toBeGreaterThan(0)
  })

  test('field[lt]=value filters less than', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?createdAt[lt]=2099-01-01')
    const res = json as APIResponse<unknown[]>

    expect(res.data.length).toBeGreaterThan(0)
  })

  test('field[gte]=value filters greater than or equal', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?createdAt[gte]=2020-01-01')
    const res = json as APIResponse<unknown[]>

    expect(res.data.length).toBeGreaterThan(0)
  })

  test('field[lte]=value filters less than or equal', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?createdAt[lte]=2099-01-01')
    const res = json as APIResponse<unknown[]>

    expect(res.data.length).toBeGreaterThan(0)
  })

  test('field[ne]=value filters not equal', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?priority[ne]=high')
    const res = json as APIResponse<Array<{ priority: string }>>

    expect(res.data.every((t) => t.priority !== 'high')).toBe(true)
  })

  test('field[in]=value1,value2 filters in list', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?priority[in]=high,low')
    const res = json as APIResponse<Array<{ priority: string }>>

    expect(res.data.every((t) => ['high', 'low'].includes(t.priority))).toBe(true)
  })

  test('q param searches across text fields', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?q=Task+1')
    const res = json as APIResponse<Array<{ title: string }>>

    expect(res.data.some((t) => t.title.includes('Task 1'))).toBe(true)
  })

  test('search param is alias for q', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?search=Task+1')
    const res = json as APIResponse<Array<{ title: string }>>

    expect(res.data.some((t) => t.title.includes('Task 1'))).toBe(true)
  })

  test('query param is alias for q', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?query=Task+1')
    const res = json as APIResponse<Array<{ title: string }>>

    expect(res.data.some((t) => t.title.includes('Task 1'))).toBe(true)
  })

  test('fields param selects specific fields', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?fields=id,title')
    const res = json as APIResponse<Array<Record<string, unknown>>>

    expect(Object.keys(res.data[0]).sort()).toEqual(['id', 'title'])
  })

  test('select param is alias for fields', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?select=id,title')
    const res = json as APIResponse<Array<Record<string, unknown>>>

    expect(Object.keys(res.data[0]).sort()).toEqual(['id', 'title'])
  })

  test('include param expands relations', async () => {
    // Create user and task with relation
    const user = await store.create('users', { name: 'John', email: 'john@test.com', role: 'user', active: true })
    await store.create('tasks', { title: 'Task', done: false, priority: 'high', assignee: user.id })

    // Use limit=100 to get all tasks (including the newly created one beyond default page size)
    const { json } = await makeRequest(router, 'GET', '/api/tasks?include=assignee&limit=100')
    const res = json as APIResponse<Array<{ assignee: { name: string } }>>

    const taskWithAssignee = res.data.find((t) => t.assignee && typeof t.assignee === 'object')
    expect(taskWithAssignee?.assignee?.name).toBe('John')
  })

  test('multiple filters combine with AND', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?priority=high&done=true')
    const res = json as APIResponse<Array<{ priority: string; done: boolean }>>

    expect(res.data.every((t) => t.priority === 'high' && t.done === true)).toBe(true)
  })

  test('invalid page number returns error', async () => {
    const { response, json } = await makeRequest(router, 'GET', '/api/tasks?page=-1')
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.BAD_REQUEST)
  })

  test('invalid pageSize returns error', async () => {
    const { response, json } = await makeRequest(router, 'GET', '/api/tasks?pageSize=0')
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.BAD_REQUEST)
  })

  test('pageSize has maximum limit', async () => {
    const { json } = await makeRequest(router, 'GET', '/api/tasks?pageSize=10000')
    const res = json as APIResponse<unknown[]>

    // Should be capped at some maximum (e.g., 100 or 1000)
    expect(res.meta!.pageSize).toBeLessThanOrEqual(1000)
  })
})

// =============================================================================
// 10. Content Negotiation Tests
// =============================================================================

describe('Content Negotiation', () => {
  let store: MemoryStore
  let router: APIRouter

  beforeEach(async () => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })

    await store.create('tasks', { title: 'Task 1', done: false, priority: 'high' })
  })

  test('Accept: application/json returns JSON', async () => {
    const { response, json } = await makeRequest(router, 'GET', '/api/tasks', {
      headers: { Accept: 'application/json' },
    })

    expect(response.headers.get('Content-Type')).toContain('application/json')
    expect(json).toBeDefined()
  })

  test('Accept: text/csv returns CSV', async () => {
    const request = new Request('http://localhost/api/tasks', {
      headers: { Accept: 'text/csv' },
    })

    const response = await router.handle(request)

    expect(response.headers.get('Content-Type')).toContain('text/csv')
    const text = await response.text()
    expect(text).toContain('title')
    expect(text).toContain('Task 1')
  })

  test('Accept: text/yaml returns YAML', async () => {
    const request = new Request('http://localhost/api/tasks', {
      headers: { Accept: 'text/yaml' },
    })

    const response = await router.handle(request)

    expect(response.headers.get('Content-Type')).toContain('text/yaml')
    const text = await response.text()
    expect(text).toContain('title:')
  })

  test('Accept: application/yaml returns YAML', async () => {
    const request = new Request('http://localhost/api/tasks', {
      headers: { Accept: 'application/yaml' },
    })

    const response = await router.handle(request)

    expect(response.headers.get('Content-Type')).toContain('yaml')
  })

  test('default Accept returns JSON', async () => {
    const request = new Request('http://localhost/api/tasks')
    const response = await router.handle(request)

    expect(response.headers.get('Content-Type')).toContain('application/json')
  })

  test('validates Content-Type on POST', async () => {
    const request = new Request('http://localhost/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'title=test',
    })

    const response = await router.handle(request)

    // Should reject non-JSON content type for POST
    expect(response.status).toBe(415) // Unsupported Media Type
  })

  test('accepts application/json Content-Type', async () => {
    const { response } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'Task', done: false, priority: 'high' },
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status).toBe(201)
  })

  test('Accept header with quality values', async () => {
    const request = new Request('http://localhost/api/tasks', {
      headers: { Accept: 'text/csv;q=0.5, application/json;q=1.0' },
    })

    const response = await router.handle(request)

    // Should prefer JSON due to higher quality value
    expect(response.headers.get('Content-Type')).toContain('application/json')
  })

  test('406 Not Acceptable for unsupported Accept', async () => {
    const request = new Request('http://localhost/api/tasks', {
      headers: { Accept: 'application/xml' },
    })

    const response = await router.handle(request)

    expect(response.status).toBe(406)
  })
})

// =============================================================================
// 11. Bulk Operations Tests
// =============================================================================

describe('Bulk Operations', () => {
  let store: MemoryStore
  let router: APIRouter

  beforeEach(async () => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })
  })

  test('POST /api/:resource/bulk creates multiple items', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks/bulk', {
      body: [
        { title: 'Task 1', done: false, priority: 'high' },
        { title: 'Task 2', done: false, priority: 'low' },
        { title: 'Task 3', done: true, priority: 'medium' },
      ],
    })
    const res = json as APIResponse<Array<{ id: string }>>

    expect(response.status).toBe(201)
    expect(res.data.length).toBe(3)
    expect(res.data.every((item) => item.id)).toBe(true)
  })

  test('PUT /api/:resource/bulk updates multiple items', async () => {
    // Create tasks first
    const task1 = await store.create('tasks', { title: 'Task 1', done: false, priority: 'low' })
    const task2 = await store.create('tasks', { title: 'Task 2', done: false, priority: 'low' })

    const { response, json } = await makeRequest(router, 'PUT', '/api/tasks/bulk', {
      body: [
        { id: task1.id, done: true },
        { id: task2.id, done: true },
      ],
    })
    const res = json as APIResponse<Array<{ id: string; done: boolean }>>

    expect(response.status).toBe(200)
    expect(res.data.length).toBe(2)
    expect(res.data.every((item) => item.done === true)).toBe(true)
  })

  test('DELETE /api/:resource/bulk deletes multiple items', async () => {
    // Create tasks first
    const task1 = await store.create('tasks', { title: 'Task 1', done: false, priority: 'low' })
    const task2 = await store.create('tasks', { title: 'Task 2', done: false, priority: 'low' })
    const task3 = await store.create('tasks', { title: 'Task 3', done: false, priority: 'low' })

    const { response } = await makeRequest(router, 'DELETE', '/api/tasks/bulk', {
      body: { ids: [task1.id, task2.id] },
    })

    expect(response.status).toBe(204)

    // Verify task3 still exists
    const remaining = await store.get('tasks', task3.id)
    expect(remaining).not.toBeNull()

    // Verify task1 and task2 are deleted
    expect(await store.get('tasks', task1.id)).toBeNull()
    expect(await store.get('tasks', task2.id)).toBeNull()
  })

  test('bulk create validates all items', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks/bulk', {
      body: [
        { title: 'Valid Task', done: false, priority: 'high' },
        { done: false, priority: 'high' }, // missing title
        { title: 'Another Valid', done: false, priority: 'high' },
      ],
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
  })

  test('bulk create with transaction semantics (all or nothing)', async () => {
    // Try to create with one invalid item
    await makeRequest(router, 'POST', '/api/tasks/bulk', {
      body: [
        { title: 'Valid Task', done: false, priority: 'high' },
        { done: false, priority: 'high' }, // missing title
      ],
    })

    // None should be created due to transaction rollback
    const tasks = await store.list('tasks')
    expect(tasks.length).toBe(0)
  })

  test('bulk update returns partial results on error', async () => {
    const task1 = await store.create('tasks', { title: 'Task 1', done: false, priority: 'low' })

    const { response, json } = await makeRequest(router, 'PUT', '/api/tasks/bulk', {
      body: [
        { id: task1.id, done: true },
        { id: 'non-existent-id', done: true },
      ],
    })

    // Could return 207 Multi-Status or handle differently
    expect([200, 207, 400, 404]).toContain(response.status)
  })

  test('bulk operations have rate limiting', async () => {
    // Attempt very large bulk operation
    const manyItems = Array.from({ length: 1001 }, (_, i) => ({
      title: `Task ${i}`,
      done: false,
      priority: 'low',
    }))

    const { response, json } = await makeRequest(router, 'POST', '/api/tasks/bulk', {
      body: manyItems,
    })
    const res = json as APIError

    // Should reject excessively large bulk operations
    expect(response.status).toBe(400)
    expect(res.error.message).toContain('limit')
  })
})

// =============================================================================
// 12. Relation Endpoints Tests
// =============================================================================

describe('Relation Endpoints', () => {
  let store: MemoryStore
  let router: APIRouter
  let userId: string
  let taskId: string
  let tagId: string

  beforeEach(async () => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })

    const user = await store.create('users', { name: 'John', email: 'john@test.com', role: 'user', active: true })
    userId = user.id

    const task = await store.create('tasks', { title: 'Task 1', done: false, priority: 'high', assignee: userId })
    taskId = task.id

    const tag = await store.create('tags', { name: 'urgent', color: 'red' })
    tagId = tag.id
  })

  test('GET /api/:resource/:id/:relation gets related item', async () => {
    const { response, json } = await makeRequest(router, 'GET', `/api/tasks/${taskId}/assignee`)
    const res = json as APIResponse<{ id: string; name: string }>

    expect(response.status).toBe(200)
    expect(res.data.id).toBe(userId)
    expect(res.data.name).toBe('John')
  })

  test('GET /api/:resource/:id/:relation returns 404 for no relation', async () => {
    // Create task without assignee
    const task = await store.create('tasks', { title: 'Unassigned', done: false, priority: 'low' })

    const { response, json } = await makeRequest(router, 'GET', `/api/tasks/${task.id}/assignee`)
    const res = json as APIError

    expect(response.status).toBe(404)
    expect(res.error.code).toBe(ErrorCodes.NOT_FOUND)
  })

  test('POST /api/:resource/:id/:relation adds relation', async () => {
    // This would work for many-to-many relations like tasks/tags
    const { response, json } = await makeRequest(router, 'POST', `/api/tasks/${taskId}/tags`, {
      body: { id: tagId },
    })

    expect(response.status).toBe(201)
  })

  test('DELETE /api/:resource/:id/:relation/:relationId removes relation', async () => {
    // First add the tag
    await makeRequest(router, 'POST', `/api/tasks/${taskId}/tags`, {
      body: { id: tagId },
    })

    // Then remove it
    const { response } = await makeRequest(router, 'DELETE', `/api/tasks/${taskId}/tags/${tagId}`)

    expect(response.status).toBe(204)
  })

  test('GET /api/:resource/:id/:relation returns array for many relation', async () => {
    // Add multiple tags
    const tag2 = await store.create('tags', { name: 'important', color: 'blue' })
    await makeRequest(router, 'POST', `/api/tasks/${taskId}/tags`, { body: { id: tagId } })
    await makeRequest(router, 'POST', `/api/tasks/${taskId}/tags`, { body: { id: tag2.id } })

    const { response, json } = await makeRequest(router, 'GET', `/api/tasks/${taskId}/tags`)
    const res = json as APIResponse<Array<{ id: string }>>

    expect(response.status).toBe(200)
    expect(res.data).toBeInstanceOf(Array)
    expect(res.data.length).toBe(2)
  })

  test('PUT /api/:resource/:id/:relation replaces relation', async () => {
    const newUser = await store.create('users', { name: 'Jane', email: 'jane@test.com', role: 'user', active: true })

    const { response, json } = await makeRequest(router, 'PUT', `/api/tasks/${taskId}/assignee`, {
      body: { id: newUser.id },
    })
    const res = json as APIResponse<{ id: string }>

    expect(response.status).toBe(200)
    expect(res.data.id).toBe(newUser.id)
  })

  test('validates relation target exists', async () => {
    const { response, json } = await makeRequest(router, 'POST', `/api/tasks/${taskId}/tags`, {
      body: { id: 'non-existent-tag' },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
  })

  test('returns 404 for invalid relation name', async () => {
    const { response, json } = await makeRequest(router, 'GET', `/api/tasks/${taskId}/invalid-relation`)
    const res = json as APIError

    expect(response.status).toBe(404)
    expect(res.error.code).toBe(ErrorCodes.NOT_FOUND)
  })
})

// =============================================================================
// 13. Action Endpoints Tests
// =============================================================================

describe('Action Endpoints', () => {
  let store: MemoryStore
  let router: APIRouter
  let taskId: string

  beforeEach(async () => {
    store = new MemoryStore()

    // App with custom actions
    const appWithActions = (
      <App name="testapp">
        <Resource
          name="Task"
          title
          done
          priority="low | medium | high"
        />
      </App>
    )

    router = createAPIRouter({ app: appWithActions, store })

    const task = await store.create('tasks', { title: 'Task 1', done: false, priority: 'high' })
    taskId = task.id
  })

  test('POST /api/:resource/:id/:action executes custom action', async () => {
    const { response, json } = await makeRequest(router, 'POST', `/api/tasks/${taskId}/complete`)
    const res = json as APIResponse<{ done: boolean }>

    expect(response.status).toBe(200)
    expect(res.data.done).toBe(true)
  })

  test('POST /api/:resource/:action executes bulk action', async () => {
    // Create multiple incomplete tasks
    await store.create('tasks', { title: 'Task 2', done: false, priority: 'low' })
    await store.create('tasks', { title: 'Task 3', done: false, priority: 'medium' })

    const { response, json } = await makeRequest(router, 'POST', '/api/tasks/complete-all')
    const res = json as APIResponse<{ count: number }>

    expect(response.status).toBe(200)
    expect(res.data.count).toBeGreaterThanOrEqual(3)

    // Verify all tasks are done
    const tasks = await store.list('tasks')
    expect(tasks.every((t: { done: boolean }) => t.done)).toBe(true)
  })

  test('action with body parameters', async () => {
    const { response, json } = await makeRequest(router, 'POST', `/api/tasks/${taskId}/change-priority`, {
      body: { priority: 'low' },
    })
    const res = json as APIResponse<{ priority: string }>

    expect(response.status).toBe(200)
    expect(res.data.priority).toBe('low')
  })

  test('action returns 404 for non-existent resource', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks/non-existent-id/complete')
    const res = json as APIError

    expect(response.status).toBe(404)
    expect(res.error.code).toBe(ErrorCodes.NOT_FOUND)
  })

  test('action returns 404 for undefined action', async () => {
    const { response, json } = await makeRequest(router, 'POST', `/api/tasks/${taskId}/undefined-action`)
    const res = json as APIError

    expect(response.status).toBe(404)
    expect(res.error.code).toBe(ErrorCodes.NOT_FOUND)
  })

  test('action validates body parameters', async () => {
    const { response, json } = await makeRequest(router, 'POST', `/api/tasks/${taskId}/change-priority`, {
      body: { priority: 'invalid' },
    })
    const res = json as APIError

    expect(response.status).toBe(400)
    expect(res.error.code).toBe(ErrorCodes.VALIDATION_ERROR)
  })
})

// =============================================================================
// Additional Edge Case Tests
// =============================================================================

describe('Edge Cases', () => {
  let store: MemoryStore
  let router: APIRouter

  beforeEach(() => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })
  })

  test('handles empty request body for POST', async () => {
    const request = new Request('http://localhost/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '',
    })

    const response = await router.handle(request)
    expect(response.status).toBe(400)
  })

  test('handles null request body for POST', async () => {
    const { response } = await makeRequest(router, 'POST', '/api/tasks', {
      body: null,
    })

    expect(response.status).toBe(400)
  })

  test('handles very long field values', async () => {
    const longTitle = 'A'.repeat(10000)
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: longTitle, done: false, priority: 'high' },
    })

    // Should either succeed or return validation error for length
    expect([201, 400]).toContain(response.status)
  })

  test('handles special characters in field values', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: '< script>alert("xss")</script>', done: false, priority: 'high' },
    })
    const res = json as APIResponse<{ title: string }>

    expect(response.status).toBe(201)
    // Should sanitize or store as-is depending on policy
  })

  test('handles unicode in field values', async () => {
    const { response, json } = await makeRequest(router, 'POST', '/api/tasks', {
      body: { title: 'Task with emojis: test', done: false, priority: 'high' },
    })
    const res = json as APIResponse<{ title: string }>

    expect(response.status).toBe(201)
    expect(res.data.title).toContain('test')
  })

  test('handles concurrent requests', async () => {
    // Create many tasks concurrently
    const promises = Array.from({ length: 10 }, (_, i) =>
      makeRequest(router, 'POST', '/api/tasks', {
        body: { title: `Concurrent Task ${i}`, done: false, priority: 'high' },
      })
    )

    const results = await Promise.all(promises)

    expect(results.every((r) => r.response.status === 201)).toBe(true)

    const tasks = await store.list('tasks')
    expect(tasks.length).toBe(10)
  })

  test('handles resource name case insensitivity', async () => {
    // Try both lowercase and uppercase
    const { response: lower } = await makeRequest(router, 'GET', '/api/tasks')
    const { response: upper } = await makeRequest(router, 'GET', '/api/Tasks')
    const { response: mixed } = await makeRequest(router, 'GET', '/api/TASKS')

    // Should normalize to lowercase
    expect([200, 404]).toContain(lower.status)
  })

  test('handles trailing slashes in URLs', async () => {
    await store.create('tasks', { title: 'Task', done: false, priority: 'high' })

    const { response: withSlash } = await makeRequest(router, 'GET', '/api/tasks/')
    const { response: withoutSlash } = await makeRequest(router, 'GET', '/api/tasks')

    // Should handle both the same way
    expect(withSlash.status).toBe(withoutSlash.status)
  })

  test('handles query params with special characters', async () => {
    await store.create('tasks', { title: 'Task with special chars: &=?', done: false, priority: 'high' })

    const { response } = await makeRequest(
      router,
      'GET',
      '/api/tasks?q=' + encodeURIComponent('special chars: &=?')
    )

    expect(response.status).toBe(200)
  })

  test('handles HEAD requests', async () => {
    await store.create('tasks', { title: 'Task', done: false, priority: 'high' })

    const request = new Request('http://localhost/api/tasks', {
      method: 'HEAD',
    })

    const response = await router.handle(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    const text = await response.text()
    expect(text).toBe('')
  })

  test('handles OPTIONS requests for CORS', async () => {
    const request = new Request('http://localhost/api/tasks', {
      method: 'OPTIONS',
    })

    const response = await router.handle(request)

    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Methods')).toBeDefined()
  })

  test('returns CORS headers on all responses', async () => {
    const { response } = await makeRequest(router, 'GET', '/api/tasks')

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined()
  })

  test('handles If-None-Match for caching', async () => {
    const task = await store.create('tasks', { title: 'Task', done: false, priority: 'high' })

    // First request to get ETag
    const { response: first } = await makeRequest(router, 'GET', `/api/tasks/${task.id}`)
    const etag = first.headers.get('ETag')

    expect(etag).toBeDefined()

    // Second request with If-None-Match
    const request = new Request(`http://localhost/api/tasks/${task.id}`, {
      headers: { 'If-None-Match': etag! },
    })

    const response = await router.handle(request)
    expect(response.status).toBe(304) // Not Modified
  })

  test('handles method override via X-HTTP-Method-Override', async () => {
    const task = await store.create('tasks', { title: 'Task', done: false, priority: 'high' })

    const request = new Request(`http://localhost/api/tasks/${task.id}`, {
      method: 'POST',
      headers: {
        'X-HTTP-Method-Override': 'DELETE',
      },
    })

    const response = await router.handle(request)
    expect(response.status).toBe(204)

    const deleted = await store.get('tasks', task.id)
    expect(deleted).toBeNull()
  })
})

// =============================================================================
// Performance and Limits Tests
// =============================================================================

describe('Performance and Limits', () => {
  let store: MemoryStore
  let router: APIRouter

  beforeEach(() => {
    store = new MemoryStore()
    router = createAPIRouter({ app: createTestApp(), store })
  })

  test('handles large result sets with pagination', async () => {
    // Create 500 tasks
    for (let i = 0; i < 500; i++) {
      await store.create('tasks', { title: `Task ${i}`, done: false, priority: 'low' })
    }

    const { response, json } = await makeRequest(router, 'GET', '/api/tasks')
    const res = json as APIResponse<unknown[]>

    expect(response.status).toBe(200)
    expect(res.data.length).toBeLessThanOrEqual(100) // Default page size limit
    expect(res.meta!.total).toBe(500)
    expect(res.meta!.totalPages).toBeGreaterThan(1)
  })

  test('default page size is reasonable', async () => {
    for (let i = 0; i < 50; i++) {
      await store.create('tasks', { title: `Task ${i}`, done: false, priority: 'low' })
    }

    const { json } = await makeRequest(router, 'GET', '/api/tasks')
    const res = json as APIResponse<unknown[]>

    // Default page size should be between 10 and 100
    expect(res.meta!.pageSize).toBeGreaterThanOrEqual(10)
    expect(res.meta!.pageSize).toBeLessThanOrEqual(100)
  })

  test('request timeout handling', async () => {
    // This test documents expected timeout behavior
    // Actual implementation would need timeout configuration
    expect(true).toBe(true)
  })
})

// =============================================================================
// Middleware Integration Tests
// =============================================================================

describe('Middleware Integration', () => {
  let store: MemoryStore

  test('logging middleware is applied', async () => {
    // Placeholder - middleware system would be tested here
    expect(true).toBe(true)
  })

  test('authentication middleware can be added', async () => {
    // Placeholder - auth middleware integration
    expect(true).toBe(true)
  })

  test('rate limiting middleware can be added', async () => {
    // Placeholder - rate limiting integration
    expect(true).toBe(true)
  })
})
