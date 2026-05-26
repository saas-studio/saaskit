/**
 * The `App()` config factory and the {@link AppDefinition} it returns (ADR 0023).
 *
 * `App(config)` is the canonical public authoring surface. It compiles the
 * field-shorthand DSL to Zod (the canonical validation form, ADR 0020),
 * recognises the `ai`/`agent`/`human` function kinds (ADR 0012), and returns a
 * typed, JSON-serialisable {@link AppDefinition} — the canonical data form
 * (ADR 0011). `defineApp` is an alias of `App`.
 *
 * @module app/define
 */

import type { z } from 'zod'
import { type CompiledEntity, compileEntity } from './dsl'
import { type FunctionDescriptor, functionKind, isFunctionDescriptor } from './functions'
import { zodToJsonSchema } from './json-schema'
import type {
	AgentDefinitionJSON,
	AppConfig,
	AppDefinitionJSON,
	BuyerChain,
	EntitiesConfig,
	EntityDefinitionJSON,
	FunctionDefinitionJSON,
	InferEntities,
	WorkflowDefinitionJSON,
} from './types'

/** The default Buyer Chain when none is declared (ADR 0007). */
export const DEFAULT_BUYER_CHAIN: BuyerChain = 'B2B'

/** The default app version. */
export const DEFAULT_VERSION = '0.1.0'

/** The `saaskit` definition-format tag stamped into the canonical JSON. */
export const APP_DEFINITION_FORMAT = 'app/v1'

/**
 * The typed, JSON-serialisable result of {@link App}.
 *
 * It holds the original (resolved) config plus the compiled per-entity Zod
 * schemas, and serialises to the canonical {@link AppDefinitionJSON} via
 * {@link toJSON}.
 *
 * @typeParam C - the entities config (drives the inferred entity types).
 */
export class AppDefinition<C extends EntitiesConfig = EntitiesConfig> {
	/** App name. */
	readonly name: string
	/** App description, if any. */
	readonly description?: string
	/** App semantic version. */
	readonly version: string
	/** The Buyer Chain (ADR 0007). */
	readonly buyerChain: BuyerChain
	/** The raw config the App was authored with (with defaults resolved). */
	readonly config: AppConfig<C, InferEntities<C>>

	/** Compiled entities keyed by entity name. */
	readonly entities: Record<string, CompiledEntity>

	constructor(config: AppConfig<C, InferEntities<C>>) {
		validateConfig(config)

		this.name = config.name
		if (config.description !== undefined) this.description = config.description
		this.version = config.version ?? DEFAULT_VERSION
		this.buyerChain = config.buyerChain ?? DEFAULT_BUYER_CHAIN
		this.config = {
			...config,
			version: this.version,
			buyerChain: this.buyerChain,
		}

		this.entities = {}
		for (const [entityName, entityDef] of Object.entries(config.entities)) {
			this.entities[entityName] = compileEntity(entityName, entityDef)
		}

		validateRelations(this.entities)
		validateWorkflows(this)
	}

	/**
	 * The compiled Zod schema for an entity. The returned schema exposes the
	 * Standard Schema `~standard` interface (ADR 0020) natively (Zod ≥ 3.24).
	 */
	schema(entity: string): z.ZodObject<z.ZodRawShape> {
		const compiled = this.entities[entity]
		if (!compiled) throw new Error(`Unknown entity: "${entity}"`)
		return compiled.schema
	}

	/** All compiled entity Zod schemas keyed by entity name. */
	schemas(): Record<string, z.ZodObject<z.ZodRawShape>> {
		const out: Record<string, z.ZodObject<z.ZodRawShape>> = {}
		for (const [name, compiled] of Object.entries(this.entities)) {
			out[name] = compiled.schema
		}
		return out
	}

	/**
	 * Serialise to the canonical JSON form (ADR 0011). The field DSL is rendered
	 * both as structured field definitions and as JSON Schema (per entity).
	 */
	toJSON(): AppDefinitionJSON {
		const entities: EntityDefinitionJSON[] = Object.entries(this.entities).map(
			([name, compiled]) => {
				const allFields = [...compiled.fields, ...compiled.autoFields]
				return {
					name,
					...(compiled.displayField ? { displayField: compiled.displayField } : {}),
					fields: allFields.map((f) => ({
						name: f.name,
						kind: f.kind,
						optional: f.optional,
						display: f.display,
						...(f.values ? { values: f.values } : {}),
						...(f.target ? { target: f.target } : {}),
						...(f.auto ? { auto: f.auto } : {}),
					})),
					jsonSchema: zodToJsonSchema(compiled.schema),
				}
			},
		)

		const functions = serializeFunctions(this.config.functions)
		const workflows = serializeWorkflows(this.config.workflows)
		const agents = serializeAgents(this.config.agents)

		const out: AppDefinitionJSON = {
			saaskit: APP_DEFINITION_FORMAT,
			name: this.name,
			...(this.description !== undefined ? { description: this.description } : {}),
			version: this.version,
			buyerChain: this.buyerChain,
			entities,
			functions,
			workflows,
			agents,
		}
		return out
	}

	/** Pretty-printed canonical JSON string. */
	toString(): string {
		return JSON.stringify(this.toJSON(), null, 2)
	}
}

// =============================================================================
// Serialisation helpers
// =============================================================================

function serializeFunctions(functions: AppConfig['functions']): FunctionDefinitionJSON[] {
	if (!functions) return []
	return Object.entries(functions).map(([name, spec]) => {
		const kind = functionKind(spec)
		if (!isFunctionDescriptor(spec)) {
			return { name, kind: 'code' }
		}
		const desc = spec as FunctionDescriptor
		switch (desc.kind) {
			case 'generative':
				return {
					name,
					kind: 'generative',
					prompt: desc.prompt,
					...(desc.options.model ? { model: desc.options.model } : {}),
					...(desc.options.temperature !== undefined
						? { temperature: desc.options.temperature }
						: {}),
				}
			case 'agentic':
				return {
					name,
					kind: 'agentic',
					goal: desc.goal,
					tools: desc.tools,
					...(desc.maxSteps !== undefined ? { maxSteps: desc.maxSteps } : {}),
				}
			case 'human':
				return {
					name,
					kind: 'human',
					assignee: desc.assignee,
					hasCondition: typeof desc.when === 'function',
				}
			default: {
				const _exhaustive: never = desc
				throw new Error(`Unhandled function descriptor: ${String(_exhaustive)}`)
			}
		}
	})
}

function serializeWorkflows(workflows: AppConfig['workflows']): WorkflowDefinitionJSON[] {
	if (!workflows) return []
	return Object.entries(workflows).map(([name, wf]) => ({
		name,
		on: wf.on,
		do: wf.do,
	}))
}

function serializeAgents(agents: AppConfig['agents']): AgentDefinitionJSON[] {
	if (!agents) return []
	return Object.entries(agents).map(([name, a]) => ({
		name,
		role: a.role,
		...(a.goals ? { goals: a.goals } : {}),
	}))
}

// =============================================================================
// Validation
// =============================================================================

function validateConfig(config: AppConfig<EntitiesConfig>): void {
	if (!config || typeof config !== 'object') {
		throw new TypeError('App(config): config must be an object')
	}
	if (typeof config.name !== 'string' || config.name.trim() === '') {
		throw new Error('App(config): "name" is required and must be a non-empty string')
	}
	if (!config.entities || typeof config.entities !== 'object') {
		throw new Error('App(config): "entities" is required and must be an object')
	}
	if (Object.keys(config.entities).length === 0) {
		throw new Error('App(config): at least one entity is required')
	}
}

/** Ensure every relation target points at a declared entity. */
function validateRelations(entities: Record<string, CompiledEntity>): void {
	const names = new Set(Object.keys(entities))
	for (const [entityName, compiled] of Object.entries(entities)) {
		for (const field of compiled.fields) {
			if ((field.kind === 'belongsTo' || field.kind === 'hasMany') && field.target) {
				if (!names.has(field.target)) {
					throw new Error(
						`Relation "${entityName}.${field.name}" targets unknown entity "${field.target}". ` +
							`Known entities: ${[...names].join(', ')}.`,
					)
				}
			}
		}
	}
}

/** Ensure workflow `do` steps reference declared functions. */
function validateWorkflows(appDef: AppDefinition<EntitiesConfig>): void {
	const { workflows, functions } = appDef.config
	if (!workflows) return
	const fnNames = new Set(Object.keys(functions ?? {}))
	for (const [wfName, wf] of Object.entries(workflows)) {
		for (const step of wf.do) {
			if (!fnNames.has(step)) {
				throw new Error(
					`Workflow "${wfName}" references unknown function "${step}". ` +
						`Declared functions: ${[...fnNames].join(', ') || '(none)'}.`,
				)
			}
		}
	}
}

// =============================================================================
// Factory
// =============================================================================

/**
 * The canonical `saaskit` authoring API (ADR 0023).
 *
 * Defines a SaaS from its entities (Nouns), functions (Verbs), optional
 * workflows, and optional operating-roster agents, returning a typed,
 * JSON-serialisable {@link AppDefinition}.
 *
 * @example
 * ```ts
 * import { App, ai, agent, human } from 'saaskit'
 *
 * export default App({
 *   name: 'ledger',
 *   entities: {
 *     Invoice: {
 *       amount: 'number',
 *       status: 'open | paid | void',
 *       customer: '-> Customer',
 *       lineItems: '-> LineItem[]',
 *       notes: 'text?',
 *     },
 *     Customer: { name: 'text', email: 'email' },
 *   },
 *   functions: {
 *     markPaid: (i) => ({ ...i, status: 'paid' as const }),
 *     remind: ai('Draft a friendly overdue reminder'),
 *     collect: agent({ goal: 'Collect payment', tools: ['email', 'charge'] }),
 *     approve: human({ assignee: 'cfo' }),
 *   },
 * })
 * ```
 */
export function App<const C extends EntitiesConfig>(
	config: AppConfig<C, InferEntities<C>>,
): AppDefinition<C> {
	return new AppDefinition<C>(config)
}

/** Alias of {@link App} (honours the `define*` config convention + the codegen). */
export const defineApp = App
