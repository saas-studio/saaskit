const { json } = require('json')

export const error = (
  status = 500,
  content = 'Internal Server Error.',
) => json({
  ...(typeof content === 'object'
    ? content
    : {
        status,
        error: content,
      }),
}, { status })

export interface StatusError extends Error {
    status: number
  }
  
  export class StatusError extends Error {
    constructor(status = 500, message = 'Internal Error.') {
      super(message)
      this.name = 'StatusError'
      this.status = status
    }
  }