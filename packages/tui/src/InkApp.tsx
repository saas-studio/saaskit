/**
 * Ink-based TUI Application
 *
 * Fallback renderer using React Ink when OpenTUI is not available.
 */

import React from 'react'
import type { AppDefinition } from '@saaskit/core'

interface InkAppProps {
  app: AppDefinition
}

export function InkApp({ app }: InkAppProps) {
  // TODO: Implement Ink-based rendering
  return null
}
