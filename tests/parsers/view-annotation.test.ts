/**
 * View Annotation Parser Tests
 */

import { describe, it, expect } from 'bun:test'
import { parseViewAnnotations } from '../../src/parsers/view-annotation'

describe('View Annotation Parser', () => {
  describe('view definition', () => {
    it('should parse basic view annotation', () => {
      const input = `
@view("list", fields: ["name", "email"])
Resource User {
  name: Text
  email: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.success).toBe(true)
      expect(result.views).toHaveLength(1)
      expect(result.views?.[0].type).toBe('list')
      expect(result.views?.[0].fields).toEqual(['name', 'email'])
    })

    it('should parse multiple view annotations', () => {
      const input = `
@view("list", fields: ["name"])
@view("detail", fields: ["name", "email", "bio"])
Resource User {
  name: Text
  email: Text
  bio: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.views).toHaveLength(2)
      expect(result.views?.[0].type).toBe('list')
      expect(result.views?.[1].type).toBe('detail')
    })

    it('should parse named views', () => {
      const input = `
@view("list", name: "UserDirectory")
Resource User {
  name: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.views?.[0].name).toBe('UserDirectory')
    })
  })

  describe('view configuration', () => {
    it('should parse sortBy configuration', () => {
      const input = `
@view("list", sortBy: "createdAt", sortDirection: "desc")
Resource Post {
  title: Text
  createdAt: Date
}
`
      const result = parseViewAnnotations(input)

      expect(result.views?.[0].sortBy).toBe('createdAt')
      expect(result.views?.[0].sortDirection).toBe('desc')
    })

    it('should parse groupBy configuration', () => {
      const input = `
@view("list", groupBy: "category")
Resource Post {
  title: Text
  category: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.views?.[0].groupBy).toBe('category')
    })

    it('should parse layout configuration', () => {
      const input = `
@view("form", layout: "horizontal", columns: 2)
Resource User {
  name: Text
  email: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.views?.[0].layout).toBe('horizontal')
      expect(result.views?.[0].columns).toBe(2)
    })

    it('should parse filter configuration', () => {
      const input = `
@view("list", filters: [{ field: "status", operator: "eq", value: "active" }])
Resource User {
  name: Text
  status: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.views?.[0].filters).toHaveLength(1)
      expect(result.views?.[0].filters?.[0]).toEqual({
        field: 'status',
        operator: 'eq',
        value: 'active',
      })
    })
  })

  describe('field annotations', () => {
    it('should parse field label annotation', () => {
      const input = `
Resource User {
  @label("Full Name")
  name: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.fieldConfigs?.name?.label).toBe('Full Name')
    })

    it('should parse field placeholder annotation', () => {
      const input = `
Resource User {
  @placeholder("Enter your email address")
  email: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.fieldConfigs?.email?.placeholder).toBe('Enter your email address')
    })

    it('should parse hidden field annotation', () => {
      const input = `
Resource User {
  @hidden
  password: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.fieldConfigs?.password?.hidden).toBe(true)
    })

    it('should parse readonly field annotation', () => {
      const input = `
Resource User {
  @readonly
  createdAt: Date
}
`
      const result = parseViewAnnotations(input)

      expect(result.fieldConfigs?.createdAt?.readonly).toBe(true)
    })

    it('should parse width annotation', () => {
      const input = `
Resource User {
  @width(200)
  name: Text
  @width("50%")
  bio: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.fieldConfigs?.name?.width).toBe(200)
      expect(result.fieldConfigs?.bio?.width).toBe('50%')
    })

    it('should parse format annotation', () => {
      const input = `
Resource Transaction {
  @format("currency")
  amount: Number
  @format("percent")
  rate: Number
}
`
      const result = parseViewAnnotations(input)

      expect(result.fieldConfigs?.amount?.format).toBe('currency')
      expect(result.fieldConfigs?.rate?.format).toBe('percent')
    })

    it('should parse component annotation', () => {
      const input = `
Resource Post {
  @component("RichTextEditor")
  content: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.fieldConfigs?.content?.component).toBe('RichTextEditor')
    })
  })

  describe('combined annotations', () => {
    it('should parse multiple field annotations', () => {
      const input = `
Resource User {
  @label("Email Address")
  @placeholder("user@example.com")
  @readonly
  email: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.fieldConfigs?.email?.label).toBe('Email Address')
      expect(result.fieldConfigs?.email?.placeholder).toBe('user@example.com')
      expect(result.fieldConfigs?.email?.readonly).toBe(true)
    })

    it('should parse view and field annotations together', () => {
      const input = `
@view("form", layout: "vertical")
Resource User {
  @label("Full Name")
  @placeholder("John Doe")
  name: Text

  @label("Email Address")
  email: Text

  @hidden
  password: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.views).toHaveLength(1)
      expect(result.fieldConfigs?.name?.label).toBe('Full Name')
      expect(result.fieldConfigs?.password?.hidden).toBe(true)
    })
  })

  describe('annotation syntax variations', () => {
    it('should parse single-line annotations', () => {
      const input = `@view("list") Resource User { name: Text }`
      const result = parseViewAnnotations(input)

      expect(result.success).toBe(true)
    })

    it('should parse annotations with trailing comma', () => {
      const input = `
@view("list", fields: ["name", "email",])
Resource User {
  name: Text
  email: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.success).toBe(true)
    })

    it('should parse annotations with single quotes', () => {
      const input = `
@view('list', fields: ['name', 'email'])
Resource User {
  name: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.success).toBe(true)
      expect(result.views?.[0].type).toBe('list')
    })
  })

  describe('error handling', () => {
    it('should report error for invalid annotation syntax', () => {
      const input = `
@view("invalid
Resource User {
  name: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should report error for unknown annotation', () => {
      const input = `
@unknownAnnotation
Resource User {
  name: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.success).toBe(false)
    })

    it('should report error for invalid view type', () => {
      const input = `
@view("invalid-type")
Resource User {
  name: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.success).toBe(false)
    })

    it('should report line numbers in errors', () => {
      const input = `
@view("list")
@badAnnotation
Resource User {
  name: Text
}
`
      const result = parseViewAnnotations(input)

      expect(result.errors?.[0].line).toBe(3)
    })
  })

  describe('real-world examples', () => {
    it('should parse a complete user resource with views', () => {
      const input = `
@view("list", name: "UserDirectory", fields: ["name", "email", "role"], sortBy: "name")
@view("form", name: "UserForm", layout: "vertical", columns: 1)
@view("detail", name: "UserProfile")
Resource User {
  @label("Full Name")
  @placeholder("Enter full name")
  name: Text

  @label("Email Address")
  @placeholder("user@example.com")
  email: Text

  @label("Role")
  role: Select("admin", "user", "guest")

  @hidden
  @readonly
  passwordHash: Text

  @readonly
  @format("datetime")
  createdAt: Date
}
`
      const result = parseViewAnnotations(input)

      expect(result.success).toBe(true)
      expect(result.views).toHaveLength(3)
      expect(result.fieldConfigs?.name?.label).toBe('Full Name')
      expect(result.fieldConfigs?.passwordHash?.hidden).toBe(true)
      expect(result.fieldConfigs?.createdAt?.format).toBe('datetime')
    })

    it('should parse a task management resource', () => {
      const input = `
@view("list",
  name: "TaskBoard",
  groupBy: "status",
  sortBy: "priority",
  sortDirection: "asc",
  filters: [{ field: "assignee", operator: "eq" }]
)
@view("card", name: "TaskCard", fields: ["title", "status", "priority"])
Resource Task {
  @label("Title")
  title: Text

  @label("Status")
  status: Select("todo", "in_progress", "done")

  @label("Priority")
  @format("badge")
  priority: Select("low", "medium", "high")

  @label("Assigned To")
  @component("UserSelect")
  assignee: Relation(User)

  @hidden
  @readonly
  completedAt: Date
}
`
      const result = parseViewAnnotations(input)

      expect(result.success).toBe(true)
      expect(result.views?.find((v) => v.name === 'TaskBoard')?.groupBy).toBe('status')
      expect(result.fieldConfigs?.priority?.format).toBe('badge')
    })
  })
})
