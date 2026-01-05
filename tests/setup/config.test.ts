import { describe, expect, test } from 'bun:test'
import { existsSync } from 'fs'

describe('Project Configuration', () => {
  test('bunfig.toml exists', () => {
    expect(existsSync('bunfig.toml')).toBe(true)
  })

  test('biome.json exists for linting', () => {
    expect(existsSync('biome.json')).toBe(true)
  })

  test('tsconfig.json has correct paths', async () => {
    const tsconfig = await Bun.file('tsconfig.json').json()
    expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['src/*'])
  })

  test('tsconfig.json has test paths configured', async () => {
    const tsconfig = await Bun.file('tsconfig.json').json()
    expect(tsconfig.compilerOptions.paths['@tests/*']).toEqual(['tests/*'])
  })

  test('bunfig.toml has test configuration', async () => {
    const content = await Bun.file('bunfig.toml').text()
    expect(content).toContain('[test]')
    expect(content).toContain('coverage')
  })

  test('biome.json has recommended rules enabled', async () => {
    const biome = await Bun.file('biome.json').json()
    expect(biome.linter.rules.recommended).toBe(true)
  })

  test('biome.json ignores appropriate directories', async () => {
    const biome = await Bun.file('biome.json').json()
    expect(biome.files.ignore).toContain('node_modules')
    expect(biome.files.ignore).toContain('dist')
  })

  test('tsconfig.json has ESNext target', async () => {
    const tsconfig = await Bun.file('tsconfig.json').json()
    expect(tsconfig.compilerOptions.target).toBe('ESNext')
    expect(tsconfig.compilerOptions.module).toBe('ESNext')
  })

  test('tsconfig.json has JSX support for React', async () => {
    const tsconfig = await Bun.file('tsconfig.json').json()
    expect(tsconfig.compilerOptions.jsx).toBe('react-jsx')
  })

  test('tsconfig.json includes src and tests directories', async () => {
    const tsconfig = await Bun.file('tsconfig.json').json()
    expect(tsconfig.include).toContain('src/**/*')
    expect(tsconfig.include).toContain('tests/**/*')
  })

  test('tsconfig.json excludes node_modules and dist', async () => {
    const tsconfig = await Bun.file('tsconfig.json').json()
    expect(tsconfig.exclude).toContain('node_modules')
    expect(tsconfig.exclude).toContain('dist')
  })
})

describe('Package Configuration', () => {
  test('package.json has required scripts', async () => {
    const pkg = await import('../../package.json')
    expect(pkg.scripts.dev).toBeDefined()
    expect(pkg.scripts.build).toBeDefined()
    expect(pkg.scripts.test).toBeDefined()
    expect(pkg.scripts.typecheck).toBeDefined()
    expect(pkg.scripts.lint).toBeDefined()
  })

  test('package.json has lint:fix script', async () => {
    const pkg = await import('../../package.json')
    expect(pkg.scripts['lint:fix']).toBeDefined()
    expect(pkg.scripts['lint:fix']).toContain('--write')
  })

  test('package.json has clean script', async () => {
    const pkg = await import('../../package.json')
    expect(pkg.scripts.clean).toBeDefined()
  })

  test('package.json has correct metadata', async () => {
    const pkg = await import('../../package.json')
    expect(pkg.name).toBe('saaskit')
    expect(pkg.description).toBe('Headless SaaS for AI Agents')
    expect(pkg.license).toBe('MIT')
  })

  test('package.json has required dependencies', async () => {
    const pkg = await import('../../package.json')
    expect(pkg.dependencies.react).toBeDefined()
    expect(pkg.dependencies.ink).toBeDefined()
  })

  test('package.json has required devDependencies', async () => {
    const pkg = await import('../../package.json')
    expect(pkg.devDependencies.typescript).toBeDefined()
    expect(pkg.devDependencies['@biomejs/biome']).toBeDefined()
    expect(pkg.devDependencies['@types/bun']).toBeDefined()
    expect(pkg.devDependencies['@types/react']).toBeDefined()
  })

  test('package.json specifies minimum bun version', async () => {
    const pkg = await import('../../package.json')
    expect(pkg.engines.bun).toBeDefined()
    expect(pkg.engines.bun).toMatch(/^>=\d+\.\d+/)
  })
})
