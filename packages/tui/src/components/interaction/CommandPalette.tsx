/**
 * CommandPalette Component
 *
 * A fuzzy-finder style interface (like VS Code's Cmd+P) for the terminal UI.
 * Allows users to quickly search and execute commands using keyboard navigation.
 *
 * @module @saaskit/tui/components
 */

import React from 'react'

/**
 * Represents a single command that can be executed via the palette
 */
export interface Command {
  /** Unique identifier for the command */
  id: string
  /** Display label shown in the palette */
  label: string
  /** Optional keyboard shortcut (e.g., "Ctrl+S", "Cmd+K") */
  shortcut?: string
  /** Action to execute when the command is selected */
  action: () => void
  /** Optional category for grouping commands (e.g., "File", "Edit", "View") */
  category?: string
  /** Optional description for additional context */
  description?: string
  /** Optional icon identifier */
  icon?: string
  /** Whether this command is currently disabled */
  disabled?: boolean
}

/**
 * Props for the CommandPalette component
 */
export interface CommandPaletteProps {
  /** Array of available commands */
  commands: Command[]
  /** Callback when a command is selected and executed */
  onSelect: (command: Command) => void
  /** Callback when the palette is closed */
  onClose: () => void
  /** Whether the palette is currently visible */
  isOpen: boolean
  /** Optional placeholder text for the search input */
  placeholder?: string
  /** Optional title displayed at the top of the palette */
  title?: string
  /** Enable vim-style navigation (hjkl) in addition to arrow keys */
  vimMode?: boolean
  /** Maximum number of results to display */
  maxResults?: number
  /** Width of the palette (in characters) */
  width?: number
  /** Custom fuzzy match function */
  matchFn?: (query: string, command: Command) => boolean
}

/**
 * State for the CommandPalette component
 */
export interface CommandPaletteState {
  /** Current search query */
  query: string
  /** Index of currently selected command */
  selectedIndex: number
  /** Filtered list of commands matching the query */
  filteredCommands: Command[]
}

/**
 * Default fuzzy match function
 * Matches if query characters appear in order within the label
 */
export function defaultFuzzyMatch(query: string, command: Command): boolean {
  if (!query) return true
  if (command.disabled) return false

  const lowerQuery = query.toLowerCase()
  const lowerLabel = command.label.toLowerCase()
  const lowerCategory = command.category?.toLowerCase() ?? ''

  // Check if query is a substring
  if (lowerLabel.includes(lowerQuery)) return true
  if (lowerCategory.includes(lowerQuery)) return true

  // Fuzzy match: all query characters appear in order
  let queryIndex = 0
  for (const char of lowerLabel) {
    if (char === lowerQuery[queryIndex]) {
      queryIndex++
      if (queryIndex === lowerQuery.length) return true
    }
  }

  return false
}

/**
 * Calculate match score for sorting
 * Higher score = better match
 */
export function calculateMatchScore(query: string, command: Command): number {
  if (!query) return 0

  const lowerQuery = query.toLowerCase()
  const lowerLabel = command.label.toLowerCase()

  // Exact match gets highest score
  if (lowerLabel === lowerQuery) return 100

  // Starts with query gets high score
  if (lowerLabel.startsWith(lowerQuery)) return 80

  // Contains query gets medium score
  if (lowerLabel.includes(lowerQuery)) return 60

  // Fuzzy match gets lower score
  return 20
}

/**
 * CommandPalette Component
 *
 * A fuzzy-finder style interface for quickly searching and executing commands.
 *
 * Features:
 * - Fuzzy search filtering
 * - Keyboard navigation (arrow keys + vim hjkl)
 * - Command categorization
 * - Keyboard shortcut display
 * - Escape to close
 *
 * @example
 * ```tsx
 * const commands = [
 *   { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', action: () => {} },
 *   { id: 'save', label: 'Save', shortcut: 'Ctrl+S', action: () => {} },
 *   { id: 'quit', label: 'Quit', shortcut: 'Ctrl+Q', action: () => {} },
 * ]
 *
 * <CommandPalette
 *   commands={commands}
 *   isOpen={isOpen}
 *   onSelect={(cmd) => cmd.action()}
 *   onClose={() => setIsOpen(false)}
 * />
 * ```
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands,
  onSelect,
  onClose,
  isOpen,
  placeholder = 'Type a command...',
  title = 'Command Palette',
  vimMode = true,
  maxResults = 10,
  width = 60,
  matchFn = defaultFuzzyMatch,
}) => {
  // TODO: Implement component
  // This is a stub implementation for TDD - tests should fail

  if (!isOpen) {
    return null
  }

  // Stub: Return minimal structure that tests can verify exists
  return null
}

/**
 * Hook to manage command palette state
 */
export function useCommandPalette(commands: Command[]) {
  // TODO: Implement hook
  // This is a stub implementation for TDD

  return {
    query: '',
    setQuery: (_query: string) => {},
    selectedIndex: 0,
    setSelectedIndex: (_index: number) => {},
    filteredCommands: [] as Command[],
    selectNext: () => {},
    selectPrevious: () => {},
    executeSelected: () => {},
    reset: () => {},
  }
}

/**
 * Hook to register commands with the palette
 */
export function useCommandRegistration() {
  // TODO: Implement hook
  // This is a stub implementation for TDD

  return {
    commands: [] as Command[],
    register: (_command: Command) => {},
    unregister: (_id: string) => {},
    registerMany: (_commands: Command[]) => {},
    clear: () => {},
  }
}

export default CommandPalette
