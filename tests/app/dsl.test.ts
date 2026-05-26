/**
 * Field-shorthand DSL → Zod compiler tests (ADR 0023).
 */

import { describe, expect, it } from 'bun:test'
import { z } from 'zod'
import { autoFieldDefs, compileEntity, fieldToZod, parseFieldShorthand } from '../../src/app/dsl'

describe('parseFieldShorthand', () => {
	it('parses scalar keywords', () => {
		for (const kind of [
			'text',
			'number',
			'boolean',
			'date',
			'datetime',
			'email',
			'url',
			'json',
		] as const) {
			expect(parseFieldShorthand('f', kind)).toEqual({ name: 'f', kind, optional: false })
		}
	})

	it('marks trailing ? as optional', () => {
		expect(parseFieldShorthand('notes', 'text?')).toEqual({
			name: 'notes',
			kind: 'text',
			optional: true,
		})
	})

	it('parses union literals into enums (in declared order)', () => {
		expect(parseFieldShorthand('status', 'open | paid | void')).toEqual({
			name: 'status',
			kind: 'enum',
			optional: false,
			values: ['open', 'paid', 'void'],
		})
	})

	it('parses optional enums', () => {
		expect(parseFieldShorthand('status', 'a | b?')).toEqual({
			name: 'status',
			kind: 'enum',
			optional: true,
			values: ['a', 'b'],
		})
	})

	it('parses belongsTo relations', () => {
		expect(parseFieldShorthand('customer', '-> Customer')).toEqual({
			name: 'customer',
			kind: 'belongsTo',
			optional: false,
			target: 'Customer',
		})
	})

	it('parses hasMany relations', () => {
		expect(parseFieldShorthand('lineItems', '-> LineItem[]')).toEqual({
			name: 'lineItems',
			kind: 'hasMany',
			optional: false,
			target: 'LineItem',
		})
	})

	it('parses optional relations', () => {
		expect(parseFieldShorthand('customer', '-> Customer?')).toEqual({
			name: 'customer',
			kind: 'belongsTo',
			optional: true,
			target: 'Customer',
		})
	})

	it('tolerates whitespace around relation arrows', () => {
		expect(parseFieldShorthand('c', '->Customer').target).toBe('Customer')
		expect(parseFieldShorthand('c', '->  Customer  ').target).toBe('Customer')
	})

	it('throws on unrecognised shorthand', () => {
		expect(() => parseFieldShorthand('f', 'wat')).toThrow(/Unrecognised field shorthand/)
	})

	it('throws on invalid relation targets', () => {
		expect(() => parseFieldShorthand('f', '-> 123bad')).toThrow(/Invalid relation target/)
	})

	it('throws on empty enum', () => {
		expect(() => parseFieldShorthand('f', ' | ')).toThrow(/at least one value/)
	})
})

describe('fieldToZod', () => {
	it('produces strict scalar schemas', () => {
		expect(fieldToZod({ name: 'a', kind: 'number', optional: false }).safeParse(1).success).toBe(
			true,
		)
		expect(fieldToZod({ name: 'a', kind: 'number', optional: false }).safeParse('1').success).toBe(
			false,
		)
		expect(
			fieldToZod({ name: 'a', kind: 'boolean', optional: false }).safeParse(true).success,
		).toBe(true)
	})

	it('validates email and url', () => {
		const email = fieldToZod({ name: 'e', kind: 'email', optional: false })
		expect(email.safeParse('a@b.com').success).toBe(true)
		expect(email.safeParse('nope').success).toBe(false)
		const url = fieldToZod({ name: 'u', kind: 'url', optional: false })
		expect(url.safeParse('https://x.dev').success).toBe(true)
		expect(url.safeParse('nope').success).toBe(false)
	})

	it('validates date (ISO YYYY-MM-DD) and datetime (ISO 8601)', () => {
		const date = fieldToZod({ name: 'd', kind: 'date', optional: false })
		expect(date.safeParse('2026-05-25').success).toBe(true)
		expect(date.safeParse('2026-05-25T00:00:00Z').success).toBe(false)
		const dt = fieldToZod({ name: 'd', kind: 'datetime', optional: false })
		expect(dt.safeParse('2026-05-25T00:00:00Z').success).toBe(true)
		expect(dt.safeParse('2026-05-25').success).toBe(false)
	})

	it('validates enums against declared values', () => {
		const e = fieldToZod({
			name: 's',
			kind: 'enum',
			optional: false,
			values: ['open', 'paid'],
		})
		expect(e.safeParse('open').success).toBe(true)
		expect(e.safeParse('void').success).toBe(false)
	})

	it('represents belongsTo as a handle string and hasMany as a string array', () => {
		const b = fieldToZod({ name: 'c', kind: 'belongsTo', optional: false, target: 'Customer' })
		expect(b.safeParse('CST_x').success).toBe(true)
		expect(b.safeParse(123).success).toBe(false)
		const h = fieldToZod({ name: 'l', kind: 'hasMany', optional: false, target: 'LineItem' })
		expect(h.safeParse(['a', 'b']).success).toBe(true)
		expect(h.safeParse('a').success).toBe(false)
	})

	it('accepts arbitrary JSON values for json fields', () => {
		const j = fieldToZod({ name: 'meta', kind: 'json', optional: false })
		expect(j.safeParse({ a: [1, 'x', { b: true }] }).success).toBe(true)
		expect(j.safeParse('plain string').success).toBe(true)
		expect(j.safeParse(42).success).toBe(true)
	})

	it('makes optional fields accept undefined', () => {
		const o = fieldToZod({ name: 'n', kind: 'text', optional: true })
		expect(o.safeParse(undefined).success).toBe(true)
		const r = fieldToZod({ name: 'n', kind: 'text', optional: false })
		expect(r.safeParse(undefined).success).toBe(false)
	})
})

describe('autoFieldDefs', () => {
	it('always provides id, createdAt, updatedAt', () => {
		const names = autoFieldDefs().map((f) => f.name)
		expect(names).toEqual(['id', 'createdAt', 'updatedAt'])
		expect(autoFieldDefs().every((f) => f.auto)).toBe(true)
	})
})

describe('compileEntity (shorthand)', () => {
	const compiled = compileEntity('Invoice', {
		amount: 'number',
		status: 'open | paid | void',
		notes: 'text?',
		customer: '-> Customer',
		lineItems: '-> LineItem[]',
	})

	it('marks the first field as the display field', () => {
		expect(compiled.displayField).toBe('amount')
		expect(compiled.fields[0].display).toBe(true)
		expect(compiled.fields.slice(1).every((f) => !f.display)).toBe(true)
	})

	it('preserves field declaration order', () => {
		expect(compiled.fields.map((f) => f.name)).toEqual([
			'amount',
			'status',
			'notes',
			'customer',
			'lineItems',
		])
	})

	it('appends auto fields and includes them in the schema', () => {
		expect(compiled.autoFields.map((f) => f.name)).toEqual(['id', 'createdAt', 'updatedAt'])
		expect(Object.keys(compiled.schema.shape)).toContain('id')
		expect(Object.keys(compiled.schema.shape)).toContain('createdAt')
		expect(Object.keys(compiled.schema.shape)).toContain('updatedAt')
	})

	it('produces a working entity Zod schema', () => {
		const result = compiled.schema.safeParse({
			amount: 100,
			status: 'open',
			customer: 'CST_1',
			lineItems: [],
			id: 'abc',
			createdAt: '2026-05-25T00:00:00Z',
			updatedAt: '2026-05-25T00:00:00Z',
		})
		expect(result.success).toBe(true)
	})

	it('is not flagged fromZod for shorthand entities', () => {
		expect(compiled.fromZod).toBe(false)
	})

	it('rejects non-string field values', () => {
		expect(() => compileEntity('X', { f: 123 as unknown as string })).toThrow(
			/must be a shorthand string or a Zod schema/,
		)
	})
})

describe('compileEntity (Zod escape hatch)', () => {
	const compiled = compileEntity(
		'Widget',
		z.object({ name: z.string(), price: z.number().optional(), kind: z.enum(['a', 'b']) }),
	)

	it('is flagged fromZod', () => {
		expect(compiled.fromZod).toBe(true)
	})

	it('infers field kinds from the Zod shape', () => {
		const byName = Object.fromEntries(compiled.fields.map((f) => [f.name, f]))
		expect(byName.name.kind).toBe('text')
		expect(byName.price.kind).toBe('number')
		expect(byName.price.optional).toBe(true)
		expect(byName.kind.kind).toBe('enum')
	})

	it('merges in auto fields', () => {
		expect(Object.keys(compiled.schema.shape)).toContain('id')
		expect(Object.keys(compiled.schema.shape)).toContain('createdAt')
	})
})
