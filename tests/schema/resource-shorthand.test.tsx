import { describe, expect, test } from 'bun:test'
import React from 'react'

describe('Resource Shorthand Syntax', () => {
  describe('parseResourceProps', () => {
    test('parseResourceProps function exists', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      expect(parseResourceProps).toBeDefined()
      expect(typeof parseResourceProps).toBe('function')
    })

    test('parseResourceProps extracts field definitions from props', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', title: true }
      const fields = parseResourceProps(props)
      expect(fields).toBeDefined()
      expect(Array.isArray(fields)).toBe(true)
    })
  })

  describe('Required text field - <Task title />', () => {
    test('prop with true value creates required text field', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', title: true }
      const fields = parseResourceProps(props)

      const titleField = fields.find((f) => f.name === 'title')
      expect(titleField).toBeDefined()
      expect(titleField?.type).toBe('text')
      expect(titleField?.required).toBe(true)
    })

    test('first field in props becomes first field in output', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', title: true, description: true }
      const fields = parseResourceProps(props)

      expect(fields[0].name).toBe('title')
    })
  })

  describe('Optional text field - <Task description? />', () => {
    test('prop ending with ? creates optional text field', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'description?': true }
      const fields = parseResourceProps(props)

      const descField = fields.find((f) => f.name === 'description')
      expect(descField).toBeDefined()
      expect(descField?.type).toBe('text')
      expect(descField?.required).toBe(false)
    })

    test('? suffix is stripped from field name', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'notes?': true }
      const fields = parseResourceProps(props)

      expect(fields.find((f) => f.name === 'notes?')).toBeUndefined()
      expect(fields.find((f) => f.name === 'notes')).toBeDefined()
    })
  })

  describe('Boolean inference - <Task done />', () => {
    test('common boolean names infer boolean type', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const booleanNames = ['done', 'completed', 'active', 'enabled', 'visible', 'isAdmin', 'hasAccess']

      for (const boolName of booleanNames) {
        const props = { name: 'Task', [boolName]: true }
        const fields = parseResourceProps(props)
        const field = fields.find((f) => f.name === boolName)

        expect(field).toBeDefined()
        expect(field?.type).toBe('boolean')
      }
    })

    test('is* prefix infers boolean type', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', isPublished: true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'isPublished')
      expect(field?.type).toBe('boolean')
    })

    test('has* prefix infers boolean type', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', hasAttachments: true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'hasAttachments')
      expect(field?.type).toBe('boolean')
    })
  })

  describe('Select from options - <Task status="open | closed" />', () => {
    test('pipe-separated string creates select field', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', status: 'open | closed' }
      const fields = parseResourceProps(props)

      const statusField = fields.find((f) => f.name === 'status')
      expect(statusField).toBeDefined()
      expect(statusField?.type).toBe('select')
    })

    test('select field has parsed options', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', status: 'open | in_progress | closed' }
      const fields = parseResourceProps(props)

      const statusField = fields.find((f) => f.name === 'status')
      expect(statusField?.options).toEqual(['open', 'in_progress', 'closed'])
    })

    test('options are trimmed of whitespace', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', priority: '  low |  medium  | high  ' }
      const fields = parseResourceProps(props)

      const priorityField = fields.find((f) => f.name === 'priority')
      expect(priorityField?.options).toEqual(['low', 'medium', 'high'])
    })
  })

  describe('Explicit typed field - <Task priority:number />', () => {
    test('colon notation specifies explicit type', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'priority:number': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'priority')
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
    })

    test('supports text type explicitly', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'notes:text': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'notes')
      expect(field?.type).toBe('text')
    })

    test('supports date type', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'dueDate:date': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'dueDate')
      expect(field?.type).toBe('date')
    })

    test('supports datetime type', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'scheduledAt:datetime': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'scheduledAt')
      expect(field?.type).toBe('datetime')
    })

    test('supports email type', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'User', 'contact:email': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'contact')
      expect(field?.type).toBe('email')
    })

    test('supports url type', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Link', 'href:url': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'href')
      expect(field?.type).toBe('url')
    })
  })

  describe('Single relation - <Task assignee->User />', () => {
    test('arrow notation creates relation field', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'assignee->User': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'assignee')
      expect(field).toBeDefined()
      expect(field?.type).toBe('relation')
    })

    test('relation field has target resource', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'assignee->User': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'assignee')
      expect(field?.relation).toBeDefined()
      expect(field?.relation?.target).toBe('User')
    })

    test('single relation has many: false', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'assignee->User': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'assignee')
      expect(field?.relation?.many).toBe(false)
    })
  })

  describe('Many relation - <Task tags->Tag[] />', () => {
    test('array notation creates many relation', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'tags->Tag[]': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'tags')
      expect(field).toBeDefined()
      expect(field?.type).toBe('relation')
    })

    test('many relation has many: true', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'tags->Tag[]': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'tags')
      expect(field?.relation?.many).toBe(true)
    })

    test('many relation target strips [] suffix', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'comments->Comment[]': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'comments')
      expect(field?.relation?.target).toBe('Comment')
    })
  })

  describe('Auto-generated field - <Task createdAt:auto />', () => {
    test('auto type creates auto-generated field', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'createdAt:auto': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'createdAt')
      expect(field).toBeDefined()
      expect(field?.auto).toBe(true)
    })

    test('auto field is not required (system-managed)', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'createdAt:auto': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'createdAt')
      expect(field?.required).toBe(false)
    })

    test('auto field infers datetime type for timestamp names', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'createdAt:auto': true, 'updatedAt:auto': true }
      const fields = parseResourceProps(props)

      const createdAt = fields.find((f) => f.name === 'createdAt')
      const updatedAt = fields.find((f) => f.name === 'updatedAt')
      expect(createdAt?.type).toBe('datetime')
      expect(updatedAt?.type).toBe('datetime')
    })
  })

  describe('Unique constraint - <Task email:unique />', () => {
    test('unique modifier creates unique constraint', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'User', 'email:unique': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'email')
      expect(field).toBeDefined()
      expect(field?.unique).toBe(true)
    })

    test('unique field infers type from name when possible', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'User', 'email:unique': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'email')
      expect(field?.type).toBe('email')
    })

    test('unique can be combined with explicit type', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'User', 'slug:text:unique': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'slug')
      expect(field?.type).toBe('text')
      expect(field?.unique).toBe(true)
    })
  })

  describe('Combined modifiers', () => {
    test('optional + explicit type', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'dueDate?:date': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'dueDate')
      expect(field?.type).toBe('date')
      expect(field?.required).toBe(false)
    })

    test('optional relation', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', 'assignee?->User': true }
      const fields = parseResourceProps(props)

      const field = fields.find((f) => f.name === 'assignee')
      expect(field?.type).toBe('relation')
      expect(field?.required).toBe(false)
      expect(field?.relation?.target).toBe('User')
    })
  })

  describe('Resource component with shorthand', () => {
    test('Resource component accepts shorthand props', async () => {
      const { Resource } = await import('../../src/schema/Resource')

      // This should not throw during JSX creation
      // Note: shorthand props with special chars must be passed via spread
      const resource = <Resource name="Task" title={true} done={true} status="completed | pending" />
      expect(resource.props.name).toBe('Task')
      expect(resource.props.title).toBe(true)
    })

    test('getResourceMetadata extracts fields from shorthand', async () => {
      const { Resource, getResourceMetadata } = await import('../../src/schema/Resource')

      // Props with special characters (?, :, ->) must be passed via spread
      // In real usage, a JSX transform or babel plugin would handle this syntax
      const shorthandProps = {
        name: 'Task',
        title: true,
        'description?': true,
        done: true,
        status: 'open | closed',
        'priority:number': true,
        'assignee->User': true,
        'createdAt:auto': true,
      }

      const resource = <Resource {...shorthandProps} />

      const metadata = getResourceMetadata(resource)
      expect(metadata.name).toBe('Task')
      expect(metadata.fields).toBeDefined()
      expect(metadata.fields.length).toBeGreaterThan(0)
    })
  })

  describe('Edge cases', () => {
    test('ignores name prop when parsing fields', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', title: true }
      const fields = parseResourceProps(props)

      expect(fields.find((f) => f.name === 'name')).toBeUndefined()
    })

    test('ignores children prop when parsing fields', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', children: [], title: true }
      const fields = parseResourceProps(props)

      expect(fields.find((f) => f.name === 'children')).toBeUndefined()
    })

    test('empty props returns empty fields array', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task' }
      const fields = parseResourceProps(props)

      expect(fields).toEqual([])
    })

    test('preserves field order from props', async () => {
      const { parseResourceProps } = await import('../../src/schema/Resource')
      const props = { name: 'Task', title: true, 'description?': true, done: true, 'priority:number': true }
      const fields = parseResourceProps(props)

      expect(fields.map((f) => f.name)).toEqual(['title', 'description', 'done', 'priority'])
    })
  })
})
