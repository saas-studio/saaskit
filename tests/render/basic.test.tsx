import { describe, expect, test } from 'bun:test'
import React from 'react'
import { render } from '../../src/render'
import { Text } from '../../src/components/Text'
import { Box } from '../../src/components/Box'

describe('Terminal Rendering - Basic', () => {
  describe('render() function', () => {
    test('render() function exists and returns string', () => {
      const element = React.createElement('div')
      const result = render(element)
      expect(typeof result).toBe('string')
    })

    test('render() accepts React elements', () => {
      const element = React.createElement('span', null, 'test')
      expect(() => render(element)).not.toThrow()
      const result = render(element)
      expect(result).toBeDefined()
    })
  })

  describe('Text component', () => {
    test('Text component renders text content', () => {
      const element = React.createElement(Text, null, 'Hello, World!')
      const result = render(element)
      expect(result).toContain('Hello, World!')
    })

    test('Text component renders empty string for no children', () => {
      const element = React.createElement(Text)
      const result = render(element)
      expect(typeof result).toBe('string')
    })

    test('Text component renders multiple children', () => {
      const element = React.createElement(Text, null, 'Hello', ' ', 'World')
      const result = render(element)
      expect(result).toContain('Hello')
      expect(result).toContain('World')
    })
  })

  describe('Box component', () => {
    test('Box component creates bordered container', () => {
      const element = React.createElement(Box, null, 'Content')
      const result = render(element)
      // Should contain border characters (single style by default)
      expect(result).toMatch(/[┌┐└┘│─]/)
    })

    test('Box component contains its children', () => {
      const element = React.createElement(Box, null, 'Inside the box')
      const result = render(element)
      expect(result).toContain('Inside the box')
    })

    test('Box component with nested Text', () => {
      const element = React.createElement(
        Box,
        null,
        React.createElement(Text, null, 'Nested text')
      )
      const result = render(element)
      expect(result).toContain('Nested text')
    })

    test('Box component renders without children', () => {
      const element = React.createElement(Box)
      const result = render(element)
      // Should still have border characters
      expect(result).toMatch(/[┌┐└┘│─]/)
    })
  })
})
