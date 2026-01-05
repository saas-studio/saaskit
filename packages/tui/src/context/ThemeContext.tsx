/**
 * Theme Context
 *
 * Provides theming capabilities throughout the TUI application.
 */

import React, { createContext, useContext, ReactNode } from 'react'
import type { ThemeConfig } from '../types'

const defaultTheme: ThemeConfig = {
  primary: '#007AFF',
  secondary: '#5856D6',
  accent: '#5AC8FA',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5856D6',
}

export const ThemeContext = createContext<ThemeConfig>(defaultTheme)

interface ThemeProviderProps {
  theme?: ThemeConfig
  children: ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const mergedTheme = { ...defaultTheme, ...theme }
  return <ThemeContext.Provider value={mergedTheme}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeConfig {
  return useContext(ThemeContext)
}
