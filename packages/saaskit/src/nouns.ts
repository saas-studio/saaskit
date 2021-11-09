// import { Instances, Props } from "."

export interface IType {
    type: string
    id?: string
    key?: string
    name: string
    props: string
}

export type Persona = 'Founder' | 'Builder' | 'Maker' | 'Coder'
export type Nouns = 'Company' | 'Product' | 'SaaS' | 'App' | 'API' | 'Marketplace' | 'Proxy'
export type Properties = 'type' | 'name' | 'id' | 'key' | 'from' | 'to' | 'is' | 'has' | 'isType' | 'hasTypes' | 'hasInstances' | 'isInstance'

// export type Noun<T = Types,
//                  P = Props,
//                  I = Instances
//                 > = {
//     _id = `${T['name']}/${_key}`
//     _key = properties
//     is: Nouns
//     properties: P 
//     named: I
// }

export type Resources = 'Nouns' | 'Verbs' | 'Personas'
export type Relationships = `${RelationshipVerbs}${RelationshipNouns}`
export type RelationshipVerbs = 'is' | 'has' | 'delivers' | 'provides'
export type RelationshipNouns = '' | 'Type' | 'Relationship' | 'Instance' | 'Example' | 'Property'

export type Relationship <F extends string, T extends string> = { 
    relationship: Relationships, 
    from: F, 
    to: T 
}
