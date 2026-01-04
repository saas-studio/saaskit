/**
 * Style System with Caching
 *
 * Provides efficient ANSI escape sequence generation with LRU caching
 * for commonly used style combinations. Supports progressive color modes.
 */

import { detectCapabilities, type ColorSupport } from './capabilities'

// ============================================================================
// Color Palette (from DESIGN-SYSTEM.md)
// ============================================================================

/**
 * Semantic color palette with TrueColor values
 */
export const colors = {
	primary: {
		50: '#EFF6FF',
		100: '#DBEAFE',
		200: '#BFDBFE',
		300: '#93C5FD',
		400: '#60A5FA',
		500: '#3B82F6',
		600: '#2563EB',
		700: '#1D4ED8',
		800: '#1E40AF',
		900: '#1E3A8A',
	},
	success: {
		50: '#F0FDF4',
		100: '#DCFCE7',
		200: '#BBF7D0',
		300: '#86EFAC',
		400: '#4ADE80',
		500: '#22C55E',
		600: '#16A34A',
		700: '#15803D',
		800: '#166534',
		900: '#14532D',
	},
	warning: {
		50: '#FEFCE8',
		100: '#FEF9C3',
		200: '#FEF08A',
		300: '#FDE047',
		400: '#FACC15',
		500: '#EAB308',
		600: '#CA8A04',
		700: '#A16207',
		800: '#854D0E',
		900: '#713F12',
	},
	error: {
		50: '#FEF2F2',
		100: '#FEE2E2',
		200: '#FECACA',
		300: '#FCA5A5',
		400: '#F87171',
		500: '#EF4444',
		600: '#DC2626',
		700: '#B91C1C',
		800: '#991B1B',
		900: '#7F1D1D',
	},
	neutral: {
		50: '#FAFAFA',
		100: '#F5F5F5',
		200: '#E5E5E5',
		300: '#D4D4D4',
		400: '#A3A3A3',
		500: '#737373',
		600: '#525252',
		700: '#404040',
		800: '#262626',
		900: '#171717',
	},
	info: {
		50: '#ECFEFF',
		100: '#CFFAFE',
		200: '#A5F3FC',
		300: '#67E8F9',
		400: '#22D3EE',
		500: '#06B6D4',
		600: '#0891B2',
		700: '#0E7490',
		800: '#155E75',
		900: '#164E63',
	},
} as const

/**
 * 256-color xterm palette mappings
 */
export const colors256 = {
	primary: { light: 153, default: 33, dark: 27 },
	success: { light: 157, default: 34, dark: 28 },
	warning: { light: 229, default: 220, dark: 178 },
	error: { light: 217, default: 196, dark: 124 },
	neutral: { light: 252, default: 245, dark: 238 },
	info: { light: 159, default: 37, dark: 30 },
} as const

/**
 * 16-color ANSI code mappings
 */
export const colors16 = {
	primary: 94, // Bright Blue
	success: 92, // Bright Green
	warning: 93, // Bright Yellow
	error: 91, // Bright Red
	info: 96, // Bright Cyan
	dim: 90, // Bright Black (gray)
	black: 30,
	red: 31,
	green: 32,
	yellow: 33,
	blue: 34,
	magenta: 35,
	cyan: 36,
	white: 37,
} as const

// ============================================================================
// ANSI Escape Sequences
// ============================================================================

const ESC = '\x1b['
const RESET = `${ESC}0m`

/**
 * Text style modifiers
 */
export const modifiers = {
	reset: RESET,
	bold: `${ESC}1m`,
	dim: `${ESC}2m`,
	italic: `${ESC}3m`,
	underline: `${ESC}4m`,
	blink: `${ESC}5m`,
	inverse: `${ESC}7m`,
	hidden: `${ESC}8m`,
	strikethrough: `${ESC}9m`,
	// Reset individual modifiers
	boldOff: `${ESC}22m`,
	dimOff: `${ESC}22m`,
	italicOff: `${ESC}23m`,
	underlineOff: `${ESC}24m`,
	blinkOff: `${ESC}25m`,
	inverseOff: `${ESC}27m`,
	hiddenOff: `${ESC}28m`,
	strikethroughOff: `${ESC}29m`,
} as const

// ============================================================================
// Color Conversion Utilities
// ============================================================================

/**
 * Parse hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
	if (!match) return null
	return {
		r: parseInt(match[1], 16),
		g: parseInt(match[2], 16),
		b: parseInt(match[3], 16),
	}
}

/**
 * Convert RGB to nearest xterm-256 color
 */
function rgbTo256(r: number, g: number, b: number): number {
	// Check grayscale ramp first (232-255)
	if (r === g && g === b) {
		if (r < 8) return 16 // Black
		if (r > 248) return 231 // White
		return Math.round((r - 8) / 247 * 24) + 232
	}

	// Color cube (16-231)
	const toAnsi = (v: number) => {
		if (v < 48) return 0
		if (v < 115) return 1
		return Math.min(5, Math.floor((v - 35) / 40))
	}

	return 16 + 36 * toAnsi(r) + 6 * toAnsi(g) + toAnsi(b)
}

/**
 * Convert RGB to nearest ANSI 16 color
 */
function rgbTo16(r: number, g: number, b: number): number {
	// Calculate brightness
	const brightness = (r * 299 + g * 587 + b * 114) / 1000

	// Determine base color
	let code = 30 // black

	if (r > 128 && g < 128 && b < 128) code = 31 // red
	else if (r < 128 && g > 128 && b < 128) code = 32 // green
	else if (r > 128 && g > 128 && b < 128) code = 33 // yellow
	else if (r < 128 && g < 128 && b > 128) code = 34 // blue
	else if (r > 128 && g < 128 && b > 128) code = 35 // magenta
	else if (r < 128 && g > 128 && b > 128) code = 36 // cyan
	else if (r > 128 && g > 128 && b > 128) code = 37 // white

	// Add brightness modifier (90-97 for bright variants)
	if (brightness > 170) {
		code += 60
	}

	return code
}

// ============================================================================
// Style Cache (LRU)
// ============================================================================

interface CacheEntry {
	value: string
	accessTime: number
}

const MAX_CACHE_SIZE = 256
const styleCache = new Map<string, CacheEntry>()

/**
 * Get a cached style or compute and cache it
 */
function getCachedStyle(key: string, compute: () => string): string {
	const cached = styleCache.get(key)
	if (cached) {
		cached.accessTime = Date.now()
		return cached.value
	}

	const value = compute()

	// Evict oldest entries if cache is full
	if (styleCache.size >= MAX_CACHE_SIZE) {
		let oldest: string | null = null
		let oldestTime = Infinity

		for (const [k, entry] of styleCache) {
			if (entry.accessTime < oldestTime) {
				oldest = k
				oldestTime = entry.accessTime
			}
		}

		if (oldest) {
			styleCache.delete(oldest)
		}
	}

	styleCache.set(key, { value, accessTime: Date.now() })
	return value
}

/**
 * Clear the style cache
 */
export function clearStyleCache(): void {
	styleCache.clear()
}

// ============================================================================
// Style Generation
// ============================================================================

export interface StyleOptions {
	color?: string
	backgroundColor?: string
	bold?: boolean
	dim?: boolean
	italic?: boolean
	underline?: boolean
	inverse?: boolean
	strikethrough?: boolean
}

/**
 * Generate foreground color escape sequence
 */
function generateFgColor(color: string, support: ColorSupport): string {
	if (support === 'none') return ''

	// Check for semantic color names
	const semanticMatch = color.match(/^(primary|success|warning|error|info|neutral)\.?(\d+)?$/)
	if (semanticMatch) {
		const [, name, shade] = semanticMatch
		const palette = colors[name as keyof typeof colors]
		const shadeKey = (shade ? parseInt(shade, 10) : 500) as keyof typeof palette
		const hex = palette[shadeKey] || palette[500]
		return generateFgColor(hex, support)
	}

	// Check for basic color names
	if (color in colors16) {
		return `${ESC}${colors16[color as keyof typeof colors16]}m`
	}

	// Handle hex colors
	const rgb = hexToRgb(color)
	if (!rgb) return ''

	if (support === 'truecolor') {
		return `${ESC}38;2;${rgb.r};${rgb.g};${rgb.b}m`
	}

	if (support === '256') {
		return `${ESC}38;5;${rgbTo256(rgb.r, rgb.g, rgb.b)}m`
	}

	return `${ESC}${rgbTo16(rgb.r, rgb.g, rgb.b)}m`
}

/**
 * Generate background color escape sequence
 */
function generateBgColor(color: string, support: ColorSupport): string {
	if (support === 'none') return ''

	// Check for semantic color names
	const semanticMatch = color.match(/^(primary|success|warning|error|info|neutral)\.?(\d+)?$/)
	if (semanticMatch) {
		const [, name, shade] = semanticMatch
		const palette = colors[name as keyof typeof colors]
		const shadeKey = (shade ? parseInt(shade, 10) : 500) as keyof typeof palette
		const hex = palette[shadeKey] || palette[500]
		return generateBgColor(hex, support)
	}

	// Handle hex colors
	const rgb = hexToRgb(color)
	if (!rgb) return ''

	if (support === 'truecolor') {
		return `${ESC}48;2;${rgb.r};${rgb.g};${rgb.b}m`
	}

	if (support === '256') {
		return `${ESC}48;5;${rgbTo256(rgb.r, rgb.g, rgb.b)}m`
	}

	// For 16-color, add 10 to fg code for bg
	return `${ESC}${rgbTo16(rgb.r, rgb.g, rgb.b) + 10}m`
}

/**
 * Generate complete style escape sequence
 */
export function generateStyle(options: StyleOptions, colorSupport?: ColorSupport): string {
	const support = colorSupport ?? detectCapabilities().colorSupport

	// Create cache key
	const cacheKey = JSON.stringify({ ...options, support })

	return getCachedStyle(cacheKey, () => {
		const codes: string[] = []

		if (options.bold) codes.push(modifiers.bold)
		if (options.dim) codes.push(modifiers.dim)
		if (options.italic) codes.push(modifiers.italic)
		if (options.underline) codes.push(modifiers.underline)
		if (options.inverse) codes.push(modifiers.inverse)
		if (options.strikethrough) codes.push(modifiers.strikethrough)

		if (options.color) {
			codes.push(generateFgColor(options.color, support))
		}

		if (options.backgroundColor) {
			codes.push(generateBgColor(options.backgroundColor, support))
		}

		return codes.join('')
	})
}

/**
 * Apply style to text with automatic reset
 */
export function style(text: string, options: StyleOptions): string {
	const styleCode = generateStyle(options)
	if (!styleCode) return text
	return `${styleCode}${text}${RESET}`
}

/**
 * Create a reusable style function
 */
export function createStyle(options: StyleOptions): (text: string) => string {
	const styleCode = generateStyle(options)
	if (!styleCode) return (text: string) => text
	return (text: string) => `${styleCode}${text}${RESET}`
}

// ============================================================================
// Convenience Style Functions
// ============================================================================

export const bold = createStyle({ bold: true })
export const dim = createStyle({ dim: true })
export const italic = createStyle({ italic: true })
export const underline = createStyle({ underline: true })
export const inverse = createStyle({ inverse: true })
export const strikethrough = createStyle({ strikethrough: true })

// Semantic colors
export const primary = createStyle({ color: 'primary.500' })
export const success = createStyle({ color: 'success.500' })
export const warning = createStyle({ color: 'warning.500' })
export const error = createStyle({ color: 'error.500' })
export const info = createStyle({ color: 'info.500' })
export const muted = createStyle({ color: 'neutral.500' })

// Combined styles
export const successBold = createStyle({ color: 'success.500', bold: true })
export const errorBold = createStyle({ color: 'error.500', bold: true })
export const warningBold = createStyle({ color: 'warning.500', bold: true })
export const highlight = createStyle({ backgroundColor: 'primary.100' })

// ============================================================================
// Strip ANSI
// ============================================================================

const ANSI_REGEX = /\x1b\[[0-9;]*m/g

/**
 * Strip all ANSI escape codes from a string
 */
export function stripAnsi(str: string): string {
	return str.replace(ANSI_REGEX, '')
}

/**
 * Get the visual width of a string (excluding ANSI codes)
 */
export function visualWidth(str: string): number {
	return stripAnsi(str).length
}

/**
 * Check if a string contains ANSI escape codes
 */
export function hasAnsi(str: string): boolean {
	return ANSI_REGEX.test(str)
}
