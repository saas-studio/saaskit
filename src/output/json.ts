/**
 * JSON Formatter
 *
 * Outputs data as JSON - structured and machine-readable.
 * Supports pretty printing, column projection, and streaming.
 */

import {
  BaseFormatter,
  type ColumnDefinition,
  type FormatOptions,
  type FormatResult,
  type OutputChunk,
} from './types'

export class JsonFormatter extends BaseFormatter {
  readonly name = 'json' as const

  format(data: Record<string, unknown>[], options?: FormatOptions): FormatResult {
    const columns = this.resolveColumns(data, options)
    const projected = this.projectData(data, columns, options)

    const indent = options?.pretty !== false ? 2 : undefined
    const output = JSON.stringify(projected, null, indent)

    return {
      output,
      rowCount: data.length,
      columns: columns.map((c) => c.key),
    }
  }

  formatOne(record: Record<string, unknown>, options?: FormatOptions): string {
    const columns = this.resolveColumns([record], options)
    const projected = this.projectRecord(record, columns, options)

    const indent = options?.pretty !== false ? 2 : undefined
    return JSON.stringify(projected, null, indent)
  }

  async *stream(
    data: AsyncIterable<Record<string, unknown>> | Iterable<Record<string, unknown>>,
    options?: FormatOptions
  ): AsyncGenerator<OutputChunk> {
    const pretty = options?.pretty !== false
    const indent = pretty ? '  ' : ''
    const newline = pretty ? '\n' : ''

    let columns: ColumnDefinition[] | null = null
    let index = 0
    let isFirst = true

    // Opening bracket
    yield { type: 'header', content: '[' + newline }

    for await (const record of data) {
      // Initialize columns from first record if not specified
      if (columns === null) {
        columns = this.resolveColumns([record], options)
      }

      const projected = this.projectRecord(record, columns, options)
      const jsonStr = JSON.stringify(projected, null, pretty ? 2 : undefined)

      // Add comma before non-first items
      const prefix = isFirst ? '' : ',' + newline
      isFirst = false

      // Indent each line if pretty printing
      const content = pretty
        ? prefix + jsonStr.split('\n').map((line) => indent + line).join('\n')
        : prefix + jsonStr

      yield { type: 'row', content, index: index++ }
    }

    // Closing bracket
    yield { type: 'footer', content: newline + ']' }
  }

  /**
   * Project data to only include specified columns
   */
  private projectData(
    data: Record<string, unknown>[],
    columns: ColumnDefinition[],
    options?: FormatOptions
  ): Record<string, unknown>[] {
    return data.map((record) => this.projectRecord(record, columns, options))
  }

  /**
   * Project a single record to only include specified columns
   */
  private projectRecord(
    record: Record<string, unknown>,
    columns: ColumnDefinition[],
    options?: FormatOptions
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const column of columns) {
      const value = this.getValue(record, column.key)

      // Apply custom formatter if present
      if (column.format && value !== undefined) {
        result[column.key] = column.format(value)
      } else if (value === undefined || value === null) {
        // Include nulls but skip undefined unless nullValue is set
        if (value === null || options?.nullValue !== undefined) {
          result[column.key] = value ?? (options?.nullValue === '' ? null : options?.nullValue)
        }
      } else {
        result[column.key] = value
      }
    }

    return result
  }
}
