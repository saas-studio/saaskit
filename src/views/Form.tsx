/**
 * Form view component
 * Stub - to be implemented in GREEN phase
 */
import type React from 'react'

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

export function Form<T>(_props: FormProps<T>): React.ReactElement {
	// TODO: Implement in GREEN phase
	throw new Error('Not implemented')
}
