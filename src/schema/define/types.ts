/**
 * Type-safe Resource Definition Types
 *
 * Core type definitions for the declarative Resource builder API.
 * Provides full type inference for field definitions, validation,
 * relationships, and computed fields.
 */

// =============================================================================
// Primitive Field Types
// =============================================================================

/** Base field types supported by the schema */
export type PrimitiveType = 'string' | 'number' | 'boolean' | 'date' | 'datetime'

/** Extended field types with semantic meaning */
export type ExtendedType = 'email' | 'url' | 'uuid' | 'json'

/** All supported field types */
export type FieldType = PrimitiveType | ExtendedType | 'enum' | 'relation'

/** UI field types for expanded syntax */
export type UIFieldType = 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'select' | 'relation'

// =============================================================================
// Type Constants (for runtime validation)
// =============================================================================

/** Set of all valid primitive types */
export const PRIMITIVE_TYPES: ReadonlySet<PrimitiveType> = new Set(['string', 'number', 'boolean', 'date', 'datetime'])

/** Set of all valid extended types */
export const EXTENDED_TYPES: ReadonlySet<ExtendedType> = new Set(['email', 'url', 'uuid', 'json'])

/** Set of all valid field types */
export const ALL_FIELD_TYPES: ReadonlySet<FieldType> = new Set([
  ...PRIMITIVE_TYPES,
  ...EXTENDED_TYPES,
  'enum',
  'relation'
])

/** Set of all valid UI field types */
export const UI_FIELD_TYPES: ReadonlySet<UIFieldType> = new Set([
  'text', 'number', 'boolean', 'date', 'datetime', 'select', 'relation'
])

// =============================================================================
// Validation Types
// =============================================================================

/** String validation constraints */
export interface StringValidation {
  minLength?: number
  maxLength?: number
  pattern?: RegExp | string
  trim?: boolean
  lowercase?: boolean
  uppercase?: boolean
}

/** Number validation constraints */
export interface NumberValidation {
  min?: number
  max?: number
  integer?: boolean
  positive?: boolean
  negative?: boolean
  step?: number
}

/** Date validation constraints */
export interface DateValidation {
  min?: Date | string
  max?: Date | string
  future?: boolean
  past?: boolean
}

/** Combined validation type */
export type Validation = StringValidation | NumberValidation | DateValidation

// =============================================================================
// Relationship Types
// =============================================================================

/** Cascade behavior for relationships */
export type CascadeBehavior = 'delete' | 'nullify' | 'restrict' | 'setDefault'

/** Relationship configuration */
export interface RelationConfig {
  target: string
  type: 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany'
  foreignKey?: string
  through?: string
  cascade?: CascadeBehavior
  eager?: boolean
}

// =============================================================================
// Field Definition Types
// =============================================================================

/** Base field configuration shared by all field types */
export interface BaseFieldConfig<T> {
  type: FieldType
  required: boolean
  unique: boolean
  indexed: boolean
  nullable: boolean
  auto: boolean
  default?: T | (() => T)
  validation?: Validation
  label?: string
  description?: string
}

/** String field configuration */
export interface StringFieldConfig extends BaseFieldConfig<string> {
  type: 'string' | 'email' | 'url' | 'uuid'
  validation?: StringValidation
}

/** Number field configuration */
export interface NumberFieldConfig extends BaseFieldConfig<number> {
  type: 'number'
  validation?: NumberValidation
}

/** Boolean field configuration */
export interface BooleanFieldConfig extends BaseFieldConfig<boolean> {
  type: 'boolean'
}

/** Date field configuration */
export interface DateFieldConfig extends BaseFieldConfig<Date> {
  type: 'date' | 'datetime'
  validation?: DateValidation
}

/** Enum field configuration */
export interface EnumFieldConfig<T extends string = string> extends BaseFieldConfig<T> {
  type: 'enum'
  values: readonly T[]
}

/** JSON field configuration */
export interface JsonFieldConfig<T = unknown> extends BaseFieldConfig<T> {
  type: 'json'
  schema?: object // JSON Schema for validation
}

/** Relation field configuration */
export interface RelationFieldConfig extends BaseFieldConfig<string | string[]> {
  type: 'relation'
  relation: RelationConfig
}

/** Union of all field configurations */
export type FieldConfig =
  | StringFieldConfig
  | NumberFieldConfig
  | BooleanFieldConfig
  | DateFieldConfig
  | EnumFieldConfig
  | JsonFieldConfig
  | RelationFieldConfig

// =============================================================================
// Computed Field Types
// =============================================================================

/** Computed field definition */
export interface ComputedFieldConfig<TRecord, TValue> {
  compute: (record: TRecord) => TValue
  dependencies?: (keyof TRecord)[]
  memoize?: boolean
}

// =============================================================================
// Field Builder Result Types (for type inference)
// =============================================================================

/** Marker type for required fields */
export type RequiredField<T> = T & { __required: true }

/** Marker type for optional fields */
export type OptionalField<T> = T & { __required: false }

/** Marker type for nullable fields */
export type NullableField<T> = T & { __nullable: true }

/** Extract the value type from a field builder */
export type InferFieldType<F> = F extends FieldBuilder<infer T, infer R>
  ? R extends true
    ? T
    : T | undefined
  : never

/** Field builder interface for type inference */
export interface FieldBuilder<T, Required extends boolean = true> {
  __type: T
  __required: Required
  __config: FieldConfig
}

// =============================================================================
// Resource Schema Types
// =============================================================================

/** Schema definition type - maps field names to field builders */
export type SchemaDefinition = Record<string, FieldBuilder<unknown, boolean>>

/** Infer the record type from a schema definition */
export type InferSchema<S extends SchemaDefinition> = {
  [K in keyof S as S[K]['__required'] extends true ? K : never]: S[K]['__type']
} & {
  [K in keyof S as S[K]['__required'] extends false ? K : never]?: S[K]['__type']
}

/** Input type for creating records (excludes auto fields) */
export type InferInput<S extends SchemaDefinition> = {
  [K in keyof S as S[K]['__config']['auto'] extends true
    ? never
    : S[K]['__required'] extends true
      ? K
      : never]: S[K]['__type']
} & {
  [K in keyof S as S[K]['__config']['auto'] extends true
    ? never
    : S[K]['__required'] extends false
      ? K
      : never]?: S[K]['__type']
}

/** Partial update type for updating records */
export type InferUpdate<S extends SchemaDefinition> = {
  [K in keyof S as S[K]['__config']['auto'] extends true ? never : K]?: S[K]['__type']
}

// =============================================================================
// Resource Definition Types
// =============================================================================

/** Complete resource definition */
export interface ResourceDefinition<S extends SchemaDefinition = SchemaDefinition> {
  name: string
  tableName: string
  schema: S
  primaryKey: string
  timestamps: boolean
  softDelete: boolean
  computed?: Record<string, ComputedFieldConfig<InferSchema<S>, unknown>>
  indexes?: IndexDefinition[]
  hooks?: ResourceHooks<S>
}

/** Index definition for database optimization */
export interface IndexDefinition {
  fields: string[]
  unique?: boolean
  name?: string
}

/** Lifecycle hooks for resources */
export interface ResourceHooks<S extends SchemaDefinition> {
  beforeCreate?: (data: InferInput<S>) => InferInput<S> | Promise<InferInput<S>>
  afterCreate?: (record: InferSchema<S>) => void | Promise<void>
  beforeUpdate?: (id: string, data: InferUpdate<S>) => InferUpdate<S> | Promise<InferUpdate<S>>
  afterUpdate?: (record: InferSchema<S>) => void | Promise<void>
  beforeDelete?: (id: string) => void | Promise<void>
  afterDelete?: (id: string) => void | Promise<void>
}

// =============================================================================
// Validation Schema Types
// =============================================================================

/** Generated validation schema for a resource */
export interface ValidationSchema {
  type: 'object'
  properties: Record<string, ValidationProperty>
  required: string[]
}

/** Validation property for a single field */
export interface ValidationProperty {
  type: string
  format?: string
  enum?: string[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
}

// =============================================================================
// Unified Field Component Types (for JSX expanded syntax)
// =============================================================================

/** Base props shared by all field components */
export interface BaseFieldProps {
  /** Field name - must be a valid identifier */
  name: string
  /** Mark field as required (default: true unless optional is set) */
  required?: boolean
  /** Mark field as optional (shorthand for required=false) */
  optional?: boolean
  /** Mark field as unique */
  unique?: boolean
  /** Mark field as auto-generated */
  auto?: boolean
}

/** Text field specific props */
export interface TextFieldPropsBase extends BaseFieldProps {
  type?: 'text' | 'email' | 'url'
  multiline?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  default?: string
}

/** Number field specific props */
export interface NumberFieldPropsBase extends BaseFieldProps {
  decimal?: boolean
  min?: number
  max?: number
  step?: number
  default?: number
}

/** Boolean field specific props */
export interface BooleanFieldPropsBase extends BaseFieldProps {
  default?: boolean
}

/** Date field specific props */
export interface DateFieldPropsBase extends BaseFieldProps {
  includeTime?: boolean
  future?: boolean
  past?: boolean
  default?: string | Date
}

/** Select field specific props */
export interface SelectFieldPropsBase extends BaseFieldProps {
  options: string[]
  multiple?: boolean
  default?: string | string[]
}

/** Relation field specific props */
export interface RelationFieldPropsBase extends BaseFieldProps {
  to: string
  many?: boolean
  self?: boolean
  cascade?: 'delete' | 'nullify' | 'restrict'
}

/** Union of all field props */
export type FieldProps =
  | TextFieldPropsBase
  | NumberFieldPropsBase
  | BooleanFieldPropsBase
  | DateFieldPropsBase
  | SelectFieldPropsBase
  | RelationFieldPropsBase

// =============================================================================
// Type Guards
// =============================================================================

/** Check if a value is a valid FieldType */
export function isValidFieldType(value: unknown): value is FieldType {
  return typeof value === 'string' && ALL_FIELD_TYPES.has(value as FieldType)
}

/** Check if a value is a valid UIFieldType */
export function isValidUIFieldType(value: unknown): value is UIFieldType {
  return typeof value === 'string' && UI_FIELD_TYPES.has(value as UIFieldType)
}

/** Check if a value is a valid PrimitiveType */
export function isValidPrimitiveType(value: unknown): value is PrimitiveType {
  return typeof value === 'string' && PRIMITIVE_TYPES.has(value as PrimitiveType)
}

/** Check if a value is a valid ExtendedType */
export function isValidExtendedType(value: unknown): value is ExtendedType {
  return typeof value === 'string' && EXTENDED_TYPES.has(value as ExtendedType)
}
