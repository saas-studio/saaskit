/**
 * useFocus Hook
 *
 * Manage focus state for terminal UI components.
 */

import { useState, useEffect, useContext, useCallback, useId } from 'react'
import { FocusContext } from '../context/FocusContext'

export interface UseFocusOptions {
  /**
   * Unique ID for this focusable element
   * Auto-generated if not provided
   */
  id?: string

  /**
   * Auto-focus on mount if no other element is focused
   * @default false
   */
  autoFocus?: boolean

  /**
   * Whether this element can receive focus
   * @default true
   */
  isActive?: boolean
}

export interface UseFocusResult {
  /**
   * Whether this element is currently focused
   */
  isFocused: boolean

  /**
   * Programmatically focus this element
   */
  focus: () => void

  /**
   * Remove focus from this element
   */
  blur: () => void

  /**
   * The unique ID of this focusable element
   */
  id: string
}

/**
 * Hook to manage focus for a component
 *
 * @example
 * ```tsx
 * function TextInput() {
 *   const { isFocused, focus } = useFocus({ autoFocus: true })
 *
 *   return (
 *     <Box borderColor={isFocused ? 'blue' : 'gray'}>
 *       <Text>Input content</Text>
 *     </Box>
 *   )
 * }
 * ```
 */
export function useFocus(options: UseFocusOptions = {}): UseFocusResult {
  const generatedId = useId()
  const { id = generatedId, autoFocus = false, isActive = true } = options

  const context = useContext(FocusContext)

  if (!context) {
    // Fallback for when used outside FocusProvider
    const [isFocused, setIsFocused] = useState(autoFocus)
    return {
      isFocused,
      focus: () => setIsFocused(true),
      blur: () => setIsFocused(false),
      id,
    }
  }

  const {
    focusedId,
    setFocusedId,
    registerFocusable,
    unregisterFocusable,
  } = context

  // Register on mount, unregister on unmount
  useEffect(() => {
    if (!isActive) return

    registerFocusable(id)

    // Auto-focus if no element is focused
    if (autoFocus && !focusedId) {
      setFocusedId(id)
    }

    return () => {
      unregisterFocusable(id)
    }
  }, [id, isActive, autoFocus, registerFocusable, unregisterFocusable, focusedId, setFocusedId])

  const focus = useCallback(() => {
    if (isActive) {
      setFocusedId(id)
    }
  }, [id, isActive, setFocusedId])

  const blur = useCallback(() => {
    if (focusedId === id) {
      setFocusedId(null)
    }
  }, [id, focusedId, setFocusedId])

  return {
    isFocused: focusedId === id,
    focus,
    blur,
    id,
  }
}

/**
 * Hook to control focus management system
 *
 * @example
 * ```tsx
 * function App() {
 *   const { focusNext, focusPrevious, focusById } = useFocusManager()
 *
 *   useInput((input, key) => {
 *     if (key.tab && key.shift) focusPrevious()
 *     else if (key.tab) focusNext()
 *   })
 * }
 * ```
 */
export function useFocusManager() {
  const context = useContext(FocusContext)

  if (!context) {
    return {
      focusedId: null,
      focusables: [],
      focusNext: () => {},
      focusPrevious: () => {},
      focusById: () => {},
      focusFirst: () => {},
      focusLast: () => {},
      enableFocus: () => {},
      disableFocus: () => {},
    }
  }

  return {
    focusedId: context.focusedId,
    focusables: context.focusables,
    focusNext: context.focusNext,
    focusPrevious: context.focusPrevious,
    focusById: context.setFocusedId,
    focusFirst: context.focusFirst,
    focusLast: context.focusLast,
    enableFocus: context.enableFocus,
    disableFocus: context.disableFocus,
  }
}
