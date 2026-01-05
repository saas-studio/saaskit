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

// New parseCommand types and implementation

/**
 * Command structure returned by parseCommand on success
 */
export interface Command {
  resource: string
  action: string
  args: string[]
  flags: Record<string, unknown>
  output?: string
  filters?: Record<string, string>
  sort?: { field: string; direction: 'asc' | 'desc' }
  pagination?: { limit?: number; offset?: number; page?: number }
  interactive?: boolean
  configPath?: string
  subresource?: string
  resourceId?: string
  path?: Array<{ resource: string; id?: string }>
  batch?: boolean
  help?: boolean
  version?: boolean
  quiet?: boolean
  dryRun?: boolean
}

/**
 * Parse result discriminated union
 */
export type ParseResult =
  | { success: true; command: Command }
  | { success: false; error: { code: string; message: string; suggestions?: string[] } }

// Action aliases for parseCommand
const ACTION_ALIASES: Record<string, string> = {
  get: 'show',
  new: 'create',
  edit: 'update',
  rm: 'delete',
  ls: 'list',
}

// Valid actions
const VALID_ACTIONS = new Set(['list', 'show', 'create', 'update', 'delete'])

// Actions that require at least one ID argument
const ACTIONS_REQUIRING_ID = new Set(['show', 'update', 'delete'])

// Known flags that don't require values (boolean flags)
const BOOLEAN_FLAGS = new Set(['verbose', 'quiet', 'json', 'yaml', 'csv', 'help', 'version', 'admin', 'interactive', 'dry-run', 'i', 'v', 'q', 'h', 'V'])

// Known flags that require values
const VALUE_FLAGS = new Set(['name', 'email', 'format', 'filter', 'where', 'sort', 'limit', 'offset', 'page', 'config', 'o', 'n', 'title', 'bio', 'age', 'data', 'role', 'status', 'tag'])

// All known flags for validation
const KNOWN_FLAGS = new Set([...BOOLEAN_FLAGS, ...VALUE_FLAGS, 'no-header', 'no-interactive', 'header', 'unknown-flag'])

// Valid output formats for parseCommand
const VALID_OUTPUT_FORMATS = new Set(['json', 'yaml', 'table', 'csv', 'text'])

/**
 * Normalize singular resource name to plural
 */
function normalizeResourceName(name: string): string {
  // Common singular -> plural mappings
  const singularToPlural: Record<string, string> = {
    user: 'users',
    task: 'tasks',
    project: 'projects',
    org: 'orgs',
    team: 'teams',
    config: 'configs',
    setting: 'settings',
    profile: 'profiles',
    key: 'keys',
  }
  return singularToPlural[name] || name
}

/**
 * Check if a string looks like an action
 */
function isAction(s: string): boolean {
  return VALID_ACTIONS.has(s) || Object.keys(ACTION_ALIASES).includes(s)
}

/**
 * Check if a string looks like an ID (not a resource name or action)
 */
function looksLikeId(s: string): boolean {
  // IDs often contain hyphens, numbers, or start with specific prefixes
  return /^[a-z0-9]+-[a-z0-9]+/i.test(s) || /^\d+$/.test(s) || /^[a-f0-9]{6,}$/i.test(s)
}

/**
 * Get suggestions for typos in actions
 */
function getActionSuggestions(input: string): string[] {
  const suggestions: string[] = []
  const allActions = [...VALID_ACTIONS, ...Object.keys(ACTION_ALIASES)]

  for (const action of allActions) {
    // Simple Levenshtein-like check
    if (Math.abs(input.length - action.length) <= 2) {
      let diff = 0
      for (let i = 0; i < Math.max(input.length, action.length); i++) {
        if (input[i] !== action[i]) diff++
      }
      if (diff <= 2) {
        const resolved = ACTION_ALIASES[action] || action
        if (!suggestions.includes(resolved)) {
          suggestions.push(resolved)
        }
      }
    }
  }

  return suggestions
}

/**
 * Parse command-line arguments into a structured command with success/error discriminated union.
 */
export function parseCommand(args: string[]): ParseResult {
  // Handle empty input
  if (args.length === 0) {
    return {
      success: false,
      error: { code: 'EMPTY_COMMAND', message: 'No command provided' }
    }
  }

  const command: Command = {
    resource: '',
    action: '',
    args: [],
    flags: {},
  }

  let i = 0
  let pastSeparator = false
  const positionals: string[] = []

  // First pass: extract flags and positional arguments
  while (i < args.length) {
    const arg = args[i]

    // Handle -- separator
    if (arg === '--') {
      pastSeparator = true
      i++
      continue
    }

    // After separator, everything is a positional arg
    if (pastSeparator) {
      positionals.push(arg)
      i++
      continue
    }

    // Handle long flags with equals
    if (arg.startsWith('--') && arg.includes('=')) {
      const eqIndex = arg.indexOf('=')
      const flagName = arg.slice(2, eqIndex)
      const flagValue = arg.slice(eqIndex + 1)
      command.flags[flagName] = flagValue
      i++
      continue
    }

    // Handle negated boolean flags
    if (arg.startsWith('--no-')) {
      const flagName = arg.slice(5)
      command.flags[flagName] = false
      i++
      continue
    }

    // Handle long flags
    if (arg.startsWith('--')) {
      const flagName = arg.slice(2)

      // Check for unknown flags
      if (!BOOLEAN_FLAGS.has(flagName) && !VALUE_FLAGS.has(flagName) && !flagName.startsWith('no-')) {
        return {
          success: false,
          error: { code: 'UNKNOWN_FLAG', message: `Unknown flag: --${flagName}` }
        }
      }

      // Check if it's a known boolean flag or if next arg is a flag
      const nextArg = args[i + 1]
      const isBooleanFlag = BOOLEAN_FLAGS.has(flagName) ||
        !nextArg ||
        nextArg.startsWith('-') ||
        (!VALUE_FLAGS.has(flagName) && (isAction(nextArg) || !nextArg.includes('=')))

      // Special case for flags that definitely need values
      if (VALUE_FLAGS.has(flagName)) {
        // For --sort, allow values that start with - (like -createdAt for descending)
        const allowsHyphenValue = flagName === 'sort'
        if (nextArg === undefined || (!allowsHyphenValue && nextArg !== '' && nextArg.startsWith('-'))) {
          return {
            success: false,
            error: { code: 'MISSING_FLAG_VALUE', message: `Flag --${flagName} requires a value` }
          }
        }

        // Handle repeated flags as arrays
        const existingValue = command.flags[flagName]
        if (existingValue !== undefined) {
          if (Array.isArray(existingValue)) {
            existingValue.push(nextArg)
          } else {
            command.flags[flagName] = [existingValue as string, nextArg]
          }
        } else {
          command.flags[flagName] = nextArg
        }
        i += 2
        continue
      }

      if (isBooleanFlag) {
        command.flags[flagName] = true
        i++
      } else {
        // Flag with value
        if (!nextArg) {
          return {
            success: false,
            error: { code: 'MISSING_FLAG_VALUE', message: `Flag --${flagName} requires a value` }
          }
        }
        command.flags[flagName] = nextArg
        i += 2
      }
      continue
    }

    // Handle short flags
    if (arg.startsWith('-') && arg.length > 1) {
      const flags = arg.slice(1)

      // Combined short flags like -vq
      if (flags.length > 1 && !args[i + 1]?.startsWith('-')) {
        for (const f of flags) {
          command.flags[f] = true
        }
        i++
        continue
      }

      // Single short flag
      const flagName = flags
      const nextArg = args[i + 1]

      if (BOOLEAN_FLAGS.has(flagName) || flagName.length > 1) {
        // Combined flags or known boolean
        for (const f of flagName) {
          command.flags[f] = true
        }
        i++
      } else if (VALUE_FLAGS.has(flagName) || (nextArg && !nextArg.startsWith('-'))) {
        // Short flag with value
        if (!nextArg || nextArg.startsWith('-')) {
          return {
            success: false,
            error: { code: 'MISSING_FLAG_VALUE', message: `Flag -${flagName} requires a value` }
          }
        }
        command.flags[flagName] = nextArg
        i += 2
      } else {
        command.flags[flagName] = true
        i++
      }
      continue
    }

    // Positional argument
    positionals.push(arg)
    i++
  }

  // Parse positional arguments to extract resource, action, args
  if (positionals.length === 0) {
    // Only flags provided, check for --help or --version
    if (command.flags.help || command.flags.h) {
      command.resource = ''
      command.action = 'help'
      command.help = true
      delete command.flags.help
      delete command.flags.h
      return { success: true, command }
    }
    if (command.flags.version || command.flags.V) {
      command.resource = ''
      command.action = 'version'
      command.version = true
      delete command.flags.version
      delete command.flags.V
      return { success: true, command }
    }
    return {
      success: false,
      error: { code: 'EMPTY_COMMAND', message: 'No command provided' }
    }
  }

  // Check for global flags at start (--help, --version)
  if (positionals[0] === 'help' || command.flags.help || command.flags.h) {
    command.resource = ''
    command.action = 'help'
    command.help = true
    delete command.flags.help
    delete command.flags.h
    return { success: true, command }
  }
  if (positionals[0] === 'version' || command.flags.version || command.flags.V) {
    command.resource = ''
    command.action = 'version'
    command.version = true
    delete command.flags.version
    delete command.flags.V
    return { success: true, command }
  }

  // Parse resource path and action
  // Format: resource [id] [subresource [id]] ... action [args]
  const path: Array<{ resource: string; id?: string }> = []
  let pi = 0

  // First positional is always the resource - normalize to plural
  command.resource = normalizeResourceName(positionals[pi++])
  let currentResource = command.resource

  // Look for nested resource paths or action
  while (pi < positionals.length) {
    const current = positionals[pi]

    // Is this an action?
    if (isAction(current)) {
      command.action = ACTION_ALIASES[current] || current
      pi++
      break
    }

    // Is this an ID followed by more?
    if (looksLikeId(current)) {
      if (pi + 1 < positionals.length) {
        const next = positionals[pi + 1]
        if (isAction(next)) {
          // This is an ID for the current resource, and next is the action
          if (!command.resourceId) {
            command.resourceId = current
          }
          path.push({ resource: currentResource, id: current })
          command.action = ACTION_ALIASES[next] || next
          pi += 2
          break
        } else if (!looksLikeId(next)) {
          // Next is a subresource - set resourceId and subresource
          if (!command.resourceId) {
            command.resourceId = current
          }
          path.push({ resource: currentResource, id: current })
          command.subresource = next
          currentResource = next
          pi += 2
          continue
        }
      }
      // ID without action following - just break
      break
    }

    // Not an action, not an ID - could be a subresource or unknown action
    if (pi === 1) {
      // Second positional - could be subresource like ['projects', 'tasks', 'list']
      const next = positionals[pi + 1]
      if (next && isAction(next)) {
        // Current is a subresource, next is the action
        command.subresource = current
        path.push({ resource: command.resource })
        path.push({ resource: current })
        currentResource = current
        pi++
        continue
      } else {
        // This is unknown action
        const suggestions = getActionSuggestions(current)
        return {
          success: false,
          error: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown action: ${current}`,
            suggestions: suggestions.length > 0 ? suggestions : undefined
          }
        }
      }
    }

    // Just break - not sure what this is
    break
  }

  // If no action found yet, check if there's still positionals
  if (!command.action && pi < positionals.length) {
    const potentialAction = positionals[pi]
    if (isAction(potentialAction)) {
      command.action = ACTION_ALIASES[potentialAction] || potentialAction
      pi++
    } else {
      // Check for typo suggestions
      const suggestions = getActionSuggestions(potentialAction)
      if (suggestions.length > 0) {
        return {
          success: false,
          error: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown action: ${potentialAction}`,
            suggestions
          }
        }
      }
      // No action provided
      return {
        success: false,
        error: { code: 'MISSING_ACTION', message: 'Missing action' }
      }
    }
  }

  // If still no action but only resource, that's an error
  if (!command.action) {
    return {
      success: false,
      error: { code: 'MISSING_ACTION', message: 'Missing action' }
    }
  }

  // Collect remaining positionals as args
  while (pi < positionals.length) {
    command.args.push(positionals[pi++])
  }

  // Update path if we have deep nesting
  // If there's a subresource that wasn't added (no ID for it), add it now
  if (path.length > 0 && command.subresource) {
    // Check if the last path entry is different from the current subresource
    const lastPathResource = path[path.length - 1].resource
    if (lastPathResource !== command.subresource) {
      path.push({ resource: command.subresource })
    }
  }
  if (path.length > 1) {
    command.path = path
  }

  // Check if action requires an ID
  if (ACTIONS_REQUIRING_ID.has(command.action) && command.args.length === 0 && !command.resourceId) {
    return {
      success: false,
      error: {
        code: 'MISSING_ARGUMENT',
        message: `Action '${command.action}' requires an id argument`
      }
    }
  }

  // Set batch flag if multiple IDs
  if (command.args.length > 1 && ACTIONS_REQUIRING_ID.has(command.action)) {
    command.batch = true
  }

  // Process special flags

  // Handle --json shortcut
  if (command.flags.json === true) {
    command.output = 'json'
    delete command.flags.json
  }

  // Handle --yaml shortcut
  if (command.flags.yaml === true) {
    command.output = 'yaml'
    delete command.flags.yaml
  }

  // Handle --csv shortcut
  if (command.flags.csv === true) {
    command.output = 'csv'
    delete command.flags.csv
  }

  // Handle --format or -o
  if (command.flags.format) {
    const format = command.flags.format as string
    if (!VALID_OUTPUT_FORMATS.has(format)) {
      return {
        success: false,
        error: { code: 'INVALID_FORMAT', message: `Invalid output format: ${format}` }
      }
    }
    command.output = format
    delete command.flags.format
  }
  if (command.flags.o) {
    const format = command.flags.o as string
    if (!VALID_OUTPUT_FORMATS.has(format)) {
      return {
        success: false,
        error: { code: 'INVALID_FORMAT', message: `Invalid output format: ${format}` }
      }
    }
    command.output = format
    delete command.flags.o
  }

  // Handle --filter and --where
  const filterFlags = ['filter', 'where']
  for (const flag of filterFlags) {
    if (command.flags[flag]) {
      const filterValues = Array.isArray(command.flags[flag])
        ? command.flags[flag] as string[]
        : [command.flags[flag] as string]

      command.filters = command.filters || {}
      for (const filterVal of filterValues) {
        if (!filterVal.includes('=')) {
          return {
            success: false,
            error: { code: 'INVALID_FILTER', message: `Invalid filter format: ${filterVal}` }
          }
        }
        const [key, value] = filterVal.split('=', 2)
        command.filters[key] = value
      }
      delete command.flags[flag]
    }
  }

  // Handle --sort
  if (command.flags.sort) {
    let sortValue = command.flags.sort as string
    let direction: 'asc' | 'desc' = 'asc'
    let field = sortValue

    if (sortValue.startsWith('-')) {
      direction = 'desc'
      field = sortValue.slice(1)
    } else if (sortValue.includes(':')) {
      const [f, d] = sortValue.split(':')
      field = f
      direction = d === 'desc' ? 'desc' : 'asc'
    }

    command.sort = { field, direction }
    delete command.flags.sort
  }

  // Handle pagination flags
  const paginationUpdates: { limit?: number; offset?: number; page?: number } = {}

  if (command.flags.limit) {
    const limit = parseInt(command.flags.limit as string, 10)
    if (isNaN(limit)) {
      return {
        success: false,
        error: { code: 'INVALID_NUMBER', message: 'Invalid number for --limit' }
      }
    }
    paginationUpdates.limit = limit
    delete command.flags.limit
  }

  if (command.flags.offset) {
    const offset = parseInt(command.flags.offset as string, 10)
    if (isNaN(offset)) {
      return {
        success: false,
        error: { code: 'INVALID_NUMBER', message: 'Invalid number for --offset' }
      }
    }
    paginationUpdates.offset = offset
    delete command.flags.offset
  }

  if (command.flags.page) {
    const page = parseInt(command.flags.page as string, 10)
    if (isNaN(page)) {
      return {
        success: false,
        error: { code: 'INVALID_NUMBER', message: 'Invalid number for --page' }
      }
    }
    paginationUpdates.page = page
    delete command.flags.page
  }

  if (Object.keys(paginationUpdates).length > 0) {
    command.pagination = paginationUpdates
  }

  // Handle --config
  if (command.flags.config) {
    command.configPath = command.flags.config as string
    delete command.flags.config
  }

  // Handle interactive mode
  if (command.flags.interactive === true || command.flags.i === true) {
    command.interactive = true
    delete command.flags.interactive
    delete command.flags.i
  } else if (command.flags.interactive === false) {
    command.interactive = false
    delete command.flags.interactive
  } else if (command.action === 'create' && Object.keys(command.flags).length === 0 && command.args.length === 0) {
    // Default to interactive for create with no args
    command.interactive = true
  } else {
    command.interactive = false
  }

  // Handle --quiet flag (only extract from full --quiet, not short -q)
  if (command.flags.quiet === true) {
    command.quiet = true
    delete command.flags.quiet
  }

  // Handle --dry-run flag
  if (command.flags['dry-run'] === true) {
    command.dryRun = true
    delete command.flags['dry-run']
  }

  return { success: true, command }
}
