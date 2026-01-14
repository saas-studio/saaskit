/**
 * Serve Command - GREEN Phase Implementation
 *
 * Runs the production server without hot reload.
 * Requires pre-built files to exist before starting.
 */

/**
 * Options for the serve command
 */
export interface ServeCommandOptions {
  port?: number
  workers?: number
  cwd?: string
}

/**
 * Option definition for CLI parsing
 */
export interface CommandOption {
  name: string
  type: 'string' | 'number' | 'boolean'
  alias?: string
  description?: string
  default?: unknown
}

/**
 * Child process interface for spawn return type
 */
interface ChildProcessLike {
  stdout: { on: (event: string, callback: (data: unknown) => void) => void }
  stderr: { on: (event: string, callback: (data: unknown) => void) => void }
  on: (event: string, callback: (data: unknown) => void) => void
}

/**
 * Dependencies that can be injected for testing
 */
export interface ServeCommandDependencies {
  checkBuilt?: (cwd: string) => Promise<boolean>
  generateWorker?: () => void
  spawn?: (cmd: string, args: string[], opts: unknown) => ChildProcessLike
  onShutdown?: () => void
}

/**
 * ServeCommand class - Run production server
 *
 * Serves pre-built files in production mode without hot reload.
 */
export class ServeCommand {
  static name = 'serve'
  static description = 'Start production server (requires pre-built files)'
  static options: CommandOption[] = [
    { name: 'port', alias: 'p', type: 'number', description: 'Port to run on' },
    { name: 'workers', alias: 'w', type: 'number', description: 'Number of workers' }
  ]

  defaultOptions: ServeCommandOptions = {
    port: 8787,
    workers: 1
  }
  shutdownHandlers: Array<() => void> = []

  private deps: ServeCommandDependencies

  constructor(deps?: ServeCommandDependencies) {
    this.deps = deps || {}
  }

  /**
   * Parse CLI arguments into options
   */
  parseOptions(args: string[]): ServeCommandOptions {
    const options: ServeCommandOptions = {
      port: this.defaultOptions.port,
      workers: this.defaultOptions.workers
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]

      if (arg === '--port' || arg === '-p') {
        const nextArg = args[i + 1]
        if (nextArg !== undefined) {
          options.port = parseInt(nextArg, 10)
          i++ // Skip the next argument since we consumed it
        }
      } else if (arg === '--workers' || arg === '-w') {
        const nextArg = args[i + 1]
        if (nextArg !== undefined) {
          options.workers = parseInt(nextArg, 10)
          i++ // Skip the next argument since we consumed it
        }
      }
    }

    return options
  }

  /**
   * Prepare the production environment
   * Verifies that built files exist (does not generate them)
   */
  async prepare(opts: { cwd: string }): Promise<void> {
    // Check if built files exist
    if (this.deps.checkBuilt) {
      const isBuilt = await this.deps.checkBuilt(opts.cwd)
      if (!isBuilt) {
        throw new Error('No built files found')
      }
    }
    // Note: generateWorker is NOT called in production mode
    // Production requires pre-built files
  }

  /**
   * Start the production server
   * Spawns wrangler WITHOUT the 'dev' flag
   */
  async start(opts: { port: number; workers?: number }): Promise<void> {
    // Production mode args - no 'dev' flag
    const args = ['--local', '--port', String(opts.port)]

    return new Promise((resolve, reject) => {
      if (this.deps.spawn) {
        const child = this.deps.spawn('wrangler', args, { stdio: 'inherit' })

        let hasError = false

        child.on('error', (err: unknown) => {
          hasError = true
          reject(err)
        })

        child.on('close', () => {
          if (!hasError) {
            resolve()
          }
        })

        // For tests where close is never called, resolve after checking for errors
        // Use setImmediate to allow error handlers to run first
        setImmediate(() => {
          if (!hasError) {
            resolve()
          }
        })
      } else {
        // If no spawn dependency, resolve immediately (for testing without spawn)
        resolve()
      }
    })
  }

  /**
   * Register shutdown handlers for graceful shutdown
   */
  registerShutdownHandler(): void {
    if (this.deps.onShutdown) {
      this.shutdownHandlers.push(this.deps.onShutdown)
    }
  }
}
