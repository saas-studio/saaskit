const { version } = require('../package.json')

import { Story } from './story'
import { Noun } from './semantics'
export interface SaaS extends Product {
    callToAction?: {
        [key: string]: { 
          [key: string]: any, 
          annualPrice?: number, 
          monthlyPrice?: number,
          annualUserPrice?: number, 
          monthlyUserPrice?: number,
        },
    },
    theme?: {
      color?: string,
      font?: string,
      logo?: URL | string,
      darkMode?: boolean,
    },
    nouns?: {
      [key: string]: Noun
    },
    verbs?: {
      [key: string]: any
    },
    experiments?: [],
    integrations?: Integration[],
    plugins?: Plugin[]
  }

  export interface Product extends Story {
    callToAction?: {
        [key: string]: { 
          [key: string]: any, 
          price?: number, 
        },
    },
  }

  
  export interface Experiment {
  
  }

  export interface Integration {
  
  }
  
  export interface Plugin {
  
  }
  
 
  
  export const getApp = async (name: string = process.env.SAASKIT_APP ?? 'saas.dev') => {
    const secret = process.env.SAASKIT_SECRET ?? 'anonymous'
    return fetch(`https://saas.dev/api/app/${name}`, {
      headers: {
        'User-Agent': `SaaSkit ${version}`,
        'Authorization': `Bearer ${secret}`
      }
    }).then(res => res.json())
  }