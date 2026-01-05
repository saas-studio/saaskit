/**
 * Command Palette
 *
 * A searchable command registry for CLI and UI interactions.
 * Supports command registration, search, categorization, and execution.
 *
 * @module cli/command-palette
 */

/**
 * Command definition
 */
export interface Command {
  /** Unique command identifier */
  id: string
  /** Display label */
  label: string
  /** Optional description */
  description?: string
  /** Keyboard shortcut */
  shortcut?: string
  /** Command category */
  category?: string
  /** Action to execute */
  action: (context?: unknown) => unknown | Promise<unknown>
}

/**
 * Command Palette - manages command registration and execution
 */
export class CommandPalette {
  private commands: Map<string, Command> = new Map()

  /**
   * Register a command
   */
  register(command: Command): void {
    if (this.commands.has(command.id)) {
      throw new Error(`Command '${command.id}' is already registered`)
    }
    this.commands.set(command.id, command)
  }

  /**
   * Unregister a command
   */
  unregister(id: string): void {
    this.commands.delete(id)
  }

  /**
   * Get all registered commands
   */
  getCommands(): Command[] {
    return Array.from(this.commands.values())
  }

  /**
   * Get a specific command by ID
   */
  getCommand(id: string): Command | undefined {
    return this.commands.get(id)
  }

  /**
   * Get a command by its shortcut
   */
  getCommandByShortcut(shortcut: string): Command | undefined {
    for (const cmd of this.commands.values()) {
      if (cmd.shortcut === shortcut) {
        return cmd
      }
    }
    return undefined
  }

  /**
   * Get commands by category
   */
  getCommandsByCategory(category: string): Command[] {
    return this.getCommands().filter((cmd) => cmd.category === category)
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>()
    for (const cmd of this.commands.values()) {
      if (cmd.category) {
        categories.add(cmd.category)
      }
    }
    return Array.from(categories)
  }

  /**
   * Search commands by query
   */
  search(query: string): Command[] {
    if (!query) {
      return this.getCommands()
    }

    const lowerQuery = query.toLowerCase()

    return this.getCommands().filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(lowerQuery)
      const descMatch = cmd.description?.toLowerCase().includes(lowerQuery) ?? false
      return labelMatch || descMatch
    })
  }

  /**
   * Execute a command by ID
   */
  async execute(id: string, context?: unknown): Promise<unknown> {
    const command = this.commands.get(id)
    if (!command) {
      throw new Error(`Unknown command: ${id}`)
    }
    return command.action(context)
  }
}
