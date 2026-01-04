/**
 * Number Field Component - defines a number field in expanded syntax
 * Stub - to be implemented in GREEN phase
 */
import type React from 'react'

export interface NumberFieldProps {
  name: string
  required?: boolean
  optional?: boolean
  decimal?: boolean
  min?: number
  max?: number
  step?: number
  default?: number
}

/**
 * Number field component for expanded syntax
 *
 * Usage:
 * <Number name="count" />                  // integer
 * <Number name="price" decimal />          // decimal/float
 * <Number name="age" min={0} max={150} />  // range constraints
 * <Number name="quantity" default={1} />   // default value
 * <Number name="rating" step={0.5} />      // step for decimals
 */
export function Number(props: NumberFieldProps): React.ReactElement {
  // Stub - returns null, to be implemented
  return null as unknown as React.ReactElement
}

// Field type identifier for metadata extraction
Number.fieldType = 'number'
