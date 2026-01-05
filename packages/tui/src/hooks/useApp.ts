/**
 * useApp Hook
 *
 * Hook for accessing the app instance and actions.
 */

import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import type { AppDefinition } from '@saaskit/core'

export function useApp(): AppDefinition {
  const app = useContext(AppContext)
  if (!app) {
    throw new Error('useApp must be used within an AppContext.Provider')
  }
  return app
}
