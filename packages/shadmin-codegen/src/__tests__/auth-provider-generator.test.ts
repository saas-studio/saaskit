/**
 * Tests for Auth Provider Generator
 *
 * @see saaskit-qnr
 */

import { describe, it, expect } from 'vitest'
import { generateAuthProvider } from '../generators/auth-provider'
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

// ============================================================================
// Test Schemas
// ============================================================================

const basicSchema: SaaSSchema = {
  metadata: {
    name: 'BasicApp',
    version: '1.0.0',
  },
  resources: [
    createResource('Post', [
      createField({ name: 'id', type: 'uuid' }),
      createField({ name: 'title', type: 'string', required: true }),
    ]),
  ],
}

const schemaWithUser: SaaSSchema = {
  metadata: {
    name: 'UserApp',
    version: '1.0.0',
  },
  resources: [
    createResource('User', [
      createField({ name: 'id', type: 'uuid' }),
      createField({ name: 'email', type: 'email', required: true }),
      createField({ name: 'name', type: 'string', required: true }),
      createField({ name: 'avatar', type: 'url' }),
    ]),
    createResource('Post', [
      createField({ name: 'id', type: 'uuid' }),
      createField({ name: 'title', type: 'string', required: true }),
    ]),
  ],
}

const schemaWithUserAndRoles: SaaSSchema = {
  metadata: {
    name: 'RolesApp',
    version: '1.0.0',
  },
  resources: [
    createResource('User', [
      createField({ name: 'id', type: 'uuid' }),
      createField({ name: 'email', type: 'email', required: true }),
      createField({ name: 'fullName', type: 'string' }),
      createField({ name: 'role', type: 'string' }),
    ]),
  ],
}

const schemaWithAccountResource: SaaSSchema = {
  metadata: {
    name: 'AccountApp',
    version: '1.0.0',
  },
  resources: [
    createResource('Account', [
      createField({ name: 'id', type: 'uuid' }),
      createField({ name: 'email', type: 'email', required: true }),
      createField({ name: 'displayName', type: 'string' }),
    ]),
  ],
}

const schemaWithUsernameUser: SaaSSchema = {
  metadata: {
    name: 'UsernameApp',
    version: '1.0.0',
  },
  resources: [
    createResource('User', [
      createField({ name: 'id', type: 'uuid' }),
      createField({ name: 'username', type: 'string', required: true }),
    ]),
  ],
}

// ============================================================================
// Auth Provider Generator Tests
// ============================================================================

describe('Auth Provider Generator', () => {
  describe('Basic Generation', () => {
    it('should generate a valid authProvider component', () => {
      const result = generateAuthProvider(basicSchema)

      expect(result.name).toBe('authProvider')
      expect(result.filePath).toBe('authProvider.ts')
      expect(result.imports).toContain('AuthProvider')
      expect(result.code).toContain('export const authProvider: AuthProvider')
    })

    it('should include all required auth methods', () => {
      const result = generateAuthProvider(basicSchema)

      expect(result.code).toContain('login:')
      expect(result.code).toContain('logout:')
      expect(result.code).toContain('checkAuth:')
      expect(result.code).toContain('checkError:')
      expect(result.code).toContain('getIdentity:')
      expect(result.code).toContain('getPermissions:')
    })

    it('should use default username/password login when no User resource', () => {
      const result = generateAuthProvider(basicSchema)

      expect(result.code).toContain('{ username, password }')
      expect(result.code).toContain('username: username')
    })

    it('should use default storage key', () => {
      const result = generateAuthProvider(basicSchema)

      expect(result.code).toContain("localStorage.setItem('auth'")
      expect(result.code).toContain("localStorage.getItem('auth')")
      expect(result.code).toContain("localStorage.removeItem('auth')")
    })

    it('should return empty permissions by default', () => {
      const result = generateAuthProvider(basicSchema)

      expect(result.code).toContain('return []')
    })
  })

  describe('User Resource Customization', () => {
    it('should use email for login when User has email field', () => {
      const result = generateAuthProvider(schemaWithUser)

      expect(result.code).toContain('{ email, password }')
      expect(result.code).toContain('email: email')
    })

    it('should extract name field for identity', () => {
      const result = generateAuthProvider(schemaWithUser)

      expect(result.code).toContain('name: identifier')
    })

    it('should extract avatar field for identity when present', () => {
      const result = generateAuthProvider(schemaWithUser)

      expect(result.code).toContain('avatar: parsed.avatar')
    })

    it('should handle fullName field variant', () => {
      const result = generateAuthProvider(schemaWithUserAndRoles)

      expect(result.code).toContain('fullName: parsed.fullName')
    })

    it('should recognize Account resource as user resource', () => {
      const result = generateAuthProvider(schemaWithAccountResource)

      expect(result.code).toContain('{ email, password }')
      expect(result.code).toContain('Customized for Account resource')
    })

    it('should handle username field when no email', () => {
      const result = generateAuthProvider(schemaWithUsernameUser)

      expect(result.code).toContain('{ username, password }')
      expect(result.code).toContain('fullName: parsed.username')
    })
  })

  describe('Role/Permission Support', () => {
    it('should include role field in stored auth when present', () => {
      const result = generateAuthProvider(schemaWithUserAndRoles)

      expect(result.code).toContain('role: []')
    })

    it('should return role from getPermissions when available', () => {
      const result = generateAuthProvider(schemaWithUserAndRoles)

      expect(result.code).toContain('const { role } = JSON.parse(auth)')
      expect(result.code).toContain('return role || []')
    })

    it('should not include role handling when no role field', () => {
      const result = generateAuthProvider(schemaWithUser)

      expect(result.code).not.toContain('const { role }')
    })
  })

  describe('Options', () => {
    it('should use custom storage key when provided', () => {
      const result = generateAuthProvider(basicSchema, { storageKey: 'my_auth_token' })

      expect(result.code).toContain("localStorage.setItem('my_auth_token'")
      expect(result.code).toContain("localStorage.getItem('my_auth_token')")
      expect(result.code).toContain("localStorage.removeItem('my_auth_token')")
    })

    it('should use default permissions when provided', () => {
      const result = generateAuthProvider(basicSchema, {
        defaultPermissions: ['read', 'write']
      })

      expect(result.code).toContain('return ["read","write"]')
    })

    it('should disable permission handling when includePermissions is false', () => {
      const result = generateAuthProvider(schemaWithUserAndRoles, {
        includePermissions: false,
      })

      expect(result.code).not.toContain('const { role }')
    })
  })

  describe('Generated Code Quality', () => {
    it('should include schema name in comment', () => {
      const result = generateAuthProvider(schemaWithUser)

      expect(result.code).toContain('Auth Provider for UserApp')
    })

    it('should include @generated tag', () => {
      const result = generateAuthProvider(basicSchema)

      expect(result.code).toContain('@generated by @saaskit/shadmin-codegen')
    })

    it('should handle error status codes correctly', () => {
      const result = generateAuthProvider(basicSchema)

      expect(result.code).toContain('status === 401 || status === 403')
      expect(result.code).toContain('error?.status || error?.response?.status')
    })

    it('should include TODO comment for authentication implementation', () => {
      const result = generateAuthProvider(basicSchema)

      expect(result.code).toContain('TODO: Implement actual authentication logic')
    })
  })
})
