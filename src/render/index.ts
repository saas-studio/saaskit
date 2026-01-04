/**
 * Terminal rendering functions
 */
import React from 'react'
import { Text, renderText, type TextProps } from '../components/Text'
import { Box, borderChars, getPadding, getMargin, type BoxProps, type BorderStyle } from '../components/Box'

export type OutputFormat = 'unicode' | 'ascii' | 'plain' | 'json' | 'markdown'

export interface RenderOptions {
	format?: OutputFormat
	width?: number
	color?: boolean
}

/**
 * Strip ANSI escape codes from a string to get its visual length
 */
function stripAnsi(str: string): string {
	return str.replace(/\x1b\[[0-9;]*m/g, '')
}

/**
 * Get the visual width of a string (without ANSI codes)
 */
function visualWidth(str: string): number {
	return stripAnsi(str).length
}

/**
 * Render a React element tree to terminal string output
 */
function renderElement(element: React.ReactElement | string | number | null | undefined): string {
	// Handle primitives
	if (element === null || element === undefined) {
		return ''
	}
	if (typeof element === 'string' || typeof element === 'number') {
		return String(element)
	}

	// Get element type and props
	const { type, props } = element

	// Handle Text component
	if (type === Text || (props && props.__isText)) {
		return renderText(props as TextProps)
	}

	// Handle Box component
	if (type === Box || (props && props.__isBox)) {
		return renderBox(props as BoxProps)
	}

	// Handle generic elements (div, span, etc.) - just render children
	if (props && props.children !== undefined) {
		return renderChildren(props.children)
	}

	return ''
}

/**
 * Render children (can be single element, array, or primitive)
 */
function renderChildren(children: React.ReactNode): string {
	if (children === null || children === undefined) {
		return ''
	}

	if (typeof children === 'string' || typeof children === 'number') {
		return String(children)
	}

	if (Array.isArray(children)) {
		return children.map(child => {
			if (React.isValidElement(child)) {
				return renderElement(child)
			}
			return String(child ?? '')
		}).join('')
	}

	if (React.isValidElement(children)) {
		return renderElement(children)
	}

	return String(children)
}

/**
 * Render a Box component with borders, padding, and layout
 */
function renderBox(props: BoxProps): string {
	const {
		children,
		borderStyle = 'single',
		flexDirection = 'column'
	} = props

	const padding = getPadding(props)
	const margin = getMargin(props)
	const chars = borderChars[borderStyle as BorderStyle] || borderChars.single

	// Render children based on flex direction
	let contentLines: string[] = []

	if (children !== undefined && children !== null) {
		if (Array.isArray(children)) {
			if (flexDirection === 'row') {
				// Row: all children on the same line
				const renderedChildren = children.map(child => {
					if (React.isValidElement(child)) {
						return renderElement(child)
					}
					return String(child ?? '')
				})
				contentLines = [renderedChildren.join(' ')]
			} else {
				// Column: each child on a new line
				for (const child of children) {
					if (React.isValidElement(child)) {
						const rendered = renderElement(child)
						contentLines.push(...rendered.split('\n'))
					} else if (child !== null && child !== undefined) {
						contentLines.push(String(child))
					}
				}
			}
		} else if (React.isValidElement(children)) {
			const rendered = renderElement(children)
			contentLines = rendered.split('\n')
		} else {
			contentLines = [String(children)]
		}
	}

	// If no content, create empty box
	if (contentLines.length === 0) {
		contentLines = ['']
	}

	// Calculate max content width
	let maxContentWidth = 0
	for (const line of contentLines) {
		const width = visualWidth(line)
		if (width > maxContentWidth) {
			maxContentWidth = width
		}
	}

	// Add padding to content width
	const innerWidth = maxContentWidth + padding.left + padding.right

	// Build the box
	const lines: string[] = []

	// Add top margin
	for (let i = 0; i < margin.top; i++) {
		lines.push('')
	}

	const marginLeftStr = ' '.repeat(margin.left)

	// Top border
	const topBorder = chars.topLeft + chars.horizontal.repeat(innerWidth) + chars.topRight
	lines.push(marginLeftStr + topBorder)

	// Top padding lines
	for (let i = 0; i < padding.top; i++) {
		lines.push(marginLeftStr + chars.vertical + ' '.repeat(innerWidth) + chars.vertical)
	}

	// Content lines
	for (const content of contentLines) {
		const contentWidth = visualWidth(content)
		const leftPad = ' '.repeat(padding.left)
		const rightPad = ' '.repeat(innerWidth - contentWidth - padding.left)
		lines.push(marginLeftStr + chars.vertical + leftPad + content + rightPad + chars.vertical)
	}

	// Bottom padding lines
	for (let i = 0; i < padding.bottom; i++) {
		lines.push(marginLeftStr + chars.vertical + ' '.repeat(innerWidth) + chars.vertical)
	}

	// Bottom border
	const bottomBorder = chars.bottomLeft + chars.horizontal.repeat(innerWidth) + chars.bottomRight
	lines.push(marginLeftStr + bottomBorder)

	// Add bottom margin
	for (let i = 0; i < margin.bottom; i++) {
		lines.push('')
	}

	return lines.join('\n')
}

/**
 * Renders a React element to a string for terminal output.
 *
 * @param element - The React element to render
 * @param options - Optional rendering options
 * @returns The rendered string output
 */
export function render(
	element: React.ReactElement,
	_options?: RenderOptions
): string {
	return renderElement(element)
}

export function detectFormat(): OutputFormat {
	// Default to unicode for modern terminals
	return 'unicode'
}
