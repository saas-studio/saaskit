/**
 * Mermaid ER Parser Tests
 */

import { describe, it, expect } from 'bun:test'
import { parseMermaidER } from '../../src/parsers/mermaid-er'

describe('Mermaid ER Parser', () => {
  describe('basic entity parsing', () => {
    it('should parse a simple entity', () => {
      const input = `
erDiagram
  User {
    string name
    string email
  }
`
      const result = parseMermaidER(input)

      expect(result.success).toBe(true)
      expect(result.ast?.resources).toHaveLength(1)
      expect(result.ast?.resources[0].name).toBe('User')
    })

    it('should parse multiple entities', () => {
      const input = `
erDiagram
  User {
    string name
  }
  Post {
    string title
  }
`
      const result = parseMermaidER(input)

      expect(result.success).toBe(true)
      expect(result.ast?.resources).toHaveLength(2)
    })

    it('should parse entity with no fields', () => {
      const input = `
erDiagram
  EmptyEntity {
  }
`
      const result = parseMermaidER(input)

      expect(result.success).toBe(true)
      expect(result.ast?.resources[0].fields).toHaveLength(0)
    })
  })

  describe('field type parsing', () => {
    it('should parse string fields', () => {
      const input = `
erDiagram
  User {
    string name
  }
`
      const result = parseMermaidER(input)
      const field = result.ast?.resources[0].fields[0]

      expect(field?.type).toBe('text')
    })

    it('should parse number fields', () => {
      const input = `
erDiagram
  Product {
    int quantity
    float price
  }
`
      const result = parseMermaidER(input)
      const fields = result.ast?.resources[0].fields

      expect(fields?.[0].type).toBe('number')
      expect(fields?.[1].type).toBe('number')
      expect(fields?.[1].modifiers.decimal).toBe(true)
    })

    it('should parse boolean fields', () => {
      const input = `
erDiagram
  Task {
    boolean done
  }
`
      const result = parseMermaidER(input)
      const field = result.ast?.resources[0].fields[0]

      expect(field?.type).toBe('boolean')
    })

    it('should parse date fields', () => {
      const input = `
erDiagram
  Event {
    date startDate
    datetime createdAt
  }
`
      const result = parseMermaidER(input)
      const fields = result.ast?.resources[0].fields

      expect(fields?.[0].type).toBe('date')
      expect(fields?.[1].type).toBe('date')
    })
  })

  describe('field modifiers', () => {
    it('should parse PK (primary key) modifier', () => {
      const input = `
erDiagram
  User {
    string id PK
    string name
  }
`
      const result = parseMermaidER(input)
      const idField = result.ast?.resources[0].fields[0]

      expect(idField?.modifiers.primary).toBe(true)
    })

    it('should parse FK (foreign key) as relation', () => {
      const input = `
erDiagram
  Post {
    string title
    string userId FK
  }
`
      const result = parseMermaidER(input)
      const userIdField = result.ast?.resources[0].fields[1]

      expect(userIdField?.type).toBe('relation')
    })

    it('should parse UK (unique key) modifier', () => {
      const input = `
erDiagram
  User {
    string email UK
  }
`
      const result = parseMermaidER(input)
      const field = result.ast?.resources[0].fields[0]

      expect(field?.modifiers.unique).toBe(true)
    })
  })

  describe('relationship parsing', () => {
    it('should parse one-to-many relationship', () => {
      const input = `
erDiagram
  User ||--o{ Post : writes
`
      const result = parseMermaidER(input)

      // Should create both entities with proper relationship
      expect(result.success).toBe(true)
    })

    it('should parse many-to-many relationship', () => {
      const input = `
erDiagram
  Student }o--o{ Course : enrolls
`
      const result = parseMermaidER(input)

      expect(result.success).toBe(true)
    })

    it('should parse one-to-one relationship', () => {
      const input = `
erDiagram
  User ||--|| Profile : has
`
      const result = parseMermaidER(input)

      expect(result.success).toBe(true)
    })

    it('should infer relation fields from relationships', () => {
      const input = `
erDiagram
  User {
    string name
  }
  Post {
    string title
  }
  User ||--o{ Post : writes
`
      const result = parseMermaidER(input)
      const postResource = result.ast?.resources.find((r) => r.name === 'Post')

      // Post should have a userId relation field
      const relationField = postResource?.fields.find((f) => f.type === 'relation')
      expect(relationField).toBeDefined()
      expect(relationField?.target).toBe('User')
    })
  })

  describe('comments and whitespace', () => {
    it('should ignore comments', () => {
      const input = `
erDiagram
  %% This is a comment
  User {
    string name %% inline comment
  }
`
      const result = parseMermaidER(input)

      expect(result.success).toBe(true)
      expect(result.ast?.resources[0].fields).toHaveLength(1)
    })

    it('should handle various whitespace', () => {
      const input = `
erDiagram
    User {
        string    name
    }
`
      const result = parseMermaidER(input)

      expect(result.success).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should report error for invalid syntax', () => {
      const input = `
erDiagram
  User {
    !!!invalid
  }
`
      const result = parseMermaidER(input)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
    })

    it('should report line numbers in errors', () => {
      const input = `
erDiagram
  User {
    string valid
    bad-field
  }
`
      const result = parseMermaidER(input)

      expect(result.success).toBe(false)
      expect(result.errors?.[0].line).toBeDefined()
    })

    it('should handle empty input', () => {
      const result = parseMermaidER('')

      expect(result.success).toBe(false)
    })

    it('should handle missing erDiagram directive', () => {
      const input = `
  User {
    string name
  }
`
      const result = parseMermaidER(input)

      expect(result.success).toBe(false)
    })
  })

  describe('app configuration', () => {
    it('should use provided app name', () => {
      const input = `
erDiagram
  User {
    string name
  }
`
      const result = parseMermaidER(input, 'my-crm')

      expect(result.ast?.name).toBe('my-crm')
    })

    it('should normalize app name', () => {
      const input = `
erDiagram
  User {
    string name
  }
`
      const result = parseMermaidER(input, 'My CRM App')

      expect(result.ast?.name).toBe('my-crm-app')
    })
  })

  describe('complex diagrams', () => {
    it('should parse a full CRM schema', () => {
      const input = `
erDiagram
  User {
    string id PK
    string name
    string email UK
    datetime createdAt
  }
  Contact {
    string id PK
    string name
    string email
    string phone
    string userId FK
  }
  Deal {
    string id PK
    string title
    float value
    string status
    string contactId FK
    string ownerId FK
  }
  User ||--o{ Contact : manages
  User ||--o{ Deal : owns
  Contact ||--o{ Deal : has
`
      const result = parseMermaidER(input, 'crm')

      expect(result.success).toBe(true)
      expect(result.ast?.resources).toHaveLength(3)

      // Verify User
      const user = result.ast?.resources.find((r) => r.name === 'User')
      expect(user?.fields.some((f) => f.name === 'name')).toBe(true)
      expect(user?.fields.some((f) => f.modifiers.unique)).toBe(true)

      // Verify Contact has relation to User
      const contact = result.ast?.resources.find((r) => r.name === 'Contact')
      expect(contact?.fields.some((f) => f.type === 'relation')).toBe(true)

      // Verify Deal has multiple relations
      const deal = result.ast?.resources.find((r) => r.name === 'Deal')
      const relationFields = deal?.fields.filter((f) => f.type === 'relation')
      expect(relationFields?.length).toBeGreaterThanOrEqual(2)
    })
  })
})
