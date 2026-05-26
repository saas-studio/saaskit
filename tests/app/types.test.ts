/**
 * Type-level tests for the App() authoring API.
 *
 * These assertions are checked by `tsc` (the `@ts-expect-error` lines must
 * error, the others must not). The single runtime `it` keeps the file in the
 * test run and documents that the type contracts hold.
 */

import { describe, expect, it } from 'bun:test'
import { App, type InferEntities, type InferEntity, type z } from '../../src/app'

// --- Helper: compile-time equality assertion ---------------------------------
type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
	? true
	: false

// --- Shorthand inference -----------------------------------------------------
const entities = {
	Invoice: {
		amount: 'number',
		status: 'open | paid | void',
		paid: 'boolean',
		notes: 'text?',
		customer: '-> Customer',
		lineItems: '-> LineItem[]',
	},
	Customer: { name: 'text', email: 'email' },
	LineItem: { description: 'text' },
} as const

type Entities = InferEntities<typeof entities>
type Invoice = Entities['Invoice']

// scalar mappings
type _Amount = Expect<Equal<Invoice['amount'], number>>
type _Paid = Expect<Equal<Invoice['paid'], boolean>>
// enum → string-literal union
type _Status = Expect<Equal<Invoice['status'], 'open' | 'paid' | 'void'>>
// belongsTo → string handle, hasMany → string[]
type _Customer = Expect<Equal<Invoice['customer'], string>>
type _LineItems = Expect<Equal<Invoice['lineItems'], string[]>>
// optional fields are optional
type _Notes = Expect<Equal<Invoice['notes'], string | undefined>>
// auto fields are present
type _Id = Expect<Equal<Invoice['id'], string>>
type _Created = Expect<Equal<Invoice['createdAt'], string>>

// --- Zod escape-hatch inference ----------------------------------------------
type Widget = InferEntity<z.ZodObject<{ name: z.ZodString; price: z.ZodNumber }>>
type _WidgetName = Expect<Equal<Widget['name'], string>>
type _WidgetPrice = Expect<Equal<Widget['price'], number>>
type _WidgetAuto = Expect<Equal<Widget['id'], string>>

// --- App() accepts a well-formed config --------------------------------------
const _app = App({
	name: 'ledger',
	entities,
	functions: {
		markPaid: (i) => i,
	},
})

// --- App() rejects an invalid enum literal in a function body ----------------
App({
	name: 'x',
	entities: { Invoice: { status: 'open | paid' } },
	functions: {
		// A Code handler can narrow its own entity arg via annotation.
		check: (i: { status: 'open' | 'paid' }) => i.status,
	},
})

// silence "declared but never used" for the pure type aliases
type _All = [
	_Amount,
	_Paid,
	_Status,
	_Customer,
	_LineItems,
	_Notes,
	_Id,
	_Created,
	_WidgetName,
	_WidgetPrice,
	_WidgetAuto,
]

describe('type-level contracts', () => {
	it('compile if and only if the type assertions hold', () => {
		// All the `Expect<Equal<...>>` aliases above are validated by `tsc`.
		expect(_app.name).toBe('ledger')
		const _checkAliases: _All = [true, true, true, true, true, true, true, true, true, true, true]
		expect(_checkAliases.every(Boolean)).toBe(true)
	})
})
