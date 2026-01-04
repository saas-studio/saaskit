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

// Operation aliases mapping
const OPERATION_ALIASES: Record<string, Operation> = {
  show: 'get',
  new: 'create',
  rm: 'delete',
  ls: 'list',
  find: 'search',
}

// Valid operations - standard CRUD + common CLI operations
const VALID_OPERATIONS = new Set([
  'list', 'get', 'create', 'update', 'delete', 'search',  // Standard CRUD
  'set', 'exec', 'run', 'push', 'pull', 'sync', 'init', 'deploy', 'build', 'test',  // Common CLI ops
  'start', 'stop', 'restart', 'status', 'logs', 'config', 'info', 'version', 'help'
])

// Valid output formats
const VALID_FORMATS = new Set(['unicode', 'ascii', 'plain', 'json', 'markdown', 'csv', 'yaml'])

// Format shortcut flags
const FORMAT_SHORTCUTS: Record<string, OutputFormat> = {
  json: 'json',
  yaml: 'yaml',
  csv: 'csv',
  markdown: 'markdown',
  md: 'markdown',
}

// Operations that take an ID as the first positional arg
const OPERATIONS_WITH_ID = new Set(['get', 'update', 'delete'])

/**
 * Parse command-line arguments into a structured command.
 *
 * @param args - Array of command-line arguments (excluding node/script path)
 * @param schema - Optional resource schema for validation
 * @returns ParsedCommand with parsed arguments
 * @throws ParseError if parsing fails
 */
export function parseArgs(args: string[], schema?: ResourceSchema): ParsedCommand {
  const result: ParsedCommand = {
    resource: undefined,
    operation: '',
    id: undefined,
    flags: {},
    positional: [],
    format: undefined,
    globalFlags: {},
  }

  // Build alias map from schema
  const aliasMap: Record<string, string> = {}
  if (schema) {
    for (const [flagName, flagSchema] of Object.entries(schema.flags)) {
      if (flagSchema.alias) {
        aliasMap[flagSchema.alias] = flagName
      }
    }
  }

  let i = 0
  let stopFlagParsing = false
  let resourceIndex = -1
  let operationIndex = -1

  // First pass: identify global flags and find resource/operation positions
  // We need to find the first non-flag, non-global-flag argument for resource
  const tempArgs: { index: number; value: string; isFlag: boolean; isGlobalFlag: boolean }[] = []

  for (let j = 0; j < args.length; j++) {
    const arg = args[j]
    if (arg === '--') {
      tempArgs.push({ index: j, value: arg, isFlag: false, isGlobalFlag: false })
    } else if (arg.startsWith('--') || arg.startsWith('-')) {
      const isGlobal = isGlobalFlagArg(arg)
      tempArgs.push({ index: j, value: arg, isFlag: true, isGlobalFlag: isGlobal })
    } else {
      tempArgs.push({ index: j, value: arg, isFlag: false, isGlobalFlag: false })
    }
  }

  // Find resource and operation positions (first two non-flag, non-global-flag args)
  let nonFlagCount = 0
  for (const item of tempArgs) {
    if (!item.isFlag && item.value !== '--') {
      if (nonFlagCount === 0) {
        resourceIndex = item.index
      } else if (nonFlagCount === 1) {
        operationIndex = item.index
      }
      nonFlagCount++
      if (nonFlagCount >= 2) break
    }
  }

  // Process arguments
  while (i < args.length) {
    const arg = args[i]

    // Handle double-dash stop flag parsing
    if (arg === '--' && !stopFlagParsing) {
      stopFlagParsing = true
      i++
      continue
    }

    // After --, everything is positional
    if (stopFlagParsing) {
      result.positional.push(arg)
      i++
      continue
    }

    // Handle long flags
    if (arg.startsWith('--')) {
      i = handleLongFlag(args, i, arg, result, schema, aliasMap, resourceIndex)
      continue
    }

    // Handle short flags
    if (arg.startsWith('-') && arg.length > 1) {
      i = handleShortFlag(args, i, arg, result, schema, aliasMap, resourceIndex)
      continue
    }

    // Handle resource (first non-flag arg)
    if (result.resource === undefined && !result.globalFlags.help && !result.globalFlags.version) {
      result.resource = arg
      i++
      continue
    }

    // Handle operation (second non-flag arg after resource)
    if (result.resource !== undefined && result.operation === '') {
      const normalizedOp = normalizeOperation(arg)
      if (normalizedOp) {
        result.operation = normalizedOp
      } else if (VALID_OPERATIONS.has(arg)) {
        // Accept known operations
        result.operation = arg
      } else {
        // Unknown operation - throw error
        throw createParseError(
          'UNKNOWN_COMMAND',
          `Unknown command: ${arg}`,
          { value: arg }
        )
      }
      i++
      continue
    }

    // Handle ID for get/update/delete (first positional after operation)
    if (OPERATIONS_WITH_ID.has(result.operation) && result.id === undefined) {
      result.id = arg
      result.positional.push(arg)
      i++
      continue
    }

    // Everything else is positional
    result.positional.push(arg)
    i++
  }

  // If we only have global flags (help/version) and no resource, operation should be empty
  if (result.resource === undefined) {
    result.operation = ''
  }

  // If we have resource but no operation and --help was set, set operation to empty
  if (result.resource !== undefined && result.operation === '' && result.globalFlags.help) {
    result.operation = ''
  }

  // Apply schema defaults and validation
  if (schema) {
    applySchemaDefaults(result, schema)
    validateWithSchema(result, schema)
  }

  return result
}

function isGlobalFlagArg(arg: string): boolean {
  const globalFlags = ['--help', '-h', '--version', '-v', '-V', '--verbose', '--quiet', '-q', '--silent', '--color', '--no-color']
  if (globalFlags.includes(arg)) return true
  if (arg.startsWith('--color=')) return true
  return false
}

function normalizeOperation(op: string): Operation | null {
  if (VALID_OPERATIONS.has(op)) {
    return op as Operation
  }
  if (op in OPERATION_ALIASES) {
    return OPERATION_ALIASES[op]
  }
  return null
}

function handleLongFlag(
  args: string[],
  i: number,
  arg: string,
  result: ParsedCommand,
  schema: ResourceSchema | undefined,
  aliasMap: Record<string, string>,
  resourceIndex: number
): number {
  // Remove leading --
  let flagPart = arg.slice(2)
  let value: string | undefined

  // Handle --flag=value syntax
  const equalsIndex = flagPart.indexOf('=')
  if (equalsIndex !== -1) {
    value = flagPart.slice(equalsIndex + 1)
    flagPart = flagPart.slice(0, equalsIndex)
  }

  // Handle --no-prefix for boolean negation
  const isNegated = flagPart.startsWith('no-')
  const baseFlagName = isNegated ? flagPart.slice(3) : flagPart

  // Handle global flags
  if (handleGlobalLongFlag(flagPart, value, result, i, resourceIndex, args)) {
    return i + 1
  }

  // Handle format shortcuts
  if (flagPart in FORMAT_SHORTCUTS) {
    result.format = FORMAT_SHORTCUTS[flagPart]
    return i + 1
  }

  // Handle --format and --output
  if (flagPart === 'format' || flagPart === 'output') {
    if (value === undefined) {
      if (i + 1 >= args.length || args[i + 1].startsWith('-')) {
        throw createParseError('MISSING_FLAG_VALUE', `Flag --${flagPart} requires a value`, { flag: flagPart })
      }
      value = args[i + 1]
      i++
    }
    if (!VALID_FORMATS.has(value)) {
      throw createParseError('INVALID_FORMAT', `Invalid format: ${value}`, {
        value,
        suggestions: Array.from(VALID_FORMATS) as string[],
      })
    }
    result.format = value as OutputFormat
    // Also set in flags
    result.flags.format = value
    return i + 1
  }

  // Check for unknown flags with schema
  if (schema && !isKnownFlag(baseFlagName, schema, aliasMap) && !isNegated) {
    const suggestions = getSuggestions(baseFlagName, schema)
    throw createParseError('UNKNOWN_FLAG', `Unknown flag: --${flagPart}`, {
      flag: flagPart,
      suggestions,
    })
  }

  // If negated, set to false
  if (isNegated) {
    setFlagValue(result, baseFlagName, false, schema, aliasMap)
    return i + 1
  }

  // Get value if not already set
  if (value === undefined) {
    // Check if next arg exists
    if (i + 1 < args.length) {
      const nextArg = args[i + 1]
      // Accept the next arg as a value if:
      // 1. It doesn't start with - (not a flag)
      // 2. It's a negative number like -50
      // 3. It's a single dash (stdin indicator)
      if (!nextArg.startsWith('-') ||
          /^-\d+(\.\d+)?$/.test(nextArg) ||
          nextArg === '-') {
        value = nextArg
        i++
      }
    }
  }

  // If no value, might be a boolean flag
  if (value === undefined) {
    // If this is the last flag or schema says it's boolean, treat as boolean true
    const schemaType = getSchemaType(flagPart, schema, aliasMap)
    if (schemaType === 'boolean') {
      setFlagValue(result, flagPart, true, schema, aliasMap)
      return i + 1
    }
    // If schema specifies a type other than boolean, error
    if (schemaType) {
      throw createParseError('MISSING_FLAG_VALUE', `Flag --${flagPart} requires a value`, { flag: flagPart })
    }
    // Without schema, check if this is a "known" non-boolean flag by name
    // Common non-boolean flags that need values: title, name, description, etc.
    const nonBooleanFlags = ['title', 'name', 'description', 'path', 'file', 'input', 'output', 'data']
    if (nonBooleanFlags.includes(flagPart)) {
      throw createParseError('MISSING_FLAG_VALUE', `Flag --${flagPart} requires a value`, { flag: flagPart })
    }
    // Otherwise, treat as boolean true
    setFlagValue(result, flagPart, true, schema, aliasMap)
    return i + 1
  }

  // Parse and set the value
  const parsedValue = parseValue(value, flagPart, schema, aliasMap)
  setFlagValue(result, flagPart, parsedValue, schema, aliasMap)
  return i + 1
}

function handleGlobalLongFlag(
  flagName: string,
  value: string | undefined,
  result: ParsedCommand,
  i: number,
  resourceIndex: number,
  args: string[]
): boolean {
  if (flagName === 'help') {
    result.globalFlags.help = true
    return true
  }
  if (flagName === 'version') {
    result.globalFlags.version = true
    return true
  }
  if (flagName === 'verbose') {
    result.globalFlags.verbose = true
    return true
  }
  if (flagName === 'quiet' || flagName === 'silent') {
    result.globalFlags.quiet = true
    return true
  }
  if (flagName === 'color') {
    if (value !== undefined) {
      result.globalFlags.color = parseBooleanValue(value)
    } else {
      result.globalFlags.color = true
    }
    return true
  }
  if (flagName === 'no-color') {
    result.globalFlags.color = false
    return true
  }
  return false
}

function handleShortFlag(
  args: string[],
  i: number,
  arg: string,
  result: ParsedCommand,
  schema: ResourceSchema | undefined,
  aliasMap: Record<string, string>,
  resourceIndex: number
): number {
  // Remove leading -
  let flagPart = arg.slice(1)
  let value: string | undefined

  // Handle -f=value syntax
  const equalsIndex = flagPart.indexOf('=')
  if (equalsIndex !== -1) {
    value = flagPart.slice(equalsIndex + 1)
    flagPart = flagPart.slice(0, equalsIndex)
  }

  // Handle combined short flags (e.g., -vq)
  if (flagPart.length > 1 && value === undefined) {
    // All but the last are boolean flags
    for (let j = 0; j < flagPart.length - 1; j++) {
      const shortFlag = flagPart[j]
      handleSingleShortFlag(shortFlag, true, result, schema, aliasMap, i, resourceIndex, args)
    }
    // Last one might have a value
    const lastFlag = flagPart[flagPart.length - 1]
    if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
      value = args[i + 1]
      i++
    }
    // For combined flags, keep the value as-is (don't auto-parse numbers)
    handleSingleShortFlag(lastFlag, value, result, schema, aliasMap, i, resourceIndex, args, true)
    return i + 1
  }

  // Single short flag
  if (value === undefined && i + 1 < args.length && !args[i + 1].startsWith('-')) {
    value = args[i + 1]
    i++
  }
  handleSingleShortFlag(flagPart, value, result, schema, aliasMap, i, resourceIndex, args)
  return i + 1
}

function handleSingleShortFlag(
  flag: string,
  value: string | boolean | undefined,
  result: ParsedCommand,
  schema: ResourceSchema | undefined,
  aliasMap: Record<string, string>,
  i: number,
  resourceIndex: number,
  args: string[],
  keepValueAsString: boolean = false
): void {
  // Handle global short flags
  if (flag === 'h') {
    result.globalFlags.help = true
    return
  }
  if (flag === 'v' || flag === 'V') {
    // -v means version when no resource, verbose when with resource
    if (resourceIndex === -1 || (result.resource === undefined && result.operation === '')) {
      result.globalFlags.version = true
    } else {
      result.globalFlags.verbose = true
      // Also set in flags for combined flags like -vq
      result.flags.v = true
    }
    return
  }
  if (flag === 'q') {
    result.globalFlags.quiet = true
    // Also set in flags for combined flags
    result.flags.q = true
    return
  }
  if (flag === 'o') {
    // -o is format/output
    if (value !== undefined && typeof value === 'string') {
      if (!VALID_FORMATS.has(value)) {
        throw createParseError('INVALID_FORMAT', `Invalid format: ${value}`, {
          value,
          suggestions: Array.from(VALID_FORMATS) as string[],
        })
      }
      result.format = value as OutputFormat
    }
    return
  }

  // Resolve alias to full flag name
  const fullFlagName = aliasMap[flag] || flag

  // Parse value
  let parsedValue: unknown
  if (value === undefined) {
    parsedValue = true // Boolean flag
  } else if (typeof value === 'boolean') {
    parsedValue = value
  } else if (keepValueAsString) {
    // For combined flags, keep the value as-is
    parsedValue = value
  } else {
    parsedValue = parseValue(value, fullFlagName, schema, aliasMap)
  }

  setFlagValue(result, fullFlagName, parsedValue, schema, aliasMap)
}

function parseValue(
  value: string,
  flagName: string,
  schema: ResourceSchema | undefined,
  aliasMap: Record<string, string>
): unknown {
  const schemaType = getSchemaType(flagName, schema, aliasMap)

  // If schema specifies a type, use that
  if (schemaType) {
    return coerceValue(value, schemaType, flagName)
  }

  // Auto-detect type without schema
  return autoParseValue(value, flagName)
}

function autoParseValue(value: string, flagName: string): unknown {
  // Flag names that should parse 1/0 as booleans (not numbers)
  const booleanFlags = ['active', 'enabled', 'disabled', 'done', 'confirm', 'confirmed', 'visible', 'hidden']

  // Check for explicit boolean strings (true/false, yes/no)
  if (value === 'true' || value === 'yes') {
    return true
  }
  if (value === 'false' || value === 'no') {
    return false
  }

  // Check for 1/0 - only parse as boolean for boolean-ish flag names
  if (booleanFlags.includes(flagName)) {
    if (value === '1') return true
    if (value === '0') return false
  }

  // Check for JSON objects and arrays for specific flag names
  // data, items, settings, config should auto-parse JSON
  // but 'raw' and other flags should keep as string
  const jsonAutoParseFlags = ['data', 'items', 'settings', 'config', 'json', 'body', 'payload']
  if (jsonAutoParseFlags.includes(flagName) ||
      (flagName.endsWith('s') && !['tags', 'raw'].includes(flagName))) {
    if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
      try {
        return JSON.parse(value)
      } catch {
        // If JSON parse fails, continue with other parsing
      }
    }
  }

  // Check for numbers (but not things like tag1,tag2)
  // Only parse as positive number or for specific flag names
  // Keep negative numbers as strings for flags like 'offset' unless it's clearly a number flag
  const numberFlags = ['priority', 'count', 'limit', 'price', 'balance', 'amount', 'total', 'quantity', 'size', 'width', 'height']
  if (!value.includes(',') && /^-?\d+(\.\d+)?$/.test(value)) {
    // For negative numbers, only parse if it's a known number flag
    if (value.startsWith('-')) {
      if (numberFlags.includes(flagName)) {
        return parseFloat(value)
      }
      // Keep negative values as strings for other flags
      return value
    }
    // Positive numbers are always parsed
    return parseFloat(value)
  }

  // Check for comma-separated arrays (for specific flags like "tags")
  if (flagName === 'tags' || (flagName.endsWith('s') && value.includes(','))) {
    return value.split(',').map(s => s.trim()).filter(s => s !== '')
  }

  // Check for empty string (for tags)
  if (flagName === 'tags' && value === '') {
    return []
  }

  // Keep as string
  return value
}

function coerceValue(value: string, type: string, flagName: string): unknown {
  switch (type) {
    case 'boolean':
      return parseBooleanValue(value)
    case 'number': {
      const num = parseFloat(value)
      if (isNaN(num)) {
        throw createParseError('INVALID_FLAG_VALUE', `Invalid number value for --${flagName}: ${value}`, {
          flag: flagName,
          value,
        })
      }
      return num
    }
    case 'array':
      if (value === '') return []
      return value.split(',').map(s => s.trim())
    case 'json':
      try {
        return JSON.parse(value)
      } catch {
        throw createParseError('INVALID_FLAG_VALUE', `Invalid JSON value for --${flagName}: ${value}`, {
          flag: flagName,
          value,
        })
      }
    case 'string':
    default:
      return value
  }
}

function parseBooleanValue(value: string): boolean {
  const v = value.toLowerCase()
  if (v === 'true' || v === 'yes' || v === '1') return true
  if (v === 'false' || v === 'no' || v === '0') return false
  return true // Default to true if not recognized
}

function getSchemaType(flagName: string, schema: ResourceSchema | undefined, aliasMap: Record<string, string>): string | undefined {
  if (!schema) return undefined

  // Check direct flag name
  if (schema.flags[flagName]) {
    return schema.flags[flagName].type
  }

  // Check if it's an alias
  const fullName = aliasMap[flagName]
  if (fullName && schema.flags[fullName]) {
    return schema.flags[fullName].type
  }

  return undefined
}

function isKnownFlag(flagName: string, schema: ResourceSchema, aliasMap: Record<string, string>): boolean {
  // Check direct flag name
  if (schema.flags[flagName]) return true

  // Check if it's a known alias
  if (aliasMap[flagName]) return true

  // Check all aliases
  for (const flagSchema of Object.values(schema.flags)) {
    if (flagSchema.alias === flagName) return true
  }

  return false
}

function setFlagValue(
  result: ParsedCommand,
  flagName: string,
  value: unknown,
  schema: ResourceSchema | undefined,
  aliasMap: Record<string, string>
): void {
  // Resolve alias to full name
  const fullName = aliasMap[flagName] || flagName

  // Handle repeated flags as arrays
  if (result.flags[fullName] !== undefined) {
    const existing = result.flags[fullName]
    if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      result.flags[fullName] = [existing, value]
    }
  } else {
    result.flags[fullName] = value
  }
}

function getSuggestions(flagName: string, schema: ResourceSchema): string[] {
  const suggestions: string[] = []
  const flags = Object.keys(schema.flags)

  for (const known of flags) {
    if (levenshteinDistance(flagName, known) <= 2) {
      suggestions.push(known)
    }
  }

  return suggestions
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

function applySchemaDefaults(result: ParsedCommand, schema: ResourceSchema): void {
  for (const [flagName, flagSchema] of Object.entries(schema.flags)) {
    if (flagSchema.default !== undefined && result.flags[flagName] === undefined) {
      result.flags[flagName] = flagSchema.default
    }
  }
}

function validateWithSchema(result: ParsedCommand, schema: ResourceSchema): void {
  // Check for required flags
  for (const [flagName, flagSchema] of Object.entries(schema.flags)) {
    if (flagSchema.required && result.flags[flagName] === undefined) {
      throw createParseError('MISSING_REQUIRED_FLAG', `Missing required flag: --${flagName}`, {
        flag: flagName,
      })
    }
  }
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
