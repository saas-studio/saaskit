import { ObjectOrArray, Schema } from '.'
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
    triggers?: {}
    searches?: []
    actions?: []
}

export type Resource = {
    name?: string
    documentation?: string
    schema?: Schema
}

export type Proxy<T = ObjectOrArray> = (params: ObjectOrArray) => T

export type Transformation<T = ObjectOrArray> =  (...args: any[]) => T

export type Mashup<T = ObjectOrArray> = ([...objects]: ObjectOrArray[]) => T
