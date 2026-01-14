/**
 * Dev Command Tests - RED Phase
 *
 * Tests for the `saaskit dev` CLI command.
 * These tests define the expected behavior and MUST FAIL until implementation is complete.
 *
 * The dev command should:
 * - Load schema from current directory
 * - Generate worker entry if not present
 * - Generate wrangler config if not present
 * - Start wrangler dev server
 * - Support port and watch options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DevCommand } from '../src/commands/dev'
import type { DevCommandOptions } from '../src/commands/dev'

// ============================================================================
// Configuration Tests
// ============================================================================

describe('DevCommand', () => {
  describe('configuration', () => {
    it('has correct command name', () => {
      expect(DevCommand.name).toBe('dev')
    })

    it('has description', () => {
      expect(DevCommand.description).toContain('development')
    })

    it('supports port option', () => {
      expect(DevCommand.options).toContainEqual(
        expect.objectContaining({ name: 'port', type: 'number' })
      )
    })

    it('supports watch option', () => {
      expect(DevCommand.options).toContainEqual(
        expect.objectContaining({ name: 'watch', type: 'boolean' })
      )
    })
  })

  // ============================================================================
  // Execution Tests
  // ============================================================================

  describe('execution', () => {
    it('loads schema from current directory', async () => {
      const loadSchema = vi.fn().mockResolvedValue({ name: 'Test', resources: {} })
      const cmd = new DevCommand({ loadSchema })

      await cmd.prepare({ cwd: '/test' })

      expect(loadSchema).toHaveBeenCalledWith('/test')
    })

    it('generates worker entry if not present', async () => {
      const generateWorker = vi.fn()
      const cmd = new DevCommand({ generateWorker })

      await cmd.prepare({ cwd: '/test', generateIfMissing: true })

      expect(generateWorker).toHaveBeenCalled()
    })

    it('generates wrangler config if not present', async () => {
      const generateConfig = vi.fn()
      const cmd = new DevCommand({ generateConfig })

      await cmd.prepare({ cwd: '/test', generateIfMissing: true })

      expect(generateConfig).toHaveBeenCalled()
    })

    it('uses default port 8787', () => {
      const cmd = new DevCommand()
      expect(cmd.defaultOptions.port).toBe(8787)
    })

    it('allows custom port', () => {
      const cmd = new DevCommand()
      const options = cmd.parseOptions(['--port', '9000'])
      expect(options.port).toBe(9000)
    })

    it('enables watch by default', () => {
      const cmd = new DevCommand()
      expect(cmd.defaultOptions.watch).toBe(true)
    })
  })

  // ============================================================================
  // Wrangler Integration Tests
  // ============================================================================

  describe('wrangler integration', () => {
    it('spawns wrangler dev process', async () => {
      const spawn = vi.fn().mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn()
      })
      const cmd = new DevCommand({ spawn })

      await cmd.start({ port: 8787 })

      expect(spawn).toHaveBeenCalledWith(
        expect.stringContaining('wrangler'),
        expect.arrayContaining(['dev']),
        expect.any(Object)
      )
    })

    it('passes port to wrangler', async () => {
      const spawn = vi.fn().mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn()
      })
      const cmd = new DevCommand({ spawn })

      await cmd.start({ port: 9000 })

      expect(spawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['--port', '9000']),
        expect.any(Object)
      )
    })

    it('passes watch flag when enabled', async () => {
      const spawn = vi.fn().mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn()
      })
      const cmd = new DevCommand({ spawn })

      await cmd.start({ port: 8787, watch: true })

      // wrangler dev watches by default, so --watch or similar should be passed
      expect(spawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.any(Object)
      )
    })
  })

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('error handling', () => {
    it('throws if schema not found', async () => {
      const loadSchema = vi.fn().mockRejectedValue(new Error('Schema not found'))
      const cmd = new DevCommand({ loadSchema })

      await expect(cmd.prepare({ cwd: '/nonexistent' })).rejects.toThrow('Schema not found')
    })

    it('throws if wrangler fails to start', async () => {
      const spawn = vi.fn().mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('wrangler not found'))
          }
        })
      })
      const cmd = new DevCommand({ spawn })

      await expect(cmd.start({ port: 8787 })).rejects.toThrow()
    })
  })

  // ============================================================================
  // Option Parsing Tests
  // ============================================================================

  describe('option parsing', () => {
    it('parses --port flag', () => {
      const cmd = new DevCommand()
      const options = cmd.parseOptions(['--port', '3000'])
      expect(options.port).toBe(3000)
    })

    it('parses -p alias for port', () => {
      const cmd = new DevCommand()
      const options = cmd.parseOptions(['-p', '4000'])
      expect(options.port).toBe(4000)
    })

    it('parses --no-watch flag', () => {
      const cmd = new DevCommand()
      const options = cmd.parseOptions(['--no-watch'])
      expect(options.watch).toBe(false)
    })

    it('uses defaults for unprovided options', () => {
      const cmd = new DevCommand()
      const options = cmd.parseOptions([])
      expect(options.port).toBe(8787)
      expect(options.watch).toBe(true)
    })
  })
})
