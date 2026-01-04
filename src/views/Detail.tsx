/**
 * Detail view component
 * Stub - to be implemented in GREEN phase
 */
import React from 'react'

export type DetailLayout = 'page' | 'panel' | 'modal' | 'inline'

export interface DetailSection {
	title: string
	fields: string[]
}

export interface DetailProps<T = unknown> {
	data: T
	layout?: DetailLayout
	fields?: string[]
	sections?: DetailSection[]
	actions?: React.ReactNode
}

export function Detail<T>(props: DetailProps<T>): React.ReactElement {
	const { data, layout, fields, sections, actions } = props

	const renderField = (fieldName: string) => {
		const value = (data as Record<string, unknown>)[fieldName]
		return React.createElement(
			'div',
			{ key: fieldName, className: 'detail-field' },
			React.createElement('span', { className: 'detail-label' }, fieldName),
			React.createElement('span', { className: 'detail-value' }, String(value ?? ''))
		)
	}

	const children: React.ReactNode[] = []

	// Render sections if provided
	if (sections) {
		for (const section of sections) {
			children.push(
				React.createElement(
					'div',
					{ key: section.title, className: 'detail-section' },
					React.createElement('h3', { className: 'detail-section-title' }, section.title),
					...section.fields.map(renderField)
				)
			)
		}
	}

	// Render fields if provided (and no sections)
	if (fields && !sections) {
		for (const field of fields) {
			children.push(renderField(field))
		}
	}

	// Render actions if provided
	if (actions) {
		children.push(
			React.createElement('div', { key: 'actions', className: 'detail-actions' }, actions)
		)
	}

	return React.createElement(
		'div',
		{
			className: `detail ${layout || 'page'}`,
			'data-layout': layout || 'page'
		},
		...children
	)
}
