/**
 * MCP Server Tests
 *
 * Tests for Model Context Protocol server implementation.
 */

import { describe, it, expect } from 'bun:test'
import React from 'react'

import { createMCPServer, MCPServer } from '../../src/mcp/server'
import { App } from '../../src/schema/App'
import { Resource } from '../../src/schema/Resource'
import { MemoryStore } from '../../src/data/MemoryStore'
import { Text, Number as NumberField, Select } from '../../src/schema/fields'

// Test app fixture
function createTestApp() {
  return (
    <App name="TestApp" version="1.0.0">
      <Resource name="User" path="/users">
        <Text name="name" required />
        <Text name="email" required unique />
        <Select name="role" values={['admin', 'user', 'guest']} />
      </Resource>
      <Resource name="Post" path="/posts">
        <Text name="title" required />
        <Text name="content" />
        <NumberField name="views" />
      </Resource>
    </App>
  )
}

describe('MCPServer', () => {
  describe('server configuration', () => {
    it('should create server with app and store', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })
      expect(server).toBeDefined()
    })

    it('should accept custom server name and version', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
        name: 'CustomServer',
        version: '2.0.0',
      })
      expect(server).toBeDefined()
    })
  })

  describe('server info', () => {
    it('should return server info with name and version', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
        name: 'TestServer',
        version: '1.5.0',
      })
      const info = server.getServerInfo()
      expect(info.name).toBe('TestServer')
      expect(info.version).toBe('1.5.0')
    })

    it('should use app name and version as defaults', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })
      const info = server.getServerInfo()
      expect(info.name).toBe('TestApp')
      expect(info.version).toBe('1.0.0')
    })
  })

  describe('tool listing', () => {
    it('should generate CRUD tools for each resource', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })
      const tools = server.listTools()

      // Should have tools for User and Post resources
      const toolNames = tools.map((t) => t.name)

      // User CRUD
      expect(toolNames).toContain('create_user')
      expect(toolNames).toContain('list_users')
      expect(toolNames).toContain('get_user')
      expect(toolNames).toContain('update_user')
      expect(toolNames).toContain('delete_user')

      // Post CRUD
      expect(toolNames).toContain('create_post')
      expect(toolNames).toContain('list_posts')
      expect(toolNames).toContain('get_post')
      expect(toolNames).toContain('update_post')
      expect(toolNames).toContain('delete_post')
    })

    it('should include field schemas in create tool', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })
      const tools = server.listTools()
      const createUser = tools.find((t) => t.name === 'create_user')

      expect(createUser).toBeDefined()
      expect(createUser!.inputSchema.properties).toHaveProperty('name')
      expect(createUser!.inputSchema.properties).toHaveProperty('email')
      expect(createUser!.inputSchema.properties).toHaveProperty('role')
      expect(createUser!.inputSchema.required).toContain('name')
      expect(createUser!.inputSchema.required).toContain('email')
    })

    it('should include proper descriptions for tools', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })
      const tools = server.listTools()

      const createUser = tools.find((t) => t.name === 'create_user')
      expect(createUser!.description).toContain('Create')
      expect(createUser!.description).toContain('User')

      const listPosts = tools.find((t) => t.name === 'list_posts')
      expect(listPosts!.description).toContain('List')
      expect(listPosts!.description).toContain('Post')
    })
  })

  describe('resource listing', () => {
    it('should list all available resources', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })
      const resources = server.listResources()

      expect(resources.length).toBeGreaterThanOrEqual(2)

      const uris = resources.map((r) => r.uri)
      expect(uris).toContain('resource://testapp/users')
      expect(uris).toContain('resource://testapp/posts')
    })

    it('should include resource metadata', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })
      const resources = server.listResources()

      const usersResource = resources.find((r) => r.uri.includes('users'))
      expect(usersResource).toBeDefined()
      expect(usersResource!.name).toBe('User')
      expect(usersResource!.mimeType).toBe('application/json')
    })
  })

  describe('tool execution', () => {
    describe('create operations', () => {
      it('should create a new record', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        const result = await server.callTool('create_user', {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
        })

        expect(result).toBeDefined()
        expect((result as any).id).toBeDefined()
        expect((result as any).name).toBe('John Doe')
      })

      it('should validate required fields', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        await expect(
          server.callTool('create_user', {
            name: 'John', // missing required email
          })
        ).rejects.toThrow(/email.*required/i)
      })

      it('should validate field types', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        await expect(
          server.callTool('create_post', {
            title: 'Test',
            views: 'not-a-number', // should be number
          })
        ).rejects.toThrow(/views.*number/i)
      })
    })

    describe('list operations', () => {
      it('should list all records', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        // Create some records first
        await store.create('User', { name: 'Alice', email: 'alice@example.com' })
        await store.create('User', { name: 'Bob', email: 'bob@example.com' })

        const result = await server.callTool('list_users', {})
        expect(Array.isArray(result)).toBe(true)
        expect((result as any[]).length).toBe(2)
      })

      it('should return empty array for no records', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        const result = await server.callTool('list_posts', {})
        expect(result).toEqual([])
      })
    })

    describe('get operations', () => {
      it('should get a record by id', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        const created = await store.create('User', { name: 'John', email: 'john@example.com' })

        const result = await server.callTool('get_user', { id: created.id })
        expect((result as any).id).toBe(created.id)
        expect((result as any).name).toBe('John')
      })

      it('should return null for non-existent record', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        const result = await server.callTool('get_user', { id: 'non-existent' })
        expect(result).toBeNull()
      })
    })

    describe('update operations', () => {
      it('should update a record', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        const created = await store.create('User', { name: 'John', email: 'john@example.com' })

        const result = await server.callTool('update_user', {
          id: created.id,
          name: 'Jane',
        })

        expect((result as any).name).toBe('Jane')
        expect((result as any).email).toBe('john@example.com') // Preserved
      })

      it('should throw for non-existent record', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        await expect(
          server.callTool('update_user', { id: 'non-existent', name: 'Test' })
        ).rejects.toThrow(/not found/i)
      })
    })

    describe('delete operations', () => {
      it('should delete a record', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        const created = await store.create('User', { name: 'John', email: 'john@example.com' })
        await server.callTool('delete_user', { id: created.id })

        const retrieved = await store.get('User', created.id)
        expect(retrieved).toBeNull()
      })

      it('should not throw for non-existent record', async () => {
        const store = new MemoryStore()
        const server = createMCPServer({
          app: createTestApp(),
          store,
        })

        await expect(
          server.callTool('delete_user', { id: 'non-existent' })
        ).resolves.toBeUndefined()
      })
    })
  })

  describe('resource reading', () => {
    it('should read resource schema', async () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })

      const result = await server.readResource('resource://testapp/users')
      expect(result.contents).toBeDefined()
      expect((result.contents as any).name).toBe('User')
      expect((result.contents as any).fields).toBeDefined()
    })

    it('should read resource data', async () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })

      await store.create('User', { name: 'Alice', email: 'alice@example.com' })

      const result = await server.readResource('resource://testapp/users/data')
      expect(Array.isArray((result as any).contents)).toBe(true)
    })

    it('should throw for invalid resource URI', async () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })

      await expect(server.readResource('resource://testapp/invalid')).rejects.toThrow()
    })
  })

  describe('tool validation', () => {
    it('should reject unknown tool names', async () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })

      await expect(server.callTool('unknown_tool', {})).rejects.toThrow(/unknown tool/i)
    })

    it('should validate select field values', async () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })

      await expect(
        server.callTool('create_user', {
          name: 'John',
          email: 'john@example.com',
          role: 'superadmin', // Not in allowed values
        })
      ).rejects.toThrow(/role.*invalid/i)
    })
  })

  describe('error handling', () => {
    it('should return structured errors', async () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })

      try {
        await server.callTool('create_user', {
          name: 'John',
          // Missing required email
        })
        expect(true).toBe(false) // Should not reach
      } catch (error: any) {
        expect(error.code).toBeDefined()
        expect(error.message).toBeDefined()
      }
    })

    it('should handle store errors gracefully', async () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })

      // Force an error by updating non-existent
      await expect(
        server.callTool('update_user', { id: 'fake', name: 'Test' })
      ).rejects.toThrow()
    })
  })

  describe('MCP protocol compliance', () => {
    it('should generate valid JSON schemas for tools', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })
      const tools = server.listTools()

      for (const tool of tools) {
        expect(tool.inputSchema.type).toBe('object')
        expect(typeof tool.inputSchema.properties).toBe('object')
        if (tool.inputSchema.required) {
          expect(Array.isArray(tool.inputSchema.required)).toBe(true)
        }
      }
    })

    it('should use proper URI format for resources', () => {
      const store = new MemoryStore()
      const server = createMCPServer({
        app: createTestApp(),
        store,
      })
      const resources = server.listResources()

      for (const resource of resources) {
        expect(resource.uri).toMatch(/^resource:\/\//)
      }
    })
  })
})
