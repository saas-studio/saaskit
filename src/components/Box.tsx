/**
 * Box component for terminal rendering
 */
import React from 'react'

export type BorderStyle = 'single' | 'double' | 'rounded' | 'none'
export type FlexDirection = 'row' | 'column'

export interface BoxProps {
	children?: React.ReactNode
	borderStyle?: BorderStyle
	flexDirection?: FlexDirection
	// Padding
	padding?: number
	paddingX?: number
	paddingY?: number
	paddingTop?: number
	paddingRight?: number
	paddingBottom?: number
	paddingLeft?: number
	// Margin
	margin?: number
	marginX?: number
	marginY?: number
	marginTop?: number
	marginRight?: number
	marginBottom?: number
	marginLeft?: number
}

// Box-drawing characters for different border styles
export const borderChars = {
	single: {
		topLeft: '\u250c',     // ┌
		topRight: '\u2510',    // ┐
		bottomLeft: '\u2514',  // └
		bottomRight: '\u2518', // ┘
		horizontal: '\u2500',  // ─
		vertical: '\u2502',    // │
	},
	double: {
		topLeft: '\u2554',     // ╔
		topRight: '\u2557',    // ╗
		bottomLeft: '\u255a',  // ╚
		bottomRight: '\u255d', // ╝
		horizontal: '\u2550',  // ═
		vertical: '\u2551',    // ║
	},
	rounded: {
		topLeft: '\u256d',     // ╭
		topRight: '\u256e',    // ╮
		bottomLeft: '\u2570',  // ╰
		bottomRight: '\u256f', // ╯
		horizontal: '\u2500',  // ─
		vertical: '\u2502',    // │
	},
	none: {
		topLeft: '',
		topRight: '',
		bottomLeft: '',
		bottomRight: '',
		horizontal: '',
		vertical: '',
	},
}

/**
 * Box component for creating bordered containers in the terminal.
 *
 * Supports various border styles, flexbox-like layout, padding, and margin.
 */
export function Box(props: BoxProps): React.ReactElement {
	return React.createElement('box', {
		...props,
		__isBox: true,
	})
}

/**
 * Calculate padding values from BoxProps
 */
export function getPadding(props: BoxProps): { top: number; right: number; bottom: number; left: number } {
	const { padding = 0, paddingX, paddingY, paddingTop, paddingRight, paddingBottom, paddingLeft } = props

	return {
		top: paddingTop ?? paddingY ?? padding,
		right: paddingRight ?? paddingX ?? padding,
		bottom: paddingBottom ?? paddingY ?? padding,
		left: paddingLeft ?? paddingX ?? padding,
	}
}

/**
 * Calculate margin values from BoxProps
 */
export function getMargin(props: BoxProps): { top: number; right: number; bottom: number; left: number } {
	const { margin = 0, marginX, marginY, marginTop, marginRight, marginBottom, marginLeft } = props

	return {
		top: marginTop ?? marginY ?? margin,
		right: marginRight ?? marginX ?? margin,
		bottom: marginBottom ?? marginY ?? margin,
		left: marginLeft ?? marginX ?? margin,
	}
}
