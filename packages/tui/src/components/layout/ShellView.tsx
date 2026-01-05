/**
 * ShellView Component
 *
 * Main shell layout for the TUI application.
 */

import React, { ReactNode } from 'react'
import type { ShellConfig } from '../../utils/shell'

interface ShellViewProps {
  config: ShellConfig
  children: ReactNode
}

export function ShellView({ config, children }: ShellViewProps) {
  // TODO: Implement ShellView rendering
  return <>{children}</>
}
