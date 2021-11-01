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