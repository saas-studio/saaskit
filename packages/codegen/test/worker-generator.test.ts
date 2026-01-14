/**
 * Worker Entry Point Generator Tests - RED Phase
 *
 * Tests for generating Cloudflare Worker entry points from schema definitions.
 * These tests define the expected behavior and MUST FAIL until implementation is complete.
 *
 * Expected output structure:
 * - DO class export
 * - DurableObject binding export
 * - Fetch handler for standalone mode
 * - Request routing to DO instances
 * - Environment type declarations
 */

import { describe, it, expect } from 'vitest'
import { generateWorkerEntry } from '@saaskit/codegen'
import type { SchemaDefinition } from '@saaskit/core'

// ============================================================================
// Test Schema Definitions
// ============================================================================

const schema: SchemaDefinition = {
  name: 'MyApp',
  namespace: 'myapp.example.com',
  resources: {
    users: {
      fields: {
        name: 'string'
      }
    }
  }
}

const multiResourceSchema: SchemaDefinition = {
  name: 'MultiApp',
  namespace: 'multiapp.example.com',
  resources: {
    users: {
      fields: {
        name: 'string',
        email: { type: 'string', required: true }
      }
    },
    posts: {
      fields: {
        title: 'string',
        content: 'string'
      },
      relationships: {
        author: { resource: 'users', type: 'belongsTo' }
      }
    }
  }
}

// ============================================================================
// DO Class Export Tests
// ============================================================================

describe('generateWorkerEntry - DO class export', () => {
  it('exports the DO class', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toContain('export { MyAppDO }')
  })

  it('exports DurableObject binding', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toContain('export class MyAppDO')
  })

  it('uses schema name for DO class name', () => {
    const code = generateWorkerEntry(multiResourceSchema)
    expect(code).toContain('MultiAppDO')
  })
})

// ============================================================================
// Fetch Handler Tests
// ============================================================================

describe('generateWorkerEntry - Fetch handler', () => {
  it('includes fetch handler for standalone mode', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toContain('export default {')
    expect(code).toContain('async fetch(request')
  })

  it('exports default handler object', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toMatch(/export default \{[\s\S]*fetch/)
  })

  it('includes request and env parameters in fetch', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toMatch(/fetch\(request.*,.*env/)
  })
})

// ============================================================================
// DO Routing Tests
// ============================================================================

describe('generateWorkerEntry - DO routing', () => {
  it('routes requests to DO instance', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toContain('env.MY_APP_DO')
    expect(code).toContain('.get(id)')
    expect(code).toContain('.fetch(request)')
  })

  it('uses uppercase snake case for DO binding name', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toContain('MY_APP_DO')
  })

  it('handles DO ID from URL or default', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toMatch(/idFromName|idFromString/)
  })

  it('gets DO stub before forwarding request', () => {
    const code = generateWorkerEntry(schema)
    // Should get the stub first, then call fetch on it
    expect(code).toMatch(/\.get\(.*\)/)
    expect(code).toMatch(/\.fetch\(/)
  })
})

// ============================================================================
// Environment Type Declaration Tests
// ============================================================================

describe('generateWorkerEntry - Type declarations', () => {
  it('includes type declarations for env', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toContain('interface Env {')
    expect(code).toContain('MY_APP_DO: DurableObjectNamespace')
  })

  it('exports Env interface', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toMatch(/export\s+interface\s+Env/)
  })

  it('includes DurableObjectNamespace type', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toContain('DurableObjectNamespace')
  })
})

// ============================================================================
// TypeScript Validity Tests
// ============================================================================

describe('generateWorkerEntry - TypeScript validity', () => {
  it('generates valid TypeScript syntax', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toMatch(/^import/m)
    expect(code).toContain('export default')
  })

  it('has imports at the top', () => {
    const code = generateWorkerEntry(schema)
    const lines = code.split('\n')
    const firstCodeLine = lines.find(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('/*'))
    expect(firstCodeLine).toMatch(/^import/)
  })

  it('includes proper async/await syntax', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toMatch(/async.*fetch/)
    expect(code).toContain('await')
  })

  it('has proper type annotations', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toMatch(/:\s*Response|Promise<Response>/)
  })
})

// ============================================================================
// Import Generation Tests
// ============================================================================

describe('generateWorkerEntry - Imports', () => {
  it('imports the generated DO class', () => {
    const code = generateWorkerEntry(schema)
    // Should import or re-export the DO class
    expect(code).toMatch(/import.*MyAppDO|export.*MyAppDO/)
  })

  it('imports DurableObject types from cloudflare workers', () => {
    const code = generateWorkerEntry(schema)
    expect(code).toMatch(/DurableObject|@cloudflare\/workers/)
  })
})

// ============================================================================
// Edge Cases
// ============================================================================

describe('generateWorkerEntry - Edge cases', () => {
  it('handles schema with special characters in name', () => {
    const specialSchema: SchemaDefinition = {
      name: 'My-Special_App',
      namespace: 'special.example.com',
      resources: {
        items: { fields: { name: 'string' } }
      }
    }

    const code = generateWorkerEntry(specialSchema)
    // Should produce valid identifier for binding name
    expect(code).toMatch(/MY_SPECIAL_APP_DO|MYSPECIALAPP_DO/)
  })

  it('handles schema with no resources', () => {
    const emptySchema: SchemaDefinition = {
      name: 'Empty',
      namespace: 'empty.example.com',
      resources: {}
    }

    const code = generateWorkerEntry(emptySchema)
    expect(code).toContain('EmptyDO')
    expect(code).toContain('export default')
  })

  it('handles lowercase schema names', () => {
    const lowercaseSchema: SchemaDefinition = {
      name: 'myapp',
      namespace: 'myapp.example.com',
      resources: {
        items: { fields: { name: 'string' } }
      }
    }

    const code = generateWorkerEntry(lowercaseSchema)
    // Should properly capitalize the class name
    expect(code).toMatch(/MyappDO|MyAppDO/)
  })
})

// ============================================================================
// Full Output Verification Tests
// ============================================================================

describe('generateWorkerEntry - Full output', () => {
  it('generates complete worker entry point', () => {
    const code = generateWorkerEntry(schema)

    // Should have all major sections
    expect(code).toContain('import') // Imports
    expect(code).toContain('interface Env') // Type declarations
    expect(code).toContain('export class') // DO class export
    expect(code).toContain('export default') // Default export handler
  })

  it('generates code in correct order', () => {
    const code = generateWorkerEntry(schema)

    // Verify ordering: imports, types, class, default export
    const importIndex = code.indexOf('import')
    const interfaceIndex = code.indexOf('interface Env')
    const classIndex = code.indexOf('export class')
    const defaultExportIndex = code.indexOf('export default')

    expect(importIndex).toBeLessThan(interfaceIndex)
    expect(interfaceIndex).toBeLessThan(classIndex)
    expect(classIndex).toBeLessThan(defaultExportIndex)
  })

  it('includes error handling in fetch handler', () => {
    const code = generateWorkerEntry(schema)
    // Should have try/catch or error response handling
    expect(code).toMatch(/try|catch|Response.*error|500/)
  })
})
