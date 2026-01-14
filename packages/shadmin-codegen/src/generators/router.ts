/**
 * Router Configuration Generator
 *
 * Generates React Router configuration from a SaaSKit schema.
 *
 * @see saaskit-e2c
 */

import type { SaaSSchema, Resource } from '@saaskit/schema'
import type { GeneratedComponent } from '../types'

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert resource name to URL-friendly plural form
 */
function pluralize(name: string): string {
  const lower = name.toLowerCase()
  if (/(?:s|x|z|ch|sh)$/.test(lower)) {
    return lower + 'es'
  }
  if (/[^aeiou]y$/.test(lower)) {
    return lower.slice(0, -1) + 'ies'
  }
  return lower + 's'
}

/**
 * Convert resource name to kebab-case
 */
function toKebabCase(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generates React Router configuration for all resources in the schema
 *
 * @param schema - The SaaS schema
 * @returns Generated component with router configuration
 */
export function generateRouter(schema: SaaSSchema): GeneratedComponent {
  const resources = schema.resources

  // Collect imports
  const imports = [
    'createBrowserRouter',
    'RouterProvider',
    'Outlet',
    'Navigate',
  ]

  // Generate resource imports
  const resourceImports = resources.map((r: Resource) => {
    const name = r.name
    return `import { ${name}List, ${name}Show, ${name}Edit, ${name}Create } from './resources/${name}'`
  })

  // Generate route objects for each resource
  const routeObjects = resources.map((r: Resource) => {
    const name = r.name
    const path = pluralize(name)
    return `    {
      path: '${path}',
      children: [
        { index: true, element: <${name}List /> },
        { path: 'new', element: <${name}Create /> },
        { path: ':id', element: <${name}Show /> },
        { path: ':id/edit', element: <${name}Edit /> },
      ],
    }`
  })

  // Generate the router configuration code
  const code = `import React from 'react'
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './Dashboard'
${resourceImports.join('\n')}

/**
 * Application routes configuration
 */
const routes = [
  {
    path: '/',
    element: <Layout><Outlet /></Layout>,
    children: [
      { index: true, element: <Dashboard /> },
${routeObjects.join(',\n')},
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]

/**
 * React Router browser router instance
 */
export const router = createBrowserRouter(routes)

/**
 * Router Provider component for the application
 */
export const AppRouter = () => <RouterProvider router={router} />

export default AppRouter
`

  return {
    name: 'AppRouter',
    code,
    imports,
    filePath: 'router.tsx',
  }
}
