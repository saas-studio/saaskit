const { version } = require('../package.json')

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

  export interface Story {
    persona?: string,
    problem?: string | {
      internal?: string,
      external?: string,
      philosophical?: string,
    },
    solution?: string,
    brand?: string,
    offer?: string,
    callToAction?: {
      [key: string]: { 
        [key: string]: any, 
        annualPrice?: number, 
        monthlyPrice?: number,
        annualUserPrice?: number, 
        monthlyUserPrice?: number,
      },
    },
    failure?: string,
    success?: string | {
      goal?: string,
      transformation?: { from: string, to: string }
    }
  }
  
  export interface Noun<T = void> {
    name?: string
    plural?: string
    description?: string
    schema?: Schema
    createdBy?: User
    get?: (id: string | number, ctx: Context) => T
    onCreate?: (instance: T, ctx: Context) => void | T
    onUpdate?: (instance: T, ctx: Context) => void | T
    onDelete?: (instance: T, ctx: Context) => void | T
    search?: (criteria: object, ctx: Context) => T | T[]
  }
  
  export interface Schema {
  
  }
  
  export interface Context {
  
  }
  
  export interface Experiment {
  
  }

  export interface Integration {
  
  }
  
  export interface Plugin {
  
  }
  
  export interface User {
    
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