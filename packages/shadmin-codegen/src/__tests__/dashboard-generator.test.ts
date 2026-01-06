/**
 * Tests for Dashboard Component Generator
 *
 * @see saaskit-517
 */

import { describe, it, expect } from 'vitest'
import { generateDashboard } from '../generators/dashboard'
import type { SaaSSchema, Resource, Field, FieldType } from '@saaskit/schema'

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
  return { name, fields, relations: [] }
}

const testSchema: SaaSSchema = {
  metadata: {
    name: 'TestApp',
    version: '1.0.0',
  },
  resources: [
    createResource('User', [
      createField({ name: 'id', type: 'uuid' }),
      createField({ name: 'name', type: 'string', required: true }),
    ]),
    createResource('Post', [
      createField({ name: 'id', type: 'uuid' }),
      createField({ name: 'title', type: 'string', required: true }),
    ]),
    createResource('Order', [
      createField({ name: 'id', type: 'uuid' }),
      createField({ name: 'total', type: 'number' }),
    ]),
  ],
}

// ============================================================================
// Dashboard Generator Tests
// ============================================================================

describe('Dashboard Generator', () => {
  describe('Basic Structure', () => {
    it('should generate a valid React component', () => {
      const result = generateDashboard(testSchema)

      expect(result.name).toBe('Dashboard')
      expect(result.code).toContain('export const Dashboard')
      expect(result.filePath).toBe('Dashboard.tsx')
    })

    it('should import required hooks', () => {
      const result = generateDashboard(testSchema)

      expect(result.code).toContain('useDataProvider')
      expect(result.code).toContain('useState')
      expect(result.code).toContain('useEffect')
    })
  })

  describe('Resource Cards', () => {
    it('should generate card for each resource', () => {
      const result = generateDashboard(testSchema)

      expect(result.code).toContain('users')
      expect(result.code).toContain('posts')
      expect(result.code).toContain('orders')
    })

    it('should use Card component', () => {
      const result = generateDashboard(testSchema)

      expect(result.code).toContain('<Card')
    })

    it('should link to resource list', () => {
      const result = generateDashboard(testSchema)

      expect(result.code).toContain('/users')
      expect(result.code).toContain('/posts')
    })
  })

  describe('Count Query', () => {
    it('should fetch counts for each resource', () => {
      const result = generateDashboard(testSchema)

      expect(result.code).toContain('getList')
    })

    it('should track loading state', () => {
      const result = generateDashboard(testSchema)

      expect(result.code).toContain('loading')
    })
  })

  describe('Layout', () => {
    it('should use grid layout for cards', () => {
      const result = generateDashboard(testSchema)

      // Should have grid or flex container
      expect(result.code).toMatch(/display.*grid|Grid|flex/)
    })

    it('should have title', () => {
      const result = generateDashboard(testSchema)

      expect(result.code).toContain('Dashboard')
    })
  })

  describe('Imports', () => {
    it('should include react-admin imports', () => {
      const result = generateDashboard(testSchema)

      expect(result.imports).toContain('useDataProvider')
      expect(result.imports).toContain('Card')
    })

    it('should include React hooks', () => {
      const result = generateDashboard(testSchema)

      expect(result.imports).toContain('useState')
      expect(result.imports).toContain('useEffect')
    })
  })
})
