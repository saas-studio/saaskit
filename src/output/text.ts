/**
 * Text Formatter
 *
 * Outputs data as plain text - human-readable key-value pairs.
 * Suitable for simple terminal output and log files.
 */

import {
  BaseFormatter,
  type ColumnDefinition,
  type FormatOptions,
  type FormatResult,
  type OutputChunk,
} from './types'

export class TextFormatter extends BaseFormatter {
  readonly name = 'text' as const

  format(data: Record<string, unknown>[], options?: FormatOptions): FormatResult {
    const columns = this.resolveColumns(data, options)

    if (data.length === 0) {
      return {
        output: '(no data)',
        rowCount: 0,
        columns: columns.map((c) => c.key),
      }
    }

    const lines: string[] = []

    for (let i = 0; i < data.length; i++) {
      const record = data[i]

      if (options?.rowNumbers) {
        lines.push(`--- Record ${i + 1} ---`)
      }

      for (const col of columns) {
        const value = this.getValue(record, col.key)
        const formatted = this.formatValue(value, col, options)
        const label = col.header ?? col.key
        lines.push(`${label}: ${formatted}`)
      }

      // Add separator between records
      if (i < data.length - 1) {
        lines.push('')
      }
    }

    return {
      output: lines.join('\n'),
      rowCount: data.length,
      columns: columns.map((c) => c.key),
    }
  }

  formatOne(record: Record<string, unknown>, options?: FormatOptions): string {
    const columns = this.resolveColumns([record], options)
    const lines: string[] = []

    for (const col of columns) {
      const value = this.getValue(record, col.key)
      const formatted = this.formatValue(value, col, options)
      const label = col.header ?? col.key
      lines.push(`${label}: ${formatted}`)
    }

    return lines.join('\n')
  }

  async *stream(
    data: AsyncIterable<Record<string, unknown>> | Iterable<Record<string, unknown>>,
    options?: FormatOptions
  ): AsyncGenerator<OutputChunk> {
    let columns: ColumnDefinition[] | null = null
    let index = 0

    for await (const record of data) {
      if (columns === null) {
        columns = this.resolveColumns([record], options)
      }

      const lines: string[] = []

      if (options?.rowNumbers) {
        lines.push(`--- Record ${index + 1} ---`)
      }

      for (const col of columns) {
        const value = this.getValue(record, col.key)
        const formatted = this.formatValue(value, col, options)
        const label = col.header ?? col.key
        lines.push(`${label}: ${formatted}`)
      }

      yield {
        type: 'row',
        content: lines.join('\n'),
        index: index++,
      }

      // Add separator
      yield { type: 'separator', content: '' }
    }
  }
}
