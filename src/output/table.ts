/**
 * Table Formatter
 *
 * Outputs data as a formatted table with borders, alignment, and styling.
 * Supports unicode, ascii, and plain table styles.
 */

import {
  BaseFormatter,
  type ColumnDefinition,
  type FormatOptions,
  type FormatResult,
  type OutputChunk,
  type TableStyle,
  type Alignment,
} from './types'

/**
 * Border characters for different table styles
 */
const BORDER_CHARS: Record<
  TableStyle,
  {
    topLeft: string
    topRight: string
    bottomLeft: string
    bottomRight: string
    horizontal: string
    vertical: string
    topMiddle: string
    bottomMiddle: string
    leftMiddle: string
    rightMiddle: string
    cross: string
  }
> = {
  unicode: {
    topLeft: '\u250C',
    topRight: '\u2510',
    bottomLeft: '\u2514',
    bottomRight: '\u2518',
    horizontal: '\u2500',
    vertical: '\u2502',
    topMiddle: '\u252C',
    bottomMiddle: '\u2534',
    leftMiddle: '\u251C',
    rightMiddle: '\u2524',
    cross: '\u253C',
  },
  ascii: {
    topLeft: '+',
    topRight: '+',
    bottomLeft: '+',
    bottomRight: '+',
    horizontal: '-',
    vertical: '|',
    topMiddle: '+',
    bottomMiddle: '+',
    leftMiddle: '+',
    rightMiddle: '+',
    cross: '+',
  },
  plain: {
    topLeft: '',
    topRight: '',
    bottomLeft: '',
    bottomRight: '',
    horizontal: '',
    vertical: ' ',
    topMiddle: '',
    bottomMiddle: '',
    leftMiddle: '',
    rightMiddle: '',
    cross: '',
  },
}

export class TableFormatter extends BaseFormatter {
  readonly name = 'table' as const

  format(data: Record<string, unknown>[], options?: FormatOptions): FormatResult {
    const columns = this.resolveColumns(data, options)
    const style = options?.tableStyle ?? 'unicode'
    const showHeaders = options?.headers !== false
    const showRowNumbers = options?.rowNumbers ?? false

    if (data.length === 0) {
      return {
        output: showHeaders ? this.formatEmptyTable(columns, style) : '',
        rowCount: 0,
        columns: columns.map((c) => c.key),
      }
    }

    // Calculate column widths
    const widths = this.calculateColumnWidths(data, columns, options, showRowNumbers)

    // Build the table
    const lines: string[] = []
    const chars = BORDER_CHARS[style]

    // Top border
    if (style !== 'plain') {
      lines.push(this.buildBorder(widths, chars, 'top', showRowNumbers))
    }

    // Header row
    if (showHeaders) {
      lines.push(this.buildRow(
        columns.map((c) => c.header ?? c.key),
        widths,
        columns,
        chars,
        showRowNumbers ? '#' : undefined
      ))

      // Header separator
      if (style !== 'plain') {
        lines.push(this.buildBorder(widths, chars, 'middle', showRowNumbers))
      }
    }

    // Data rows
    for (let i = 0; i < data.length; i++) {
      const record = data[i]
      const values = columns.map((col) => {
        const value = this.getValue(record, col.key)
        return this.formatValue(value, col, options)
      })
      lines.push(this.buildRow(
        values,
        widths,
        columns,
        chars,
        showRowNumbers ? String(i + 1) : undefined
      ))
    }

    // Bottom border
    if (style !== 'plain') {
      lines.push(this.buildBorder(widths, chars, 'bottom', showRowNumbers))
    }

    return {
      output: lines.join('\n'),
      rowCount: data.length,
      columns: columns.map((c) => c.key),
    }
  }

  formatOne(record: Record<string, unknown>, options?: FormatOptions): string {
    const result = this.format([record], options)
    return result.output
  }

  async *stream(
    data: AsyncIterable<Record<string, unknown>> | Iterable<Record<string, unknown>>,
    options?: FormatOptions
  ): AsyncGenerator<OutputChunk> {
    const style = options?.tableStyle ?? 'unicode'
    const showHeaders = options?.headers !== false
    const chars = BORDER_CHARS[style]

    // For streaming, we need to buffer first row to determine column widths
    // This is a limitation of table format - we can't know widths ahead of time
    const buffer: Record<string, unknown>[] = []
    let columns: ColumnDefinition[] | null = null
    let widths: number[] = []
    let headerSent = false
    let index = 0

    for await (const record of data) {
      if (columns === null) {
        columns = this.resolveColumns([record], options)
      }

      buffer.push(record)

      // Buffer first 10 rows to estimate column widths
      if (buffer.length === 10) {
        widths = this.calculateColumnWidths(buffer, columns, options, false)

        // Send header
        if (style !== 'plain') {
          yield { type: 'header', content: this.buildBorder(widths, chars, 'top', false) }
        }

        if (showHeaders) {
          yield {
            type: 'header',
            content: this.buildRow(
              columns.map((c) => c.header ?? c.key),
              widths,
              columns,
              chars
            ),
          }
          if (style !== 'plain') {
            yield { type: 'separator', content: this.buildBorder(widths, chars, 'middle', false) }
          }
        }
        headerSent = true

        // Flush buffer
        for (const bufferedRecord of buffer) {
          const values = columns.map((col) => {
            const value = this.getValue(bufferedRecord, col.key)
            return this.formatValue(value, col, options)
          })
          yield {
            type: 'row',
            content: this.buildRow(values, widths, columns, chars),
            index: index++,
          }
        }
        buffer.length = 0
      }
    }

    // Handle remaining buffered rows
    if (buffer.length > 0 && columns !== null) {
      widths = this.calculateColumnWidths(buffer, columns, options, false)

      if (!headerSent) {
        if (style !== 'plain') {
          yield { type: 'header', content: this.buildBorder(widths, chars, 'top', false) }
        }

        if (showHeaders) {
          yield {
            type: 'header',
            content: this.buildRow(
              columns.map((c) => c.header ?? c.key),
              widths,
              columns,
              chars
            ),
          }
          if (style !== 'plain') {
            yield { type: 'separator', content: this.buildBorder(widths, chars, 'middle', false) }
          }
        }
      }

      for (const bufferedRecord of buffer) {
        const values = columns.map((col) => {
          const value = this.getValue(bufferedRecord, col.key)
          return this.formatValue(value, col, options)
        })
        yield {
          type: 'row',
          content: this.buildRow(values, widths, columns, chars),
          index: index++,
        }
      }
    }

    // Footer
    if (style !== 'plain' && columns !== null) {
      yield { type: 'footer', content: this.buildBorder(widths, chars, 'bottom', false) }
    }
  }

  private calculateColumnWidths(
    data: Record<string, unknown>[],
    columns: ColumnDefinition[],
    options?: FormatOptions,
    showRowNumbers?: boolean
  ): number[] {
    const widths: number[] = []
    const maxWidth = options?.maxWidth

    for (const col of columns) {
      // Start with header width
      let width = col.width ?? (col.header ?? col.key).length

      // Check all data values
      for (const record of data) {
        const value = this.getValue(record, col.key)
        const formatted = this.formatValue(value, col, options)
        width = Math.max(width, formatted.length)
      }

      widths.push(width)
    }

    // Apply max width constraint if specified
    if (maxWidth && maxWidth > 0) {
      const rowNumWidth = showRowNumbers ? 4 : 0
      const borderWidth = columns.length + 1 + rowNumWidth
      const availableWidth = maxWidth - borderWidth

      if (availableWidth > 0) {
        const totalWidth = widths.reduce((sum, w) => sum + w, 0)
        if (totalWidth > availableWidth) {
          const scale = availableWidth / totalWidth
          for (let i = 0; i < widths.length; i++) {
            widths[i] = Math.max(3, Math.floor(widths[i] * scale))
          }
        }
      }
    }

    return widths
  }

  private buildBorder(
    widths: number[],
    chars: typeof BORDER_CHARS[TableStyle],
    position: 'top' | 'middle' | 'bottom',
    showRowNumbers?: boolean
  ): string {
    const left = position === 'top' ? chars.topLeft : position === 'bottom' ? chars.bottomLeft : chars.leftMiddle
    const right = position === 'top' ? chars.topRight : position === 'bottom' ? chars.bottomRight : chars.rightMiddle
    const middle = position === 'top' ? chars.topMiddle : position === 'bottom' ? chars.bottomMiddle : chars.cross

    const parts: string[] = []

    if (showRowNumbers) {
      parts.push(chars.horizontal.repeat(4))
    }

    for (const width of widths) {
      parts.push(chars.horizontal.repeat(width + 2))
    }

    return left + parts.join(middle) + right
  }

  private buildRow(
    values: string[],
    widths: number[],
    columns: ColumnDefinition[],
    chars: typeof BORDER_CHARS[TableStyle],
    rowNumber?: string
  ): string {
    const cells: string[] = []

    if (rowNumber !== undefined) {
      cells.push(' ' + this.pad(rowNumber, 2, 'right') + ' ')
    }

    for (let i = 0; i < values.length; i++) {
      const value = values[i]
      const width = widths[i]
      const align = columns[i]?.align ?? 'left'

      // Truncate if necessary
      const truncated = this.truncate(value, width)
      const padded = this.pad(truncated, width, align)
      cells.push(' ' + padded + ' ')
    }

    return chars.vertical + cells.join(chars.vertical) + chars.vertical
  }

  private formatEmptyTable(columns: ColumnDefinition[], style: TableStyle): string {
    const chars = BORDER_CHARS[style]
    const widths = columns.map((c) => (c.header ?? c.key).length)

    const lines: string[] = []

    if (style !== 'plain') {
      lines.push(this.buildBorder(widths, chars, 'top', false))
    }

    lines.push(this.buildRow(
      columns.map((c) => c.header ?? c.key),
      widths,
      columns,
      chars
    ))

    if (style !== 'plain') {
      lines.push(this.buildBorder(widths, chars, 'bottom', false))
    }

    return lines.join('\n')
  }
}
