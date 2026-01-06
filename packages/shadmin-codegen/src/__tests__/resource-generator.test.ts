/**
 * Tests for Resource Generator
 *
 * @see saaskit-ord
 */

import { describe, it, expect } from 'vitest'
import { generateResource } from '../generators/resource'
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
  createField({ name: 'isActive', type: 'boolean' }),
  createField({ name: 'createdAt', type: 'datetime' }),
])

describe('Resource Generator', () => {
  it('should generate all four components', () => {
    const result = generateResource(userResource)

    expect(result.name).toBe('User')
    expect(result.list).toBeDefined()
    expect(result.show).toBeDefined()
    expect(result.edit).toBeDefined()
    expect(result.create).toBeDefined()
  })

  it('should generate correct component names', () => {
    const result = generateResource(userResource)

    expect(result.list.name).toBe('UserList')
    expect(result.show.name).toBe('UserShow')
    expect(result.edit.name).toBe('UserEdit')
    expect(result.create.name).toBe('UserCreate')
  })

  it('should collect all imports', () => {
    const result = generateResource(userResource)

    // Common imports that should appear
    expect(result.imports).toContain('TextField')
    expect(result.imports).toContain('TextInput')
    expect(result.imports).toContain('EmailField')
    expect(result.imports).toContain('BooleanField')
    expect(result.imports).toContain('DateField')
  })

  it('should generate correct file paths', () => {
    const result = generateResource(userResource)

    expect(result.list.filePath).toBe('User/UserList.tsx')
    expect(result.show.filePath).toBe('User/UserShow.tsx')
    expect(result.edit.filePath).toBe('User/UserEdit.tsx')
    expect(result.create.filePath).toBe('User/UserCreate.tsx')
  })

  it('should generate valid code for each component', () => {
    const result = generateResource(userResource)

    expect(result.list.code).toContain('export const UserList')
    expect(result.show.code).toContain('export const UserShow')
    expect(result.edit.code).toContain('export const UserEdit')
    expect(result.create.code).toContain('export const UserCreate')
  })
})
