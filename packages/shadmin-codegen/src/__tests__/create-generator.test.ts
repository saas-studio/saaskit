/**
 * Tests for Create Component Generator
 *
 * @see saaskit-74v
 */

import { describe, it, expect } from 'vitest'
import { generateCreate } from '../generators/create'
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
  createField({ name: 'role', type: 'enum', annotations: { enumValues: ['user', 'admin'] } }),
  createField({ name: 'createdAt', type: 'datetime' }),
])

describe('Create Component Generator', () => {
  describe('Basic Structure', () => {
    it('should generate a valid React component', () => {
      const result = generateCreate(userResource)
      expect(result.name).toBe('UserCreate')
      expect(result.code).toContain('export const UserCreate')
    })

    it('should import required components', () => {
      const result = generateCreate(userResource)
      expect(result.imports).toContain('Create')
      expect(result.imports).toContain('SimpleForm')
    })

    it('should wrap in Create component', () => {
      const result = generateCreate(userResource)
      expect(result.code).toContain('<Create')
      expect(result.code).toContain('</Create>')
    })
  })

  describe('Field Inputs', () => {
    it('should skip auto-generated fields', () => {
      const result = generateCreate(userResource)
      // id and createdAt should be skipped
      expect(result.code).not.toContain('source="id"')
      expect(result.code).not.toContain('source="createdAt"')
    })

    it('should include user-editable fields', () => {
      const result = generateCreate(userResource)
      expect(result.code).toContain('source="name"')
      expect(result.code).toContain('source="email"')
      expect(result.code).toContain('source="role"')
    })

    it('should use correct input components', () => {
      const result = generateCreate(userResource)
      expect(result.code).toContain('<TextInput')
      expect(result.code).toContain('<SelectInput')
    })

    it('should add required validation', () => {
      const result = generateCreate(userResource)
      expect(result.code).toContain('required')
    })
  })
})
