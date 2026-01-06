/**
 * Tests for Show Component Generator
 *
 * @see saaskit-ezr
 */

import { describe, it, expect } from 'vitest'
import { generateShow } from '../generators/show'
import type { Resource, Field, FieldType } from '@saaskit/schema'

function createField(overrides: Partial<Field> & { name: string; type: FieldType }): Field {
  return {
    name: overrides.name,
    type: overrides.type,
    required: overrides.required ?? false,
    unique: overrides.unique ?? false,
    default: overrides.default,
    annotations: overrides.annotations ?? {},
  }
}

function createResource(name: string, fields: Field[]): Resource {
  return { name, fields, relations: [] }
}

const userResource = createResource('User', [
  createField({ name: 'id', type: 'uuid' }),
  createField({ name: 'name', type: 'string', required: true }),
  createField({ name: 'email', type: 'email', required: true }),
  createField({ name: 'bio', type: 'string', annotations: { description: 'User biography' } }),
  createField({ name: 'isActive', type: 'boolean' }),
  createField({ name: 'createdAt', type: 'datetime' }),
])

describe('Show Component Generator', () => {
  describe('Basic Structure', () => {
    it('should generate a valid React component', () => {
      const result = generateShow(userResource)
      expect(result.name).toBe('UserShow')
      expect(result.code).toContain('export const UserShow')
    })

    it('should import required components', () => {
      const result = generateShow(userResource)
      expect(result.imports).toContain('Show')
      expect(result.imports).toContain('SimpleShowLayout')
    })

    it('should wrap in Show component', () => {
      const result = generateShow(userResource)
      expect(result.code).toContain('<Show')
      expect(result.code).toContain('</Show>')
    })

    it('should use SimpleShowLayout', () => {
      const result = generateShow(userResource)
      expect(result.code).toContain('<SimpleShowLayout')
      expect(result.code).toContain('</SimpleShowLayout>')
    })

    it('should generate correct file path', () => {
      const result = generateShow(userResource)
      expect(result.filePath).toBe('User/UserShow.tsx')
    })
  })

  describe('Field Display', () => {
    it('should display all fields', () => {
      const result = generateShow(userResource)
      expect(result.code).toContain('source="name"')
      expect(result.code).toContain('source="email"')
      expect(result.code).toContain('source="bio"')
    })

    it('should use correct field components', () => {
      const result = generateShow(userResource)
      expect(result.code).toContain('<TextField')
      expect(result.code).toContain('<EmailField')
      expect(result.code).toContain('<BooleanField')
      expect(result.code).toContain('<DateField')
    })

    it('should add labels from description', () => {
      const result = generateShow(userResource)
      expect(result.code).toContain('label="User biography"')
    })

    it('should include id field in show view', () => {
      const result = generateShow(userResource)
      expect(result.code).toContain('source="id"')
    })
  })
})
