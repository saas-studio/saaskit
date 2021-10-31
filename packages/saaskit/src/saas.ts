const { version } = require('../package.json')

import { Story } from './story'
import { Noun } from './semantics'
import { Logo, Color, Font } from './marketing'

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
      primaryColor?: string | Color,
      secondaryColor?: string | Color,
      accentColor?: string | Color,
      backgroundColor?: string | Color,
      font?: string | Font,
      logo?: string | Logo,
      darkMode?: boolean,
    },
    nouns?: {
      [key: string]: Noun
    },
    verbs?: {
      [key: string]: any
    },
    experiments?: SaaS[],
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

  export const defaultApp: SaaS = {
    persona: 'Coder',
    problem: {
      villain: 'Boilerplate',
      internal: 'Hates repetitive tasks',
      external: 'Needs to build a SaaS',
      philosophical: 'What tech stack is best?',
    },
    solution: 'SaaSkit.js.org',
    brand: 'SaaS.Dev',
    offer: 'Headless SaaS Platform',
    callToAction: {
      build: { 
        price: 0 
      }
    },
    failure: 'Endless complexity and lost opportunities',
    success: {
      goal: 'Building a Unicorn',
      transformation: { 
        from: 'Struggling to Ship', 
        to: 'Titan of SaaS'
      }
    },
    theme: {
      logo: {
        font: 'Roboto',
        color: 'gray-900',
        icon: 'cube',
      },
      primaryColor: '',
      accentColor: '',
      backgroundColor: '',
      font: '',
    },
    experiments: [{
      problem: {
        villain: 'Friction'
      }
    }]
  }