import { Story } from './story'
import { Category } from './categories'
import { TailwindValuesColor, TailwindValuesFontFamily } from 'tailwindcss/tailwind-config'
import { Logo } from './brand'
import { Noun } from './word'
import { KeyValue } from './core'
import { Action, BaseTypes, Create, Experiment, Integration, Search, Trigger } from '../saas'
import { Website, LandingPage } from '..'

export type Product = Story & {
    category?: Category | Category[]
    callToAction?: {
        [key: string]: { 
          [key: string]: any, 
          price?: number, 
        },
    },
}

export type SaaS = Product & {
    plans?: {
        [key: string]: { 
          [key: string]: any, 
          annualPrice?: number, 
          monthlyPrice?: number,
          annualUserPrice?: number, 
          monthlyUserPrice?: number,
        },
    },
    theme?: {
      primaryColor?: string | TailwindValuesColor,
      secondaryColor?: string | TailwindValuesColor,
      accentColor?: string | TailwindValuesColor,
      backgroundColor?: string | TailwindValuesColor,
      font?: string | TailwindValuesFontFamily,
      logo?: string | Logo,
      darkMode?: boolean,
    },
    nouns?: {
      [key: string]: Noun & KeyValue<BaseTypes>
    },
    verbs?: {
      [key: string]: any
    },
    creates?: {
      [key: string]: Create
    }
    triggers?: {
      [key: string]: Trigger
    }
    searches?: {
      [key: string]: Search
    }
    actions?: {
      [key: string]: Action
    }
    website?: Website | LandingPage
    documentation?: string | Documentation | Documentation[] | {
        user?: string | Documentation
        api?: string | Documentation
    }
    experiments?: [] | SaaS[] | Experiment[],
    integrations?: [] | Integration[],
    plugins?: [] | Plugin[],
    state?: 'loading' | 'loaded' | 'generated' | 'failed'
  }

  export type Documentation = {
      name?: string
      url?: string
  }