import { Thing } from "schema-dts"

export type KeyValue<T extends string | object | any[]> = {
    [key: string]: T
}

export type Noun<T = object> = {
    type: string
    name?: string
    plural?: string
    description?: string
    icon?: string | Icon 
    image?: string | string[] | Image | Image[]
    schema?: Thing
    url?: string 
    app?: App
    api?: API
    is?: Noun | Noun[]
    has?: Props
    isInstance?: Instance | Instance[]
    hasInstances?: Instance[]
    scope?: Scope
    visibility?: Visibility
    auth?: Authorization
    triggers?: Triggers
    searches?: Searches
    actions?: Actions
    functions?: Functions
    integrations?: Integration[]
    plugins?: Plugin[]
    onCreate?: Trigger<T>
    onUpdate?: Trigger<T>
    onDelete?: Trigger<T>
    onChange?: Trigger<T>
    list?: List<T>
    search?: Search<T>
    create?: Create<T>
    get?: Get<T>
    update?: Update<T>
    delete?: Delete<T>
}

export type Props = KeyValue<Prop>

export type Prop = {
    type: string
    unique: boolean
    hideLabel?: boolean
    optional?: boolean
}

export type OptionalProp = Prop & {
    optional: true
}

export type TextProp = 'Text' | {
    type: 'Text'
    text: string
}



export type OptionalTextProp = 'Text?' | TextProp & {
    optional: true
}

export type LongTextProp = 'Text' | {
    type: 'Text'
}

export type SaaS<T = object> = {
    type: 'SaaS'
    persona: string | Persona

}

export type Instance = {
    id: string
    name?: string
}

export type App = {}
export type API = {}
export type Marketplace = {}

export type Marketing = {} 
export type Launch = {}

export type Visibility = {}
export type Scope = {}
export type Authorization = {}

export type Persona<T = object> = {}

export type Trigger<T = object> = {}
export type Search<T = object> = {}
export type Action<T = object> = {}

export type Triggers<T = object> = KeyValue<Trigger>
export type Searches<T = object> = KeyValue<Search>
export type Actions<T = object> = KeyValue<Action>

export type List<T = object> = {}
export type Create<T = object> = {}
export type Get<T = object> = {}
export type Update<T = object> = {}
export type Delete<T = object> = {}

export type Function<T = object> = {}
export type Functions = KeyValue<Function>
export type Integration<T = object> = {}
export type Plugin<T = object> = {}

export type Context<T = object> = {}

export type Verb<T = object> = {}
export type Name<T = object> = {}
export type Word<T = object> = {}
export type Modifier<T = object> = {}
export type Adjective<T = object> = {}
export type Adverb<T = object> = {}
export type Sentence<T = object> = {}
export type Activity<T = object> = {}

export type Icon = string
export type Image = string
export type Logo = string
export type Wordmark = string
export type Brand = string
export type Color = string
export type Theme = string
export type Style = string


export type Plans = 'Plans' | PlansObject
export type PlansObject = {
    type: 'Plans'
    [key: string]: 'Plans' | Plan
}

export type Plan = 'Plan' | PlanObject
export type PlanObject = {
    type: 'Plan'
    price: number | Price
    description?: string
}

export type Price = 'Price' | PriceObject
export type PriceObject = {
    type: 'Price'
    price?: number
    monthlyPrice?: number
    annualPrice?: number
    monthlyPricePerUser?: number
    annualPricePerUser?: number
    pricePerUnit?: number
    currency?: string
}