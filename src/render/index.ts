/**
 * Terminal rendering functions
 */
import React from 'react'
import { Text, type TextProps, type TextColor } from '../components/Text'
import { Box, borderChars, getPadding, getMargin, type BoxProps, type BorderStyle } from '../components/Box'

export type OutputFormat = 'unicode' | 'ascii' | 'plain' | 'json' | 'markdown'

export interface RenderOptions {
	format?: OutputFormat
	width?: number
	color?: boolean
}

// ANSI color codes (duplicated from Text.tsx for use in rendering)
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

// ASCII border characters
const asciiBorderChars = {
	topLeft: '+',
	topRight: '+',
	bottomLeft: '+',
	bottomRight: '+',
	horizontal: '-',
	vertical: '|',
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
 * Wrap text to fit within a specified width
 */
function wrapText(text: string, maxWidth: number): string[] {
	if (maxWidth <= 0 || text.length <= maxWidth) {
		return [text]
	}

	const lines: string[] = []
	let remaining = text

	while (remaining.length > 0) {
		if (remaining.length <= maxWidth) {
			lines.push(remaining)
			break
		}
		lines.push(remaining.substring(0, maxWidth))
		remaining = remaining.substring(maxWidth)
	}

	return lines
}

/**
 * Render Text component props to styled string based on format and options
 */
function renderTextWithOptions(props: TextProps, options: RenderOptions): string {
	const { children, color, bold, italic, underline } = props
	const format = options.format || 'unicode'
	const enableColor = options.color !== false
	const maxWidth = options.width || 0

	// Convert children to string
	let content = ''
	if (children !== undefined && children !== null) {
		if (Array.isArray(children)) {
			content = children.map(child => String(child ?? '')).join('')
		} else {
			content = String(children)
		}
	}

	// Apply width wrapping if specified
	if (maxWidth > 0 && content.length > maxWidth) {
		const wrapped = wrapText(content, maxWidth)
		content = wrapped.join('\n')
	}

	// For plain format, return content as-is (no ANSI codes)
	if (format === 'plain' || !enableColor) {
		return content
	}

	// For markdown format, use markdown syntax
	if (format === 'markdown') {
		let result = content

		if (bold && italic) {
			result = `***${result}***`
		} else if (bold) {
			result = `**${result}**`
		} else if (italic) {
			result = `*${result}*`
		}

		if (underline && !bold && !italic) {
			result = `_${result}_`
		}

		// Colored text - just return the text (no markdown for colors)
		return result
	}

	// For unicode and ascii formats with color enabled, use ANSI codes
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

/**
 * Render a React element tree to terminal string output
 */
function renderElement(element: React.ReactElement | string | number | null | undefined, options: RenderOptions): string {
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
		return renderTextWithOptions(props as TextProps, options)
	}

	// Handle Box component
	if (type === Box || (props && props.__isBox)) {
		return renderBox(props as BoxProps, options)
	}

	// Handle generic elements (div, span, etc.) - just render children
	if (props && props.children !== undefined) {
		return renderChildren(props.children, options)
	}

	return ''
}

/**
 * Render children (can be single element, array, or primitive)
 */
function renderChildren(children: React.ReactNode, options: RenderOptions): string {
	if (children === null || children === undefined) {
		return ''
	}

	if (typeof children === 'string' || typeof children === 'number') {
		return String(children)
	}

	if (Array.isArray(children)) {
		return children.map(child => {
			if (React.isValidElement(child)) {
				return renderElement(child, options)
			}
			return String(child ?? '')
		}).join('')
	}

	if (React.isValidElement(children)) {
		return renderElement(children, options)
	}

	return String(children)
}

/**
 * Render a Box component with borders, padding, and layout
 */
function renderBox(props: BoxProps, options: RenderOptions): string {
	const format = options.format || 'unicode'
	const maxWidth = options.width || 0

	const {
		children,
		borderStyle = 'single',
		flexDirection = 'column'
	} = props

	const padding = getPadding(props)
	const margin = getMargin(props)

	// For plain format, render without borders
	if (format === 'plain') {
		return renderPlainBox(props, options)
	}

	// For markdown format, render as blockquote
	if (format === 'markdown') {
		return renderMarkdownBox(props, options)
	}

	// Select border characters based on format
	let chars: typeof asciiBorderChars
	if (format === 'ascii') {
		chars = asciiBorderChars
	} else {
		chars = borderChars[borderStyle as BorderStyle] || borderChars.single
	}

	// Render children based on flex direction
	let contentLines: string[] = []

	if (children !== undefined && children !== null) {
		if (Array.isArray(children)) {
			if (flexDirection === 'row') {
				// Row: all children on the same line
				const renderedChildren = children.map(child => {
					if (React.isValidElement(child)) {
						return renderElement(child, options)
					}
					return String(child ?? '')
				})
				contentLines = [renderedChildren.join(' ')]
			} else {
				// Column: each child on a new line
				for (const child of children) {
					if (React.isValidElement(child)) {
						const rendered = renderElement(child, options)
						contentLines.push(...rendered.split('\n'))
					} else if (child !== null && child !== undefined) {
						contentLines.push(String(child))
					}
				}
			}
		} else if (React.isValidElement(children)) {
			const rendered = renderElement(children, options)
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
	let innerWidth = maxContentWidth + padding.left + padding.right

	// Apply width constraint if specified
	// Border takes 2 chars (left + right), margin takes margin.left
	if (maxWidth > 0) {
		const availableInnerWidth = maxWidth - 2 - margin.left
		if (availableInnerWidth > 0 && innerWidth > availableInnerWidth) {
			innerWidth = availableInnerWidth
			// Rewrap content to fit
			const newContentLines: string[] = []
			const contentMaxWidth = availableInnerWidth - padding.left - padding.right
			for (const line of contentLines) {
				const strippedLine = stripAnsi(line)
				if (strippedLine.length > contentMaxWidth) {
					newContentLines.push(...wrapText(strippedLine, contentMaxWidth))
				} else {
					newContentLines.push(line)
				}
			}
			contentLines = newContentLines
		}
	}

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
		const rightPadAmount = Math.max(0, innerWidth - contentWidth - padding.left)
		const rightPad = ' '.repeat(rightPadAmount)
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
 * Render a Box in plain format (no borders, just indented content)
 */
function renderPlainBox(props: BoxProps, options: RenderOptions): string {
	const { children, flexDirection = 'column' } = props
	const padding = getPadding(props)

	let contentLines: string[] = []

	if (children !== undefined && children !== null) {
		if (Array.isArray(children)) {
			if (flexDirection === 'row') {
				const renderedChildren = children.map(child => {
					if (React.isValidElement(child)) {
						return renderElement(child, options)
					}
					return String(child ?? '')
				})
				contentLines = [renderedChildren.join(' ')]
			} else {
				for (const child of children) {
					if (React.isValidElement(child)) {
						const rendered = renderElement(child, options)
						contentLines.push(...rendered.split('\n'))
					} else if (child !== null && child !== undefined) {
						contentLines.push(String(child))
					}
				}
			}
		} else if (React.isValidElement(children)) {
			const rendered = renderElement(children, options)
			contentLines = rendered.split('\n')
		} else {
			contentLines = [String(children)]
		}
	}

	// Apply indentation based on padding
	const indent = ' '.repeat(padding.left)
	const lines: string[] = []

	// Add top padding as empty lines
	for (let i = 0; i < padding.top; i++) {
		lines.push('')
	}

	for (const line of contentLines) {
		lines.push(indent + line)
	}

	// Add bottom padding as empty lines
	for (let i = 0; i < padding.bottom; i++) {
		lines.push('')
	}

	return lines.join('\n')
}

/**
 * Render a Box in markdown format (as blockquote)
 */
function renderMarkdownBox(props: BoxProps, options: RenderOptions): string {
	const { children, flexDirection = 'column' } = props

	let contentLines: string[] = []

	if (children !== undefined && children !== null) {
		if (Array.isArray(children)) {
			if (flexDirection === 'row') {
				const renderedChildren = children.map(child => {
					if (React.isValidElement(child)) {
						return renderElement(child, options)
					}
					return String(child ?? '')
				})
				contentLines = [renderedChildren.join(' ')]
			} else {
				for (const child of children) {
					if (React.isValidElement(child)) {
						const rendered = renderElement(child, options)
						contentLines.push(...rendered.split('\n'))
					} else if (child !== null && child !== undefined) {
						contentLines.push(String(child))
					}
				}
			}
		} else if (React.isValidElement(children)) {
			const rendered = renderElement(children, options)
			contentLines = rendered.split('\n')
		} else {
			contentLines = [String(children)]
		}
	}

	// Render as blockquote
	return contentLines.map(line => `> ${line}`).join('\n')
}

/**
 * Convert a React element to JSON structure
 */
function elementToJson(element: React.ReactElement | string | number | null | undefined): any {
	if (element === null || element === undefined) {
		return null
	}
	if (typeof element === 'string' || typeof element === 'number') {
		return String(element)
	}

	const { type, props } = element

	// Determine the type name
	let typeName: string
	if (typeof type === 'string') {
		typeName = type
	} else if (typeof type === 'function') {
		typeName = type.name || 'Unknown'
	} else {
		typeName = 'Unknown'
	}

	// Extract props (excluding children and internal markers)
	const propsOut: Record<string, any> = {}
	for (const [key, value] of Object.entries(props || {})) {
		if (key !== 'children' && !key.startsWith('__')) {
			propsOut[key] = value
		}
	}

	// Process children
	let childrenOut: any
	if (props?.children !== undefined && props?.children !== null) {
		if (Array.isArray(props.children)) {
			childrenOut = props.children.map((child: any) => {
				if (React.isValidElement(child)) {
					return elementToJson(child)
				}
				return String(child ?? '')
			})
		} else if (React.isValidElement(props.children)) {
			childrenOut = [elementToJson(props.children)]
		} else {
			childrenOut = String(props.children)
		}
	}

	const result: any = {
		type: typeName,
		props: propsOut,
	}

	if (childrenOut !== undefined) {
		result.children = childrenOut
	}

	// Add layout info if padding is specified
	if (propsOut.padding !== undefined) {
		result.layout = { padding: propsOut.padding }
	}

	return result
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
	options?: RenderOptions
): string {
	const opts: RenderOptions = options || {}
	const format = opts.format || 'unicode'
	const maxWidth = opts.width || 0

	// Handle JSON format separately
	if (format === 'json') {
		return JSON.stringify(elementToJson(element), null, 2)
	}

	let result = renderElement(element, opts)

	// Apply width constraint to final output if needed
	if (maxWidth > 0) {
		const lines = result.split('\n')
		const constrainedLines = lines.map(line => {
			const visualLen = visualWidth(line)
			if (visualLen <= maxWidth) {
				return line
			}
			// For lines with ANSI codes, we need to be careful
			// Simple approach: strip to visual width
			const stripped = stripAnsi(line)
			if (stripped.length <= maxWidth) {
				return line
			}
			return stripped.substring(0, maxWidth)
		})
		result = constrainedLines.join('\n')
	}

	return result
}

/**
 * Detect the best output format based on environment
 */
export function detectFormat(): OutputFormat {
	// Check for CI environment
	if (process.env.CI) {
		return 'plain'
	}

	// Check for NO_COLOR
	if (process.env.NO_COLOR) {
		return 'plain'
	}

	// Check for dumb terminal
	if (process.env.TERM === 'dumb') {
		return 'ascii'
	}

	// Default to unicode for modern terminals
	return 'unicode'
}
