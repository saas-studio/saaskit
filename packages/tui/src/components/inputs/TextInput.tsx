/**
 * TextInput Component
 *
 * A text input field for the TUI.
 */

import React from 'react'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function TextInput({ value, onChange, placeholder, disabled }: TextInputProps) {
  // TODO: Implement TextInput rendering
  return null
}
