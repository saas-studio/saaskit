/**
 * Type-safe Field Builders
 *
 * Fluent builder API for defining resource fields with full type inference.
 * Each builder method returns a new builder instance, maintaining immutability.
 *
 * @example
 * ```typescript
 * const User = Resource('users', {
 *   name: string().required(),
 *   email: email().unique(),
 *   role: enumField(['admin', 'user']).default('user'),
 *   createdAt: timestamp().auto()
 * })
 * ```
 */

import type {
  FieldBuilder,
  StringFieldConfig,
  NumberFieldConfig,
  BooleanFieldConfig,
  DateFieldConfig,
  EnumFieldConfig,
  JsonFieldConfig,
  RelationFieldConfig,
  StringValidation,
  NumberValidation,
  DateValidation,
  RelationConfig,
  CascadeBehavior,
} from './types'

// =============================================================================
// Base Builder Class
// =============================================================================

/** Base builder with common field configuration methods */
abstract class BaseBuilder<T, Required extends boolean = false> implements FieldBuilder<T, Required> {
  __type!: T
  __required!: Required
  __config: any

  protected constructor(config: Partial<any>) {
    this.__config = {
      required: false,
      unique: false,
      indexed: false,
      nullable: false,
      auto: false,
      ...config,
    }
  }

  /** Mark field as required */
  required(): BaseBuilder<T, true> & FieldBuilder<T, true> {
    return this.clone({ required: true }) as any
  }

  /** Mark field as optional (default) */
  optional(): BaseBuilder<T, false> & FieldBuilder<T, false> {
    return this.clone({ required: false }) as any
  }

  /** Mark field as nullable */
  nullable(): BaseBuilder<T | null, Required> & FieldBuilder<T | null, Required> {
    return this.clone({ nullable: true }) as any
  }

  /** Mark field as unique */
  unique(): this {
    return this.clone({ unique: true }) as this
  }

  /** Mark field as indexed */
  indexed(): this {
    return this.clone({ indexed: true }) as this
  }

  /** Set human-readable label */
  label(label: string): this {
    return this.clone({ label }) as this
  }

  /** Set field description */
  describe(description: string): this {
    return this.clone({ description }) as this
  }

  /** Set default value */
  default(value: T | (() => T)): BaseBuilder<T, false> & FieldBuilder<T, false> {
    return this.clone({ default: value, required: false }) as any
  }

  /** Clone builder with new config */
  protected abstract clone(config: Partial<any>): BaseBuilder<T, Required>
}

// =============================================================================
// String Builder
// =============================================================================

class StringBuilder<Required extends boolean = false> extends BaseBuilder<string, Required> {
  declare __config: StringFieldConfig

  constructor(type: 'string' | 'email' | 'url' | 'uuid' = 'string') {
    super({ type })
  }

  /** Set minimum length */
  min(length: number): this {
    return this.clone({
      validation: { ...this.__config.validation, minLength: length },
    }) as this
  }

  /** Set maximum length */
  max(length: number): this {
    return this.clone({
      validation: { ...this.__config.validation, maxLength: length },
    }) as this
  }

  /** Set length range */
  length(min: number, max?: number): this {
    return this.clone({
      validation: {
        ...this.__config.validation,
        minLength: min,
        maxLength: max ?? min,
      },
    }) as this
  }

  /** Set regex pattern */
  pattern(pattern: RegExp | string): this {
    const patternStr = pattern instanceof RegExp ? pattern.source : pattern
    return this.clone({
      validation: { ...this.__config.validation, pattern: patternStr },
    }) as this
  }

  /** Auto-trim whitespace */
  trim(): this {
    return this.clone({
      validation: { ...this.__config.validation, trim: true },
    }) as this
  }

  /** Transform to lowercase */
  lowercase(): this {
    return this.clone({
      validation: { ...this.__config.validation, lowercase: true },
    }) as this
  }

  /** Transform to uppercase */
  uppercase(): this {
    return this.clone({
      validation: { ...this.__config.validation, uppercase: true },
    }) as this
  }

  protected clone(config: Partial<StringFieldConfig>): StringBuilder<Required> {
    const builder = new StringBuilder<Required>(this.__config.type)
    builder.__config = { ...this.__config, ...config }
    return builder
  }
}

// =============================================================================
// Number Builder
// =============================================================================

class NumberBuilder<Required extends boolean = false> extends BaseBuilder<number, Required> {
  declare __config: NumberFieldConfig

  constructor() {
    super({ type: 'number' })
  }

  /** Set minimum value */
  min(value: number): this {
    return this.clone({
      validation: { ...this.__config.validation, min: value },
    }) as this
  }

  /** Set maximum value */
  max(value: number): this {
    return this.clone({
      validation: { ...this.__config.validation, max: value },
    }) as this
  }

  /** Set value range */
  range(min: number, max: number): this {
    return this.clone({
      validation: { ...this.__config.validation, min, max },
    }) as this
  }

  /** Require integer values */
  integer(): this {
    return this.clone({
      validation: { ...this.__config.validation, integer: true },
    }) as this
  }

  /** Require positive values */
  positive(): this {
    return this.clone({
      validation: { ...this.__config.validation, positive: true, min: 0 },
    }) as this
  }

  /** Require negative values */
  negative(): this {
    return this.clone({
      validation: { ...this.__config.validation, negative: true, max: 0 },
    }) as this
  }

  /** Set step/precision */
  step(value: number): this {
    return this.clone({
      validation: { ...this.__config.validation, step: value },
    }) as this
  }

  protected clone(config: Partial<NumberFieldConfig>): NumberBuilder<Required> {
    const builder = new NumberBuilder<Required>()
    builder.__config = { ...this.__config, ...config }
    return builder
  }
}

// =============================================================================
// Boolean Builder
// =============================================================================

class BooleanBuilder<Required extends boolean = false> extends BaseBuilder<boolean, Required> {
  declare __config: BooleanFieldConfig

  constructor() {
    super({ type: 'boolean' })
  }

  protected clone(config: Partial<BooleanFieldConfig>): BooleanBuilder<Required> {
    const builder = new BooleanBuilder<Required>()
    builder.__config = { ...this.__config, ...config }
    return builder
  }
}

// =============================================================================
// Date Builder
// =============================================================================

class DateBuilder<Required extends boolean = false> extends BaseBuilder<Date, Required> {
  declare __config: DateFieldConfig

  constructor(includeTime: boolean = false) {
    super({ type: includeTime ? 'datetime' : 'date' })
  }

  /** Require future dates */
  future(): this {
    return this.clone({
      validation: { ...this.__config.validation, future: true },
    }) as this
  }

  /** Require past dates */
  past(): this {
    return this.clone({
      validation: { ...this.__config.validation, past: true },
    }) as this
  }

  /** Set minimum date */
  after(date: Date | string): this {
    return this.clone({
      validation: { ...this.__config.validation, min: date },
    }) as this
  }

  /** Set maximum date */
  before(date: Date | string): this {
    return this.clone({
      validation: { ...this.__config.validation, max: date },
    }) as this
  }

  /** Mark as auto-generated (current timestamp) */
  auto(): DateBuilder<false> {
    const builder = this.clone({ auto: true, required: false }) as DateBuilder<false>
    return builder
  }

  protected clone(config: Partial<DateFieldConfig>): DateBuilder<Required> {
    const builder = new DateBuilder<Required>(this.__config.type === 'datetime')
    builder.__config = { ...this.__config, ...config }
    return builder
  }
}

// =============================================================================
// Enum Builder
// =============================================================================

class EnumBuilder<T extends string, Required extends boolean = false> extends BaseBuilder<T, Required> {
  declare __config: EnumFieldConfig<T>

  constructor(values: readonly T[]) {
    super({ type: 'enum', values })
  }

  protected clone(config: Partial<EnumFieldConfig<T>>): EnumBuilder<T, Required> {
    const builder = new EnumBuilder<T, Required>(this.__config.values)
    builder.__config = { ...this.__config, ...config }
    return builder
  }
}

// =============================================================================
// JSON Builder
// =============================================================================

class JsonBuilder<T = unknown, Required extends boolean = false> extends BaseBuilder<T, Required> {
  declare __config: JsonFieldConfig<T>

  constructor() {
    super({ type: 'json' })
  }

  /** Set JSON schema for validation */
  schema(schema: object): this {
    return this.clone({ schema }) as this
  }

  protected clone(config: Partial<JsonFieldConfig<T>>): JsonBuilder<T, Required> {
    const builder = new JsonBuilder<T, Required>()
    builder.__config = { ...this.__config, ...config }
    return builder
  }
}

// =============================================================================
// Relation Builder
// =============================================================================

class RelationBuilder<T extends string | string[], Required extends boolean = false> extends BaseBuilder<T, Required> {
  declare __config: RelationFieldConfig

  constructor(target: string, type: RelationConfig['type']) {
    super({
      type: 'relation',
      relation: { target, type },
    })
  }

  /** Set foreign key column name */
  foreignKey(key: string): this {
    return this.clone({
      relation: { ...this.__config.relation, foreignKey: key },
    }) as this
  }

  /** Set through table for many-to-many */
  through(table: string): this {
    return this.clone({
      relation: { ...this.__config.relation, through: table },
    }) as this
  }

  /** Set cascade behavior */
  cascade(behavior: CascadeBehavior): this {
    return this.clone({
      relation: { ...this.__config.relation, cascade: behavior },
    }) as this
  }

  /** Enable eager loading */
  eager(): this {
    return this.clone({
      relation: { ...this.__config.relation, eager: true },
    }) as this
  }

  protected clone(config: Partial<RelationFieldConfig>): RelationBuilder<T, Required> {
    const builder = new RelationBuilder<T, Required>(
      this.__config.relation.target,
      this.__config.relation.type
    )
    builder.__config = { ...this.__config, ...config }
    return builder
  }
}

// =============================================================================
// ID Builder (special case for primary keys)
// =============================================================================

class IdBuilder<Required extends boolean = true> extends BaseBuilder<string, Required> {
  declare __config: StringFieldConfig

  constructor() {
    super({ type: 'uuid', required: true, auto: true, unique: true })
  }

  /** Use auto-increment integer instead of UUID */
  autoIncrement(): IdBuilder<Required> {
    return this.clone({ type: 'number' as any, auto: true }) as any
  }

  protected clone(config: Partial<StringFieldConfig>): IdBuilder<Required> {
    const builder = new IdBuilder<Required>()
    builder.__config = { ...this.__config, ...config }
    return builder
  }
}

// =============================================================================
// Factory Functions
// =============================================================================

/** Create a string field */
export function string(): StringBuilder<false> {
  return new StringBuilder('string')
}

/** Create an email field with email validation */
export function email(): StringBuilder<false> {
  return new StringBuilder('email')
}

/** Create a URL field with URL validation */
export function url(): StringBuilder<false> {
  return new StringBuilder('url')
}

/** Create a UUID field */
export function uuid(): StringBuilder<false> {
  return new StringBuilder('uuid')
}

/** Create a number field */
export function number(): NumberBuilder<false> {
  return new NumberBuilder()
}

/** Create an integer field */
export function integer(): NumberBuilder<false> {
  return new NumberBuilder().integer()
}

/** Create a boolean field */
export function boolean(): BooleanBuilder<false> {
  return new BooleanBuilder()
}

/** Create a date field (date only) */
export function date(): DateBuilder<false> {
  return new DateBuilder(false)
}

/** Create a datetime field (date + time) */
export function datetime(): DateBuilder<false> {
  return new DateBuilder(true)
}

/** Create a timestamp field (datetime + auto) */
export function timestamp(): DateBuilder<false> {
  return new DateBuilder(true).auto()
}

/** Create an enum field with specific values */
export function enumField<T extends string>(values: readonly T[]): EnumBuilder<T, false> {
  return new EnumBuilder<T, false>(values)
}

/** Create a JSON field */
export function json<T = unknown>(): JsonBuilder<T, false> {
  return new JsonBuilder<T, false>()
}

/** Create an ID field (primary key) */
export function id(): IdBuilder<true> {
  return new IdBuilder()
}

// =============================================================================
// Relationship Factory Functions
// =============================================================================

/** Create a belongs-to relationship (many-to-one) */
export function belongsTo(target: string): RelationBuilder<string, false> {
  return new RelationBuilder<string, false>(target, 'belongsTo')
}

/** Create a has-one relationship (one-to-one) */
export function hasOne(target: string): RelationBuilder<string, false> {
  return new RelationBuilder<string, false>(target, 'hasOne')
}

/** Create a has-many relationship (one-to-many) */
export function hasMany(target: string): RelationBuilder<string[], false> {
  return new RelationBuilder<string[], false>(target, 'hasMany')
}

/** Create a many-to-many relationship */
export function manyToMany(target: string): RelationBuilder<string[], false> {
  return new RelationBuilder<string[], false>(target, 'manyToMany')
}

// =============================================================================
// Export Builder Types
// =============================================================================

export type {
  StringBuilder,
  NumberBuilder,
  BooleanBuilder,
  DateBuilder,
  EnumBuilder,
  JsonBuilder,
  RelationBuilder,
  IdBuilder,
}
