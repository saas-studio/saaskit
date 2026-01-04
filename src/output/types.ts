/**
 * Output Format Types
 *
 * Core type definitions for the output formatting system.
 * Supports structured data output in multiple formats with
 * streaming, column projection, and extensibility.
 */

/**
 * Supported output format types
 */
export type OutputFormat = 'json' | 'yaml' | 'table' | 'csv' | 'text' | 'markdown'

/**
 * Table rendering style for table formatter
 */
export type TableStyle = 'ascii' | 'unicode' | 'plain'

/**
 * Alignment options for table columns
 */
export type Alignment = 'left' | 'right' | 'center'

/**
 * Column definition for table/CSV output
 */
export interface ColumnDefinition {
  /** Column key (field name in data) */
  key: string
  /** Display header (defaults to key) */
  header?: string
  /** Column width (auto if not specified) */
  width?: number
  /** Text alignment */
  align?: Alignment
  /** Custom value formatter */
  format?: (value: unknown) => string
}

/**
 * Common formatting options for all formatters
 */
export interface FormatOptions {
  /** Columns to include (all if not specified) */
  columns?: string[] | ColumnDefinition[]
  /** Pretty print with indentation (for JSON/YAML) */
  pretty?: boolean
  /** Include headers (for table/CSV) */
  headers?: boolean
  /** Maximum width for output */
  maxWidth?: number
  /** Table style for table output */
  tableStyle?: TableStyle
  /** Include row numbers */
  rowNumbers?: boolean
  /** Custom date formatter */
  dateFormat?: (date: Date) => string
  /** Null/undefined display value */
  nullValue?: string
  /** Truncate long values */
  truncate?: number
}

/**
 * Streaming chunk for large datasets
 */
export interface OutputChunk {
  /** Chunk type */
  type: 'header' | 'row' | 'footer' | 'separator'
  /** Chunk content */
  content: string
  /** Row index (for row chunks) */
  index?: number
}

/**
 * Result from formatting operations
 */
export interface FormatResult {
  /** Formatted output string */
  output: string
  /** Number of rows processed */
  rowCount: number
  /** Columns included in output */
  columns: string[]
  /** Any warnings during formatting */
  warnings?: string[]
}

/**
 * Formatter interface - all formatters implement this
 */
export interface Formatter {
  /** Format name */
  readonly name: OutputFormat

  /**
   * Format data to string output
   *
   * @param data - Array of records to format
   * @param options - Formatting options
   * @returns Formatted output result
   */
  format(data: Record<string, unknown>[], options?: FormatOptions): FormatResult

  /**
   * Format a single record
   *
   * @param record - Single record to format
   * @param options - Formatting options
   * @returns Formatted string
   */
  formatOne(record: Record<string, unknown>, options?: FormatOptions): string

  /**
   * Create a streaming formatter for large datasets
   *
   * @param options - Formatting options
   * @returns Async iterator of output chunks
   */
  stream(
    data: AsyncIterable<Record<string, unknown>> | Iterable<Record<string, unknown>>,
    options?: FormatOptions
  ): AsyncGenerator<OutputChunk>
}

/**
 * Base formatter class with common utilities
 */
export abstract class BaseFormatter implements Formatter {
  abstract readonly name: OutputFormat

  abstract format(data: Record<string, unknown>[], options?: FormatOptions): FormatResult

  abstract formatOne(record: Record<string, unknown>, options?: FormatOptions): string

  abstract stream(
    data: AsyncIterable<Record<string, unknown>> | Iterable<Record<string, unknown>>,
    options?: FormatOptions
  ): AsyncGenerator<OutputChunk>

  /**
   * Resolve column definitions from options and data
   */
  protected resolveColumns(
    data: Record<string, unknown>[],
    options?: FormatOptions
  ): ColumnDefinition[] {
    if (!options?.columns) {
      // Auto-detect columns from first record
      if (data.length === 0) return []
      const firstRecord = data[0]
      return Object.keys(firstRecord).map((key) => ({ key, header: key }))
    }

    // Convert string columns to definitions
    return options.columns.map((col) => {
      if (typeof col === 'string') {
        return { key: col, header: col }
      }
      return { ...col, header: col.header ?? col.key }
    })
  }

  /**
   * Get value from record by key path (supports nested objects)
   */
  protected getValue(record: Record<string, unknown>, key: string): unknown {
    const parts = key.split('.')
    let current: unknown = record

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined
      }
      if (typeof current === 'object') {
        current = (current as Record<string, unknown>)[part]
      } else {
        return undefined
      }
    }

    return current
  }

  /**
   * Format a value for display
   */
  protected formatValue(
    value: unknown,
    column: ColumnDefinition,
    options?: FormatOptions
  ): string {
    // Custom formatter takes precedence
    if (column.format) {
      return column.format(value)
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return options?.nullValue ?? ''
    }

    // Handle dates
    if (value instanceof Date) {
      if (options?.dateFormat) {
        return options.dateFormat(value)
      }
      return value.toISOString()
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((v) => this.formatValue(v, column, options)).join(', ')
    }

    // Handle objects
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    // Handle primitives
    let str = String(value)

    // Truncate if needed
    if (options?.truncate && str.length > options.truncate) {
      str = str.substring(0, options.truncate - 3) + '...'
    }

    return str
  }

  /**
   * Truncate string to max length with ellipsis
   */
  protected truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str
    if (maxLength <= 3) return str.substring(0, maxLength)
    return str.substring(0, maxLength - 3) + '...'
  }

  /**
   * Pad string to specified width with alignment
   */
  protected pad(str: string, width: number, align: Alignment = 'left'): string {
    const len = str.length
    if (len >= width) return str

    const padding = width - len

    switch (align) {
      case 'right':
        return ' '.repeat(padding) + str
      case 'center': {
        const left = Math.floor(padding / 2)
        const right = padding - left
        return ' '.repeat(left) + str + ' '.repeat(right)
      }
      default:
        return str + ' '.repeat(padding)
    }
  }
}
