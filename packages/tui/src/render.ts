/**
 * Renderer detection and startup
 *
 * Priority: OpenTUI > React Ink > Plain Text
 */

import type { AppDefinition } from '@saaskit/core'

export type RenderEngine = 'opentui' | 'ink' | 'text'

interface RendererResult {
  engine: RenderEngine
  cleanup?: () => void
}

/**
 * Detect the best available renderer
 */
export function detectBestRenderer(): RenderEngine {
  // Check for TTY - if not interactive, use text
  if (!process.stdout.isTTY) {
    return 'text'
  }

  // Try OpenTUI first
  try {
    require.resolve('@opentui/core')
    require.resolve('@opentui/react')
    return 'opentui'
  } catch {
    // OpenTUI not available
  }

  // Try React Ink
  try {
    require.resolve('ink')
    return 'ink'
  } catch {
    // Ink not available
  }

  // Fallback to plain text
  return 'text'
}

/**
 * Render the app using the best available renderer
 */
export async function render(app: AppDefinition): Promise<RendererResult> {
  const engine = detectBestRenderer()

  switch (engine) {
    case 'opentui':
      return renderWithOpenTUI(app)
    case 'ink':
      return renderWithInk(app)
    case 'text':
      return renderAsText(app)
  }
}

/**
 * Render using OpenTUI (primary)
 */
export async function renderWithOpenTUI(app: AppDefinition): Promise<RendererResult> {
  const { createRoot } = await import('@opentui/react')
  const { createCliRenderer } = await import('@opentui/core')
  const { TUIApp } = await import('./App')
  const React = await import('react')

  const renderer = await createCliRenderer()
  const root = createRoot(renderer)
  root.render(React.createElement(TUIApp, { app }))

  return {
    engine: 'opentui',
    cleanup: () => root?.unmount?.(),
  }
}

/**
 * Render using React Ink (fallback)
 */
export async function renderWithInk(app: AppDefinition): Promise<RendererResult> {
  const { render } = await import('ink')
  const { InkApp } = await import('./InkApp')
  const React = await import('react')

  const instance = render(React.createElement(InkApp, { app }))

  return {
    engine: 'ink',
    cleanup: () => instance.unmount(),
  }
}

/**
 * Render as plain text (non-interactive)
 */
export function renderAsText(app: AppDefinition): RendererResult {
  // Generate text output from app
  const output = generateTextOutput(app)
  console.log(output)

  return { engine: 'text' }
}

function generateTextOutput(app: AppDefinition): string {
  const lines: string[] = []

  lines.push(`# ${app.name}`)
  lines.push('')

  if (app.description) {
    lines.push(app.description)
    lines.push('')
  }

  lines.push('## Resources')
  lines.push('')

  for (const resource of app.resources || []) {
    lines.push(`### ${resource.name}`)
    lines.push('')
    lines.push('Fields:')
    for (const field of resource.fields || []) {
      const required = field.required ? ' (required)' : ''
      lines.push(`  - ${field.name}: ${field.type}${required}`)
    }
    lines.push('')
  }

  lines.push('## Commands')
  lines.push('')
  lines.push(`  ${app.name} list`)
  lines.push(`  ${app.name} create`)
  lines.push(`  ${app.name} <id>`)
  lines.push(`  ${app.name} update <id>`)
  lines.push(`  ${app.name} delete <id>`)

  return lines.join('\n')
}
