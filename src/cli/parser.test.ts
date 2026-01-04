import { describe, it, expect, beforeEach } from 'bun:test'
import { parseCommand, type ParsedCommand, type ParseError } from './parser'

describe('CLI Parser', () => {
  describe('Basic Command Parsing', () => {
    it('parses simple resource list command', () => {
      const result = parseCommand(['users', 'list'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.resource).toBe('users')
        expect(result.command.action).toBe('list')
      }
    })

    it('parses resource show command with id', () => {
      const result = parseCommand(['users', 'show', 'abc123'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.resource).toBe('users')
        expect(result.command.action).toBe('show')
        expect(result.command.args).toEqual(['abc123'])
      }
    })

    it('parses resource create command', () => {
      const result = parseCommand(['tasks', 'create'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.resource).toBe('tasks')
        expect(result.command.action).toBe('create')
      }
    })

    it('parses resource update command with id', () => {
      const result = parseCommand(['projects', 'update', 'proj-1'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.resource).toBe('projects')
        expect(result.command.action).toBe('update')
        expect(result.command.args).toEqual(['proj-1'])
      }
    })

    it('parses resource delete command with id', () => {
      const result = parseCommand(['users', 'delete', 'user-xyz'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.resource).toBe('users')
        expect(result.command.action).toBe('delete')
        expect(result.command.args).toEqual(['user-xyz'])
      }
    })
  })

  describe('Action Aliases', () => {
    it('aliases "get" to "show"', () => {
      const result = parseCommand(['users', 'get', 'abc123'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.action).toBe('show')
      }
    })

    it('aliases "new" to "create"', () => {
      const result = parseCommand(['tasks', 'new'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.action).toBe('create')
      }
    })

    it('aliases "edit" to "update"', () => {
      const result = parseCommand(['users', 'edit', 'abc123'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.action).toBe('update')
      }
    })

    it('aliases "rm" to "delete"', () => {
      const result = parseCommand(['tasks', 'rm', 'task-1'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.action).toBe('delete')
      }
    })

    it('aliases "ls" to "list"', () => {
      const result = parseCommand(['projects', 'ls'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.action).toBe('list')
      }
    })
  })

  describe('Flag Parsing', () => {
    it('parses long flags with values', () => {
      const result = parseCommand(['users', 'create', '--name', 'John Doe'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.name).toBe('John Doe')
      }
    })

    it('parses long flags with equals syntax', () => {
      const result = parseCommand(['users', 'create', '--email=john@example.com'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.email).toBe('john@example.com')
      }
    })

    it('parses short flags with values', () => {
      const result = parseCommand(['users', 'list', '-n', '10'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.n).toBe('10')
      }
    })

    it('parses boolean flags (no value)', () => {
      const result = parseCommand(['users', 'list', '--verbose'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.verbose).toBe(true)
      }
    })

    it('parses negated boolean flags', () => {
      const result = parseCommand(['users', 'list', '--no-header'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.header).toBe(false)
      }
    })

    it('parses multiple flags together', () => {
      const result = parseCommand([
        'users', 'create',
        '--name', 'Jane',
        '--email', 'jane@test.com',
        '--admin',
        '--role=developer'
      ])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.name).toBe('Jane')
        expect(result.command.flags.email).toBe('jane@test.com')
        expect(result.command.flags.admin).toBe(true)
        expect(result.command.flags.role).toBe('developer')
      }
    })

    it('parses combined short flags', () => {
      const result = parseCommand(['users', 'list', '-vq'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.v).toBe(true)
        expect(result.command.flags.q).toBe(true)
      }
    })

    it('parses repeated flags as arrays', () => {
      const result = parseCommand(['users', 'list', '--tag', 'active', '--tag', 'verified'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.tag).toEqual(['active', 'verified'])
      }
    })
  })

  describe('Output Format Flags', () => {
    it('parses --json flag', () => {
      const result = parseCommand(['users', 'list', '--json'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.output).toBe('json')
      }
    })

    it('parses --format flag', () => {
      const result = parseCommand(['users', 'list', '--format', 'table'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.output).toBe('table')
      }
    })

    it('parses -o shorthand for format', () => {
      const result = parseCommand(['users', 'list', '-o', 'yaml'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.output).toBe('yaml')
      }
    })

    it('supports all output formats: json, yaml, table, csv, text', () => {
      const formats = ['json', 'yaml', 'table', 'csv', 'text']
      for (const format of formats) {
        const result = parseCommand(['users', 'list', '--format', format])
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.command.output).toBe(format)
        }
      }
    })
  })

  describe('Filtering and Sorting', () => {
    it('parses --filter flag', () => {
      const result = parseCommand(['users', 'list', '--filter', 'status=active'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.filters).toEqual({ status: 'active' })
      }
    })

    it('parses multiple --filter flags', () => {
      const result = parseCommand([
        'users', 'list',
        '--filter', 'status=active',
        '--filter', 'role=admin'
      ])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.filters).toEqual({ status: 'active', role: 'admin' })
      }
    })

    it('parses --where as filter alias', () => {
      const result = parseCommand(['users', 'list', '--where', 'active=true'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.filters).toEqual({ active: 'true' })
      }
    })

    it('parses --sort flag', () => {
      const result = parseCommand(['users', 'list', '--sort', 'name'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.sort).toEqual({ field: 'name', direction: 'asc' })
      }
    })

    it('parses --sort with direction prefix', () => {
      const result = parseCommand(['users', 'list', '--sort', '-createdAt'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.sort).toEqual({ field: 'createdAt', direction: 'desc' })
      }
    })

    it('parses --sort with :asc/:desc suffix', () => {
      const result = parseCommand(['users', 'list', '--sort', 'updatedAt:desc'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.sort).toEqual({ field: 'updatedAt', direction: 'desc' })
      }
    })

    it('parses --limit flag', () => {
      const result = parseCommand(['users', 'list', '--limit', '25'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.pagination?.limit).toBe(25)
      }
    })

    it('parses --offset flag', () => {
      const result = parseCommand(['users', 'list', '--offset', '50'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.pagination?.offset).toBe(50)
      }
    })

    it('parses --page flag', () => {
      const result = parseCommand(['users', 'list', '--page', '3'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.pagination?.page).toBe(3)
      }
    })
  })

  describe('Positional Arguments', () => {
    it('collects positional args after action', () => {
      const result = parseCommand(['users', 'show', 'user-1', 'user-2'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.args).toEqual(['user-1', 'user-2'])
      }
    })

    it('handles -- separator for literal args', () => {
      const result = parseCommand(['tasks', 'create', '--', '--not-a-flag'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.args).toEqual(['--not-a-flag'])
      }
    })

    it('mixes positional args and flags', () => {
      const result = parseCommand(['users', 'update', 'abc123', '--name', 'New Name'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.args).toEqual(['abc123'])
        expect(result.command.flags.name).toBe('New Name')
      }
    })
  })

  describe('Resource Name Handling', () => {
    it('normalizes plural resource names', () => {
      const result = parseCommand(['user', 'list'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.resource).toBe('users')
      }
    })

    it('handles kebab-case resource names', () => {
      const result = parseCommand(['api-keys', 'list'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.resource).toBe('api-keys')
      }
    })

    it('handles snake_case resource names', () => {
      const result = parseCommand(['user_profiles', 'list'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.resource).toBe('user_profiles')
      }
    })

    it('handles camelCase resource names', () => {
      const result = parseCommand(['userProfiles', 'list'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.resource).toBe('userProfiles')
      }
    })
  })

  describe('Global Flags', () => {
    it('parses --help flag', () => {
      const result = parseCommand(['--help'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.help).toBe(true)
      }
    })

    it('parses -h shorthand for help', () => {
      const result = parseCommand(['-h'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.help).toBe(true)
      }
    })

    it('parses --version flag', () => {
      const result = parseCommand(['--version'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.version).toBe(true)
      }
    })

    it('parses -V shorthand for version', () => {
      const result = parseCommand(['-V'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.version).toBe(true)
      }
    })

    it('parses --quiet flag', () => {
      const result = parseCommand(['users', 'delete', 'abc', '--quiet'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.quiet).toBe(true)
      }
    })

    it('parses --dry-run flag', () => {
      const result = parseCommand(['users', 'delete', 'abc', '--dry-run'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.dryRun).toBe(true)
      }
    })

    it('parses --config flag', () => {
      const result = parseCommand(['--config', './my-config.json', 'users', 'list'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.configPath).toBe('./my-config.json')
      }
    })
  })

  describe('Error Handling', () => {
    it('returns error for empty input', () => {
      const result = parseCommand([])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('EMPTY_COMMAND')
      }
    })

    it('returns error for missing action', () => {
      const result = parseCommand(['users'])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('MISSING_ACTION')
      }
    })

    it('returns error for unknown action', () => {
      const result = parseCommand(['users', 'frobnicate'])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('UNKNOWN_ACTION')
        expect(result.error.message).toContain('frobnicate')
      }
    })

    it('returns error for missing required argument', () => {
      const result = parseCommand(['users', 'show'])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('MISSING_ARGUMENT')
        expect(result.error.message).toContain('id')
      }
    })

    it('returns error for unknown flag', () => {
      const result = parseCommand(['users', 'list', '--unknown-flag'])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('UNKNOWN_FLAG')
        expect(result.error.message).toContain('unknown-flag')
      }
    })

    it('returns error for flag missing value', () => {
      const result = parseCommand(['users', 'create', '--name'])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('MISSING_FLAG_VALUE')
        expect(result.error.message).toContain('name')
      }
    })

    it('returns error for invalid filter format', () => {
      const result = parseCommand(['users', 'list', '--filter', 'invalid'])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_FILTER')
      }
    })

    it('returns error for invalid number', () => {
      const result = parseCommand(['users', 'list', '--limit', 'abc'])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_NUMBER')
      }
    })

    it('returns error for invalid output format', () => {
      const result = parseCommand(['users', 'list', '--format', 'invalid'])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_FORMAT')
      }
    })

    it('provides suggestions for typos', () => {
      const result = parseCommand(['users', 'lisst'])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.suggestions).toContain('list')
      }
    })
  })

  describe('Edge Cases', () => {
    it('handles quoted strings with spaces', () => {
      const result = parseCommand(['tasks', 'create', '--title', 'My Task Title'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.title).toBe('My Task Title')
      }
    })

    it('handles empty string values', () => {
      const result = parseCommand(['users', 'update', 'abc', '--bio', ''])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.bio).toBe('')
      }
    })

    it('handles numeric string values', () => {
      const result = parseCommand(['users', 'update', 'abc', '--age', '25'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.age).toBe('25')
      }
    })

    it('handles special characters in values', () => {
      const result = parseCommand(['users', 'create', '--email', 'test+tag@example.com'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.email).toBe('test+tag@example.com')
      }
    })

    it('handles JSON-like string values', () => {
      const result = parseCommand(['configs', 'create', '--data', '{"key":"value"}'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.flags.data).toBe('{"key":"value"}')
      }
    })

    it('handles flags before resource name', () => {
      const result = parseCommand(['--verbose', 'users', 'list'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.resource).toBe('users')
        expect(result.command.action).toBe('list')
        expect(result.command.flags.verbose).toBe(true)
      }
    })

    it('handles very long argument lists', () => {
      const args = ['users', 'list']
      for (let i = 0; i < 100; i++) {
        args.push('--filter', `field${i}=value${i}`)
      }
      const result = parseCommand(args)
      expect(result.success).toBe(true)
    })
  })

  describe('Interactive Mode', () => {
    it('detects interactive mode for create without args', () => {
      const result = parseCommand(['users', 'create'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.interactive).toBe(true)
      }
    })

    it('skips interactive mode when flags provided', () => {
      const result = parseCommand(['users', 'create', '--name', 'Test'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.interactive).toBe(false)
      }
    })

    it('forces interactive mode with -i flag', () => {
      const result = parseCommand(['users', 'update', 'abc', '-i'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.interactive).toBe(true)
      }
    })

    it('forces non-interactive mode with --no-interactive', () => {
      const result = parseCommand(['users', 'create', '--no-interactive'])
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.command.interactive).toBe(false)
      }
    })
  })

  describe('Type Definitions', () => {
    it('exports ParsedCommand type with correct shape', () => {
      const result = parseCommand(['users', 'list'])
      expect(result.success).toBe(true)
      if (result.success) {
        const cmd: ParsedCommand = result.command
        expect(typeof cmd.resource).toBe('string')
        expect(typeof cmd.action).toBe('string')
        expect(Array.isArray(cmd.args)).toBe(true)
        expect(typeof cmd.flags).toBe('object')
      }
    })

    it('exports ParseError type with correct shape', () => {
      const result = parseCommand([])
      expect(result.success).toBe(false)
      if (!result.success) {
        const err: ParseError = result.error
        expect(typeof err.code).toBe('string')
        expect(typeof err.message).toBe('string')
      }
    })
  })
})

describe('CLI Parser - Subcommands', () => {
  it('parses nested resource paths', () => {
    const result = parseCommand(['projects', 'tasks', 'list'])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.command.resource).toBe('projects')
      expect(result.command.subresource).toBe('tasks')
      expect(result.command.action).toBe('list')
    }
  })

  it('parses nested resource with parent id', () => {
    const result = parseCommand(['projects', 'proj-1', 'tasks', 'list'])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.command.resource).toBe('projects')
      expect(result.command.resourceId).toBe('proj-1')
      expect(result.command.subresource).toBe('tasks')
      expect(result.command.action).toBe('list')
    }
  })

  it('parses deeply nested resources', () => {
    const result = parseCommand(['orgs', 'org-1', 'projects', 'proj-1', 'tasks', 'show', 'task-1'])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.command.path).toEqual([
        { resource: 'orgs', id: 'org-1' },
        { resource: 'projects', id: 'proj-1' },
        { resource: 'tasks' }
      ])
      expect(result.command.action).toBe('show')
      expect(result.command.args).toEqual(['task-1'])
    }
  })
})

describe('CLI Parser - Batch Operations', () => {
  it('parses delete with multiple ids', () => {
    const result = parseCommand(['users', 'delete', 'id1', 'id2', 'id3'])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.command.args).toEqual(['id1', 'id2', 'id3'])
      expect(result.command.batch).toBe(true)
    }
  })

  it('parses update with multiple ids', () => {
    const result = parseCommand(['users', 'update', 'id1', 'id2', '--status', 'active'])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.command.args).toEqual(['id1', 'id2'])
      expect(result.command.batch).toBe(true)
      expect(result.command.flags.status).toBe('active')
    }
  })
})
