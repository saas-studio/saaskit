/**
 * @saaskit/shadmin-codegen types
 *
 * Type definitions for generating Shadmin/React-Admin components from schemas.
 */

import type { Field, Resource, SaaSSchema } from '@saaskit/schema'

// ============================================================================
// Field Mapping Types
// ============================================================================

/**
 * Result of mapping a schema field to React-Admin components
 */
export interface FieldMapping {
  /** Component name for List view (e.g., "TextField", "NumberField") */
  listComponent: string
  /** Component name for Show view (e.g., "TextField", "DateField") */
  showComponent: string
  /** Component name for Create/Edit forms (e.g., "TextInput", "NumberInput") */
  inputComponent: string
  /** Props to pass to the component */
  props: Record<string, unknown>
  /** Import statement for the component */
  imports: string[]
}

/**
 * Options for field mapping
 */
export interface FieldMappingOptions {
  /** Whether the field is being used in an Edit form (affects readonly fields) */
  isEdit?: boolean
  /** Whether to include validation props */
  includeValidation?: boolean
}

// ============================================================================
// Code Generation Types
// ============================================================================

/**
 * Generated component code
 */
export interface GeneratedComponent {
  /** Component name (e.g., "UserList", "UserEdit") */
  name: string
  /** Generated TypeScript/JSX code */
  code: string
  /** Import statements needed */
  imports: string[]
  /** File path relative to output directory */
  filePath: string
}

/**
 * Generated resource with all components
 */
export interface GeneratedResource {
  /** Resource name from schema */
  resourceName: string
  /** List component */
  list: GeneratedComponent
  /** Show component */
  show: GeneratedComponent
  /** Create component */
  create: GeneratedComponent
  /** Edit component */
  edit: GeneratedComponent
  /** Resource registration code */
  resourceRegistration: string
}

/**
 * Options for code generation
 */
export interface GeneratorOptions {
  /** Output directory for generated files */
  outputDir?: string
  /** Whether to format code with prettier */
  format?: boolean
  /** Custom component overrides */
  componentOverrides?: Record<string, Partial<FieldMapping>>
  /** Whether to generate TypeScript or JavaScript */
  typescript?: boolean
}

/**
 * Result of generating all resources
 */
export interface GeneratorResult {
  /** Generated resources */
  resources: GeneratedResource[]
  /** Index file that exports all resources */
  indexFile: GeneratedComponent
  /** App component with resource registrations */
  appComponent: GeneratedComponent
}

// ============================================================================
// Component Names
// ============================================================================

/**
 * React-Admin field components for display
 */
export type FieldComponent =
  | 'TextField'
  | 'NumberField'
  | 'BooleanField'
  | 'DateField'
  | 'EmailField'
  | 'UrlField'
  | 'RichTextField'
  | 'ArrayField'
  | 'ReferenceField'
  | 'FunctionField'

/**
 * React-Admin input components for forms
 */
export type InputComponent =
  | 'TextInput'
  | 'NumberInput'
  | 'BooleanInput'
  | 'DateInput'
  | 'DateTimeInput'
  | 'SelectInput'
  | 'ReferenceInput'
  | 'AutocompleteInput'
  | 'ArrayInput'
  | 'RichTextInput'
  | 'PasswordInput'
