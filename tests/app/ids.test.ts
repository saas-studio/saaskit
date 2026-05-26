/**
 * Thing ID helper tests (ADR 0020): UUIDv7 + sqid public handles.
 */

import { describe, expect, it } from 'bun:test'
import { newHandle, newId, toHandle } from '../../src/app/ids'

describe('newId() — UUIDv7', () => {
	it('produces a valid UUIDv7 (version nibble 7)', () => {
		const id = newId()
		expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
	})

	it('is chronologically sortable (later ids sort after earlier ones)', () => {
		const ids = Array.from({ length: 10 }, () => newId())
		// UUIDv7 leads with a timestamp, so the generated order is the sorted order.
		expect([...ids].sort()).toEqual(ids)
	})

	it('is unique across calls', () => {
		const set = new Set(Array.from({ length: 500 }, () => newId()))
		expect(set.size).toBe(500)
	})
})

describe('toHandle() — sqid public handle', () => {
	it('is deterministic for the same id', () => {
		const id = newId()
		expect(toHandle(id)).toBe(toHandle(id))
	})

	it('differs for different ids', () => {
		expect(toHandle(newId())).not.toBe(toHandle(newId()))
	})

	it('applies an entity prefix', () => {
		const id = newId()
		const handle = toHandle(id, 'INV')
		expect(handle.startsWith('INV_')).toBe(true)
		expect(handle.slice(4)).toBe(toHandle(id))
	})
})

describe('newHandle()', () => {
	it('mints a fresh handle, optionally prefixed', () => {
		expect(newHandle('CST').startsWith('CST_')).toBe(true)
		expect(newHandle()).not.toBe(newHandle())
	})
})
