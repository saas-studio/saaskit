/**
 * App Schema Definition
 *
 * The App component is the root of a SaaSkit application definition.
 * It serves as the declarative entry point for defining complete SaaS products.
 *
 * From a single App definition, SaaSkit generates:
 * - Terminal UI (React Ink interactive interface)
 * - CLI commands for all CRUD operations
 * - REST API endpoints
 * - TypeScript SDK with full type safety
 * - MCP Server for AI agent integration
 *
 * @example Basic Usage
 * ```tsx
 * import { App, Resource } from 'saaskit'
 *
 * export default (
 *   <App name="todos" description="Task management" version="1.0.0">
 *     <Resource name="Task" title done priority="low | medium | high" />
 *   </App>
 * )
 * ```
 *
 * @example With Multiple Resources
 * ```tsx
 * <App name="crm" description="Customer Relationship Manager">
 *   <Resource name="Contact" name email:email company? />
 *   <Resource name="Deal" title contact->Contact value:number status="open | won | lost" />
 *   <Resource name="Note" content contact->Contact createdAt:auto />
 * </App>
 * ```
 *
 * @module schema/App
 */

import React, { createContext, useContext, type ReactNode, type ReactElement } from 'react'
import { normalizeName, toDisplayName } from '../utils'

/**
 * Configuration props for the App component.
 *
 * These props define the core identity and configuration of your SaaS application.
 * From these props, SaaSkit generates CLI commands, API endpoints, SDKs, and MCP tools.
 *
 * @example
 * ```tsx
 * const props: AppProps = {
 *   name: 'todos',
 *   description: 'A simple task manager',
 *   version: '1.0.0'
 * }
 * ```
 */
/**
 * Default application version when not specified.
 */
export const DEFAULT_APP_VERSION = '0.1.0'

export interface AppProps {
  /**
   * The unique identifier for the application.
   *
   * This name is used to:
   * - Generate CLI command names (e.g., `todos list`, `todos create`)
   * - Create API endpoint prefixes (e.g., `/api/todos/tasks`)
   * - Name the generated SDK package (e.g., `todos-sdk`)
   * - Register MCP tools (e.g., `todos_tasks_list`)
   *
   * Should be lowercase, alphanumeric, and may contain hyphens.
   * Names are automatically normalized to lowercase with hyphens.
   *
   * @example "todos", "my-crm", "issue-tracker"
   */
  name: string

  /**
   * A human-readable description of the application.
   *
   * Used in:
   * - CLI help output
   * - API documentation (OpenAPI description)
   * - MCP tool descriptions
   * - Generated SDK README
   *
   * @default Inferred from name: "{Name} - A SaaSkit application"
   * @example "A simple task management application"
   */
  description?: string

  /**
   * The semantic version of the application.
   *
   * Follows semver conventions (major.minor.patch).
   * Displayed in CLI headers and included in API responses.
   *
   * @default "0.1.0"
   * @example "1.0.0", "2.1.3"
   */
  version?: string

  /**
   * Base URL for the API. Used for SDK generation and documentation.
   *
   * @default "http://localhost:3000"
   * @example "https://api.myapp.com"
   */
  baseUrl?: string

  /**
   * Enable or disable specific output targets.
   * All targets are enabled by default.
   *
   * @example { cli: true, api: true, sdk: false, mcp: false }
   */
  targets?: {
    /** Generate CLI commands */
    cli?: boolean
    /** Generate REST API */
    api?: boolean
    /** Generate TypeScript SDK */
    sdk?: boolean
    /** Generate MCP server */
    mcp?: boolean
  }

  /**
   * Child components, typically Resource definitions.
   *
   * Each child Resource component defines a data model
   * that will have CRUD operations generated automatically.
   *
   * @example
   * ```tsx
   * <App name="todos">
   *   <Resource name="Task" title done />
   *   <Resource name="User" name email:email />
   * </App>
   * ```
   */
  children?: ReactNode
}

/**
 * Default targets configuration - all enabled.
 */
export const DEFAULT_TARGETS = {
  cli: true,
  api: true,
  sdk: true,
  mcp: true,
} as const

/**
 * Default base URL for local development.
 */
export const DEFAULT_BASE_URL = 'http://localhost:3000'

/**
 * Metadata extracted from an App component for use by generators.
 *
 * This interface represents the normalized, processed form of app configuration
 * that is consumed by the various output generators (TUI, API, SDK, MCP).
 * All optional fields have sensible defaults applied during extraction.
 */
export interface AppMetadata {
  /**
   * The normalized application name (lowercase, hyphenated).
   * @see AppProps.name
   */
  name: string

  /**
   * The display name (capitalized, human-readable).
   * Derived from the name prop.
   */
  displayName: string

  /**
   * The application description.
   * Defaults to "{DisplayName} - A SaaSkit application" if not provided.
   * @see AppProps.description
   */
  description: string

  /**
   * The application version.
   * Defaults to "0.1.0" if not provided.
   * @see AppProps.version
   */
  version: string

  /**
   * Base URL for the API.
   * Defaults to "http://localhost:3000".
   */
  baseUrl: string

  /**
   * Which output targets are enabled.
   * All targets are enabled by default.
   */
  targets: {
    cli: boolean
    api: boolean
    sdk: boolean
    mcp: boolean
  }

  /**
   * List of resource names defined in this application.
   *
   * Populated when the App component tree is traversed.
   * Each resource will have CRUD operations generated.
   */
  resources: string[]
}

/**
 * React Context for accessing App metadata from child components.
 *
 * @internal
 */
const AppContext = createContext<AppMetadata | null>(null)

// =============================================================================
// Helper Functions
// =============================================================================

// Re-export string utilities from utils for backwards compatibility
export { normalizeName, toDisplayName } from '../utils'

/**
 * Creates a complete AppMetadata object with defaults applied.
 *
 * @internal
 */
function createMetadata(props: AppProps): AppMetadata {
  const normalizedName = normalizeName(props.name)
  const displayName = toDisplayName(normalizedName)

  return {
    name: normalizedName,
    displayName,
    description: props.description ?? `${displayName} - A SaaSkit application`,
    version: props.version ?? DEFAULT_APP_VERSION,
    baseUrl: props.baseUrl ?? DEFAULT_BASE_URL,
    targets: {
      cli: props.targets?.cli ?? DEFAULT_TARGETS.cli,
      api: props.targets?.api ?? DEFAULT_TARGETS.api,
      sdk: props.targets?.sdk ?? DEFAULT_TARGETS.sdk,
      mcp: props.targets?.mcp ?? DEFAULT_TARGETS.mcp,
    },
    resources: [],
  }
}

/**
 * The root component for defining a SaaSkit application.
 *
 * Wrap your Resource definitions in an App component to create
 * a complete SaaS application with automatic generation of:
 *
 * - **Terminal UI**: Interactive React Ink interface
 * - **CLI**: Command-line interface for all operations
 * - **REST API**: HTTP endpoints for programmatic access
 * - **TypeScript SDK**: Type-safe client library
 * - **MCP Server**: Native AI agent integration
 *
 * @param props - The application configuration
 * @returns A React element that provides app context to children
 *
 * @example Basic usage
 * ```tsx
 * <App name="todos">
 *   <Resource name="Task" title done />
 * </App>
 * ```
 *
 * @example With full configuration
 * ```tsx
 * <App name="crm" description="Customer Relationship Manager" version="2.0.0">
 *   <Resource name="Contact" name email:email company? />
 *   <Resource name="Deal" title contact->Contact value:number />
 * </App>
 * ```
 */
export function App(props: AppProps): ReactElement {
  const { children } = props
  const metadata = createMetadata(props)

  return <AppContext.Provider value={metadata}>{children}</AppContext.Provider>
}

/**
 * Hook to access the current App's metadata from within the component tree.
 *
 * Use this hook in custom components that need to access application-level
 * configuration, such as the app name for generating CLI commands or
 * API endpoint prefixes.
 *
 * @returns The AppMetadata if within an App component, null otherwise
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const app = useApp()
 *   if (!app) {
 *     return <Text>Not within an App context</Text>
 *   }
 *   return <Text>App: {app.name}</Text>
 * }
 * ```
 */
export function useApp(): AppMetadata | null {
  return useContext(AppContext)
}

/**
 * Hook to access App metadata, throwing if not within an App context.
 *
 * Use this variant when your component requires the App context to function.
 * It provides better type narrowing (non-nullable return) and clearer error messages.
 *
 * @returns The AppMetadata (guaranteed non-null)
 * @throws Error if called outside of an App component tree
 *
 * @example
 * ```tsx
 * function ResourceList() {
 *   const app = useAppRequired()
 *   // app is guaranteed to be non-null here
 *   return <Text>Resources in {app.name}: {app.resources.length}</Text>
 * }
 * ```
 */
export function useAppRequired(): AppMetadata {
  const app = useContext(AppContext)
  if (!app) {
    throw new Error('useAppRequired must be used within an <App> component')
  }
  return app
}

/**
 * Extracts metadata from an App React element without rendering it.
 *
 * This function is used by generators to analyze an App definition
 * and extract the configuration needed for code generation.
 *
 * @param app - A React element created with the App component
 * @returns The extracted AppMetadata
 * @throws Error if the element is missing the required `name` prop
 *
 * @example
 * ```tsx
 * const appElement = <App name="todos" description="Task manager" />
 * const metadata = getAppMetadata(appElement)
 * console.log(metadata.name) // "todos"
 * ```
 */
export function getAppMetadata(app: ReactElement<AppProps>): AppMetadata {
  const { name } = app.props

  if (!name) {
    throw new Error(
      'App component requires a "name" prop.\n\n' +
      'The name is used to:\n' +
      '  - Generate CLI command names (e.g., `todos list`)\n' +
      '  - Create API endpoint prefixes (e.g., `/api/todos/tasks`)\n' +
      '  - Name the generated SDK package\n' +
      '  - Register MCP tools\n\n' +
      'Example:\n' +
      '  <App name="my-app">...</App>\n' +
      '  <App name="todos" description="Task management" version="1.0.0">...</App>'
    )
  }

  if (typeof name !== 'string') {
    throw new Error(
      `App name must be a string, received ${typeof name}.\n\n` +
      'Example: <App name="my-app">...</App>'
    )
  }

  if (name.trim() === '') {
    throw new Error(
      'App name cannot be empty.\n\n' +
      'Provide a valid name like "todos", "my-crm", or "issue-tracker".'
    )
  }

  const normalizedName = normalizeName(name)
  if (normalizedName === '' || !/^[a-z][a-z0-9-]*$/.test(normalizedName)) {
    throw new Error(
      `Invalid App name "${name}".\n\n` +
      'App names must:\n' +
      '  - Start with a letter\n' +
      '  - Contain only letters, numbers, hyphens, and underscores\n' +
      '  - Not be empty after normalization\n\n' +
      'Valid examples: "todos", "my-crm", "issue-tracker", "MyApp"'
    )
  }

  return createMetadata(app.props)
}

/**
 * Type guard to check if a value is valid AppMetadata.
 *
 * @param value - The value to check
 * @returns True if the value is valid AppMetadata
 *
 * @example
 * ```tsx
 * const maybeApp = useApp()
 * if (isAppMetadata(maybeApp)) {
 *   // maybeApp is narrowed to AppMetadata
 *   console.log(maybeApp.name)
 * }
 * ```
 */
export function isAppMetadata(value: unknown): value is AppMetadata {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    typeof obj.name === 'string' &&
    typeof obj.displayName === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.baseUrl === 'string' &&
    typeof obj.targets === 'object' &&
    obj.targets !== null &&
    Array.isArray(obj.resources)
  )
}

// Re-export the context for advanced use cases
export { AppContext }
