const { error } = require('./error')

export const missing = (message = 'Not found.') => error(404, message)