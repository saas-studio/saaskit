/**
 * SelectInput component for Form view
 */
import type React from 'react'

export interface SelectInputProps {
	name: string
	label?: string
	value?: string
	options: string[]
	placeholder?: string
	required?: boolean
	disabled?: boolean
	onChange?: (value: string) => void
}

// Module-level state for test helpers
let registeredInputs: Map<string, SelectInputProps> = new Map()

// Test helper
export function simulateSelect(name: string, value: string): void {
	const input = registeredInputs.get(name)
	if (input?.onChange) {
		input.onChange(value)
	}
}

export function SelectInput(props: SelectInputProps): React.ReactElement {
	// Register this input for test helpers
	registeredInputs.set(props.name, props)

	return {
		type: 'select',
		props: {
			name: props.name,
			label: props.label,
			value: props.value,
			options: props.options,
			placeholder: props.placeholder,
			required: props.required,
			disabled: props.disabled,
		},
	} as unknown as React.ReactElement
}
