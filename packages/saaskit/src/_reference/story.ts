import { Adjective, Noun } from './types/word'

export interface Story {
    persona?: string,
    problem?: string | {
      villain?: string,
      internal?: string,
      external?: string,
      philosophical?: string,
    },
    solution?: string,
    brand?: string,
    offer?: string | {
        modifier?: string | string[] | Adjective | Adjective[] 
        noun: string | Noun
        type: string | Noun
    },
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
    success?: {
        goal?: string | {
          name: string
          kpi: number | boolean
          type?: 'number' | 'percent' | 'currency'
        },
        transformation?: string | { from: string, to: string }
      },
  }
