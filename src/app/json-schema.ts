/**
 * Zod → JSON Schema conversion for {@link AppDefinition} serialisation.
 *
 * The field DSL produces a bounded, known set of Zod types, so this converter
 * handles those directly and degrades gracefully for the escape-hatch case
 * (an author-supplied Zod schema). Output targets JSON Schema draft 2020-12,
 * the dialect used across the agent surfaces (OpenAPI 3.1, MCP).
 *
 * Kept in-repo (rather than pulling a converter dep) so `.toJSON()` is
 * deterministic and matches exactly what the dashboard codegen round-trips.
 *
 * @module app/json-schema
 */

import type { z } from 'zod'

/** A JSON Schema object (loosely typed). */
export type JsonSchema = Record<string, unknown>

interface ZodDefLike {
	typeName: string
	[key: string]: unknown
}

function def(schema: z.ZodTypeAny): ZodDefLike {
	return (schema as { _def: ZodDefLike })._def
}

/** Convert a single Zod schema to a JSON Schema fragment. */
export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema {
	const d = def(schema)

	switch (d.typeName) {
		case 'ZodString':
			return stringSchema(d)
		case 'ZodNumber':
			return numberSchema(d)
		case 'ZodBoolean':
			return { type: 'boolean' }
		case 'ZodDate':
			return { type: 'string', format: 'date-time' }
		case 'ZodEnum':
			return { type: 'string', enum: [...(d.values as string[])] }
		case 'ZodNativeEnum':
			return { enum: Object.values(d.values as Record<string, unknown>) }
		case 'ZodLiteral':
			return { const: d.value }
		case 'ZodNull':
			return { type: 'null' }
		case 'ZodArray':
			return { type: 'array', items: zodToJsonSchema(d.type as z.ZodTypeAny) }
		case 'ZodObject':
			return objectSchema(schema as z.ZodObject<z.ZodRawShape>)
		case 'ZodRecord':
			return {
				type: 'object',
				additionalProperties: zodToJsonSchema(d.valueType as z.ZodTypeAny),
			}
		case 'ZodUnion':
			return { anyOf: (d.options as z.ZodTypeAny[]).map(zodToJsonSchema) }
		case 'ZodOptional':
		case 'ZodNullable':
			return zodToJsonSchema(d.innerType as z.ZodTypeAny)
		case 'ZodDefault':
			return {
				...zodToJsonSchema(d.innerType as z.ZodTypeAny),
				default: (d.defaultValue as () => unknown)(),
			}
		case 'ZodLazy':
			return zodToJsonSchema((d.getter as () => z.ZodTypeAny)())
		default:
			// Unknown / unsupported node → accept anything.
			return {}
	}
}

function stringSchema(d: ZodDefLike): JsonSchema {
	const out: JsonSchema = { type: 'string' }
	const checks = (d.checks as { kind: string; value?: unknown; regex?: RegExp }[]) ?? []
	for (const check of checks) {
		switch (check.kind) {
			case 'email':
				out.format = 'email'
				break
			case 'url':
				out.format = 'uri'
				break
			case 'datetime':
				out.format = 'date-time'
				break
			case 'uuid':
				out.format = 'uuid'
				break
			case 'min':
				out.minLength = check.value as number
				break
			case 'max':
				out.maxLength = check.value as number
				break
			case 'regex':
				if (check.regex) out.pattern = check.regex.source
				break
		}
	}
	return out
}

function numberSchema(d: ZodDefLike): JsonSchema {
	const out: JsonSchema = { type: 'number' }
	const checks = (d.checks as { kind: string; value?: number }[]) ?? []
	for (const check of checks) {
		switch (check.kind) {
			case 'int':
				out.type = 'integer'
				break
			case 'min':
				out.minimum = check.value
				break
			case 'max':
				out.maximum = check.value
				break
		}
	}
	return out
}

function objectSchema(schema: z.ZodObject<z.ZodRawShape>): JsonSchema {
	const shape = schema.shape
	const properties: Record<string, JsonSchema> = {}
	const required: string[] = []

	for (const [key, value] of Object.entries(shape)) {
		const fieldSchema = value as z.ZodTypeAny
		properties[key] = zodToJsonSchema(fieldSchema)
		if (!isOptional(fieldSchema)) required.push(key)
	}

	const out: JsonSchema = { type: 'object', properties }
	if (required.length > 0) out.required = required
	out.additionalProperties = false
	return out
}

function isOptional(schema: z.ZodTypeAny): boolean {
	const t = def(schema).typeName
	return t === 'ZodOptional' || t === 'ZodDefault'
}
