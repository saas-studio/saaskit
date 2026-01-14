/**
 * Tests for Menu/Navigation Component Generator
 *
 * @see saaskit-asn
 */

import { describe, it, expect } from 'vitest'
import { generateMenu } from '../generators/menu'
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
// Menu Generator Tests
// ============================================================================

describe('Menu Generator', () => {
  describe('Basic Structure', () => {
    it('should generate a valid React component', () => {
      const result = generateMenu(testSchema)

      expect(result.name).toBe('AppMenu')
      expect(result.code).toContain('export const AppMenu')
      expect(result.filePath).toBe('AppMenu.tsx')
    })

    it('should import Menu and MenuItemLink from react-admin', () => {
      const result = generateMenu(testSchema)

      expect(result.code).toContain("import { Menu, MenuItemLink, useSidebarState } from 'react-admin'")
      expect(result.imports).toContain('Menu')
      expect(result.imports).toContain('MenuItemLink')
    })

    it('should return GeneratedComponent with all required fields', () => {
      const result = generateMenu(testSchema)

      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('code')
      expect(result).toHaveProperty('imports')
      expect(result).toHaveProperty('filePath')
      expect(Array.isArray(result.imports)).toBe(true)
    })
  })

  describe('Resource Menu Items', () => {
    it('should generate menu item for each resource', () => {
      const result = generateMenu(testSchema)

      expect(result.code).toContain('/users')
      expect(result.code).toContain('/posts')
      expect(result.code).toContain('/orders')
    })

    it('should use pluralized resource names in URLs', () => {
      const schemaWithCategory: SaaSSchema = {
        metadata: { name: 'Test', version: '1.0.0' },
        resources: [
          createResource('Category', [
            createField({ name: 'id', type: 'uuid' }),
          ]),
        ],
      }

      const result = generateMenu(schemaWithCategory)
      expect(result.code).toContain('/categories')
    })

    it('should handle resources ending in s/x/ch/sh', () => {
      const schemaWithSpecialNames: SaaSSchema = {
        metadata: { name: 'Test', version: '1.0.0' },
        resources: [
          createResource('Class', [
            createField({ name: 'id', type: 'uuid' }),
          ]),
          createResource('Box', [
            createField({ name: 'id', type: 'uuid' }),
          ]),
        ],
      }

      const result = generateMenu(schemaWithSpecialNames)
      expect(result.code).toContain('/classes')
      expect(result.code).toContain('/boxes')
    })
  })

  describe('Dashboard Link', () => {
    it('should include a dashboard link', () => {
      const result = generateMenu(testSchema)

      expect(result.code).toContain('to="/"')
      expect(result.code).toContain('primaryText="Dashboard"')
    })

    it('should include Dashboard icon', () => {
      const result = generateMenu(testSchema)

      expect(result.code).toContain('<Dashboard />')
    })
  })

  describe('Icons', () => {
    it('should import icons from @mui/icons-material', () => {
      const result = generateMenu(testSchema)

      expect(result.code).toContain("from '@mui/icons-material'")
    })

    it('should assign appropriate icons to known resources', () => {
      const result = generateMenu(testSchema)

      // User should get People icon
      expect(result.code).toContain('<People />')
      // Post should get Article icon
      expect(result.code).toContain('<Article />')
      // Order should get ShoppingCart icon
      expect(result.code).toContain('<ShoppingCart />')
    })

    it('should use Folder icon for unknown resources', () => {
      const schemaWithUnknown: SaaSSchema = {
        metadata: { name: 'Test', version: '1.0.0' },
        resources: [
          createResource('Widget', [
            createField({ name: 'id', type: 'uuid' }),
          ]),
        ],
      }

      const result = generateMenu(schemaWithUnknown)
      expect(result.code).toContain('<Folder />')
    })
  })

  describe('Sidebar State', () => {
    it('should use useSidebarState hook', () => {
      const result = generateMenu(testSchema)

      expect(result.code).toContain('useSidebarState')
      expect(result.code).toContain('const [open] = useSidebarState()')
    })

    it('should pass sidebarIsOpen prop to MenuItemLink', () => {
      const result = generateMenu(testSchema)

      expect(result.code).toContain('sidebarIsOpen={open}')
    })
  })

  describe('Empty Schema', () => {
    it('should handle schema with no resources', () => {
      const emptySchema: SaaSSchema = {
        metadata: { name: 'Empty', version: '1.0.0' },
        resources: [],
      }

      const result = generateMenu(emptySchema)

      expect(result.name).toBe('AppMenu')
      expect(result.code).toContain('export const AppMenu')
      // Should still have dashboard link
      expect(result.code).toContain('Dashboard')
    })
  })

  describe('Exports', () => {
    it('should export component as named export', () => {
      const result = generateMenu(testSchema)

      expect(result.code).toContain('export const AppMenu')
    })

    it('should export component as default export', () => {
      const result = generateMenu(testSchema)

      expect(result.code).toContain('export default AppMenu')
    })
  })
})
