/**
 * App Scaffolding Generator
 *
 * Generates a complete Shadmin app from a SaaSKit schema.
 *
 * @see saaskit-060
 */

import type { SaaSSchema } from '@saaskit/schema'
import type { GeneratedComponent, GeneratedResource } from '../types'
import { generateResource } from './resource'

// ============================================================================
// Types
// ============================================================================

export interface ScaffoldResult {
  /** Main App component */
  app: GeneratedComponent
  /** Data provider configuration */
  dataProvider: GeneratedComponent
  /** Auth provider stub */
  authProvider: GeneratedComponent
  /** Index entry point */
  index: GeneratedComponent
  /** Resource files */
  resources: GeneratedResource[]
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Pluralize and lowercase a resource name for API routes
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

// ============================================================================
// Generators
// ============================================================================

/**
 * Generate App.tsx
 */
function generateApp(schema: SaaSSchema): GeneratedComponent {
  const resources = schema.resources

  // Generate imports
  const imports = resources.map((r) => {
    return `import { ${r.name}List, ${r.name}Edit, ${r.name}Create, ${r.name}Show } from './resources/${r.name}'`
  })

  // Generate Resource elements
  const resourceElements = resources.map((r) => {
    const name = pluralize(r.name)
    return `    <Resource
      name="${name}"
      list={${r.name}List}
      edit={${r.name}Edit}
      create={${r.name}Create}
      show={${r.name}Show}
    />`
  })

  const code = `import { Admin, Resource } from 'react-admin'
import { dataProvider } from './dataProvider'
import { authProvider } from './authProvider'
${imports.join('\n')}

export const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
  >
${resourceElements.join('\n')}
  </Admin>
)`

  return {
    name: 'App',
    code,
    imports: ['Admin', 'Resource'],
    filePath: 'App.tsx',
  }
}

/**
 * Generate dataProvider.ts
 */
function generateDataProvider(): GeneratedComponent {
  const code = `import { createDataStoreProvider } from '@saaskit/shadmin-provider'
import { MongoDataStore } from '@saaskit/schema'
import schema from './schema'

const dataStore = new MongoDataStore(schema, {
  database: 'app',
  inMemory: true,
})

export const dataProvider = createDataStoreProvider({ dataStore })
`

  return {
    name: 'dataProvider',
    code,
    imports: ['createDataStoreProvider', 'MongoDataStore'],
    filePath: 'dataProvider.ts',
  }
}

/**
 * Generate authProvider.ts stub
 */
function generateAuthProvider(): GeneratedComponent {
  const code = `import type { AuthProvider } from 'react-admin'

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    // TODO: Implement login
    localStorage.setItem('auth', JSON.stringify({ username }))
    return Promise.resolve()
  },

  logout: async () => {
    localStorage.removeItem('auth')
    return Promise.resolve()
  },

  checkAuth: async () => {
    const auth = localStorage.getItem('auth')
    if (auth) {
      return Promise.resolve()
    }
    return Promise.reject()
  },

  checkError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('auth')
      return Promise.reject()
    }
    return Promise.resolve()
  },

  getIdentity: async () => {
    const auth = localStorage.getItem('auth')
    if (auth) {
      const { username } = JSON.parse(auth)
      return { id: username, fullName: username }
    }
    return Promise.reject()
  },

  getPermissions: async () => {
    return Promise.resolve([])
  },
}
`

  return {
    name: 'authProvider',
    code,
    imports: ['AuthProvider'],
    filePath: 'authProvider.ts',
  }
}

/**
 * Generate index.tsx entry point
 */
function generateIndex(): GeneratedComponent {
  const code = `import { createRoot } from 'react-dom/client'
import { App } from './App'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
`

  return {
    name: 'index',
    code,
    imports: ['createRoot'],
    filePath: 'index.tsx',
  }
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate a complete Shadmin app scaffold from a schema
 */
export function generateScaffold(schema: SaaSSchema): ScaffoldResult {
  // Generate resources using existing generator
  const resources = schema.resources.map((r) => generateResource(r))

  return {
    app: generateApp(schema),
    dataProvider: generateDataProvider(),
    authProvider: generateAuthProvider(),
    index: generateIndex(),
    resources,
  }
}
