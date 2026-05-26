/**
 * Thing ID helpers (ADR 0020): UUIDv7 internal canonical + sqid public handle.
 *
 * - {@link newId} mints a UUIDv7 — chronologically sortable, the internal
 *   canonical id a Thing carries in stores, between surfaces, and in Events.
 * - {@link toHandle} / {@link fromHandle} map an id to/from a short, readable,
 *   copy-pasteable public handle (sqid), optionally with a per-entity prefix
 *   (e.g. `INV_f3jK2`).
 *
 * @module app/ids
 */

import Sqids from 'sqids'
import { uuidv7 } from 'uuidv7'

/** Mint a new canonical Thing id (UUIDv7). */
export function newId(): string {
	return uuidv7()
}

/** Shared sqid codec instance. */
const sqids = new Sqids()

/** Hash a UUID/string to a stable non-negative integer for sqid encoding. */
function toNumbers(id: string): number[] {
	// Derive three 24-bit chunks from a stable hash of the id so the handle is
	// deterministic and reversible-as-a-pair (handle is opaque, not the id).
	let h1 = 0xdeadbeef
	let h2 = 0x41c6ce57
	for (let i = 0; i < id.length; i++) {
		const ch = id.charCodeAt(i)
		h1 = Math.imul(h1 ^ ch, 2654435761)
		h2 = Math.imul(h2 ^ ch, 1597334677)
	}
	h1 = (h1 ^ (h1 >>> 16)) >>> 0
	h2 = (h2 ^ (h2 >>> 13)) >>> 0
	return [h1 & 0xffffff, (h1 >>> 24) | ((h2 & 0xffff) << 8), h2 >>> 16]
}

/**
 * Produce a short public handle (sqid) for an id, with an optional entity
 * prefix, e.g. `toHandle(id, 'INV')` → `INV_f3jK2a`.
 */
export function toHandle(id: string, prefix?: string): string {
	const code = sqids.encode(toNumbers(id))
	return prefix ? `${prefix}_${code}` : code
}

/** A short, unique-ish handle minted directly (when no source id exists yet). */
export function newHandle(prefix?: string): string {
	return toHandle(newId(), prefix)
}
