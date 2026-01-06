/**
 * Tests for Field Type Mapper
 *
 * RED phase tests for mapping SaaSKit schema fields to React-Admin components.
 *
 * @see saaskit-tlw
 */

import { describe, it, expect } from 'vitest'
import { mapFieldType } from '../field-mapper'
import type { Field, FieldType } from '@saaskit/schema'

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

// ============================================================================
// Primitive Types
// ============================================================================

describe('Field Type Mapper', () => {
  describe('Primitive Types', () => {
    it('should map string field to TextField/TextInput', () => {
      const field = createField({ name: 'title', type: 'string' })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('TextField')
      expect(mapping.showComponent).toBe('TextField')
      expect(mapping.inputComponent).toBe('TextInput')
      expect(mapping.props.source).toBe('title')
    })

    it('should map number field to NumberField/NumberInput', () => {
      const field = createField({ name: 'price', type: 'number' })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('NumberField')
      expect(mapping.showComponent).toBe('NumberField')
      expect(mapping.inputComponent).toBe('NumberInput')
      expect(mapping.props.source).toBe('price')
    })

    it('should map boolean field to BooleanField/BooleanInput', () => {
      const field = createField({ name: 'isActive', type: 'boolean' })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('BooleanField')
      expect(mapping.showComponent).toBe('BooleanField')
      expect(mapping.inputComponent).toBe('BooleanInput')
      expect(mapping.props.source).toBe('isActive')
    })

    it('should map uuid field to TextField (readonly)', () => {
      const field = createField({ name: 'id', type: 'uuid' })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('TextField')
      expect(mapping.showComponent).toBe('TextField')
      expect(mapping.inputComponent).toBe('TextInput')
      expect(mapping.props.source).toBe('id')
      expect(mapping.props.disabled).toBe(true)
    })
  })

  // ==========================================================================
  // Date Types
  // ==========================================================================

  describe('Date Types', () => {
    it('should map date field to DateField/DateInput', () => {
      const field = createField({ name: 'birthDate', type: 'date' })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('DateField')
      expect(mapping.showComponent).toBe('DateField')
      expect(mapping.inputComponent).toBe('DateInput')
      expect(mapping.props.source).toBe('birthDate')
    })

    it('should map datetime field to DateField/DateTimeInput', () => {
      const field = createField({ name: 'createdAt', type: 'datetime' })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('DateField')
      expect(mapping.showComponent).toBe('DateField')
      expect(mapping.inputComponent).toBe('DateTimeInput')
      expect(mapping.props.source).toBe('createdAt')
      expect(mapping.props.showTime).toBe(true)
    })
  })

  // ==========================================================================
  // Special Types
  // ==========================================================================

  describe('Special Types', () => {
    it('should map email field to EmailField/TextInput', () => {
      const field = createField({ name: 'email', type: 'email' })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('EmailField')
      expect(mapping.showComponent).toBe('EmailField')
      expect(mapping.inputComponent).toBe('TextInput')
      expect(mapping.props.source).toBe('email')
      expect(mapping.props.type).toBe('email')
    })

    it('should map url field to UrlField/TextInput', () => {
      const field = createField({ name: 'website', type: 'url' })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('UrlField')
      expect(mapping.showComponent).toBe('UrlField')
      expect(mapping.inputComponent).toBe('TextInput')
      expect(mapping.props.source).toBe('website')
      expect(mapping.props.type).toBe('url')
    })

    it('should map json field to FunctionField/TextInput', () => {
      const field = createField({ name: 'metadata', type: 'json' })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('FunctionField')
      expect(mapping.showComponent).toBe('FunctionField')
      expect(mapping.inputComponent).toBe('TextInput')
      expect(mapping.props.source).toBe('metadata')
      expect(mapping.props.multiline).toBe(true)
    })
  })

  // ==========================================================================
  // Array Types
  // ==========================================================================

  describe('Array Types', () => {
    it('should map array field to ArrayField/ArrayInput', () => {
      const field = createField({
        name: 'tags',
        type: 'array',
        annotations: { arrayType: 'string' },
      })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('ArrayField')
      expect(mapping.showComponent).toBe('ArrayField')
      expect(mapping.inputComponent).toBe('ArrayInput')
      expect(mapping.props.source).toBe('tags')
    })
  })

  // ==========================================================================
  // Enum Types
  // ==========================================================================

  describe('Enum Types', () => {
    it('should map enum field to FunctionField/SelectInput', () => {
      const field = createField({
        name: 'status',
        type: 'enum',
        annotations: { enumValues: ['draft', 'published', 'archived'] },
      })
      const mapping = mapFieldType(field)

      expect(mapping.listComponent).toBe('FunctionField')
      expect(mapping.showComponent).toBe('TextField')
      expect(mapping.inputComponent).toBe('SelectInput')
      expect(mapping.props.source).toBe('status')
      expect(mapping.props.choices).toEqual([
        { id: 'draft', name: 'draft' },
        { id: 'published', name: 'published' },
        { id: 'archived', name: 'archived' },
      ])
    })
  })

  // ==========================================================================
  // Field Attributes
  // ==========================================================================

  describe('Field Attributes', () => {
    it('should add required prop for required fields', () => {
      const field = createField({ name: 'name', type: 'string', required: true })
      const mapping = mapFieldType(field)

      expect(mapping.props.required).toBe(true)
      expect(mapping.props.validate).toBeDefined()
    })

    it('should add defaultValue prop when default is specified', () => {
      const field = createField({
        name: 'status',
        type: 'string',
        default: 'draft',
      })
      const mapping = mapFieldType(field)

      expect(mapping.props.defaultValue).toBe('draft')
    })

    it('should add helperText from description annotation', () => {
      const field = createField({
        name: 'bio',
        type: 'string',
        annotations: { description: 'A short biography' },
      })
      const mapping = mapFieldType(field)

      expect(mapping.props.helperText).toBe('A short biography')
    })
  })

  // ==========================================================================
  // Annotations
  // ==========================================================================

  describe('Annotations', () => {
    it('should make primaryKey fields readonly in Edit mode', () => {
      const field = createField({
        name: 'id',
        type: 'uuid',
        annotations: { primaryKey: true },
      })
      const mapping = mapFieldType(field, { isEdit: true })

      expect(mapping.props.disabled).toBe(true)
    })

    it('should add minLength validation from annotation', () => {
      const field = createField({
        name: 'password',
        type: 'string',
        annotations: { min: 8 },
      })
      const mapping = mapFieldType(field)

      expect(mapping.props.minLength).toBe(8)
    })

    it('should add maxLength validation from annotation', () => {
      const field = createField({
        name: 'title',
        type: 'string',
        annotations: { max: 100 },
      })
      const mapping = mapFieldType(field)

      expect(mapping.props.maxLength).toBe(100)
    })

    it('should add pattern validation from annotation', () => {
      const field = createField({
        name: 'slug',
        type: 'string',
        annotations: { pattern: '^[a-z0-9-]+$' },
      })
      const mapping = mapFieldType(field)

      expect(mapping.props.pattern).toBe('^[a-z0-9-]+$')
    })
  })

  // ==========================================================================
  // Imports
  // ==========================================================================

  describe('Imports', () => {
    it('should include necessary imports for string field', () => {
      const field = createField({ name: 'title', type: 'string' })
      const mapping = mapFieldType(field)

      expect(mapping.imports).toContain('TextField')
      expect(mapping.imports).toContain('TextInput')
    })

    it('should include EmailField import for email type', () => {
      const field = createField({ name: 'email', type: 'email' })
      const mapping = mapFieldType(field)

      expect(mapping.imports).toContain('EmailField')
    })

    it('should include SelectInput import for enum type', () => {
      const field = createField({
        name: 'status',
        type: 'enum',
        annotations: { enumValues: ['a', 'b'] },
      })
      const mapping = mapFieldType(field)

      expect(mapping.imports).toContain('SelectInput')
    })
  })

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle unknown field types gracefully', () => {
      const field = createField({ name: 'unknown', type: 'custom' as FieldType })
      const mapping = mapFieldType(field)

      // Should fall back to TextField/TextInput
      expect(mapping.listComponent).toBe('TextField')
      expect(mapping.inputComponent).toBe('TextInput')
    })

    it('should handle empty annotations', () => {
      const field = createField({
        name: 'title',
        type: 'string',
        annotations: {},
      })
      const mapping = mapFieldType(field)

      expect(mapping.props.source).toBe('title')
    })

    it('should handle enum with empty values', () => {
      const field = createField({
        name: 'status',
        type: 'enum',
        annotations: { enumValues: [] },
      })
      const mapping = mapFieldType(field)

      expect(mapping.props.choices).toEqual([])
    })
  })
})
