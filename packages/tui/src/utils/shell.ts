/**
 * Shell Utilities
 *
 * Helper functions for configuring the shell view.
 */

import type { AppDefinition } from '@saaskit/core'

export interface ShellConfig {
  title: string
  showHeader: boolean
  showFooter: boolean
  showSidebar: boolean
}

export function createShellConfig(app: AppDefinition): ShellConfig {
  return {
    title: app.name,
    showHeader: true,
    showFooter: true,
    showSidebar: true,
  }
}
