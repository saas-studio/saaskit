/**
 * SelectInput Component
 *
 * A select/dropdown input for the TUI.
 */

import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectInputProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
}

export function SelectInput({ value, onChange, options, disabled }: SelectInputProps) {
  // TODO: Implement SelectInput rendering
  return null
}
