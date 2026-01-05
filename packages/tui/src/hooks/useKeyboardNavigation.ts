/**
 * useKeyboardNavigation Hook
 *
 * Hook for handling keyboard navigation in the TUI.
 */

import { useCallback, useContext } from 'react'
import { FocusContext } from '../context/FocusContext'
import { useInput } from './useInput'

interface KeyboardNavigationOptions {
  vimMode?: boolean
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const { vimMode = true } = options
  const focusContext = useContext(FocusContext)

  const handleInput = useCallback(
    (input: string, key: { upArrow: boolean; downArrow: boolean; leftArrow: boolean; rightArrow: boolean; tab: boolean; shift: boolean }) => {
      if (!focusContext) return

      // Tab navigation
      if (key.tab) {
        if (key.shift) {
          focusContext.focusPrevious()
        } else {
          focusContext.focusNext()
        }
        return
      }

      // Arrow key navigation
      if (key.upArrow || (vimMode && input === 'k')) {
        focusContext.focusPrevious()
        return
      }

      if (key.downArrow || (vimMode && input === 'j')) {
        focusContext.focusNext()
        return
      }
    },
    [focusContext, vimMode]
  )

  useInput(handleInput)

  return {
    focusNext: focusContext?.focusNext,
    focusPrevious: focusContext?.focusPrevious,
    focusFirst: focusContext?.focusFirst,
    focusLast: focusContext?.focusLast,
  }
}
