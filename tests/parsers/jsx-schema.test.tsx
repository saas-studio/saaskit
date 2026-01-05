/**
 * JSX Schema Parser Tests
 *
 * Tests for parsing JSX schema definitions into AST.
 */

import { describe, it, expect } from 'bun:test'
import React from 'react'
import {
  parseJSXToAST,
  createAppNode,
  createResourceNode,
  createFieldNode,
} from '../../src/schema/ast'
import { App } from '../../src/schema/App'
import { Resource } from '../../src/schema/Resource'
import {
  Text,
  Number as NumberField,
  Boolean as BooleanField,
  Date as DateField,
  Select,
  Relation,
} from '../../src/schema/fields'

describe('JSX Schema Parser', () => {
  describe('app parsing', () => {
    it('should parse app name', () => {
      const element = <App name="todos" />
      const result = parseJSXToAST(element)

      expect(result.success).toBe(true)
      expect(result.ast?.name).toBe('todos')
    })

    it('should normalize app name', () => {
      const element = <App name="MyApp" />
      const result = parseJSXToAST(element)

      expect(result.ast?.name).toBe('my-app')
    })

    it('should parse app version', () => {
      const element = <App name="test" version="1.2.3" />
      const result = parseJSXToAST(element)

      expect(result.ast?.version).toBe('1.2.3')
    })

    it('should use default version when not provided', () => {
      const element = <App name="test" />
      const result = parseJSXToAST(element)

      expect(result.ast?.version).toBe('0.1.0')
    })

    it('should parse app description', () => {
      const element = <App name="test" description="Test application" />
      const result = parseJSXToAST(element)

      expect(result.ast?.description).toBe('Test application')
    })

    it('should generate default description', () => {
      const element = <App name="my-app" />
      const result = parseJSXToAST(element)

      expect(result.ast?.description).toContain('My App')
    })

    it('should parse baseUrl', () => {
      const element = <App name="test" baseUrl="https://api.example.com" />
      const result = parseJSXToAST(element)

      expect(result.ast?.baseUrl).toBe('https://api.example.com')
    })

    it('should use default baseUrl', () => {
      const element = <App name="test" />
      const result = parseJSXToAST(element)

      expect(result.ast?.baseUrl).toBe('http://localhost:3000')
    })

    it('should parse targets configuration', () => {
      const element = <App name="test" targets={{ cli: true, api: true, sdk: false, mcp: false }} />
      const result = parseJSXToAST(element)

      expect(result.ast?.targets.cli).toBe(true)
      expect(result.ast?.targets.api).toBe(true)
      expect(result.ast?.targets.sdk).toBe(false)
      expect(result.ast?.targets.mcp).toBe(false)
    })

    it('should default all targets to enabled', () => {
      const element = <App name="test" />
      const result = parseJSXToAST(element)

      expect(result.ast?.targets.cli).toBe(true)
      expect(result.ast?.targets.api).toBe(true)
      expect(result.ast?.targets.sdk).toBe(true)
      expect(result.ast?.targets.mcp).toBe(true)
    })

    it('should generate displayName', () => {
      const element = <App name="my-crm" />
      const result = parseJSXToAST(element)

      expect(result.ast?.displayName).toBe('My Crm')
    })
  })

  describe('resource parsing', () => {
    it('should parse single resource', () => {
      const element = (
        <App name="test">
          <Resource name="User" />
        </App>
      )
      const result = parseJSXToAST(element)

      expect(result.ast?.resources).toHaveLength(1)
      expect(result.ast?.resources[0].name).toBe('User')
    })

    it('should parse multiple resources', () => {
      const element = (
        <App name="test">
          <Resource name="User" />
          <Resource name="Post" />
          <Resource name="Comment" />
        </App>
      )
      const result = parseJSXToAST(element)

      expect(result.ast?.resources).toHaveLength(3)
      expect(result.ast?.resources.map((r) => r.name)).toEqual(['User', 'Post', 'Comment'])
    })

    it('should generate resource path', () => {
      const element = (
        <App name="test">
          <Resource name="User" />
        </App>
      )
      const result = parseJSXToAST(element)

      expect(result.ast?.resources[0].path).toBe('/users')
    })

    it('should use custom resource path', () => {
      const element = (
        <App name="test">
          <Resource name="User" path="/api/users" />
        </App>
      )
      const result = parseJSXToAST(element)

      expect(result.ast?.resources[0].path).toBe('/api/users')
    })

    it('should generate pluralName', () => {
      const element = (
        <App name="test">
          <Resource name="Category" />
        </App>
      )
      const result = parseJSXToAST(element)

      expect(result.ast?.resources[0].pluralName).toBe('Categories')
    })

    it('should generate displayName', () => {
      const element = (
        <App name="test">
          <Resource name="BlogPost" />
        </App>
      )
      const result = parseJSXToAST(element)

      expect(result.ast?.resources[0].displayName).toBe('Blog Post')
    })
  })

  describe('field parsing', () => {
    describe('text fields', () => {
      it('should parse text field', () => {
        const element = (
          <App name="test">
            <Resource name="User">
              <Text name="name" />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const field = result.ast?.resources[0].fields[0]

        expect(field?.name).toBe('name')
        expect(field?.type).toBe('text')
      })

      it('should parse required text field', () => {
        const element = (
          <App name="test">
            <Resource name="User">
              <Text name="name" required />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const field = result.ast?.resources[0].fields[0]

        expect(field?.modifiers.required).toBe(true)
      })

      it('should parse unique text field', () => {
        const element = (
          <App name="test">
            <Resource name="User">
              <Text name="email" unique />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const field = result.ast?.resources[0].fields[0]

        expect(field?.modifiers.unique).toBe(true)
      })
    })

    describe('number fields', () => {
      it('should parse number field', () => {
        const element = (
          <App name="test">
            <Resource name="Product">
              <NumberField name="quantity" />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const field = result.ast?.resources[0].fields[0]

        expect(field?.name).toBe('quantity')
        expect(field?.type).toBe('number')
      })

      it('should parse decimal number field', () => {
        const element = (
          <App name="test">
            <Resource name="Product">
              <NumberField name="price" decimal />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const field = result.ast?.resources[0].fields[0]

        expect(field?.modifiers.decimal).toBe(true)
      })
    })

    describe('boolean fields', () => {
      it('should parse boolean field', () => {
        const element = (
          <App name="test">
            <Resource name="Task">
              <BooleanField name="done" />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const field = result.ast?.resources[0].fields[0]

        expect(field?.type).toBe('boolean')
      })
    })

    describe('date fields', () => {
      it('should parse date field', () => {
        const element = (
          <App name="test">
            <Resource name="Event">
              <DateField name="startDate" />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const field = result.ast?.resources[0].fields[0]

        expect(field?.type).toBe('date')
      })
    })

    describe('select fields', () => {
      it('should parse select field with values', () => {
        const element = (
          <App name="test">
            <Resource name="Task">
              <Select name="status" values={['todo', 'done']} />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const field = result.ast?.resources[0].fields[0]

        expect(field?.type).toBe('select')
        expect(field?.values).toEqual(['todo', 'done'])
      })

      it('should parse select field with options prop', () => {
        const element = (
          <App name="test">
            <Resource name="Task">
              <Select name="priority" options={['low', 'medium', 'high']} />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const field = result.ast?.resources[0].fields[0]

        expect(field?.values).toEqual(['low', 'medium', 'high'])
      })
    })

    describe('relation fields', () => {
      it('should parse relation field', () => {
        const element = (
          <App name="test">
            <Resource name="Post">
              <Relation name="author" target="User" />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const field = result.ast?.resources[0].fields[0]

        expect(field?.type).toBe('relation')
        expect(field?.target).toBe('User')
      })
    })

    describe('multiple fields', () => {
      it('should parse multiple fields in order', () => {
        const element = (
          <App name="test">
            <Resource name="User">
              <Text name="name" required />
              <Text name="email" required unique />
              <BooleanField name="active" />
            </Resource>
          </App>
        )
        const result = parseJSXToAST(element)
        const fields = result.ast?.resources[0].fields

        expect(fields).toHaveLength(3)
        expect(fields?.[0].name).toBe('name')
        expect(fields?.[1].name).toBe('email')
        expect(fields?.[2].name).toBe('active')
      })
    })
  })

  describe('complex schemas', () => {
    it('should parse a complete CRM schema', () => {
      const element = (
        <App name="crm" description="Customer Relationship Manager" version="2.0.0">
          <Resource name="Contact">
            <Text name="name" required />
            <Text name="email" required unique />
            <Text name="phone" />
            <Select name="status" values={['lead', 'customer', 'churned']} />
          </Resource>
          <Resource name="Deal">
            <Text name="title" required />
            <NumberField name="value" decimal />
            <Select name="stage" values={['prospecting', 'proposal', 'negotiation', 'closed']} />
            <Relation name="contact" target="Contact" />
          </Resource>
          <Resource name="Activity">
            <Text name="type" required />
            <Text name="notes" />
            <DateField name="scheduledAt" />
            <BooleanField name="completed" />
            <Relation name="contact" target="Contact" />
            <Relation name="deal" target="Deal" />
          </Resource>
        </App>
      )
      const result = parseJSXToAST(element)

      expect(result.success).toBe(true)
      expect(result.ast?.name).toBe('crm')
      expect(result.ast?.version).toBe('2.0.0')
      expect(result.ast?.resources).toHaveLength(3)

      // Verify Contact
      const contact = result.ast?.resources.find((r) => r.name === 'Contact')
      expect(contact?.fields).toHaveLength(4)
      expect(contact?.fields.find((f) => f.name === 'email')?.modifiers.unique).toBe(true)

      // Verify Deal
      const deal = result.ast?.resources.find((r) => r.name === 'Deal')
      expect(deal?.fields.find((f) => f.name === 'value')?.modifiers.decimal).toBe(true)
      expect(deal?.fields.find((f) => f.type === 'relation')?.target).toBe('Contact')

      // Verify Activity
      const activity = result.ast?.resources.find((r) => r.name === 'Activity')
      const relationFields = activity?.fields.filter((f) => f.type === 'relation')
      expect(relationFields).toHaveLength(2)
    })

    it('should parse a task management schema', () => {
      const element = (
        <App name="tasks" description="Task Management">
          <Resource name="Project">
            <Text name="name" required />
            <Text name="description" />
            <Select name="status" values={['active', 'completed', 'archived']} />
          </Resource>
          <Resource name="Task">
            <Text name="title" required />
            <Text name="description" />
            <Select name="priority" values={['low', 'medium', 'high', 'urgent']} />
            <Select name="status" values={['todo', 'in_progress', 'review', 'done']} />
            <BooleanField name="done" />
            <DateField name="dueDate" />
            <Relation name="project" target="Project" />
            <Relation name="assignee" target="User" />
          </Resource>
          <Resource name="User">
            <Text name="name" required />
            <Text name="email" required unique />
            <Select name="role" values={['admin', 'member', 'viewer']} />
          </Resource>
        </App>
      )
      const result = parseJSXToAST(element)

      expect(result.success).toBe(true)
      expect(result.ast?.resources).toHaveLength(3)

      const task = result.ast?.resources.find((r) => r.name === 'Task')
      expect(task?.fields.filter((f) => f.type === 'select')).toHaveLength(2)
      expect(task?.fields.filter((f) => f.type === 'relation')).toHaveLength(2)
    })
  })

  describe('error handling', () => {
    it('should handle empty app', () => {
      const element = <App name="empty" />
      const result = parseJSXToAST(element)

      expect(result.success).toBe(true)
      expect(result.ast?.resources).toHaveLength(0)
    })

    it('should handle resource without fields', () => {
      const element = (
        <App name="test">
          <Resource name="Empty" />
        </App>
      )
      const result = parseJSXToAST(element)

      expect(result.success).toBe(true)
      expect(result.ast?.resources[0].fields).toHaveLength(0)
    })
  })
})
