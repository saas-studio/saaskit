#!/usr/bin/env node
/**
 * SaaSKit CLI Entry Point
 *
 * Main CLI binary that users run as `saaskit` or `npx saaskit`.
 *
 * Usage:
 *   saaskit                    # Start TUI mode (default)
 *   saaskit dev                # Start TUI mode
 *   saaskit serve              # Start API server
 *   saaskit mcp                # Start MCP server
 *   saaskit <resource> <action> # Resource commands
 *
 * Global Flags:
 *   --help, -h          Show help
 *   --version, -v       Show version
 *   --schema <path>     Path to schema.yaml
 *   --verbose           Enable verbose output
 *   --quiet             Suppress output
 *   --no-color          Disable colors
 */

import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

// Version from package.json
const VERSION = '0.1.0'

// ============================================================================
// Types
// ============================================================================

export interface CLIResult {
  exitCode: number
  stdout: string
  stderr: string
}

export interface CLIOptions {
  cwd?: string
}

export interface ParsedArgs {
  command: 'dev' | 'serve' | 'mcp' | 'resource' | 'help' | 'version'
  resource?: string
  action?: string
  args: string[]
  flags: Record<string, string | boolean>
  help: boolean
  version: boolean
  schemaPath?: string
  verbose: boolean
  quiet: boolean
  noColor: boolean
  unknownFlags: string[]
}

// Known flags (global and command-specific)
const KNOWN_FLAGS = new Set([
  'help', 'h', 'version', 'v', 'schema', 'verbose', 'quiet', 'q', 'no-color',
  'port', 'host', // serve command flags
])

// Known subcommands
const SUBCOMMANDS = new Set(['dev', 'serve', 'mcp'])

// Known resource actions
const RESOURCE_ACTIONS = new Set(['list', 'show', 'create', 'update', 'delete', 'get', 'new', 'edit', 'rm', 'ls'])

// ============================================================================
// Argument Parsing
// ============================================================================

/**
 * Parse CLI arguments into a structured format
 */
export function parseCliArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: 'dev',
    args: [],
    flags: {},
    help: false,
    version: false,
    verbose: false,
    quiet: false,
    noColor: false,
    unknownFlags: [],
  }

  let i = 0
  const positionals: string[] = []

  while (i < args.length) {
    const arg = args[i]

    // Handle --help
    if (arg === '--help' || arg === '-h') {
      result.help = true
      i++
      continue
    }

    // Handle --version
    if (arg === '--version' || arg === '-v') {
      result.version = true
      i++
      continue
    }

    // Handle --schema
    if (arg === '--schema') {
      if (i + 1 < args.length) {
        result.schemaPath = args[i + 1]
        i += 2
        continue
      }
      i++
      continue
    }

    // Handle --verbose
    if (arg === '--verbose') {
      result.verbose = true
      i++
      continue
    }

    // Handle --quiet
    if (arg === '--quiet' || arg === '-q') {
      result.quiet = true
      i++
      continue
    }

    // Handle --no-color
    if (arg === '--no-color') {
      result.noColor = true
      i++
      continue
    }

    // Handle other long flags with values
    if (arg.startsWith('--')) {
      let flagName = arg.slice(2)
      let value: string | boolean = true

      if (arg.includes('=')) {
        const eqIndex = arg.indexOf('=')
        flagName = arg.slice(2, eqIndex)
        value = arg.slice(eqIndex + 1)
      } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        value = args[i + 1]
        i++
      }

      // Check if this is a known flag
      if (!KNOWN_FLAGS.has(flagName)) {
        result.unknownFlags.push(`--${flagName}`)
      }

      result.flags[flagName] = value
      i++
      continue
    }

    // Handle short flags
    if (arg.startsWith('-') && arg.length > 1) {
      const flagName = arg.slice(1)

      // Check if this is a known flag
      if (!KNOWN_FLAGS.has(flagName)) {
        result.unknownFlags.push(`-${flagName}`)
      }

      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        result.flags[flagName] = args[i + 1]
        i++
      } else {
        result.flags[flagName] = true
      }
      i++
      continue
    }

    // Positional argument
    positionals.push(arg)
    i++
  }

  // Parse positional arguments to determine command
  if (positionals.length === 0) {
    // No positional args - default to dev
    result.command = 'dev'
  } else if (SUBCOMMANDS.has(positionals[0])) {
    // Known subcommand
    result.command = positionals[0] as 'dev' | 'serve' | 'mcp'
    result.args = positionals.slice(1)
  } else if (positionals.length >= 2 && RESOURCE_ACTIONS.has(positionals[1])) {
    // Resource action pattern: <resource> <action> [args...]
    result.command = 'resource'
    result.resource = positionals[0]
    result.action = positionals[1]
    result.args = positionals.slice(2)
  } else if (positionals.length === 1 && positionals[0] === 'help') {
    result.help = true
  } else if (positionals.length === 1 && positionals[0] === 'version') {
    result.version = true
  } else {
    // Unknown command - treat as potential resource without action
    // This will be handled as an error in the main CLI function
    result.command = 'resource'
    result.resource = positionals[0]
    result.args = positionals.slice(1)
  }

  return result
}

// ============================================================================
// Schema Detection
// ============================================================================

/**
 * Find schema file in the given directory
 */
function findSchemaFile(cwd: string): string | null {
  const candidates = ['schema.yaml', 'schema.yml', 'saaskit.yaml', 'saaskit.yml']

  for (const candidate of candidates) {
    const fullPath = join(cwd, candidate)
    if (existsSync(fullPath)) {
      return fullPath
    }
  }

  return null
}

/**
 * Load and validate schema file
 */
async function loadSchema(schemaPath: string): Promise<{ success: true; schema: unknown } | { success: false; error: string }> {
  try {
    if (!existsSync(schemaPath)) {
      return { success: false, error: `Schema file not found: ${schemaPath}` }
    }

    const content = readFileSync(schemaPath, 'utf-8')

    // Import the schema parser dynamically
    try {
      const { parseSchemaYaml } = await import('@saaskit/schema')
      const schema = parseSchemaYaml(content)
      return { success: true, schema }
    } catch (e) {
      // Fallback: just parse as YAML without validation
      // This allows the CLI to work even if @saaskit/schema is not built
      const yaml = await import('yaml')
      const schema = yaml.parse(content)
      if (!schema || typeof schema !== 'object') {
        return { success: false, error: 'Invalid schema: not a valid YAML object' }
      }
      return { success: true, schema }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, error: `Failed to load schema: ${message}` }
  }
}

// ============================================================================
// Help Text
// ============================================================================

const HELP_TEXT = `
SaaSKit CLI - Headless SaaS for AI Agents

Usage:
  saaskit [command] [options]

Commands:
  dev             Start TUI mode (default)
  serve           Start API server
  mcp             Start MCP server
  <resource> <action>  Run resource commands

Options:
  -h, --help          Show this help message
  -v, --version       Show version number
  --schema <path>     Path to schema.yaml file
  --verbose           Enable verbose output
  --quiet, -q         Suppress output
  --no-color          Disable colored output

Examples:
  saaskit                     # Start TUI mode
  saaskit serve --port 3000   # Start API server on port 3000
  saaskit mcp                 # Start MCP server
  saaskit task list           # List all tasks
  saaskit user show abc123    # Show user with id abc123

For more information, visit: https://github.com/saas-studio/saaskit
`.trim()

const DEV_HELP_TEXT = `
SaaSKit dev - Start TUI Mode

Usage:
  saaskit dev [options]

Options:
  -h, --help          Show this help message
  --schema <path>     Path to schema.yaml file

Description:
  Starts the interactive TUI (Terminal User Interface) mode for managing
  your SaaS application. This is the default command when no subcommand
  is provided.
`.trim()

const SERVE_HELP_TEXT = `
SaaSKit serve - Start API Server

Usage:
  saaskit serve [options]

Options:
  -h, --help          Show this help message
  --port <number>     Port to listen on (default: 3000)
  --host <string>     Host to bind to (default: localhost)
  --schema <path>     Path to schema.yaml file

Description:
  Starts the REST API server for your SaaS application.
`.trim()

const MCP_HELP_TEXT = `
SaaSKit mcp - Start MCP Server

Usage:
  saaskit mcp [options]

Options:
  -h, --help          Show this help message
  --schema <path>     Path to schema.yaml file

Description:
  Starts the MCP (Model Context Protocol) server for AI agent integration.
`.trim()

function getHelpText(command: string): string {
  switch (command) {
    case 'dev':
      return DEV_HELP_TEXT
    case 'serve':
      return SERVE_HELP_TEXT
    case 'mcp':
      return MCP_HELP_TEXT
    default:
      return HELP_TEXT
  }
}

// ============================================================================
// Main CLI Function
// ============================================================================

/**
 * Main CLI entry point
 */
export async function cli(args: string[], options: CLIOptions = {}): Promise<CLIResult> {
  const cwd = options.cwd || process.cwd()
  let stdout = ''
  let stderr = ''

  try {
    const parsed = parseCliArgs(args)

    // Handle unknown flags (before --help to show error)
    if (parsed.unknownFlags.length > 0 && !parsed.help) {
      stderr = `Error: Unknown flag: ${parsed.unknownFlags[0]}\n`
      return { exitCode: 1, stdout, stderr }
    }

    // Handle --version
    if (parsed.version) {
      stdout = `saaskit v${VERSION}\n`
      return { exitCode: 0, stdout, stderr }
    }

    // Handle --help
    if (parsed.help) {
      // Check if help is requested for a specific command
      if (parsed.command !== 'dev' || args.includes('dev')) {
        stdout = getHelpText(parsed.command) + '\n'
      } else {
        stdout = HELP_TEXT + '\n'
      }
      return { exitCode: 0, stdout, stderr }
    }

    // Handle --schema validation
    if (parsed.schemaPath) {
      const schemaPath = resolve(cwd, parsed.schemaPath)
      const result = await loadSchema(schemaPath)
      if (!result.success) {
        stderr = `Error: ${result.error}\n`
        return { exitCode: 1, stdout, stderr }
      }
    }

    // Auto-detect schema if not specified
    const detectedSchema = findSchemaFile(cwd)

    // Execute command
    switch (parsed.command) {
      case 'dev': {
        // TUI mode - placeholder for now
        if (!parsed.quiet) {
          stdout = 'Starting TUI mode...\n'
          if (detectedSchema) {
            stdout += `Using schema: ${detectedSchema}\n`
          } else {
            stdout += 'No schema.yaml found in current directory.\n'
          }
          stdout += 'TUI mode is not yet implemented.\n'
        }
        return { exitCode: 0, stdout, stderr }
      }

      case 'serve': {
        // API server - placeholder for now
        const port = parsed.flags.port || '3000'
        if (!parsed.quiet) {
          stdout = `Starting API server on port ${port}...\n`
          if (detectedSchema) {
            stdout += `Using schema: ${detectedSchema}\n`
          }
          stdout += 'API server is not yet implemented.\n'
        }
        return { exitCode: 0, stdout, stderr }
      }

      case 'mcp': {
        // MCP server - placeholder for now
        if (!parsed.quiet) {
          stdout = 'Starting MCP server...\n'
          if (detectedSchema) {
            stdout += `Using schema: ${detectedSchema}\n`
          }
          stdout += 'MCP server is not yet implemented.\n'
        }
        return { exitCode: 0, stdout, stderr }
      }

      case 'resource': {
        // Resource commands - placeholder for now
        if (!parsed.resource) {
          stderr = 'Error: Unknown command\n'
          return { exitCode: 1, stdout, stderr }
        }

        if (!parsed.action) {
          stderr = `Error: Missing action for resource "${parsed.resource}"\n`
          stderr += 'Available actions: list, show, create, update, delete\n'
          return { exitCode: 1, stdout, stderr }
        }

        if (!parsed.quiet) {
          stdout = `Running: ${parsed.resource} ${parsed.action}`
          if (parsed.args.length > 0) {
            stdout += ` ${parsed.args.join(' ')}`
          }
          stdout += '\n'
          stdout += 'Resource commands are not yet implemented.\n'
        }
        return { exitCode: 0, stdout, stderr }
      }

      default: {
        stderr = 'Error: Unknown command\n'
        return { exitCode: 1, stdout, stderr }
      }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    stderr = `Error: ${message}\n`
    return { exitCode: 1, stdout, stderr }
  }
}

// ============================================================================
// CLI Runner (for direct execution)
// ============================================================================

/**
 * Run CLI and write output to stdout/stderr
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const result = await cli(args)

  if (result.stdout) {
    process.stdout.write(result.stdout)
  }
  if (result.stderr) {
    process.stderr.write(result.stderr)
  }

  process.exit(result.exitCode)
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('/cli/index.ts') || process.argv[1]?.endsWith('/cli/index.js')) {
  main().catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
}
