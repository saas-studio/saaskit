/**
 * Primitives
 *
 * Basic UI building blocks, re-exported from the underlying renderer.
 */

import React, { ReactNode } from 'react'

// Try to use OpenTUI primitives, fallback to basic implementations

interface BoxProps {
  children?: ReactNode
  flexDirection?: 'row' | 'column'
  padding?: number
  margin?: number
  borderStyle?: string
  [key: string]: unknown
}

export function Box({ children, ...props }: BoxProps) {
  return <>{children}</>
}

interface TextProps {
  children?: ReactNode
  color?: string
  bold?: boolean
  dimColor?: boolean
  [key: string]: unknown
}

export function Text({ children, ...props }: TextProps) {
  return <>{children}</>
}

export function Spacer() {
  return null
}
