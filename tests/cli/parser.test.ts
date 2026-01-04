import { describe, test, expect, beforeEach } from 'bun:test'
import {
  parseArgs,
  type ParsedCommand,
  type ParseError,
  type ResourceSchema,
  type OutputFormat,
} from '../../src/cli/parser'

/**
 * Comprehensive RED tests for CLI Parser functionality in SaaSkit.
 *
 * These tests are designed to FAIL initially (TDD RED phase).
 * The implementation in src/cli/parser.ts is a stub that throws "Not implemented".
 *
 * CLI Pattern Examples:
 *   $ todos list
 *   $ todos create --title "New task" --priority high
 *   $ todos update abc123 --done true
 *   $ todos delete abc123
 *   $ todos search "MVP"
 *   $ todos list --format json
 */

// ============================================================================
// 1. COMMAND PARSING TESTS
// ============================================================================

describe('CLI Parser - Command Parsing', () => {
  describe('Resource Name Parsing', () => {
    test('parses resource name from args (todos task list -> resource: task)', () => {
      const result = parseArgs(['task', 'list'])
      expect(result.resource).toBe('task')
    })

    test('parses resource name with plural form', () => {
      const result = parseArgs(['tasks', 'list'])
      expect(result.resource).toBe('tasks')
    })

    test('parses resource name with kebab-case', () => {
      const result = parseArgs(['api-keys', 'list'])
      expect(result.resource).toBe('api-keys')
    })

    test('parses resource name with snake_case', () => {
      const result = parseArgs(['user_profiles', 'list'])
      expect(result.resource).toBe('user_profiles')
    })

    test('parses resource name with camelCase', () => {
      const result = parseArgs(['userProfiles', 'list'])
      expect(result.resource).toBe('userProfiles')
    })
  })

  describe('Operation Parsing', () => {
    test('parses list operation', () => {
      const result = parseArgs(['task', 'list'])
      expect(result.operation).toBe('list')
    })

    test('parses create operation', () => {
      const result = parseArgs(['task', 'create'])
      expect(result.operation).toBe('create')
    })

    test('parses update operation', () => {
      const result = parseArgs(['task', 'update', 'abc123'])
      expect(result.operation).toBe('update')
    })

    test('parses delete operation', () => {
      const result = parseArgs(['task', 'delete', 'abc123'])
      expect(result.operation).toBe('delete')
    })

    test('parses get operation', () => {
      const result = parseArgs(['task', 'get', 'abc123'])
      expect(result.operation).toBe('get')
    })

    test('parses search operation', () => {
      const result = parseArgs(['task', 'search', 'MVP'])
      expect(result.operation).toBe('search')
    })

    test('handles operation aliases (show -> get)', () => {
      const result = parseArgs(['task', 'show', 'abc123'])
      expect(result.operation).toBe('get')
    })

    test('handles operation aliases (new -> create)', () => {
      const result = parseArgs(['task', 'new'])
      expect(result.operation).toBe('create')
    })

    test('handles operation aliases (rm -> delete)', () => {
      const result = parseArgs(['task', 'rm', 'abc123'])
      expect(result.operation).toBe('delete')
    })

    test('handles operation aliases (ls -> list)', () => {
      const result = parseArgs(['task', 'ls'])
      expect(result.operation).toBe('list')
    })

    test('handles operation aliases (find -> search)', () => {
      const result = parseArgs(['task', 'find', 'query'])
      expect(result.operation).toBe('search')
    })
  })

  describe('App-Level Commands', () => {
    test('parses --version flag without resource', () => {
      const result = parseArgs(['--version'])
      expect(result.globalFlags.version).toBe(true)
      expect(result.resource).toBeUndefined()
    })

    test('parses --help flag without resource', () => {
      const result = parseArgs(['--help'])
      expect(result.globalFlags.help).toBe(true)
      expect(result.resource).toBeUndefined()
    })

    test('parses -v short flag for version', () => {
      const result = parseArgs(['-v'])
      expect(result.globalFlags.version).toBe(true)
    })

    test('parses -h short flag for help', () => {
      const result = parseArgs(['-h'])
      expect(result.globalFlags.help).toBe(true)
    })

    test('parses help for specific resource', () => {
      const result = parseArgs(['task', '--help'])
      expect(result.resource).toBe('task')
      expect(result.globalFlags.help).toBe(true)
    })

    test('parses help for specific operation', () => {
      const result = parseArgs(['task', 'create', '--help'])
      expect(result.resource).toBe('task')
      expect(result.operation).toBe('create')
      expect(result.globalFlags.help).toBe(true)
    })
  })
})

// ============================================================================
// 2. FLAG PARSING TESTS
// ============================================================================

describe('CLI Parser - Flag Parsing', () => {
  describe('String Flags', () => {
    test('parses string flag with space separator', () => {
      const result = parseArgs(['task', 'create', '--title', 'New task'])
      expect(result.flags.title).toBe('New task')
    })

    test('parses string flag with quoted value containing spaces', () => {
      const result = parseArgs(['task', 'create', '--title', 'My Important Task'])
      expect(result.flags.title).toBe('My Important Task')
    })

    test('parses multiple string flags', () => {
      const result = parseArgs([
        'task',
        'create',
        '--title',
        'New task',
        '--priority',
        'high',
      ])
      expect(result.flags.title).toBe('New task')
      expect(result.flags.priority).toBe('high')
    })

    test('parses string flag with special characters', () => {
      const result = parseArgs(['user', 'create', '--email', 'test+tag@example.com'])
      expect(result.flags.email).toBe('test+tag@example.com')
    })

    test('parses string flag with empty string value', () => {
      const result = parseArgs(['user', 'update', 'abc123', '--bio', ''])
      expect(result.flags.bio).toBe('')
    })
  })

  describe('Boolean Flags', () => {
    test('parses boolean flag without value (implies true)', () => {
      const result = parseArgs(['task', 'update', 'abc123', '--done'])
      expect(result.flags.done).toBe(true)
    })

    test('parses boolean flag with explicit true value', () => {
      const result = parseArgs(['task', 'update', 'abc123', '--done', 'true'])
      expect(result.flags.done).toBe(true)
    })

    test('parses boolean flag with explicit false value', () => {
      const result = parseArgs(['task', 'update', 'abc123', '--done', 'false'])
      expect(result.flags.done).toBe(false)
    })

    test('parses negated boolean flag (--no-prefix)', () => {
      const result = parseArgs(['task', 'list', '--no-header'])
      expect(result.flags.header).toBe(false)
    })

    test('parses boolean flag with 1/0 values', () => {
      const result1 = parseArgs(['task', 'update', 'abc123', '--active', '1'])
      expect(result1.flags.active).toBe(true)

      const result2 = parseArgs(['task', 'update', 'abc123', '--active', '0'])
      expect(result2.flags.active).toBe(false)
    })

    test('parses boolean flag with yes/no values', () => {
      const result1 = parseArgs(['task', 'update', 'abc123', '--confirm', 'yes'])
      expect(result1.flags.confirm).toBe(true)

      const result2 = parseArgs(['task', 'update', 'abc123', '--confirm', 'no'])
      expect(result2.flags.confirm).toBe(false)
    })
  })

  describe('Number Flags', () => {
    test('parses integer flag value', () => {
      const result = parseArgs(['task', 'create', '--priority', '1'])
      expect(result.flags.priority).toBe(1)
    })

    test('parses decimal flag value', () => {
      const result = parseArgs(['product', 'create', '--price', '99.99'])
      expect(result.flags.price).toBe(99.99)
    })

    test('parses negative number flag value', () => {
      const result = parseArgs(['account', 'update', 'abc', '--balance', '-50'])
      expect(result.flags.balance).toBe(-50)
    })

    test('parses zero as number flag value', () => {
      const result = parseArgs(['task', 'update', 'abc', '--count', '0'])
      expect(result.flags.count).toBe(0)
    })
  })

  describe('Short Flags', () => {
    test('parses short flag with value', () => {
      const result = parseArgs(['task', 'create', '-t', 'Title'])
      expect(result.flags.t).toBe('Title')
    })

    test('parses short boolean flag', () => {
      const result = parseArgs(['task', 'update', 'abc123', '-d'])
      expect(result.flags.d).toBe(true)
    })

    test('parses short number flag', () => {
      const result = parseArgs(['task', 'create', '-p', '1'])
      expect(result.flags.p).toBe(1)
    })

    test('parses combined short boolean flags', () => {
      const result = parseArgs(['task', 'list', '-vq'])
      expect(result.flags.v).toBe(true)
      expect(result.flags.q).toBe(true)
    })

    test('parses combined short flags with last having value', () => {
      const result = parseArgs(['task', 'list', '-vn', '10'])
      expect(result.flags.v).toBe(true)
      expect(result.flags.n).toBe('10')
    })
  })

  describe('Flag Aliases', () => {
    test('handles flag aliases (--title / -t) with schema', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['create'],
        flags: {
          title: { type: 'string', alias: 't' },
        },
      }
      const result = parseArgs(['task', 'create', '-t', 'My Title'], schema)
      expect(result.flags.title).toBe('My Title')
    })

    test('handles multiple aliases mapping to same flag', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['list'],
        flags: {
          format: { type: 'string', alias: 'f' },
        },
      }
      const result1 = parseArgs(['task', 'list', '--format', 'json'], schema)
      const result2 = parseArgs(['task', 'list', '-f', 'json'], schema)
      expect(result1.flags.format).toBe('json')
      expect(result2.flags.format).toBe('json')
    })
  })

  describe('Equals Syntax', () => {
    test('parses flag with equals syntax (--title="New task")', () => {
      const result = parseArgs(['task', 'create', '--title=New task'])
      expect(result.flags.title).toBe('New task')
    })

    test('parses flag with equals and no quotes', () => {
      const result = parseArgs(['task', 'create', '--priority=high'])
      expect(result.flags.priority).toBe('high')
    })

    test('parses flag with equals and empty value', () => {
      const result = parseArgs(['task', 'update', 'abc', '--description='])
      expect(result.flags.description).toBe('')
    })

    test('parses short flag with equals syntax', () => {
      const result = parseArgs(['task', 'create', '-t=Title'])
      expect(result.flags.t).toBe('Title')
    })

    test('parses equals in value after first equals', () => {
      const result = parseArgs(['config', 'set', '--env=NODE_ENV=production'])
      expect(result.flags.env).toBe('NODE_ENV=production')
    })
  })

  describe('Repeated Flags', () => {
    test('parses repeated flags as array', () => {
      const result = parseArgs(['task', 'create', '--tag', 'urgent', '--tag', 'bug'])
      expect(result.flags.tag).toEqual(['urgent', 'bug'])
    })

    test('parses repeated short flags as array', () => {
      const result = parseArgs(['task', 'create', '-l', 'frontend', '-l', 'backend'])
      expect(result.flags.l).toEqual(['frontend', 'backend'])
    })
  })
})

// ============================================================================
// 3. POSITIONAL ARGUMENTS TESTS
// ============================================================================

describe('CLI Parser - Positional Arguments', () => {
  describe('ID Parsing', () => {
    test('parses ID for get operation', () => {
      const result = parseArgs(['task', 'get', 'abc123'])
      expect(result.id).toBe('abc123')
    })

    test('parses ID for update operation', () => {
      const result = parseArgs(['task', 'update', 'abc123', '--done', 'true'])
      expect(result.id).toBe('abc123')
    })

    test('parses ID for delete operation', () => {
      const result = parseArgs(['task', 'delete', 'abc123'])
      expect(result.id).toBe('abc123')
    })

    test('parses UUID format ID', () => {
      const result = parseArgs(['task', 'get', '550e8400-e29b-41d4-a716-446655440000'])
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000')
    })

    test('parses numeric ID', () => {
      const result = parseArgs(['task', 'get', '12345'])
      expect(result.id).toBe('12345')
    })

    test('parses slug-style ID', () => {
      const result = parseArgs(['post', 'get', 'my-blog-post-title'])
      expect(result.id).toBe('my-blog-post-title')
    })
  })

  describe('Search Query Parsing', () => {
    test('parses search query as positional arg', () => {
      const result = parseArgs(['task', 'search', 'MVP'])
      expect(result.positional).toContain('MVP')
    })

    test('parses search query with spaces', () => {
      const result = parseArgs(['task', 'search', 'urgent bug fix'])
      expect(result.positional).toContain('urgent bug fix')
    })

    test('parses search query with special characters', () => {
      const result = parseArgs(['task', 'search', 'bug #123'])
      expect(result.positional).toContain('bug #123')
    })
  })

  describe('Multiple Positional Args', () => {
    test('parses multiple positional args', () => {
      const result = parseArgs(['task', 'delete', 'id1', 'id2', 'id3'])
      expect(result.positional).toEqual(['id1', 'id2', 'id3'])
    })

    test('handles positional args mixed with flags', () => {
      const result = parseArgs(['task', 'update', 'abc123', '--done', 'true', 'extra'])
      expect(result.id).toBe('abc123')
      expect(result.positional).toContain('extra')
    })

    test('handles positional args after --', () => {
      const result = parseArgs(['task', 'create', '--', '--not-a-flag', '-also-not'])
      expect(result.positional).toContain('--not-a-flag')
      expect(result.positional).toContain('-also-not')
    })

    test('collects all args after -- as positional', () => {
      const result = parseArgs([
        'task',
        'exec',
        '--',
        'npm',
        'run',
        'build',
        '--production',
      ])
      expect(result.positional).toEqual(['npm', 'run', 'build', '--production'])
    })
  })
})

// ============================================================================
// 4. OUTPUT FORMAT TESTS
// ============================================================================

describe('CLI Parser - Output Format', () => {
  describe('--format Flag', () => {
    test('parses --format unicode', () => {
      const result = parseArgs(['task', 'list', '--format', 'unicode'])
      expect(result.format).toBe('unicode')
    })

    test('parses --format ascii', () => {
      const result = parseArgs(['task', 'list', '--format', 'ascii'])
      expect(result.format).toBe('ascii')
    })

    test('parses --format plain', () => {
      const result = parseArgs(['task', 'list', '--format', 'plain'])
      expect(result.format).toBe('plain')
    })

    test('parses --format json', () => {
      const result = parseArgs(['task', 'list', '--format', 'json'])
      expect(result.format).toBe('json')
    })

    test('parses --format markdown', () => {
      const result = parseArgs(['task', 'list', '--format', 'markdown'])
      expect(result.format).toBe('markdown')
    })

    test('parses --format csv', () => {
      const result = parseArgs(['task', 'list', '--format', 'csv'])
      expect(result.format).toBe('csv')
    })

    test('parses --format yaml', () => {
      const result = parseArgs(['task', 'list', '--format', 'yaml'])
      expect(result.format).toBe('yaml')
    })
  })

  describe('--output Alias', () => {
    test('parses --output as alias for --format', () => {
      const result = parseArgs(['task', 'list', '--output', 'json'])
      expect(result.format).toBe('json')
    })

    test('parses -o as short flag for format', () => {
      const result = parseArgs(['task', 'list', '-o', 'yaml'])
      expect(result.format).toBe('yaml')
    })
  })

  describe('Format Shortcuts', () => {
    test('parses --json shortcut flag', () => {
      const result = parseArgs(['task', 'list', '--json'])
      expect(result.format).toBe('json')
    })

    test('parses --yaml shortcut flag', () => {
      const result = parseArgs(['task', 'list', '--yaml'])
      expect(result.format).toBe('yaml')
    })

    test('parses --csv shortcut flag', () => {
      const result = parseArgs(['task', 'list', '--csv'])
      expect(result.format).toBe('csv')
    })

    test('parses --markdown shortcut flag', () => {
      const result = parseArgs(['task', 'list', '--markdown'])
      expect(result.format).toBe('markdown')
    })

    test('parses --md as alias for --markdown', () => {
      const result = parseArgs(['task', 'list', '--md'])
      expect(result.format).toBe('markdown')
    })
  })
})

// ============================================================================
// 5. GLOBAL OPTIONS TESTS
// ============================================================================

describe('CLI Parser - Global Options', () => {
  describe('Help Flag', () => {
    test('parses --help flag', () => {
      const result = parseArgs(['--help'])
      expect(result.globalFlags.help).toBe(true)
    })

    test('parses -h short flag for help', () => {
      const result = parseArgs(['-h'])
      expect(result.globalFlags.help).toBe(true)
    })

    test('parses help flag with resource', () => {
      const result = parseArgs(['task', '--help'])
      expect(result.globalFlags.help).toBe(true)
      expect(result.resource).toBe('task')
    })

    test('parses help flag with resource and operation', () => {
      const result = parseArgs(['task', 'create', '--help'])
      expect(result.globalFlags.help).toBe(true)
      expect(result.resource).toBe('task')
      expect(result.operation).toBe('create')
    })
  })

  describe('Version Flag', () => {
    test('parses --version flag', () => {
      const result = parseArgs(['--version'])
      expect(result.globalFlags.version).toBe(true)
    })

    test('parses -v short flag for version', () => {
      const result = parseArgs(['-v'])
      expect(result.globalFlags.version).toBe(true)
    })

    test('parses -V (uppercase) as version', () => {
      const result = parseArgs(['-V'])
      expect(result.globalFlags.version).toBe(true)
    })
  })

  describe('Verbose Flag', () => {
    test('parses --verbose flag', () => {
      const result = parseArgs(['task', 'list', '--verbose'])
      expect(result.globalFlags.verbose).toBe(true)
    })

    test('parses -v as verbose when with other args', () => {
      // When used with resource/operation, -v means verbose not version
      const result = parseArgs(['task', 'list', '-v'])
      expect(result.globalFlags.verbose).toBe(true)
    })
  })

  describe('Quiet Flag', () => {
    test('parses --quiet flag', () => {
      const result = parseArgs(['task', 'delete', 'abc123', '--quiet'])
      expect(result.globalFlags.quiet).toBe(true)
    })

    test('parses -q short flag for quiet', () => {
      const result = parseArgs(['task', 'delete', 'abc123', '-q'])
      expect(result.globalFlags.quiet).toBe(true)
    })

    test('parses --silent as alias for quiet', () => {
      const result = parseArgs(['task', 'delete', 'abc123', '--silent'])
      expect(result.globalFlags.quiet).toBe(true)
    })
  })

  describe('Color Flag', () => {
    test('parses --color flag (enables color)', () => {
      const result = parseArgs(['task', 'list', '--color'])
      expect(result.globalFlags.color).toBe(true)
    })

    test('parses --no-color flag (disables color)', () => {
      const result = parseArgs(['task', 'list', '--no-color'])
      expect(result.globalFlags.color).toBe(false)
    })

    test('parses --color=true', () => {
      const result = parseArgs(['task', 'list', '--color=true'])
      expect(result.globalFlags.color).toBe(true)
    })

    test('parses --color=false', () => {
      const result = parseArgs(['task', 'list', '--color=false'])
      expect(result.globalFlags.color).toBe(false)
    })
  })

  describe('Global Flags Position', () => {
    test('parses global flags before resource', () => {
      const result = parseArgs(['--verbose', 'task', 'list'])
      expect(result.globalFlags.verbose).toBe(true)
      expect(result.resource).toBe('task')
      expect(result.operation).toBe('list')
    })

    test('parses global flags after resource', () => {
      const result = parseArgs(['task', 'list', '--verbose'])
      expect(result.globalFlags.verbose).toBe(true)
      expect(result.resource).toBe('task')
    })

    test('parses global flags anywhere in args', () => {
      const result = parseArgs(['--quiet', 'task', '--verbose', 'list', '--no-color'])
      expect(result.globalFlags.quiet).toBe(true)
      expect(result.globalFlags.verbose).toBe(true)
      expect(result.globalFlags.color).toBe(false)
    })
  })
})

// ============================================================================
// 6. ERROR HANDLING TESTS
// ============================================================================

describe('CLI Parser - Error Handling', () => {
  describe('Unknown Command Error', () => {
    test('throws error for unknown operation', () => {
      expect(() => parseArgs(['task', 'frobnicate'])).toThrow()
    })

    test('error has UNKNOWN_COMMAND code', () => {
      try {
        parseArgs(['task', 'frobnicate'])
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect((error as ParseError).code).toBe('UNKNOWN_COMMAND')
      }
    })

    test('error message includes the unknown command', () => {
      try {
        parseArgs(['task', 'frobnicate'])
        expect(true).toBe(false)
      } catch (error) {
        expect((error as ParseError).message).toContain('frobnicate')
      }
    })
  })

  describe('Missing Required Flag Error', () => {
    test('throws error when required flag is missing', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['create'],
        flags: {
          title: { type: 'string', required: true },
        },
      }
      expect(() => parseArgs(['task', 'create'], schema)).toThrow()
    })

    test('error has MISSING_REQUIRED_FLAG code', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['create'],
        flags: {
          title: { type: 'string', required: true },
        },
      }
      try {
        parseArgs(['task', 'create'], schema)
        expect(true).toBe(false)
      } catch (error) {
        expect((error as ParseError).code).toBe('MISSING_REQUIRED_FLAG')
      }
    })

    test('error includes flag name', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['create'],
        flags: {
          title: { type: 'string', required: true },
        },
      }
      try {
        parseArgs(['task', 'create'], schema)
        expect(true).toBe(false)
      } catch (error) {
        expect((error as ParseError).flag).toBe('title')
      }
    })
  })

  describe('Invalid Flag Value Error', () => {
    test('throws error for invalid number value', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['create'],
        flags: {
          priority: { type: 'number' },
        },
      }
      expect(() =>
        parseArgs(['task', 'create', '--priority', 'not-a-number'], schema)
      ).toThrow()
    })

    test('error has INVALID_FLAG_VALUE code', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['create'],
        flags: {
          priority: { type: 'number' },
        },
      }
      try {
        parseArgs(['task', 'create', '--priority', 'abc'], schema)
        expect(true).toBe(false)
      } catch (error) {
        expect((error as ParseError).code).toBe('INVALID_FLAG_VALUE')
      }
    })

    test('error includes flag name and invalid value', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['create'],
        flags: {
          priority: { type: 'number' },
        },
      }
      try {
        parseArgs(['task', 'create', '--priority', 'xyz'], schema)
        expect(true).toBe(false)
      } catch (error) {
        expect((error as ParseError).flag).toBe('priority')
        expect((error as ParseError).value).toBe('xyz')
      }
    })

    test('throws error for invalid JSON value', () => {
      const schema: ResourceSchema = {
        name: 'config',
        operations: ['create'],
        flags: {
          data: { type: 'json' },
        },
      }
      expect(() =>
        parseArgs(['config', 'create', '--data', '{invalid json}'], schema)
      ).toThrow()
    })
  })

  describe('Unknown Flag Error', () => {
    test('throws error for unknown flag with strict schema', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['list'],
        flags: {},
      }
      expect(() =>
        parseArgs(['task', 'list', '--unknown-flag'], schema)
      ).toThrow()
    })

    test('error has UNKNOWN_FLAG code', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['list'],
        flags: {},
      }
      try {
        parseArgs(['task', 'list', '--unknown-flag'], schema)
        expect(true).toBe(false)
      } catch (error) {
        expect((error as ParseError).code).toBe('UNKNOWN_FLAG')
      }
    })

    test('error provides suggestions for similar flags', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['list'],
        flags: {
          format: { type: 'string' },
          filter: { type: 'string' },
        },
      }
      try {
        parseArgs(['task', 'list', '--fromat'], schema) // typo: fromat instead of format
        expect(true).toBe(false)
      } catch (error) {
        expect((error as ParseError).suggestions).toContain('format')
      }
    })

    test('error provides multiple suggestions when applicable', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['list'],
        flags: {
          title: { type: 'string' },
          time: { type: 'string' },
          type: { type: 'string' },
        },
      }
      try {
        parseArgs(['task', 'list', '--tile'], schema) // typo
        expect(true).toBe(false)
      } catch (error) {
        const suggestions = (error as ParseError).suggestions || []
        expect(suggestions.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Missing Flag Value Error', () => {
    test('throws error when flag expects value but none provided', () => {
      expect(() => parseArgs(['task', 'create', '--title'])).toThrow()
    })

    test('error has MISSING_FLAG_VALUE code', () => {
      try {
        parseArgs(['task', 'create', '--title'])
        expect(true).toBe(false)
      } catch (error) {
        expect((error as ParseError).code).toBe('MISSING_FLAG_VALUE')
      }
    })

    test('throws when flag value looks like another flag', () => {
      // --title --priority should error because --priority looks like a flag, not a value
      expect(() =>
        parseArgs(['task', 'create', '--title', '--priority', 'high'])
      ).toThrow()
    })
  })

  describe('Invalid Format Error', () => {
    test('throws error for invalid format value', () => {
      expect(() => parseArgs(['task', 'list', '--format', 'invalid'])).toThrow()
    })

    test('error has INVALID_FORMAT code', () => {
      try {
        parseArgs(['task', 'list', '--format', 'invalid'])
        expect(true).toBe(false)
      } catch (error) {
        expect((error as ParseError).code).toBe('INVALID_FORMAT')
      }
    })

    test('error message suggests valid formats', () => {
      try {
        parseArgs(['task', 'list', '--format', 'invalid'])
        expect(true).toBe(false)
      } catch (error) {
        const suggestions = (error as ParseError).suggestions || []
        expect(suggestions).toContain('json')
        expect(suggestions).toContain('yaml')
      }
    })
  })
})

// ============================================================================
// 7. ADVANCED PARSING TESTS
// ============================================================================

describe('CLI Parser - Advanced Parsing', () => {
  describe('Array Values', () => {
    test('parses comma-separated array values', () => {
      const result = parseArgs(['task', 'create', '--tags', 'tag1,tag2,tag3'])
      expect(result.flags.tags).toEqual(['tag1', 'tag2', 'tag3'])
    })

    test('parses array with spaces after comma', () => {
      const result = parseArgs(['task', 'create', '--tags', 'tag1, tag2, tag3'])
      expect(result.flags.tags).toEqual(['tag1', 'tag2', 'tag3'])
    })

    test('parses single value as array when schema specifies array type', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['create'],
        flags: {
          tags: { type: 'array' },
        },
      }
      const result = parseArgs(['task', 'create', '--tags', 'single'], schema)
      expect(result.flags.tags).toEqual(['single'])
    })

    test('parses empty array value', () => {
      const result = parseArgs(['task', 'create', '--tags', ''])
      expect(result.flags.tags).toEqual([])
    })
  })

  describe('JSON Values', () => {
    test('parses JSON object value', () => {
      const result = parseArgs([
        'config',
        'set',
        '--data',
        '{"key": "value", "count": 42}',
      ])
      expect(result.flags.data).toEqual({ key: 'value', count: 42 })
    })

    test('parses JSON array value', () => {
      const result = parseArgs(['config', 'set', '--items', '[1, 2, 3]'])
      expect(result.flags.items).toEqual([1, 2, 3])
    })

    test('parses nested JSON value', () => {
      const result = parseArgs([
        'config',
        'set',
        '--settings',
        '{"theme": {"dark": true, "colors": ["red", "blue"]}}',
      ])
      expect(result.flags.settings).toEqual({
        theme: { dark: true, colors: ['red', 'blue'] },
      })
    })

    test('keeps JSON string when type not specified as json', () => {
      const result = parseArgs(['config', 'set', '--raw', '{"key": "value"}'])
      // Without schema, should keep as string or auto-detect
      expect(typeof result.flags.raw).toBe('string')
    })

    test('parses JSON with schema type json', () => {
      const schema: ResourceSchema = {
        name: 'config',
        operations: ['set'],
        flags: {
          data: { type: 'json' },
        },
      }
      const result = parseArgs(
        ['config', 'set', '--data', '{"key": "value"}'],
        schema
      )
      expect(result.flags.data).toEqual({ key: 'value' })
    })
  })

  describe('Stdin Indicator', () => {
    test('recognizes - as stdin indicator for data flag', () => {
      const result = parseArgs(['task', 'create', '--data', '-'])
      expect(result.flags.data).toBe('-')
      // The actual stdin reading would be handled by the command executor
    })

    test('recognizes /dev/stdin as stdin indicator', () => {
      const result = parseArgs(['task', 'create', '--input', '/dev/stdin'])
      expect(result.flags.input).toBe('/dev/stdin')
    })
  })

  describe('Double Dash Stop Parsing', () => {
    test('stops flag parsing after --', () => {
      const result = parseArgs([
        'task',
        'create',
        '--title',
        'Test',
        '--',
        '--not-a-flag',
      ])
      expect(result.flags.title).toBe('Test')
      expect(result.positional).toContain('--not-a-flag')
      expect(result.flags['not-a-flag']).toBeUndefined()
    })

    test('all args after -- are positional', () => {
      const result = parseArgs([
        'script',
        'run',
        '--',
        '-v',
        '--verbose',
        'arg1',
        'arg2',
      ])
      expect(result.positional).toEqual(['-v', '--verbose', 'arg1', 'arg2'])
    })

    test('handles -- at end of args', () => {
      const result = parseArgs(['task', 'list', '--format', 'json', '--'])
      expect(result.format).toBe('json')
      expect(result.positional).toEqual([])
    })

    test('handles multiple -- (only first matters)', () => {
      const result = parseArgs(['task', 'exec', '--', '--', 'arg'])
      expect(result.positional).toEqual(['--', 'arg'])
    })
  })

  describe('Edge Cases', () => {
    test('handles empty args array', () => {
      const result = parseArgs([])
      expect(result.operation).toBe('')
      expect(result.resource).toBeUndefined()
    })

    test('handles only whitespace in values', () => {
      const result = parseArgs(['task', 'create', '--title', '   '])
      expect(result.flags.title).toBe('   ')
    })

    test('handles unicode in values', () => {
      const result = parseArgs(['task', 'create', '--title', 'Task with emoji'])
      expect(result.flags.title).toBe('Task with emoji')
    })

    test('handles very long flag values', () => {
      const longValue = 'a'.repeat(10000)
      const result = parseArgs(['task', 'create', '--description', longValue])
      expect(result.flags.description).toBe(longValue)
    })

    test('handles flags that look like numbers', () => {
      const result = parseArgs(['task', 'create', '--123', 'value'])
      // Flag names should not start with numbers, but parser should handle gracefully
      expect(result.flags['123']).toBe('value')
    })

    test('handles values that start with hyphen', () => {
      const result = parseArgs(['task', 'create', '--offset', '-10'])
      expect(result.flags.offset).toBe('-10')
    })

    test('preserves case in flag values', () => {
      const result = parseArgs(['task', 'create', '--title', 'CamelCaseTitle'])
      expect(result.flags.title).toBe('CamelCaseTitle')
    })

    test('handles backslashes in values', () => {
      const result = parseArgs(['task', 'create', '--path', 'C:\\Users\\test'])
      expect(result.flags.path).toBe('C:\\Users\\test')
    })

    test('handles quotes in values', () => {
      const result = parseArgs(['task', 'create', '--desc', 'He said "hello"'])
      expect(result.flags.desc).toBe('He said "hello"')
    })
  })

  describe('Schema Validation', () => {
    test('applies default values from schema', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['list'],
        flags: {
          limit: { type: 'number', default: 10 },
        },
      }
      const result = parseArgs(['task', 'list'], schema)
      expect(result.flags.limit).toBe(10)
    })

    test('overrides default with provided value', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['list'],
        flags: {
          limit: { type: 'number', default: 10 },
        },
      }
      const result = parseArgs(['task', 'list', '--limit', '25'], schema)
      expect(result.flags.limit).toBe(25)
    })

    test('coerces string to number when schema specifies number type', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['list'],
        flags: {
          limit: { type: 'number' },
        },
      }
      const result = parseArgs(['task', 'list', '--limit', '50'], schema)
      expect(result.flags.limit).toBe(50)
      expect(typeof result.flags.limit).toBe('number')
    })

    test('coerces string to boolean when schema specifies boolean type', () => {
      const schema: ResourceSchema = {
        name: 'task',
        operations: ['update'],
        flags: {
          done: { type: 'boolean' },
        },
      }
      const result = parseArgs(['task', 'update', 'abc', '--done', 'true'], schema)
      expect(result.flags.done).toBe(true)
      expect(typeof result.flags.done).toBe('boolean')
    })
  })

  describe('Complex Command Scenarios', () => {
    test('parses full create command with multiple flags', () => {
      const result = parseArgs([
        'task',
        'create',
        '--title',
        'New task',
        '--priority',
        'high',
        '--tags',
        'urgent,bug',
        '--done',
        'false',
      ])
      expect(result.resource).toBe('task')
      expect(result.operation).toBe('create')
      expect(result.flags.title).toBe('New task')
      expect(result.flags.priority).toBe('high')
    })

    test('parses update command with id and flags', () => {
      const result = parseArgs([
        'task',
        'update',
        'abc123',
        '--done',
        'true',
        '--priority',
        '1',
      ])
      expect(result.resource).toBe('task')
      expect(result.operation).toBe('update')
      expect(result.id).toBe('abc123')
      expect(result.flags.done).toBe(true)
    })

    test('parses list command with format and global flags', () => {
      const result = parseArgs([
        '--verbose',
        'task',
        'list',
        '--format',
        'json',
        '--no-color',
      ])
      expect(result.resource).toBe('task')
      expect(result.operation).toBe('list')
      expect(result.format).toBe('json')
      expect(result.globalFlags.verbose).toBe(true)
      expect(result.globalFlags.color).toBe(false)
    })

    test('parses search command with query and filters', () => {
      const result = parseArgs([
        'task',
        'search',
        'MVP',
        '--status',
        'open',
        '--format',
        'markdown',
      ])
      expect(result.resource).toBe('task')
      expect(result.operation).toBe('search')
      expect(result.positional).toContain('MVP')
      expect(result.flags.status).toBe('open')
      expect(result.format).toBe('markdown')
    })

    test('parses delete command with multiple ids', () => {
      const result = parseArgs(['task', 'delete', 'id1', 'id2', 'id3', '--quiet'])
      expect(result.resource).toBe('task')
      expect(result.operation).toBe('delete')
      expect(result.positional).toContain('id1')
      expect(result.positional).toContain('id2')
      expect(result.positional).toContain('id3')
      expect(result.globalFlags.quiet).toBe(true)
    })
  })
})

// ============================================================================
// TYPE DEFINITION TESTS
// ============================================================================

describe('CLI Parser - Type Definitions', () => {
  test('ParsedCommand has correct shape', () => {
    const result = parseArgs(['task', 'list'])
    const cmd: ParsedCommand = result

    // These should compile and have correct types
    expect(typeof cmd.operation).toBe('string')
    expect(typeof cmd.flags).toBe('object')
    expect(Array.isArray(cmd.positional)).toBe(true)
    expect(typeof cmd.globalFlags).toBe('object')
  })

  test('GlobalFlags has correct optional properties', () => {
    const result = parseArgs(['task', 'list', '--verbose', '--quiet'])
    const gf = result.globalFlags

    // All should be optional booleans
    expect(gf.help === undefined || typeof gf.help === 'boolean').toBe(true)
    expect(gf.version === undefined || typeof gf.version === 'boolean').toBe(true)
    expect(gf.verbose === undefined || typeof gf.verbose === 'boolean').toBe(true)
    expect(gf.quiet === undefined || typeof gf.quiet === 'boolean').toBe(true)
    expect(gf.color === undefined || typeof gf.color === 'boolean').toBe(true)
  })

  test('OutputFormat is one of valid values', () => {
    const validFormats: OutputFormat[] = [
      'unicode',
      'ascii',
      'plain',
      'json',
      'markdown',
      'csv',
      'yaml',
    ]

    for (const format of validFormats) {
      const result = parseArgs(['task', 'list', '--format', format])
      expect(result.format).toBe(format)
    }
  })

  test('flags record accepts unknown keys with unknown values', () => {
    const result = parseArgs(['task', 'create', '--custom', 'value'])
    const flags: Record<string, unknown> = result.flags
    expect(flags.custom).toBe('value')
  })
})
