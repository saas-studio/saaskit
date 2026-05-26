/**
 * Public type surface for the `App()` authoring API (ADR 0023).
 *
 * These types make `App({...})` fully type-checked: entity field shorthands are
 * mapped to concrete TypeScript output types, and those types flow into the
 * `(entity, ctx) => result` Code function handler signatures where feasible.
 *
 * @module app/types
 */

import type { z } from 'zod'
import type { FunctionContext } from './functions'

// =============================================================================
// Buyer Chain (ADR 0007)
// =============================================================================

/** The Buyer Chains a SaaS can declare (ADR 0007). Default `'B2B'`. */
export type BuyerChain = 'B2B' | 'B2C' | 'B2A' | 'B2A2B' | 'B2A2C' | 'B2A2A'

// =============================================================================
// Entity input shapes
// =============================================================================

/** A shorthand field map: `{ amount: 'number', status: 'open | paid' }`. */
export type ShorthandEntity = Record<string, string>

/** An entity is either a shorthand field map or a Zod object (escape hatch). */
export type EntityDef = ShorthandEntity | z.ZodObject<z.ZodRawShape>

/** The `entities` map on an App config. */
export type EntitiesConfig = Record<string, EntityDef>

// =============================================================================
// Shorthand → TypeScript output type inference
// =============================================================================

/** Strip a single trailing `?` (optional marker) from a field string. */
type StripOptional<S extends string> = S extends `${infer Base}?` ? Base : S

/** Trim leading/trailing ASCII spaces from a string-literal type. */
type Trim<S extends string> = S extends ` ${infer R}`
	? Trim<R>
	: S extends `${infer R} `
		? Trim<R>
		: S

/** Split a `'a | b | c'` union-literal string into a string-literal union. */
type SplitEnum<S extends string> = S extends `${infer Head}|${infer Tail}`
	? Trim<Head> | SplitEnum<Tail>
	: Trim<S>

/** Map a (non-optional, trimmed) scalar/enum/relation spec to its TS type. */
type ScalarType<S extends string> = Trim<S> extends 'text'
	? string
	: Trim<S> extends 'email'
		? string
		: Trim<S> extends 'url'
			? string
			: Trim<S> extends 'date'
				? string
				: Trim<S> extends 'datetime'
					? string
					: Trim<S> extends 'number'
						? number
						: Trim<S> extends 'boolean'
							? boolean
							: Trim<S> extends 'json'
								? unknown
								: // relation: belongsTo / hasMany → handle string(s)
									Trim<S> extends `->${infer Rest}`
									? Trim<Rest> extends `${string}[]`
										? string[]
										: string
									: // enum
										S extends `${string}|${string}`
										? SplitEnum<S>
										: // single literal value treated as a one-member enum
											Trim<S>

/** Resolve one field string to `{ value; optional }`. */
type FieldOutput<S extends string> = S extends `${infer Base}?`
	? { value: ScalarType<StripOptional<Base>>; optional: true }
	: { value: ScalarType<S>; optional: false }

/** Keys whose field is optional. */
type OptionalKeys<E extends ShorthandEntity> = {
	[K in keyof E]: E[K] extends string
		? FieldOutput<E[K]>['optional'] extends true
			? K
			: never
		: never
}[keyof E]

/** Keys whose field is required. */
type RequiredKeys<E extends ShorthandEntity> = Exclude<keyof E, OptionalKeys<E>>

/** The auto fields every entity output type carries. */
interface AutoFields {
	id: string
	createdAt: string
	updatedAt: string
}

/** The inferred output type of a shorthand entity (author fields + auto fields). */
export type InferShorthand<E extends ShorthandEntity> = {
	[K in RequiredKeys<E>]: E[K] extends string ? FieldOutput<E[K]>['value'] : never
} & {
	[K in OptionalKeys<E>]?: E[K] extends string ? FieldOutput<E[K]>['value'] : never
} & AutoFields

/** The inferred output type of any {@link EntityDef}. */
export type InferEntity<E extends EntityDef> = E extends z.ZodObject<z.ZodRawShape>
	? z.infer<E> & AutoFields
	: E extends ShorthandEntity
		? InferShorthand<E>
		: never

/** The map of entity name → inferred output type for an App config. */
export type InferEntities<C extends EntitiesConfig> = {
	[K in keyof C]: InferEntity<C[K]>
}

// =============================================================================
// Functions config (typed against the entities)
// =============================================================================

/**
 * A typed Code handler in an App's `functions` map.
 *
 * The `entity` argument is intentionally `any` so authors can narrow the
 * handler to a single entity via their own annotation — e.g.
 * `markPaid: (i: Invoice) => ...` — without TypeScript rejecting it on
 * contravariance grounds (a property of function type is contravariant in its
 * parameters). The `Entities` type parameter is reserved for downstream
 * tooling that wants to constrain handlers more tightly.
 *
 * @typeParam Entities - map of entity-name → output type for the owning App.
 */
export type TypedCodeHandler<_Entities = Record<string, unknown>> = (
	// biome-ignore lint/suspicious/noExplicitAny: see JSDoc — bivariant entity arg.
	entity: any,
	ctx: FunctionContext,
) => unknown

import type { FunctionDescriptor } from './functions'

/** A value in the `functions` map: a Code handler or a helper descriptor. */
export type FunctionValue<Entities> = TypedCodeHandler<Entities> | FunctionDescriptor

/** The `functions` map on an App config. */
export type FunctionsConfig<Entities> = Record<string, FunctionValue<Entities>>

// =============================================================================
// Workflows (ADR 0012) and Agents roster (ADR 0018)
// =============================================================================

/** A declarative workflow trigger→steps mapping (compiled to XState later). */
export interface WorkflowDef {
	/** The Event path that triggers the workflow, e.g. `'Invoice.paid'`. */
	on: string
	/** The ordered function names to run. */
	do: string[]
}

/** The `workflows` map on an App config. */
export type WorkflowsConfig = Record<string, WorkflowDef>

/** An operating-roster agent definition (ADR 0018). */
export interface RosterAgentDef {
	/** A conventional org-chart role name (ADR 0018), e.g. `'Support'`. */
	role: string
	/** The agent's Goals/KPIs. */
	goals?: string[]
}

/** The `agents` map on an App config. */
export type AgentsConfig = Record<string, RosterAgentDef>

// =============================================================================
// App config (the `App()` argument)
// =============================================================================

/** The configuration object accepted by {@link App} / `defineApp`. */
export interface AppConfig<C extends EntitiesConfig = EntitiesConfig, Entities = InferEntities<C>> {
	/** The app's name (lowercase, hyphenated by convention). */
	name: string
	/** Optional human-readable description. */
	description?: string
	/** Optional semantic version. */
	version?: string
	/** The Buyer Chain this SaaS supports (ADR 0007). Defaults to `'B2B'`. */
	buyerChain?: BuyerChain
	/** The entity (Noun) definitions. */
	entities: C
	/** The function (Verb) definitions. */
	functions?: FunctionsConfig<Entities>
	/** Optional declarative workflows (ADR 0012). */
	workflows?: WorkflowsConfig
	/** Optional operating-roster agents (ADR 0018). */
	agents?: AgentsConfig
}

// =============================================================================
// AppDefinition (the serialised canonical form)
// =============================================================================

/** A serialised field in the {@link AppDefinitionJSON}. */
export interface FieldDefinitionJSON {
	name: string
	kind: string
	optional: boolean
	display: boolean
	values?: string[]
	target?: string
	auto?: boolean
}

/** A serialised entity in the {@link AppDefinitionJSON}. */
export interface EntityDefinitionJSON {
	name: string
	displayField?: string
	fields: FieldDefinitionJSON[]
	/** JSON Schema (draft 2020-12) for the entity, including auto fields. */
	jsonSchema: Record<string, unknown>
}

/** A serialised function in the {@link AppDefinitionJSON}. */
export interface FunctionDefinitionJSON {
	name: string
	kind: 'code' | 'generative' | 'agentic' | 'human'
	/** Generative: the prompt. */
	prompt?: string
	/** Generative: model/temperature hints. */
	model?: string
	temperature?: number
	/** Agentic: goal + tools. */
	goal?: string
	tools?: string[]
	maxSteps?: number
	/** Human: assignee, and whether a `when` predicate gates the step. */
	assignee?: string
	hasCondition?: boolean
}

/** A serialised workflow. */
export interface WorkflowDefinitionJSON {
	name: string
	on: string
	do: string[]
}

/** A serialised roster agent. */
export interface AgentDefinitionJSON {
	name: string
	role: string
	goals?: string[]
}

/** The canonical JSON form produced by {@link AppDefinition.toJSON}. */
export interface AppDefinitionJSON {
	saaskit: string
	name: string
	description?: string
	version: string
	buyerChain: BuyerChain
	entities: EntityDefinitionJSON[]
	functions: FunctionDefinitionJSON[]
	workflows: WorkflowDefinitionJSON[]
	agents: AgentDefinitionJSON[]
}
