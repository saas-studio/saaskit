const { version } = require('../package.json')
require('isomorphic-fetch')

const defaultInit = {
    headers: {
        'User-Agent': `SaaSkit ${version}`,
        'Authorization': `Bearer ${process.env.SAASKIT_SECRET ?? 'anonymous'}`
    }
}

export const fetcher = (url: string, init?: RequestInit) => fetch(url, {...defaultInit, ...init}).then(res => res.json())