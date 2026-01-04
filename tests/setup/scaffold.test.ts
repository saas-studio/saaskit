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
})
