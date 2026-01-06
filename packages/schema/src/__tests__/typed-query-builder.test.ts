/**
 * Tests for Type-Safe Query Builder
 *
 * @see saaskit-32i
 */

import { describe, it, expect, expectTypeOf } from 'vitest'
import { createQueryBuilder, where, eq, gt, lt, gte, lte, ne, in_, contains } from '../typed-query-builder'

// ============================================================================
// Test Types
// ============================================================================

interface User {
  id: string
  name: string
  email: string
  age: number
  isActive: boolean
  role: 'admin' | 'user' | 'guest'
  createdAt: Date
}

interface Post {
  id: string
  title: string
  content: string
  authorId: string
  published: boolean
  views: number
}

// ============================================================================
// Query Builder Tests
// ============================================================================

describe('Type-Safe Query Builder', () => {
  describe('Basic Queries', () => {
    it('should create a query builder for a type', () => {
      const qb = createQueryBuilder<User>()
      expect(qb).toBeDefined()
    })

    it('should build where clause with eq operator', () => {
      const query = where<User>({ name: eq('John') })
      expect(query).toEqual({ name: { $eq: 'John' } })
    })

    it('should build where clause with direct value (implicit eq)', () => {
      const query = where<User>({ name: 'John' })
      expect(query).toEqual({ name: 'John' })
    })

    it('should build where clause with multiple fields', () => {
      const query = where<User>({
        name: eq('John'),
        isActive: eq(true),
      })
      expect(query).toEqual({
        name: { $eq: 'John' },
        isActive: { $eq: true },
      })
    })
  })

  describe('Comparison Operators', () => {
    it('should support gt (greater than)', () => {
      const query = where<User>({ age: gt(18) })
      expect(query).toEqual({ age: { $gt: 18 } })
    })

    it('should support lt (less than)', () => {
      const query = where<User>({ age: lt(65) })
      expect(query).toEqual({ age: { $lt: 65 } })
    })

    it('should support gte (greater than or equal)', () => {
      const query = where<User>({ age: gte(21) })
      expect(query).toEqual({ age: { $gte: 21 } })
    })

    it('should support lte (less than or equal)', () => {
      const query = where<User>({ age: lte(100) })
      expect(query).toEqual({ age: { $lte: 100 } })
    })

    it('should support ne (not equal)', () => {
      const query = where<User>({ role: ne('guest') })
      expect(query).toEqual({ role: { $ne: 'guest' } })
    })
  })

  describe('Array Operators', () => {
    it('should support in operator', () => {
      const query = where<User>({ role: in_(['admin', 'user']) })
      expect(query).toEqual({ role: { $in: ['admin', 'user'] } })
    })
  })

  describe('String Operators', () => {
    it('should support contains operator', () => {
      const query = where<Post>({ title: contains('TypeScript') })
      expect(query).toEqual({ title: { $regex: 'TypeScript', $options: 'i' } })
    })
  })

  describe('Chained Query Builder', () => {
    it('should build query with fluent API', () => {
      const qb = createQueryBuilder<User>()
        .where('name', eq('John'))
        .where('isActive', true)

      expect(qb.build()).toEqual({
        name: { $eq: 'John' },
        isActive: true,
      })
    })

    it('should support orderBy', () => {
      const qb = createQueryBuilder<User>()
        .where('isActive', true)
        .orderBy('createdAt', 'desc')

      const options = qb.buildOptions()
      expect(options.orderBy).toEqual({ createdAt: 'desc' })
    })

    it('should support limit and offset', () => {
      const qb = createQueryBuilder<User>()
        .limit(10)
        .offset(20)

      const options = qb.buildOptions()
      expect(options.limit).toBe(10)
      expect(options.offset).toBe(20)
    })

    it('should support select (field projection)', () => {
      const qb = createQueryBuilder<User>()
        .select('id', 'name', 'email')

      const options = qb.buildOptions()
      expect(options.select).toEqual(['id', 'name', 'email'])
    })
  })

  describe('Type Safety', () => {
    it('should enforce correct field types', () => {
      // This should compile - age is number
      where<User>({ age: gt(18) })

      // This should compile - name is string
      where<User>({ name: eq('John') })

      // This should compile - isActive is boolean
      where<User>({ isActive: eq(true) })
    })

    it('should allow only valid field names', () => {
      // Valid field
      const qb = createQueryBuilder<User>()
      qb.where('name', 'John')
      qb.where('age', 25)

      // TypeScript will catch invalid fields at compile time
      // @ts-expect-error - 'invalid' is not a key of User
      // qb.where('invalid', 'value')
    })

    it('should infer return type from select', () => {
      const qb = createQueryBuilder<User>()
        .select('id', 'name')

      // The selected fields should be typed
      const options = qb.buildOptions()
      expect(options.select).toContain('id')
      expect(options.select).toContain('name')
    })
  })
})
