/**
 * Text Field Component - defines a text field in expanded syntax
 * Stub - to be implemented in GREEN phase
 */
import type React from 'react'

export interface TextFieldProps {
  name: string
  required?: boolean
  optional?: boolean
  type?: 'text' | 'email' | 'url'
  multiline?: boolean
  unique?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  default?: string
}

/**
 * Text field component for expanded syntax
 *
 * Usage:
 * <Text name="title" />                    // required text
 * <Text name="description" optional />      // optional text
 * <Text name="email" type="email" />        // email validation
 * <Text name="url" type="url" />           // url validation
 * <Text name="bio" multiline />            // multiline text
 * <Text name="slug" unique />              // unique constraint
 * <Text name="code" minLength={3} maxLength={10} />  // length constraints
 * <Text name="pattern" pattern="^[A-Z]+" />  // regex pattern
 */
export function Text(props: TextFieldProps): React.ReactElement {
  // Stub - returns null, to be implemented
  return null as unknown as React.ReactElement
}

// Field type identifier for metadata extraction
Text.fieldType = 'text'
