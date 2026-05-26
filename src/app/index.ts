/**
 * The canonical `saaskit` authoring API (ADR 0023).
 *
 * Headline exports:
 * - {@link App} / {@link defineApp} — the config factory.
 * - {@link ai} / {@link agent} / {@link human} — Function-kind helpers.
 * - `z` — re-exported Zod (the escape hatch + canonical validation, ADR 0020).
 *
 * @module app
 */

// Re-export Zod as the escape hatch + canonical validation form (ADR 0020).
export { z } from 'zod'

// The factory + its return type.
export {
	App,
	defineApp,
	AppDefinition,
	DEFAULT_BUYER_CHAIN,
	DEFAULT_VERSION,
	APP_DEFINITION_FORMAT,
} from './define'

// Function-kind helpers + their types.
export { ai, agent, human, functionKind, isFunctionDescriptor } from './functions'
export type {
	FunctionKind,
	FunctionContext,
	FunctionDb,
	CodeHandler,
	FunctionSpec,
	FunctionDescriptor,
	AiFunction,
	AiOptions,
	AgentFunction,
	AgentConfig,
	HumanFunction,
	HumanConfig,
} from './functions'

// Field DSL compiler (advanced / introspection).
export {
	parseFieldShorthand,
	fieldToZod,
	compileEntity,
	autoFieldDefs,
	isZodEntity,
} from './dsl'
export type {
	FieldDef,
	FieldKind,
	ScalarFieldKind,
	CompiledEntity,
	EntityInput,
} from './dsl'

// JSON Schema conversion.
export { zodToJsonSchema } from './json-schema'
export type { JsonSchema } from './json-schema'

// ID helpers (ADR 0020).
export { newId, newHandle, toHandle } from './ids'

// Public config / definition types.
export type {
	AppConfig,
	BuyerChain,
	EntityDef,
	EntitiesConfig,
	ShorthandEntity,
	FunctionsConfig,
	FunctionValue,
	TypedCodeHandler,
	WorkflowDef,
	WorkflowsConfig,
	RosterAgentDef,
	AgentsConfig,
	InferEntity,
	InferEntities,
	InferShorthand,
	AppDefinitionJSON,
	EntityDefinitionJSON,
	FieldDefinitionJSON,
	FunctionDefinitionJSON,
	WorkflowDefinitionJSON,
	AgentDefinitionJSON,
} from './types'
