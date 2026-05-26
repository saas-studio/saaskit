/**
 * Field-shorthand DSL → Zod compiler (ADR 0023, validation per ADR 0020).
 *
 * A field value is a short string describing the field's type:
 *
 * | Shorthand            | Meaning                                   |
 * |----------------------|-------------------------------------------|
 * | `text`               | string                                    |
 * | `number`             | number                                    |
 * | `boolean`            | boolean                                   |
 * | `date`               | calendar date (ISO `YYYY-MM-DD`)          |
 * | `datetime`           | timestamp (ISO 8601)                      |
 * | `email`              | string, email-validated                   |
 * | `url`                | string, URL-validated                     |
 * | `json`               | arbitrary JSON value                      |
 * | `a \| b \| c`        | enum / select (union literal)             |
 * | `-> Entity`          | belongsTo relation                        |
 * | `-> Entity[]`        | hasMany relation                          |
 * | trailing `?`         | optional                                  |
 *
 * The first field declared on an entity is the **display field** by convention.
 * Each compiled entity additionally gets auto fields `id`, `createdAt`,
 * `updatedAt` (see {@link autoFieldDefs}).
 *
 * The compiler emits both a Zod schema (the canonical validation form, which
 * also exposes the Standard Schema `~standard` interface per ADR 0020) and a
 * structured {@link FieldDef} array used for serialisation to the canonical
 * {@link AppDefinition} JSON.
 *
 * @module app/dsl
 */

import { z } from 'zod'

// =============================================================================
// Field metadata model
// =============================================================================

/** The scalar primitive field types supported by the shorthand DSL. */
export type ScalarFieldKind =
	| 'text'
	| 'number'
	| 'boolean'
	| 'date'
	| 'datetime'
	| 'email'
	| 'url'
	| 'json'

/** The kind of a parsed field. */
export type FieldKind = ScalarFieldKind | 'enum' | 'belongsTo' | 'hasMany'

/** A single parsed/compiled field definition. */
export interface FieldDef {
	/** The field name (object key). */
	name: string
	/** The resolved field kind. */
	kind: FieldKind
	/** Whether the field is optional (trailing `?`). */
	optional: boolean
	/** Whether this is the entity's display field (first declared field). */
	display: boolean
	/** For `enum` fields: the allowed literal values, in declared order. */
	values?: string[]
	/** For `belongsTo` / `hasMany` fields: the target entity name. */
	target?: string
	/** True for auto-managed fields (`id`, `createdAt`, `updatedAt`). */
	auto?: boolean
}

// =============================================================================
// Parsing
// =============================================================================

/** A field whose value is a Zod schema directly is left untouched by the DSL. */
const SCALAR_KEYWORDS = new Set<ScalarFieldKind>([
	'text',
	'number',
	'boolean',
	'date',
	'datetime',
	'email',
	'url',
	'json',
])

/**
 * Parse one shorthand field string into a {@link FieldDef} (without the
 * `display` flag, which the caller sets from declaration order).
 *
 * @throws if the string isn't a recognised shorthand.
 */
export function parseFieldShorthand(name: string, raw: string): Omit<FieldDef, 'display'> {
	let spec = raw.trim()
	let optional = false

	// Trailing `?` → optional. Applies to every form (scalar, enum, relation).
	if (spec.endsWith('?')) {
		optional = true
		spec = spec.slice(0, -1).trim()
	}

	// Relation: `-> Entity` (belongsTo) or `-> Entity[]` (hasMany).
	if (spec.startsWith('->')) {
		let target = spec.slice(2).trim()
		const hasMany = target.endsWith('[]')
		if (hasMany) target = target.slice(0, -2).trim()
		if (!target || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(target)) {
			throw new Error(`Invalid relation target in field "${name}": "${raw}"`)
		}
		return {
			name,
			kind: hasMany ? 'hasMany' : 'belongsTo',
			optional,
			target,
		}
	}

	// Enum / select: `a | b | c`.
	if (spec.includes('|')) {
		const values = spec
			.split('|')
			.map((v) => v.trim())
			.filter((v) => v.length > 0)
		if (values.length === 0) {
			throw new Error(`Enum field "${name}" must declare at least one value: "${raw}"`)
		}
		return { name, kind: 'enum', optional, values }
	}

	// Scalar keyword.
	if (SCALAR_KEYWORDS.has(spec as ScalarFieldKind)) {
		return { name, kind: spec as ScalarFieldKind, optional }
	}

	throw new Error(
		`Unrecognised field shorthand for "${name}": "${raw}". Expected one of ${[...SCALAR_KEYWORDS].join(', ')}, a "a | b | c" enum, or a "-> Entity"/"-> Entity[]" relation (optional trailing "?").`,
	)
}

// =============================================================================
// Zod compilation
// =============================================================================

/** Build the base (non-optional) Zod schema for a parsed field. */
function baseZodForField(field: Omit<FieldDef, 'display'>): z.ZodTypeAny {
	switch (field.kind) {
		case 'text':
			return z.string()
		case 'number':
			return z.number()
		case 'boolean':
			return z.boolean()
		case 'date':
			// Calendar date as ISO `YYYY-MM-DD`.
			return z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO date (YYYY-MM-DD)')
		case 'datetime':
			return z.string().datetime({ offset: true })
		case 'email':
			return z.string().email()
		case 'url':
			return z.string().url()
		case 'json':
			return jsonSchema()
		case 'enum': {
			const values = field.values ?? []
			return z.enum(values as [string, ...string[]])
		}
		case 'belongsTo':
			// belongsTo serialises the target's public handle (sqid string).
			return z.string()
		case 'hasMany':
			return z.array(z.string())
		default: {
			const _exhaustive: never = field.kind
			throw new Error(`Unhandled field kind: ${String(_exhaustive)}`)
		}
	}
}

/** A recursive Zod schema for arbitrary JSON values. */
function jsonSchema(): z.ZodTypeAny {
	const literal = z.union([z.string(), z.number(), z.boolean(), z.null()])
	const json: z.ZodTypeAny = z.lazy(() => z.union([literal, z.array(json), z.record(json)]))
	return json
}

/** Compile a parsed field to its Zod schema, applying the optional modifier. */
export function fieldToZod(field: Omit<FieldDef, 'display'>): z.ZodTypeAny {
	const base = baseZodForField(field)
	return field.optional ? base.optional() : base
}

// =============================================================================
// Auto fields
// =============================================================================

/**
 * The auto-managed fields every entity receives: a canonical `id` (the public
 * sqid handle is what crosses the wire; the UUIDv7 is internal), and
 * `createdAt` / `updatedAt` timestamps. Per ADR 0020.
 */
export function autoFieldDefs(): FieldDef[] {
	return [
		{ name: 'id', kind: 'text', optional: false, display: false, auto: true },
		{ name: 'createdAt', kind: 'datetime', optional: false, display: false, auto: true },
		{ name: 'updatedAt', kind: 'datetime', optional: false, display: false, auto: true },
	]
}

// =============================================================================
// Entity compilation
// =============================================================================

/** The result of compiling one entity's field map. */
export interface CompiledEntity {
	/** The parsed field definitions (author-declared fields, in order). */
	fields: FieldDef[]
	/** The auto-managed fields (`id`, `createdAt`, `updatedAt`). */
	autoFields: FieldDef[]
	/** The display field name (first author-declared field), if any. */
	displayField?: string
	/** The Zod schema for the entity (author fields + auto fields). */
	schema: z.ZodObject<z.ZodRawShape>
	/** True when the entity was authored directly as a Zod schema (escape hatch). */
	fromZod: boolean
}

/** An entity definition is either a shorthand field map or a raw Zod object. */
export type EntityInput = Record<string, string> | z.ZodObject<z.ZodRawShape>

/** Type guard: is the entity definition a Zod object (the escape hatch)? */
export function isZodEntity(input: unknown): input is z.ZodObject<z.ZodRawShape> {
	return (
		typeof input === 'object' &&
		input !== null &&
		typeof (input as z.ZodTypeAny).safeParse === 'function' &&
		(input as z.ZodTypeAny)._def?.typeName === 'ZodObject'
	)
}

/**
 * Compile one entity definition into a {@link CompiledEntity}.
 *
 * Accepts either the shorthand field map (the headline DSL) or a Zod object
 * schema directly (the escape hatch). In the Zod case, auto fields are still
 * merged in and the shape is reflected into {@link FieldDef}s on a best-effort
 * basis (kind inference) so serialisation stays uniform.
 */
export function compileEntity(name: string, input: EntityInput): CompiledEntity {
	if (isZodEntity(input)) {
		return compileZodEntity(name, input)
	}
	return compileShorthandEntity(name, input)
}

function compileShorthandEntity(name: string, input: Record<string, string>): CompiledEntity {
	const fields: FieldDef[] = []
	const shape: z.ZodRawShape = {}
	let displayField: string | undefined

	let first = true
	for (const [fieldName, raw] of Object.entries(input)) {
		if (typeof raw !== 'string') {
			throw new Error(
				`Field "${name}.${fieldName}" must be a shorthand string or a Zod schema, got ${typeof raw}.`,
			)
		}
		const parsed = parseFieldShorthand(fieldName, raw)
		const def: FieldDef = { ...parsed, display: first }
		if (first) {
			displayField = fieldName
			first = false
		}
		fields.push(def)
		shape[fieldName] = fieldToZod(parsed)
	}

	const autoFields = autoFieldDefs()
	for (const af of autoFields) {
		shape[af.name] = fieldToZod(af)
	}

	return {
		fields,
		autoFields,
		...(displayField ? { displayField } : {}),
		schema: z.object(shape),
		fromZod: false,
	}
}

function compileZodEntity(_name: string, input: z.ZodObject<z.ZodRawShape>): CompiledEntity {
	const shape = input.shape
	const fields: FieldDef[] = []
	let first = true
	let displayField: string | undefined

	for (const [fieldName, schema] of Object.entries(shape)) {
		const { kind, optional } = inferKindFromZod(schema as z.ZodTypeAny)
		fields.push({ name: fieldName, kind, optional, display: first })
		if (first) {
			displayField = fieldName
			first = false
		}
	}

	const autoFields = autoFieldDefs()
	const autoShape: z.ZodRawShape = {}
	for (const af of autoFields) {
		autoShape[af.name] = fieldToZod(af)
	}

	return {
		fields,
		autoFields,
		...(displayField ? { displayField } : {}),
		// Merge author Zod shape with auto fields.
		schema: input.extend(autoShape),
		fromZod: true,
	}
}

/** Best-effort inference of a {@link FieldKind} from an arbitrary Zod schema. */
function inferKindFromZod(schema: z.ZodTypeAny): { kind: FieldKind; optional: boolean } {
	let optional = false
	let s = schema
	// Unwrap optional/nullable/default wrappers.
	const typeName = () => s._def?.typeName
	while (
		typeName() === 'ZodOptional' ||
		typeName() === 'ZodNullable' ||
		typeName() === 'ZodDefault'
	) {
		if (typeName() === 'ZodOptional' || typeName() === 'ZodNullable') optional = true
		s = (s._def as { innerType: z.ZodTypeAny }).innerType
	}

	switch (typeName()) {
		case 'ZodString': {
			const checks = (s._def as { checks?: { kind: string }[] }).checks ?? []
			if (checks.some((c) => c.kind === 'email')) return { kind: 'email', optional }
			if (checks.some((c) => c.kind === 'url')) return { kind: 'url', optional }
			if (checks.some((c) => c.kind === 'datetime')) return { kind: 'datetime', optional }
			return { kind: 'text', optional }
		}
		case 'ZodNumber':
			return { kind: 'number', optional }
		case 'ZodBoolean':
			return { kind: 'boolean', optional }
		case 'ZodDate':
			return { kind: 'datetime', optional }
		case 'ZodEnum':
		case 'ZodNativeEnum':
			return { kind: 'enum', optional }
		case 'ZodArray':
			return { kind: 'json', optional }
		default:
			return { kind: 'json', optional }
	}
}
