import { SaaS } from './saas'

export type API = SaaS & {
    sources?: Source | Source[]
}

export type Source = {
    name?: string
    category?: string
    nouns?: {
        [key: string]: Resource
    }
}

export type Resource = {
    name?: string
    documentation?: string
    schema?: Schema
}

export type Schema = string