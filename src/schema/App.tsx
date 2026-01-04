/**
 * App Schema Definition
 *
 * The App component is the root of a SaaSkit application definition.
 * It serves as the declarative entry point for defining complete SaaS products.
 *
 * @example
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
 * @module schema/App
 */

import React, { createContext, useContext, type ReactNode, type ReactElement } from 'react'

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
   *
   * @example "todos", "my-crm", "issue-tracker"
   */
  name: string

  /**
   * A human-readable description of the application.
   *
   * Used in:
   * - CLI help output
   * - API documentation
   * - MCP tool descriptions
   * - Generated SDK README
   *
   * @example "A simple task management application"
   */
  description?: string

  /**
   * The semantic version of the application.
   *
   * Follows semver conventions (major.minor.patch).
   * Displayed in CLI headers and included in API responses.
   *
   * @example "1.0.0", "2.1.3"
   */
  version?: string

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
 * Metadata extracted from an App component for use by generators.
 *
 * This interface represents the normalized, processed form of app configuration
 * that is consumed by the various output generators (TUI, API, SDK, MCP).
 */
export interface AppMetadata {
  /**
   * The application name (from AppProps.name).
   * @see AppProps.name
   */
  name: string

  /**
   * The application description (from AppProps.description).
   * @see AppProps.description
   */
  description?: string

  /**
   * The application version (from AppProps.version).
   * @see AppProps.version
   */
  version?: string

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
export function App({ name, description, version, children }: AppProps): ReactElement {
  const metadata: AppMetadata = {
    name,
    description,
    version,
    resources: [],
  }

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
  const { name, description, version } = app.props

  if (!name) {
    throw new Error(
      'App component requires a "name" prop. ' +
        'Example: <App name="my-app">...</App>'
    )
  }

  return {
    name,
    description,
    version,
    resources: [],
  }
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
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as AppMetadata).name === 'string' &&
    'resources' in value &&
    Array.isArray((value as AppMetadata).resources)
  )
}

// Re-export the context for advanced use cases
export { AppContext }
