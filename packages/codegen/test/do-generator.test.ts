/**
 * DO Subclass Generator Tests - RED Phase
 *
 * Tests for generating typed Durable Object subclasses from schema definitions.
 * These tests define the expected behavior and MUST FAIL until implementation is complete.
 *
 * Expected output structure:
 * - Class extending SaasKitDO
 * - Typed CRUD methods per resource (createUser, getUser, etc.)
 * - Zod validation schemas
 * - RPC allowedMethods set
 * - Relationship helper methods
 */

import { describe, it, expect } from 'vitest'
import { generateDOSubclass } from '@saaskit/codegen'
import type { SchemaDefinition } from '@saaskit/core'

// ============================================================================
// Test Schema Definitions
// ============================================================================

const basicSchema: SchemaDefinition = {
  name: 'MyApp',
  namespace: 'myapp.example.com',
  resources: {
    users: {
      fields: {
        name: 'string',
        email: { type: 'string', required: true }
      }
    },
    posts: {
      fields: {
        title: 'string',
        content: 'string'
      },
      relationships: {
        author: { resource: 'users', type: 'belongsTo' }
      }
    }
  }
}

const simpleSchema: SchemaDefinition = {
  name: 'Simple',
  namespace: 'simple.example.com',
  resources: {
    items: {
      fields: {
        name: { type: 'string', required: true },
        description: 'string'
      }
    }
  }
}

// ============================================================================
// Class Structure Tests
// ============================================================================

describe('generateDOSubclass - Class structure', () => {
  it('should generate a class extending SaasKitDO', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('extends SaasKitDO')
  })

  it('should import SaasKitDO from @saaskit/core', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain("import { SaasKitDO } from '@saaskit/core'")
  })

  it('should use schema name for class name by default', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toMatch(/class MyAppDO extends SaasKitDO/)
  })

  it('should allow custom class name via options', () => {
    const code = generateDOSubclass(basicSchema, { className: 'CustomDO' })

    expect(code).toMatch(/class CustomDO extends SaasKitDO/)
  })

  it('should export the class', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toMatch(/export (default )?class/)
  })
})

// ============================================================================
// CRUD Method Tests
// ============================================================================

describe('generateDOSubclass - CRUD methods', () => {
  it('should generate create method for each resource', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('async createUser(')
    expect(code).toContain('async createPost(')
  })

  it('should generate get/read method for each resource', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('async getUser(id: string)')
    expect(code).toContain('async getPost(id: string)')
  })

  it('should generate list method for each resource', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('async listUsers(')
    expect(code).toContain('async listPosts(')
  })

  it('should generate update method for each resource', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('async updateUser(')
    expect(code).toContain('async updatePost(')
  })

  it('should generate delete method for each resource', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('async deleteUser(')
    expect(code).toContain('async deletePost(')
  })

  it('should use singular resource names for methods', () => {
    const code = generateDOSubclass(basicSchema)

    // Should be createUser not createUsers
    expect(code).toContain('createUser')
    expect(code).not.toContain('createUsers')
  })

  it('should call parent class methods in implementations', () => {
    const code = generateDOSubclass(basicSchema)

    // Methods should delegate to this.create, this.read, etc.
    expect(code).toContain("this.create('users'")
    expect(code).toContain("this.read('users'")
  })
})

// ============================================================================
// Zod Validation Tests
// ============================================================================

describe('generateDOSubclass - Zod validation', () => {
  it('should import zod', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain("import { z } from 'zod'")
  })

  it('should generate Zod schema for each resource', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('const UserSchema = z.object')
    expect(code).toContain('const PostSchema = z.object')
  })

  it('should make required fields non-optional in Zod schema', () => {
    const code = generateDOSubclass(basicSchema)

    // email is required, so should be z.string() without optional()
    expect(code).toMatch(/email:\s*z\.string\(\)(?!\s*\.optional)/)
  })

  it('should make optional fields optional in Zod schema', () => {
    const code = generateDOSubclass(basicSchema)

    // name is optional, so should be z.string().optional()
    expect(code).toMatch(/name:\s*z\.string\(\)\s*\.optional\(\)/)
  })

  it('should use Zod schema in create method', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('UserSchema.parse')
  })

  it('should skip validation when option is false', () => {
    const code = generateDOSubclass(basicSchema, { includeValidation: false })

    expect(code).not.toContain('z.object')
    expect(code).not.toContain('Schema.parse')
  })
})

// ============================================================================
// RPC Allowlist Tests
// ============================================================================

describe('generateDOSubclass - RPC allowlist', () => {
  it('should define allowedMethods set', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('allowedMethods = new Set')
  })

  it('should include all CRUD methods in allowlist', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain("'createUser'")
    expect(code).toContain("'getUser'")
    expect(code).toContain("'listUsers'")
    expect(code).toContain("'updateUser'")
    expect(code).toContain("'deleteUser'")
  })

  it('should use protected visibility for allowedMethods', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('protected allowedMethods')
  })
})

// ============================================================================
// Relationship Helper Tests
// ============================================================================

describe('generateDOSubclass - Relationship helpers', () => {
  it('should generate helper method for belongsTo relationships', () => {
    const code = generateDOSubclass(basicSchema)

    // posts has author: { resource: 'users', type: 'belongsTo' }
    expect(code).toContain('async getPostAuthor(postId: string)')
  })

  it('should generate helper method for hasMany relationships', () => {
    const schemaWithHasMany: SchemaDefinition = {
      name: 'HasMany',
      namespace: 'hasmany.example.com',
      resources: {
        users: {
          fields: { name: 'string' },
          relationships: {
            posts: { resource: 'posts', type: 'hasMany' }
          }
        },
        posts: {
          fields: { title: 'string' }
        }
      }
    }

    const code = generateDOSubclass(schemaWithHasMany)

    // hasMany methods take userId and optional pagination options
    expect(code).toMatch(/async getUserPosts\(userId: string/)
  })

  it('should include relationship methods in allowlist', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain("'getPostAuthor'")
  })

  it('should skip relationship helpers when option is false', () => {
    const code = generateDOSubclass(basicSchema, { includeRelationships: false })

    expect(code).not.toContain('getPostAuthor')
  })
})

// ============================================================================
// TypeScript Validity Tests
// ============================================================================

describe('generateDOSubclass - TypeScript validity', () => {
  it('should generate valid TypeScript syntax', () => {
    const code = generateDOSubclass(basicSchema)

    // Basic syntax checks
    expect(code).toMatch(/^import/m) // Has imports at top
    expect(code).toMatch(/export.*class/) // Has class export
    expect(code).toMatch(/async \w+\(/) // Has async methods
  })

  it('should have proper type annotations on methods', () => {
    const code = generateDOSubclass(basicSchema)

    // Methods should have type annotations
    expect(code).toMatch(/getUser\(id:\s*string\)/)
    expect(code).toMatch(/deleteUser\(id:\s*string\):\s*Promise<boolean>/)
  })

  it('should include return type annotations', () => {
    const code = generateDOSubclass(basicSchema)

    expect(code).toContain('Promise<')
  })

  it('should generate valid schema-specific code', () => {
    const code = generateDOSubclass(simpleSchema)

    // Should have Item-specific code
    expect(code).toContain('ItemSchema')
    expect(code).toContain('createItem')
    expect(code).toContain('getItem')
  })
})

// ============================================================================
// Edge Cases
// ============================================================================

describe('generateDOSubclass - Edge cases', () => {
  it('should handle schema with no relationships', () => {
    const code = generateDOSubclass(simpleSchema)

    // Should still generate valid code
    expect(code).toContain('class SimpleDO')
    expect(code).toContain('createItem')
  })

  it('should handle resource names that need singularization', () => {
    const code = generateDOSubclass(basicSchema)

    // users -> User, posts -> Post
    expect(code).toContain('UserSchema')
    expect(code).toContain('PostSchema')
    expect(code).toContain('createUser')
    expect(code).toContain('createPost')
  })

  it('should handle empty resources object', () => {
    const emptySchema: SchemaDefinition = {
      name: 'Empty',
      namespace: 'empty.example.com',
      resources: {}
    }

    const code = generateDOSubclass(emptySchema)

    expect(code).toContain('class EmptyDO')
    expect(code).toContain('allowedMethods = new Set([')
  })

  it('should escape special characters in schema name', () => {
    const specialSchema: SchemaDefinition = {
      name: 'My-Special_App',
      namespace: 'special.example.com',
      resources: {
        items: { fields: { name: 'string' } }
      }
    }

    const code = generateDOSubclass(specialSchema)

    // Class name should be valid identifier
    expect(code).toMatch(/class \w+DO/)
    expect(code).not.toContain('My-Special_AppDO') // Hyphens not valid
  })
})

// ============================================================================
// Full Output Verification
// ============================================================================

describe('generateDOSubclass - Full output', () => {
  it('should generate complete, well-structured code', () => {
    const code = generateDOSubclass(basicSchema)

    // Should have all major sections
    expect(code).toContain('import') // Imports
    expect(code).toContain('const') // Schemas
    expect(code).toContain('class') // Class definition
    expect(code).toContain('allowedMethods') // RPC config
    expect(code).toContain('async') // Methods
  })

  it('should put imports at the top', () => {
    const code = generateDOSubclass(basicSchema)
    const lines = code.split('\n')

    // First non-empty, non-comment line should be import
    const firstCodeLine = lines.find(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('/*'))
    expect(firstCodeLine).toMatch(/^import/)
  })

  it('should have consistent indentation', () => {
    const code = generateDOSubclass(basicSchema)

    // Check for consistent 2-space indentation in class body
    const classBody = code.match(/class \w+ extends SaasKitDO \{([\s\S]*)\}/)?.[1]
    expect(classBody).toBeDefined()

    // Methods should be indented
    expect(code).toMatch(/\n  async \w+/)
  })
})
