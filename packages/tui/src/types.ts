/**
 * TUI Package Types
 */

export type RenderEngine = 'opentui' | 'ink' | 'text'

export type ColorMode = 'auto' | 'truecolor' | '256' | '16' | 'none'

export interface TUIConfig {
  /**
   * Preferred renderer engine
   * @default 'auto'
   */
  renderer?: RenderEngine | 'auto'

  /**
   * Color mode for terminal output
   * @default 'auto'
   */
  colorMode?: ColorMode

  /**
   * Theme configuration
   */
  theme?: ThemeConfig

  /**
   * Enable vim-style navigation (hjkl)
   * @default true
   */
  vimMode?: boolean

  /**
   * Screen reader support
   * @default false
   */
  announceChanges?: boolean

  /**
   * Debug mode - show additional info
   * @default false
   */
  debug?: boolean
}

export interface ThemeConfig {
  /**
   * Primary brand color
   */
  primary?: string

  /**
   * Secondary brand color
   */
  secondary?: string

  /**
   * Accent color for links and highlights
   */
  accent?: string

  /**
   * Success state color
   */
  success?: string

  /**
   * Warning state color
   */
  warning?: string

  /**
   * Error state color
   */
  error?: string

  /**
   * Info state color
   */
  info?: string
}

/**
 * Re-export View types from core for convenience
 */
export type {
  View,
  ViewType,
  ViewState,
  RenderOutput,
  ListView,
  DetailView,
  FormView,
  ShellView,
  SplitView,
  PanelView,
  TabView,
  EmptyView,
  LoadingView,
  ErrorView,
  CommandView,
  DialogView,
} from '@saaskit/core'
