/**
 * TextInput component for Form view
 */
import type React from 'react'

export interface TextInputProps {
	name: string
	label?: string
	value?: string
	placeholder?: string
	required?: boolean
	disabled?: boolean
	onChange?: (value: string) => void
}

// Module-level state for test helpers
let registeredInputs: Map<string, TextInputProps> = new Map()

// Test helper
export function simulateChange(name: string, value: string): void {
	const input = registeredInputs.get(name)
	if (input?.onChange) {
		input.onChange(value)
	}
}

export function TextInput(props: TextInputProps): React.ReactElement {
	// Register this input for test helpers
	registeredInputs.set(props.name, props)

	return {
		type: 'input',
		props: {
			name: props.name,
			label: props.label,
			value: props.value,
			placeholder: props.placeholder,
			required: props.required,
			disabled: props.disabled,
		},
	} as unknown as React.ReactElement
}
