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
})
