/**
 * Schema AST Tests
 */

import { describe, it, expect } from 'bun:test'
import React from 'react'
import {
  normalizeName,
  toDisplayName,
  pluralize,
  parseFieldType,
  createFieldNode,
  createResourceNode,
  createAppNode,
  parseJSXToAST,
  validateAST,
  serializeAST,
  deserializeAST,
  type FieldType,
  type AppNode,
} from '../../src/schema/ast'
import { App } from '../../src/schema/App'
import { Resource } from '../../src/schema/Resource'
import { Text, Number as NumberField, Select, Boolean as BooleanField } from '../../src/schema/fields'

describe('Schema AST', () => {
  describe('Helper Functions', () => {
    describe('normalizeName', () => {
      it('converts camelCase to kebab-case', () => {
        expect(normalizeName('myApp')).toBe('my-app')
        expect(normalizeName('TodoList')).toBe('todo-list')
      })

      it('converts snake_case to kebab-case', () => {
        expect(normalizeName('my_app')).toBe('my-app')
        expect(normalizeName('todo_list')).toBe('todo-list')
      })

      it('converts spaces to hyphens', () => {
        expect(normalizeName('My App')).toBe('my-app')
        expect(normalizeName('Todo List')).toBe('todo-list')
      })

      it('lowercases the result', () => {
        expect(normalizeName('MyAPP')).toBe('my-app')
        expect(normalizeName('TODOS')).toBe('todos')
      })

      it('handles already normalized names', () => {
        expect(normalizeName('my-app')).toBe('my-app')
        expect(normalizeName('todos')).toBe('todos')
      })
    })

    describe('toDisplayName', () => {
      it('converts kebab-case to Title Case', () => {
        expect(toDisplayName('my-app')).toBe('My App')
        expect(toDisplayName('todo-list')).toBe('Todo List')
      })

      it('converts snake_case to Title Case', () => {
        expect(toDisplayName('my_app')).toBe('My App')
      })

      it('handles single words', () => {
        expect(toDisplayName('todos')).toBe('Todos')
      })
    })

    describe('pluralize', () => {
      it('adds s to regular nouns', () => {
        expect(pluralize('Task')).toBe('Tasks')
        expect(pluralize('User')).toBe('Users')
      })

      it('adds es to nouns ending in s, x, ch, sh', () => {
        expect(pluralize('Class')).toBe('Classes')
        expect(pluralize('Box')).toBe('Boxes')
        expect(pluralize('Match')).toBe('Matches')
        expect(pluralize('Wish')).toBe('Wishes')
      })

      it('changes y to ies for consonant+y endings', () => {
        expect(pluralize('Category')).toBe('Categories')
        expect(pluralize('Country')).toBe('Countries')
      })

      it('preserves y for vowel+y endings', () => {
        expect(pluralize('Key')).toBe('Keys')
        expect(pluralize('Day')).toBe('Days')
      })
    })

    describe('parseFieldType', () => {
      it('parses number types', () => {
        expect(parseFieldType('number').type).toBe('number')
        expect(parseFieldType('int').type).toBe('number')
        expect(parseFieldType('integer').type).toBe('number')
      })

      it('parses decimal as number with modifier', () => {
        const result = parseFieldType('decimal')
        expect(result.type).toBe('number')
        expect(result.modifiers.decimal).toBe(true)
      })

      it('parses boolean types', () => {
        expect(parseFieldType('bool').type).toBe('boolean')
        expect(parseFieldType('boolean').type).toBe('boolean')
      })

      it('parses date types', () => {
        expect(parseFieldType('date').type).toBe('date')
        expect(parseFieldType('datetime').type).toBe('date')
        expect(parseFieldType('timestamp').type).toBe('date')
      })

      it('parses special string types', () => {
        expect(parseFieldType('email').type).toBe('email')
        expect(parseFieldType('url').type).toBe('url')
        expect(parseFieldType('phone').type).toBe('phone')
        expect(parseFieldType('password').type).toBe('password')
      })

      it('parses auto types', () => {
        const result = parseFieldType('auto')
        expect(result.modifiers.auto).toBe(true)
      })
    })
  })

  describe('Node Factories', () => {
    describe('createFieldNode', () => {
      it('creates a field with name and type', () => {
        const field = createFieldNode('email', 'email')
        expect(field.kind).toBe('field')
        expect(field.name).toBe('email')
        expect(field.type).toBe('email')
      })

      it('includes modifiers', () => {
        const field = createFieldNode('email', 'email', {
          modifiers: { required: true, unique: true },
        })
        expect(field.modifiers.required).toBe(true)
        expect(field.modifiers.unique).toBe(true)
      })

      it('includes optional properties', () => {
        const field = createFieldNode('status', 'select', {
          values: ['open', 'closed'],
          default: 'open',
        })
        expect(field.values).toEqual(['open', 'closed'])
        expect(field.default).toBe('open')
      })
    })

    describe('createResourceNode', () => {
      it('creates a resource with name and fields', () => {
        const fields = [createFieldNode('title', 'text')]
        const resource = createResourceNode('Task', fields)

        expect(resource.kind).toBe('resource')
        expect(resource.name).toBe('Task')
        expect(resource.fields).toEqual(fields)
      })

      it('generates pluralName from name', () => {
        const resource = createResourceNode('Task', [])
        expect(resource.pluralName).toBe('Tasks')
      })

      it('generates path from name', () => {
        const resource = createResourceNode('Task', [])
        expect(resource.path).toBe('/tasks')
      })

      it('generates displayName from name', () => {
        const resource = createResourceNode('TodoItem', [])
        expect(resource.displayName).toBe('Todo Item')
      })
    })

    describe('createAppNode', () => {
      it('creates an app with name and resources', () => {
        const resources = [createResourceNode('Task', [])]
        const app = createAppNode('todos', resources)

        expect(app.kind).toBe('app')
        expect(app.name).toBe('todos')
        expect(app.resources).toEqual(resources)
      })

      it('normalizes app name', () => {
        const app = createAppNode('MyApp', [])
        expect(app.name).toBe('my-app')
      })

      it('generates displayName', () => {
        const app = createAppNode('my-crm', [])
        expect(app.displayName).toBe('My Crm')
      })

      it('sets default version', () => {
        const app = createAppNode('app', [])
        expect(app.version).toBe('0.1.0')
      })

      it('sets default description', () => {
        const app = createAppNode('my-app', [])
        expect(app.description).toBe('My App - A SaaSkit application')
      })

      it('sets default baseUrl', () => {
        const app = createAppNode('app', [])
        expect(app.baseUrl).toBe('http://localhost:3000')
      })

      it('sets all targets enabled by default', () => {
        const app = createAppNode('app', [])
        expect(app.targets.cli).toBe(true)
        expect(app.targets.api).toBe(true)
        expect(app.targets.sdk).toBe(true)
        expect(app.targets.mcp).toBe(true)
      })
    })
  })

  describe('JSX Parsing', () => {
    it('parses a simple app', () => {
      const element = (
        <App name="todos" version="1.0.0">
          <Resource name="Task">
            <Text name="title" required />
          </Resource>
        </App>
      )

      const result = parseJSXToAST(element)

      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
      expect(result.ast!.name).toBe('todos')
      expect(result.ast!.version).toBe('1.0.0')
    })

    it('parses resources from children', () => {
      const element = (
        <App name="todos">
          <Resource name="Task">
            <Text name="title" />
          </Resource>
          <Resource name="User">
            <Text name="email" />
          </Resource>
        </App>
      )

      const result = parseJSXToAST(element)

      expect(result.ast!.resources).toHaveLength(2)
      expect(result.ast!.resources[0].name).toBe('Task')
      expect(result.ast!.resources[1].name).toBe('User')
    })

    it('parses fields from resource children', () => {
      const element = (
        <App name="todos">
          <Resource name="Task">
            <Text name="title" required />
            <BooleanField name="done" />
            <NumberField name="priority" />
          </Resource>
        </App>
      )

      const result = parseJSXToAST(element)

      const fields = result.ast!.resources[0].fields
      expect(fields).toHaveLength(3)
      expect(fields[0].name).toBe('title')
      expect(fields[0].modifiers.required).toBe(true)
      expect(fields[1].name).toBe('done')
      expect(fields[2].name).toBe('priority')
    })

    it('parses select field with values', () => {
      const element = (
        <App name="todos">
          <Resource name="Task">
            <Select name="status" values={['open', 'done']} />
          </Resource>
        </App>
      )

      const result = parseJSXToAST(element)

      const field = result.ast!.resources[0].fields[0]
      expect(field.name).toBe('status')
      expect(field.type).toBe('select')
      expect(field.values).toEqual(['open', 'done'])
    })

    it('uses app targets when specified', () => {
      const element = <App name="test" targets={{ cli: true, api: true, sdk: false, mcp: false }} />

      const result = parseJSXToAST(element)

      expect(result.ast!.targets.cli).toBe(true)
      expect(result.ast!.targets.api).toBe(true)
      expect(result.ast!.targets.sdk).toBe(false)
      expect(result.ast!.targets.mcp).toBe(false)
    })
  })

  describe('Validation', () => {
    it('validates app name is required', () => {
      const ast: AppNode = {
        kind: 'app',
        name: '',
        displayName: '',
        version: '1.0.0',
        description: '',
        baseUrl: '',
        targets: { cli: true, api: true, sdk: true, mcp: true },
        resources: [],
      }

      const errors = validateAST(ast)
      expect(errors.some((e) => e.message.includes('App name'))).toBe(true)
    })

    it('validates resource names are required', () => {
      const ast = createAppNode('test', [createResourceNode('', [])])

      const errors = validateAST(ast)
      expect(errors.some((e) => e.message.includes('Resource name'))).toBe(true)
    })

    it('validates relation targets exist', () => {
      const ast = createAppNode('test', [
        createResourceNode('Task', [createFieldNode('owner', 'relation', { target: 'User' })]),
      ])

      const errors = validateAST(ast)
      expect(errors.some((e) => e.message.includes('unknown resource'))).toBe(true)
    })

    it('validates select fields have values', () => {
      const ast = createAppNode('test', [createResourceNode('Task', [createFieldNode('status', 'select')])])

      const errors = validateAST(ast)
      expect(errors.some((e) => e.message.includes('at least one value'))).toBe(true)
    })

    it('passes for valid AST', () => {
      const ast = createAppNode('test', [
        createResourceNode('Task', [
          createFieldNode('title', 'text', { modifiers: { required: true } }),
          createFieldNode('status', 'select', { values: ['open', 'done'] }),
        ]),
      ])

      const errors = validateAST(ast)
      expect(errors).toHaveLength(0)
    })
  })

  describe('Serialization', () => {
    it('serializes AST to JSON', () => {
      const ast = createAppNode('test', [createResourceNode('Task', [createFieldNode('title', 'text')])])

      const json = serializeAST(ast)
      const parsed = JSON.parse(json)

      expect(parsed.kind).toBe('app')
      expect(parsed.name).toBe('test')
    })

    it('deserializes JSON to AST', () => {
      const ast = createAppNode('test', [createResourceNode('Task', [createFieldNode('title', 'text')])])

      const json = serializeAST(ast)
      const result = deserializeAST(json)

      expect(result.success).toBe(true)
      expect(result.ast!.name).toBe('test')
    })

    it('reports errors for invalid JSON', () => {
      const result = deserializeAST('not valid json')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('validates deserialized AST', () => {
      const invalidAst = { kind: 'app', name: '', resources: [] }
      const json = JSON.stringify(invalidAst)

      const result = deserializeAST(json)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })
})
