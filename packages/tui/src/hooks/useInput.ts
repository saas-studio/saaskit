/**
 * useInput Hook
 *
 * Handle keyboard input in terminal UI components.
 * Works with both OpenTUI and React Ink.
 */

import { useEffect, useCallback } from 'react'

export interface KeyInfo {
  // Arrow keys
  upArrow: boolean
  downArrow: boolean
  leftArrow: boolean
  rightArrow: boolean

  // Special keys
  return: boolean
  escape: boolean
  tab: boolean
  backspace: boolean
  delete: boolean
  space: boolean

  // Modifiers
  shift: boolean
  ctrl: boolean
  meta: boolean
  alt: boolean

  // Page navigation
  pageUp: boolean
  pageDown: boolean
  home: boolean
  end: boolean
}

export interface UseInputOptions {
  /**
   * Only capture input when active
   * @default true
   */
  isActive?: boolean

  /**
   * Also capture raw character input
   * @default true
   */
  captureRaw?: boolean
}

/**
 * Hook to handle keyboard input
 *
 * @example
 * ```tsx
 * useInput((input, key) => {
 *   if (key.upArrow) moveUp()
 *   if (key.downArrow) moveDown()
 *   if (key.return) select()
 *   if (input === 'q') quit()
 * })
 * ```
 */
export function useInput(
  handler: (input: string, key: KeyInfo) => void,
  options: UseInputOptions = {}
): void {
  const { isActive = true, captureRaw = true } = options

  const handleKeyPress = useCallback(
    (data: Buffer | string) => {
      if (!isActive) return

      const input = typeof data === 'string' ? data : data.toString('utf-8')
      const key = parseKey(input)

      handler(captureRaw ? input : '', key)
    },
    [handler, isActive, captureRaw]
  )

  useEffect(() => {
    if (!isActive) return

    // Set raw mode to capture individual keystrokes
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
    }
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', handleKeyPress)

    return () => {
      process.stdin.off('data', handleKeyPress)
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false)
      }
    }
  }, [handleKeyPress, isActive])
}

/**
 * Parse raw input into KeyInfo
 */
function parseKey(input: string): KeyInfo {
  const key: KeyInfo = {
    upArrow: false,
    downArrow: false,
    leftArrow: false,
    rightArrow: false,
    return: false,
    escape: false,
    tab: false,
    backspace: false,
    delete: false,
    space: false,
    shift: false,
    ctrl: false,
    meta: false,
    alt: false,
    pageUp: false,
    pageDown: false,
    home: false,
    end: false,
  }

  // Check for escape sequences (arrow keys, etc.)
  if (input.startsWith('\x1b')) {
    // CSI sequences
    if (input === '\x1b[A') key.upArrow = true
    if (input === '\x1b[B') key.downArrow = true
    if (input === '\x1b[C') key.rightArrow = true
    if (input === '\x1b[D') key.leftArrow = true
    if (input === '\x1b[5~') key.pageUp = true
    if (input === '\x1b[6~') key.pageDown = true
    if (input === '\x1b[H' || input === '\x1b[1~') key.home = true
    if (input === '\x1b[F' || input === '\x1b[4~') key.end = true
    if (input === '\x1b[3~') key.delete = true

    // Shift+arrow
    if (input === '\x1b[1;2A') { key.upArrow = true; key.shift = true }
    if (input === '\x1b[1;2B') { key.downArrow = true; key.shift = true }
    if (input === '\x1b[1;2C') { key.rightArrow = true; key.shift = true }
    if (input === '\x1b[1;2D') { key.leftArrow = true; key.shift = true }

    // Alt+key (Meta)
    if (input.length === 2 && input[0] === '\x1b') {
      key.alt = true
    }

    // Plain escape
    if (input === '\x1b') key.escape = true
  }

  // Single character control codes
  if (input === '\r' || input === '\n') key.return = true
  if (input === '\t') key.tab = true
  if (input === '\x7f' || input === '\b') key.backspace = true
  if (input === ' ') key.space = true

  // Ctrl+letter (ASCII 1-26)
  const code = input.charCodeAt(0)
  if (code >= 1 && code <= 26) {
    key.ctrl = true
  }

  // Shift+Tab
  if (input === '\x1b[Z') {
    key.tab = true
    key.shift = true
  }

  return key
}

/**
 * Utility to check for vim-style navigation
 */
export function isVimNavigation(input: string, key: KeyInfo): {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
} {
  return {
    up: key.upArrow || input === 'k',
    down: key.downArrow || input === 'j',
    left: key.leftArrow || input === 'h',
    right: key.rightArrow || input === 'l',
  }
}
