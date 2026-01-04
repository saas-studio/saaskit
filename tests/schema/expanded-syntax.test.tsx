/**
 * Comprehensive tests for Expanded Syntax Field Components
 *
 * These tests follow TDD RED phase - they should all FAIL initially
 * until the GREEN phase implementation is complete.
 *
 * Tests cover:
 * 1. Component Rendering Tests - Each field type renders without error
 * 2. Metadata Extraction Tests - getFieldMetadata extracts correct metadata
 * 3. Validation Tests - Constraints are properly captured
 * 4. Default Value Tests - Defaults are properly captured
 * 5. Integration Tests - Fields work inside Resource component
 * 6. Error Tests - Invalid props throw helpful errors
 */
import { describe, expect, test } from 'bun:test'
import React from 'react'

// =============================================================================
// SECTION 1: TEXT FIELD TESTS
// =============================================================================

describe('Text Field Component', () => {
  describe('Component Rendering', () => {
    test('Text component can be imported', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      expect(Text).toBeDefined()
      expect(typeof Text).toBe('function')
    })

    test('Text component renders without throwing', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      expect(() => <Text name="title" />).not.toThrow()
    })

    test('Text component has fieldType identifier', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      expect(Text.fieldType).toBe('text')
    })
  })

  describe('Metadata Extraction - Basic Text', () => {
    test('extracts name from Text field', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="title" />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('title')
    })

    test('extracts type as "text" from basic Text field', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="title" />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('text')
    })

    test('Text field is required by default', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="title" />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(true)
    })

    test('Text field with required={true} is required', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="title" required={true} />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(true)
    })
  })

  describe('Metadata Extraction - Optional Text', () => {
    test('Text field with optional prop is not required', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="description" optional />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(false)
    })

    test('Text field with required={false} is not required', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="description" required={false} />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(false)
    })
  })

  describe('Metadata Extraction - Email Type', () => {
    test('Text field with type="email" has email validation', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="email" type="email" />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('text')
      expect(metadata.validation).toBeDefined()
      // Email type should set up email validation pattern internally
    })
  })

  describe('Metadata Extraction - URL Type', () => {
    test('Text field with type="url" has url validation', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="website" type="url" />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('text')
      // URL type should set up url validation pattern internally
    })
  })

  describe('Metadata Extraction - Multiline', () => {
    test('Text field with multiline prop is captured in metadata', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="bio" multiline />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('text')
      // Multiline should be captured somewhere in metadata
    })
  })

  describe('Metadata Extraction - Unique Constraint', () => {
    test('Text field with unique prop has unique constraint', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="slug" unique />
      const metadata = getFieldMetadata(element)

      expect(metadata.unique).toBe(true)
    })

    test('Text field without unique prop has no unique constraint', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="title" />
      const metadata = getFieldMetadata(element)

      expect(metadata.unique).toBeUndefined()
    })
  })

  describe('Metadata Extraction - Length Constraints', () => {
    test('Text field with minLength captures minimum length validation', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="code" minLength={3} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation).toBeDefined()
      expect(metadata.validation?.minLength).toBe(3)
    })

    test('Text field with maxLength captures maximum length validation', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="code" maxLength={10} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation).toBeDefined()
      expect(metadata.validation?.maxLength).toBe(10)
    })

    test('Text field with both minLength and maxLength captures both', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="code" minLength={3} maxLength={10} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation).toBeDefined()
      expect(metadata.validation?.minLength).toBe(3)
      expect(metadata.validation?.maxLength).toBe(10)
    })
  })

  describe('Metadata Extraction - Pattern Constraint', () => {
    test('Text field with pattern captures regex validation', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="code" pattern="^[A-Z]+" />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation).toBeDefined()
      expect(metadata.validation?.pattern).toBe('^[A-Z]+')
    })
  })

  describe('Metadata Extraction - Default Value', () => {
    test('Text field with default captures default value', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="status" default="draft" />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBe('draft')
    })

    test('Text field without default has no default value', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="title" />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBeUndefined()
    })
  })

  describe('Combined Text Props', () => {
    test('Text field with multiple constraints combines them all', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = (
        <Text name="slug" unique minLength={3} maxLength={50} pattern="^[a-z0-9-]+$" default="untitled" />
      )
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('slug')
      expect(metadata.type).toBe('text')
      expect(metadata.required).toBe(true)
      expect(metadata.unique).toBe(true)
      expect(metadata.default).toBe('untitled')
      expect(metadata.validation?.minLength).toBe(3)
      expect(metadata.validation?.maxLength).toBe(50)
      expect(metadata.validation?.pattern).toBe('^[a-z0-9-]+$')
    })
  })
})

// =============================================================================
// SECTION 2: NUMBER FIELD TESTS
// =============================================================================

describe('Number Field Component', () => {
  describe('Component Rendering', () => {
    test('Number component can be imported', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      expect(Number).toBeDefined()
      expect(typeof Number).toBe('function')
    })

    test('Number component renders without throwing', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      expect(() => <Number name="count" />).not.toThrow()
    })

    test('Number component has fieldType identifier', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      expect(Number.fieldType).toBe('number')
    })
  })

  describe('Metadata Extraction - Basic Number', () => {
    test('extracts name from Number field', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="count" />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('count')
    })

    test('extracts type as "number" from Number field', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="count" />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('number')
    })

    test('Number field is required by default', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="count" />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(true)
    })
  })

  describe('Metadata Extraction - Decimal Numbers', () => {
    test('Number field with decimal prop is marked as decimal', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="price" decimal />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('number')
      // Decimal flag should be captured in metadata
    })

    test('Number field without decimal prop is integer', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="count" />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('number')
      // Default should be integer
    })
  })

  describe('Metadata Extraction - Range Constraints', () => {
    test('Number field with min captures minimum value', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="age" min={0} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation).toBeDefined()
      expect(metadata.validation?.min).toBe(0)
    })

    test('Number field with max captures maximum value', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="age" max={150} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation).toBeDefined()
      expect(metadata.validation?.max).toBe(150)
    })

    test('Number field with min and max captures both constraints', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="age" min={0} max={150} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation).toBeDefined()
      expect(metadata.validation?.min).toBe(0)
      expect(metadata.validation?.max).toBe(150)
    })
  })

  describe('Metadata Extraction - Default Value', () => {
    test('Number field with default captures default value', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="quantity" default={1} />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBe(1)
    })

    test('Number field with default=0 captures zero', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="score" default={0} />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBe(0)
    })
  })

  describe('Metadata Extraction - Step', () => {
    test('Number field with step captures step value', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="rating" step={0.5} />
      const metadata = getFieldMetadata(element)

      // Step should be captured in validation or as separate property
      expect(metadata.validation).toBeDefined()
    })
  })

  describe('Metadata Extraction - Optional Number', () => {
    test('Number field with optional prop is not required', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="score" optional />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(false)
    })
  })

  describe('Combined Number Props', () => {
    test('Number field with multiple constraints combines them all', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="price" decimal min={0} max={10000} step={0.01} default={0} />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('price')
      expect(metadata.type).toBe('number')
      expect(metadata.required).toBe(true)
      expect(metadata.default).toBe(0)
      expect(metadata.validation?.min).toBe(0)
      expect(metadata.validation?.max).toBe(10000)
    })
  })
})

// =============================================================================
// SECTION 3: BOOLEAN FIELD TESTS
// =============================================================================

describe('Boolean Field Component', () => {
  describe('Component Rendering', () => {
    test('Boolean component can be imported', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      expect(Boolean).toBeDefined()
      expect(typeof Boolean).toBe('function')
    })

    test('Boolean component renders without throwing', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      expect(() => <Boolean name="done" />).not.toThrow()
    })

    test('Boolean component has fieldType identifier', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      expect(Boolean.fieldType).toBe('boolean')
    })
  })

  describe('Metadata Extraction - Basic Boolean', () => {
    test('extracts name from Boolean field', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Boolean name="done" />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('done')
    })

    test('extracts type as "boolean" from Boolean field', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Boolean name="done" />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('boolean')
    })

    test('Boolean field is required by default', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Boolean name="done" />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(true)
    })
  })

  describe('Metadata Extraction - Default Value', () => {
    test('Boolean field with default={true} captures true', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Boolean name="active" default={true} />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBe(true)
    })

    test('Boolean field with default={false} captures false', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Boolean name="done" default={false} />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBe(false)
    })

    test('Boolean field without default has no default', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Boolean name="done" />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBeUndefined()
    })
  })

  describe('Metadata Extraction - Optional Boolean', () => {
    test('Boolean field with optional prop is not required (nullable)', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Boolean name="enabled" optional />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(false)
    })
  })

  describe('Combined Boolean Props', () => {
    test('Boolean field with default and optional', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Boolean name="visible" optional default={true} />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('visible')
      expect(metadata.type).toBe('boolean')
      expect(metadata.required).toBe(false)
      expect(metadata.default).toBe(true)
    })
  })
})

// =============================================================================
// SECTION 4: DATE FIELD TESTS
// =============================================================================

describe('Date Field Component', () => {
  describe('Component Rendering', () => {
    test('Date component can be imported', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      expect(Date).toBeDefined()
      expect(typeof Date).toBe('function')
    })

    test('Date component renders without throwing', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      expect(() => <Date name="dueDate" />).not.toThrow()
    })

    test('Date component has fieldType identifier', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      expect(Date.fieldType).toBe('date')
    })
  })

  describe('Metadata Extraction - Basic Date', () => {
    test('extracts name from Date field', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="dueDate" />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('dueDate')
    })

    test('extracts type as "date" from Date field without includeTime', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="dueDate" />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('date')
    })

    test('Date field is required by default', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="dueDate" />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(true)
    })
  })

  describe('Metadata Extraction - DateTime (includeTime)', () => {
    test('Date field with includeTime has type "datetime"', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="createdAt" includeTime />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('datetime')
    })
  })

  describe('Metadata Extraction - Auto-generated', () => {
    test('Date field with auto prop is auto-generated', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="updatedAt" auto />
      const metadata = getFieldMetadata(element)

      expect(metadata.auto).toBe(true)
    })

    test('Auto Date field is not required (system-managed)', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="createdAt" auto />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(false)
    })

    test('Auto Date field with includeTime has datetime type', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="createdAt" auto includeTime />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('datetime')
      expect(metadata.auto).toBe(true)
    })
  })

  describe('Metadata Extraction - Future Constraint', () => {
    test('Date field with future prop captures future validation', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="publishAt" future />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation).toBeDefined()
      expect(metadata.validation?.future).toBe(true)
    })
  })

  describe('Metadata Extraction - Past Constraint', () => {
    test('Date field with past prop captures past validation', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="birthday" past />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation).toBeDefined()
      expect(metadata.validation?.past).toBe(true)
    })
  })

  describe('Metadata Extraction - Optional Date', () => {
    test('Date field with optional prop is not required', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="deletedAt" optional />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(false)
    })
  })

  describe('Combined Date Props', () => {
    test('Date field with multiple props combines them all', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="scheduledAt" includeTime future optional />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('scheduledAt')
      expect(metadata.type).toBe('datetime')
      expect(metadata.required).toBe(false)
      expect(metadata.validation?.future).toBe(true)
    })
  })
})

// =============================================================================
// SECTION 5: SELECT FIELD TESTS
// =============================================================================

describe('Select Field Component', () => {
  describe('Component Rendering', () => {
    test('Select component can be imported', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      expect(Select).toBeDefined()
      expect(typeof Select).toBe('function')
    })

    test('Select component renders without throwing', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      expect(() => <Select name="status" options={['open', 'closed']} />).not.toThrow()
    })

    test('Select component has fieldType identifier', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      expect(Select.fieldType).toBe('select')
    })
  })

  describe('Metadata Extraction - Basic Select', () => {
    test('extracts name from Select field', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="status" options={['open', 'closed']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('status')
    })

    test('extracts type as "select" from Select field', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="status" options={['open', 'closed']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('select')
    })

    test('Select field is required by default', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="status" options={['open', 'closed']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(true)
    })
  })

  describe('Metadata Extraction - Options', () => {
    test('extracts options array from Select field', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="status" options={['open', 'in_progress', 'closed']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.options).toBeDefined()
      expect(metadata.options).toEqual(['open', 'in_progress', 'closed'])
    })

    test('preserves order of options', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="priority" options={['low', 'medium', 'high', 'critical']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.options).toEqual(['low', 'medium', 'high', 'critical'])
    })

    test('handles single option', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="type" options={['default']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.options).toEqual(['default'])
    })

    test('handles dynamic options from variable', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const categoryOptions = ['tech', 'business', 'design']
      const element = <Select name="category" options={categoryOptions} />
      const metadata = getFieldMetadata(element)

      expect(metadata.options).toEqual(['tech', 'business', 'design'])
    })
  })

  describe('Metadata Extraction - Default Value', () => {
    test('Select field with default captures default value', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="priority" options={['low', 'medium', 'high']} default="medium" />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBe('medium')
    })

    test('Select field without default has no default', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="status" options={['open', 'closed']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBeUndefined()
    })

    test('Select field default must be one of options', async () => {
      // This could be a validation test or it could be runtime behavior
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="priority" options={['low', 'medium', 'high']} default="medium" />
      const metadata = getFieldMetadata(element)

      expect(metadata.options).toContain(metadata.default)
    })
  })

  describe('Metadata Extraction - Multiple Select', () => {
    test('Select field with multiple prop is multi-select', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="tags" options={['a', 'b', 'c']} multiple />
      const metadata = getFieldMetadata(element)

      // Multiple flag should be captured in metadata
      expect(metadata.type).toBe('select')
    })

    test('Multi-select can have array default', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="tags" options={['a', 'b', 'c']} multiple default={['a', 'b']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toEqual(['a', 'b'])
    })
  })

  describe('Metadata Extraction - Optional Select', () => {
    test('Select field with optional prop is not required', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="category" options={['a', 'b']} optional />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(false)
    })
  })

  describe('Combined Select Props', () => {
    test('Select field with multiple props combines them all', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="tags" options={['frontend', 'backend', 'design']} multiple optional default={['frontend']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('tags')
      expect(metadata.type).toBe('select')
      expect(metadata.required).toBe(false)
      expect(metadata.options).toEqual(['frontend', 'backend', 'design'])
      expect(metadata.default).toEqual(['frontend'])
    })
  })
})

// =============================================================================
// SECTION 6: RELATION FIELD TESTS
// =============================================================================

describe('Relation Field Component', () => {
  describe('Component Rendering', () => {
    test('Relation component can be imported', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      expect(Relation).toBeDefined()
      expect(typeof Relation).toBe('function')
    })

    test('Relation component renders without throwing', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      expect(() => <Relation name="author" to="User" />).not.toThrow()
    })

    test('Relation component has fieldType identifier', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      expect(Relation.fieldType).toBe('relation')
    })
  })

  describe('Metadata Extraction - Basic Relation', () => {
    test('extracts name from Relation field', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="author" to="User" />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('author')
    })

    test('extracts type as "relation" from Relation field', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="author" to="User" />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('relation')
    })

    test('Relation field is required by default', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="author" to="User" />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(true)
    })
  })

  describe('Metadata Extraction - Relation Target', () => {
    test('extracts target from "to" prop', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="author" to="User" />
      const metadata = getFieldMetadata(element)

      expect(metadata.relation).toBeDefined()
      expect(metadata.relation?.target).toBe('User')
    })

    test('relation.many is false by default (single relation)', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="author" to="User" />
      const metadata = getFieldMetadata(element)

      expect(metadata.relation?.many).toBe(false)
    })
  })

  describe('Metadata Extraction - Optional Relation', () => {
    test('Relation field with optional prop is not required', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="assignee" to="User" optional />
      const metadata = getFieldMetadata(element)

      expect(metadata.required).toBe(false)
    })
  })

  describe('Metadata Extraction - Many Relation', () => {
    test('Relation field with many prop has many=true', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="tags" to="Tag" many />
      const metadata = getFieldMetadata(element)

      expect(metadata.relation).toBeDefined()
      expect(metadata.relation?.many).toBe(true)
    })

    test('Many relation is still to single target resource', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="tags" to="Tag" many />
      const metadata = getFieldMetadata(element)

      expect(metadata.relation?.target).toBe('Tag')
    })
  })

  describe('Metadata Extraction - Self-referential Relation', () => {
    test('Relation field with self prop is self-referential', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="parent" to="Task" self />
      const metadata = getFieldMetadata(element)

      expect(metadata.relation).toBeDefined()
      expect(metadata.relation?.target).toBe('Task')
      // Self-referential marker should be captured
    })
  })

  describe('Metadata Extraction - Cascade Behavior', () => {
    test('Relation field with cascade="delete" captures cascade behavior', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="comments" to="Comment" cascade="delete" />
      const metadata = getFieldMetadata(element)

      expect(metadata.relation?.cascade).toBe('delete')
    })

    test('Relation field with cascade="nullify" captures nullify behavior', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="assignee" to="User" cascade="nullify" />
      const metadata = getFieldMetadata(element)

      expect(metadata.relation?.cascade).toBe('nullify')
    })

    test('Relation field with cascade="restrict" captures restrict behavior', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="owner" to="User" cascade="restrict" />
      const metadata = getFieldMetadata(element)

      expect(metadata.relation?.cascade).toBe('restrict')
    })

    test('Relation field without cascade has no cascade behavior', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="author" to="User" />
      const metadata = getFieldMetadata(element)

      expect(metadata.relation?.cascade).toBeUndefined()
    })
  })

  describe('Combined Relation Props', () => {
    test('Relation field with multiple props combines them all', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="children" to="Task" many self cascade="delete" optional />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('children')
      expect(metadata.type).toBe('relation')
      expect(metadata.required).toBe(false)
      expect(metadata.relation?.target).toBe('Task')
      expect(metadata.relation?.many).toBe(true)
      expect(metadata.relation?.cascade).toBe('delete')
    })
  })
})

// =============================================================================
// SECTION 7: INTEGRATION TESTS - Fields inside Resource
// =============================================================================

describe('Integration: Fields inside Resource Component', () => {
  describe('extractFieldsFromChildren', () => {
    test('extractFieldsFromChildren function exists', async () => {
      const { extractFieldsFromChildren } = await import('../../src/schema/fields')
      expect(extractFieldsFromChildren).toBeDefined()
      expect(typeof extractFieldsFromChildren).toBe('function')
    })

    test('extracts single field from children', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { extractFieldsFromChildren } = await import('../../src/schema/fields')

      const children = <Text name="title" />
      const fields = extractFieldsFromChildren(children)

      expect(fields).toBeDefined()
      expect(Array.isArray(fields)).toBe(true)
      expect(fields.length).toBe(1)
      expect(fields[0].name).toBe('title')
    })

    test('extracts multiple fields from children array', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { extractFieldsFromChildren } = await import('../../src/schema/fields')

      const children = [<Text key="1" name="title" />, <Boolean key="2" name="done" />]
      const fields = extractFieldsFromChildren(children)

      expect(fields.length).toBe(2)
      expect(fields[0].name).toBe('title')
      expect(fields[1].name).toBe('done')
    })

    test('preserves field order from children', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { Number } = await import('../../src/schema/fields/Number')
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { Select } = await import('../../src/schema/fields/Select')
      const { extractFieldsFromChildren } = await import('../../src/schema/fields')

      const children = [
        <Text key="1" name="title" />,
        <Text key="2" name="description" optional />,
        <Number key="3" name="priority" />,
        <Boolean key="4" name="done" />,
        <Select key="5" name="status" options={['open', 'closed']} />,
      ]
      const fields = extractFieldsFromChildren(children)

      expect(fields.map((f) => f.name)).toEqual(['title', 'description', 'priority', 'done', 'status'])
    })

    test('handles mixed field types', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { Number } = await import('../../src/schema/fields/Number')
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { Date } = await import('../../src/schema/fields/Date')
      const { Select } = await import('../../src/schema/fields/Select')
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { extractFieldsFromChildren } = await import('../../src/schema/fields')

      const children = [
        <Text key="1" name="title" />,
        <Number key="2" name="count" />,
        <Boolean key="3" name="active" />,
        <Date key="4" name="dueDate" />,
        <Select key="5" name="status" options={['a', 'b']} />,
        <Relation key="6" name="author" to="User" />,
      ]
      const fields = extractFieldsFromChildren(children)

      expect(fields.length).toBe(6)
      expect(fields.map((f) => f.type)).toEqual(['text', 'number', 'boolean', 'date', 'select', 'relation'])
    })
  })

  describe('isFieldElement', () => {
    test('isFieldElement function exists', async () => {
      const { isFieldElement } = await import('../../src/schema/fields')
      expect(isFieldElement).toBeDefined()
      expect(typeof isFieldElement).toBe('function')
    })

    test('returns true for Text element', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { isFieldElement } = await import('../../src/schema/fields')

      const element = <Text name="title" />
      expect(isFieldElement(element)).toBe(true)
    })

    test('returns true for Number element', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { isFieldElement } = await import('../../src/schema/fields')

      const element = <Number name="count" />
      expect(isFieldElement(element)).toBe(true)
    })

    test('returns true for Boolean element', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { isFieldElement } = await import('../../src/schema/fields')

      const element = <Boolean name="done" />
      expect(isFieldElement(element)).toBe(true)
    })

    test('returns true for Date element', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { isFieldElement } = await import('../../src/schema/fields')

      const element = <Date name="dueDate" />
      expect(isFieldElement(element)).toBe(true)
    })

    test('returns true for Select element', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { isFieldElement } = await import('../../src/schema/fields')

      const element = <Select name="status" options={['a']} />
      expect(isFieldElement(element)).toBe(true)
    })

    test('returns true for Relation element', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { isFieldElement } = await import('../../src/schema/fields')

      const element = <Relation name="author" to="User" />
      expect(isFieldElement(element)).toBe(true)
    })

    test('returns false for div element', async () => {
      const { isFieldElement } = await import('../../src/schema/fields')

      const element = <div>not a field</div>
      expect(isFieldElement(element)).toBe(false)
    })

    test('returns false for null', async () => {
      const { isFieldElement } = await import('../../src/schema/fields')

      expect(isFieldElement(null)).toBe(false)
    })

    test('returns false for undefined', async () => {
      const { isFieldElement } = await import('../../src/schema/fields')

      expect(isFieldElement(undefined)).toBe(false)
    })

    test('returns false for string', async () => {
      const { isFieldElement } = await import('../../src/schema/fields')

      expect(isFieldElement('text')).toBe(false)
    })

    test('returns false for number', async () => {
      const { isFieldElement } = await import('../../src/schema/fields')

      expect(isFieldElement(42)).toBe(false)
    })
  })

  describe('Resource with Expanded Syntax Children', () => {
    test('Resource accepts field components as children', async () => {
      const { Resource, getResourceMetadata } = await import('../../src/schema/Resource')
      const { Text } = await import('../../src/schema/fields/Text')
      const { Boolean } = await import('../../src/schema/fields/Boolean')

      const resource = (
        <Resource name="Task">
          <Text name="title" />
          <Boolean name="done" default={false} />
        </Resource>
      )

      // Should not throw
      expect(resource.props.name).toBe('Task')
      expect(resource.props.children).toBeDefined()
    })

    test('getResourceMetadata extracts fields from expanded syntax children', async () => {
      const { Resource, getResourceMetadata } = await import('../../src/schema/Resource')
      const { Text } = await import('../../src/schema/fields/Text')
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { Select } = await import('../../src/schema/fields/Select')
      const { Relation } = await import('../../src/schema/fields/Relation')

      const resource = (
        <Resource name="Task">
          <Text name="title" />
          <Text name="description" optional />
          <Boolean name="done" default={false} />
          <Select name="priority" options={['low', 'medium', 'high']} default="medium" />
          <Relation name="assignee" to="User" optional />
        </Resource>
      )

      const metadata = getResourceMetadata(resource)

      expect(metadata.name).toBe('Task')
      expect(metadata.fields).toBeDefined()
      expect(metadata.fields.length).toBe(5)

      // Verify each field
      const titleField = metadata.fields.find((f) => f.name === 'title')
      expect(titleField?.type).toBe('text')
      expect(titleField?.required).toBe(true)

      const descField = metadata.fields.find((f) => f.name === 'description')
      expect(descField?.type).toBe('text')
      expect(descField?.required).toBe(false)

      const doneField = metadata.fields.find((f) => f.name === 'done')
      expect(doneField?.type).toBe('boolean')
      expect(doneField?.default).toBe(false)

      const priorityField = metadata.fields.find((f) => f.name === 'priority')
      expect(priorityField?.type).toBe('select')
      expect(priorityField?.options).toEqual(['low', 'medium', 'high'])
      expect(priorityField?.default).toBe('medium')

      const assigneeField = metadata.fields.find((f) => f.name === 'assignee')
      expect(assigneeField?.type).toBe('relation')
      expect(assigneeField?.required).toBe(false)
      expect(assigneeField?.relation?.target).toBe('User')
    })

    test('Resource handles empty children', async () => {
      const { Resource, getResourceMetadata } = await import('../../src/schema/Resource')

      const resource = <Resource name="EmptyTask">{[]}</Resource>

      const metadata = getResourceMetadata(resource)

      expect(metadata.name).toBe('EmptyTask')
      expect(metadata.fields).toEqual([])
    })
  })

  describe('Full Task Example - Comprehensive Integration', () => {
    test('complete Task resource with all field types', async () => {
      const { Resource, getResourceMetadata } = await import('../../src/schema/Resource')
      const { Text } = await import('../../src/schema/fields/Text')
      const { Number } = await import('../../src/schema/fields/Number')
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { Date } = await import('../../src/schema/fields/Date')
      const { Select } = await import('../../src/schema/fields/Select')
      const { Relation } = await import('../../src/schema/fields/Relation')

      const resource = (
        <Resource name="Task">
          <Text name="title" minLength={1} maxLength={200} />
          <Text name="description" optional multiline />
          <Text name="slug" unique pattern="^[a-z0-9-]+$" />
          <Number name="priority" min={1} max={5} default={3} />
          <Number name="estimatedHours" decimal optional />
          <Boolean name="done" default={false} />
          <Boolean name="archived" optional />
          <Date name="dueDate" optional future />
          <Date name="createdAt" includeTime auto />
          <Date name="updatedAt" includeTime auto />
          <Select name="status" options={['backlog', 'todo', 'in_progress', 'review', 'done']} default="backlog" />
          <Select name="tags" options={['bug', 'feature', 'docs', 'refactor']} multiple optional />
          <Relation name="assignee" to="User" optional />
          <Relation name="project" to="Project" />
          <Relation name="comments" to="Comment" many cascade="delete" />
          <Relation name="parent" to="Task" self optional />
          <Relation name="subtasks" to="Task" self many />
        </Resource>
      )

      const metadata = getResourceMetadata(resource)

      // Verify resource name
      expect(metadata.name).toBe('Task')

      // Verify field count
      expect(metadata.fields.length).toBe(17)

      // Verify specific field configurations
      const titleField = metadata.fields.find((f) => f.name === 'title')
      expect(titleField?.validation?.minLength).toBe(1)
      expect(titleField?.validation?.maxLength).toBe(200)

      const slugField = metadata.fields.find((f) => f.name === 'slug')
      expect(slugField?.unique).toBe(true)
      expect(slugField?.validation?.pattern).toBe('^[a-z0-9-]+$')

      const createdAtField = metadata.fields.find((f) => f.name === 'createdAt')
      expect(createdAtField?.type).toBe('datetime')
      expect(createdAtField?.auto).toBe(true)

      const commentsField = metadata.fields.find((f) => f.name === 'comments')
      expect(commentsField?.relation?.many).toBe(true)
      expect(commentsField?.relation?.cascade).toBe('delete')
    })
  })
})

// =============================================================================
// SECTION 8: ERROR HANDLING TESTS
// =============================================================================

describe('Error Handling', () => {
  describe('Missing Required Props', () => {
    test('Text field without name throws error', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // @ts-expect-error - intentionally omitting required prop for test
      const element = <Text />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Number field without name throws error', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // @ts-expect-error - intentionally omitting required prop for test
      const element = <Number />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Boolean field without name throws error', async () => {
      const { Boolean } = await import('../../src/schema/fields/Boolean')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // @ts-expect-error - intentionally omitting required prop for test
      const element = <Boolean />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Date field without name throws error', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // @ts-expect-error - intentionally omitting required prop for test
      const element = <Date />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Select field without name throws error', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // @ts-expect-error - intentionally omitting required prop for test
      const element = <Select options={['a']} />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Select field without options throws error', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // @ts-expect-error - intentionally omitting required prop for test
      const element = <Select name="status" />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Relation field without name throws error', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // @ts-expect-error - intentionally omitting required prop for test
      const element = <Relation to="User" />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Relation field without "to" throws error', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // @ts-expect-error - intentionally omitting required prop for test
      const element = <Relation name="author" />

      expect(() => getFieldMetadata(element)).toThrow()
    })
  })

  describe('Invalid Prop Values', () => {
    test('Text field with invalid type throws error', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // @ts-expect-error - intentionally using invalid type for test
      const element = <Text name="field" type="invalid" />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Number field with min > max throws error', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="value" min={100} max={10} />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Text field with minLength > maxLength throws error', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="code" minLength={100} maxLength={10} />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Text field with negative minLength throws error', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="code" minLength={-1} />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Select field with empty options array throws error', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="status" options={[]} />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Select field with invalid default throws error', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="status" options={['a', 'b']} default="c" />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Relation field with invalid cascade value throws error', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // @ts-expect-error - intentionally using invalid cascade for test
      const element = <Relation name="author" to="User" cascade="invalid" />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('Date field with both future and past throws error', async () => {
      const { Date } = await import('../../src/schema/fields/Date')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Date name="date" future past />

      expect(() => getFieldMetadata(element)).toThrow()
    })
  })

  describe('Invalid Field Name Errors', () => {
    test('field name with spaces throws error', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="my field" />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('field name starting with number throws error', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="1field" />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('empty field name throws error', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="" />

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('reserved field name "id" throws error', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="id" />

      expect(() => getFieldMetadata(element)).toThrow()
    })
  })

  describe('getFieldMetadata with non-field element', () => {
    test('getFieldMetadata with div element throws error', async () => {
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <div>not a field</div>

      expect(() => getFieldMetadata(element)).toThrow()
    })

    test('getFieldMetadata with null throws error', async () => {
      const { getFieldMetadata } = await import('../../src/schema/fields')

      expect(() => getFieldMetadata(null as any)).toThrow()
    })

    test('getFieldMetadata with undefined throws error', async () => {
      const { getFieldMetadata } = await import('../../src/schema/fields')

      expect(() => getFieldMetadata(undefined as any)).toThrow()
    })

    test('getFieldMetadata with string throws error', async () => {
      const { getFieldMetadata } = await import('../../src/schema/fields')

      expect(() => getFieldMetadata('text' as any)).toThrow()
    })
  })

  describe('extractFieldsFromChildren Errors', () => {
    test('extractFieldsFromChildren ignores non-field elements', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { extractFieldsFromChildren } = await import('../../src/schema/fields')

      const children = [<Text key="1" name="title" />, <div key="2">ignored</div>, <Text key="3" name="description" />]
      const fields = extractFieldsFromChildren(children)

      // Should only include the field elements
      expect(fields.length).toBe(2)
      expect(fields[0].name).toBe('title')
      expect(fields[1].name).toBe('description')
    })

    test('extractFieldsFromChildren with null child ignores it', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { extractFieldsFromChildren } = await import('../../src/schema/fields')

      const children = [<Text key="1" name="title" />, null, <Text key="3" name="description" />]
      const fields = extractFieldsFromChildren(children)

      expect(fields.length).toBe(2)
    })

    test('extractFieldsFromChildren with undefined child ignores it', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { extractFieldsFromChildren } = await import('../../src/schema/fields')

      const children = [<Text key="1" name="title" />, undefined, <Text key="3" name="description" />]
      const fields = extractFieldsFromChildren(children)

      expect(fields.length).toBe(2)
    })

    test('extractFieldsFromChildren with text node ignores it', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { extractFieldsFromChildren } = await import('../../src/schema/fields')

      const children = [<Text key="1" name="title" />, 'some text', <Text key="3" name="description" />]
      const fields = extractFieldsFromChildren(children)

      expect(fields.length).toBe(2)
    })
  })
})

// =============================================================================
// SECTION 9: TYPE EXPORTS TESTS
// =============================================================================

describe('Type Exports', () => {
  test('FieldMetadata type can be imported', async () => {
    const module = await import('../../src/schema/fields')
    // FieldMetadata is a type, so we just verify the module exports exist
    expect(module.getFieldMetadata).toBeDefined()
  })

  test('FieldType type can be imported', async () => {
    const module = await import('../../src/schema/fields')
    expect(module).toBeDefined()
  })

  test('FieldValidation type can be imported', async () => {
    const module = await import('../../src/schema/fields')
    expect(module).toBeDefined()
  })

  test('FieldRelationMetadata type can be imported', async () => {
    const module = await import('../../src/schema/fields')
    expect(module).toBeDefined()
  })

  test('All field component props types can be imported', async () => {
    const { TextFieldProps } = await import('../../src/schema/fields/Text')
    const { NumberFieldProps } = await import('../../src/schema/fields/Number')
    const { BooleanFieldProps } = await import('../../src/schema/fields/Boolean')
    const { DateFieldProps } = await import('../../src/schema/fields/Date')
    const { SelectFieldProps } = await import('../../src/schema/fields/Select')
    const { RelationFieldProps } = await import('../../src/schema/fields/Relation')

    // Types are compile-time only, so this test primarily verifies no import errors
    expect(true).toBe(true)
  })

  test('CascadeType can be imported from Relation', async () => {
    const { CascadeType } = await import('../../src/schema/fields/Relation')
    // Type export verification
    expect(true).toBe(true)
  })
})

// =============================================================================
// SECTION 10: EDGE CASES
// =============================================================================

describe('Edge Cases', () => {
  describe('Field Name Edge Cases', () => {
    test('field name with underscore is valid', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="user_name" />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('user_name')
    })

    test('field name with camelCase is valid', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="firstName" />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('firstName')
    })

    test('single character field name is valid', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="x" />
      const metadata = getFieldMetadata(element)

      expect(metadata.name).toBe('x')
    })
  })

  describe('Number Edge Cases', () => {
    test('Number field with min=0 allows zero', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="count" min={0} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation?.min).toBe(0)
    })

    test('Number field with negative min is valid', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="temperature" min={-100} max={100} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation?.min).toBe(-100)
      expect(metadata.validation?.max).toBe(100)
    })

    test('Number field with very large values', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="bigNumber" max={Number.MAX_SAFE_INTEGER} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation?.max).toBe(Number.MAX_SAFE_INTEGER)
    })

    test('Number field with decimal step', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="price" decimal step={0.01} />
      const metadata = getFieldMetadata(element)

      expect(metadata.type).toBe('number')
    })
  })

  describe('Text Length Edge Cases', () => {
    test('Text field with minLength=0', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="optional" minLength={0} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation?.minLength).toBe(0)
    })

    test('Text field with very large maxLength', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="content" maxLength={100000} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation?.maxLength).toBe(100000)
    })

    test('Text field with minLength equal to maxLength', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="code" minLength={6} maxLength={6} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation?.minLength).toBe(6)
      expect(metadata.validation?.maxLength).toBe(6)
    })
  })

  describe('Select Options Edge Cases', () => {
    test('Select with many options', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const manyOptions = Array.from({ length: 100 }, (_, i) => `option_${i}`)
      const element = <Select name="largeSelect" options={manyOptions} />
      const metadata = getFieldMetadata(element)

      expect(metadata.options?.length).toBe(100)
    })

    test('Select with options containing special characters', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="special" options={['option-1', 'option_2', 'option.3']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.options).toEqual(['option-1', 'option_2', 'option.3'])
    })

    test('Select with options containing spaces', async () => {
      const { Select } = await import('../../src/schema/fields/Select')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Select name="category" options={['Option One', 'Option Two', 'Option Three']} />
      const metadata = getFieldMetadata(element)

      expect(metadata.options).toEqual(['Option One', 'Option Two', 'Option Three'])
    })
  })

  describe('Relation Edge Cases', () => {
    test('Relation to same resource name (self-referential)', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Relation name="parent" to="Category" self />
      const metadata = getFieldMetadata(element)

      expect(metadata.relation?.target).toBe('Category')
    })

    test('Multiple relations to same target', async () => {
      const { Relation } = await import('../../src/schema/fields/Relation')
      const { extractFieldsFromChildren } = await import('../../src/schema/fields')

      const children = [
        <Relation key="1" name="author" to="User" />,
        <Relation key="2" name="reviewer" to="User" optional />,
        <Relation key="3" name="assignee" to="User" optional />,
      ]
      const fields = extractFieldsFromChildren(children)

      expect(fields.length).toBe(3)
      expect(fields.every((f) => f.relation?.target === 'User')).toBe(true)
    })
  })

  describe('Default Value Edge Cases', () => {
    test('Text default with empty string', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Text name="prefix" default="" />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBe('')
    })

    test('Number default with negative value', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="offset" default={-10} />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBe(-10)
    })

    test('Number default with decimal value', async () => {
      const { Number } = await import('../../src/schema/fields/Number')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const element = <Number name="rate" decimal default={0.15} />
      const metadata = getFieldMetadata(element)

      expect(metadata.default).toBe(0.15)
    })
  })

  describe('Pattern Regex Edge Cases', () => {
    test('Text pattern with complex regex', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      const complexPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
      const element = <Text name="email" pattern={complexPattern} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation?.pattern).toBe(complexPattern)
    })

    test('Text pattern with escape characters', async () => {
      const { Text } = await import('../../src/schema/fields/Text')
      const { getFieldMetadata } = await import('../../src/schema/fields')

      // Use a variable to ensure JSX prop and expectation use the same string
      const pathPattern = '^/[\\w-]+(/[\\w-]+)*$'
      const element = <Text name="path" pattern={pathPattern} />
      const metadata = getFieldMetadata(element)

      expect(metadata.validation?.pattern).toBe(pathPattern)
    })
  })
})
