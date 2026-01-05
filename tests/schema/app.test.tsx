import { describe, expect, test } from 'bun:test'
import React from 'react'

describe('App Component', () => {
  test('App component exists', async () => {
    const { App } = await import('../../src/schema/App')
    expect(App).toBeDefined()
  })

  test('App creates app with name prop', async () => {
    const { App } = await import('../../src/schema/App')
    const app = <App name="todos" />
    expect(app.props.name).toBe('todos')
  })

  test('App validates required name prop at render time', async () => {
    const { getAppMetadata } = await import('../../src/schema/App')
    // getAppMetadata throws when name is missing
    // @ts-expect-error - intentionally missing name
    expect(() => getAppMetadata({ props: {} })).toThrow()
  })

  test('App accepts children (Resource components)', async () => {
    const { App } = await import('../../src/schema/App')
    const { Resource } = await import('../../src/schema/Resource')

    const app = (
      <App name="todos">
        <Resource name="Task" />
      </App>
    )
    expect(app.props.children).toBeDefined()
  })

  test('App generates correct metadata', async () => {
    const { App, getAppMetadata } = await import('../../src/schema/App')

    const app = <App name="todos" description="Task manager" version="1.0.0" />
    const metadata = getAppMetadata(app)

    expect(metadata.name).toBe('todos')
    expect(metadata.description).toBe('Task manager')
    expect(metadata.version).toBe('1.0.0')
  })

  test('App provides context to children', async () => {
    const { App, useApp } = await import('../../src/schema/App')

    // Test that useApp hook can access app context
    expect(useApp).toBeDefined()
  })

  // New tests for polished API
  describe('Defaults and Normalization', () => {
    test('App normalizes name to lowercase with hyphens', async () => {
      const { getAppMetadata } = await import('../../src/schema/App')

      const metadata = getAppMetadata({ props: { name: 'MyApp' } } as any)
      expect(metadata.name).toBe('my-app')
    })

    test('App provides displayName from normalized name', async () => {
      const { getAppMetadata } = await import('../../src/schema/App')

      const metadata = getAppMetadata({ props: { name: 'my-crm' } } as any)
      expect(metadata.displayName).toBe('My Crm')
    })

    test('App defaults version to 0.1.0', async () => {
      const { getAppMetadata, DEFAULT_APP_VERSION } = await import('../../src/schema/App')

      const metadata = getAppMetadata({ props: { name: 'test' } } as any)
      expect(metadata.version).toBe(DEFAULT_APP_VERSION)
      expect(metadata.version).toBe('0.1.0')
    })

    test('App defaults description from name', async () => {
      const { getAppMetadata } = await import('../../src/schema/App')

      const metadata = getAppMetadata({ props: { name: 'my-app' } } as any)
      expect(metadata.description).toBe('My App - A SaaSkit application')
    })

    test('App defaults baseUrl to localhost:3000', async () => {
      const { getAppMetadata, DEFAULT_BASE_URL } = await import('../../src/schema/App')

      const metadata = getAppMetadata({ props: { name: 'test' } } as any)
      expect(metadata.baseUrl).toBe(DEFAULT_BASE_URL)
    })

    test('App defaults all targets to enabled', async () => {
      const { getAppMetadata } = await import('../../src/schema/App')

      const metadata = getAppMetadata({ props: { name: 'test' } } as any)
      expect(metadata.targets.cli).toBe(true)
      expect(metadata.targets.api).toBe(true)
      expect(metadata.targets.sdk).toBe(true)
      expect(metadata.targets.mcp).toBe(true)
    })
  })

  describe('Helper Functions', () => {
    test('normalizeName handles various formats', async () => {
      const { normalizeName } = await import('../../src/schema/App')

      expect(normalizeName('MyApp')).toBe('my-app')
      expect(normalizeName('my_app')).toBe('my-app')
      expect(normalizeName('My App')).toBe('my-app')
      expect(normalizeName('my-app')).toBe('my-app')
      expect(normalizeName('TodoList')).toBe('todo-list')
    })

    test('toDisplayName converts to readable format', async () => {
      const { toDisplayName } = await import('../../src/schema/App')

      expect(toDisplayName('my-app')).toBe('My App')
      expect(toDisplayName('todos')).toBe('Todos')
      expect(toDisplayName('my_crm')).toBe('My Crm')
    })
  })

  describe('Validation', () => {
    test('App throws on empty name', async () => {
      const { getAppMetadata } = await import('../../src/schema/App')

      expect(() => getAppMetadata({ props: { name: '' } } as any)).toThrow()
      expect(() => getAppMetadata({ props: { name: '   ' } } as any)).toThrow()
    })

    test('App throws on invalid name', async () => {
      const { getAppMetadata } = await import('../../src/schema/App')

      expect(() => getAppMetadata({ props: { name: '123' } } as any)).toThrow()
      expect(() => getAppMetadata({ props: { name: '---' } } as any)).toThrow()
    })
  })
})
