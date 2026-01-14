/**
 * Tests for Edit Component Generator
 *
 * @see saaskit-81k
 */

import { describe, it, expect } from 'vitest'
import { generateEdit } from '../generators/edit'
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
  createField({ name: 'id', type: 'uuid', annotations: { primaryKey: true } }),
  createField({ name: 'name', type: 'string', required: true }),
  createField({ name: 'email', type: 'email', required: true }),
  createField({ name: 'status', type: 'enum', annotations: { enumValues: ['active', 'inactive'] } }),
])

describe('Edit Component Generator', () => {
  describe('Basic Structure', () => {
    it('should generate a valid React component', () => {
      const result = generateEdit(userResource)
      expect(result.name).toBe('UserEdit')
      expect(result.code).toContain('export const UserEdit')
    })

    it('should import required components', () => {
      const result = generateEdit(userResource)
      expect(result.imports).toContain('Edit')
      expect(result.imports).toContain('SimpleForm')
    })

    it('should wrap in Edit component', () => {
      const result = generateEdit(userResource)
      expect(result.code).toContain('<Edit')
      expect(result.code).toContain('</Edit>')
    })

    it('should use SimpleForm', () => {
      const result = generateEdit(userResource)
      expect(result.code).toContain('<SimpleForm')
    })
  })

  describe('Field Inputs', () => {
    it('should generate inputs for editable fields', () => {
      const result = generateEdit(userResource)
      expect(result.code).toContain('source="name"')
      expect(result.code).toContain('source="email"')
    })

    it('should use correct input components', () => {
      const result = generateEdit(userResource)
      expect(result.code).toContain('<TextInput')
      expect(result.code).toContain('<SelectInput')
    })

    it('should mark id field as disabled', () => {
      const result = generateEdit(userResource)
      expect(result.code).toContain('disabled')
    })

    it('should add required validation', () => {
      const result = generateEdit(userResource)
      expect(result.code).toContain('required')
    })
  })
})
