import { describe, expect, test } from 'bun:test'
import React from 'react'
import { render } from '../../src/render'
import { Text } from '../../src/components/Text'
import { Box } from '../../src/components/Box'

describe('Terminal Rendering - Layout', () => {
  describe('Box flexDirection', () => {
    test('Box supports flexDirection row', () => {
      const element = React.createElement(
        Box,
        { flexDirection: 'row' },
        React.createElement(Text, null, 'Left'),
        React.createElement(Text, null, 'Right')
      )
      const result = render(element)
      // In row layout, items should be on the same line
      const lines = result.split('\n')
      const contentLine = lines.find(
        (line) => line.includes('Left') && line.includes('Right')
      )
      expect(contentLine).toBeDefined()
    })

    test('Box supports flexDirection column', () => {
      const element = React.createElement(
        Box,
        { flexDirection: 'column' },
        React.createElement(Text, null, 'Top'),
        React.createElement(Text, null, 'Bottom')
      )
      const result = render(element)
      // In column layout, items should be on different lines
      const topIndex = result.indexOf('Top')
      const bottomIndex = result.indexOf('Bottom')
      expect(topIndex).toBeLessThan(bottomIndex)
      // There should be a newline between them
      const between = result.slice(topIndex, bottomIndex)
      expect(between).toContain('\n')
    })

    test('Box defaults to column flexDirection', () => {
      const element = React.createElement(
        Box,
        null,
        React.createElement(Text, null, 'First'),
        React.createElement(Text, null, 'Second')
      )
      const result = render(element)
      // Default should be column (stacked vertically)
      const firstIndex = result.indexOf('First')
      const secondIndex = result.indexOf('Second')
      expect(firstIndex).toBeLessThan(secondIndex)
    })
  })

  describe('Box padding', () => {
    test('Box supports padding prop (number)', () => {
      const element = React.createElement(Box, { padding: 1 }, 'Padded content')
      const result = render(element)
      // Content should be offset from the border by padding spaces
      const lines = result.split('\n')
      const contentLine = lines.find((line) => line.includes('Padded content'))
      expect(contentLine).toBeDefined()
      // There should be space between border and content
      if (contentLine) {
        expect(contentLine).toMatch(/│\s+Padded content\s+│/)
      }
    })

    test('Box supports paddingX and paddingY', () => {
      const element = React.createElement(
        Box,
        { paddingX: 2, paddingY: 1 },
        'XY Padded'
      )
      const result = render(element)
      const lines = result.split('\n')
      // Should have extra blank lines for paddingY
      expect(lines.length).toBeGreaterThan(3) // top border + padding + content + padding + bottom border
    })

    test('Box supports individual padding (top, right, bottom, left)', () => {
      const element = React.createElement(
        Box,
        { paddingTop: 1, paddingRight: 2, paddingBottom: 1, paddingLeft: 2 },
        'Custom padding'
      )
      const result = render(element)
      expect(result).toContain('Custom padding')
      // Content line should have appropriate spacing
      const lines = result.split('\n')
      const contentLine = lines.find((line) => line.includes('Custom padding'))
      expect(contentLine).toBeDefined()
    })
  })

  describe('Box margin', () => {
    test('Box supports margin prop (number)', () => {
      const element = React.createElement(Box, { margin: 1 }, 'Margined content')
      const result = render(element)
      // Margin adds space outside the box
      const lines = result.split('\n')
      // First line should be empty (margin) or the result should start with whitespace
      expect(lines[0]).toMatch(/^\s*$|^\s/)
    })

    test('Box supports marginX and marginY', () => {
      const element = React.createElement(
        Box,
        { marginX: 2, marginY: 1 },
        'XY Margin'
      )
      const result = render(element)
      expect(result).toContain('XY Margin')
      // Should have leading/trailing whitespace lines
      const lines = result.split('\n')
      expect(lines.length).toBeGreaterThan(3)
    })

    test('Box supports individual margin (top, right, bottom, left)', () => {
      const element = React.createElement(
        Box,
        { marginTop: 1, marginRight: 2, marginBottom: 1, marginLeft: 2 },
        'Custom margin'
      )
      const result = render(element)
      expect(result).toContain('Custom margin')
    })
  })

  describe('Nested boxes layout', () => {
    test('Nested boxes render correctly', () => {
      const element = React.createElement(
        Box,
        { borderStyle: 'single' },
        React.createElement(
          Box,
          { borderStyle: 'single' },
          React.createElement(Text, null, 'Inner content')
        )
      )
      const result = render(element)
      expect(result).toContain('Inner content')
      // Should have multiple box corners (outer and inner)
      const corners = result.match(/\u250c/g) || []
      expect(corners.length).toBeGreaterThanOrEqual(2)
    })

    test('Multiple nested boxes with different border styles', () => {
      const element = React.createElement(
        Box,
        { borderStyle: 'double' },
        React.createElement(
          Box,
          { borderStyle: 'single' },
          React.createElement(Text, null, 'Nested')
        )
      )
      const result = render(element)
      expect(result).toContain('Nested')
      // Should contain both double and single border characters
      expect(result).toContain('\u2554') // double top-left
      expect(result).toContain('\u250c') // single top-left
    })

    test('Nested boxes with row layout', () => {
      const element = React.createElement(
        Box,
        { flexDirection: 'row' },
        React.createElement(Box, null, React.createElement(Text, null, 'Box 1')),
        React.createElement(Box, null, React.createElement(Text, null, 'Box 2'))
      )
      const result = render(element)
      expect(result).toContain('Box 1')
      expect(result).toContain('Box 2')
    })

    test('Deeply nested structure', () => {
      const element = React.createElement(
        Box,
        { borderStyle: 'rounded' },
        React.createElement(
          Box,
          { padding: 1 },
          React.createElement(
            Box,
            { borderStyle: 'single' },
            React.createElement(Text, { bold: true }, 'Deep content')
          )
        )
      )
      const result = render(element)
      expect(result).toContain('Deep content')
      // Rounded outer border
      expect(result).toContain('\u256d')
      // Single inner border
      expect(result).toContain('\u250c')
    })
  })
})
