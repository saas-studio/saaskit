import { describe, expect, test } from 'bun:test'
import React from 'react'
import { render } from '../../src/render'
import { Text } from '../../src/components/Text'
import { Box } from '../../src/components/Box'

describe('Terminal Rendering - Styling', () => {
  describe('Text color support', () => {
    test('Text supports color prop red', () => {
      const element = React.createElement(Text, { color: 'red' }, 'Red text')
      const result = render(element)
      // ANSI escape code for red: \x1b[31m
      expect(result).toContain('\x1b[31m')
      expect(result).toContain('Red text')
    })

    test('Text supports color prop green', () => {
      const element = React.createElement(Text, { color: 'green' }, 'Green text')
      const result = render(element)
      // ANSI escape code for green: \x1b[32m
      expect(result).toContain('\x1b[32m')
      expect(result).toContain('Green text')
    })

    test('Text supports color prop blue', () => {
      const element = React.createElement(Text, { color: 'blue' }, 'Blue text')
      const result = render(element)
      // ANSI escape code for blue: \x1b[34m
      expect(result).toContain('\x1b[34m')
      expect(result).toContain('Blue text')
    })

    test('Text supports color prop yellow', () => {
      const element = React.createElement(Text, { color: 'yellow' }, 'Yellow text')
      const result = render(element)
      // ANSI escape code for yellow: \x1b[33m
      expect(result).toContain('\x1b[33m')
      expect(result).toContain('Yellow text')
    })

    test('Text supports color prop cyan', () => {
      const element = React.createElement(Text, { color: 'cyan' }, 'Cyan text')
      const result = render(element)
      // ANSI escape code for cyan: \x1b[36m
      expect(result).toContain('\x1b[36m')
      expect(result).toContain('Cyan text')
    })

    test('Text supports color prop magenta', () => {
      const element = React.createElement(Text, { color: 'magenta' }, 'Magenta text')
      const result = render(element)
      // ANSI escape code for magenta: \x1b[35m
      expect(result).toContain('\x1b[35m')
      expect(result).toContain('Magenta text')
    })

    test('Text resets color after styled text', () => {
      const element = React.createElement(Text, { color: 'red' }, 'Red text')
      const result = render(element)
      // ANSI reset code: \x1b[0m or \x1b[39m
      expect(result).toMatch(/\x1b\[(0|39)m/)
    })
  })

  describe('Text formatting support', () => {
    test('Text supports bold prop', () => {
      const element = React.createElement(Text, { bold: true }, 'Bold text')
      const result = render(element)
      // ANSI escape code for bold: \x1b[1m
      expect(result).toContain('\x1b[1m')
      expect(result).toContain('Bold text')
    })

    test('Text supports italic prop', () => {
      const element = React.createElement(Text, { italic: true }, 'Italic text')
      const result = render(element)
      // ANSI escape code for italic: \x1b[3m
      expect(result).toContain('\x1b[3m')
      expect(result).toContain('Italic text')
    })

    test('Text supports underline prop', () => {
      const element = React.createElement(Text, { underline: true }, 'Underlined text')
      const result = render(element)
      // ANSI escape code for underline: \x1b[4m
      expect(result).toContain('\x1b[4m')
      expect(result).toContain('Underlined text')
    })

    test('Text supports combined styling (bold + color)', () => {
      const element = React.createElement(
        Text,
        { bold: true, color: 'red' },
        'Bold red text'
      )
      const result = render(element)
      expect(result).toContain('\x1b[1m') // bold
      expect(result).toContain('\x1b[31m') // red
      expect(result).toContain('Bold red text')
    })

    test('Text supports all formatting combined', () => {
      const element = React.createElement(
        Text,
        { bold: true, italic: true, underline: true, color: 'green' },
        'All styles'
      )
      const result = render(element)
      expect(result).toContain('\x1b[1m') // bold
      expect(result).toContain('\x1b[3m') // italic
      expect(result).toContain('\x1b[4m') // underline
      expect(result).toContain('\x1b[32m') // green
      expect(result).toContain('All styles')
    })
  })

  describe('Box border styles', () => {
    test('Box supports borderStyle single', () => {
      const element = React.createElement(
        Box,
        { borderStyle: 'single' },
        'Single border'
      )
      const result = render(element)
      // Single line box characters
      expect(result).toContain('\u250c') // top-left corner
      expect(result).toContain('\u2510') // top-right corner
      expect(result).toContain('\u2514') // bottom-left corner
      expect(result).toContain('\u2518') // bottom-right corner
    })

    test('Box supports borderStyle double', () => {
      const element = React.createElement(
        Box,
        { borderStyle: 'double' },
        'Double border'
      )
      const result = render(element)
      // Double line box characters
      expect(result).toContain('\u2554') // top-left corner
      expect(result).toContain('\u2557') // top-right corner
      expect(result).toContain('\u255a') // bottom-left corner
      expect(result).toContain('\u255d') // bottom-right corner
    })

    test('Box supports borderStyle rounded', () => {
      const element = React.createElement(
        Box,
        { borderStyle: 'rounded' },
        'Rounded border'
      )
      const result = render(element)
      // Rounded box characters
      expect(result).toContain('\u256d') // top-left corner
      expect(result).toContain('\u256e') // top-right corner
      expect(result).toContain('\u2570') // bottom-left corner
      expect(result).toContain('\u256f') // bottom-right corner
    })

    test('Box defaults to single border style', () => {
      const element = React.createElement(Box, null, 'Default border')
      const result = render(element)
      // Should use single line box characters by default
      expect(result).toContain('\u250c') // top-left corner
    })
  })
})
