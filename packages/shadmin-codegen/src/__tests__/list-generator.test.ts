/**
 * Tests for List Component Generator
 *
 * RED phase tests for generating Shadmin/React-Admin List components.
 *
 * @see saaskit-16q
 */

import { describe, it, expect } from 'vitest'
import { generateList } from '../generators/list'
import type { Resource, Field, FieldType, SaaSSchema } from '@saaskit/schema'

// ============================================================================
// Test Helpers
// ============================================================================

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
  return {
    name,
    fields,
    relations: [],
  }
}

function createSchema(resources: Resource[]): SaaSSchema {
  return {
    name: 'TestApp',
    version: '1.0',
    resources,
  }
}

// ============================================================================
// Test Data
// ============================================================================

const simpleUserResource = createResource('User', [
  createField({ name: 'id', type: 'uuid' }),
  createField({ name: 'name', type: 'string', required: true }),
  createField({ name: 'email', type: 'email', required: true }),
  createField({ name: 'createdAt', type: 'datetime' }),
])

const postResource = createResource('Post', [
  createField({ name: 'id', type: 'uuid' }),
  createField({ name: 'title', type: 'string', required: true }),
  createField({ name: 'content', type: 'string' }),
  createField({
    name: 'status',
    type: 'enum',
    annotations: { enumValues: ['draft', 'published', 'archived'] },
  }),
  createField({ name: 'publishedAt', type: 'date' }),
  createField({ name: 'views', type: 'number' }),
  createField({ name: 'featured', type: 'boolean' }),
])

// ============================================================================
// Tests
// ============================================================================

describe('List Component Generator', () => {
  // ==========================================================================
  // Basic Structure
  // ==========================================================================

  describe('Basic Structure', () => {
    it('should generate a valid React component', () => {
      const result = generateList(simpleUserResource)

      expect(result.name).toBe('UserList')
      expect(result.code).toContain('export const UserList')
      expect(result.code).toContain('() =>')
    })

    it('should import required Shadmin components', () => {
      const result = generateList(simpleUserResource)

      expect(result.imports).toContain('List')
      expect(result.imports).toContain('Datagrid')
      expect(result.imports).toContain('TextField')
      expect(result.imports).toContain('EmailField')
    })

    it('should use Datagrid for data display', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('<Datagrid')
      expect(result.code).toContain('</Datagrid>')
    })

    it('should wrap in List component', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('<List')
      expect(result.code).toContain('</List>')
    })

    it('should generate correct file path', () => {
      const result = generateList(simpleUserResource)

      expect(result.filePath).toBe('User/UserList.tsx')
    })
  })

  // ==========================================================================
  // Field Columns
  // ==========================================================================

  describe('Field Columns', () => {
    it('should create columns for all non-hidden fields', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('source="name"')
      expect(result.code).toContain('source="email"')
      expect(result.code).toContain('source="createdAt"')
    })

    it('should use correct field components based on type', () => {
      const result = generateList(postResource)

      expect(result.code).toContain('<TextField source="title"')
      expect(result.code).toContain('<NumberField source="views"')
      expect(result.code).toContain('<BooleanField source="featured"')
      expect(result.code).toContain('<DateField source="publishedAt"')
    })

    it('should use EmailField for email type', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('<EmailField source="email"')
    })

    it('should use DateField with showTime for datetime', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('<DateField source="createdAt"')
      expect(result.code).toContain('showTime')
    })

    it('should skip uuid/id fields in list columns', () => {
      const result = generateList(simpleUserResource)

      // ID field should not be a visible column (or should be first if included)
      const idFieldCount = (result.code.match(/source="id"/g) || []).length
      expect(idFieldCount).toBeLessThanOrEqual(1)
    })

    it('should add label from field description annotation', () => {
      const resource = createResource('Product', [
        createField({ name: 'id', type: 'uuid' }),
        createField({
          name: 'sku',
          type: 'string',
          annotations: { description: 'Stock Keeping Unit' },
        }),
      ])
      const result = generateList(resource)

      expect(result.code).toContain('label="Stock Keeping Unit"')
    })
  })

  // ==========================================================================
  // Actions
  // ==========================================================================

  describe('Actions', () => {
    it('should include EditButton column', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('<EditButton')
      expect(result.imports).toContain('EditButton')
    })

    it('should include DeleteButton for bulk actions', () => {
      const result = generateList(simpleUserResource)

      expect(result.imports).toContain('BulkDeleteButton')
    })

    it('should configure bulk action buttons', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('bulkActionButtons')
    })
  })

  // ==========================================================================
  // Filters
  // ==========================================================================

  describe('Filters', () => {
    it('should generate filter component for searchable fields', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('filters=')
    })

    it('should use TextInput filter for string fields', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('<TextInput')
      expect(result.code).toContain('source="name"')
    })

    it('should use SelectInput filter for enum fields', () => {
      const result = generateList(postResource)

      expect(result.code).toContain('<SelectInput')
      expect(result.code).toContain('source="status"')
    })

    it('should include alwaysOn for primary search filter', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('alwaysOn')
    })
  })

  // ==========================================================================
  // Sorting
  // ==========================================================================

  describe('Sorting', () => {
    it('should enable sorting on sortable columns', () => {
      const result = generateList(simpleUserResource)

      // Datagrid with rowClick enables sorting by default
      expect(result.code).toContain('rowClick="edit"')
    })

    it('should set default sort if createdAt exists', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('sort=')
      expect(result.code).toContain('createdAt')
    })
  })

  // ==========================================================================
  // Empty State
  // ==========================================================================

  describe('Empty State', () => {
    it('should include empty state component', () => {
      const result = generateList(simpleUserResource)

      expect(result.code).toContain('empty=')
    })
  })

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle resource with only id field', () => {
      const minimalResource = createResource('Minimal', [
        createField({ name: 'id', type: 'uuid' }),
      ])
      const result = generateList(minimalResource)

      expect(result.name).toBe('MinimalList')
      expect(result.code).toContain('<List')
    })

    it('should handle resource with many fields', () => {
      const manyFieldsResource = createResource('Complex', [
        createField({ name: 'id', type: 'uuid' }),
        createField({ name: 'field1', type: 'string' }),
        createField({ name: 'field2', type: 'string' }),
        createField({ name: 'field3', type: 'number' }),
        createField({ name: 'field4', type: 'boolean' }),
        createField({ name: 'field5', type: 'date' }),
        createField({ name: 'field6', type: 'email' }),
        createField({ name: 'field7', type: 'url' }),
      ])
      const result = generateList(manyFieldsResource)

      expect(result.code).toContain('source="field1"')
      expect(result.code).toContain('source="field7"')
    })

    it('should handle special characters in resource name', () => {
      const resource = createResource('UserProfile', [
        createField({ name: 'id', type: 'uuid' }),
        createField({ name: 'displayName', type: 'string' }),
      ])
      const result = generateList(resource)

      expect(result.name).toBe('UserProfileList')
    })
  })
})
