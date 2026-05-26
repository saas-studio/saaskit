/**
 * Function-kind helper tests: ai / agent / human + Code default (ADR 0012).
 */

import { describe, expect, it } from 'bun:test'
import { agent, ai, functionKind, human, isFunctionDescriptor } from '../../src/app/functions'

describe('ai() — Generative', () => {
	it('tags a generative descriptor with the prompt and options', () => {
		const fn = ai('Draft a reminder', { model: 'gpt-4o', temperature: 0.2 })
		expect(isFunctionDescriptor(fn)).toBe(true)
		expect(fn.kind).toBe('generative')
		expect(fn.prompt).toBe('Draft a reminder')
		expect(fn.options.model).toBe('gpt-4o')
		expect(fn.options.temperature).toBe(0.2)
		expect(functionKind(fn)).toBe('generative')
	})

	it('defaults options to an empty object', () => {
		const fn = ai('hi')
		expect(fn.options).toEqual({})
	})
})

describe('agent() — Agentic', () => {
	it('tags an agentic descriptor with goal + tools', () => {
		const fn = agent({ goal: 'Collect payment', tools: ['email', 'charge'], maxSteps: 5 })
		expect(fn.kind).toBe('agentic')
		expect(fn.goal).toBe('Collect payment')
		expect(fn.tools).toEqual(['email', 'charge'])
		expect(fn.maxSteps).toBe(5)
		expect(functionKind(fn)).toBe('agentic')
	})

	it('defaults tools to an empty array', () => {
		expect(agent({ goal: 'x' }).tools).toEqual([])
	})
})

describe('human() — Human-in-the-loop', () => {
	it('tags a human descriptor with assignee and optional condition', () => {
		const fn = human<{ amount: number }>({ assignee: 'cfo', when: (i) => i.amount > 5000 })
		expect(fn.kind).toBe('human')
		expect(fn.assignee).toBe('cfo')
		expect(typeof fn.when).toBe('function')
		expect(fn.when?.({ amount: 6000 })).toBe(true)
		expect(fn.when?.({ amount: 100 })).toBe(false)
		expect(functionKind(fn)).toBe('human')
	})

	it('allows omitting the condition', () => {
		const fn = human({ assignee: 'ops' })
		expect(fn.when).toBeUndefined()
	})
})

describe('Code (default)', () => {
	it('treats a plain handler as a Code function', () => {
		const handler = (entity: { x: number }) => ({ ...entity, x: entity.x + 1 })
		expect(isFunctionDescriptor(handler)).toBe(false)
		expect(functionKind(handler)).toBe('code')
	})

	it('throws for non-function, non-descriptor specs', () => {
		expect(() => functionKind(42 as never)).toThrow(TypeError)
	})
})
