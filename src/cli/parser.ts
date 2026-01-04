/**
 * CLI Parser for SaaSkit
 *
 * Parses command-line arguments into structured commands for resource operations.
 *
 * @example
 * ```ts
 * const result = parseArgs(['task', 'list', '--format', 'json'])
 * console.log(result.resource)   // 'task'
 * console.log(result.operation)  // 'list'
 * console.log(result.format)     // 'json'
 * ```
 */

// Output format types
export type OutputFormat =
  | 'unicode'
  | 'ascii'
  | 'plain'
  | 'json'
  | 'markdown'
  | 'csv'
  | 'yaml'

// Operation types
export type Operation =
  | 'list'
  | 'get'
  | 'create'
  | 'update'
  | 'delete'
  | 'search'

// Global flags configuration
export interface GlobalFlags {
  help?: boolean
  version?: boolean
  verbose?: boolean
  quiet?: boolean
  color?: boolean
}

// Resource schema for validation
export interface FlagSchema {
  type: 'string' | 'boolean' | 'number' | 'array' | 'json'
  alias?: string
  required?: boolean
  default?: unknown
}

export interface ResourceSchema {
  name: string
  operations: Operation[]
  flags: Record<string, FlagSchema>
}

// Parsed command result
export interface ParsedCommand {
  resource?: string
  operation: string
  id?: string
  flags: Record<string, unknown>
  positional: string[]
  format?: OutputFormat
  globalFlags: GlobalFlags
}

// Error types for parse failures
export type ParseErrorCode =
  | 'UNKNOWN_COMMAND'
  | 'MISSING_REQUIRED_FLAG'
  | 'INVALID_FLAG_VALUE'
  | 'UNKNOWN_FLAG'
  | 'MISSING_FLAG_VALUE'
  | 'INVALID_FORMAT'

export interface ParseError extends Error {
  code: ParseErrorCode
  flag?: string
  value?: string
  suggestions?: string[]
}

/**
 * Parse command-line arguments into a structured command.
 *
 * @param args - Array of command-line arguments (excluding node/script path)
 * @param schema - Optional resource schema for validation
 * @returns ParsedCommand with parsed arguments
 * @throws ParseError if parsing fails
 */
export function parseArgs(args: string[], schema?: ResourceSchema): ParsedCommand {
  // TODO: Implement CLI parser
  // This is a stub that will cause all tests to fail (RED phase of TDD)
  throw new Error('Not implemented')
}

/**
 * Create a ParseError with the given code and message.
 */
export function createParseError(
  code: ParseErrorCode,
  message: string,
  options?: { flag?: string; value?: string; suggestions?: string[] }
): ParseError {
  const error = new Error(message) as ParseError
  error.code = code
  if (options?.flag) error.flag = options.flag
  if (options?.value) error.value = options.value
  if (options?.suggestions) error.suggestions = options.suggestions
  return error
}
