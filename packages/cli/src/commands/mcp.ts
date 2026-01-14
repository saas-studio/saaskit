/**
 * MCP Command - GREEN Phase Implementation
 *
 * MCP server for AI tool integration.
 * Supports HTTP, SSE, and stdio transports for AI tool interaction.
 */

/**
 * Options for the mcp command
 */
export interface McpCommandOptions {
  port?: number
  transport?: 'http' | 'sse' | 'stdio'
  cwd?: string
}

/**
 * Option definition for CLI parsing
 */
export interface CommandOption {
  name: string
  type: 'string' | 'number' | 'boolean'
  alias?: string
  description?: string
  default?: unknown
}

/**
 * MCP Tool definition
 */
export interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

/**
 * MCP Manifest definition
 */
export interface McpManifest {
  tools: McpTool[]
}

/**
 * Schema resource definition
 */
interface SchemaResource {
  fields: Record<string, unknown>
}

/**
 * Schema definition
 */
interface Schema {
  name: string
  resources: Record<string, SchemaResource>
}

/**
 * Dependencies that can be injected for testing
 */
export interface McpCommandDependencies {
  loadSchema?: (cwd: string) => Promise<Schema>
  startHttpServer?: (opts: { port: number }) => Promise<{ port: number }>
  startSseServer?: (opts: { port: number }) => Promise<{ port: number }>
  startStdioHandler?: () => Promise<void>
}

/**
 * Valid transport types
 */
const VALID_TRANSPORTS = ['http', 'sse', 'stdio'] as const

/**
 * McpCommand class - MCP server for AI tools
 *
 * GREEN Phase: Full implementation for AI tool integration.
 */
export class McpCommand {
  static name = 'mcp'
  static description = 'Start MCP server for AI tool integration'
  static options: CommandOption[] = [
    { name: 'port', alias: 'p', type: 'number', description: 'Port to run on' },
    { name: 'transport', alias: 't', type: 'string', description: 'Transport type (http/sse/stdio)' }
  ]

  defaultOptions: McpCommandOptions = {
    port: 8787,
    transport: 'http'
  }

  tools: McpTool[] = []

  private deps: McpCommandDependencies

  constructor(deps?: McpCommandDependencies) {
    this.deps = deps || {}
  }

  /**
   * Parse CLI arguments into options
   */
  parseOptions(args: string[]): McpCommandOptions {
    const options: McpCommandOptions = {
      port: this.defaultOptions.port,
      transport: this.defaultOptions.transport
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]

      if (arg === '--port' || arg === '-p') {
        const nextArg = args[i + 1]
        if (nextArg !== undefined) {
          options.port = parseInt(nextArg, 10)
          i++ // Skip the next argument since we consumed it
        }
      } else if (arg === '--transport' || arg === '-t') {
        const nextArg = args[i + 1]
        if (nextArg !== undefined) {
          if (!VALID_TRANSPORTS.includes(nextArg as typeof VALID_TRANSPORTS[number])) {
            throw new Error(`Invalid transport: ${nextArg}. Valid options: ${VALID_TRANSPORTS.join(', ')}`)
          }
          options.transport = nextArg as 'http' | 'sse' | 'stdio'
          i++ // Skip the next argument since we consumed it
        }
      }
    }

    return options
  }

  /**
   * Prepare the MCP server environment
   */
  async prepare(opts: { cwd: string }): Promise<void> {
    // Load schema if dependency is provided
    if (this.deps.loadSchema) {
      await this.deps.loadSchema(opts.cwd)
    }
  }

  /**
   * Derive MCP tools from schema resources
   * Generates CRUD tools for each resource in the schema
   */
  async deriveTools(opts: { cwd: string }): Promise<McpTool[]> {
    if (!this.deps.loadSchema) {
      return []
    }

    const schema = await this.deps.loadSchema(opts.cwd)
    const tools: McpTool[] = []

    for (const [resourceName, resource] of Object.entries(schema.resources)) {
      // Convert resource name to singular form for tool naming
      // e.g., "users" -> "User"
      const singularName = resourceName.endsWith('s')
        ? resourceName.slice(0, -1)
        : resourceName
      const capitalizedName = singularName.charAt(0).toUpperCase() + singularName.slice(1)

      // Generate CRUD tools for this resource
      tools.push({
        name: `list${capitalizedName}s`,
        description: `List all ${resourceName}`,
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of results' },
            offset: { type: 'number', description: 'Number of results to skip' }
          }
        }
      })

      tools.push({
        name: `create${capitalizedName}`,
        description: `Create a new ${singularName}`,
        inputSchema: {
          type: 'object',
          properties: resource.fields,
          required: Object.keys(resource.fields)
        }
      })

      tools.push({
        name: `get${capitalizedName}`,
        description: `Get a ${singularName} by ID`,
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: `${capitalizedName} ID` }
          },
          required: ['id']
        }
      })

      tools.push({
        name: `update${capitalizedName}`,
        description: `Update a ${singularName}`,
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: `${capitalizedName} ID` },
            ...resource.fields
          },
          required: ['id']
        }
      })

      tools.push({
        name: `delete${capitalizedName}`,
        description: `Delete a ${singularName}`,
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: `${capitalizedName} ID` }
          },
          required: ['id']
        }
      })
    }

    this.tools = tools
    return tools
  }

  /**
   * Start the MCP server with specified transport
   */
  async start(opts: { port?: number; transport?: 'http' | 'sse' | 'stdio' }): Promise<void> {
    const transport = opts.transport || this.defaultOptions.transport
    const port = opts.port || this.defaultOptions.port!

    if (transport === 'http' && this.deps.startHttpServer) {
      await this.deps.startHttpServer({ port })
    } else if (transport === 'sse' && this.deps.startSseServer) {
      await this.deps.startSseServer({ port })
    } else if (transport === 'stdio' && this.deps.startStdioHandler) {
      await this.deps.startStdioHandler()
    }
  }

  /**
   * Get MCP manifest with available tools
   */
  getManifest(): McpManifest {
    return { tools: this.tools }
  }
}
