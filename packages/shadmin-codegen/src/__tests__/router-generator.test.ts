/**
 * Tests for Router Configuration Generator
 *
 * @see saaskit-e2c
 */

import { describe, it, expect } from 'vitest'
import { generateRouter } from '../generators/router'
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
      createField({ name: 'email', type: 'email', required: true }),
    ]),
    createResource('Post', [
      createField({ name: 'id', type: 'uuid' }),
      createField({ name: 'title', type: 'string', required: true }),
      createField({ name: 'published', type: 'boolean' }),
    ]),
  ],
}

// ============================================================================
// Router Generator Tests
// ============================================================================

describe('Router Generator', () => {
  describe('Basic Structure', () => {
    it('should generate a valid router configuration', () => {
      const result = generateRouter(testSchema)

      expect(result.name).toBe('AppRouter')
      expect(result.code).toContain('createBrowserRouter')
      expect(result.filePath).toBe('router.tsx')
    })

    it('should export router and AppRouter component', () => {
      const result = generateRouter(testSchema)

      expect(result.code).toContain('export const router = createBrowserRouter')
      expect(result.code).toContain('export const AppRouter')
      expect(result.code).toContain('export default AppRouter')
    })

    it('should include required react-router-dom imports', () => {
      const result = generateRouter(testSchema)

      expect(result.code).toContain("from 'react-router-dom'")
      expect(result.code).toContain('createBrowserRouter')
      expect(result.code).toContain('RouterProvider')
      expect(result.code).toContain('Outlet')
      expect(result.code).toContain('Navigate')
    })
  })

  describe('Resource Routes', () => {
    it('should generate routes for each resource', () => {
      const result = generateRouter(testSchema)

      // Check for pluralized resource paths
      expect(result.code).toContain("path: 'users'")
      expect(result.code).toContain("path: 'posts'")
    })

    it('should generate CRUD routes for each resource', () => {
      const result = generateRouter(testSchema)

      // Check for List route (index)
      expect(result.code).toContain('index: true')
      expect(result.code).toContain('<UserList />')
      expect(result.code).toContain('<PostList />')

      // Check for Create route
      expect(result.code).toContain("path: 'new'")
      expect(result.code).toContain('<UserCreate />')
      expect(result.code).toContain('<PostCreate />')

      // Check for Show route
      expect(result.code).toContain("path: ':id'")
      expect(result.code).toContain('<UserShow />')
      expect(result.code).toContain('<PostShow />')

      // Check for Edit route
      expect(result.code).toContain("path: ':id/edit'")
      expect(result.code).toContain('<UserEdit />')
      expect(result.code).toContain('<PostEdit />')
    })

    it('should import resource components from correct paths', () => {
      const result = generateRouter(testSchema)

      expect(result.code).toContain("import { UserList, UserShow, UserEdit, UserCreate } from './resources/User'")
      expect(result.code).toContain("import { PostList, PostShow, PostEdit, PostCreate } from './resources/Post'")
    })
  })

  describe('Layout and Navigation', () => {
    it('should wrap routes in Layout component', () => {
      const result = generateRouter(testSchema)

      expect(result.code).toContain('<Layout>')
      expect(result.code).toContain("import { Layout } from './components/Layout'")
    })

    it('should include Dashboard as root index route', () => {
      const result = generateRouter(testSchema)

      expect(result.code).toContain('<Dashboard />')
      expect(result.code).toContain("import { Dashboard } from './Dashboard'")
    })

    it('should include catch-all redirect to home', () => {
      const result = generateRouter(testSchema)

      expect(result.code).toContain("path: '*'")
      expect(result.code).toContain('<Navigate to="/" replace />')
    })
  })

  describe('Pluralization', () => {
    it('should correctly pluralize resource names for routes', () => {
      const schemaWithCategory: SaaSSchema = {
        metadata: { name: 'Test', version: '1.0.0' },
        resources: [
          createResource('Category', [
            createField({ name: 'id', type: 'uuid' }),
            createField({ name: 'name', type: 'string' }),
          ]),
        ],
      }

      const result = generateRouter(schemaWithCategory)
      expect(result.code).toContain("path: 'categories'")
    })

    it('should handle resources ending in s/x/ch/sh', () => {
      const schemaWithBusiness: SaaSSchema = {
        metadata: { name: 'Test', version: '1.0.0' },
        resources: [
          createResource('Business', [
            createField({ name: 'id', type: 'uuid' }),
            createField({ name: 'name', type: 'string' }),
          ]),
        ],
      }

      const result = generateRouter(schemaWithBusiness)
      expect(result.code).toContain("path: 'businesses'")
    })
  })

  describe('Imports', () => {
    it('should include correct imports array', () => {
      const result = generateRouter(testSchema)

      expect(result.imports).toContain('createBrowserRouter')
      expect(result.imports).toContain('RouterProvider')
      expect(result.imports).toContain('Outlet')
      expect(result.imports).toContain('Navigate')
    })

    it('should import React', () => {
      const result = generateRouter(testSchema)

      expect(result.code).toContain("import React from 'react'")
    })
  })

  describe('Empty Schema', () => {
    it('should handle schema with no resources', () => {
      const emptySchema: SaaSSchema = {
        metadata: { name: 'Empty', version: '1.0.0' },
        resources: [],
      }

      const result = generateRouter(emptySchema)

      expect(result.name).toBe('AppRouter')
      expect(result.code).toContain('createBrowserRouter')
      expect(result.code).toContain('<Dashboard />')
      // Should still have the structure but no resource routes
      expect(result.code).not.toContain('<UserList')
    })
  })

  describe('Single Resource', () => {
    it('should handle schema with single resource', () => {
      const singleResourceSchema: SaaSSchema = {
        metadata: { name: 'Single', version: '1.0.0' },
        resources: [
          createResource('Item', [
            createField({ name: 'id', type: 'uuid' }),
            createField({ name: 'name', type: 'string' }),
          ]),
        ],
      }

      const result = generateRouter(singleResourceSchema)

      expect(result.code).toContain("path: 'items'")
      expect(result.code).toContain('<ItemList />')
      expect(result.code).toContain('<ItemCreate />')
      expect(result.code).toContain('<ItemShow />')
      expect(result.code).toContain('<ItemEdit />')
    })
  })
})
