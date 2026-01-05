/**
 * Mermaid State Parser Tests
 */

import { describe, it, expect } from 'bun:test'
import { parseMermaidState, stateToSelectField } from '../../src/parsers/mermaid-state'

describe('Mermaid State Parser', () => {
  describe('basic state parsing', () => {
    it('should parse simple states', () => {
      const input = `
stateDiagram-v2
  [*] --> Draft
  Draft --> Published
  Published --> Archived
`
      const result = parseMermaidState(input)

      expect(result.success).toBe(true)
      expect(result.states).toContain('Draft')
      expect(result.states).toContain('Published')
      expect(result.states).toContain('Archived')
    })

    it('should exclude start/end markers from states', () => {
      const input = `
stateDiagram-v2
  [*] --> Open
  Open --> Closed
  Closed --> [*]
`
      const result = parseMermaidState(input)

      expect(result.states).not.toContain('[*]')
      expect(result.states).toHaveLength(2)
    })

    it('should parse state with description', () => {
      const input = `
stateDiagram-v2
  Draft: Article is being written
  Published: Article is live
`
      const result = parseMermaidState(input)

      expect(result.success).toBe(true)
      expect(result.states).toContain('Draft')
      expect(result.states).toContain('Published')
    })
  })

  describe('transition parsing', () => {
    it('should parse transitions between states', () => {
      const input = `
stateDiagram-v2
  Open --> InProgress
  InProgress --> Done
`
      const result = parseMermaidState(input)

      expect(result.transitions).toBeDefined()
      expect(result.transitions).toContainEqual({ from: 'Open', to: 'InProgress' })
      expect(result.transitions).toContainEqual({ from: 'InProgress', to: 'Done' })
    })

    it('should parse transition labels', () => {
      const input = `
stateDiagram-v2
  Open --> InProgress: start work
  InProgress --> Done: complete
`
      const result = parseMermaidState(input)

      expect(result.transitions).toContainEqual({
        from: 'Open',
        to: 'InProgress',
        label: 'start work',
      })
    })

    it('should parse bidirectional transitions', () => {
      const input = `
stateDiagram-v2
  Open --> InProgress
  InProgress --> Open: reopen
`
      const result = parseMermaidState(input)

      expect(result.transitions).toContainEqual({ from: 'Open', to: 'InProgress' })
      expect(result.transitions).toContainEqual({ from: 'InProgress', to: 'Open', label: 'reopen' })
    })
  })

  describe('select field conversion', () => {
    it('should convert states to select field values', () => {
      const input = `
stateDiagram-v2
  [*] --> Open
  Open --> InProgress
  InProgress --> Done
  Done --> [*]
`
      const result = parseMermaidState(input)
      const selectField = stateToSelectField(result, 'status')

      expect(selectField).toBeDefined()
      expect(selectField?.name).toBe('status')
      expect(selectField?.values).toContain('Open')
      expect(selectField?.values).toContain('InProgress')
      expect(selectField?.values).toContain('Done')
    })

    it('should set first state as default', () => {
      const input = `
stateDiagram-v2
  [*] --> Draft
  Draft --> Published
`
      const result = parseMermaidState(input)
      const selectField = stateToSelectField(result, 'status')

      expect(selectField?.default).toBe('Draft')
    })

    it('should preserve state order', () => {
      const input = `
stateDiagram-v2
  [*] --> New
  New --> Active
  Active --> Pending
  Pending --> Closed
`
      const result = parseMermaidState(input)
      const selectField = stateToSelectField(result, 'status')

      expect(selectField?.values).toEqual(['New', 'Active', 'Pending', 'Closed'])
    })
  })

  describe('composite states', () => {
    it('should parse nested states', () => {
      const input = `
stateDiagram-v2
  [*] --> Active
  state Active {
    [*] --> Running
    Running --> Paused
    Paused --> Running
  }
  Active --> Completed
`
      const result = parseMermaidState(input)

      expect(result.success).toBe(true)
      // Should flatten nested states with dot notation
      expect(result.states).toContain('Active')
      expect(result.states).toContain('Active.Running')
      expect(result.states).toContain('Active.Paused')
    })
  })

  describe('choice/fork states', () => {
    it('should handle choice pseudo-state', () => {
      const input = `
stateDiagram-v2
  [*] --> New
  New --> Review
  state choice <<choice>>
  Review --> choice
  choice --> Approved: accepted
  choice --> Rejected: denied
`
      const result = parseMermaidState(input)

      expect(result.states).toContain('Approved')
      expect(result.states).toContain('Rejected')
      expect(result.states).not.toContain('choice')
    })

    it('should handle fork/join', () => {
      const input = `
stateDiagram-v2
  [*] --> Start
  state fork <<fork>>
  Start --> fork
  fork --> Task1
  fork --> Task2
  state join <<join>>
  Task1 --> join
  Task2 --> join
  join --> Done
`
      const result = parseMermaidState(input)

      expect(result.states).toContain('Task1')
      expect(result.states).toContain('Task2')
      expect(result.states).toContain('Done')
    })
  })

  describe('notes and comments', () => {
    it('should ignore notes', () => {
      const input = `
stateDiagram-v2
  [*] --> Open
  note right of Open
    This is a note
  end note
  Open --> Closed
`
      const result = parseMermaidState(input)

      expect(result.success).toBe(true)
      expect(result.states).toEqual(['Open', 'Closed'])
    })

    it('should ignore comments', () => {
      const input = `
stateDiagram-v2
  %% This is a comment
  [*] --> Open
  Open --> Closed %% inline comment
`
      const result = parseMermaidState(input)

      expect(result.success).toBe(true)
      expect(result.states).toEqual(['Open', 'Closed'])
    })
  })

  describe('error handling', () => {
    it('should report error for invalid syntax', () => {
      const input = `
stateDiagram-v2
  invalid --> @@@ syntax
`
      const result = parseMermaidState(input)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should handle empty input', () => {
      const result = parseMermaidState('')

      expect(result.success).toBe(false)
    })

    it('should handle missing stateDiagram directive', () => {
      const input = `
  Open --> Closed
`
      const result = parseMermaidState(input)

      expect(result.success).toBe(false)
    })
  })

  describe('state naming conventions', () => {
    it('should handle PascalCase states', () => {
      const input = `
stateDiagram-v2
  [*] --> NewRequest
  NewRequest --> InReview
  InReview --> Approved
`
      const result = parseMermaidState(input)

      expect(result.states).toContain('NewRequest')
      expect(result.states).toContain('InReview')
    })

    it('should handle snake_case states', () => {
      const input = `
stateDiagram-v2
  [*] --> new_request
  new_request --> in_review
`
      const result = parseMermaidState(input)

      expect(result.states).toContain('new_request')
    })

    it('should handle kebab-case states', () => {
      const input = `
stateDiagram-v2
  [*] --> new-request
  new-request --> in-review
`
      const result = parseMermaidState(input)

      expect(result.states).toContain('new-request')
    })
  })

  describe('real-world examples', () => {
    it('should parse issue tracking states', () => {
      const input = `
stateDiagram-v2
  [*] --> Open
  Open --> InProgress: assign
  InProgress --> Review: submit
  Review --> Open: request changes
  Review --> Closed: approve
  InProgress --> Closed: won't fix
  Closed --> Open: reopen
  Closed --> [*]
`
      const result = parseMermaidState(input)
      const selectField = stateToSelectField(result, 'status')

      expect(result.success).toBe(true)
      expect(selectField?.values).toContain('Open')
      expect(selectField?.values).toContain('InProgress')
      expect(selectField?.values).toContain('Review')
      expect(selectField?.values).toContain('Closed')
    })

    it('should parse order status states', () => {
      const input = `
stateDiagram-v2
  [*] --> Pending
  Pending --> Processing: payment received
  Processing --> Shipped: dispatched
  Shipped --> Delivered: confirmed
  Delivered --> [*]
  Pending --> Cancelled: customer request
  Processing --> Cancelled: out of stock
  Cancelled --> [*]
`
      const result = parseMermaidState(input)

      expect(result.success).toBe(true)
      expect(result.states).toContain('Pending')
      expect(result.states).toContain('Processing')
      expect(result.states).toContain('Shipped')
      expect(result.states).toContain('Delivered')
      expect(result.states).toContain('Cancelled')
    })
  })
})
