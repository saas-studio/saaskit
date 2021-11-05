export type Log = {
    fatal: LogFn
    error: LogFn
    warn: LogFn
    info: LogFn
    debug: LogFn
    trace: LogFn
}

type LogFn = {
    <T extends object>(obj: T, msg?: string, ...args: any[]): void
    (msg: string, ...args: any[]): void
}

