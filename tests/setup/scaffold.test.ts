import { describe, expect, test } from 'bun:test'

describe('Project Scaffolding', () => {
  test('package.json has correct structure', async () => {
    const pkg = await import('../../package.json')
    expect(pkg.name).toBe('saaskit')
    expect(pkg.type).toBe('module')
    expect(pkg.engines?.bun).toBeDefined()
  })

  test('TypeScript config is strict mode', async () => {
    const tsconfig = await Bun.file('tsconfig.json').json()
    expect(tsconfig.compilerOptions.strict).toBe(true)
  })

  test('bun test runs without errors', () => {
    // This test passing means bun test works
    expect(true).toBe(true)
  })

  test('src/index.ts exports VERSION', async () => {
    const { VERSION } = await import('../../src/index')
    expect(VERSION).toBeDefined()
    expect(typeof VERSION).toBe('string')
  })

  test('src/index.ts exports NAME and DESCRIPTION', async () => {
    const { NAME, DESCRIPTION } = await import('../../src/index')
    expect(NAME).toBe('saaskit')
    expect(DESCRIPTION).toBe('Headless SaaS for AI Agents')
  })

  test('src/index.ts exports all schema components', async () => {
    const index = await import('../../src/index')

    // Core schema components
    expect(index.App).toBeDefined()
    expect(index.Resource).toBeDefined()

    // Helper functions
    expect(index.useApp).toBeDefined()
    expect(index.getAppMetadata).toBeDefined()
    expect(index.parseResourceProps).toBeDefined()
    expect(index.getResourceMetadata).toBeDefined()
  })

  test('src/index.ts exports all field components', async () => {
    const index = await import('../../src/index')

    // Field components (expanded syntax)
    expect(index.Text).toBeDefined()
    expect(index.Number).toBeDefined()
    expect(index.Boolean).toBeDefined()
    expect(index.Date).toBeDefined()
    expect(index.Select).toBeDefined()
    expect(index.Relation).toBeDefined()

    // Field helper functions
    expect(index.isFieldElement).toBeDefined()
    expect(index.getFieldMetadata).toBeDefined()
    expect(index.extractFieldsFromChildren).toBeDefined()
  })

  test('src/index.ts exports all field builders', async () => {
    const index = await import('../../src/index')

    // Field factory functions
    expect(index.string).toBeDefined()
    expect(index.email).toBeDefined()
    expect(index.url).toBeDefined()
    expect(index.uuid).toBeDefined()
    expect(index.number).toBeDefined()
    expect(index.integer).toBeDefined()
    expect(index.boolean).toBeDefined()
    expect(index.date).toBeDefined()
    expect(index.datetime).toBeDefined()
    expect(index.timestamp).toBeDefined()
    expect(index.enumField).toBeDefined()
    expect(index.json).toBeDefined()
    expect(index.id).toBeDefined()

    // Relationship factory functions
    expect(index.belongsTo).toBeDefined()
    expect(index.hasOne).toBeDefined()
    expect(index.hasMany).toBeDefined()
    expect(index.manyToMany).toBeDefined()
  })

  test('src/index.ts exports all view components', async () => {
    const index = await import('../../src/index')

    expect(index.List).toBeDefined()
    expect(index.Detail).toBeDefined()
    expect(index.Form).toBeDefined()

    // List hooks
    expect(index.useListSelection).toBeDefined()
    expect(index.useListSort).toBeDefined()
    expect(index.useVirtualScroll).toBeDefined()
  })

  test('src/index.ts exports data layer', async () => {
    const index = await import('../../src/index')

    expect(index.MemoryStore).toBeDefined()
    expect(typeof index.MemoryStore).toBe('function')
  })

  test('src/index.ts exports CLI parser', async () => {
    const index = await import('../../src/index')

    expect(index.parseArgs).toBeDefined()
    expect(index.parseCommand).toBeDefined()
    expect(index.createParseError).toBeDefined()
  })

  test('src/index.ts exports API router', async () => {
    const index = await import('../../src/index')

    expect(index.createAPIRouter).toBeDefined()
    expect(index.createErrorResponse).toBeDefined()
    expect(index.createSuccessResponse).toBeDefined()
    expect(index.ErrorCodes).toBeDefined()
  })

  test('src/index.ts exports interactive mode', async () => {
    const index = await import('../../src/index')

    expect(index.createInteractiveMode).toBeDefined()
    expect(index.parseKeyEvent).toBeDefined()
    expect(index.formatStatusBar).toBeDefined()
    expect(index.getDefaultShortcuts).toBeDefined()
    expect(index.DEFAULT_SHORTCUTS).toBeDefined()
    expect(index.DEFAULT_MAX_HISTORY_DEPTH).toBeDefined()
  })

  test('src/index.ts exports render functions', async () => {
    const index = await import('../../src/index')

    expect(index.render).toBeDefined()
    expect(index.detectFormat).toBeDefined()
  })

  test('src/index.ts exports UI components', async () => {
    const index = await import('../../src/index')

    expect(index.TextComponent).toBeDefined()
    expect(index.Box).toBeDefined()
  })
})
