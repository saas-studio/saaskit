/**
 * Terminal Capabilities Detection
 *
 * Detects terminal color support, Unicode capabilities, and interactivity features.
 * Supports progressive enhancement from plain text to full color Unicode terminals.
 */

export type ColorSupport = 'truecolor' | '256' | '16' | 'none'
export type UnicodeSupport = 'full' | 'basic' | 'none'

export interface TerminalCapabilities {
	/** Color depth support */
	colorSupport: ColorSupport
	/** Unicode rendering support */
	unicodeSupport: UnicodeSupport
	/** Whether terminal supports bold text */
	bold: boolean
	/** Whether terminal supports italic text */
	italic: boolean
	/** Whether terminal supports underline */
	underline: boolean
	/** Whether terminal supports dim text */
	dim: boolean
	/** Whether this is an interactive TTY */
	isTTY: boolean
	/** Terminal width in columns */
	width: number
	/** Terminal height in rows */
	height: number
	/** Whether cursor positioning is supported */
	cursorControl: boolean
	/** Whether alternate screen buffer is supported */
	alternateScreen: boolean
	/** Whether mouse input is supported */
	mouse: boolean
	/** Whether hyperlinks are supported (OSC 8) */
	hyperlinks: boolean
}

/**
 * Default capabilities for non-TTY environments
 */
const NON_TTY_CAPABILITIES: TerminalCapabilities = {
	colorSupport: 'none',
	unicodeSupport: 'none',
	bold: false,
	italic: false,
	underline: false,
	dim: false,
	isTTY: false,
	width: 80,
	height: 24,
	cursorControl: false,
	alternateScreen: false,
	mouse: false,
	hyperlinks: false,
}

/**
 * Detect color support level from environment
 */
function detectColorSupport(): ColorSupport {
	// Respect NO_COLOR environment variable
	if (process.env.NO_COLOR !== undefined) {
		return 'none'
	}

	// Respect FORCE_COLOR environment variable
	if (process.env.FORCE_COLOR !== undefined) {
		const level = parseInt(process.env.FORCE_COLOR, 10)
		if (level === 0) return 'none'
		if (level === 1) return '16'
		if (level === 2) return '256'
		if (level >= 3) return 'truecolor'
	}

	// Check for truecolor support
	if (
		process.env.COLORTERM === 'truecolor' ||
		process.env.COLORTERM === '24bit'
	) {
		return 'truecolor'
	}

	// Check TERM for 256 color support
	const term = process.env.TERM || ''
	if (term.includes('256color') || term.includes('256')) {
		return '256'
	}

	// Check for known truecolor terminals
	const termProgram = process.env.TERM_PROGRAM || ''
	const truecolorTerminals = [
		'iTerm.app',
		'Apple_Terminal',
		'Hyper',
		'vscode',
		'Terminus',
		'WezTerm',
		'Alacritty',
		'kitty',
	]
	if (truecolorTerminals.includes(termProgram)) {
		return 'truecolor'
	}

	// Check for Windows Terminal
	if (process.env.WT_SESSION) {
		return 'truecolor'
	}

	// CI environments typically support basic colors
	if (process.env.CI) {
		// GitHub Actions supports 256 colors
		if (process.env.GITHUB_ACTIONS) {
			return '256'
		}
		return '16'
	}

	// Check if we're in a TTY
	if (process.stdout.isTTY) {
		// Most modern terminals support at least 16 colors
		return '16'
	}

	return 'none'
}

/**
 * Detect Unicode support level
 */
function detectUnicodeSupport(): UnicodeSupport {
	// Check for explicit override
	if (process.env.SAASKIT_UNICODE === 'full') return 'full'
	if (process.env.SAASKIT_UNICODE === 'basic') return 'basic'
	if (process.env.SAASKIT_UNICODE === 'none') return 'none'

	// Check LANG/LC_ALL for UTF-8
	const lang = process.env.LANG || process.env.LC_ALL || ''
	const hasUtf8 = lang.toLowerCase().includes('utf-8') || lang.toLowerCase().includes('utf8')

	if (!hasUtf8) {
		return 'none'
	}

	// Check TERM for Unicode-capable terminals
	const term = process.env.TERM || ''
	const termProgram = process.env.TERM_PROGRAM || ''

	// Known terminals with full Unicode support
	const fullUnicodeTerminals = [
		'iTerm.app',
		'Apple_Terminal',
		'Hyper',
		'vscode',
		'WezTerm',
		'Alacritty',
		'kitty',
		'Terminus',
	]

	if (fullUnicodeTerminals.includes(termProgram)) {
		return 'full'
	}

	// xterm-256color and similar usually have good Unicode support
	if (term.includes('xterm') || term.includes('vt100') || term.includes('linux')) {
		return 'full'
	}

	// Windows Terminal
	if (process.env.WT_SESSION) {
		return 'full'
	}

	// Default to basic Unicode for UTF-8 locales
	return 'basic'
}

/**
 * Detect terminal dimensions
 */
function detectDimensions(): { width: number; height: number } {
	// Check for explicit override
	if (process.env.COLUMNS && process.env.LINES) {
		return {
			width: parseInt(process.env.COLUMNS, 10) || 80,
			height: parseInt(process.env.LINES, 10) || 24,
		}
	}

	// Try to get from stdout
	if (process.stdout.columns && process.stdout.rows) {
		return {
			width: process.stdout.columns,
			height: process.stdout.rows,
		}
	}

	// Default dimensions
	return { width: 80, height: 24 }
}

/**
 * Detect if hyperlinks (OSC 8) are supported
 */
function detectHyperlinkSupport(): boolean {
	const termProgram = process.env.TERM_PROGRAM || ''
	const supportedTerminals = [
		'iTerm.app',
		'WezTerm',
		'Alacritty',
		'kitty',
		'vscode',
	]
	return supportedTerminals.includes(termProgram) || !!process.env.WT_SESSION
}

/**
 * Cache for detected capabilities
 */
let cachedCapabilities: TerminalCapabilities | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5000 // 5 seconds

/**
 * Detect all terminal capabilities
 *
 * Results are cached for performance with a 5-second TTL to handle
 * terminal resize events and environment changes.
 */
export function detectCapabilities(forceRefresh = false): TerminalCapabilities {
	const now = Date.now()

	// Return cached result if valid
	if (!forceRefresh && cachedCapabilities && now - cacheTimestamp < CACHE_TTL) {
		// Always refresh dimensions as they can change
		const dimensions = detectDimensions()
		return {
			...cachedCapabilities,
			width: dimensions.width,
			height: dimensions.height,
		}
	}

	// Non-TTY gets minimal capabilities
	if (!process.stdout.isTTY) {
		cachedCapabilities = NON_TTY_CAPABILITIES
		cacheTimestamp = now
		return cachedCapabilities
	}

	const colorSupport = detectColorSupport()
	const unicodeSupport = detectUnicodeSupport()
	const dimensions = detectDimensions()

	cachedCapabilities = {
		colorSupport,
		unicodeSupport,
		bold: colorSupport !== 'none',
		italic: colorSupport !== 'none',
		underline: colorSupport !== 'none',
		dim: colorSupport !== 'none',
		isTTY: true,
		width: dimensions.width,
		height: dimensions.height,
		cursorControl: true,
		alternateScreen: true,
		mouse: colorSupport !== 'none',
		hyperlinks: detectHyperlinkSupport(),
	}

	cacheTimestamp = now
	return cachedCapabilities
}

/**
 * Clear the capabilities cache (useful for testing)
 */
export function clearCapabilitiesCache(): void {
	cachedCapabilities = null
	cacheTimestamp = 0
}

/**
 * Get the recommended output format based on detected capabilities
 */
export function getRecommendedFormat(): 'unicode' | 'ascii' | 'plain' {
	const caps = detectCapabilities()

	if (caps.unicodeSupport === 'full') {
		return 'unicode'
	}

	if (caps.unicodeSupport === 'basic' || caps.isTTY) {
		return 'ascii'
	}

	return 'plain'
}

/**
 * Check if a specific capability is available
 */
export function hasCapability(
	capability: keyof TerminalCapabilities
): boolean {
	const caps = detectCapabilities()
	const value = caps[capability]
	if (typeof value === 'boolean') {
		return value
	}
	if (typeof value === 'string') {
		return value !== 'none'
	}
	return value > 0
}

/**
 * Subscribe to terminal resize events
 */
export function onResize(callback: (width: number, height: number) => void): () => void {
	const handler = () => {
		const dims = detectDimensions()
		callback(dims.width, dims.height)
	}

	process.stdout.on('resize', handler)

	return () => {
		process.stdout.off('resize', handler)
	}
}
