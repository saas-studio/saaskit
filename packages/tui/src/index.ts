/**
 * @saaskit/tui - Terminal UI renderer for SaaSkit
 *
 * Primary renderer: OpenTUI (@opentui/react)
 * Fallback renderer: React Ink
 */

// Main exports
export { TUIApp, startTUI } from './App'
export { render, renderWithOpenTUI, renderWithInk, renderAsText } from './render'

// Components
export * from './components'

// Hooks
export * from './hooks'

// Context
export { AppContext, useAppContext } from './context/AppContext'
export { FocusProvider, useFocusManager } from './context/FocusContext'
export { ThemeProvider, useTheme } from './context/ThemeContext'

// Types
export type { TUIConfig, RenderEngine } from './types'
