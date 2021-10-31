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

export interface ProperNoun<T = void> extends Noun<T> {

}

export interface Verb {
    
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

export interface Schema {
  
}

export interface Context {

}

export interface User {
    
}