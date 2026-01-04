# OpenTUI Integration Guide

## Overview

SaaSkit's terminal UI layer is evolving from React Ink to **OpenTUI** as the primary renderer. OpenTUI provides a modern, layered architecture that aligns perfectly with SaaSkit's headless philosophy.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SaaSkit Architecture                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   <App/>                                                                     │
│      │                                                                       │
│      ▼                                                                       │
│   View System  ────────────────────────────────────────────────────────►     │
│   (Framework-Agnostic)                                                       │
│      │                                                                       │
│      ├─── OpenTUI Renderer (Primary) ◄── @opentui/react                     │
│      │         └── @opentui/core (Imperative API)                            │
│      │                                                                       │
│      └─── React Ink Renderer (Fallback)                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Why OpenTUI?

### Momentum & Modern Stack

OpenTUI is gaining immense traction (5.3K+ stars, growing rapidly) and is built on the most modern stack:

| Aspect | OpenTUI | React Ink |
|--------|---------|-----------|
| **Core Engine** | Standalone @opentui/core | Tightly coupled to React |
| **Layout** | Yoga (like Ink) | Yoga |
| **Frameworks** | React, Solid, Vue | React only |
| **Architecture** | Layered (core + reconcilers) | Monolithic |
| **Imperative API** | Yes (@opentui/core) | No |
| **Ecosystem** | Growing rapidly | Mature but static |

### Architectural Alignment

OpenTUI's layered design mirrors SaaSkit's headless philosophy:

```
OpenTUI                          SaaSkit
───────────                      ────────
@opentui/core (imperative)  ←→   View Types (framework-agnostic)
@opentui/react (declarative) ←→  React Components
CliRenderer                  ←→   TerminalRenderer
```

## Strategy: OpenTUI-Primary, Ink-Fallback

```typescript
// packages/tui/src/renderer.ts

import { detectRenderer, RendererType } from './detect'

export const createRenderer = (): RendererType => {
  // Try OpenTUI first
  try {
    const { CliRenderer } = require('@opentui/core')
    return { type: 'opentui', engine: new CliRenderer() }
  } catch (e) {
    // Fallback to React Ink
    const { render } = require('ink')
    return { type: 'ink', engine: { render } }
  }
}
```

## Installation

```bash
# Primary - OpenTUI with React reconciler
npm install @opentui/core @opentui/react

# Fallback - React Ink (already in deps)
npm install ink react
```

**Build Requirements:**
- OpenTUI requires **Zig** for building native components
- Development flows use **Bun** (recommended) or Node.js

```bash
# Install Zig (macOS)
brew install zig

# Or use Bun for development
curl -fsSL https://bun.sh/install | bash
```

## Architecture Deep Dive

### Layer 1: View System (Framework-Agnostic)

Your existing View types remain unchanged. They define **what** to render, not **how**:

```typescript
// This is already defined in your codebase
interface ListView<T> extends View<T[], ListViewConfig<T>> {
  type: 'list'
  config: ListViewConfig<T>
  behaviors: ListViewBehaviors<T>
  state: ListState<T>
  render(): RenderOutput  // Returns structured data, NOT UI elements
}
```

The `RenderOutput` interface is the contract between views and renderers:

```typescript
interface RenderOutput {
  type: string           // 'table', 'form', 'detail', etc.
  props: Record<string, unknown>
  children: RenderOutput[]

  // Multi-format representations (agent-friendly)
  text: string
  markdown: string
  ascii: string
  json: unknown
}
```

### Layer 2: OpenTUI Core (Imperative)

For maximum control, use `@opentui/core` directly:

```typescript
// packages/tui/src/core/renderer.ts
import { CliRenderer, TextRenderable, BoxRenderable } from '@opentui/core'

export class OpenTUIRenderer {
  private renderer: CliRenderer

  constructor() {
    this.renderer = new CliRenderer()
  }

  renderView(view: View): void {
    const output = view.render()
    const renderable = this.toRenderable(output)
    this.renderer.render(renderable)
  }

  private toRenderable(output: RenderOutput): BaseRenderable {
    switch (output.type) {
      case 'table':
        return this.renderTable(output)
      case 'form':
        return this.renderForm(output)
      case 'detail':
        return this.renderDetail(output)
      default:
        return new TextRenderable({ text: output.text })
    }
  }
}
```

### Layer 3: OpenTUI React (Declarative)

For React-style development, use `@opentui/react`:

```tsx
// packages/tui/src/react/App.tsx
import { OpenTUIProvider, Box, Text } from '@opentui/react'
import { useView } from '../hooks/useView'

export const TUIApp: React.FC<{ app: AppDefinition }> = ({ app }) => {
  return (
    <OpenTUIProvider>
      <Shell app={app}>
        <Router />
      </Shell>
    </OpenTUIProvider>
  )
}

// View-to-Component mapping
export const ViewRenderer: React.FC<{ view: View }> = ({ view }) => {
  switch (view.type) {
    case 'list':
      return <ListView view={view as ListView<any>} />
    case 'detail':
      return <DetailView view={view as DetailView<any>} />
    case 'form':
      return <FormView view={view as FormView<any>} />
    case 'shell':
      return <ShellView view={view as ShellView} />
    default:
      return <Text>{view.render().text}</Text>
  }
}
```

## Component Mapping

### SaaSkit View Types → OpenTUI Components

```typescript
// packages/tui/src/components/index.ts

// Data Views
export { ListView } from './data/ListView'      // Table, Grid, Cards, Kanban
export { DetailView } from './data/DetailView'  // Record display
export { FormView } from './data/FormView'      // Input forms

// Layout Views
export { ShellView } from './layout/ShellView'  // App container
export { SplitView } from './layout/SplitView'  // Pane dividers
export { PanelView } from './layout/PanelView'  // Modals/drawers
export { TabView } from './layout/TabView'      // Tab navigation

// Meta Views
export { EmptyView } from './meta/EmptyView'    // No data states
export { LoadingView } from './meta/LoadingView'// Loading states
export { ErrorView } from './meta/ErrorView'    // Error states

// Interaction Views
export { DialogView } from './interaction/DialogView'    // Modals
export { CommandView } from './interaction/CommandView'  // Command palette
```

### ListView Implementation

```tsx
// packages/tui/src/components/data/ListView.tsx
import { Box, Text, useInput, useFocus } from '@opentui/react'
import type { ListView as ListViewType } from '../../types'

interface ListViewProps<T extends { id: string }> {
  view: ListViewType<T>
}

export function ListView<T extends { id: string }>({ view }: ListViewProps<T>) {
  const { config, state, data } = view
  const { isFocused } = useFocus()

  // Keyboard navigation
  useInput((input, key) => {
    if (key.upArrow) view.state.focusedIndex = Math.max(0, state.focusedIndex - 1)
    if (key.downArrow) view.state.focusedIndex = Math.min(data.length - 1, state.focusedIndex + 1)
    if (key.return) view.onSelect?.(data[state.focusedIndex])
    if (input === '/') view.state.searchQuery = '' // Open search
  }, { isActive: isFocused })

  // Render based on variant
  switch (config.variant) {
    case 'table':
      return <TableVariant view={view} />
    case 'cards':
      return <CardsVariant view={view} />
    case 'kanban':
      return <KanbanVariant view={view} />
    default:
      return <TableVariant view={view} />
  }
}

// Table variant
function TableVariant<T extends { id: string }>({ view }: ListViewProps<T>) {
  const { config, state, data } = view
  const columns = config.columns || []

  return (
    <Box flexDirection="column" borderStyle="single">
      {/* Header */}
      {config.showHeader !== false && (
        <Box borderStyle="single" borderBottom>
          {columns.map(col => (
            <Box key={String(col.key)} width={col.width || 'auto'}>
              <Text bold color={colors.neutral[600]}>{col.header}</Text>
              {state.sortColumn === col.key && (
                <Text>{state.sortDirection === 'asc' ? ' ↑' : ' ↓'}</Text>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Rows */}
      {data.map((item, index) => (
        <TableRow
          key={item.id}
          item={item}
          columns={columns}
          focused={index === state.focusedIndex}
          selected={state.selectedIds.has(item.id)}
          onSelect={() => view.onSelect?.(item)}
        />
      ))}

      {/* Footer with pagination */}
      {config.showFooter !== false && (
        <Box justifyContent="space-between" paddingX={1}>
          <Text color={colors.neutral[500]}>
            {data.length} items
          </Text>
          {view.behaviors.paginated && (
            <Text>
              Page {state.page} of {state.totalPages}
            </Text>
          )}
        </Box>
      )}
    </Box>
  )
}
```

### FormView Implementation

```tsx
// packages/tui/src/components/data/FormView.tsx
import { Box, Text, useInput } from '@opentui/react'
import { TextInput, Select, Checkbox } from '../inputs'
import type { FormView as FormViewType, FormFieldConfig } from '../../types'

interface FormViewProps<T> {
  view: FormViewType<T>
}

export function FormView<T>({ view }: FormViewProps<T>) {
  const { config, state } = view

  // Keyboard navigation between fields
  useInput((input, key) => {
    if (key.tab) {
      const fields = config.fields.filter(f => !f.hidden)
      const currentIndex = fields.findIndex(f => f.name === state.focusedField)
      const nextIndex = key.shift
        ? Math.max(0, currentIndex - 1)
        : Math.min(fields.length - 1, currentIndex + 1)
      state.focusedField = fields[nextIndex].name
    }
    if (key.return && key.ctrl) {
      view.submit()
    }
  })

  // Wizard mode
  if (config.mode === 'wizard' && config.steps) {
    return <WizardForm view={view} />
  }

  // Standard form
  return (
    <Box flexDirection="column" gap={1}>
      {config.sections?.map(section => (
        <FormSection key={section.id} section={section} view={view} />
      )) || config.fields.map(field => (
        <FormField key={String(field.name)} field={field} view={view} />
      ))}

      <Box gap={2} marginTop={1}>
        <Button onPress={() => view.submit()}>
          {config.submitLabel || 'Submit'}
        </Button>
        <Button variant="ghost" onPress={() => view.onCancel?.()}>
          {config.cancelLabel || 'Cancel'}
        </Button>
      </Box>
    </Box>
  )
}

function FormField<T>({ field, view }: { field: FormFieldConfig<T>, view: FormViewType<T> }) {
  const { state } = view
  const value = state.values[field.name]
  const error = state.errors.get(field.name)
  const focused = state.focusedField === field.name

  const handleChange = (newValue: unknown) => {
    view.setFieldValue(field.name, newValue)
    view.onChange?.(field.name, newValue)
  }

  return (
    <Box flexDirection="column">
      <Text bold={focused}>
        {field.label}
        {field.required && <Text color={colors.error[500]}> *</Text>}
      </Text>

      <FieldInput
        type={field.type}
        value={value}
        onChange={handleChange}
        focused={focused}
        options={field.options}
        placeholder={field.placeholder}
        disabled={typeof field.disabled === 'function'
          ? field.disabled(state.values)
          : field.disabled}
      />

      {error && (
        <Text color={colors.error[500]}>{error}</Text>
      )}
      {field.helpText && !error && (
        <Text color={colors.neutral[500]}>{field.helpText}</Text>
      )}
    </Box>
  )
}
```

### ShellView (App Container)

```tsx
// packages/tui/src/components/layout/ShellView.tsx
import { Box, Text, useInput, useFocus } from '@opentui/react'
import type { ShellView as ShellViewType } from '../../types'

interface ShellViewProps {
  view: ShellViewType
  children: React.ReactNode
}

export function ShellView({ view, children }: ShellViewProps) {
  const { config, state } = view

  // Global keyboard shortcuts
  useInput((input, key) => {
    // Command palette
    if (key.ctrl && input === 'k') {
      state.commandPaletteOpen = !state.commandPaletteOpen
    }
    // Toggle sidebar
    if (key.ctrl && input === 'b') {
      state.sidebarCollapsed = !state.sidebarCollapsed
    }
  })

  return (
    <Box flexDirection="column" width="100%" height="100%">
      {/* Header */}
      {config.header && (
        <Box
          height={3}
          borderStyle="single"
          borderBottom
          justifyContent="space-between"
          paddingX={1}
        >
          <Box gap={2}>
            {config.branding?.logo && <Text>{config.branding.logo}</Text>}
            <Text bold>{config.branding?.title}</Text>
          </Box>
          <Box gap={2}>
            <NotificationBell count={state.notifications.filter(n => !n.read).length} />
            <Text color={colors.neutral[500]}>?</Text>
          </Box>
        </Box>
      )}

      {/* Main area with optional sidebar */}
      <Box flex={1}>
        {/* Sidebar */}
        {config.sidebar && !state.sidebarCollapsed && (
          <Box
            width={config.sidebar.width || 20}
            borderStyle="single"
            borderRight
            flexDirection="column"
          >
            <Navigation config={config.navigation} activePath={state.activePath} />
          </Box>
        )}

        {/* Main content */}
        <Box flex={1} padding={1}>
          {children}
        </Box>
      </Box>

      {/* Footer / Status bar */}
      {config.footer && (
        <Box height={1} borderStyle="single" borderTop paddingX={1}>
          <Text color={colors.neutral[500]}>
            [Ctrl+K] Command  [Ctrl+B] Toggle Sidebar  [?] Help
          </Text>
        </Box>
      )}

      {/* Command Palette Overlay */}
      {state.commandPaletteOpen && (
        <CommandPalette
          commands={[]}
          onClose={() => state.commandPaletteOpen = false}
        />
      )}
    </Box>
  )
}
```

## Hooks & State Management

### useView Hook

```tsx
// packages/tui/src/hooks/useView.ts
import { useState, useEffect, useMemo } from 'react'
import type { View, ViewType } from '../types'

export function useView<T extends View>(
  type: ViewType,
  config: T['config'],
  data?: T['data']
): T {
  const [state, setState] = useState<T['state']>(getInitialState(type))

  const view = useMemo(() => ({
    id: `view-${type}-${Date.now()}`,
    type,
    config,
    data,
    state,
    loading: false,
    error: null,
    behaviors: [],
    children: [],
    render: () => renderView(type, config, data, state),
  } as T), [type, config, data, state])

  return view
}
```

### useInput Hook (OpenTUI)

```tsx
// packages/tui/src/hooks/useInput.ts
import { useEffect, useCallback } from 'react'
import { useCliRenderer } from '@opentui/react'

interface KeyInfo {
  upArrow: boolean
  downArrow: boolean
  leftArrow: boolean
  rightArrow: boolean
  return: boolean
  escape: boolean
  tab: boolean
  shift: boolean
  ctrl: boolean
  meta: boolean
}

export function useInput(
  handler: (input: string, key: KeyInfo) => void,
  options?: { isActive?: boolean }
) {
  const renderer = useCliRenderer()
  const { isActive = true } = options || {}

  useEffect(() => {
    if (!isActive) return

    const onKeyPress = (event: KeyboardEvent) => {
      const key: KeyInfo = {
        upArrow: event.key === 'ArrowUp',
        downArrow: event.key === 'ArrowDown',
        leftArrow: event.key === 'ArrowLeft',
        rightArrow: event.key === 'ArrowRight',
        return: event.key === 'Enter',
        escape: event.key === 'Escape',
        tab: event.key === 'Tab',
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
        meta: event.metaKey,
      }
      handler(event.key, key)
    }

    renderer.on('keypress', onKeyPress)
    return () => renderer.off('keypress', onKeyPress)
  }, [handler, isActive, renderer])
}
```

### useFocus Hook

```tsx
// packages/tui/src/hooks/useFocus.ts
import { useState, useContext, useEffect } from 'react'
import { FocusContext } from '../context/FocusContext'

export function useFocus(options?: { id?: string; autoFocus?: boolean }) {
  const { focusedId, setFocusedId, registerFocusable } = useContext(FocusContext)
  const [id] = useState(options?.id || `focus-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    registerFocusable(id)
    if (options?.autoFocus) {
      setFocusedId(id)
    }
  }, [id, options?.autoFocus])

  return {
    isFocused: focusedId === id,
    focus: () => setFocusedId(id),
  }
}
```

## Color System Integration

Your existing color system in `packages/ink-ui/src/theme/colors.ts` works perfectly with OpenTUI:

```tsx
// packages/tui/src/theme/index.ts
import { colors, colors256, colors16, detectColorSupport } from '@saaskit/ink-ui/theme/colors'

export const getColor = (colorPath: string): string => {
  const support = detectColorSupport()

  // Truecolor - use full hex values
  if (support === 'truecolor') {
    return getNestedValue(colors, colorPath)
  }

  // 256-color - map to xterm codes
  if (support === '256') {
    return `\x1b[38;5;${getNestedValue(colors256, colorPath)}m`
  }

  // 16-color ANSI fallback
  return getNestedValue(colors16, colorPath)
}

// Usage in components
<Text color={getColor('primary.500')}>Primary action</Text>
<Text color={getColor('success.500')}>Success message</Text>
<Text color={getColor('error.500')}>Error message</Text>
```

## The `<App/>` Integration

### Entry Point

```tsx
// packages/tui/src/App.tsx
import { OpenTUIProvider } from '@opentui/react'
import { AppContext } from './context/AppContext'
import { ShellView } from './components/layout/ShellView'
import { Router } from './router'
import type { AppDefinition } from '@saaskit/core'

interface TUIAppProps {
  app: AppDefinition
}

export function TUIApp({ app }: TUIAppProps) {
  const shell = createShellView(app)

  return (
    <OpenTUIProvider>
      <AppContext.Provider value={app}>
        <ThemeProvider theme={app.theme}>
          <FocusProvider>
            <ShellView view={shell}>
              <Router resources={app.resources} />
            </ShellView>
          </FocusProvider>
        </ThemeProvider>
      </AppContext.Provider>
    </OpenTUIProvider>
  )
}

// Start the TUI
export function startTUI(app: AppDefinition) {
  const { render } = require('@opentui/react')
  render(<TUIApp app={app} />)
}
```

### From `<App/>` Component to TUI

```tsx
// packages/core/src/generators/tui.ts
import { startTUI } from '@saaskit/tui'
import type { AppDefinition, Resource } from '../types'

export function generateTUI(app: AppDefinition) {
  // The <App/> component already provides:
  // - app.name
  // - app.resources (from child components)
  // - app.theme
  // - app.config

  // Generate views for each resource
  const resourceViews = app.resources.map(resource => ({
    resource,
    listView: generateListView(resource),
    detailView: generateDetailView(resource),
    formView: generateFormView(resource),
  }))

  return {
    start: () => startTUI({ ...app, resourceViews }),
    resourceViews,
  }
}

function generateListView(resource: Resource): ListViewConfig<any> {
  return {
    variant: 'table',
    columns: resource.fields.map(field => ({
      key: field.name,
      header: field.label || titleCase(field.name),
      width: getFieldWidth(field),
      sortable: field.sortable !== false,
      render: getFieldRenderer(field),
    })),
    showHeader: true,
    showFooter: true,
    density: 'normal',
  }
}
```

## Progressive Enhancement

### Renderer Detection & Fallback

```typescript
// packages/tui/src/render.ts

type RenderEngine = 'opentui' | 'ink' | 'text'

export async function render(app: AppDefinition): Promise<void> {
  const engine = await detectBestRenderer()

  switch (engine) {
    case 'opentui':
      return renderWithOpenTUI(app)
    case 'ink':
      return renderWithInk(app)
    case 'text':
      return renderAsText(app)
  }
}

async function detectBestRenderer(): Promise<RenderEngine> {
  // Try OpenTUI first
  try {
    require.resolve('@opentui/core')
    require.resolve('@opentui/react')
    return 'opentui'
  } catch {
    // OpenTUI not available, try Ink
    try {
      require.resolve('ink')
      return 'ink'
    } catch {
      // Fallback to plain text
      return 'text'
    }
  }
}

async function renderWithOpenTUI(app: AppDefinition) {
  const { render } = await import('@opentui/react')
  const { TUIApp } = await import('./App')
  render(<TUIApp app={app} />)
}

async function renderWithInk(app: AppDefinition) {
  const { render } = await import('ink')
  const { InkApp } = await import('./InkApp')
  render(<InkApp app={app} />)
}

function renderAsText(app: AppDefinition) {
  const output = app.render()
  console.log(output.text)
}
```

## Input Components

### TextInput

```tsx
// packages/tui/src/components/inputs/TextInput.tsx
import { Box, Text, useInput, useFocus } from '@opentui/react'
import { useState } from 'react'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  focused?: boolean
  disabled?: boolean
  password?: boolean
}

export function TextInput({
  value,
  onChange,
  placeholder,
  focused,
  disabled,
  password,
}: TextInputProps) {
  const [cursorPos, setCursorPos] = useState(value.length)

  useInput((input, key) => {
    if (disabled) return

    if (key.leftArrow) {
      setCursorPos(Math.max(0, cursorPos - 1))
    } else if (key.rightArrow) {
      setCursorPos(Math.min(value.length, cursorPos + 1))
    } else if (input === '\x7f') { // Backspace
      const newValue = value.slice(0, cursorPos - 1) + value.slice(cursorPos)
      onChange(newValue)
      setCursorPos(Math.max(0, cursorPos - 1))
    } else if (input.length === 1 && !key.ctrl && !key.meta) {
      const newValue = value.slice(0, cursorPos) + input + value.slice(cursorPos)
      onChange(newValue)
      setCursorPos(cursorPos + 1)
    }
  }, { isActive: focused })

  const displayValue = password ? '•'.repeat(value.length) : value

  return (
    <Box
      borderStyle={focused ? 'bold' : 'single'}
      borderColor={focused ? colors.primary[500] : colors.neutral[300]}
      paddingX={1}
    >
      <Text color={disabled ? colors.neutral[400] : colors.neutral[700]}>
        {displayValue || (
          <Text color={colors.neutral[500]}>{placeholder}</Text>
        )}
        {focused && <Text inverse> </Text>}
      </Text>
    </Box>
  )
}
```

### Select

```tsx
// packages/tui/src/components/inputs/Select.tsx
import { Box, Text, useInput } from '@opentui/react'
import { useState } from 'react'

interface SelectProps {
  value: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  onChange: (value: string) => void
  focused?: boolean
  disabled?: boolean
}

export function Select({ value, options, onChange, focused, disabled }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(
    options.findIndex(o => o.value === value)
  )

  useInput((input, key) => {
    if (disabled) return

    if (key.return || input === ' ') {
      if (isOpen) {
        onChange(options[highlightIndex].value)
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    } else if (key.escape) {
      setIsOpen(false)
    } else if (isOpen) {
      if (key.upArrow) {
        setHighlightIndex(Math.max(0, highlightIndex - 1))
      } else if (key.downArrow) {
        setHighlightIndex(Math.min(options.length - 1, highlightIndex + 1))
      }
    }
  }, { isActive: focused })

  const selectedOption = options.find(o => o.value === value)

  return (
    <Box flexDirection="column">
      <Box
        borderStyle={focused ? 'bold' : 'single'}
        borderColor={focused ? colors.primary[500] : colors.neutral[300]}
        paddingX={1}
      >
        <Text>{selectedOption?.label || 'Select...'}</Text>
        <Text> ▼</Text>
      </Box>

      {isOpen && (
        <Box
          flexDirection="column"
          borderStyle="single"
          marginTop={-1}
        >
          {options.map((option, index) => (
            <Box
              key={option.value}
              backgroundColor={index === highlightIndex ? colors.primary[100] : undefined}
              paddingX={1}
            >
              <Text
                color={option.disabled ? colors.neutral[400] : undefined}
                bold={option.value === value}
              >
                {option.value === value ? '● ' : '○ '}
                {option.label}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
```

## Command Palette

```tsx
// packages/tui/src/components/interaction/CommandPalette.tsx
import { Box, Text, useInput } from '@opentui/react'
import { useState, useMemo } from 'react'
import { fuzzyMatch } from '../../utils/fuzzy'
import type { CommandConfig } from '../../types'

interface CommandPaletteProps {
  commands: CommandConfig[]
  onClose: () => void
}

export function CommandPalette({ commands, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = useMemo(() => {
    if (!query) return commands.slice(0, 10)
    return commands
      .map(cmd => ({ ...cmd, score: fuzzyMatch(query, cmd.label) }))
      .filter(cmd => cmd.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }, [commands, query])

  useInput((input, key) => {
    if (key.escape) {
      onClose()
    } else if (key.return) {
      const cmd = filteredCommands[selectedIndex]
      if (cmd) {
        cmd.action()
        onClose()
      }
    } else if (key.upArrow) {
      setSelectedIndex(Math.max(0, selectedIndex - 1))
    } else if (key.downArrow) {
      setSelectedIndex(Math.min(filteredCommands.length - 1, selectedIndex + 1))
    } else if (input === '\x7f') {
      setQuery(q => q.slice(0, -1))
      setSelectedIndex(0)
    } else if (input.length === 1 && !key.ctrl) {
      setQuery(q => q + input)
      setSelectedIndex(0)
    }
  })

  return (
    <Box
      position="absolute"
      top="20%"
      left="20%"
      width="60%"
      flexDirection="column"
      borderStyle="double"
      backgroundColor={colors.neutral[100]}
    >
      {/* Search input */}
      <Box borderStyle="single" borderBottom paddingX={1}>
        <Text color={colors.neutral[500]}>{'>'} </Text>
        <Text>{query}</Text>
        <Text inverse> </Text>
      </Box>

      {/* Results */}
      <Box flexDirection="column" maxHeight={15}>
        {filteredCommands.map((cmd, index) => (
          <Box
            key={cmd.id}
            paddingX={1}
            backgroundColor={index === selectedIndex ? colors.primary[100] : undefined}
          >
            <Box width={24}>
              <Text bold={index === selectedIndex}>{cmd.label}</Text>
            </Box>
            {cmd.description && (
              <Text color={colors.neutral[500]}>{cmd.description}</Text>
            )}
            {cmd.shortcut && (
              <Box marginLeft="auto">
                <Text color={colors.neutral[400]}>
                  {cmd.shortcut.join('+')}
                </Text>
              </Box>
            )}
          </Box>
        ))}

        {filteredCommands.length === 0 && (
          <Box paddingX={1} paddingY={2}>
            <Text color={colors.neutral[500]}>No commands found</Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}
```

## Testing Strategy

### Unit Testing Components

```typescript
// packages/tui/src/__tests__/ListView.test.tsx
import { render, screen } from '@opentui/react/testing'
import { ListView } from '../components/data/ListView'

describe('ListView', () => {
  const mockView = {
    type: 'list' as const,
    data: [
      { id: '1', title: 'Task 1', done: false },
      { id: '2', title: 'Task 2', done: true },
    ],
    config: {
      variant: 'table' as const,
      columns: [
        { key: 'title', header: 'Title' },
        { key: 'done', header: 'Done' },
      ],
    },
    state: {
      focusedIndex: 0,
      selectedIds: new Set<string>(),
    },
  }

  it('renders table with correct data', () => {
    render(<ListView view={mockView} />)
    expect(screen.getByText('Task 1')).toBeTruthy()
    expect(screen.getByText('Task 2')).toBeTruthy()
  })

  it('highlights focused row', async () => {
    render(<ListView view={mockView} />)
    const firstRow = screen.getByText('Task 1').closest('Box')
    expect(firstRow).toHaveStyle({ backgroundColor: colors.primary[100] })
  })
})
```

### Integration Testing

```typescript
// packages/tui/src/__tests__/integration/app.test.tsx
import { render, fireEvent } from '@opentui/react/testing'
import { TUIApp } from '../App'

describe('TUIApp Integration', () => {
  const mockApp = {
    name: 'todos',
    resources: [
      {
        name: 'Task',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'done', type: 'boolean' },
        ],
      },
    ],
  }

  it('renders app shell with navigation', () => {
    render(<TUIApp app={mockApp} />)
    expect(screen.getByText('todos')).toBeTruthy()
    expect(screen.getByText('Tasks')).toBeTruthy()
  })

  it('opens command palette on Ctrl+K', async () => {
    render(<TUIApp app={mockApp} />)
    await fireEvent.keyDown({ key: 'k', ctrlKey: true })
    expect(screen.getByText('>')).toBeTruthy()
  })
})
```

## Migration Checklist

### Phase 1: Setup (Week 1)
- [ ] Install OpenTUI packages (@opentui/core, @opentui/react)
- [ ] Install Zig and configure build system
- [ ] Create packages/tui directory structure
- [ ] Set up TypeScript configuration

### Phase 2: Core Components (Week 2-3)
- [ ] Implement base Box, Text components
- [ ] Implement useInput, useFocus hooks
- [ ] Implement TextInput, Select, Checkbox inputs
- [ ] Implement ListView (table variant first)
- [ ] Implement FormView

### Phase 3: Layout Components (Week 4)
- [ ] Implement ShellView with navigation
- [ ] Implement SplitView
- [ ] Implement PanelView (modals/drawers)
- [ ] Implement TabView
- [ ] Implement CommandPalette

### Phase 4: Integration (Week 5)
- [ ] Connect to existing View type system
- [ ] Implement renderer detection & fallback
- [ ] Integrate with <App/> component generator
- [ ] Add keyboard navigation throughout

### Phase 5: Polish (Week 6)
- [ ] Theme integration with color system
- [ ] Responsive terminal size handling
- [ ] Loading/Error/Empty states
- [ ] Accessibility (screen reader hints)
- [ ] Performance optimization

## Known Limitations & Workarounds

### OpenTUI Pre-Release Status

**Issue:** OpenTUI is version 0.1.x and not production-ready.

**Workaround:**
- Use for PoCs and internal tools initially
- Maintain React Ink fallback for production deployments
- Monitor OpenTUI releases closely

### Zig Build Dependency

**Issue:** OpenTUI requires Zig for building.

**Workaround:**
- Include Zig installation in development setup scripts
- Use pre-built binaries where available
- Consider containerized development environment

### Missing Components

**Issue:** OpenTUI ecosystem is young compared to Ink.

**Workaround:**
- Build components incrementally as needed
- Port patterns from Ink/Bubble Tea documentation
- Contribute back to OpenTUI ecosystem

## Conclusion

OpenTUI represents the future of terminal UI development, and its architecture aligns perfectly with SaaSkit's headless philosophy. By maintaining a clean abstraction layer (your View types) and implementing OpenTUI as the primary renderer with React Ink as fallback, you get:

1. **Modern architecture** - Clean separation of concerns
2. **Framework flexibility** - React today, Solid/Vue tomorrow
3. **Production safety** - Ink fallback for stability
4. **Agent-friendly output** - Structured RenderOutput for any consumer
5. **Future-proof** - Well-positioned for OpenTUI's growth

The key insight is that your View abstraction layer is already framework-agnostic. OpenTUI (or Ink) are just rendering implementations of those abstractions.
