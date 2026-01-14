/**
 * Tests for Reference Field Mapper (Relations)
 *
 * RED phase tests for mapping SaaSKit schema relations to React-Admin reference components.
 *
 * @see saaskit-uor
 */

import { describe, it, expect } from 'vitest'
import { mapRelationType } from '../reference-mapper'
import type { Relation, Resource } from '@saaskit/schema'

// ============================================================================
// Test Helpers
// ============================================================================

function createRelation(overrides: Partial<Relation> & { name: string; to: string }): Relation {
  return {
    name: overrides.name,
    to: overrides.to,
    cardinality: overrides.cardinality ?? 'one',
    foreignKey: overrides.foreignKey,
    required: overrides.required ?? false,
    inverse: overrides.inverse,
    onDelete: overrides.onDelete,
  }
}

function createResource(name: string): Resource {
  return {
    name,
    fields: [
      { name: 'id', type: 'uuid', required: true, annotations: { primaryKey: true } },
      { name: 'name', type: 'string', required: true },
    ],
    relations: [],
  }
}

// ============================================================================
// belongsTo Relations (cardinality: 'one')
// ============================================================================

describe('Reference Field Mapper', () => {
  describe('belongsTo Relations', () => {
    it('should map belongsTo relation to ReferenceField', () => {
      const relation = createRelation({
        name: 'organization',
        to: 'Organization',
        cardinality: 'one',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.displayComponent).toBe('ReferenceField')
      expect(mapping.inputComponent).toBe('ReferenceInput')
    })

    it('should use correct source and reference props', () => {
      const relation = createRelation({
        name: 'author',
        to: 'User',
        cardinality: 'one',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.props.source).toBe('authorId')
      expect(mapping.props.reference).toBe('users')
    })

    it('should use custom foreignKey when provided', () => {
      const relation = createRelation({
        name: 'owner',
        to: 'User',
        cardinality: 'one',
        foreignKey: 'ownerId',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.props.source).toBe('ownerId')
    })

    it('should add required validation when relation is required', () => {
      const relation = createRelation({
        name: 'organization',
        to: 'Organization',
        cardinality: 'one',
        required: true,
      })
      const mapping = mapRelationType(relation)

      expect(mapping.props.required).toBe(true)
    })

    it('should use AutocompleteInput inside ReferenceInput', () => {
      const relation = createRelation({
        name: 'category',
        to: 'Category',
        cardinality: 'one',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.childComponent).toBe('AutocompleteInput')
      expect(mapping.childProps?.optionText).toBe('name')
    })

    it('should generate correct display output', () => {
      const relation = createRelation({
        name: 'author',
        to: 'User',
        cardinality: 'one',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.displayOutput).toContain('<ReferenceField')
      expect(mapping.displayOutput).toContain('source="authorId"')
      expect(mapping.displayOutput).toContain('reference="users"')
      expect(mapping.displayOutput).toContain('<TextField source="name" />')
    })

    it('should generate correct input output', () => {
      const relation = createRelation({
        name: 'organization',
        to: 'Organization',
        cardinality: 'one',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.inputOutput).toContain('<ReferenceInput')
      expect(mapping.inputOutput).toContain('source="organizationId"')
      expect(mapping.inputOutput).toContain('reference="organizations"')
      expect(mapping.inputOutput).toContain('<AutocompleteInput optionText="name" />')
    })
  })

  // ==========================================================================
  // hasMany Relations (cardinality: 'many')
  // ==========================================================================

  describe('hasMany Relations', () => {
    it('should map hasMany relation to ReferenceManyField', () => {
      const relation = createRelation({
        name: 'posts',
        to: 'Post',
        cardinality: 'many',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.displayComponent).toBe('ReferenceManyField')
    })

    it('should not generate input for hasMany (read-only)', () => {
      const relation = createRelation({
        name: 'comments',
        to: 'Comment',
        cardinality: 'many',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.inputComponent).toBeNull()
      expect(mapping.inputOutput).toBeNull()
    })

    it('should use target prop for reverse lookup', () => {
      const relation = createRelation({
        name: 'posts',
        to: 'Post',
        cardinality: 'many',
        inverse: 'author',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.props.reference).toBe('posts')
      expect(mapping.props.target).toBe('authorId')
    })

    it('should generate Datagrid inside ReferenceManyField', () => {
      const relation = createRelation({
        name: 'orders',
        to: 'Order',
        cardinality: 'many',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.childComponent).toBe('Datagrid')
      expect(mapping.displayOutput).toContain('<Datagrid>')
    })
  })

  // ==========================================================================
  // Imports
  // ==========================================================================

  describe('Imports', () => {
    it('should include ReferenceField and ReferenceInput for belongsTo', () => {
      const relation = createRelation({
        name: 'category',
        to: 'Category',
        cardinality: 'one',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.imports).toContain('ReferenceField')
      expect(mapping.imports).toContain('ReferenceInput')
      expect(mapping.imports).toContain('AutocompleteInput')
      expect(mapping.imports).toContain('TextField')
    })

    it('should include ReferenceManyField and Datagrid for hasMany', () => {
      const relation = createRelation({
        name: 'items',
        to: 'Item',
        cardinality: 'many',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.imports).toContain('ReferenceManyField')
      expect(mapping.imports).toContain('Datagrid')
    })
  })

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle self-referential relations', () => {
      const relation = createRelation({
        name: 'parent',
        to: 'Category',
        cardinality: 'one',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.props.source).toBe('parentId')
      expect(mapping.props.reference).toBe('categories')
    })

    it('should pluralize resource name correctly', () => {
      const relation = createRelation({
        name: 'status',
        to: 'Status',
        cardinality: 'one',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.props.reference).toBe('statuses')
    })

    it('should handle resources ending in "y"', () => {
      const relation = createRelation({
        name: 'category',
        to: 'Category',
        cardinality: 'one',
      })
      const mapping = mapRelationType(relation)

      expect(mapping.props.reference).toBe('categories')
    })
  })
})
