/**
 * TUI Components
 *
 * All components that render View types to terminal UI.
 */

// Data Views
export { ListView } from './data/ListView'
export { DetailView } from './data/DetailView'
export { FormView } from './data/FormView'

// Layout Views
export { ShellView } from './layout/ShellView'
export { SplitView } from './layout/SplitView'
export { PanelView } from './layout/PanelView'
export { TabView } from './layout/TabView'

// Meta Views
export { EmptyView } from './meta/EmptyView'
export { LoadingView } from './meta/LoadingView'
export { ErrorView } from './meta/ErrorView'

// Interaction Views
export { CommandPalette } from './interaction/CommandPalette'
export { DialogView } from './interaction/DialogView'

// Input Components
export * from './inputs'

// Primitives (re-export from OpenTUI or provide fallbacks)
export { Box, Text, Spacer } from './primitives'
