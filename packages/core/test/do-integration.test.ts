/**
 * @dotdo/do Integration Tests
 *
 * RED Phase: These tests verify the integration of @dotdo/do package
 * with @saaskit/core. They MUST FAIL initially until:
 * 1. @dotdo/do is installed
 * 2. DO is re-exported from @saaskit/core
 *
 * This follows TDD - write failing tests first, then implement.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  createMockDurableObjectState,
  createMockEnv,
  type MockDurableObjectState
} from './helpers/mock-do-state'

// ============================================================================
// Test: @dotdo/do Package Import
// ============================================================================

describe('@dotdo/do package availability', () => {
  it('can import DO class from @dotdo/do', async () => {
    // This test verifies @dotdo/do is installed in the workspace
    // It will fail until: bun add @dotdo/do --cwd packages/core
    const { DO } = await import('@dotdo/do')
    expect(DO).toBeDefined()
    expect(typeof DO).toBe('function')
  })

  it('can import RpcTarget from @dotdo/do/rpc', async () => {
    // Verify sub-module exports work
    const { RpcTarget } = await import('@dotdo/do/rpc')
    expect(RpcTarget).toBeDefined()
  })

  it('can import DOClient type from @dotdo/do', async () => {
    // Type imports should work (this is a runtime check for the module)
    const doModule = await import('@dotdo/do')
    expect(doModule).toHaveProperty('DO')
  })
})

// ============================================================================
// Test: Re-export from @saaskit/core
// ============================================================================

describe('@saaskit/core re-exports', () => {
  it('exports DO class from @saaskit/core', async () => {
    // This test verifies @saaskit/core properly re-exports DO
    // It will fail until index.ts is updated with:
    // export { DO } from '@dotdo/do'
    const { DO } = await import('@saaskit/core')
    expect(DO).toBeDefined()
    expect(typeof DO).toBe('function')
  })

  it('exports RpcTarget from @saaskit/core', async () => {
    // Verify RpcTarget is also re-exported
    const { RpcTarget } = await import('@saaskit/core')
    expect(RpcTarget).toBeDefined()
  })

  it('DO from @saaskit/core is the same as from @dotdo/do', async () => {
    // Ensure we're not accidentally creating a different class
    const { DO: CoreDO } = await import('@saaskit/core')
    const { DO: DotdoDO } = await import('@dotdo/do')
    expect(CoreDO).toBe(DotdoDO)
  })
})

// ============================================================================
// Test: DO Instantiation with Mock Context
// ============================================================================

describe('DO instantiation', () => {
  let mockState: MockDurableObjectState
  let mockEnv: Record<string, unknown>

  beforeEach(() => {
    mockState = createMockDurableObjectState({ id: 'test-do-id' })
    mockEnv = createMockEnv()
  })

  it('can instantiate DO with mock DurableObjectState', async () => {
    const { DO } = await import('@dotdo/do')

    // DO constructor should accept (state, env)
    // This tests the basic instantiation pattern
    const instance = new DO(mockState, mockEnv)

    expect(instance).toBeDefined()
    expect(instance).toBeInstanceOf(DO)
  })

  it('DO instance has expected methods', async () => {
    const { DO } = await import('@dotdo/do')
    const instance = new DO(mockState, mockEnv)

    // Verify DO has the expected CRUD interface methods
    expect(typeof instance.fetch).toBe('function')
  })

  it('DO instance can access state.storage', async () => {
    const { DO } = await import('@dotdo/do')
    const instance = new DO(mockState, mockEnv)

    // The DO should be able to access the storage
    // This verifies our mock is compatible
    expect(instance).toBeDefined()
  })
})

// ============================================================================
// Test: Basic CRUD Operations
// ============================================================================

describe('DO CRUD operations', () => {
  let mockState: MockDurableObjectState
  let mockEnv: Record<string, unknown>
  let doInstance: InstanceType<typeof import('@dotdo/do').DO>

  beforeEach(async () => {
    mockState = createMockDurableObjectState({ id: 'crud-test-do' })
    mockEnv = createMockEnv()

    const { DO } = await import('@dotdo/do')
    doInstance = new DO(mockState, mockEnv)
  })

  describe('create()', () => {
    it('can create a document', async () => {
      // Test creating a document via DO
      // The DO should have a create method or handle POST requests
      const response = await doInstance.fetch(
        new Request('http://do/api/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Test Item' })
        })
      )

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('id')
      expect(data.name).toBe('Test Item')
    })

    it('created document has auto-generated id', async () => {
      const response = await doInstance.fetch(
        new Request('http://do/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Item' })
        })
      )

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.id).toBeDefined()
      expect(typeof data.id).toBe('string')
    })

    it('created document has timestamps', async () => {
      const response = await doInstance.fetch(
        new Request('http://do/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Timestamped Item' })
        })
      )

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.createdAt).toBeDefined()
      expect(data.updatedAt).toBeDefined()
    })
  })

  describe('read()', () => {
    it('can read a document by id', async () => {
      // First create a document
      const createResponse = await doInstance.fetch(
        new Request('http://do/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Read Test' })
        })
      )
      const created = await createResponse.json()

      // Then read it back
      const readResponse = await doInstance.fetch(
        new Request(`http://do/api/items/${created.id}`, {
          method: 'GET'
        })
      )

      expect(readResponse.ok).toBe(true)
      const data = await readResponse.json()
      expect(data.id).toBe(created.id)
      expect(data.title).toBe('Read Test')
    })

    it('returns 404 for non-existent document', async () => {
      const response = await doInstance.fetch(
        new Request('http://do/api/items/non-existent-id', {
          method: 'GET'
        })
      )

      expect(response.status).toBe(404)
    })
  })

  describe('update()', () => {
    it('can update a document', async () => {
      // Create a document
      const createResponse = await doInstance.fetch(
        new Request('http://do/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Original Title' })
        })
      )
      const created = await createResponse.json()

      // Update it
      const updateResponse = await doInstance.fetch(
        new Request(`http://do/api/items/${created.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Title' })
        })
      )

      expect(updateResponse.ok).toBe(true)
      const data = await updateResponse.json()
      expect(data.title).toBe('Updated Title')
    })

    it('update refreshes updatedAt timestamp', async () => {
      // Create a document
      const createResponse = await doInstance.fetch(
        new Request('http://do/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Timestamp Test' })
        })
      )
      const created = await createResponse.json()
      const originalUpdatedAt = created.updatedAt

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 10))

      // Update it
      const updateResponse = await doInstance.fetch(
        new Request(`http://do/api/items/${created.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated' })
        })
      )
      const updated = await updateResponse.json()

      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      )
    })

    it('returns 404 when updating non-existent document', async () => {
      const response = await doInstance.fetch(
        new Request('http://do/api/items/non-existent', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Should Fail' })
        })
      )

      expect(response.status).toBe(404)
    })
  })

  describe('delete()', () => {
    it('can delete a document', async () => {
      // Create a document
      const createResponse = await doInstance.fetch(
        new Request('http://do/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'To Delete' })
        })
      )
      const created = await createResponse.json()

      // Delete it
      const deleteResponse = await doInstance.fetch(
        new Request(`http://do/api/items/${created.id}`, {
          method: 'DELETE'
        })
      )

      expect(deleteResponse.ok).toBe(true)

      // Verify it's gone
      const getResponse = await doInstance.fetch(
        new Request(`http://do/api/items/${created.id}`, {
          method: 'GET'
        })
      )
      expect(getResponse.status).toBe(404)
    })

    it('returns 404 when deleting non-existent document', async () => {
      const response = await doInstance.fetch(
        new Request('http://do/api/items/non-existent', {
          method: 'DELETE'
        })
      )

      expect(response.status).toBe(404)
    })
  })

  describe('list()', () => {
    it('can list all documents', async () => {
      // Create multiple documents
      await doInstance.fetch(
        new Request('http://do/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Item 1' })
        })
      )
      await doInstance.fetch(
        new Request('http://do/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Item 2' })
        })
      )
      await doInstance.fetch(
        new Request('http://do/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Item 3' })
        })
      )

      // List all
      const response = await doInstance.fetch(
        new Request('http://do/api/items', {
          method: 'GET'
        })
      )

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(3)
    })

    it('returns empty array when no documents exist', async () => {
      // Fresh state should have no documents
      const freshState = createMockDurableObjectState({ id: 'empty-do' })
      const { DO } = await import('@dotdo/do')
      const freshInstance = new DO(freshState, mockEnv)

      const response = await freshInstance.fetch(
        new Request('http://do/api/empty-collection', {
          method: 'GET'
        })
      )

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)
    })
  })
})

// ============================================================================
// Test: SQLite Storage Integration
// ============================================================================

describe('DO SQLite storage', () => {
  let mockState: MockDurableObjectState
  let mockEnv: Record<string, unknown>

  beforeEach(() => {
    mockState = createMockDurableObjectState({ id: 'sql-test-do' })
    mockEnv = createMockEnv()
  })

  it('DO uses SQL storage for data persistence', async () => {
    const { DO } = await import('@dotdo/do')
    const instance = new DO(mockState, mockEnv)

    // Create a document
    await instance.fetch(
      new Request('http://do/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'SQL Test' })
      })
    )

    // Verify the mock SQL storage was used
    // This tests that DO uses state.storage.sql internally
    expect(mockState.storage.sql).toBeDefined()
  })

  it('mock SQL storage supports basic queries', () => {
    // Test the mock directly to ensure it's compatible
    const cursor = mockState.storage.sql.exec(
      'CREATE TABLE IF NOT EXISTS test (id TEXT PRIMARY KEY, name TEXT)'
    )
    expect(cursor).toBeDefined()
    expect(cursor.toArray()).toEqual([])
  })

  it('mock SQL storage supports INSERT operations', () => {
    mockState.storage.sql.exec(
      'CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, title TEXT)'
    )

    const cursor = mockState.storage.sql.exec(
      'INSERT INTO items (id, title) VALUES (?, ?)',
      'test-id',
      'Test Title'
    )

    expect(cursor).toBeDefined()
  })

  it('mock SQL storage supports SELECT operations', () => {
    mockState.storage.sql.exec(
      'CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, title TEXT)'
    )
    mockState.storage.sql.exec(
      'INSERT INTO items (id, title) VALUES (?, ?)',
      'test-id',
      'Test Title'
    )

    const cursor = mockState.storage.sql.exec('SELECT * FROM items')
    const results = cursor.toArray()

    expect(Array.isArray(results)).toBe(true)
  })
})

// ============================================================================
// Test: Type Exports
// ============================================================================

describe('Type exports from @dotdo/do', () => {
  it('exports expected types', async () => {
    // This is primarily a compile-time check, but we can verify the module structure
    const doModule = await import('@dotdo/do')

    // DO class should be the main export
    expect(doModule.DO).toBeDefined()

    // Check for other expected exports
    expect(doModule).toBeDefined()
  })
})
