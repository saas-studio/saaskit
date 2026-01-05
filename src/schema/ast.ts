/**
 * Schema AST (Abstract Syntax Tree)
 *
 * Unified representation of SaaSkit schemas that can be produced by:
 * - JSX Schema Parser (React elements)
 * - Mermaid ER Parser (entity-relationship diagrams)
 * - Mermaid State Parser (state diagrams)
 * - View Annotation Parser (inline annotations)
 *
 * The AST provides a normalized, serializable representation that can be:
 * - Validated
 * - Transformed
 * - Used for code generation
 * - Serialized to JSON
 *
 * @module schema/ast
 */

import type { ReactElement, ReactNode } from 'react'
import React from 'react'
import type { AppProps } from './App'
import type { ResourceProps } from './Resource'

/**
 * Primitive field types supported by SaaSkit
 */
export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'relation'
  | 'email'
  | 'url'
  | 'phone'
  | 'password'
  | 'textarea'
  | 'json'

/**
 * Field modifier flags
 */
export interface FieldModifiers {
  /** Field is required */
  required?: boolean
  /** Field is optional (explicit, same as !required) */
  optional?: boolean
  /** Field value must be unique across records */
  unique?: boolean
  /** Field is auto-generated (timestamps, IDs) */
  auto?: boolean
  /** Field is the primary key */
  primary?: boolean
  /** Field supports decimal values (for numbers) */
  decimal?: boolean
  /** Field supports multiple values (for selects) */
  multiple?: boolean
  /** Field is readonly */
  readonly?: boolean
  /** Field is hidden from default views */
  hidden?: boolean
}

/**
 * Field AST node
 */
export interface FieldNode {
  kind: 'field'
  name: string
  type: FieldType
  modifiers: FieldModifiers
  /** Default value */
  default?: unknown
  /** Allowed values for select fields */
  values?: string[]
  /** Target resource name for relation fields */
  target?: string
  /** Min value for numbers, min length for text */
  min?: number
  /** Max value for numbers, max length for text */
  max?: number
  /** Step value for number inputs */
  step?: number
  /** Validation pattern (regex) */
  pattern?: string
  /** Placeholder text */
  placeholder?: string
  /** Human-readable label */
  label?: string
  /** Help text/description */
  description?: string
}

/**
 * Resource AST node
 */
export interface ResourceNode {
  kind: 'resource'
  name: string
  /** Plural form of the name (e.g., "Task" -> "Tasks") */
  pluralName: string
  /** URL path for API endpoints */
  path: string
  /** Fields in this resource */
  fields: FieldNode[]
  /** Human-readable display name */
  displayName?: string
  /** Description of the resource */
  description?: string
  /** Icon for UI */
  icon?: string
}

/**
 * Target configuration
 */
export interface TargetConfig {
  cli: boolean
  api: boolean
  sdk: boolean
  mcp: boolean
}

/**
 * App AST node (root of the tree)
 */
export interface AppNode {
  kind: 'app'
  name: string
  /** Human-readable display name */
  displayName: string
  version: string
  description: string
  baseUrl: string
  targets: TargetConfig
  resources: ResourceNode[]
}

/**
 * Union type for all AST nodes
 */
export type ASTNode = AppNode | ResourceNode | FieldNode

/**
 * Parse result from any parser
 */
export interface ParseResult {
  success: boolean
  ast?: AppNode
  errors?: ParseError[]
}

/**
 * Parse error with location information
 */
export interface ParseError {
  message: string
  line?: number
  column?: number
  source?: string
}

/**
 * Normalize a name to lowercase with hyphens
 */
export function normalizeName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase -> camel-Case
    .replace(/[_\s]+/g, '-') // underscores/spaces -> hyphens
    .replace(/-+/g, '-') // multiple hyphens -> single
    .toLowerCase()
    .replace(/^-|-$/g, '') // trim hyphens
}

/**
 * Convert a name to display format (Title Case)
 */
export function toDisplayName(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Pluralize a name (simple English rules)
 */
export function pluralize(name: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('s') || lower.endsWith('x') || lower.endsWith('ch') || lower.endsWith('sh')) {
    return name + 'es'
  }
  if (lower.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(lower.charAt(lower.length - 2))) {
    return name.slice(0, -1) + 'ies'
  }
  return name + 's'
}

/**
 * Parse field type from shorthand notation
 */
export function parseFieldType(typeStr: string): { type: FieldType; modifiers: Partial<FieldModifiers> } {
  const modifiers: Partial<FieldModifiers> = {}
  let type: FieldType = 'text'

  // Check for type suffix
  const typeLower = typeStr.toLowerCase()

  switch (typeLower) {
    case 'number':
    case 'int':
    case 'integer':
      type = 'number'
      break
    case 'float':
    case 'decimal':
      type = 'number'
      modifiers.decimal = true
      break
    case 'bool':
    case 'boolean':
      type = 'boolean'
      break
    case 'date':
    case 'datetime':
    case 'timestamp':
      type = 'date'
      break
    case 'email':
      type = 'email'
      break
    case 'url':
      type = 'url'
      break
    case 'phone':
      type = 'phone'
      break
    case 'password':
      type = 'password'
      break
    case 'textarea':
    case 'text':
      type = 'text'
      break
    case 'json':
      type = 'json'
      break
    case 'select':
      type = 'select'
      break
    default:
      // Check for auto-generated types
      if (typeLower === 'auto' || typeLower === 'id' || typeLower === 'uuid') {
        modifiers.auto = true
        type = 'text'
      }
      break
  }

  return { type, modifiers }
}

/**
 * Create a field node with defaults
 */
export function createFieldNode(
  name: string,
  type: FieldType = 'text',
  options: Partial<Omit<FieldNode, 'kind' | 'name' | 'type'>> = {}
): FieldNode {
  return {
    kind: 'field',
    name,
    type,
    modifiers: options.modifiers ?? {},
    ...options,
  }
}

/**
 * Create a resource node with defaults
 */
export function createResourceNode(
  name: string,
  fields: FieldNode[] = [],
  options: Partial<Omit<ResourceNode, 'kind' | 'name' | 'fields'>> = {}
): ResourceNode {
  return {
    kind: 'resource',
    name,
    pluralName: options.pluralName ?? pluralize(name),
    path: options.path ?? `/${normalizeName(pluralize(name))}`,
    displayName: options.displayName ?? toDisplayName(name),
    fields,
    ...options,
  }
}

/**
 * Create an app node with defaults
 */
export function createAppNode(
  name: string,
  resources: ResourceNode[] = [],
  options: Partial<Omit<AppNode, 'kind' | 'name' | 'resources'>> = {}
): AppNode {
  const normalizedName = normalizeName(name)
  const displayName = options.displayName ?? toDisplayName(normalizedName)

  return {
    kind: 'app',
    name: normalizedName,
    displayName,
    version: options.version ?? '0.1.0',
    description: options.description ?? `${displayName} - A SaaSkit application`,
    baseUrl: options.baseUrl ?? 'http://localhost:3000',
    targets: options.targets ?? { cli: true, api: true, sdk: true, mcp: true },
    resources,
  }
}

/**
 * Parse a React element tree into a Schema AST
 */
export function parseJSXToAST(element: ReactElement<AppProps>): ParseResult {
  const errors: ParseError[] = []

  try {
    const appProps = element.props
    const resources: ResourceNode[] = []

    // Parse children (Resource components)
    const children = React.Children.toArray(appProps.children)
    for (const child of children) {
      if (React.isValidElement(child)) {
        const resourceNode = parseResourceElement(child, errors)
        if (resourceNode) {
          resources.push(resourceNode)
        }
      }
    }

    const ast = createAppNode(appProps.name, resources, {
      version: appProps.version,
      description: appProps.description,
      baseUrl: appProps.baseUrl,
      targets: appProps.targets
        ? {
            cli: appProps.targets.cli ?? true,
            api: appProps.targets.api ?? true,
            sdk: appProps.targets.sdk ?? true,
            mcp: appProps.targets.mcp ?? true,
          }
        : undefined,
    })

    return {
      success: errors.length === 0,
      ast,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    return {
      success: false,
      errors: [{ message: error instanceof Error ? error.message : String(error) }],
    }
  }
}

/**
 * Parse a Resource React element into a ResourceNode
 */
function parseResourceElement(element: ReactElement, errors: ParseError[]): ResourceNode | null {
  const props = element.props as ResourceProps & Record<string, unknown>

  if (!props.name) {
    errors.push({ message: 'Resource is missing required "name" prop' })
    return null
  }

  const fields: FieldNode[] = []

  // Parse fields from children
  const children = React.Children.toArray(props.children)
  for (const child of children) {
    if (React.isValidElement(child)) {
      const fieldNode = parseFieldElement(child, errors)
      if (fieldNode) {
        fields.push(fieldNode)
      }
    }
  }

  // Parse shorthand field props (non-standard props become fields)
  for (const [key, value] of Object.entries(props)) {
    if (isFieldProp(key, value)) {
      const fieldNode = parseShorthandField(key, value)
      if (fieldNode) {
        fields.push(fieldNode)
      }
    }
  }

  return createResourceNode(props.name, fields, {
    path: props.path,
    displayName: props.displayName as string,
    description: props.description as string,
    icon: props.icon as string,
  })
}

/**
 * Check if a prop is a field definition (shorthand syntax)
 */
function isFieldProp(key: string, value: unknown): boolean {
  // Standard Resource props that are not fields
  const standardProps = ['name', 'path', 'children', 'displayName', 'description', 'icon']
  return !standardProps.includes(key) && (typeof value === 'boolean' || typeof value === 'string')
}

/**
 * Parse a shorthand field prop into a FieldNode
 */
function parseShorthandField(name: string, value: unknown): FieldNode | null {
  let fieldName = name
  const modifiers: FieldModifiers = {}
  let type: FieldType = 'text'
  let selectValues: string[] | undefined

  // Check for optional marker (?)
  if (fieldName.endsWith('?')) {
    fieldName = fieldName.slice(0, -1)
    modifiers.optional = true
  }

  // Check for type suffix (name:type)
  if (fieldName.includes(':')) {
    const [n, t] = fieldName.split(':')
    fieldName = n
    const parsed = parseFieldType(t)
    type = parsed.type
    Object.assign(modifiers, parsed.modifiers)
  }

  // Check for relation (name->Target)
  if (fieldName.includes('->')) {
    const [n, target] = fieldName.split('->')
    fieldName = n
    type = 'relation'
    return createFieldNode(fieldName, type, { modifiers, target })
  }

  // Check value for select/enum (value like "a | b | c")
  if (typeof value === 'string' && value.includes('|')) {
    type = 'select'
    selectValues = value.split('|').map((v) => v.trim())
  }

  // Boolean true means required field, false means optional
  if (typeof value === 'boolean') {
    modifiers.required = value
    if (!value) modifiers.optional = true
  }

  return createFieldNode(fieldName, type, { modifiers, values: selectValues })
}

/**
 * Parse a Field React element into a FieldNode
 */
function parseFieldElement(element: ReactElement, errors: ParseError[]): FieldNode | null {
  const props = element.props as Record<string, unknown>
  const componentType = element.type as { fieldType?: string; displayName?: string; name?: string }

  if (!props.name) {
    errors.push({ message: 'Field is missing required "name" prop' })
    return null
  }

  const name = props.name as string
  const fieldType = componentType.fieldType || componentType.displayName || componentType.name || 'text'
  const type = fieldType.toLowerCase() as FieldType

  const modifiers: FieldModifiers = {
    required: props.required === true,
    optional: props.optional === true,
    unique: props.unique === true,
    auto: props.auto === true,
    primary: props.primary === true,
    decimal: props.decimal === true,
    multiple: props.multiple === true,
    readonly: props.readonly === true,
    hidden: props.hidden === true,
  }

  return createFieldNode(name, type, {
    modifiers,
    default: props.default,
    values: (props.values || props.options) as string[] | undefined,
    target: props.target as string | undefined,
    min: props.min as number | undefined,
    max: props.max as number | undefined,
    step: props.step as number | undefined,
    pattern: props.pattern as string | undefined,
    placeholder: props.placeholder as string | undefined,
    label: props.label as string | undefined,
    description: props.description as string | undefined,
  })
}

/**
 * Validate an AST for completeness and correctness
 */
export function validateAST(ast: AppNode): ParseError[] {
  const errors: ParseError[] = []

  // Validate app name
  if (!ast.name || ast.name.trim().length === 0) {
    errors.push({ message: 'App name is required' })
  }

  // Validate resources
  for (const resource of ast.resources) {
    if (!resource.name || resource.name.trim().length === 0) {
      errors.push({ message: 'Resource name is required' })
    }

    // Validate fields
    for (const field of resource.fields) {
      if (!field.name || field.name.trim().length === 0) {
        errors.push({ message: `Field in resource "${resource.name}" is missing a name` })
      }

      // Validate relation targets exist
      if (field.type === 'relation' && field.target) {
        const targetExists = ast.resources.some((r) => r.name === field.target)
        if (!targetExists) {
          errors.push({
            message: `Field "${field.name}" references unknown resource "${field.target}"`,
          })
        }
      }

      // Validate select fields have values
      if (field.type === 'select' && (!field.values || field.values.length === 0)) {
        errors.push({
          message: `Select field "${field.name}" must have at least one value`,
        })
      }
    }
  }

  return errors
}

/**
 * Serialize an AST to JSON
 */
export function serializeAST(ast: AppNode): string {
  return JSON.stringify(ast, null, 2)
}

/**
 * Deserialize an AST from JSON
 */
export function deserializeAST(json: string): ParseResult {
  try {
    const parsed = JSON.parse(json) as AppNode
    const errors = validateAST(parsed)
    return {
      success: errors.length === 0,
      ast: parsed,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    return {
      success: false,
      errors: [{ message: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}` }],
    }
  }
}
