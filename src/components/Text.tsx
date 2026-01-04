/**
 * Text component for terminal rendering
 */
import React from 'react'

export type TextColor =
	| 'black'
	| 'red'
	| 'green'
	| 'yellow'
	| 'blue'
	| 'magenta'
	| 'cyan'
	| 'white'

export interface TextProps {
	children?: React.ReactNode
	color?: TextColor
	bold?: boolean
	italic?: boolean
	underline?: boolean
}

// ANSI color codes
const colorCodes: Record<TextColor, number> = {
	black: 30,
	red: 31,
	green: 32,
	yellow: 33,
	blue: 34,
	magenta: 35,
	cyan: 36,
	white: 37,
}

/**
 * Text component for rendering styled text in the terminal.
 *
 * Supports ANSI colors and text formatting (bold, italic, underline).
 */
export function Text(props: TextProps): React.ReactElement {
	return React.createElement('text', {
		...props,
		__isText: true,
	})
}

/**
 * Renders Text component props to ANSI-styled string
 */
export function renderText(props: TextProps): string {
	const { children, color, bold, italic, underline } = props

	// Convert children to string
	let content = ''
	if (children !== undefined && children !== null) {
		if (Array.isArray(children)) {
			content = children.map(child => String(child ?? '')).join('')
		} else {
			content = String(children)
		}
	}

	// Build ANSI escape codes
	const codes: string[] = []

	if (bold) {
		codes.push('\x1b[1m')
	}
	if (italic) {
		codes.push('\x1b[3m')
	}
	if (underline) {
		codes.push('\x1b[4m')
	}
	if (color && colorCodes[color]) {
		codes.push(`\x1b[${colorCodes[color]}m`)
	}

	// If no styling, return plain content
	if (codes.length === 0) {
		return content
	}

	// Apply styles and reset
	return `${codes.join('')}${content}\x1b[0m`
}
