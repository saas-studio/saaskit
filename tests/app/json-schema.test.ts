/**
 * Zod → JSON Schema conversion tests.
 */

import { describe, expect, it } from 'bun:test'
import { z } from 'zod'
import { zodToJsonSchema } from '../../src/app/json-schema'

describe('zodToJsonSchema', () => {
	it('converts scalars', () => {
		expect(zodToJsonSchema(z.string())).toEqual({ type: 'string' })
		expect(zodToJsonSchema(z.number())).toEqual({ type: 'number' })
		expect(zodToJsonSchema(z.number().int())).toEqual({ type: 'integer' })
		expect(zodToJsonSchema(z.boolean())).toEqual({ type: 'boolean' })
	})

	it('encodes string formats', () => {
		expect(zodToJsonSchema(z.string().email())).toEqual({ type: 'string', format: 'email' })
		expect(zodToJsonSchema(z.string().url())).toEqual({ type: 'string', format: 'uri' })
		expect(zodToJsonSchema(z.string().datetime())).toEqual({
			type: 'string',
			format: 'date-time',
		})
	})

	it('encodes string min/max and pattern', () => {
		expect(zodToJsonSchema(z.string().min(2).max(8))).toEqual({
			type: 'string',
			minLength: 2,
			maxLength: 8,
		})
		const re = zodToJsonSchema(z.string().regex(/^\d+$/)) as { pattern: string }
		expect(re.pattern).toBe('^\\d+$')
	})

	it('encodes number min/max', () => {
		expect(zodToJsonSchema(z.number().min(0).max(10))).toEqual({
			type: 'number',
			minimum: 0,
			maximum: 10,
		})
	})

	it('converts enums', () => {
		expect(zodToJsonSchema(z.enum(['a', 'b', 'c']))).toEqual({
			type: 'string',
			enum: ['a', 'b', 'c'],
		})
	})

	it('converts arrays', () => {
		expect(zodToJsonSchema(z.array(z.string()))).toEqual({
			type: 'array',
			items: { type: 'string' },
		})
	})

	it('converts objects with required tracking', () => {
		const schema = zodToJsonSchema(z.object({ a: z.string(), b: z.number().optional() })) as {
			required?: string[]
			additionalProperties: boolean
		}
		expect(schema.required).toEqual(['a'])
		expect(schema.additionalProperties).toBe(false)
	})

	it('treats default-wrapped fields as optional in required and emits a default', () => {
		const schema = zodToJsonSchema(z.object({ a: z.string().default('x') })) as {
			required?: string[]
			properties: { a: { default: unknown } }
		}
		expect(schema.required).toBeUndefined()
		expect(schema.properties.a.default).toBe('x')
	})

	it('unwraps optional/nullable', () => {
		expect(zodToJsonSchema(z.string().optional())).toEqual({ type: 'string' })
		expect(zodToJsonSchema(z.number().nullable())).toEqual({ type: 'number' })
	})

	it('converts records and unions', () => {
		expect(zodToJsonSchema(z.record(z.number()))).toEqual({
			type: 'object',
			additionalProperties: { type: 'number' },
		})
		const union = zodToJsonSchema(z.union([z.string(), z.number()])) as { anyOf: unknown[] }
		expect(union.anyOf).toEqual([{ type: 'string' }, { type: 'number' }])
	})
})
