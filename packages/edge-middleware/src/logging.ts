import { EdgeRequest } from "./request"

export const log = {
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    fatal: () => {},
}

export type Log = {
    trace: () => void,
    debug: () => void,
    info: () => void,
    warn: () => void,
    error: () => void,
    fatal: () => void,
}

export const withLogging = (request: EdgeRequest) => {
    // request.log = log
}