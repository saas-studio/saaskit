/**
 * Focus Context
 *
 * Manages focus state across the entire TUI application.
 * Provides Tab navigation between focusable components.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'

export interface FocusContextValue {
  /**
   * Currently focused element ID
   */
  focusedId: string | null

  /**
   * Set the focused element
   */
  setFocusedId: (id: string | null) => void

  /**
   * List of registered focusable element IDs in order
   */
  focusables: string[]

  /**
   * Register a focusable element
   */
  registerFocusable: (id: string) => void

  /**
   * Unregister a focusable element
   */
  unregisterFocusable: (id: string) => void

  /**
   * Move focus to the next element
   */
  focusNext: () => void

  /**
   * Move focus to the previous element
   */
  focusPrevious: () => void

  /**
   * Move focus to the first element
   */
  focusFirst: () => void

  /**
   * Move focus to the last element
   */
  focusLast: () => void

  /**
   * Whether focus management is enabled
   */
  isEnabled: boolean

  /**
   * Enable focus management
   */
  enableFocus: () => void

  /**
   * Disable focus management
   */
  disableFocus: () => void
}

export const FocusContext = createContext<FocusContextValue | null>(null)

interface FocusProviderProps {
  children: ReactNode
}

export function useFocusManager(): FocusContextValue {
  const context = useContext(FocusContext)
  if (!context) {
    throw new Error('useFocusManager must be used within a FocusProvider')
  }
  return context
}

export function FocusProvider({ children }: FocusProviderProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [focusables, setFocusables] = useState<string[]>([])
  const [isEnabled, setIsEnabled] = useState(true)

  const registerFocusable = useCallback((id: string) => {
    setFocusables((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [])

  const unregisterFocusable = useCallback((id: string) => {
    setFocusables((prev) => prev.filter((fid) => fid !== id))

    // If the unregistered element was focused, clear focus
    setFocusedId((current) => (current === id ? null : current))
  }, [])

  const focusNext = useCallback(() => {
    if (!isEnabled || focusables.length === 0) return

    setFocusedId((current) => {
      if (!current) return focusables[0]

      const currentIndex = focusables.indexOf(current)
      const nextIndex = (currentIndex + 1) % focusables.length
      return focusables[nextIndex]
    })
  }, [isEnabled, focusables])

  const focusPrevious = useCallback(() => {
    if (!isEnabled || focusables.length === 0) return

    setFocusedId((current) => {
      if (!current) return focusables[focusables.length - 1]

      const currentIndex = focusables.indexOf(current)
      const prevIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1
      return focusables[prevIndex]
    })
  }, [isEnabled, focusables])

  const focusFirst = useCallback(() => {
    if (!isEnabled || focusables.length === 0) return
    setFocusedId(focusables[0])
  }, [isEnabled, focusables])

  const focusLast = useCallback(() => {
    if (!isEnabled || focusables.length === 0) return
    setFocusedId(focusables[focusables.length - 1])
  }, [isEnabled, focusables])

  const enableFocus = useCallback(() => setIsEnabled(true), [])
  const disableFocus = useCallback(() => setIsEnabled(false), [])

  const value = useMemo<FocusContextValue>(
    () => ({
      focusedId,
      setFocusedId,
      focusables,
      registerFocusable,
      unregisterFocusable,
      focusNext,
      focusPrevious,
      focusFirst,
      focusLast,
      isEnabled,
      enableFocus,
      disableFocus,
    }),
    [
      focusedId,
      focusables,
      registerFocusable,
      unregisterFocusable,
      focusNext,
      focusPrevious,
      focusFirst,
      focusLast,
      isEnabled,
      enableFocus,
      disableFocus,
    ]
  )

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
}
