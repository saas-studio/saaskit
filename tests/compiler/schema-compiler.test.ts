/**
 * Schema Compiler Tests
 *
 * Tests for compiling Schema AST to various output formats.
 */

import { describe, it, expect } from 'bun:test'
import { createAppNode, createResourceNode, createFieldNode } from '../../src/schema/ast'
import { compileToTypeScript, compileToJSON, compileToOpenAPI } from '../../src/compiler/schema-compiler'

describe('Schema Compiler', () => {
  describe('TypeScript generation', () => {
    it('should generate interface for simple resource', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [
          createFieldNode('name', 'text'),
          createFieldNode('email', 'email'),
        ]),
      ])

      const result = compileToTypeScript(app)

      expect(result.success).toBe(true)
      expect(result.code).toContain('interface User')
      expect(result.code).toContain('name: string')
      expect(result.code).toContain('email: string')
    })

    it('should generate types for number fields', () => {
      const app = createAppNode('test-app', [
        createResourceNode('Product', [
          createFieldNode('price', 'number'),
          createFieldNode('quantity', 'number'),
        ]),
      ])

      const result = compileToTypeScript(app)

      expect(result.code).toContain('price: number')
      expect(result.code).toContain('quantity: number')
    })

    it('should generate types for boolean fields', () => {
      const app = createAppNode('test-app', [
        createResourceNode('Task', [
          createFieldNode('completed', 'boolean'),
        ]),
      ])

      const result = compileToTypeScript(app)

      expect(result.code).toContain('completed: boolean')
    })

    it('should generate types for date fields', () => {
      const app = createAppNode('test-app', [
        createResourceNode('Event', [
          createFieldNode('startDate', 'date'),
        ]),
      ])

      const result = compileToTypeScript(app)

      expect(result.code).toContain('startDate: Date')
    })

    it('should generate optional fields', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [
          createFieldNode('name', 'text', { modifiers: { required: true } }),
          createFieldNode('bio', 'text', { modifiers: { optional: true } }),
        ]),
      ])

      const result = compileToTypeScript(app)

      expect(result.code).toContain('name: string')
      expect(result.code).toContain('bio?: string')
    })

    it('should generate select types as union', () => {
      const app = createAppNode('test-app', [
        createResourceNode('Task', [
          createFieldNode('status', 'select', { values: ['todo', 'in_progress', 'done'] }),
        ]),
      ])

      const result = compileToTypeScript(app)

      expect(result.code).toContain("'todo' | 'in_progress' | 'done'")
    })

    it('should generate relation types', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
        createResourceNode('Post', [
          createFieldNode('title', 'text'),
          createFieldNode('authorId', 'relation', { target: 'User' }),
        ]),
      ])

      const result = compileToTypeScript(app)

      expect(result.code).toContain('authorId: string')
      expect(result.code).toContain('// Relation to User')
    })

    it('should generate multiple interfaces', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
        createResourceNode('Post', [createFieldNode('title', 'text')]),
        createResourceNode('Comment', [createFieldNode('body', 'text')]),
      ])

      const result = compileToTypeScript(app)

      expect(result.code).toContain('interface User')
      expect(result.code).toContain('interface Post')
      expect(result.code).toContain('interface Comment')
    })

    it('should include auto-generated id field', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = compileToTypeScript(app)

      expect(result.code).toContain('id: string')
    })
  })

  describe('JSON Schema generation', () => {
    it('should generate valid JSON schema', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [
          createFieldNode('name', 'text'),
          createFieldNode('age', 'number'),
        ]),
      ])

      const result = compileToJSON(app)

      expect(result.success).toBe(true)
      expect(result.schema).toBeDefined()
      expect(result.schema.$schema).toBe('http://json-schema.org/draft-07/schema#')
    })

    it('should include resource definitions', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = compileToJSON(app)

      expect(result.schema.definitions?.User).toBeDefined()
      expect(result.schema.definitions?.User.properties?.name).toBeDefined()
    })

    it('should map types correctly', () => {
      const app = createAppNode('test-app', [
        createResourceNode('Test', [
          createFieldNode('text', 'text'),
          createFieldNode('num', 'number'),
          createFieldNode('bool', 'boolean'),
          createFieldNode('email', 'email'),
        ]),
      ])

      const result = compileToJSON(app)
      const props = result.schema.definitions?.Test.properties

      expect(props?.text.type).toBe('string')
      expect(props?.num.type).toBe('number')
      expect(props?.bool.type).toBe('boolean')
      expect(props?.email.type).toBe('string')
      expect(props?.email.format).toBe('email')
    })

    it('should include required fields', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [
          createFieldNode('name', 'text', { modifiers: { required: true } }),
          createFieldNode('bio', 'text'),
        ]),
      ])

      const result = compileToJSON(app)
      const required = result.schema.definitions?.User.required

      expect(required).toContain('name')
      expect(required).not.toContain('bio')
    })

    it('should generate enum for select fields', () => {
      const app = createAppNode('test-app', [
        createResourceNode('Task', [
          createFieldNode('status', 'select', { values: ['open', 'closed'] }),
        ]),
      ])

      const result = compileToJSON(app)
      const status = result.schema.definitions?.Task.properties?.status

      expect(status.enum).toEqual(['open', 'closed'])
    })
  })

  describe('OpenAPI generation', () => {
    it('should generate OpenAPI 3.0 spec', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = compileToOpenAPI(app)

      expect(result.success).toBe(true)
      expect(result.spec).toBeDefined()
      expect(result.spec.openapi).toBe('3.0.0')
    })

    it('should include app info', () => {
      const app = createAppNode('my-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ], { description: 'My awesome app' })

      const result = compileToOpenAPI(app)

      expect(result.spec.info.title).toBe('My App')
      expect(result.spec.info.description).toBe('My awesome app')
    })

    it('should generate CRUD paths for resources', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [createFieldNode('name', 'text')]),
      ])

      const result = compileToOpenAPI(app)
      const paths = result.spec.paths

      expect(paths['/users']).toBeDefined()
      expect(paths['/users'].get).toBeDefined() // list
      expect(paths['/users'].post).toBeDefined() // create
      expect(paths['/users/{id}']).toBeDefined()
      expect(paths['/users/{id}'].get).toBeDefined() // get
      expect(paths['/users/{id}'].put).toBeDefined() // update
      expect(paths['/users/{id}'].delete).toBeDefined() // delete
    })

    it('should include component schemas', () => {
      const app = createAppNode('test-app', [
        createResourceNode('User', [
          createFieldNode('name', 'text'),
          createFieldNode('email', 'email'),
        ]),
      ])

      const result = compileToOpenAPI(app)

      expect(result.spec.components?.schemas?.User).toBeDefined()
      expect(result.spec.components?.schemas?.User.properties?.name).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should handle empty resources', () => {
      const app = createAppNode('test-app', [])

      const tsResult = compileToTypeScript(app)
      const jsonResult = compileToJSON(app)

      expect(tsResult.success).toBe(true)
      expect(jsonResult.success).toBe(true)
    })

    it('should handle resource with no fields', () => {
      const app = createAppNode('test-app', [
        createResourceNode('Empty', []),
      ])

      const result = compileToTypeScript(app)

      expect(result.success).toBe(true)
      expect(result.code).toContain('interface Empty')
    })
  })
})
