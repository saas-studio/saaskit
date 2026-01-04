/**
 * CheckboxInput component for Form view
 */
import type React from 'react'

export interface CheckboxInputProps {
	name: string
	label?: string
	checked?: boolean
	disabled?: boolean
	onChange?: (checked: boolean) => void
}

// Module-level state for test helpers
let registeredInputs: Map<string, CheckboxInputProps> = new Map()

// Test helper
export function simulateToggle(name: string): void {
	const input = registeredInputs.get(name)
	if (input?.onChange) {
		input.onChange(!input.checked)
	}
}

export function CheckboxInput(props: CheckboxInputProps): React.ReactElement {
	// Register this input for test helpers
	registeredInputs.set(props.name, props)

	return {
		type: 'checkbox',
		props: {
			name: props.name,
			label: props.label,
			checked: props.checked,
			disabled: props.disabled,
		},
	} as unknown as React.ReactElement
}
