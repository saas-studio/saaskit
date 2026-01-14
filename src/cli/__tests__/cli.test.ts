import { describe, it, expect, beforeEach, afterEach, spyOn, mock } from 'bun:test'
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * CLI Entry Point Tests
 *
 * Tests for the main SaaSKit CLI binary:
 * - --help shows usage
 * - --version shows version
 * - Auto-detects schema.yaml in directory
 * - Parses subcommands correctly
 */

// We'll import from the CLI module once it exists
// For now, we define the expected interface

interface CLIResult {
  exitCode: number
  stdout: string
  stderr: string
}

interface CLIOptions {
  cwd?: string
  args?: string[]
}

// Placeholder function - will be replaced by actual implementation
async function runCLI(options: CLIOptions = {}): Promise<CLIResult> {
  const { cli } = await import('../index')
  return cli(options.args || [], { cwd: options.cwd })
}

describe('SaaSKit CLI Entry Point', () => {
  describe('--help flag', () => {
    it('shows usage information with --help', async () => {
      const result = await runCLI({ args: ['--help'] })

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('saaskit')
      expect(result.stdout).toContain('Usage:')
      expect(result.stdout).toContain('Commands:')
      expect(result.stdout).toContain('Options:')
    })

    it('shows usage information with -h shorthand', async () => {
      const result = await runCLI({ args: ['-h'] })

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Usage:')
    })

    it('shows subcommand-specific help with --help after subcommand', async () => {
      const result = await runCLI({ args: ['dev', '--help'] })

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('dev')
    })
  })

  describe('--version flag', () => {
    it('shows version with --version', async () => {
      const result = await runCLI({ args: ['--version'] })

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/)
    })

    it('shows version with -v shorthand', async () => {
      const result = await runCLI({ args: ['-v'] })

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/)
    })

    it('includes "saaskit" in version output', async () => {
      const result = await runCLI({ args: ['--version'] })

      expect(result.stdout.toLowerCase()).toContain('saaskit')
    })
  })

  describe('Schema auto-detection', () => {
    let tempDir: string

    beforeEach(() => {
      tempDir = join(tmpdir(), `saaskit-test-${Date.now()}`)
      mkdirSync(tempDir, { recursive: true })
    })

    afterEach(() => {
      try {
        // Clean up temp files
        const schemaPath = join(tempDir, 'schema.yaml')
        if (existsSync(schemaPath)) {
          unlinkSync(schemaPath)
        }
        rmdirSync(tempDir)
      } catch (e) {
        // Ignore cleanup errors
      }
    })

    it('auto-detects schema.yaml in current directory', async () => {
      const schemaContent = `
app:
  name: test-app
  version: "1.0.0"
resources:
  Task:
    id: auto
    title: text
`
      writeFileSync(join(tempDir, 'schema.yaml'), schemaContent)

      const result = await runCLI({ args: ['--help'], cwd: tempDir })

      expect(result.exitCode).toBe(0)
      // The CLI should indicate it found a schema or at least not error
    })

    it('auto-detects schema.yml in current directory', async () => {
      const schemaContent = `
app:
  name: test-app
  version: "1.0.0"
resources:
  Task:
    id: auto
    title: text
`
      writeFileSync(join(tempDir, 'schema.yml'), schemaContent)

      const result = await runCLI({ args: ['--help'], cwd: tempDir })

      expect(result.exitCode).toBe(0)
    })

    it('uses --schema flag to specify custom schema path', async () => {
      const schemaContent = `
app:
  name: custom-app
  version: "2.0.0"
resources:
  Todo:
    id: auto
    title: text
`
      const customSchemaPath = join(tempDir, 'custom-schema.yaml')
      writeFileSync(customSchemaPath, schemaContent)

      const result = await runCLI({
        args: ['--schema', customSchemaPath, '--help'],
        cwd: tempDir,
      })

      expect(result.exitCode).toBe(0)
    })

    it('shows error for non-existent schema file', async () => {
      const result = await runCLI({
        args: ['--schema', '/nonexistent/path/schema.yaml'],
      })

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('schema')
    })

    it('shows error for invalid schema file', async () => {
      const invalidSchema = 'not: valid: yaml: syntax:'
      writeFileSync(join(tempDir, 'schema.yaml'), invalidSchema)

      const result = await runCLI({
        args: ['--schema', join(tempDir, 'schema.yaml')],
      })

      expect(result.exitCode).toBe(1)
      expect(result.stderr.toLowerCase()).toContain('error')
    })
  })

  describe('Subcommand parsing', () => {
    describe('default command (dev/TUI mode)', () => {
      it('runs dev mode when no subcommand provided', async () => {
        const result = await runCLI({ args: [] })

        // Should attempt to start TUI mode (may fail without schema, but shouldn't crash)
        // For now, we just check it doesn't throw an unexpected error
        expect(typeof result.exitCode).toBe('number')
      })

      it('runs dev mode with explicit "dev" command', async () => {
        const result = await runCLI({ args: ['dev'] })

        expect(typeof result.exitCode).toBe('number')
      })
    })

    describe('serve command', () => {
      it('recognizes "serve" subcommand', async () => {
        const result = await runCLI({ args: ['serve', '--help'] })

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('serve')
      })

      it('accepts --port flag for serve', async () => {
        const result = await runCLI({ args: ['serve', '--port', '3000', '--help'] })

        expect(result.exitCode).toBe(0)
      })
    })

    describe('mcp command', () => {
      it('recognizes "mcp" subcommand', async () => {
        const result = await runCLI({ args: ['mcp', '--help'] })

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('mcp')
      })
    })

    describe('resource commands', () => {
      it('parses resource list command', async () => {
        const result = await runCLI({ args: ['task', 'list', '--help'] })

        // Should recognize as a resource command
        expect(typeof result.exitCode).toBe('number')
      })

      it('parses resource show command with id', async () => {
        const result = await runCLI({ args: ['task', 'show', 'abc123', '--help'] })

        expect(typeof result.exitCode).toBe('number')
      })

      it('parses resource create command', async () => {
        const result = await runCLI({ args: ['task', 'create', '--help'] })

        expect(typeof result.exitCode).toBe('number')
      })

      it('parses resource update command', async () => {
        const result = await runCLI({ args: ['task', 'update', 'abc123', '--help'] })

        expect(typeof result.exitCode).toBe('number')
      })

      it('parses resource delete command', async () => {
        const result = await runCLI({ args: ['task', 'delete', 'abc123', '--help'] })

        expect(typeof result.exitCode).toBe('number')
      })
    })
  })

  describe('Global flags', () => {
    it('accepts --schema flag', async () => {
      const result = await runCLI({ args: ['--schema', './schema.yaml', '--help'] })

      expect(result.exitCode).toBe(0)
    })

    it('accepts --verbose flag', async () => {
      const result = await runCLI({ args: ['--verbose', '--help'] })

      expect(result.exitCode).toBe(0)
    })

    it('accepts --quiet flag', async () => {
      const result = await runCLI({ args: ['--quiet', '--help'] })

      expect(result.exitCode).toBe(0)
    })

    it('accepts --no-color flag', async () => {
      const result = await runCLI({ args: ['--no-color', '--help'] })

      expect(result.exitCode).toBe(0)
    })
  })

  describe('Error handling', () => {
    it('shows error for unknown subcommand', async () => {
      const result = await runCLI({ args: ['unknown-command'] })

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('unknown')
    })

    it('shows error for unknown flag', async () => {
      const result = await runCLI({ args: ['--unknown-flag'] })

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('unknown')
    })

    it('exits gracefully on error', async () => {
      const result = await runCLI({ args: ['--invalid'] })

      expect(typeof result.exitCode).toBe('number')
      expect(result.exitCode).not.toBe(0)
    })
  })
})

describe('CLI Argument Parsing', () => {
  describe('parseCliArgs function', () => {
    it('parses empty args', async () => {
      const { parseCliArgs } = await import('../index')
      const result = parseCliArgs([])

      expect(result.command).toBe('dev')
      expect(result.args).toEqual([])
    })

    it('parses --help as global flag', async () => {
      const { parseCliArgs } = await import('../index')
      const result = parseCliArgs(['--help'])

      expect(result.help).toBe(true)
    })

    it('parses --version as global flag', async () => {
      const { parseCliArgs } = await import('../index')
      const result = parseCliArgs(['--version'])

      expect(result.version).toBe(true)
    })

    it('parses dev command', async () => {
      const { parseCliArgs } = await import('../index')
      const result = parseCliArgs(['dev'])

      expect(result.command).toBe('dev')
    })

    it('parses serve command with options', async () => {
      const { parseCliArgs } = await import('../index')
      const result = parseCliArgs(['serve', '--port', '8080'])

      expect(result.command).toBe('serve')
      expect(result.flags.port).toBe('8080')
    })

    it('parses mcp command', async () => {
      const { parseCliArgs } = await import('../index')
      const result = parseCliArgs(['mcp'])

      expect(result.command).toBe('mcp')
    })

    it('parses resource action command', async () => {
      const { parseCliArgs } = await import('../index')
      const result = parseCliArgs(['task', 'list'])

      expect(result.command).toBe('resource')
      expect(result.resource).toBe('task')
      expect(result.action).toBe('list')
    })

    it('parses resource action with id', async () => {
      const { parseCliArgs } = await import('../index')
      const result = parseCliArgs(['user', 'show', 'user-123'])

      expect(result.command).toBe('resource')
      expect(result.resource).toBe('user')
      expect(result.action).toBe('show')
      expect(result.args).toContain('user-123')
    })

    it('parses --schema global flag', async () => {
      const { parseCliArgs } = await import('../index')
      const result = parseCliArgs(['--schema', './custom.yaml', 'dev'])

      expect(result.schemaPath).toBe('./custom.yaml')
      expect(result.command).toBe('dev')
    })
  })
})
