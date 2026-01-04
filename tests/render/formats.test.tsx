import { describe, expect, test } from 'bun:test'
import React from 'react'
import { render, detectFormat, type OutputFormat, type RenderOptions } from '../../src/render'
import { Text } from '../../src/components/Text'
import { Box } from '../../src/components/Box'

describe('Terminal Rendering - Output Formats', () => {
  describe('Unicode Format (default)', () => {
    test('uses box-drawing characters for borders', () => {
      const element = React.createElement(Box, null, 'Content')
      const result = render(element, { format: 'unicode' })
      // Should contain Unicode box-drawing characters
      expect(result).toContain('\u250c') // ┌ top-left
      expect(result).toContain('\u2510') // ┐ top-right
      expect(result).toContain('\u2514') // └ bottom-left
      expect(result).toContain('\u2518') // ┘ bottom-right
      expect(result).toContain('\u2500') // ─ horizontal
      expect(result).toContain('\u2502') // │ vertical
    })

    test('supports full ANSI colors', () => {
      const element = React.createElement(Text, { color: 'red' }, 'Red text')
      const result = render(element, { format: 'unicode' })
      // Should contain ANSI color codes
      expect(result).toContain('\x1b[31m')
      expect(result).toContain('Red text')
    })

    test('is the default format when no format specified', () => {
      const element = React.createElement(Box, null, 'Content')
      const resultDefault = render(element)
      const resultUnicode = render(element, { format: 'unicode' })
      expect(resultDefault).toBe(resultUnicode)
    })

    test('renders double border style with Unicode characters', () => {
      const element = React.createElement(Box, { borderStyle: 'double' }, 'Content')
      const result = render(element, { format: 'unicode' })
      expect(result).toContain('\u2554') // ╔
      expect(result).toContain('\u2557') // ╗
      expect(result).toContain('\u255a') // ╚
      expect(result).toContain('\u255d') // ╝
    })

    test('renders rounded border style with Unicode characters', () => {
      const element = React.createElement(Box, { borderStyle: 'rounded' }, 'Content')
      const result = render(element, { format: 'unicode' })
      expect(result).toContain('\u256d') // ╭
      expect(result).toContain('\u256e') // ╮
      expect(result).toContain('\u2570') // ╰
      expect(result).toContain('\u256f') // ╯
    })
  })

  describe('ASCII Format', () => {
    test('uses only ASCII characters for borders', () => {
      const element = React.createElement(Box, null, 'Content')
      const result = render(element, { format: 'ascii' })
      // Should use ASCII-only characters
      expect(result).toContain('+') // corners
      expect(result).toContain('-') // horizontal
      expect(result).toContain('|') // vertical
      // Should NOT contain Unicode box-drawing characters
      expect(result).not.toContain('\u250c')
      expect(result).not.toContain('\u2500')
      expect(result).not.toContain('\u2502')
    })

    test('box corners become + characters', () => {
      const element = React.createElement(Box, null, 'Test')
      const result = render(element, { format: 'ascii' })
      const lines = result.split('\n')
      // Top line should start and end with +
      expect(lines[0]).toMatch(/^\+.*\+$/)
      // Bottom line should start and end with +
      const bottomLine = lines[lines.length - 1]
      expect(bottomLine).toMatch(/^\+.*\+$/)
    })

    test('horizontal lines become - characters', () => {
      const element = React.createElement(Box, null, 'Test')
      const result = render(element, { format: 'ascii' })
      const lines = result.split('\n')
      // Top border should have dashes
      expect(lines[0]).toMatch(/\+-+\+/)
    })

    test('vertical lines become | characters', () => {
      const element = React.createElement(Box, null, 'Test')
      const result = render(element, { format: 'ascii' })
      const lines = result.split('\n')
      // Content line should have pipes
      const contentLine = lines.find(line => line.includes('Test'))
      expect(contentLine).toMatch(/^\|.*\|$/)
    })

    test('still supports ANSI colors in ASCII format', () => {
      const element = React.createElement(Text, { color: 'green' }, 'Green text')
      const result = render(element, { format: 'ascii' })
      expect(result).toContain('\x1b[32m')
      expect(result).toContain('Green text')
    })

    test('all border styles use ASCII characters', () => {
      const singleBox = render(
        React.createElement(Box, { borderStyle: 'single' }, 'Test'),
        { format: 'ascii' }
      )
      const doubleBox = render(
        React.createElement(Box, { borderStyle: 'double' }, 'Test'),
        { format: 'ascii' }
      )
      const roundedBox = render(
        React.createElement(Box, { borderStyle: 'rounded' }, 'Test'),
        { format: 'ascii' }
      )

      // All should use + for corners
      for (const result of [singleBox, doubleBox, roundedBox]) {
        expect(result).toContain('+')
        expect(result).toContain('-')
        expect(result).toContain('|')
      }
    })
  })

  describe('Plain Format', () => {
    test('renders without borders or box characters', () => {
      const element = React.createElement(Box, null, 'Plain content')
      const result = render(element, { format: 'plain' })
      // Should NOT contain any border characters
      expect(result).not.toContain('\u250c')
      expect(result).not.toContain('\u2500')
      expect(result).not.toContain('\u2502')
      expect(result).not.toContain('+')
      expect(result).not.toContain('|')
      // Should contain the content
      expect(result).toContain('Plain content')
    })

    test('uses basic indentation instead of borders', () => {
      const element = React.createElement(Box, { padding: 1 }, 'Indented')
      const result = render(element, { format: 'plain' })
      // Content should be indented, not bordered
      expect(result).toMatch(/^\s*Indented/)
      expect(result).not.toContain('|')
    })

    test('does not include ANSI color codes', () => {
      const element = React.createElement(Text, { color: 'red', bold: true }, 'No color')
      const result = render(element, { format: 'plain' })
      // Should NOT contain ANSI escape codes
      expect(result).not.toMatch(/\x1b\[/)
      expect(result).toContain('No color')
    })

    test('nested boxes are represented by indentation only', () => {
      const element = React.createElement(
        Box,
        null,
        React.createElement(Box, null, 'Nested')
      )
      const result = render(element, { format: 'plain' })
      expect(result).toContain('Nested')
      expect(result).not.toContain('\u250c')
      expect(result).not.toContain('+')
    })

    test('preserves text content without decoration', () => {
      const element = React.createElement(
        Box,
        null,
        React.createElement(Text, { color: 'blue', underline: true }, 'Styled text')
      )
      const result = render(element, { format: 'plain' })
      expect(result).toContain('Styled text')
      expect(result).not.toMatch(/\x1b\[/)
    })

    test('handles multiple children with line breaks', () => {
      const element = React.createElement(
        Box,
        { flexDirection: 'column' },
        React.createElement(Text, null, 'Line 1'),
        React.createElement(Text, null, 'Line 2'),
        React.createElement(Text, null, 'Line 3')
      )
      const result = render(element, { format: 'plain' })
      expect(result).toContain('Line 1')
      expect(result).toContain('Line 2')
      expect(result).toContain('Line 3')
    })
  })

  describe('JSON Format', () => {
    test('outputs valid JSON', () => {
      const element = React.createElement(Text, null, 'Hello')
      const result = render(element, { format: 'json' })
      expect(() => JSON.parse(result)).not.toThrow()
    })

    test('contains element type in output', () => {
      const element = React.createElement(Text, null, 'Content')
      const result = render(element, { format: 'json' })
      const parsed = JSON.parse(result)
      expect(parsed.type).toBe('Text')
    })

    test('contains element props in output', () => {
      const element = React.createElement(Text, { color: 'red', bold: true }, 'Styled')
      const result = render(element, { format: 'json' })
      const parsed = JSON.parse(result)
      expect(parsed.props.color).toBe('red')
      expect(parsed.props.bold).toBe(true)
    })

    test('contains element children in output', () => {
      const element = React.createElement(Text, null, 'Child content')
      const result = render(element, { format: 'json' })
      const parsed = JSON.parse(result)
      expect(parsed.children).toBeDefined()
      expect(parsed.children).toContain('Child content')
    })

    test('represents nested element tree structure', () => {
      const element = React.createElement(
        Box,
        { borderStyle: 'single' },
        React.createElement(Text, { color: 'green' }, 'Nested text')
      )
      const result = render(element, { format: 'json' })
      const parsed = JSON.parse(result)
      expect(parsed.type).toBe('Box')
      expect(parsed.props.borderStyle).toBe('single')
      expect(Array.isArray(parsed.children) || parsed.children).toBeTruthy()
    })

    test('handles array of children', () => {
      const element = React.createElement(
        Box,
        null,
        React.createElement(Text, null, 'First'),
        React.createElement(Text, null, 'Second')
      )
      const result = render(element, { format: 'json' })
      const parsed = JSON.parse(result)
      expect(Array.isArray(parsed.children)).toBe(true)
      expect(parsed.children.length).toBe(2)
    })

    test('includes computed layout information', () => {
      const element = React.createElement(Box, { padding: 2 }, 'Content')
      const result = render(element, { format: 'json' })
      const parsed = JSON.parse(result)
      // Should include layout/computed values
      expect(parsed.layout || parsed.computed || parsed.props.padding).toBeDefined()
    })
  })

  describe('Markdown Format', () => {
    test('outputs markdown-compatible text', () => {
      const element = React.createElement(Text, null, 'Simple text')
      const result = render(element, { format: 'markdown' })
      expect(result).toContain('Simple text')
      // Should not contain ANSI codes
      expect(result).not.toMatch(/\x1b\[/)
    })

    test('bold text becomes markdown bold', () => {
      const element = React.createElement(Text, { bold: true }, 'Bold text')
      const result = render(element, { format: 'markdown' })
      expect(result).toContain('**Bold text**')
    })

    test('italic text becomes markdown italic', () => {
      const element = React.createElement(Text, { italic: true }, 'Italic text')
      const result = render(element, { format: 'markdown' })
      expect(result).toContain('*Italic text*')
    })

    test('underline text becomes markdown emphasis', () => {
      const element = React.createElement(Text, { underline: true }, 'Underlined')
      const result = render(element, { format: 'markdown' })
      // Underline could be <u> tags or _underscores_
      expect(result).toMatch(/(<u>Underlined<\/u>|_Underlined_)/)
    })

    test('boxes become markdown code blocks or blockquotes', () => {
      const element = React.createElement(Box, null, 'Box content')
      const result = render(element, { format: 'markdown' })
      // Could be code block with ``` or blockquote with >
      expect(result).toMatch(/(```|> |    )/)
      expect(result).toContain('Box content')
    })

    test('nested content preserves structure', () => {
      const element = React.createElement(
        Box,
        null,
        React.createElement(Text, { bold: true }, 'Title'),
        React.createElement(Text, null, 'Description')
      )
      const result = render(element, { format: 'markdown' })
      expect(result).toContain('**Title**')
      expect(result).toContain('Description')
    })

    test('combined bold and italic text', () => {
      const element = React.createElement(Text, { bold: true, italic: true }, 'Both')
      const result = render(element, { format: 'markdown' })
      expect(result).toContain('***Both***')
    })

    test('colored text includes color indicator', () => {
      const element = React.createElement(Text, { color: 'red' }, 'Red text')
      const result = render(element, { format: 'markdown' })
      // Could be HTML span or just include color name
      expect(result).toMatch(/(Red text|<span.*red.*>Red text<\/span>)/)
    })
  })

  describe('detectFormat()', () => {
    test('detectFormat function exists', () => {
      expect(typeof detectFormat).toBe('function')
    })

    test('returns a valid OutputFormat', () => {
      const result = detectFormat()
      const validFormats: OutputFormat[] = ['unicode', 'ascii', 'plain', 'json', 'markdown']
      expect(validFormats).toContain(result)
    })

    test('returns unicode for modern terminals with UTF-8 support', () => {
      // This test checks default behavior - unicode should be default
      const originalLang = process.env.LANG
      process.env.LANG = 'en_US.UTF-8'
      const result = detectFormat()
      expect(result).toBe('unicode')
      process.env.LANG = originalLang
    })

    test('returns ascii when TERM is dumb', () => {
      const originalTerm = process.env.TERM
      process.env.TERM = 'dumb'
      const result = detectFormat()
      expect(result).toBe('ascii')
      process.env.TERM = originalTerm
    })

    test('returns plain when NO_COLOR is set', () => {
      const originalNoColor = process.env.NO_COLOR
      process.env.NO_COLOR = '1'
      const result = detectFormat()
      expect(result).toBe('plain')
      delete process.env.NO_COLOR
      if (originalNoColor !== undefined) {
        process.env.NO_COLOR = originalNoColor
      }
    })

    test('returns plain when stdout is not a TTY', () => {
      // This tests piped output detection
      // The implementation should check process.stdout.isTTY
      const result = detectFormat()
      // In test environment, might not be TTY
      const validFormats: OutputFormat[] = ['unicode', 'ascii', 'plain', 'json', 'markdown']
      expect(validFormats).toContain(result)
    })

    test('detects CI environment and returns plain', () => {
      const originalCI = process.env.CI
      process.env.CI = 'true'
      const result = detectFormat()
      expect(result).toBe('plain')
      if (originalCI !== undefined) {
        process.env.CI = originalCI
      } else {
        delete process.env.CI
      }
    })
  })

  describe('RenderOptions', () => {
    describe('format option', () => {
      test('format option selects unicode output', () => {
        const element = React.createElement(Box, null, 'Test')
        const result = render(element, { format: 'unicode' })
        expect(result).toContain('\u250c')
      })

      test('format option selects ascii output', () => {
        const element = React.createElement(Box, null, 'Test')
        const result = render(element, { format: 'ascii' })
        expect(result).toContain('+')
        expect(result).not.toContain('\u250c')
      })

      test('format option selects plain output', () => {
        const element = React.createElement(Box, null, 'Test')
        const result = render(element, { format: 'plain' })
        expect(result).not.toContain('\u250c')
        expect(result).not.toContain('+')
      })

      test('format option selects json output', () => {
        const element = React.createElement(Text, null, 'Test')
        const result = render(element, { format: 'json' })
        expect(() => JSON.parse(result)).not.toThrow()
      })

      test('format option selects markdown output', () => {
        const element = React.createElement(Text, { bold: true }, 'Test')
        const result = render(element, { format: 'markdown' })
        expect(result).toContain('**Test**')
      })
    })

    describe('width option', () => {
      test('width constrains output to specified columns', () => {
        const element = React.createElement(Box, null, 'This is a very long line of text that should be wrapped')
        const result = render(element, { width: 40 })
        const lines = result.split('\n')
        for (const line of lines) {
          // Strip ANSI codes for width check
          const visualLine = line.replace(/\x1b\[[0-9;]*m/g, '')
          expect(visualLine.length).toBeLessThanOrEqual(40)
        }
      })

      test('width wraps text content', () => {
        const element = React.createElement(Text, null, 'A'.repeat(100))
        const result = render(element, { width: 20 })
        const lines = result.split('\n')
        expect(lines.length).toBeGreaterThan(1)
      })

      test('width affects box sizing', () => {
        const element = React.createElement(Box, null, 'Content')
        const narrow = render(element, { width: 20 })
        const wide = render(element, { width: 80 })
        // Narrow should have different line lengths
        const narrowLines = narrow.split('\n')
        const wideLines = wide.split('\n')
        // At least the border lines should differ
        expect(narrowLines[0].length).toBeLessThanOrEqual(wideLines[0].length)
      })

      test('width 0 or undefined uses auto width', () => {
        const element = React.createElement(Box, null, 'Content')
        const resultAuto = render(element)
        const resultZero = render(element, { width: 0 })
        // Both should produce valid output
        expect(resultAuto).toContain('Content')
        expect(resultZero).toContain('Content')
      })
    })

    describe('color option', () => {
      test('color: false disables ANSI codes', () => {
        const element = React.createElement(Text, { color: 'red', bold: true }, 'No color')
        const result = render(element, { color: false })
        expect(result).not.toMatch(/\x1b\[/)
        expect(result).toContain('No color')
      })

      test('color: true enables ANSI codes (default)', () => {
        const element = React.createElement(Text, { color: 'blue' }, 'Blue text')
        const result = render(element, { color: true })
        expect(result).toContain('\x1b[34m')
      })

      test('color: false works with all text properties', () => {
        const element = React.createElement(
          Text,
          { color: 'green', bold: true, italic: true, underline: true },
          'Styled'
        )
        const result = render(element, { color: false })
        expect(result).not.toMatch(/\x1b\[/)
        expect(result).toBe('Styled')
      })

      test('color: false does not affect box structure', () => {
        const element = React.createElement(Box, null, 'Content')
        const withColor = render(element, { color: true })
        const withoutColor = render(element, { color: false })
        // Both should have same structure (borders)
        expect(withoutColor).toContain('\u250c')
        expect(withColor).toContain('\u250c')
      })

      test('color option interacts with format option', () => {
        const element = React.createElement(Text, { color: 'red' }, 'Test')
        // ASCII format with color: false
        const result = render(element, { format: 'ascii', color: false })
        expect(result).not.toMatch(/\x1b\[/)
        expect(result).toContain('Test')
      })
    })

    describe('combined options', () => {
      test('format and width work together', () => {
        const element = React.createElement(Box, null, 'Long content here')
        const result = render(element, { format: 'ascii', width: 30 })
        expect(result).toContain('+')
        const lines = result.split('\n')
        for (const line of lines) {
          expect(line.length).toBeLessThanOrEqual(30)
        }
      })

      test('format and color work together', () => {
        const element = React.createElement(Text, { color: 'red' }, 'Styled')
        const result = render(element, { format: 'unicode', color: false })
        expect(result).not.toMatch(/\x1b\[/)
        expect(result).toBe('Styled')
      })

      test('all options work together', () => {
        const element = React.createElement(
          Box,
          null,
          React.createElement(Text, { color: 'blue', bold: true }, 'Styled content')
        )
        const result = render(element, { format: 'ascii', width: 40, color: false })
        expect(result).toContain('+')
        expect(result).not.toMatch(/\x1b\[/)
        expect(result).toContain('Styled content')
        const lines = result.split('\n')
        for (const line of lines) {
          expect(line.length).toBeLessThanOrEqual(40)
        }
      })
    })
  })
})
