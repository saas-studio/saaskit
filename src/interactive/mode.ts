/**
 * Interactive Mode - Terminal-based UI for navigating and managing resources
 * Full implementation
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ViewType = 'list' | 'detail' | 'form' | 'search' | 'confirm'

export type FormMode = 'create' | 'edit'

export interface ViewState {
  view: ViewType
  resourceName: string
  selectedIndex: number
  selectedId?: string
  formMode?: FormMode
  searchQuery?: string
  confirmAction?: ConfirmAction
}

export interface ConfirmAction {
  type: 'delete' | 'bulk-delete' | 'custom'
  message: string
  itemId?: string
  itemIds?: string[]
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export interface StatusBarInfo {
  resourceName: string
  itemCount: number
  selectedCount: number
  currentView: ViewType
  shortcuts: ShortcutInfo[]
}

export interface ShortcutInfo {
  key: string
  label: string
  action: string
}

export interface InteractiveMode {
  // State
  getState(): ViewState
  getData(): unknown[]
  getHistory(): ViewState[]
  getSelectedIds(): string[]
  getStatusBar(): StatusBarInfo

  // Navigation
  moveUp(): void
  moveDown(): void
  jumpToFirst(): void
  jumpToLast(): void
  goBack(): boolean

  // Actions
  viewDetail(): void
  createNew(): void
  editSelected(): void
  deleteSelected(): void
  openSearch(): void
  showHelp(): void
  quit(): void

  // Search
  setSearchQuery(query: string): void
  applySearch(): void
  cancelSearch(): void
  getFilteredData(): unknown[]

  // Confirmation
  confirm(): void
  cancel(): void

  // Multi-selection
  toggleSelect(): void
  selectAll(): void
  deselectAll(): void
  isSelected(id: string): boolean

  // Keyboard handling
  handleKey(key: KeyEvent): void

  // Lifecycle
  destroy(): void
}

export interface KeyEvent {
  key: string
  ctrl?: boolean
  shift?: boolean
  meta?: boolean
}

export interface InteractiveModeOptions {
  resource: string
  data: unknown[]
  idField?: string
  maxHistoryDepth?: number
  wrapNavigation?: boolean
  shortcuts?: Record<string, () => void>
  onQuit?: () => void
  onStateChange?: (state: ViewState) => void
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_MAX_HISTORY_DEPTH = 50

export const DEFAULT_SHORTCUTS: Record<string, string> = {
  'j': 'moveDown',
  'k': 'moveUp',
  'ArrowDown': 'moveDown',
  'ArrowUp': 'moveUp',
  'g': 'jumpToFirst',
  'G': 'jumpToLast',
  'Home': 'jumpToFirst',
  'End': 'jumpToLast',
  'Enter': 'viewDetail',
  'Escape': 'goBack',
  'n': 'createNew',
  'e': 'editSelected',
  'd': 'deleteSelected',
  '/': 'openSearch',
  '?': 'showHelp',
  'q': 'quit',
  ' ': 'toggleSelect',
  'a': 'selectAll',
  'A': 'deselectAll',
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getDefaultShortcuts(): ShortcutInfo[] {
  return [
    { key: 'j', label: 'Down', action: 'moveDown' },
    { key: 'k', label: 'Up', action: 'moveUp' },
    { key: 'g', label: 'First', action: 'jumpToFirst' },
    { key: 'G', label: 'Last', action: 'jumpToLast' },
    { key: 'Enter', label: 'View', action: 'viewDetail' },
    { key: 'n', label: 'New', action: 'createNew' },
    { key: 'e', label: 'Edit', action: 'editSelected' },
    { key: 'd', label: 'Delete', action: 'deleteSelected' },
    { key: '/', label: 'Search', action: 'openSearch' },
    { key: 'q', label: 'Quit', action: 'quit' },
  ]
}

export function parseKeyEvent(input: string): KeyEvent {
  const parts = input.toLowerCase().split('+')
  const key = parts[parts.length - 1]

  // Handle special key names
  let normalizedKey: string
  if (key === 'space') {
    normalizedKey = ' '
  } else if (key === 'enter') {
    normalizedKey = 'Enter'
  } else if (key === 'escape') {
    normalizedKey = 'Escape'
  } else if (key === 'arrowup') {
    normalizedKey = 'ArrowUp'
  } else if (key === 'arrowdown') {
    normalizedKey = 'ArrowDown'
  } else if (key === 'home') {
    normalizedKey = 'Home'
  } else if (key === 'end') {
    normalizedKey = 'End'
  } else {
    // Preserve case for single characters from original input
    normalizedKey = input.split('+').pop() || key
  }

  return {
    key: normalizedKey,
    ctrl: parts.includes('ctrl'),
    shift: parts.includes('shift'),
    meta: parts.includes('meta'),
  }
}

export function formatStatusBar(info: StatusBarInfo): string {
  const shortcutStr = info.shortcuts.map(s => `[${s.key}] ${s.label}`).join('  ')
  const countStr = info.selectedCount > 0
    ? `${info.selectedCount}/${info.itemCount} selected`
    : `${info.itemCount} items`

  return `${info.resourceName} | ${countStr} | ${shortcutStr}`
}

// ============================================================================
// Factory Function
// ============================================================================

export function createInteractiveMode(options: InteractiveModeOptions): InteractiveMode {
  const {
    resource,
    data: initialData,
    idField = 'id',
    maxHistoryDepth = DEFAULT_MAX_HISTORY_DEPTH,
    wrapNavigation = false,
    shortcuts: customShortcuts = {},
    onQuit,
    onStateChange,
  } = options

  // Internal state
  let destroyed = false
  let data = [...initialData]
  let history: ViewState[] = []          // Log of all transitions for getHistory()
  let navigationStack: ViewState[] = []  // Stack for goBack() navigation
  let selectedIds = new Set<string>()
  let appliedSearchQuery: string | undefined = undefined
  let filteredData: unknown[] | null = null

  // Current state
  let state: ViewState = {
    view: 'list',
    resourceName: resource,
    selectedIndex: 0,
    selectedId: getIdFromItem(data[0]),
  }

  // Helper to get ID from item
  function getIdFromItem(item: unknown): string | undefined {
    if (item && typeof item === 'object' && idField in item) {
      return String((item as Record<string, unknown>)[idField])
    }
    return undefined
  }

  // Helper to ensure not destroyed
  function ensureNotDestroyed(): void {
    if (destroyed) {
      throw new Error('InteractiveMode has been destroyed')
    }
  }

  // Helper to update state and notify
  function updateState(updates: Partial<ViewState>): void {
    state = { ...state, ...updates }
    // Update selectedId based on current index
    const currentData = getActiveData()
    if (currentData.length > 0 && state.selectedIndex < currentData.length) {
      state.selectedId = getIdFromItem(currentData[state.selectedIndex])
    } else if (currentData.length === 0) {
      state.selectedId = undefined
    }
    onStateChange?.({ ...state })
  }

  // Get the currently active data (filtered or full)
  function getActiveData(): unknown[] {
    if (filteredData !== null) {
      return filteredData
    }
    return data
  }

  // Push current state to history and navigation stack
  function pushHistory(): void {
    history.push({ ...state })
    navigationStack.push({ ...state })
    // Prune if exceeds max depth
    if (history.length > maxHistoryDepth) {
      history = history.slice(history.length - maxHistoryDepth)
    }
    // Navigation stack doesn't need pruning as it's managed by goBack
  }

  // Search filtering logic
  function filterData(query: string): unknown[] {
    if (!query) {
      return data
    }
    const lowerQuery = query.toLowerCase()
    return data.filter(item => {
      if (!item || typeof item !== 'object') return false
      const obj = item as Record<string, unknown>
      return Object.values(obj).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerQuery)
        }
        return false
      })
    })
  }

  // Get shortcuts for current view
  function getShortcutsForView(view: ViewType): ShortcutInfo[] {
    switch (view) {
      case 'list':
        return [
          { key: 'j/k', label: 'Navigate', action: 'navigate' },
          { key: 'Enter', label: 'View', action: 'viewDetail' },
          { key: 'n', label: 'New', action: 'createNew' },
          { key: 'e', label: 'Edit', action: 'editSelected' },
          { key: 'd', label: 'Delete', action: 'deleteSelected' },
          { key: '/', label: 'Search', action: 'openSearch' },
          { key: 'q', label: 'Quit', action: 'quit' },
        ]
      case 'detail':
        return [
          { key: 'e', label: 'Edit', action: 'editSelected' },
          { key: 'd', label: 'Delete', action: 'deleteSelected' },
          { key: 'Esc', label: 'Back', action: 'goBack' },
        ]
      case 'form':
        return [
          { key: 'Esc', label: 'Cancel', action: 'cancel' },
        ]
      case 'search':
        return [
          { key: 'Enter', label: 'Apply', action: 'applySearch' },
          { key: 'Esc', label: 'Cancel', action: 'cancelSearch' },
        ]
      case 'confirm':
        return [
          { key: 'y', label: 'Yes', action: 'confirm' },
          { key: 'n', label: 'No', action: 'cancel' },
          { key: 'Esc', label: 'Cancel', action: 'cancel' },
        ]
      default:
        return []
    }
  }

  // Create the mode object
  const mode: InteractiveMode = {
    // State
    getState(): ViewState {
      ensureNotDestroyed()
      return { ...state }
    },

    getData(): unknown[] {
      ensureNotDestroyed()
      return [...data]
    },

    getHistory(): ViewState[] {
      ensureNotDestroyed()
      return [...history]
    },

    getSelectedIds(): string[] {
      ensureNotDestroyed()
      return [...selectedIds]
    },

    getStatusBar(): StatusBarInfo {
      ensureNotDestroyed()
      const activeData = getActiveData()
      return {
        resourceName: state.resourceName,
        itemCount: activeData.length,
        selectedCount: selectedIds.size,
        currentView: state.view,
        shortcuts: getShortcutsForView(state.view),
      }
    },

    // Navigation
    moveUp(): void {
      ensureNotDestroyed()
      const activeData = getActiveData()
      if (activeData.length === 0) return

      if (state.selectedIndex > 0) {
        updateState({ selectedIndex: state.selectedIndex - 1 })
      } else if (wrapNavigation) {
        updateState({ selectedIndex: activeData.length - 1 })
      }
    },

    moveDown(): void {
      ensureNotDestroyed()
      const activeData = getActiveData()
      if (activeData.length === 0) return

      if (state.selectedIndex < activeData.length - 1) {
        updateState({ selectedIndex: state.selectedIndex + 1 })
      } else if (wrapNavigation) {
        updateState({ selectedIndex: 0 })
      }
    },

    jumpToFirst(): void {
      ensureNotDestroyed()
      updateState({ selectedIndex: 0 })
    },

    jumpToLast(): void {
      ensureNotDestroyed()
      const activeData = getActiveData()
      if (activeData.length === 0) return
      updateState({ selectedIndex: activeData.length - 1 })
    },

    goBack(): boolean {
      ensureNotDestroyed()
      if (navigationStack.length === 0) {
        return false
      }
      // Pop from navigation stack to go back
      const previousState = navigationStack.pop()!
      state = { ...previousState }
      onStateChange?.({ ...state })
      return true
    },

    // Actions
    viewDetail(): void {
      ensureNotDestroyed()
      pushHistory()
      updateState({ view: 'detail' })
    },

    createNew(): void {
      ensureNotDestroyed()
      pushHistory()
      updateState({ view: 'form', formMode: 'create' })
    },

    editSelected(): void {
      ensureNotDestroyed()
      pushHistory()
      updateState({ view: 'form', formMode: 'edit' })
    },

    deleteSelected(): void {
      ensureNotDestroyed()
      pushHistory()

      const idsToDelete = selectedIds.size > 0
        ? [...selectedIds]
        : (state.selectedId ? [state.selectedId] : [])

      const isBulk = idsToDelete.length > 1

      const confirmAction: ConfirmAction = {
        type: isBulk ? 'bulk-delete' : 'delete',
        message: isBulk
          ? `Are you sure you want to delete ${idsToDelete.length} items?`
          : `Are you sure you want to delete this item?`,
        itemId: isBulk ? undefined : idsToDelete[0],
        itemIds: isBulk ? idsToDelete : undefined,
        onConfirm: () => {
          // Actual deletion would happen here
          selectedIds.clear()
        },
        onCancel: () => {},
      }

      updateState({ view: 'confirm', confirmAction })
    },

    openSearch(): void {
      ensureNotDestroyed()
      pushHistory()
      updateState({ view: 'search', searchQuery: '' })
    },

    showHelp(): void {
      ensureNotDestroyed()
      // Help display - stays on current view (could set a helpVisible flag)
    },

    quit(): void {
      ensureNotDestroyed()
      onQuit?.()
    },

    // Search
    setSearchQuery(query: string): void {
      ensureNotDestroyed()
      state.searchQuery = query
    },

    applySearch(): void {
      ensureNotDestroyed()
      appliedSearchQuery = state.searchQuery
      filteredData = filterData(appliedSearchQuery || '')
      // Reset selection index if needed
      const newIndex = filteredData.length > 0 ? 0 : 0
      updateState({
        view: 'list',
        selectedIndex: newIndex,
      })
    },

    cancelSearch(): void {
      ensureNotDestroyed()
      updateState({
        view: 'list',
        searchQuery: undefined,
      })
    },

    getFilteredData(): unknown[] {
      ensureNotDestroyed()
      if (filteredData !== null) {
        return [...filteredData]
      }
      return [...data]
    },

    // Confirmation
    confirm(): void {
      ensureNotDestroyed()
      if (state.confirmAction) {
        state.confirmAction.onConfirm()
        selectedIds.clear()
      }
      updateState({
        view: 'list',
        confirmAction: undefined,
      })
    },

    cancel(): void {
      ensureNotDestroyed()
      if (state.confirmAction) {
        state.confirmAction.onCancel()
      }
      // Go back if in a sub-view, otherwise just clear confirmAction
      if (state.view === 'confirm' || state.view === 'form') {
        if (history.length > 0) {
          mode.goBack()
        } else {
          updateState({ view: 'list', confirmAction: undefined })
        }
      } else {
        updateState({ confirmAction: undefined })
      }
    },

    // Multi-selection
    toggleSelect(): void {
      ensureNotDestroyed()
      if (!state.selectedId) return

      if (selectedIds.has(state.selectedId)) {
        selectedIds.delete(state.selectedId)
      } else {
        selectedIds.add(state.selectedId)
      }
    },

    selectAll(): void {
      ensureNotDestroyed()
      const activeData = getActiveData()
      activeData.forEach(item => {
        const id = getIdFromItem(item)
        if (id) {
          selectedIds.add(id)
        }
      })
    },

    deselectAll(): void {
      ensureNotDestroyed()
      selectedIds.clear()
    },

    isSelected(id: string): boolean {
      ensureNotDestroyed()
      return selectedIds.has(id)
    },

    // Keyboard handling
    handleKey(event: KeyEvent): void {
      ensureNotDestroyed()

      // Build key string for custom shortcuts
      const keyParts: string[] = []
      if (event.ctrl) keyParts.push('ctrl')
      if (event.shift) keyParts.push('shift')
      if (event.meta) keyParts.push('meta')
      keyParts.push(event.key.toLowerCase())
      const keyString = keyParts.join('+')

      // Check custom shortcuts first
      if (customShortcuts[keyString]) {
        customShortcuts[keyString]()
        return
      }

      // Handle view-specific keys
      if (state.view === 'confirm') {
        switch (event.key) {
          case 'y':
          case 'Enter':
            mode.confirm()
            return
          case 'n':
          case 'Escape':
            mode.cancel()
            return
          default:
            // Ignore other keys in confirm view
            return
        }
      }

      if (state.view === 'search') {
        switch (event.key) {
          case 'Enter':
            mode.applySearch()
            return
          case 'Escape':
            mode.cancelSearch()
            return
          default:
            // Text input would be handled separately
            return
        }
      }

      // Handle shift+key combinations
      if (event.shift) {
        switch (event.key) {
          case 'G':
            mode.jumpToLast()
            return
          case 'A':
            mode.deselectAll()
            return
        }
      }

      // Handle normal keys via DEFAULT_SHORTCUTS
      const action = DEFAULT_SHORTCUTS[event.key]
      if (action && typeof (mode as unknown as Record<string, unknown>)[action] === 'function') {
        (mode as unknown as Record<string, () => void>)[action]()
      }
    },

    // Lifecycle
    destroy(): void {
      destroyed = true
      history = []
      navigationStack = []
      selectedIds.clear()
      data = []
      filteredData = null
    },
  }

  return mode
}
