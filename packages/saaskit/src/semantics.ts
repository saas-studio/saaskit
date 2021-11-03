export type PropertyTypes = 'string' | 'bool' | 'int' | 'decimal' | 'currency' | 'date'
export type OptionalTypes = '' | '?'
// export type NounTypes = `${PropertyTypes}${OptionalTypes}`

export interface Noun<T = void> {
    noun?: string
    plural?: string
    description?: string
    schema?: Schema
    createdBy?: User
    is?: Noun
    partOfSpeech?: 'noun'
    get?: (id: string | number, ctx: Context) => T
    onCreate?: (instance: T, ctx: Context) => void | T
    onUpdate?: (instance: T, ctx: Context) => void | T
    onDelete?: (instance: T, ctx: Context) => void | T
    search?: (criteria: object, ctx: Context) => T | T[]
  }

  export type ConditionalStatements = 'is' | 'isNot' | 'contains' | 'doesNotContain' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty' | 'isCurrentUsers' | 'isNotCurrentUsers'
  
export interface ProperNoun<T = void> extends Noun<T> {

}



export interface Verb<T = void> {
    verb?: string
    active?: string
    past?: string
    gerund?: string
    execute?: (id: string | number, ctx: Context) => T
    beforeExecute?: (instance: T, ctx: Context) => void | T
    onError?: (instance: T, ctx: Context) => void | T
    onSuccess?: (instance: T, ctx: Context) => void | T
}

export interface Word {
    partOfSpeech: 'Noun' | 'Verb' | 'Adjective' | 'Adverb'
}

export interface Instance<T = Noun> {
    create?: (instance: T, ctx: Context) => T
    update?: (instance: T, ctx: Context) => T
}

export interface Adjective {
    
}

export interface Adverb {

}

export interface Person {
    
}

export interface Schema {
  
}

export interface Context {

}

export interface User {
    
}

export const prepositions = {
    // for: phrase
}

export const nouns = {
    saas: {},
    app: {},
    api: {}
}

export const verbs = {
    creates: nouns,
    launches: nouns,
    prepares: nouns,
}

export const personas = {
    builder: verbs,
    maker: verbs,
    coder: verbs,
}

const { coder } = personas

coder.launches.app
