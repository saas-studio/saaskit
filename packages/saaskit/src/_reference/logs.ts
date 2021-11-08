import { Todo } from "."

export type LogArgs = [message: any, ...args: any[]]
export type LogFn = (args: LogArgs) => void

export type Log = {
    log: LogFn
    error: LogFn
    warn: LogFn
    info: LogFn
    assert: LogFn
}

export type LogLevel = 'error' | 'warn' | 'info' | 'assert'

export type Logger = Log & {
    development?: LogLevel
    production?: LogLevel
}

export const ConsoleLogger: Logger = {
    log: (args) => console.assert(args),
    error: (args) => console.assert(args),
    warn: (args) => console.assert(args),
    info: (args) => console.assert(args),
    assert: (args) => console.assert(args),
}

export type RESTLogger = Todo