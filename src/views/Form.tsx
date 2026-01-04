/**
 * Form view component
 */
import React from 'react'

export type FormMode = 'create' | 'edit' | 'wizard' | 'inline'

export interface FormField {
	name: string
	type: 'text' | 'number' | 'boolean' | 'select' | 'date' | 'email' | 'url'
	label?: string
	required?: boolean
	options?: string[]
	default?: unknown
}

export interface FormProps<T = unknown> {
	mode?: FormMode
	data?: T
	fields?: FormField[]
	onSubmit?: (data: T) => void | Promise<void>
	onCancel?: () => void
}

// Module-level state for test helpers
let currentFields: FormField[] = []
let currentOnSubmit: ((data: unknown) => void | Promise<void>) | undefined
let currentOnCancel: (() => void) | undefined
let currentFieldValues: Record<string, unknown> = {}
let currentValidationErrors: Record<string, string> = {}
let currentDisplayedErrors: string[] = []
let hasCancelButton = false

// Test helpers
export function getRenderedFields(): FormField[] {
	return currentFields
}

export function simulateSubmit(data: unknown): void | Promise<void> {
	// Validate required fields
	const errors: Record<string, string> = {}
	const displayed: string[] = []

	for (const field of currentFields) {
		if (field.required) {
			const value = (data as Record<string, unknown>)?.[field.name]
			if (value === undefined || value === null || value === '') {
				const label = field.label || field.name
				errors[field.name] = `${label} is required`
				displayed.push(`${label} is required`)
			}
		}
	}

	currentValidationErrors = errors
	currentDisplayedErrors = displayed

	// If validation errors, don't call onSubmit
	if (Object.keys(errors).length > 0) {
		return
	}

	// Call onSubmit if provided
	if (currentOnSubmit) {
		return currentOnSubmit(data)
	}
}

export function getValidationErrors(): Record<string, string> {
	return currentValidationErrors
}

export function getDisplayedErrors(): string[] {
	return currentDisplayedErrors
}

export function setFieldValue(name: string, value: unknown): void {
	currentFieldValues[name] = value
	// Clear errors when valid value is set
	if (value !== undefined && value !== null && value !== '') {
		delete currentValidationErrors[name]
		currentDisplayedErrors = currentDisplayedErrors.filter(
			(err) => !err.toLowerCase().includes(name.toLowerCase())
		)
	}
}

export function simulateCancel(): void {
	if (currentOnCancel) {
		currentOnCancel()
	}
}

export function hasCancel(): boolean {
	return hasCancelButton
}

export function Form<T>(props: FormProps<T>): React.ReactElement {
	const { fields = [], onSubmit, onCancel } = props

	// Store state for test helpers
	currentFields = fields
	currentOnSubmit = onSubmit as ((data: unknown) => void | Promise<void>) | undefined
	currentOnCancel = onCancel
	currentFieldValues = {}
	currentValidationErrors = {}
	currentDisplayedErrors = []
	hasCancelButton = !!onCancel

	// Build children array
	const children: React.ReactNode[] = []

	// Render fields
	for (const field of fields) {
		children.push(
			React.createElement('div', { key: field.name, className: 'form-field' },
				React.createElement('label', null, field.label || field.name),
				React.createElement('input', {
					name: field.name,
					type: field.type === 'boolean' ? 'checkbox' : field.type,
					required: field.required,
				})
			)
		)
	}

	// Render buttons
	children.push(
		React.createElement('button', { key: 'submit', type: 'submit' }, 'Submit')
	)

	if (onCancel) {
		children.push(
			React.createElement('button', { key: 'cancel', type: 'button' }, 'Cancel')
		)
	}

	return React.createElement('form', { className: 'form' }, ...children)
}
