/**
 * Function kinds for the `App()` authoring API.
 *
 * Per ADR 0012 (and CONTEXT.md), a SaaS Verb is implemented by a Function of one
 * of four kinds:
 *
 * - **Code** — a deterministic plain handler `(entity, ctx) => result` (the default).
 * - **Generative** — a one-shot LLM call, declared with {@link ai}.
 * - **Agentic** — a plan-execute-observe tool loop, declared with {@link agent}.
 * - **Human** — a human-in-the-loop step, declared with {@link human}.
 *
 * The `ai` / `agent` / `human` helpers return small tagged descriptors that the
 * {@link App} factory recognises and serialises into the canonical
 * {@link AppDefinition}. A plain function is treated as a Code function.
 *
 * @module app/functions
 */

/** The four Function kinds (ADR 0012). */
export type FunctionKind = 'code' | 'generative' | 'agentic' | 'human'

/** Brand used to recognise function descriptors at runtime. */
const FUNCTION_DESCRIPTOR = Symbol.for('saaskit.functionDescriptor')

// =============================================================================
// Runtime context passed to Code function handlers
// =============================================================================

/**
 * A minimal typed data accessor handed to Code functions.
 *
 * This is intentionally small for the authoring API first-swag — the real
 * runtime store (the `$` runtime) is wired downstream. It is enough to type
 * handlers against and to document intent.
 */
export interface FunctionDb {
	/** Read a single Thing by its public handle (sqid) or canonical id. */
	get<T = unknown>(entity: string, id: string): Promise<T | null>
	/** List Things of an entity, optionally filtered. */
	list<T = unknown>(entity: string, where?: Record<string, unknown>): Promise<T[]>
	/** Create a new Thing. */
	create<T = unknown>(entity: string, data: Partial<T>): Promise<T>
	/** Patch an existing Thing. */
	update<T = unknown>(entity: string, id: string, data: Partial<T>): Promise<T>
	/** Delete a Thing. */
	delete(entity: string, id: string): Promise<void>
}

/**
 * The typed context every Code function handler receives as its second argument.
 *
 * @typeParam Entities - the map of entity output types in the owning App, so
 *   `ctx.db` and `ctx.$` can be made entity-aware downstream.
 */
export interface FunctionContext {
	/** Typed data access for the SaaS's entities. */
	db: FunctionDb
	/** A stable "now" for the invocation (deterministic for Code functions). */
	now: Date
	/**
	 * The `$` runtime — the event/Action bus the platform injects. Typed loosely
	 * here; the downstream runtime narrows it. Lets handlers emit Events
	 * (`ctx.$.Invoice.paid(...)`) without the authoring API owning that surface.
	 */
	$: Record<string, unknown>
}

/**
 * A plain Code function handler.
 *
 * @typeParam Entity - the entity output type the handler operates on.
 * @typeParam Result - the handler's return type.
 */
export type CodeHandler<Entity = unknown, Result = unknown> = (
	entity: Entity,
	ctx: FunctionContext,
) => Result | Promise<Result>

// =============================================================================
// Tagged descriptors for the non-Code kinds
// =============================================================================

interface BaseDescriptor {
	readonly [FUNCTION_DESCRIPTOR]: true
	readonly kind: FunctionKind
}

/** Descriptor produced by {@link ai} — a Generative (one-shot LLM) function. */
export interface AiFunction<Input = unknown> extends BaseDescriptor {
	readonly kind: 'generative'
	/** The prompt template the model is invoked with. */
	readonly prompt: string
	/** Options describing the model invocation. */
	readonly options: AiOptions<Input>
}

/** Options accepted by {@link ai}. */
export interface AiOptions<Input = unknown> {
	/**
	 * The input schema/type the prompt is run against. Accepts a Zod schema, a
	 * Standard Schema, or a marker value used purely for typing (`input: Invoice`).
	 */
	input?: Input
	/** Optional model hint (e.g. `'gpt-4o'`, `'claude-sonnet'`). */
	model?: string
	/** Optional sampling temperature. */
	temperature?: number
	/** Optional output schema for structured generation. */
	output?: unknown
}

/** Descriptor produced by {@link agent} — an Agentic (tool-loop) function. */
export interface AgentFunction extends BaseDescriptor {
	readonly kind: 'agentic'
	/** The goal the agent pursues. */
	readonly goal: string
	/** The tool names the agent may call. */
	readonly tools: string[]
	/** Optional ceiling on plan-execute-observe iterations. */
	readonly maxSteps?: number
}

/** Config accepted by {@link agent}. */
export interface AgentConfig {
	/** The goal the agent pursues. */
	goal: string
	/** The tool names the agent may call. */
	tools?: string[]
	/** Optional ceiling on plan-execute-observe iterations. */
	maxSteps?: number
}

/** Descriptor produced by {@link human} — a Human-in-the-loop function. */
export interface HumanFunction<Entity = unknown> extends BaseDescriptor {
	readonly kind: 'human'
	/** Who the step is assigned to (a role name or actor id). */
	readonly assignee: string
	/**
	 * Optional predicate gating *whether* the human step is required for a given
	 * Thing. When omitted, the step always applies.
	 */
	readonly when?: (entity: Entity) => boolean
}

/** Config accepted by {@link human}. */
export interface HumanConfig<Entity = unknown> {
	/** Who the step is assigned to (a role name or actor id). */
	assignee: string
	/** Optional predicate gating whether the step is required. */
	when?: (entity: Entity) => boolean
}

/** Union of the helper-produced descriptors (i.e. the non-Code kinds). */
export type FunctionDescriptor =
	// biome-ignore lint/suspicious/noExplicitAny: see {@link HumanFunction.when}.
	| AiFunction<any>
	| AgentFunction
	// biome-ignore lint/suspicious/noExplicitAny: keep `when` argument contravariance-friendly.
	| HumanFunction<any>

/**
 * Any value accepted in an App's `functions` map: a plain Code handler or one
 * of the tagged descriptors. The handler's `entity` is `any` so authors may
 * narrow it via their own annotation (function parameters are contravariant).
 */
export type FunctionSpec =
	// biome-ignore lint/suspicious/noExplicitAny: bivariant entity arg.
	((entity: any, ctx: FunctionContext) => unknown) | FunctionDescriptor

// =============================================================================
// Helpers
// =============================================================================

/**
 * Declare a **Generative** (one-shot LLM) function.
 *
 * @example
 * ```ts
 * remind: ai('Draft a friendly overdue reminder', { input: Invoice })
 * ```
 */
export function ai<Input = unknown>(
	prompt: string,
	options: AiOptions<Input> = {},
): AiFunction<Input> {
	return {
		[FUNCTION_DESCRIPTOR]: true,
		kind: 'generative',
		prompt,
		options,
	}
}

/**
 * Declare an **Agentic** (plan-execute-observe tool loop) function.
 *
 * @example
 * ```ts
 * collect: agent({ goal: 'Collect payment', tools: ['email', 'charge'] })
 * ```
 */
export function agent(config: AgentConfig): AgentFunction {
	return {
		[FUNCTION_DESCRIPTOR]: true,
		kind: 'agentic',
		goal: config.goal,
		tools: config.tools ?? [],
		...(config.maxSteps !== undefined ? { maxSteps: config.maxSteps } : {}),
	}
}

/**
 * Declare a **Human-in-the-loop** function.
 *
 * @example
 * ```ts
 * approve: human({ assignee: 'cfo', when: (i) => i.amount > 5000 })
 * ```
 */
export function human<Entity = unknown>(config: HumanConfig<Entity>): HumanFunction<Entity> {
	return {
		[FUNCTION_DESCRIPTOR]: true,
		kind: 'human',
		assignee: config.assignee,
		...(config.when ? { when: config.when } : {}),
	}
}

// =============================================================================
// Introspection
// =============================================================================

/** True when a value is one of the tagged helper descriptors. */
export function isFunctionDescriptor(value: unknown): value is FunctionDescriptor {
	return (
		typeof value === 'object' &&
		value !== null &&
		(value as Record<symbol, unknown>)[FUNCTION_DESCRIPTOR] === true
	)
}

/**
 * Resolve the {@link FunctionKind} of a function spec. A plain function is a
 * Code function; the helper descriptors carry their own kind.
 */
export function functionKind(spec: FunctionSpec): FunctionKind {
	if (isFunctionDescriptor(spec)) return spec.kind
	if (typeof spec === 'function') return 'code'
	throw new TypeError('A function must be a handler or an ai()/agent()/human() descriptor')
}
