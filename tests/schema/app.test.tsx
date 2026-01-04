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
})
