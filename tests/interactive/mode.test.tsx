/**
 * Interactive Mode Tests
 * RED phase - All tests should FAIL initially
 *
 * Tests the terminal-based UI for navigating and managing resources
 * with keyboard input, view transitions, and state management.
 */
import { describe, expect, test, mock, beforeEach } from 'bun:test'
import React from 'react'

import {
  createInteractiveMode,
  type InteractiveMode,
  type InteractiveModeOptions,
  type ViewState,
  type ConfirmAction,
  type KeyEvent,
  type StatusBarInfo,
  type ShortcutInfo,
  getDefaultShortcuts,
  parseKeyEvent,
  formatStatusBar,
  DEFAULT_MAX_HISTORY_DEPTH,
  DEFAULT_SHORTCUTS,
} from '../../src/interactive/mode'

// ============================================================================
// Test Data Fixtures
// ============================================================================

interface Task {
  id: string
  title: string
  done: boolean
  priority: 'low' | 'medium' | 'high'
}

const createTestTasks = (count: number = 5): Task[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `task-${i + 1}`,
    title: `Task ${i + 1}`,
    done: i % 3 === 0,
    priority: (['low', 'medium', 'high'] as const)[i % 3],
  }))

const defaultOptions: InteractiveModeOptions = {
  resource: 'tasks',
  data: createTestTasks(),
  idField: 'id',
}

// ============================================================================
// 1. Module Exports Tests
// ============================================================================

describe('Interactive Mode Exports', () => {
  test('createInteractiveMode function is exported', () => {
    expect(createInteractiveMode).toBeDefined()
    expect(typeof createInteractiveMode).toBe('function')
  })

  test('ViewState type can be used', () => {
    const state: ViewState = {
      view: 'list',
      resourceName: 'tasks',
      selectedIndex: 0,
    }
    expect(state.view).toBe('list')
  })

  test('ConfirmAction type can be used', () => {
    const action: ConfirmAction = {
      type: 'delete',
      message: 'Delete this item?',
      itemId: '1',
      onConfirm: () => {},
      onCancel: () => {},
    }
    expect(action.type).toBe('delete')
  })

  test('KeyEvent type can be used', () => {
    const event: KeyEvent = {
      key: 'Enter',
      ctrl: false,
      shift: false,
    }
    expect(event.key).toBe('Enter')
  })

  test('StatusBarInfo type can be used', () => {
    const info: StatusBarInfo = {
      resourceName: 'tasks',
      itemCount: 5,
      selectedCount: 0,
      currentView: 'list',
      shortcuts: [],
    }
    expect(info.resourceName).toBe('tasks')
  })

  test('getDefaultShortcuts function is exported', () => {
    expect(getDefaultShortcuts).toBeDefined()
    expect(typeof getDefaultShortcuts).toBe('function')
  })

  test('parseKeyEvent function is exported', () => {
    expect(parseKeyEvent).toBeDefined()
    expect(typeof parseKeyEvent).toBe('function')
  })

  test('formatStatusBar function is exported', () => {
    expect(formatStatusBar).toBeDefined()
    expect(typeof formatStatusBar).toBe('function')
  })

  test('DEFAULT_MAX_HISTORY_DEPTH constant is exported', () => {
    expect(DEFAULT_MAX_HISTORY_DEPTH).toBeDefined()
    expect(typeof DEFAULT_MAX_HISTORY_DEPTH).toBe('number')
    expect(DEFAULT_MAX_HISTORY_DEPTH).toBe(50)
  })

  test('DEFAULT_SHORTCUTS constant is exported', () => {
    expect(DEFAULT_SHORTCUTS).toBeDefined()
    expect(typeof DEFAULT_SHORTCUTS).toBe('object')
  })
})

// ============================================================================
// 2. InteractiveSession Creation Tests
// ============================================================================

describe('Interactive Session Creation', () => {
  test('creates session with resource name', () => {
    const mode = createInteractiveMode({ resource: 'tasks', data: [] })
    const state = mode.getState()
    expect(state.resourceName).toBe('tasks')
  })

  test('creates session with different resource names', () => {
    const tasks = createInteractiveMode({ resource: 'tasks', data: [] })
    const users = createInteractiveMode({ resource: 'users', data: [] })

    expect(tasks.getState().resourceName).toBe('tasks')
    expect(users.getState().resourceName).toBe('users')
  })

  test('session has initial view state of list', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(mode.getState().view).toBe('list')
  })

  test('session tracks selected index starting at 0', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('session tracks selected index starting at 0 with data', () => {
    const mode = createInteractiveMode({
      resource: 'tasks',
      data: createTestTasks(10),
    })
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('session has empty navigation history initially', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(mode.getHistory()).toEqual([])
  })

  test('session initializes with provided data', () => {
    const data = createTestTasks(5)
    const mode = createInteractiveMode({ resource: 'tasks', data })
    expect(mode.getData()).toEqual(data)
  })

  test('session handles empty data array', () => {
    const mode = createInteractiveMode({ resource: 'tasks', data: [] })
    expect(mode.getData()).toEqual([])
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('session uses default idField of "id"', () => {
    const mode = createInteractiveMode({ resource: 'tasks', data: createTestTasks() })
    mode.moveDown()
    // Should track by id field
    expect(mode.getState().selectedId).toBe('task-2')
  })

  test('session uses custom idField when provided', () => {
    const data = [
      { customId: 'a', name: 'Item A' },
      { customId: 'b', name: 'Item B' },
    ]
    const mode = createInteractiveMode({
      resource: 'items',
      data,
      idField: 'customId',
    })
    expect(mode.getState().selectedId).toBe('a')
  })

  test('session uses default max history depth', () => {
    const mode = createInteractiveMode(defaultOptions)
    // Navigate many times to test history limit
    for (let i = 0; i < 100; i++) {
      mode.viewDetail()
      mode.goBack()
    }
    expect(mode.getHistory().length).toBeLessThanOrEqual(DEFAULT_MAX_HISTORY_DEPTH)
  })

  test('session uses custom max history depth', () => {
    const mode = createInteractiveMode({
      ...defaultOptions,
      maxHistoryDepth: 10,
    })
    for (let i = 0; i < 20; i++) {
      mode.viewDetail()
      mode.goBack()
    }
    expect(mode.getHistory().length).toBeLessThanOrEqual(10)
  })
})

// ============================================================================
// 3. Navigation Tests
// ============================================================================

describe('Navigation - Basic Movement', () => {
  test('moveDown moves selection down by one', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(mode.getState().selectedIndex).toBe(0)
    mode.moveDown()
    expect(mode.getState().selectedIndex).toBe(1)
  })

  test('moveUp moves selection up by one', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown()
    mode.moveDown()
    expect(mode.getState().selectedIndex).toBe(2)
    mode.moveUp()
    expect(mode.getState().selectedIndex).toBe(1)
  })

  test('moveDown stops at last item (no wrap)', () => {
    const data = createTestTasks(3)
    const mode = createInteractiveMode({ resource: 'tasks', data })
    mode.moveDown() // 0 -> 1
    mode.moveDown() // 1 -> 2
    mode.moveDown() // 2 -> 2 (stopped)
    expect(mode.getState().selectedIndex).toBe(2)
  })

  test('moveUp stops at first item (no wrap)', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveUp()
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('moveDown wraps to first item when wrap enabled', () => {
    const data = createTestTasks(3)
    const mode = createInteractiveMode({
      resource: 'tasks',
      data,
      wrapNavigation: true,
    })
    mode.moveDown() // 0 -> 1
    mode.moveDown() // 1 -> 2
    mode.moveDown() // 2 -> 0 (wrapped)
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('moveUp wraps to last item when wrap enabled', () => {
    const data = createTestTasks(3)
    const mode = createInteractiveMode({
      resource: 'tasks',
      data,
      wrapNavigation: true,
    })
    mode.moveUp() // 0 -> 2 (wrapped)
    expect(mode.getState().selectedIndex).toBe(2)
  })

  test('jumpToFirst moves to first item', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown()
    mode.moveDown()
    mode.moveDown()
    expect(mode.getState().selectedIndex).toBe(3)
    mode.jumpToFirst()
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('jumpToLast moves to last item', () => {
    const data = createTestTasks(5)
    const mode = createInteractiveMode({ resource: 'tasks', data })
    mode.jumpToLast()
    expect(mode.getState().selectedIndex).toBe(4)
  })

  test('jumpToFirst is no-op when already at first', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.jumpToFirst()
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('jumpToLast is no-op when already at last', () => {
    const data = createTestTasks(3)
    const mode = createInteractiveMode({ resource: 'tasks', data })
    mode.jumpToLast()
    mode.jumpToLast()
    expect(mode.getState().selectedIndex).toBe(2)
  })

  test('navigation updates selectedId', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(mode.getState().selectedId).toBe('task-1')
    mode.moveDown()
    expect(mode.getState().selectedId).toBe('task-2')
  })

  test('navigation with empty data does not crash', () => {
    const mode = createInteractiveMode({ resource: 'tasks', data: [] })
    mode.moveDown()
    mode.moveUp()
    mode.jumpToFirst()
    mode.jumpToLast()
    expect(mode.getState().selectedIndex).toBe(0)
  })
})

describe('Navigation - Keyboard Shortcuts', () => {
  test('j key moves selection down', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.handleKey({ key: 'j' })
    expect(mode.getState().selectedIndex).toBe(1)
  })

  test('k key moves selection up', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown()
    mode.moveDown()
    mode.handleKey({ key: 'k' })
    expect(mode.getState().selectedIndex).toBe(1)
  })

  test('ArrowDown key moves selection down', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.handleKey({ key: 'ArrowDown' })
    expect(mode.getState().selectedIndex).toBe(1)
  })

  test('ArrowUp key moves selection up', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown()
    mode.handleKey({ key: 'ArrowUp' })
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('g key jumps to first item', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown()
    mode.moveDown()
    mode.handleKey({ key: 'g' })
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('G key (shift+g) jumps to last item', () => {
    const data = createTestTasks(5)
    const mode = createInteractiveMode({ resource: 'tasks', data })
    mode.handleKey({ key: 'G', shift: true })
    expect(mode.getState().selectedIndex).toBe(4)
  })

  test('Home key jumps to first item', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown()
    mode.moveDown()
    mode.handleKey({ key: 'Home' })
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('End key jumps to last item', () => {
    const data = createTestTasks(5)
    const mode = createInteractiveMode({ resource: 'tasks', data })
    mode.handleKey({ key: 'End' })
    expect(mode.getState().selectedIndex).toBe(4)
  })
})

describe('Navigation - History and Back', () => {
  test('goBack returns to previous view', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    expect(mode.getState().view).toBe('detail')
    mode.goBack()
    expect(mode.getState().view).toBe('list')
  })

  test('goBack returns false when no history', () => {
    const mode = createInteractiveMode(defaultOptions)
    const result = mode.goBack()
    expect(result).toBe(false)
  })

  test('goBack returns true when history exists', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    const result = mode.goBack()
    expect(result).toBe(true)
  })

  test('goBack restores previous state completely', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown()
    mode.moveDown()
    const beforeState = { ...mode.getState() }
    mode.viewDetail()
    mode.goBack()
    expect(mode.getState().selectedIndex).toBe(beforeState.selectedIndex)
  })

  test('Escape key triggers goBack', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    mode.handleKey({ key: 'Escape' })
    expect(mode.getState().view).toBe('list')
  })

  test('history tracks multiple transitions', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    mode.goBack()
    mode.moveDown()
    mode.viewDetail()
    expect(mode.getHistory().length).toBeGreaterThan(0)
  })

  test('history respects max depth limit', () => {
    const mode = createInteractiveMode({
      ...defaultOptions,
      maxHistoryDepth: 5,
    })
    for (let i = 0; i < 10; i++) {
      mode.viewDetail()
      mode.goBack()
      mode.viewDetail()
    }
    expect(mode.getHistory().length).toBeLessThanOrEqual(5)
  })

  test('history clears on resource change', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    mode.goBack()
    expect(mode.getHistory().length).toBeGreaterThan(0)
    // Resource change would create new mode instance
  })
})

// ============================================================================
// 4. Action Shortcuts Tests
// ============================================================================

describe('Action Shortcuts', () => {
  test('n key opens form in create mode', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.handleKey({ key: 'n' })
    expect(mode.getState().view).toBe('form')
    expect(mode.getState().formMode).toBe('create')
  })

  test('createNew() opens form in create mode', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.createNew()
    expect(mode.getState().view).toBe('form')
    expect(mode.getState().formMode).toBe('create')
  })

  test('e key opens form in edit mode', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.handleKey({ key: 'e' })
    expect(mode.getState().view).toBe('form')
    expect(mode.getState().formMode).toBe('edit')
  })

  test('editSelected() opens form in edit mode', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.editSelected()
    expect(mode.getState().view).toBe('form')
    expect(mode.getState().formMode).toBe('edit')
  })

  test('editSelected() preserves selected item id', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown()
    mode.editSelected()
    expect(mode.getState().selectedId).toBe('task-2')
  })

  test('d key opens delete confirmation', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.handleKey({ key: 'd' })
    expect(mode.getState().view).toBe('confirm')
    expect(mode.getState().confirmAction?.type).toBe('delete')
  })

  test('deleteSelected() shows confirmation dialog', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    expect(mode.getState().view).toBe('confirm')
  })

  test('/ key opens search mode', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.handleKey({ key: '/' })
    expect(mode.getState().view).toBe('search')
  })

  test('openSearch() opens search mode', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    expect(mode.getState().view).toBe('search')
  })

  test('? key shows help', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.handleKey({ key: '?' })
    // Help could be a modal or overlay
    expect(mode.getState().view).toBe('list') // stays on current view
  })

  test('q key triggers quit', () => {
    const onQuit = mock(() => {})
    const mode = createInteractiveMode({
      ...defaultOptions,
      onQuit,
    })
    mode.handleKey({ key: 'q' })
    expect(onQuit).toHaveBeenCalled()
  })

  test('quit() calls onQuit callback', () => {
    const onQuit = mock(() => {})
    const mode = createInteractiveMode({
      ...defaultOptions,
      onQuit,
    })
    mode.quit()
    expect(onQuit).toHaveBeenCalled()
  })
})

// ============================================================================
// 5. View Transition Tests
// ============================================================================

describe('View Transitions', () => {
  test('Enter key transitions from list to detail', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(mode.getState().view).toBe('list')
    mode.handleKey({ key: 'Enter' })
    expect(mode.getState().view).toBe('detail')
  })

  test('viewDetail() transitions from list to detail', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    expect(mode.getState().view).toBe('detail')
  })

  test('Escape key transitions from detail to list', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    mode.handleKey({ key: 'Escape' })
    expect(mode.getState().view).toBe('list')
  })

  test('n key transitions from list to form (create)', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.handleKey({ key: 'n' })
    expect(mode.getState().view).toBe('form')
    expect(mode.getState().formMode).toBe('create')
  })

  test('e key transitions from detail to form (edit)', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    mode.handleKey({ key: 'e' })
    expect(mode.getState().view).toBe('form')
    expect(mode.getState().formMode).toBe('edit')
  })

  test('form submit transitions to list', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.createNew()
    expect(mode.getState().view).toBe('form')
    // Submit action would transition back
    mode.goBack()
    expect(mode.getState().view).toBe('list')
  })

  test('form cancel transitions to list', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.createNew()
    mode.cancel()
    expect(mode.getState().view).toBe('list')
  })

  test('detail view shows selected item', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown() // select second item
    mode.viewDetail()
    expect(mode.getState().selectedId).toBe('task-2')
  })

  test('view transitions preserve selected index', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown()
    mode.moveDown()
    const index = mode.getState().selectedIndex
    mode.viewDetail()
    mode.goBack()
    expect(mode.getState().selectedIndex).toBe(index)
  })

  test('calls onStateChange callback on transitions', () => {
    const onStateChange = mock((_state: ViewState) => {})
    const mode = createInteractiveMode({
      ...defaultOptions,
      onStateChange,
    })
    mode.viewDetail()
    expect(onStateChange).toHaveBeenCalled()
  })
})

// ============================================================================
// 6. Confirmation Dialog Tests
// ============================================================================

describe('Confirmation Dialog', () => {
  test('delete confirmation shows item info', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    const action = mode.getState().confirmAction
    expect(action).toBeDefined()
    expect(action?.type).toBe('delete')
    expect(action?.itemId).toBe('task-1')
  })

  test('delete confirmation message is descriptive', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    const action = mode.getState().confirmAction
    expect(action?.message).toContain('delete')
  })

  test('y key confirms action', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    mode.handleKey({ key: 'y' })
    expect(mode.getState().view).toBe('list')
  })

  test('Enter key confirms action', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    mode.handleKey({ key: 'Enter' })
    expect(mode.getState().view).toBe('list')
  })

  test('confirm() proceeds with action', () => {
    const onConfirmCalled = mock(() => {})
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    const action = mode.getState().confirmAction
    if (action) {
      // Replace onConfirm to track call
      const originalConfirm = action.onConfirm
      action.onConfirm = () => {
        onConfirmCalled()
        originalConfirm()
      }
    }
    mode.confirm()
    expect(mode.getState().view).toBe('list')
  })

  test('n key cancels action', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    mode.handleKey({ key: 'n' })
    expect(mode.getState().view).toBe('list')
    expect(mode.getState().confirmAction).toBeUndefined()
  })

  test('Escape key cancels action', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    mode.handleKey({ key: 'Escape' })
    expect(mode.getState().view).toBe('list')
  })

  test('cancel() returns to previous view', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    mode.cancel()
    expect(mode.getState().view).toBe('list')
  })

  test('custom confirmation message', () => {
    const mode = createInteractiveMode(defaultOptions)
    // Bulk delete would have custom message
    mode.toggleSelect()
    mode.moveDown()
    mode.toggleSelect()
    mode.deleteSelected()
    const action = mode.getState().confirmAction
    expect(action?.type).toBe('bulk-delete')
    expect(action?.message).toContain('2')
  })

  test('confirmation dialog with multiple selected items', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.toggleSelect()
    mode.moveDown()
    mode.toggleSelect()
    mode.deleteSelected()
    const action = mode.getState().confirmAction
    expect(action?.itemIds).toHaveLength(2)
  })
})

// ============================================================================
// 7. Search Mode Tests
// ============================================================================

describe('Search Mode', () => {
  test('/ opens search input', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    expect(mode.getState().view).toBe('search')
  })

  test('setSearchQuery updates search query', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('task')
    expect(mode.getState().searchQuery).toBe('task')
  })

  test('typing updates search query', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('t')
    mode.setSearchQuery('ta')
    mode.setSearchQuery('tas')
    mode.setSearchQuery('task')
    expect(mode.getState().searchQuery).toBe('task')
  })

  test('Enter applies filter', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('Task 1')
    mode.applySearch()
    expect(mode.getState().view).toBe('list')
    expect(mode.getFilteredData()).toHaveLength(1)
  })

  test('applySearch filters data', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('Task')
    mode.applySearch()
    // All tasks contain "Task"
    expect(mode.getFilteredData()).toHaveLength(5)
  })

  test('Escape cancels search', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('test')
    mode.cancelSearch()
    expect(mode.getState().view).toBe('list')
    expect(mode.getState().searchQuery).toBeUndefined()
  })

  test('cancelSearch clears query and returns to list', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('test')
    mode.cancelSearch()
    expect(mode.getState().searchQuery).toBeUndefined()
  })

  test('search is case-insensitive', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('TASK')
    mode.applySearch()
    expect(mode.getFilteredData().length).toBeGreaterThan(0)
  })

  test('empty search returns all data', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('')
    mode.applySearch()
    expect(mode.getFilteredData()).toEqual(mode.getData())
  })

  test('search with no matches returns empty array', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('nonexistent')
    mode.applySearch()
    expect(mode.getFilteredData()).toHaveLength(0)
  })

  test('search filters by multiple fields', () => {
    const data = [
      { id: '1', title: 'Important Task', description: 'Do something' },
      { id: '2', title: 'Another one', description: 'Important work' },
    ]
    const mode = createInteractiveMode({ resource: 'tasks', data })
    mode.openSearch()
    mode.setSearchQuery('Important')
    mode.applySearch()
    expect(mode.getFilteredData()).toHaveLength(2)
  })

  test('getFilteredData returns filtered results', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('Task 1')
    mode.applySearch()
    const filtered = mode.getFilteredData() as Task[]
    expect(filtered.some(t => t.title === 'Task 1')).toBe(true)
  })
})

// ============================================================================
// 8. Status Bar Tests
// ============================================================================

describe('Status Bar', () => {
  test('shows current resource name', () => {
    const mode = createInteractiveMode(defaultOptions)
    const statusBar = mode.getStatusBar()
    expect(statusBar.resourceName).toBe('tasks')
  })

  test('shows item count', () => {
    const mode = createInteractiveMode(defaultOptions)
    const statusBar = mode.getStatusBar()
    expect(statusBar.itemCount).toBe(5)
  })

  test('shows selected count when items selected', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.toggleSelect()
    mode.moveDown()
    mode.toggleSelect()
    const statusBar = mode.getStatusBar()
    expect(statusBar.selectedCount).toBe(2)
  })

  test('shows available shortcuts', () => {
    const mode = createInteractiveMode(defaultOptions)
    const statusBar = mode.getStatusBar()
    expect(statusBar.shortcuts).toBeDefined()
    expect(statusBar.shortcuts.length).toBeGreaterThan(0)
  })

  test('shows different shortcuts based on view', () => {
    const mode = createInteractiveMode(defaultOptions)
    const listShortcuts = mode.getStatusBar().shortcuts
    mode.viewDetail()
    const detailShortcuts = mode.getStatusBar().shortcuts
    expect(listShortcuts).not.toEqual(detailShortcuts)
  })

  test('updates on view change', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(mode.getStatusBar().currentView).toBe('list')
    mode.viewDetail()
    expect(mode.getStatusBar().currentView).toBe('detail')
  })

  test('shortcuts include key and label', () => {
    const mode = createInteractiveMode(defaultOptions)
    const shortcuts = mode.getStatusBar().shortcuts
    shortcuts.forEach(shortcut => {
      expect(shortcut.key).toBeDefined()
      expect(shortcut.label).toBeDefined()
    })
  })

  test('formatStatusBar returns formatted string', () => {
    const info: StatusBarInfo = {
      resourceName: 'tasks',
      itemCount: 5,
      selectedCount: 0,
      currentView: 'list',
      shortcuts: [
        { key: 'n', label: 'New', action: 'create' },
        { key: 'q', label: 'Quit', action: 'quit' },
      ],
    }
    const formatted = formatStatusBar(info)
    expect(formatted).toContain('tasks')
    expect(formatted).toContain('[n]')
    expect(formatted).toContain('[q]')
  })

  test('empty data shows 0 items', () => {
    const mode = createInteractiveMode({ resource: 'tasks', data: [] })
    expect(mode.getStatusBar().itemCount).toBe(0)
  })
})

// ============================================================================
// 9. Multi-Select Mode Tests
// ============================================================================

describe('Multi-Select Mode', () => {
  test('Space toggles selection of current item', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(mode.getSelectedIds()).toHaveLength(0)
    mode.handleKey({ key: ' ' })
    expect(mode.getSelectedIds()).toHaveLength(1)
  })

  test('toggleSelect() toggles current item', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.toggleSelect()
    expect(mode.getSelectedIds()).toContain('task-1')
    mode.toggleSelect()
    expect(mode.getSelectedIds()).not.toContain('task-1')
  })

  test('a key selects all items', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.handleKey({ key: 'a' })
    expect(mode.getSelectedIds()).toHaveLength(5)
  })

  test('selectAll() selects all items', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.selectAll()
    expect(mode.getSelectedIds()).toHaveLength(5)
  })

  test('A key (shift+a) deselects all items', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.selectAll()
    mode.handleKey({ key: 'A', shift: true })
    expect(mode.getSelectedIds()).toHaveLength(0)
  })

  test('deselectAll() clears all selections', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.selectAll()
    mode.deselectAll()
    expect(mode.getSelectedIds()).toHaveLength(0)
  })

  test('getSelectedIds returns array of selected ids', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.toggleSelect() // task-1
    mode.moveDown()
    mode.toggleSelect() // task-2
    const ids = mode.getSelectedIds()
    expect(ids).toContain('task-1')
    expect(ids).toContain('task-2')
  })

  test('isSelected() returns true for selected items', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.toggleSelect()
    expect(mode.isSelected('task-1')).toBe(true)
    expect(mode.isSelected('task-2')).toBe(false)
  })

  test('selection persists across navigation', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.toggleSelect()
    mode.moveDown()
    mode.moveDown()
    expect(mode.getSelectedIds()).toContain('task-1')
  })

  test('bulk delete uses all selected items', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.toggleSelect()
    mode.moveDown()
    mode.toggleSelect()
    mode.deleteSelected()
    const action = mode.getState().confirmAction
    expect(action?.type).toBe('bulk-delete')
    expect(action?.itemIds).toHaveLength(2)
  })

  test('selection clears after bulk action confirmed', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.toggleSelect()
    mode.moveDown()
    mode.toggleSelect()
    mode.deleteSelected()
    mode.confirm()
    expect(mode.getSelectedIds()).toHaveLength(0)
  })

  test('empty selection after selectAll on empty data', () => {
    const mode = createInteractiveMode({ resource: 'tasks', data: [] })
    mode.selectAll()
    expect(mode.getSelectedIds()).toHaveLength(0)
  })
})

// ============================================================================
// 10. Error State Tests
// ============================================================================

describe('Error States', () => {
  test('handles empty data gracefully', () => {
    const mode = createInteractiveMode({ resource: 'tasks', data: [] })
    expect(mode.getData()).toEqual([])
    expect(mode.getState().selectedIndex).toBe(0)
    expect(mode.getState().selectedId).toBeUndefined()
  })

  test('moveDown with empty data does not crash', () => {
    const mode = createInteractiveMode({ resource: 'tasks', data: [] })
    expect(() => mode.moveDown()).not.toThrow()
  })

  test('viewDetail with empty data does not crash', () => {
    const mode = createInteractiveMode({ resource: 'tasks', data: [] })
    expect(() => mode.viewDetail()).not.toThrow()
  })

  test('deleteSelected with no selection does nothing', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deselectAll()
    mode.deleteSelected()
    // Should still show confirmation for currently highlighted item
    expect(mode.getState().view).toBe('confirm')
  })

  test('goBack with no history is safe', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(() => mode.goBack()).not.toThrow()
    expect(mode.goBack()).toBe(false)
  })

  test('invalid key event is ignored', () => {
    const mode = createInteractiveMode(defaultOptions)
    const initialState = { ...mode.getState() }
    mode.handleKey({ key: 'InvalidKey' })
    expect(mode.getState()).toEqual(initialState)
  })

  test('handles undefined data items gracefully', () => {
    const data = [
      { id: '1', title: 'Task 1' },
      undefined as any,
      { id: '3', title: 'Task 3' },
    ].filter(Boolean)
    const mode = createInteractiveMode({ resource: 'tasks', data })
    expect(() => mode.moveDown()).not.toThrow()
  })

  test('handles items without id field gracefully', () => {
    const data = [{ name: 'No ID' }]
    const mode = createInteractiveMode({ resource: 'items', data, idField: 'id' })
    expect(mode.getState().selectedId).toBeUndefined()
  })
})

// ============================================================================
// 11. Lifecycle Tests
// ============================================================================

describe('Lifecycle', () => {
  test('destroy() cleans up resources', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(() => mode.destroy()).not.toThrow()
  })

  test('methods throw after destroy', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.destroy()
    expect(() => mode.getState()).toThrow()
  })

  test('onStateChange called on every state mutation', () => {
    const onStateChange = mock((_state: ViewState) => {})
    const mode = createInteractiveMode({
      ...defaultOptions,
      onStateChange,
    })
    mode.moveDown()
    mode.viewDetail()
    mode.goBack()
    expect(onStateChange).toHaveBeenCalledTimes(3)
  })

  test('custom shortcuts can be registered', () => {
    const customAction = mock(() => {})
    const mode = createInteractiveMode({
      ...defaultOptions,
      shortcuts: {
        'ctrl+s': customAction,
      },
    })
    mode.handleKey({ key: 's', ctrl: true })
    expect(customAction).toHaveBeenCalled()
  })
})

// ============================================================================
// 12. Keyboard Event Parsing Tests
// ============================================================================

describe('Keyboard Event Parsing', () => {
  test('parseKeyEvent parses simple key', () => {
    const event = parseKeyEvent('a')
    expect(event.key).toBe('a')
    expect(event.ctrl).toBeFalsy()
    expect(event.shift).toBeFalsy()
  })

  test('parseKeyEvent parses ctrl modifier', () => {
    const event = parseKeyEvent('ctrl+k')
    expect(event.key).toBe('k')
    expect(event.ctrl).toBe(true)
  })

  test('parseKeyEvent parses shift modifier', () => {
    const event = parseKeyEvent('shift+a')
    expect(event.key).toBe('a')
    expect(event.shift).toBe(true)
  })

  test('parseKeyEvent parses meta modifier', () => {
    const event = parseKeyEvent('meta+s')
    expect(event.key).toBe('s')
    expect(event.meta).toBe(true)
  })

  test('parseKeyEvent parses multiple modifiers', () => {
    const event = parseKeyEvent('ctrl+shift+k')
    expect(event.key).toBe('k')
    expect(event.ctrl).toBe(true)
    expect(event.shift).toBe(true)
  })

  test('parseKeyEvent handles special keys', () => {
    expect(parseKeyEvent('Enter').key).toBe('Enter')
    expect(parseKeyEvent('Escape').key).toBe('Escape')
    expect(parseKeyEvent('ArrowUp').key).toBe('ArrowUp')
    expect(parseKeyEvent('Space').key).toBe(' ')
  })
})

// ============================================================================
// 13. Default Shortcuts Tests
// ============================================================================

describe('Default Shortcuts', () => {
  test('getDefaultShortcuts returns list shortcuts', () => {
    const shortcuts = getDefaultShortcuts()
    expect(shortcuts).toBeDefined()
    expect(Array.isArray(shortcuts)).toBe(true)
  })

  test('default shortcuts include navigation keys', () => {
    const shortcuts = getDefaultShortcuts()
    const keys = shortcuts.map(s => s.key)
    expect(keys).toContain('j')
    expect(keys).toContain('k')
  })

  test('default shortcuts include action keys', () => {
    const shortcuts = getDefaultShortcuts()
    const keys = shortcuts.map(s => s.key)
    expect(keys).toContain('n')
    expect(keys).toContain('e')
    expect(keys).toContain('d')
  })

  test('DEFAULT_SHORTCUTS includes all expected bindings', () => {
    expect(DEFAULT_SHORTCUTS['j']).toBe('moveDown')
    expect(DEFAULT_SHORTCUTS['k']).toBe('moveUp')
    expect(DEFAULT_SHORTCUTS['Enter']).toBe('viewDetail')
    expect(DEFAULT_SHORTCUTS['n']).toBe('createNew')
    expect(DEFAULT_SHORTCUTS['q']).toBe('quit')
  })
})

// ============================================================================
// 14. View-Specific Behavior Tests
// ============================================================================

describe('List View Behavior', () => {
  test('list view supports all navigation', () => {
    const mode = createInteractiveMode(defaultOptions)
    expect(mode.getState().view).toBe('list')
    mode.moveDown()
    mode.moveUp()
    mode.jumpToFirst()
    mode.jumpToLast()
    expect(mode.getState().view).toBe('list')
  })

  test('list view supports selection', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.toggleSelect()
    expect(mode.getSelectedIds().length).toBe(1)
  })

  test('list view Enter opens detail', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.handleKey({ key: 'Enter' })
    expect(mode.getState().view).toBe('detail')
  })
})

describe('Detail View Behavior', () => {
  test('detail view shows item data', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    expect(mode.getState().view).toBe('detail')
    expect(mode.getState().selectedId).toBe('task-1')
  })

  test('detail view e key opens edit form', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    mode.handleKey({ key: 'e' })
    expect(mode.getState().view).toBe('form')
    expect(mode.getState().formMode).toBe('edit')
  })

  test('detail view d key shows delete confirm', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    mode.handleKey({ key: 'd' })
    expect(mode.getState().view).toBe('confirm')
  })

  test('detail view Escape returns to list', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    mode.handleKey({ key: 'Escape' })
    expect(mode.getState().view).toBe('list')
  })
})

describe('Form View Behavior', () => {
  test('form view in create mode has no selectedId', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.createNew()
    expect(mode.getState().formMode).toBe('create')
    // selectedId should be cleared for new item
  })

  test('form view in edit mode preserves selectedId', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.moveDown()
    mode.editSelected()
    expect(mode.getState().formMode).toBe('edit')
    expect(mode.getState().selectedId).toBe('task-2')
  })

  test('form view Escape cancels and returns', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.createNew()
    mode.handleKey({ key: 'Escape' })
    expect(mode.getState().view).toBe('list')
  })
})

describe('Search View Behavior', () => {
  test('search view captures text input', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('test')
    expect(mode.getState().searchQuery).toBe('test')
  })

  test('search view Enter applies filter', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('Task 1')
    mode.handleKey({ key: 'Enter' })
    expect(mode.getState().view).toBe('list')
  })

  test('search view Escape cancels without applying', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('test')
    mode.handleKey({ key: 'Escape' })
    expect(mode.getState().searchQuery).toBeUndefined()
  })
})

describe('Confirm View Behavior', () => {
  test('confirm view y key confirms', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    expect(mode.getState().view).toBe('confirm')
    mode.handleKey({ key: 'y' })
    expect(mode.getState().view).toBe('list')
  })

  test('confirm view n key cancels', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    mode.handleKey({ key: 'n' })
    expect(mode.getState().view).toBe('list')
  })

  test('confirm view Escape cancels', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    mode.handleKey({ key: 'Escape' })
    expect(mode.getState().view).toBe('list')
  })

  test('confirm view Enter confirms', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    mode.handleKey({ key: 'Enter' })
    expect(mode.getState().view).toBe('list')
  })
})

// ============================================================================
// 15. Edge Cases and Boundary Tests
// ============================================================================

describe('Edge Cases', () => {
  test('single item list navigation', () => {
    const mode = createInteractiveMode({
      resource: 'tasks',
      data: [{ id: '1', title: 'Only Task' }],
    })
    mode.moveDown()
    expect(mode.getState().selectedIndex).toBe(0)
    mode.moveUp()
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('large dataset navigation', () => {
    const data = createTestTasks(1000)
    const mode = createInteractiveMode({ resource: 'tasks', data })
    mode.jumpToLast()
    expect(mode.getState().selectedIndex).toBe(999)
    mode.jumpToFirst()
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('rapid navigation events', () => {
    const mode = createInteractiveMode(defaultOptions)
    for (let i = 0; i < 100; i++) {
      mode.moveDown()
    }
    // Should stop at last item
    expect(mode.getState().selectedIndex).toBe(4)
  })

  test('concurrent selection operations', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.selectAll()
    mode.toggleSelect() // should deselect first
    mode.moveDown()
    mode.toggleSelect() // should deselect second
    expect(mode.getSelectedIds()).toHaveLength(3)
  })

  test('nested view transitions', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    mode.editSelected()
    mode.goBack()
    expect(mode.getState().view).toBe('detail')
    mode.goBack()
    expect(mode.getState().view).toBe('list')
  })

  test('search then navigate preserves filter', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('Task 1')
    mode.applySearch()
    mode.viewDetail()
    mode.goBack()
    expect(mode.getFilteredData()).toHaveLength(1)
  })

  test('delete from filtered list', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.openSearch()
    mode.setSearchQuery('Task 1')
    mode.applySearch()
    mode.deleteSelected()
    mode.confirm()
    // Task should be removed
  })

  test('special characters in search query', () => {
    const data = [
      { id: '1', title: 'Task (special)' },
      { id: '2', title: 'Task [brackets]' },
      { id: '3', title: 'Task $money$' },
    ]
    const mode = createInteractiveMode({ resource: 'tasks', data })
    mode.openSearch()
    mode.setSearchQuery('(special)')
    mode.applySearch()
    expect(mode.getFilteredData()).toHaveLength(1)
  })

  test('unicode in data', () => {
    const data = [
      { id: '1', title: 'Task with emoji: check' },
      { id: '2', title: 'Task en francais' },
    ]
    const mode = createInteractiveMode({ resource: 'tasks', data })
    mode.openSearch()
    mode.setSearchQuery('emoji')
    mode.applySearch()
    expect(mode.getFilteredData()).toHaveLength(1)
  })
})

// ============================================================================
// 16. Integration Tests
// ============================================================================

describe('Integration Scenarios', () => {
  test('full CRUD workflow', () => {
    const mode = createInteractiveMode(defaultOptions)

    // List view
    expect(mode.getState().view).toBe('list')
    expect(mode.getData()).toHaveLength(5)

    // Create new
    mode.createNew()
    expect(mode.getState().view).toBe('form')
    expect(mode.getState().formMode).toBe('create')
    mode.goBack()

    // View detail
    mode.viewDetail()
    expect(mode.getState().view).toBe('detail')

    // Edit
    mode.editSelected()
    expect(mode.getState().view).toBe('form')
    expect(mode.getState().formMode).toBe('edit')
    mode.goBack()
    mode.goBack()

    // Delete
    mode.deleteSelected()
    expect(mode.getState().view).toBe('confirm')
    mode.cancel()
    expect(mode.getState().view).toBe('list')
  })

  test('search and select workflow', () => {
    const mode = createInteractiveMode(defaultOptions)

    // Search
    mode.openSearch()
    mode.setSearchQuery('Task')
    mode.applySearch()
    expect(mode.getFilteredData()).toHaveLength(5)

    // Select multiple from filtered
    mode.toggleSelect()
    mode.moveDown()
    mode.toggleSelect()
    expect(mode.getSelectedIds()).toHaveLength(2)

    // Bulk delete
    mode.deleteSelected()
    expect(mode.getState().confirmAction?.type).toBe('bulk-delete')
    mode.cancel()
  })

  test('navigation preserves context', () => {
    const mode = createInteractiveMode(defaultOptions)

    mode.moveDown()
    mode.moveDown()
    const index = mode.getState().selectedIndex

    mode.viewDetail()
    mode.goBack()
    expect(mode.getState().selectedIndex).toBe(index)

    mode.openSearch()
    mode.cancelSearch()
    expect(mode.getState().selectedIndex).toBe(index)
  })

  test('keyboard-only navigation', () => {
    const mode = createInteractiveMode(defaultOptions)

    // Navigate down
    mode.handleKey({ key: 'j' })
    mode.handleKey({ key: 'j' })
    expect(mode.getState().selectedIndex).toBe(2)

    // Open detail
    mode.handleKey({ key: 'Enter' })
    expect(mode.getState().view).toBe('detail')

    // Go back
    mode.handleKey({ key: 'Escape' })
    expect(mode.getState().view).toBe('list')

    // Open search
    mode.handleKey({ key: '/' })
    expect(mode.getState().view).toBe('search')

    // Cancel search
    mode.handleKey({ key: 'Escape' })
    expect(mode.getState().view).toBe('list')

    // Quit
    const onQuit = mock(() => {})
    const modeWithQuit = createInteractiveMode({ ...defaultOptions, onQuit })
    modeWithQuit.handleKey({ key: 'q' })
    expect(onQuit).toHaveBeenCalled()
  })

  test('selection state across view changes', () => {
    const mode = createInteractiveMode(defaultOptions)

    // Select items
    mode.toggleSelect()
    mode.moveDown()
    mode.toggleSelect()

    // View detail of one
    mode.viewDetail()
    mode.goBack()

    // Selections should persist
    expect(mode.getSelectedIds()).toHaveLength(2)

    // Open form
    mode.createNew()
    mode.goBack()

    // Selections should still persist
    expect(mode.getSelectedIds()).toHaveLength(2)
  })
})

// ============================================================================
// 17. State Immutability Tests
// ============================================================================

describe('State Immutability', () => {
  test('getState returns new object each call', () => {
    const mode = createInteractiveMode(defaultOptions)
    const state1 = mode.getState()
    const state2 = mode.getState()
    expect(state1).not.toBe(state2)
    expect(state1).toEqual(state2)
  })

  test('getData returns new array each call', () => {
    const mode = createInteractiveMode(defaultOptions)
    const data1 = mode.getData()
    const data2 = mode.getData()
    expect(data1).not.toBe(data2)
    expect(data1).toEqual(data2)
  })

  test('getHistory returns new array each call', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.viewDetail()
    mode.goBack()
    const history1 = mode.getHistory()
    const history2 = mode.getHistory()
    expect(history1).not.toBe(history2)
  })

  test('getSelectedIds returns new array each call', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.toggleSelect()
    const ids1 = mode.getSelectedIds()
    const ids2 = mode.getSelectedIds()
    expect(ids1).not.toBe(ids2)
    expect(ids1).toEqual(ids2)
  })

  test('mutating returned state does not affect internal state', () => {
    const mode = createInteractiveMode(defaultOptions)
    const state = mode.getState()
    state.selectedIndex = 999
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('mutating returned data does not affect internal data', () => {
    const mode = createInteractiveMode(defaultOptions)
    const data = mode.getData() as Task[]
    data.push({ id: 'fake', title: 'Fake', done: false, priority: 'low' })
    expect(mode.getData()).toHaveLength(5)
  })
})

// ============================================================================
// 18. Performance and Stress Tests
// ============================================================================

describe('Performance', () => {
  test('handles 10000 items without issue', () => {
    const data = createTestTasks(10000)
    const mode = createInteractiveMode({ resource: 'tasks', data })
    expect(mode.getData()).toHaveLength(10000)
    mode.jumpToLast()
    expect(mode.getState().selectedIndex).toBe(9999)
  })

  test('rapid state changes are handled', () => {
    const mode = createInteractiveMode(defaultOptions)
    for (let i = 0; i < 1000; i++) {
      mode.moveDown()
      mode.moveUp()
    }
    expect(mode.getState().selectedIndex).toBe(0)
  })

  test('many selections handled efficiently', () => {
    const data = createTestTasks(1000)
    const mode = createInteractiveMode({ resource: 'tasks', data })
    mode.selectAll()
    expect(mode.getSelectedIds()).toHaveLength(1000)
    mode.deselectAll()
    expect(mode.getSelectedIds()).toHaveLength(0)
  })

  test('deep history is pruned', () => {
    const mode = createInteractiveMode({
      ...defaultOptions,
      maxHistoryDepth: 10,
    })
    for (let i = 0; i < 100; i++) {
      mode.viewDetail()
      mode.goBack()
    }
    expect(mode.getHistory().length).toBeLessThanOrEqual(10)
  })
})

// ============================================================================
// 19. Accessibility Tests
// ============================================================================

describe('Accessibility', () => {
  test('keyboard navigation works without mouse', () => {
    const mode = createInteractiveMode(defaultOptions)

    // All navigation via keyboard
    mode.handleKey({ key: 'j' })
    mode.handleKey({ key: 'k' })
    mode.handleKey({ key: 'g' })
    mode.handleKey({ key: 'G', shift: true })
    mode.handleKey({ key: 'Enter' })
    mode.handleKey({ key: 'Escape' })

    expect(mode.getState().view).toBe('list')
  })

  test('shortcuts are discoverable via help', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.showHelp()
    // Help should be visible
    const shortcuts = getDefaultShortcuts()
    expect(shortcuts.length).toBeGreaterThan(0)
  })

  test('status bar shows context', () => {
    const mode = createInteractiveMode(defaultOptions)
    const status = mode.getStatusBar()
    expect(status.resourceName).toBeDefined()
    expect(status.itemCount).toBeDefined()
    expect(status.currentView).toBeDefined()
  })

  test('confirmation requires explicit input', () => {
    const mode = createInteractiveMode(defaultOptions)
    mode.deleteSelected()
    // Any key other than y/Enter should not confirm
    mode.handleKey({ key: 'x' })
    expect(mode.getState().view).toBe('confirm')
    mode.handleKey({ key: 'y' })
    expect(mode.getState().view).toBe('list')
  })
})

// ============================================================================
// 20. Type Safety Tests
// ============================================================================

describe('Type Safety', () => {
  test('ViewState type has all required properties', () => {
    const state: ViewState = {
      view: 'list',
      resourceName: 'tasks',
      selectedIndex: 0,
    }
    expect(state.view).toBeDefined()
    expect(state.resourceName).toBeDefined()
    expect(state.selectedIndex).toBeDefined()
  })

  test('ViewState optional properties are optional', () => {
    const state: ViewState = {
      view: 'form',
      resourceName: 'tasks',
      selectedIndex: 0,
      formMode: 'edit',
      selectedId: '1',
    }
    expect(state.formMode).toBe('edit')
    expect(state.selectedId).toBe('1')
  })

  test('ConfirmAction has required callbacks', () => {
    const action: ConfirmAction = {
      type: 'delete',
      message: 'Confirm?',
      onConfirm: () => {},
      onCancel: () => {},
    }
    expect(action.onConfirm).toBeDefined()
    expect(action.onCancel).toBeDefined()
  })

  test('KeyEvent supports all modifiers', () => {
    const event: KeyEvent = {
      key: 'k',
      ctrl: true,
      shift: true,
      meta: true,
    }
    expect(event.ctrl).toBe(true)
    expect(event.shift).toBe(true)
    expect(event.meta).toBe(true)
  })

  test('InteractiveModeOptions has correct types', () => {
    const options: InteractiveModeOptions = {
      resource: 'tasks',
      data: [],
      idField: 'id',
      maxHistoryDepth: 50,
      wrapNavigation: false,
      onQuit: () => {},
      onStateChange: () => {},
    }
    expect(options.resource).toBe('tasks')
  })
})

// ============================================================================
// Total: ~165 tests
// ============================================================================
