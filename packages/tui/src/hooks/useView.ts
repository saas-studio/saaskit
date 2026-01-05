/**
 * useView Hook
 *
 * Hook for managing view state in the TUI.
 */

import { useState, useCallback } from 'react'
import type { View } from '@saaskit/core'

export function useView<T extends View>(initialView?: T) {
  const [view, setView] = useState<T | undefined>(initialView)

  const updateView = useCallback((updates: Partial<T>) => {
    setView((current) => (current ? { ...current, ...updates } : current))
  }, [])

  return { view, setView, updateView }
}
