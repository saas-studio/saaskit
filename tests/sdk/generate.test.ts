/**
 * SDK Generation Tests
 *
 * Tests for generating typed client SDKs from Schema AST.
 */

import { describe, it, expect } from 'bun:test'
import { createAppNode, createResourceNode, createFieldNode } from '../../src/schema/ast'
import { generateSDK, generateSDKTypes, generateSDKClient } from '../../src/sdk/generate'

describe('SDK Generation', () => {
  describe('full SDK generation', () => {
    it('should generate complete SDK', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [
          createFieldNode('name', 'text'),
          createFieldNode('email', 'email'),
        ]),
      ])

      const result = generateSDK(app)

      expect(result.success).toBe(true)
      expect(result.files).toBeDefined()
      expect(result.files.length).toBeGreaterThan(0)
    })

    it('should include types file', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDK(app)
      const typesFile = result.files.find((f) => f.name === 'types.ts')

      expect(typesFile).toBeDefined()
      expect(typesFile?.content).toContain('interface User')
    })

    it('should include client file', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDK(app)
      const clientFile = result.files.find((f) => f.name === 'client.ts')

      expect(clientFile).toBeDefined()
      expect(clientFile?.content).toContain('class')
    })

    it('should include index file', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDK(app)
      const indexFile = result.files.find((f) => f.name === 'index.ts')

      expect(indexFile).toBeDefined()
      expect(indexFile?.content).toContain('export')
    })
  })

  describe('type generation', () => {
    it('should generate types for all resources', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
        createResourceNode('Post', [createFieldNode('title', 'text')]),
      ])

      const result = generateSDKTypes(app)

      expect(result).toContain('interface User')
      expect(result).toContain('interface Post')
    })

    it('should generate input types for create/update', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [
          createFieldNode('name', 'text'),
          createFieldNode('email', 'email'),
        ]),
      ])

      const result = generateSDKTypes(app)

      expect(result).toContain('interface CreateUserInput')
      expect(result).toContain('interface UpdateUserInput')
    })

    it('should make update input fields optional', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDKTypes(app)

      // UpdateUserInput should have optional name
      expect(result).toContain('UpdateUserInput')
      expect(result).toMatch(/UpdateUserInput[\s\S]*name\?/)
    })

    it('should generate list response type', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDKTypes(app)

      expect(result).toContain('UserListResponse')
      expect(result).toContain('data: User[]')
    })
  })

  describe('client generation', () => {
    it('should generate client class', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDKClient(app)

      expect(result).toContain('class MyAppClient')
    })

    it('should include base URL configuration', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ], { baseUrl: 'https://api.example.com' })

      const result = generateSDKClient(app)

      expect(result).toContain('baseUrl')
    })

    it('should generate resource methods', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDKClient(app)

      expect(result).toContain('users')
    })

    it('should generate CRUD methods for each resource', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDKClient(app)

      expect(result).toContain('list(')
      expect(result).toContain('get(')
      expect(result).toContain('create(')
      expect(result).toContain('update(')
      expect(result).toContain('delete(')
    })

    it('should include proper TypeScript types in methods', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDKClient(app)

      expect(result).toContain('Promise<User>')
      expect(result).toContain('CreateUserInput')
    })

    it('should generate multiple resource clients', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
        createResourceNode('Post', [createFieldNode('title', 'text')]),
      ])

      const result = generateSDKClient(app)

      expect(result).toContain('users')
      expect(result).toContain('posts')
    })
  })

  describe('package configuration', () => {
    it('should generate package.json', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDK(app)
      const packageFile = result.files.find((f) => f.name === 'package.json')

      expect(packageFile).toBeDefined()
    })

    it('should include correct package name', () => {
      const app = createAppNode('my-crm', [
        createResourceNode('Contact', [createFieldNode('name', 'text')]),
      ])

      const result = generateSDK(app)
      const packageFile = result.files.find((f) => f.name === 'package.json')
      const pkg = JSON.parse(packageFile!.content)

      expect(pkg.name).toBe('@my-crm/sdk')
    })

    it('should include version from app', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ], { version: '2.0.0' })

      const result = generateSDK(app)
      const packageFile = result.files.find((f) => f.name === 'package.json')
      const pkg = JSON.parse(packageFile!.content)

      expect(pkg.version).toBe('2.0.0')
    })
  })

  describe('error handling', () => {
    it('should handle app with no resources', () => {
      const app = createAppNode('empty-app', [])

      const result = generateSDK(app)

      expect(result.success).toBe(true)
    })

    it('should handle resource with no fields', () => {
      const app = createAppNode('my-app', [
        createResourceNode('Empty', []),
      ])

      const result = generateSDK(app)

      expect(result.success).toBe(true)
    })
  })
})
