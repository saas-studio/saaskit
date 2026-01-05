/**
 * App Context
 *
 * Provides access to the app definition throughout the TUI.
 */

import { createContext, useContext } from 'react'
import type { AppDefinition } from '@saaskit/core'

export const AppContext = createContext<AppDefinition | null>(null)

export function useAppContext(): AppDefinition {
  const app = useContext(AppContext)
  if (!app) {
    throw new Error('useAppContext must be used within an AppContext.Provider')
  }
  return app
}
