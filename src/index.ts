/**
 * SaaSkit - Headless SaaS for AI Agents
 *
 * A declarative framework for building multi-surface SaaS applications
 * that work seamlessly across Terminal UI, CLI, REST API, SDK, and MCP.
 *
 * @packageDocumentation
 */

// =============================================================================
// Version & Metadata
// =============================================================================

/** Current SaaSkit version */
export const VERSION = '0.1.0'

/** Framework name */
export const NAME = 'saaskit'

/** Framework description */
export const DESCRIPTION = 'Headless SaaS for AI Agents'

// =============================================================================
// Schema Components
// =============================================================================

// App - Root component for defining a SaaS application
export { App, useApp, useAppRequired, getAppMetadata, isAppMetadata } from './schema/App'
export type { AppProps, AppMetadata } from './schema/App'

// Resource - Data model definition component
export { Resource, parseResourceProps, getResourceMetadata } from './schema/Resource'
export type { ResourceProps, ResourceMetadata, FieldDefinition, FieldType, FieldRelation } from './schema/Resource'

// =============================================================================
// Field Components (Expanded Syntax)
// =============================================================================

export {
	Text,
	Number,
	Boolean,
	Date,
	Select,
	Relation,
	isFieldElement,
	getFieldMetadata,
	extractFieldsFromChildren,
} from './schema/fields'
export type {
	TextFieldProps,
	NumberFieldProps,
	BooleanFieldProps,
	DateFieldProps,
	SelectFieldProps,
	RelationFieldProps,
	CascadeType,
	FieldMetadata,
	FieldValidation,
	FieldRelationMetadata,
} from './schema/fields'

// =============================================================================
// Type-Safe Field Builders (Fluent API)
// =============================================================================

export {
	// Field factory functions
	string,
	email,
	url,
	uuid,
	number,
	integer,
	boolean,
	date,
	datetime,
	timestamp,
	enumField,
	json,
	id,
	// Relationship factory functions
	belongsTo,
	hasOne,
	hasMany,
	manyToMany,
} from './schema/define/builders'

export type {
	StringBuilder,
	NumberBuilder,
	BooleanBuilder,
	DateBuilder,
	EnumBuilder,
	JsonBuilder,
	RelationBuilder,
	IdBuilder,
} from './schema/define/builders'

// =============================================================================
// View Components
// =============================================================================

// List - Collection display with multiple layout variants
export { List, useListSelection, useListSort, useVirtualScroll } from './views/List'
export type {
	ListProps,
	ListVariant,
	SelectionMode,
	SortDirection,
	PaginationConfig,
	FilterConfig,
	VirtualScrollConfig,
	VirtualScrollResult,
} from './views/List'

// Detail - Single record display
export { Detail } from './views/Detail'
export type { DetailProps, DetailLayout, DetailSection } from './views/Detail'

// Form - Data entry and editing
export { Form, getRenderedFields, simulateSubmit, getValidationErrors } from './views/Form'
export type { FormProps, FormMode, FormField } from './views/Form'

// =============================================================================
// UI Components
// =============================================================================

export { Text as TextComponent, Box } from './components'
export type { TextProps, TextColor, BoxProps, BorderStyle, FlexDirection } from './components'

// =============================================================================
// Data Layer
// =============================================================================

export { MemoryStore } from './data/MemoryStore'
export type { Record } from './data/MemoryStore'

// =============================================================================
// Rendering
// =============================================================================

export { render, detectFormat } from './render'
export type { RenderOptions, OutputFormat } from './render'

// =============================================================================
// CLI Parser
// =============================================================================

export { parseArgs, parseCommand, createParseError } from './cli/parser'
export type {
	ParsedCommand,
	Command,
	ParseResult,
	ParseError,
	ParseErrorCode,
	Operation,
	GlobalFlags,
	ResourceSchema,
	FlagSchema,
} from './cli/parser'

// =============================================================================
// API Router
// =============================================================================

export { createAPIRouter, createErrorResponse, createSuccessResponse, ErrorCodes } from './api/rest'
export type {
	APIRouter,
	Route,
	RouteHandler,
	RouteContext,
	HTTPMethod,
	APIResponse,
	APIError,
	APIErrorDetail,
	PaginationMeta,
	CreateAPIRouterOptions,
	ErrorCode,
} from './api/rest'

// =============================================================================
// Interactive Mode
// =============================================================================

export {
	createInteractiveMode,
	parseKeyEvent,
	formatStatusBar,
	getDefaultShortcuts,
	DEFAULT_SHORTCUTS,
	DEFAULT_MAX_HISTORY_DEPTH,
} from './interactive/mode'
export type {
	InteractiveMode,
	InteractiveModeOptions,
	ViewState,
	ViewType,
	FormMode as InteractiveFormMode,
	ConfirmAction,
	StatusBarInfo,
	ShortcutInfo,
	KeyEvent,
} from './interactive/mode'

// =============================================================================
// Parsers
// =============================================================================

export { parseMermaidER } from './parsers/mermaid-er'
export { parseMermaidState, stateToSelectField } from './parsers/mermaid-state'
export type { StateParseResult, SelectFieldConfig } from './parsers/mermaid-state'
export { parseViewAnnotations } from './parsers/view-annotation'
export type { ViewConfig, FieldViewConfig, ViewAnnotationParseResult } from './parsers/view-annotation'

// =============================================================================
// Schema AST & Compiler
// =============================================================================

export {
	parseJSXToAST,
	validateAST,
	serializeAST,
	deserializeAST,
	createAppNode,
	createResourceNode,
	createFieldNode,
	normalizeName,
	toDisplayName,
	pluralize,
	parseFieldType,
} from './schema/ast'
export type {
	AppNode,
	ResourceNode,
	FieldNode,
	FieldType as ASTFieldType,
	FieldModifiers,
	TargetConfig,
	ASTNode,
	ParseResult as ASTParseResult,
	ParseError as ASTParseError,
} from './schema/ast'

export { compileToTypeScript, compileToJSON, compileToOpenAPI } from './compiler/schema-compiler'
export type { TypeScriptResult, JSONSchemaResult, OpenAPIResult } from './compiler/schema-compiler'

// =============================================================================
// SDK Generator
// =============================================================================

export { generateSDK, generateSDKTypes, generateSDKClient } from './sdk/generate'
export type { GeneratedFile, SDKResult } from './sdk/generate'

// =============================================================================
// Command Palette
// =============================================================================

export { CommandPalette } from './cli/command-palette'
export type { Command as PaletteCommand } from './cli/command-palette'
