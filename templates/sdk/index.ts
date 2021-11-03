const { version } = require('./package.json')
require('isomorphic-fetch')

export const getApp = async (name = process.env.SAASKIT_APP ?? 'saas.dev') => {
    const secret = process.env.SAASKIT_SECRET ?? 'anonymous'
    return fetch(`https://saas.dev/api/app/${name}`, {
      headers: {
        'User-Agent': `SaaSkit ${version}`,
        'Authorization': `Bearer ${secret}`
      }
    }).then(res => res.json())
  }