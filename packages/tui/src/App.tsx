/**
 * TUI Application Root
 *
 * Wraps the app in necessary providers and renders the shell.
 */

import React from 'react'
import type { AppDefinition } from '@saaskit/core'
import { AppContext } from './context/AppContext'
import { FocusProvider } from './context/FocusContext'
import { ThemeProvider } from './context/ThemeContext'
import { ShellView } from './components/layout/ShellView'
import { Router } from './router'
import { createShellConfig } from './utils/shell'

interface TUIAppProps {
  app: AppDefinition
}

/**
 * Main TUI Application component
 */
export function TUIApp({ app }: TUIAppProps) {
  const shellConfig = createShellConfig(app)

  return (
    <AppContext.Provider value={app}>
      <ThemeProvider theme={app.theme}>
        <FocusProvider>
          <ShellView config={shellConfig}>
            <Router app={app} />
          </ShellView>
        </FocusProvider>
      </ThemeProvider>
    </AppContext.Provider>
  )
}

/**
 * Start the TUI application
 */
export async function startTUI(app: AppDefinition): Promise<void> {
  const { render } = await import('./render')
  const result = await render(app)

  // Handle cleanup on exit
  const cleanup = () => {
    result.cleanup?.()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  // Keep process alive
  await new Promise(() => {})
}
