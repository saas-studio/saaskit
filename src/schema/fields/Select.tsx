/**
 * Select Field Component - defines a select/enum field in expanded syntax
 * Stub - to be implemented in GREEN phase
 */
import type React from 'react'

export interface SelectFieldProps {
  name: string
  options: string[]
  required?: boolean
  optional?: boolean
  multiple?: boolean
  default?: string | string[]
}

/**
 * Select field component for expanded syntax
 *
 * Usage:
 * <Select name="status" options={['open', 'closed']} />
 * <Select name="priority" options={['low', 'medium', 'high']} default="medium" />
 * <Select name="tags" options={['a', 'b', 'c']} multiple />  // multi-select
 * <Select name="category" options={categoryList} />  // dynamic options
 */
export function Select(props: SelectFieldProps): React.ReactElement {
  // Stub - returns null, to be implemented
  return null as unknown as React.ReactElement
}

// Field type identifier for metadata extraction
Select.fieldType = 'select'
