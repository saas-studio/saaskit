/**
 * Command Palette Tests
 */

import { describe, it, expect } from 'bun:test'
import { CommandPalette, type Command } from '../../src/cli/command-palette'

describe('Command Palette', () => {
  describe('command registration', () => {
    it('should register a command', () => {
      const palette = new CommandPalette()

      palette.register({
        id: 'test.command',
        label: 'Test Command',
        action: () => {},
      })

      expect(palette.getCommands()).toHaveLength(1)
    })

    it('should register multiple commands', () => {
      const palette = new CommandPalette()

      palette.register({ id: 'cmd1', label: 'Command 1', action: () => {} })
      palette.register({ id: 'cmd2', label: 'Command 2', action: () => {} })
      palette.register({ id: 'cmd3', label: 'Command 3', action: () => {} })

      expect(palette.getCommands()).toHaveLength(3)
    })

    it('should not allow duplicate command ids', () => {
      const palette = new CommandPalette()

      palette.register({ id: 'test', label: 'Test 1', action: () => {} })

      expect(() => {
        palette.register({ id: 'test', label: 'Test 2', action: () => {} })
      }).toThrow()
    })

    it('should store command metadata', () => {
      const palette = new CommandPalette()

      palette.register({
        id: 'test',
        label: 'Test Command',
        description: 'A test command',
        shortcut: 'Ctrl+T',
        category: 'Testing',
        action: () => {},
      })

      const cmd = palette.getCommand('test')
      expect(cmd?.description).toBe('A test command')
      expect(cmd?.shortcut).toBe('Ctrl+T')
      expect(cmd?.category).toBe('Testing')
    })
  })

  describe('command search', () => {
    it('should search commands by label', () => {
      const palette = new CommandPalette()

      palette.register({ id: 'create', label: 'Create Resource', action: () => {} })
      palette.register({ id: 'delete', label: 'Delete Resource', action: () => {} })
      palette.register({ id: 'list', label: 'List Resources', action: () => {} })

      const results = palette.search('Create')

      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('create')
    })

    it('should search case-insensitively', () => {
      const palette = new CommandPalette()

      palette.register({ id: 'test', label: 'Test Command', action: () => {} })

      const results = palette.search('test')

      expect(results).toHaveLength(1)
    })

    it('should return multiple matches', () => {
      const palette = new CommandPalette()

      palette.register({ id: 'create-user', label: 'Create User', action: () => {} })
      palette.register({ id: 'create-post', label: 'Create Post', action: () => {} })
      palette.register({ id: 'delete-user', label: 'Delete User', action: () => {} })

      const results = palette.search('Create')

      expect(results).toHaveLength(2)
    })

    it('should search by description', () => {
      const palette = new CommandPalette()

      palette.register({
        id: 'cmd',
        label: 'Do Something',
        description: 'Creates a new widget',
        action: () => {},
      })

      const results = palette.search('widget')

      expect(results).toHaveLength(1)
    })

    it('should return empty array for no matches', () => {
      const palette = new CommandPalette()

      palette.register({ id: 'test', label: 'Test', action: () => {} })

      const results = palette.search('nonexistent')

      expect(results).toHaveLength(0)
    })

    it('should return all commands for empty search', () => {
      const palette = new CommandPalette()

      palette.register({ id: 'cmd1', label: 'Command 1', action: () => {} })
      palette.register({ id: 'cmd2', label: 'Command 2', action: () => {} })

      const results = palette.search('')

      expect(results).toHaveLength(2)
    })
  })

  describe('command execution', () => {
    it('should execute command by id', async () => {
      const palette = new CommandPalette()
      let executed = false

      palette.register({
        id: 'test',
        label: 'Test',
        action: () => {
          executed = true
        },
      })

      await palette.execute('test')

      expect(executed).toBe(true)
    })

    it('should pass context to action', async () => {
      const palette = new CommandPalette()
      let receivedContext: unknown

      palette.register({
        id: 'test',
        label: 'Test',
        action: (ctx) => {
          receivedContext = ctx
        },
      })

      await palette.execute('test', { foo: 'bar' })

      expect(receivedContext).toEqual({ foo: 'bar' })
    })

    it('should throw for unknown command', async () => {
      const palette = new CommandPalette()

      await expect(palette.execute('unknown')).rejects.toThrow()
    })

    it('should handle async actions', async () => {
      const palette = new CommandPalette()
      let result = ''

      palette.register({
        id: 'async-cmd',
        label: 'Async Command',
        action: async () => {
          await new Promise((r) => setTimeout(r, 10))
          result = 'done'
        },
      })

      await palette.execute('async-cmd')

      expect(result).toBe('done')
    })

    it('should return action result', async () => {
      const palette = new CommandPalette()

      palette.register({
        id: 'test',
        label: 'Test',
        action: () => 42,
      })

      const result = await palette.execute('test')

      expect(result).toBe(42)
    })
  })

  describe('command categories', () => {
    it('should filter by category', () => {
      const palette = new CommandPalette()

      palette.register({ id: 'file1', label: 'Open File', category: 'File', action: () => {} })
      palette.register({ id: 'file2', label: 'Save File', category: 'File', action: () => {} })
      palette.register({ id: 'edit1', label: 'Undo', category: 'Edit', action: () => {} })

      const fileCommands = palette.getCommandsByCategory('File')

      expect(fileCommands).toHaveLength(2)
    })

    it('should list all categories', () => {
      const palette = new CommandPalette()

      palette.register({ id: 'f1', label: 'F1', category: 'File', action: () => {} })
      palette.register({ id: 'e1', label: 'E1', category: 'Edit', action: () => {} })
      palette.register({ id: 'v1', label: 'V1', category: 'View', action: () => {} })

      const categories = palette.getCategories()

      expect(categories).toContain('File')
      expect(categories).toContain('Edit')
      expect(categories).toContain('View')
    })
  })

  describe('command unregistration', () => {
    it('should unregister a command', () => {
      const palette = new CommandPalette()

      palette.register({ id: 'test', label: 'Test', action: () => {} })
      palette.unregister('test')

      expect(palette.getCommands()).toHaveLength(0)
    })

    it('should not throw when unregistering unknown command', () => {
      const palette = new CommandPalette()

      expect(() => palette.unregister('unknown')).not.toThrow()
    })
  })

  describe('shortcuts', () => {
    it('should find command by shortcut', () => {
      const palette = new CommandPalette()

      palette.register({
        id: 'save',
        label: 'Save',
        shortcut: 'Ctrl+S',
        action: () => {},
      })

      const cmd = palette.getCommandByShortcut('Ctrl+S')

      expect(cmd?.id).toBe('save')
    })

    it('should return undefined for unknown shortcut', () => {
      const palette = new CommandPalette()

      const cmd = palette.getCommandByShortcut('Ctrl+Z')

      expect(cmd).toBeUndefined()
    })
  })
})
