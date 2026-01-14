/**
 * Tests for App Scaffolding Generator
 *
 * @see saaskit-060
 */

import { describe, it, expect } from 'vitest'
import { generateScaffold } from '../generators/scaffold'
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
// Scaffold Generator Tests
// ============================================================================

describe('Scaffold Generator', () => {
  describe('App.tsx Generation', () => {
    it('should generate App.tsx with Admin component', () => {
      const result = generateScaffold(testSchema)

      expect(result.app.name).toBe('App')
      expect(result.app.code).toContain('import { Admin, Resource }')
      expect(result.app.code).toContain('export const App')
    })

    it('should include Resource registrations for all resources', () => {
      const result = generateScaffold(testSchema)

      expect(result.app.code).toContain('<Resource')
      expect(result.app.code).toContain('name="users"')
      expect(result.app.code).toContain('name="posts"')
    })

    it('should import component from resource files', () => {
      const result = generateScaffold(testSchema)

      expect(result.app.code).toContain("from './resources/User'")
      expect(result.app.code).toContain("from './resources/Post'")
    })

    it('should reference all CRUD components', () => {
      const result = generateScaffold(testSchema)

      expect(result.app.code).toContain('list={UserList}')
      expect(result.app.code).toContain('edit={UserEdit}')
      expect(result.app.code).toContain('create={UserCreate}')
      expect(result.app.code).toContain('show={UserShow}')
    })
  })

  describe('DataProvider Generation', () => {
    it('should generate dataProvider.ts', () => {
      const result = generateScaffold(testSchema)

      expect(result.dataProvider.name).toBe('dataProvider')
      expect(result.dataProvider.code).toContain('createDataStoreProvider')
      expect(result.dataProvider.filePath).toBe('dataProvider.ts')
    })

    it('should import from @saaskit/shadmin-provider', () => {
      const result = generateScaffold(testSchema)

      expect(result.dataProvider.code).toContain("from '@saaskit/shadmin-provider'")
    })
  })

  describe('AuthProvider Generation', () => {
    it('should generate authProvider.ts stub', () => {
      const result = generateScaffold(testSchema)

      expect(result.authProvider.name).toBe('authProvider')
      expect(result.authProvider.code).toContain('export const authProvider')
      expect(result.authProvider.filePath).toBe('authProvider.ts')
    })

    it('should include basic auth methods', () => {
      const result = generateScaffold(testSchema)

      expect(result.authProvider.code).toContain('login')
      expect(result.authProvider.code).toContain('logout')
      expect(result.authProvider.code).toContain('checkAuth')
    })
  })

  describe('Resource Files', () => {
    it('should generate resource files for each schema resource', () => {
      const result = generateScaffold(testSchema)

      expect(result.resources).toHaveLength(2)
      expect(result.resources[0].name).toBe('User')
      expect(result.resources[1].name).toBe('Post')
    })

    it('should include all components in resource file', () => {
      const result = generateScaffold(testSchema)
      const userResource = result.resources.find((r) => r.name === 'User')!

      expect(userResource.list).toBeDefined()
      expect(userResource.show).toBeDefined()
      expect(userResource.edit).toBeDefined()
      expect(userResource.create).toBeDefined()
    })

    it('should generate correct file paths', () => {
      const result = generateScaffold(testSchema)
      const userResource = result.resources.find((r) => r.name === 'User')!

      expect(userResource.list.filePath).toBe('User/UserList.tsx')
    })
  })

  describe('Index File', () => {
    it('should generate index.tsx entry point', () => {
      const result = generateScaffold(testSchema)

      expect(result.index.name).toBe('index')
      expect(result.index.code).toContain('import { App }')
      expect(result.index.code).toContain('createRoot')
    })
  })

  describe('File Structure', () => {
    it('should return all required files', () => {
      const result = generateScaffold(testSchema)

      expect(result.app).toBeDefined()
      expect(result.dataProvider).toBeDefined()
      expect(result.authProvider).toBeDefined()
      expect(result.resources).toBeDefined()
      expect(result.index).toBeDefined()
    })

    it('should have consistent file naming', () => {
      const result = generateScaffold(testSchema)

      expect(result.app.filePath).toBe('App.tsx')
      expect(result.index.filePath).toBe('index.tsx')
      expect(result.dataProvider.filePath).toBe('dataProvider.ts')
      expect(result.authProvider.filePath).toBe('authProvider.ts')
    })
  })
})
