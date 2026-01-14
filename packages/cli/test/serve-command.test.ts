/**
 * Serve Command Tests - RED Phase
 *
 * Tests for the `saaskit serve` CLI command (production mode).
 * These tests define the expected behavior and MUST FAIL until implementation is complete.
 *
 * The serve command should:
 * - Run in production mode (no hot reload)
 * - Require built files to exist
 * - Support port and workers options
 * - NOT have watch option (production only)
 * - Handle graceful shutdown
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ServeCommand } from '../src/commands/serve'
import type { ServeCommandOptions } from '../src/commands/serve'

// ============================================================================
// Configuration Tests
// ============================================================================

describe('ServeCommand', () => {
  describe('configuration', () => {
    it('has correct command name', () => {
      expect(ServeCommand.name).toBe('serve')
    })

    it('has description mentioning production', () => {
      expect(ServeCommand.description).toContain('production')
    })

    it('supports port option', () => {
      expect(ServeCommand.options).toContainEqual(
        expect.objectContaining({ name: 'port', type: 'number' })
      )
    })

    it('supports workers option', () => {
      expect(ServeCommand.options).toContainEqual(
        expect.objectContaining({ name: 'workers', type: 'number' })
      )
    })

    it('does NOT have watch option', () => {
      const watchOption = ServeCommand.options.find(o => o.name === 'watch')
      expect(watchOption).toBeUndefined()
    })
  })

  // ============================================================================
  // Execution Tests
  // ============================================================================

  describe('execution', () => {
    it('uses default port 8787', () => {
      const cmd = new ServeCommand()
      expect(cmd.defaultOptions.port).toBe(8787)
    })

    it('allows custom port', () => {
      const cmd = new ServeCommand()
      const options = cmd.parseOptions(['--port', '3000'])
      expect(options.port).toBe(3000)
    })

    it('defaults to 1 worker', () => {
      const cmd = new ServeCommand()
      expect(cmd.defaultOptions.workers).toBe(1)
    })

    it('allows custom worker count', () => {
      const cmd = new ServeCommand()
      const options = cmd.parseOptions(['--workers', '4'])
      expect(options.workers).toBe(4)
    })

    it('requires built files to exist', async () => {
      const checkBuilt = vi.fn().mockResolvedValue(false)
      const cmd = new ServeCommand({ checkBuilt })

      await expect(cmd.prepare({ cwd: '/test' })).rejects.toThrow('No built files found')
    })

    it('does not generate files automatically', async () => {
      const generateWorker = vi.fn()
      const checkBuilt = vi.fn().mockResolvedValue(true)
      const cmd = new ServeCommand({ generateWorker, checkBuilt })

      await cmd.prepare({ cwd: '/test' })

      expect(generateWorker).not.toHaveBeenCalled()
    })
  })

  // ============================================================================
  // Wrangler Integration Tests
  // ============================================================================

  describe('wrangler integration', () => {
    it('spawns wrangler without dev flag', async () => {
      const spawn = vi.fn().mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn()
      })
      const cmd = new ServeCommand({ spawn })

      await cmd.start({ port: 8787 })

      expect(spawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.arrayContaining(['dev']),
        expect.any(Object)
      )
    })

    it('passes port to wrangler', async () => {
      const spawn = vi.fn().mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn()
      })
      const cmd = new ServeCommand({ spawn })

      await cmd.start({ port: 3000 })

      expect(spawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['--port', '3000']),
        expect.any(Object)
      )
    })
  })

  // ============================================================================
  // Graceful Shutdown Tests
  // ============================================================================

  describe('graceful shutdown', () => {
    it('handles SIGTERM', async () => {
      const onShutdown = vi.fn()
      const cmd = new ServeCommand({ onShutdown })

      cmd.registerShutdownHandler()

      expect(cmd.shutdownHandlers).toContain(onShutdown)
    })
  })

  // ============================================================================
  // Option Parsing Tests
  // ============================================================================

  describe('option parsing', () => {
    it('parses --port flag', () => {
      const cmd = new ServeCommand()
      const options = cmd.parseOptions(['--port', '3000'])
      expect(options.port).toBe(3000)
    })

    it('parses -p alias for port', () => {
      const cmd = new ServeCommand()
      const options = cmd.parseOptions(['-p', '4000'])
      expect(options.port).toBe(4000)
    })

    it('parses --workers flag', () => {
      const cmd = new ServeCommand()
      const options = cmd.parseOptions(['--workers', '8'])
      expect(options.workers).toBe(8)
    })

    it('parses -w alias for workers', () => {
      const cmd = new ServeCommand()
      const options = cmd.parseOptions(['-w', '4'])
      expect(options.workers).toBe(4)
    })

    it('uses defaults for unprovided options', () => {
      const cmd = new ServeCommand()
      const options = cmd.parseOptions([])
      expect(options.port).toBe(8787)
      expect(options.workers).toBe(1)
    })
  })

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('error handling', () => {
    it('throws if built files not found', async () => {
      const checkBuilt = vi.fn().mockResolvedValue(false)
      const cmd = new ServeCommand({ checkBuilt })

      await expect(cmd.prepare({ cwd: '/nonexistent' })).rejects.toThrow('No built files found')
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
      const cmd = new ServeCommand({ spawn })

      await expect(cmd.start({ port: 8787 })).rejects.toThrow()
    })
  })
})
