import { EdgeRequest } from "./request"

export const log = {
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    fatal: () => {},
}

export const withLogging = (request: EdgeRequest) => {
    // request.log = log
}