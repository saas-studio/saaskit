/**
 * Type-Safe Query Builder
 *
 * Provides a fluent, type-safe API for building MongoDB-style queries.
 * Infers field types from document type for autocomplete and type checking.
 *
 * @see saaskit-32i
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string
 *   name: string
 *   age: number
 *   isActive: boolean
 * }
 *
 * const query = createQueryBuilder<User>()
 *   .where('name', eq('John'))
 *   .where('age', gt(18))
 *   .orderBy('createdAt', 'desc')
 *   .limit(10)
 *   .build()
 * ```
 */

// ============================================================================
// Types
// ============================================================================

/** MongoDB-style comparison operators */
export interface ComparisonOperator<T> {
  $eq?: T
  $ne?: T
  $gt?: T
  $gte?: T
  $lt?: T
  $lte?: T
  $in?: T[]
  $nin?: T[]
  $regex?: string
  $options?: string
}

/** A field condition can be a direct value or an operator object */
export type FieldCondition<T> = T | ComparisonOperator<T>

/** Query conditions for a document type */
export type WhereCondition<T> = {
  [K in keyof T]?: FieldCondition<T[K]>
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc'

/** Order by clause */
export type OrderByClause<T> = {
  [K in keyof T]?: SortDirection
}

/** Query options (matches MongoFindAllOptions structure) */
export interface QueryOptions<T> {
  where?: Record<string, unknown>
  orderBy?: Record<string, SortDirection>
  limit?: number
  offset?: number
  select?: (keyof T)[]
  include?: string[]
}

// ============================================================================
// Operator Functions
// ============================================================================

/**
 * Equal operator
 */
export function eq<T>(value: T): ComparisonOperator<T> {
  return { $eq: value }
}

/**
 * Not equal operator
 */
export function ne<T>(value: T): ComparisonOperator<T> {
  return { $ne: value }
}

/**
 * Greater than operator
 */
export function gt<T>(value: T): ComparisonOperator<T> {
  return { $gt: value }
}

/**
 * Greater than or equal operator
 */
export function gte<T>(value: T): ComparisonOperator<T> {
  return { $gte: value }
}

/**
 * Less than operator
 */
export function lt<T>(value: T): ComparisonOperator<T> {
  return { $lt: value }
}

/**
 * Less than or equal operator
 */
export function lte<T>(value: T): ComparisonOperator<T> {
  return { $lte: value }
}

/**
 * In array operator (named in_ to avoid reserved word conflict)
 */
export function in_<T>(values: T[]): ComparisonOperator<T> {
  return { $in: values }
}

/**
 * Not in array operator
 */
export function nin<T>(values: T[]): ComparisonOperator<T> {
  return { $nin: values }
}

/**
 * Contains (case-insensitive regex match)
 */
export function contains(value: string): ComparisonOperator<string> {
  return { $regex: value, $options: 'i' }
}

/**
 * Starts with (case-insensitive)
 */
export function startsWith(value: string): ComparisonOperator<string> {
  return { $regex: `^${value}`, $options: 'i' }
}

/**
 * Ends with (case-insensitive)
 */
export function endsWith(value: string): ComparisonOperator<string> {
  return { $regex: `${value}$`, $options: 'i' }
}

// ============================================================================
// Where Builder
// ============================================================================

/**
 * Build a where clause from typed conditions
 */
export function where<T>(conditions: WhereCondition<T>): Record<string, unknown> {
  return conditions as Record<string, unknown>
}

// ============================================================================
// Query Builder Class
// ============================================================================

/**
 * Fluent query builder with type-safe field access
 */
export class QueryBuilder<T, Selected extends keyof T = keyof T> {
  private whereClause: Record<string, unknown> = {}
  private orderByClause: Record<string, SortDirection> = {}
  private limitValue?: number
  private offsetValue?: number
  private selectFields: (keyof T)[] = []
  private includeRelations: string[] = []

  /**
   * Add a where condition
   */
  where<K extends keyof T>(
    field: K,
    condition: FieldCondition<T[K]>
  ): QueryBuilder<T, Selected> {
    this.whereClause[field as string] = condition
    return this
  }

  /**
   * Add multiple where conditions
   */
  whereAll(conditions: WhereCondition<T>): QueryBuilder<T, Selected> {
    for (const [key, value] of Object.entries(conditions)) {
      this.whereClause[key] = value
    }
    return this
  }

  /**
   * Set order by clause
   */
  orderBy<K extends keyof T>(
    field: K,
    direction: SortDirection = 'asc'
  ): QueryBuilder<T, Selected> {
    this.orderByClause[field as string] = direction
    return this
  }

  /**
   * Set limit
   */
  limit(value: number): QueryBuilder<T, Selected> {
    this.limitValue = value
    return this
  }

  /**
   * Set offset
   */
  offset(value: number): QueryBuilder<T, Selected> {
    this.offsetValue = value
    return this
  }

  /**
   * Select specific fields
   */
  select<K extends keyof T>(...fields: K[]): QueryBuilder<T, K> {
    this.selectFields = fields
    return this as unknown as QueryBuilder<T, K>
  }

  /**
   * Include relations
   */
  include(...relations: string[]): QueryBuilder<T, Selected> {
    this.includeRelations.push(...relations)
    return this
  }

  /**
   * Build the where clause
   */
  build(): Record<string, unknown> {
    return { ...this.whereClause }
  }

  /**
   * Build full query options
   */
  buildOptions(): QueryOptions<T> {
    const options: QueryOptions<T> = {}

    if (Object.keys(this.whereClause).length > 0) {
      options.where = { ...this.whereClause }
    }

    if (Object.keys(this.orderByClause).length > 0) {
      options.orderBy = { ...this.orderByClause }
    }

    if (this.limitValue !== undefined) {
      options.limit = this.limitValue
    }

    if (this.offsetValue !== undefined) {
      options.offset = this.offsetValue
    }

    if (this.selectFields.length > 0) {
      options.select = this.selectFields
    }

    if (this.includeRelations.length > 0) {
      options.include = this.includeRelations
    }

    return options
  }
}

/**
 * Create a new query builder for a document type
 */
export function createQueryBuilder<T>(): QueryBuilder<T> {
  return new QueryBuilder<T>()
}
