/**
 * TDD RED Tests: Schema-to-Zod Type Generator
 *
 * These tests define the expected behavior for generating Zod schemas
 * from SaaSKit YAML schemas. All tests are expected to FAIL until
 * the generateZodSchemas function is implemented.
 *
 * @see saaskit-94i
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import type { SaaSSchema, Resource, Field } from '../types'

// Import the function we're testing
import { generateZodSchemas, type ZodSchemaResult } from '../zod-generator'

// ============================================================================
// Test Fixtures
// ============================================================================

const createField = (overrides: Partial<Field>): Field => ({
  name: 'testField',
  type: 'string',
  required: true,
  ...overrides,
})

const createResource = (overrides: Partial<Resource>): Resource => ({
  name: 'TestResource',
  fields: [],
  relations: [],
  ...overrides,
})

const createSchema = (resources: Resource[]): SaaSSchema => ({
  metadata: {
    name: 'test-app',
    version: '1.0.0',
    description: 'Test schema',
  },
  resources,
})

// ============================================================================
// Test Suite: Primitive Types to Zod Types
// ============================================================================

describe('Schema-to-Zod Generator', () => {
  describe('Primitive Type Mapping', () => {
    it('should convert string field to z.string()', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [createField({ name: 'name', type: 'string', required: true })],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(result.schemas.User).toBeDefined()
      // Validate that it accepts valid strings
      expect(() => result.schemas.User.parse({ name: 'Alice' })).not.toThrow()
      // Validate that it rejects non-strings
      expect(() => result.schemas.User.parse({ name: 123 })).toThrow()
    })

    it('should convert number field to z.number()', () => {
      const schema = createSchema([
        createResource({
          name: 'Product',
          fields: [createField({ name: 'price', type: 'number', required: true })],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.Product.parse({ price: 99.99 })).not.toThrow()
      expect(() => result.schemas.Product.parse({ price: 'not a number' })).toThrow()
    })

    it('should convert boolean field to z.boolean()', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [createField({ name: 'active', type: 'boolean', required: true })],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.User.parse({ active: true })).not.toThrow()
      expect(() => result.schemas.User.parse({ active: false })).not.toThrow()
      expect(() => result.schemas.User.parse({ active: 'yes' })).toThrow()
    })

    it('should convert date field to z.date() or z.coerce.date()', () => {
      const schema = createSchema([
        createResource({
          name: 'Event',
          fields: [createField({ name: 'startDate', type: 'date', required: true })],
        }),
      ])

      const result = generateZodSchemas(schema)

      // Should accept Date objects
      expect(() => result.schemas.Event.parse({ startDate: new Date() })).not.toThrow()
      // Should coerce valid date strings
      expect(() => result.schemas.Event.parse({ startDate: '2024-01-01' })).not.toThrow()
      // Should reject invalid dates
      expect(() => result.schemas.Event.parse({ startDate: 'not-a-date' })).toThrow()
    })

    it('should convert datetime field to z.date() with time', () => {
      const schema = createSchema([
        createResource({
          name: 'Event',
          fields: [createField({ name: 'createdAt', type: 'datetime', required: true })],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() =>
        result.schemas.Event.parse({ createdAt: new Date('2024-01-01T12:00:00Z') })
      ).not.toThrow()
      expect(() =>
        result.schemas.Event.parse({ createdAt: '2024-01-01T12:00:00Z' })
      ).not.toThrow()
    })

    it('should convert uuid field to z.string().uuid()', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [createField({ name: 'id', type: 'uuid', required: true })],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() =>
        result.schemas.User.parse({ id: '550e8400-e29b-41d4-a716-446655440000' })
      ).not.toThrow()
      expect(() => result.schemas.User.parse({ id: 'not-a-uuid' })).toThrow()
    })
  })

  // ============================================================================
  // Test Suite: Optional and Required Fields
  // ============================================================================

  describe('Optional and Required Fields', () => {
    it('should make required fields required in Zod schema', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [createField({ name: 'email', type: 'string', required: true })],
        }),
      ])

      const result = generateZodSchemas(schema)

      // Missing required field should fail
      expect(() => result.schemas.User.parse({})).toThrow()
      // Present required field should pass
      expect(() => result.schemas.User.parse({ email: 'test@example.com' })).not.toThrow()
    })

    it('should make optional fields optional with z.optional()', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [createField({ name: 'bio', type: 'string', required: false })],
        }),
      ])

      const result = generateZodSchemas(schema)

      // Missing optional field should pass
      expect(() => result.schemas.User.parse({})).not.toThrow()
      // Present optional field should pass
      expect(() => result.schemas.User.parse({ bio: 'Hello world' })).not.toThrow()
      // Undefined should pass
      expect(() => result.schemas.User.parse({ bio: undefined })).not.toThrow()
    })

    it('should handle mix of required and optional fields', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [
            createField({ name: 'email', type: 'string', required: true }),
            createField({ name: 'name', type: 'string', required: true }),
            createField({ name: 'bio', type: 'string', required: false }),
            createField({ name: 'age', type: 'number', required: false }),
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      // Only required fields
      expect(() =>
        result.schemas.User.parse({ email: 'a@b.com', name: 'Alice' })
      ).not.toThrow()
      // All fields
      expect(() =>
        result.schemas.User.parse({ email: 'a@b.com', name: 'Alice', bio: 'Hi', age: 30 })
      ).not.toThrow()
      // Missing required field
      expect(() => result.schemas.User.parse({ name: 'Alice' })).toThrow()
    })
  })

  // ============================================================================
  // Test Suite: Enum Fields
  // ============================================================================

  describe('Enum Fields', () => {
    it('should convert enum field to z.enum()', () => {
      const schema = createSchema([
        createResource({
          name: 'Task',
          fields: [
            createField({
              name: 'status',
              type: 'enum',
              required: true,
              annotations: { enumValues: ['pending', 'in_progress', 'completed'] },
            }),
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.Task.parse({ status: 'pending' })).not.toThrow()
      expect(() => result.schemas.Task.parse({ status: 'in_progress' })).not.toThrow()
      expect(() => result.schemas.Task.parse({ status: 'completed' })).not.toThrow()
      expect(() => result.schemas.Task.parse({ status: 'invalid_status' })).toThrow()
    })

    it('should handle optional enum fields', () => {
      const schema = createSchema([
        createResource({
          name: 'Task',
          fields: [
            createField({
              name: 'priority',
              type: 'enum',
              required: false,
              annotations: { enumValues: ['low', 'medium', 'high'] },
            }),
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.Task.parse({})).not.toThrow()
      expect(() => result.schemas.Task.parse({ priority: 'high' })).not.toThrow()
      expect(() => result.schemas.Task.parse({ priority: 'invalid' })).toThrow()
    })
  })

  // ============================================================================
  // Test Suite: Relation Fields
  // ============================================================================

  describe('Relation Fields', () => {
    it('should convert belongsTo relation to z.string() (ObjectId reference)', () => {
      const schema = createSchema([
        createResource({
          name: 'Post',
          fields: [],
          relations: [
            { name: 'author', to: 'User', cardinality: 'one', required: true },
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      // Should accept valid ObjectId strings
      expect(() =>
        result.schemas.Post.parse({ authorId: '507f1f77bcf86cd799439011' })
      ).not.toThrow()
      // Should reject non-string values
      expect(() => result.schemas.Post.parse({ authorId: 123 })).toThrow()
    })

    it('should make required relations required in schema', () => {
      const schema = createSchema([
        createResource({
          name: 'Comment',
          fields: [],
          relations: [
            { name: 'post', to: 'Post', cardinality: 'one', required: true },
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      // Missing required relation should fail
      expect(() => result.schemas.Comment.parse({})).toThrow()
    })

    it('should make optional relations optional in schema', () => {
      const schema = createSchema([
        createResource({
          name: 'Post',
          fields: [createField({ name: 'title', type: 'string', required: true })],
          relations: [
            { name: 'category', to: 'Category', cardinality: 'one', required: false },
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      // Without optional relation
      expect(() => result.schemas.Post.parse({ title: 'Hello' })).not.toThrow()
      // With optional relation
      expect(() =>
        result.schemas.Post.parse({ title: 'Hello', categoryId: '507f1f77bcf86cd799439011' })
      ).not.toThrow()
    })
  })

  // ============================================================================
  // Test Suite: Auto Fields (id, createdAt, updatedAt)
  // ============================================================================

  describe('Auto Fields', () => {
    it('should generate optional id field with default', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [
            createField({
              name: 'id',
              type: 'string',
              required: false,
              annotations: { primaryKey: true },
            }),
            createField({ name: 'name', type: 'string', required: true }),
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      // id should be optional for create operations
      expect(() => result.schemas.User.parse({ name: 'Alice' })).not.toThrow()
      // id can be provided
      expect(() =>
        result.schemas.User.parse({ name: 'Alice', id: '507f1f77bcf86cd799439011' })
      ).not.toThrow()
    })

    it('should generate optional timestamp fields', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [createField({ name: 'name', type: 'string', required: true })],
          timestamps: { createdAt: true, updatedAt: true },
        }),
      ])

      const result = generateZodSchemas(schema)

      // Timestamps should be optional
      expect(() => result.schemas.User.parse({ name: 'Alice' })).not.toThrow()
      // Timestamps can be provided
      expect(() =>
        result.schemas.User.parse({
          name: 'Alice',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ).not.toThrow()
    })
  })

  // ============================================================================
  // Test Suite: Nested Validation Patterns
  // ============================================================================

  describe('Nested Validation Patterns', () => {
    it('should add email validation for email type', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [createField({ name: 'email', type: 'email', required: true })],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.User.parse({ email: 'valid@example.com' })).not.toThrow()
      expect(() => result.schemas.User.parse({ email: 'invalid-email' })).toThrow()
      expect(() => result.schemas.User.parse({ email: 'missing@tld' })).toThrow()
    })

    it('should add url validation for url type', () => {
      const schema = createSchema([
        createResource({
          name: 'Link',
          fields: [createField({ name: 'href', type: 'url', required: true })],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.Link.parse({ href: 'https://example.com' })).not.toThrow()
      expect(() => result.schemas.Link.parse({ href: 'http://example.com/path' })).not.toThrow()
      expect(() => result.schemas.Link.parse({ href: 'not-a-url' })).toThrow()
    })

    it('should add min/max validation for strings', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [
            createField({
              name: 'username',
              type: 'string',
              required: true,
              annotations: { min: 3, max: 20 },
            }),
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.User.parse({ username: 'alice' })).not.toThrow()
      expect(() => result.schemas.User.parse({ username: 'ab' })).toThrow() // too short
      expect(() =>
        result.schemas.User.parse({ username: 'a'.repeat(21) })
      ).toThrow() // too long
    })

    it('should add min/max validation for numbers', () => {
      const schema = createSchema([
        createResource({
          name: 'Product',
          fields: [
            createField({
              name: 'price',
              type: 'number',
              required: true,
              annotations: { min: 0, max: 10000 },
            }),
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.Product.parse({ price: 100 })).not.toThrow()
      expect(() => result.schemas.Product.parse({ price: -1 })).toThrow() // below min
      expect(() => result.schemas.Product.parse({ price: 10001 })).toThrow() // above max
    })

    it('should add pattern validation for custom regex', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [
            createField({
              name: 'phone',
              type: 'string',
              required: true,
              annotations: { pattern: '^\\+?[1-9]\\d{1,14}$' },
            }),
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.User.parse({ phone: '+15551234567' })).not.toThrow()
      expect(() => result.schemas.User.parse({ phone: 'invalid-phone' })).toThrow()
    })
  })

  // ============================================================================
  // Test Suite: Array Fields
  // ============================================================================

  describe('Array Fields', () => {
    it('should convert array field to z.array()', () => {
      const schema = createSchema([
        createResource({
          name: 'Post',
          fields: [
            createField({
              name: 'tags',
              type: 'array',
              required: true,
              annotations: { arrayType: 'string' },
            }),
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.Post.parse({ tags: ['tech', 'news'] })).not.toThrow()
      expect(() => result.schemas.Post.parse({ tags: [] })).not.toThrow()
      expect(() => result.schemas.Post.parse({ tags: 'not-an-array' })).toThrow()
      expect(() => result.schemas.Post.parse({ tags: [1, 2, 3] })).toThrow() // wrong item type
    })

    it('should handle array of numbers', () => {
      const schema = createSchema([
        createResource({
          name: 'Stats',
          fields: [
            createField({
              name: 'values',
              type: 'array',
              required: true,
              annotations: { arrayType: 'number' },
            }),
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.Stats.parse({ values: [1, 2, 3] })).not.toThrow()
      expect(() => result.schemas.Stats.parse({ values: ['a', 'b'] })).toThrow()
    })
  })

  // ============================================================================
  // Test Suite: JSON Fields
  // ============================================================================

  describe('JSON Fields', () => {
    it('should convert json field to z.record() or z.unknown()', () => {
      const schema = createSchema([
        createResource({
          name: 'Config',
          fields: [createField({ name: 'settings', type: 'json', required: true })],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(() => result.schemas.Config.parse({ settings: { key: 'value' } })).not.toThrow()
      expect(() => result.schemas.Config.parse({ settings: [1, 2, 3] })).not.toThrow()
      expect(() => result.schemas.Config.parse({ settings: 'string' })).not.toThrow()
    })
  })

  // ============================================================================
  // Test Suite: Full Resource Schema
  // ============================================================================

  describe('Full Resource Schema', () => {
    it('should generate complete Zod schema for a complex resource', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [
            createField({
              name: 'id',
              type: 'string',
              required: false,
              annotations: { primaryKey: true },
            }),
            createField({ name: 'email', type: 'email', required: true }),
            createField({ name: 'name', type: 'string', required: true }),
            createField({ name: 'age', type: 'number', required: false }),
            createField({ name: 'active', type: 'boolean', required: true }),
            createField({
              name: 'role',
              type: 'enum',
              required: true,
              annotations: { enumValues: ['admin', 'user', 'guest'] },
            }),
            createField({
              name: 'tags',
              type: 'array',
              required: false,
              annotations: { arrayType: 'string' },
            }),
          ],
          timestamps: { createdAt: true, updatedAt: true },
        }),
      ])

      const result = generateZodSchemas(schema)

      // Valid complete user
      const validUser = {
        email: 'alice@example.com',
        name: 'Alice',
        active: true,
        role: 'admin',
      }
      expect(() => result.schemas.User.parse(validUser)).not.toThrow()

      // Valid user with all optional fields
      const fullUser = {
        id: '507f1f77bcf86cd799439011',
        email: 'alice@example.com',
        name: 'Alice',
        age: 30,
        active: true,
        role: 'admin',
        tags: ['developer', 'manager'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(() => result.schemas.User.parse(fullUser)).not.toThrow()

      // Invalid - missing required field
      expect(() =>
        result.schemas.User.parse({ email: 'a@b.com', name: 'Alice', active: true })
      ).toThrow() // missing role

      // Invalid - wrong type
      expect(() =>
        result.schemas.User.parse({ ...validUser, age: 'thirty' })
      ).toThrow()

      // Invalid - wrong enum value
      expect(() =>
        result.schemas.User.parse({ ...validUser, role: 'superadmin' })
      ).toThrow()
    })

    it('should generate schemas for multiple resources', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [createField({ name: 'name', type: 'string', required: true })],
          relations: [],
        }),
        createResource({
          name: 'Post',
          fields: [createField({ name: 'title', type: 'string', required: true })],
          relations: [{ name: 'author', to: 'User', cardinality: 'one', required: true }],
        }),
      ])

      const result = generateZodSchemas(schema)

      expect(result.schemas.User).toBeDefined()
      expect(result.schemas.Post).toBeDefined()

      expect(() => result.schemas.User.parse({ name: 'Alice' })).not.toThrow()
      expect(() =>
        result.schemas.Post.parse({ title: 'Hello', authorId: '507f1f77bcf86cd799439011' })
      ).not.toThrow()
    })
  })

  // ============================================================================
  // Test Suite: TypeScript Type Inference
  // ============================================================================

  describe('TypeScript Type Inference', () => {
    it('should export types that can be used with z.infer', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [
            createField({ name: 'email', type: 'email', required: true }),
            createField({ name: 'name', type: 'string', required: true }),
          ],
        }),
      ])

      const result = generateZodSchemas(schema)

      // The types property should exist and contain TypeScript type strings
      expect(result.types).toBeDefined()
      expect(result.types.User).toBeDefined()

      // Type should be inferrable
      type User = z.infer<typeof result.schemas.User>
      const user: User = { email: 'a@b.com', name: 'Alice' }
      expect(user.email).toBe('a@b.com')
    })
  })

  // ============================================================================
  // Test Suite: Create vs Update Schemas
  // ============================================================================

  describe('Create vs Update Schemas', () => {
    it('should generate separate create and update schemas if requested', () => {
      const schema = createSchema([
        createResource({
          name: 'User',
          fields: [
            createField({
              name: 'id',
              type: 'string',
              required: false,
              annotations: { primaryKey: true },
            }),
            createField({ name: 'email', type: 'email', required: true }),
            createField({ name: 'name', type: 'string', required: true }),
          ],
          timestamps: { createdAt: true, updatedAt: true },
        }),
      ])

      const result = generateZodSchemas(schema, { generateVariants: true })

      // Create schema should not require id or timestamps
      expect(result.createSchemas?.User).toBeDefined()
      expect(() =>
        result.createSchemas?.User.parse({ email: 'a@b.com', name: 'Alice' })
      ).not.toThrow()

      // Update schema should make all fields optional (partial update)
      expect(result.updateSchemas?.User).toBeDefined()
      expect(() => result.updateSchemas?.User.parse({ name: 'Bob' })).not.toThrow()
      expect(() => result.updateSchemas?.User.parse({})).not.toThrow()
    })
  })
})
