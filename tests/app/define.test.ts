/**
 * App() / defineApp() factory + AppDefinition serialisation tests (ADR 0023).
 */

import { describe, expect, it } from 'bun:test'
import { z } from 'zod'
import {
	APP_DEFINITION_FORMAT,
	App,
	AppDefinition,
	DEFAULT_BUYER_CHAIN,
	agent,
	ai,
	defineApp,
	human,
} from '../../src/app'
import type { AppDefinitionJSON } from '../../src/app'

/** The canonical ADR 0023 example. */
function ledger() {
	return App({
		name: 'ledger',
		buyerChain: 'B2B',
		entities: {
			Invoice: {
				amount: 'number',
				status: 'open | paid | void',
				dueAt: 'date',
				notes: 'text?',
				customer: '-> Customer',
				lineItems: '-> LineItem[]',
			},
			Customer: { name: 'text', email: 'email' },
			LineItem: { description: 'text', qty: 'number' },
		},
		functions: {
			markPaid: (i: { status: string }) => ({ ...i, status: 'paid' as const }),
			remind: ai('Draft a friendly overdue reminder'),
			collect: agent({ goal: 'Collect payment', tools: ['email', 'charge'] }),
			approve: human<{ amount: number }>({ assignee: 'cfo', when: (i) => i.amount > 5000 }),
		},
		workflows: {
			onPaid: { on: 'Invoice.paid', do: ['markPaid'] },
		},
		agents: {
			support: { role: 'Support', goals: ['first-response < 1h'] },
		},
	})
}

describe('App()', () => {
	it('returns an AppDefinition', () => {
		expect(ledger()).toBeInstanceOf(AppDefinition)
	})

	it('defineApp is an alias of App', () => {
		expect(defineApp).toBe(App)
	})

	it('defaults version and buyerChain', () => {
		const app = App({ name: 'mini', entities: { A: { name: 'text' } } })
		expect(app.version).toBe('0.1.0')
		expect(app.buyerChain).toBe(DEFAULT_BUYER_CHAIN)
		expect(app.buyerChain).toBe('B2B')
	})

	it('exposes compiled Zod schemas per entity', () => {
		const app = ledger()
		expect(
			app.schema('Customer').safeParse({
				name: 'Acme',
				email: 'a@acme.com',
				id: 'x',
				createdAt: '2026-05-25T00:00:00Z',
				updatedAt: '2026-05-25T00:00:00Z',
			}).success,
		).toBe(true)
		expect(Object.keys(app.schemas())).toEqual(['Invoice', 'Customer', 'LineItem'])
	})

	it('exposes the Standard Schema interface on schemas (ADR 0020)', () => {
		const schema = ledger().schema('Customer') as unknown as {
			'~standard'?: { vendor?: string; version?: number }
		}
		expect(schema['~standard']).toBeDefined()
		expect(schema['~standard']?.vendor).toBe('zod')
	})

	it('throws on unknown schema()', () => {
		expect(() => ledger().schema('Nope')).toThrow(/Unknown entity/)
	})
})

describe('validation', () => {
	it('rejects a missing name', () => {
		expect(() => App({ name: '', entities: { A: { x: 'text' } } })).toThrow(/"name" is required/)
	})

	it('rejects empty entities', () => {
		expect(() => App({ name: 'x', entities: {} })).toThrow(/at least one entity/)
	})

	it('rejects relations to unknown entities', () => {
		expect(() => App({ name: 'x', entities: { A: { ref: '-> Ghost' } } })).toThrow(
			/targets unknown entity "Ghost"/,
		)
	})

	it('rejects workflows referencing unknown functions', () => {
		expect(() =>
			App({
				name: 'x',
				entities: { A: { name: 'text' } },
				functions: { real: () => null },
				workflows: { wf: { on: 'A.created', do: ['real', 'ghost'] } },
			}),
		).toThrow(/unknown function "ghost"/)
	})

	it('accepts workflows referencing declared functions', () => {
		expect(() =>
			App({
				name: 'x',
				entities: { A: { name: 'text' } },
				functions: { real: ai('do a thing') },
				workflows: { wf: { on: 'A.created', do: ['real'] } },
			}),
		).not.toThrow()
	})
})

describe('toJSON() — canonical serialisation (ADR 0011)', () => {
	const json = ledger().toJSON()

	it('stamps the format tag, name, version, buyerChain', () => {
		expect(json.saaskit).toBe(APP_DEFINITION_FORMAT)
		expect(json.name).toBe('ledger')
		expect(json.version).toBe('0.1.0')
		expect(json.buyerChain).toBe('B2B')
	})

	it('serialises entities with display field + ordered fields + auto fields', () => {
		const invoice = json.entities.find((e) => e.name === 'Invoice')
		expect(invoice?.displayField).toBe('amount')
		const fieldNames = invoice?.fields.map((f) => f.name)
		expect(fieldNames).toEqual([
			'amount',
			'status',
			'dueAt',
			'notes',
			'customer',
			'lineItems',
			'id',
			'createdAt',
			'updatedAt',
		])
	})

	it('captures enum values, relation targets, optional + auto flags', () => {
		const invoice = json.entities.find((e) => e.name === 'Invoice')!
		const by = Object.fromEntries(invoice.fields.map((f) => [f.name, f]))
		expect(by.status.kind).toBe('enum')
		expect(by.status.values).toEqual(['open', 'paid', 'void'])
		expect(by.customer.kind).toBe('belongsTo')
		expect(by.customer.target).toBe('Customer')
		expect(by.lineItems.kind).toBe('hasMany')
		expect(by.lineItems.target).toBe('LineItem')
		expect(by.notes.optional).toBe(true)
		expect(by.id.auto).toBe(true)
	})

	it('includes a JSON Schema per entity', () => {
		const invoice = json.entities.find((e) => e.name === 'Invoice')!
		expect(invoice.jsonSchema.type).toBe('object')
		const props = invoice.jsonSchema.properties as Record<string, unknown>
		expect(Object.keys(props)).toContain('amount')
		expect(Object.keys(props)).toContain('id')
	})

	it('serialises function kinds (ADR 0012)', () => {
		const by = Object.fromEntries(json.functions.map((f) => [f.name, f]))
		expect(by.markPaid.kind).toBe('code')
		expect(by.remind.kind).toBe('generative')
		expect(by.remind.prompt).toBe('Draft a friendly overdue reminder')
		expect(by.collect.kind).toBe('agentic')
		expect(by.collect.goal).toBe('Collect payment')
		expect(by.collect.tools).toEqual(['email', 'charge'])
		expect(by.approve.kind).toBe('human')
		expect(by.approve.assignee).toBe('cfo')
		expect(by.approve.hasCondition).toBe(true)
	})

	it('serialises workflows and roster agents', () => {
		expect(json.workflows).toEqual([{ name: 'onPaid', on: 'Invoice.paid', do: ['markPaid'] }])
		expect(json.agents).toEqual([
			{ name: 'support', role: 'Support', goals: ['first-response < 1h'] },
		])
	})

	it('is a plain JSON-serialisable value (round-trips through JSON)', () => {
		const round = JSON.parse(JSON.stringify(json)) as AppDefinitionJSON
		expect(round).toEqual(json)
	})

	it('toString() emits pretty JSON matching toJSON()', () => {
		const app = ledger()
		expect(JSON.parse(app.toString())).toEqual(app.toJSON())
	})

	it('omits empty optional sections cleanly', () => {
		const json2 = App({ name: 'mini', entities: { A: { name: 'text' } } }).toJSON()
		expect(json2.functions).toEqual([])
		expect(json2.workflows).toEqual([])
		expect(json2.agents).toEqual([])
		expect(json2.description).toBeUndefined()
	})
})

describe('Zod escape hatch (ADR 0023)', () => {
	it('accepts a Zod object schema for an entity', () => {
		const app = App({
			name: 'shop',
			entities: {
				Widget: z.object({ name: z.string(), price: z.number().optional() }),
			},
		})
		const widget = app.toJSON().entities[0]
		expect(widget.fields.map((f) => f.name)).toEqual([
			'name',
			'price',
			'id',
			'createdAt',
			'updatedAt',
		])
		// Auto fields are merged into the schema.
		expect(
			app.schema('Widget').safeParse({
				name: 'gizmo',
				id: 'x',
				createdAt: '2026-05-25T00:00:00Z',
				updatedAt: '2026-05-25T00:00:00Z',
			}).success,
		).toBe(true)
	})
})
