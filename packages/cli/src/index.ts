/**
 * @saaskit/cli
 *
 * CLI for SaaSKit - development server and build commands.
 *
 * @module @saaskit/cli
 */

// Dev Command - not yet implemented
export { DevCommand } from './commands/dev'
export type { DevCommandOptions } from './commands/dev'

// Serve Command - production mode (RED phase stub)
export { ServeCommand } from './commands/serve'
export type { ServeCommandOptions } from './commands/serve'

// MCP Command - MCP server for AI tools (RED phase stub)
export { McpCommand } from './commands/mcp'
export type { McpCommandOptions } from './commands/mcp'
