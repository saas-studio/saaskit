import { DateTime, Thing } from "schema-dts"

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
    provider?: Provider<T>
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

export type Prop<T = any> = {
    type: string
    value: T
    description?: string
    readOnly?: boolean
    unique?: boolean
    hideLabel?: boolean
    optional?: boolean
    displayOnList?: boolean
    primaryOnList?: boolean
    default?: T
    example?: T | T[]
}

export type Optional = {
    optional: true
}

export type HasNumericFormat = {
    format?: 'integer' | 'decimal'
}

export type HasPrecision = {
    precision?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
}

export type HasURL = {
    url: string
}

export type IsReadOnly = {
    readonly: true
}

export type HasFormula = {
    formula: Formula
}

export type HasSelectOptions = {
    options: string[] | KeyValue<string>
}

export type HasRelationship = {
    relationship: Noun
}

export type HasRollup = {
    type: 'min' | 'max' | 'sum' | 'avg' 
    filter?: Criteria
}

export type HasDuration = {
    format?: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
}

export type HasMany = {
    many: true
}

export type Text = 'Text' | Prop<string> & { type: 'Text' }
export type LongText = 'LongText' | Prop<string> & { type: 'LongText' }
export type RichText = 'RichText' | Prop<Markdown> & { type: 'LongText' }
export type Number = 'Number' | HasNumericFormat & HasPrecision & Prop<number> & { type: 'Number' } 
export type Percentage = 'Percentage' | HasPrecision & Prop<number> & { type: 'Percentage' }
export type Currency = 'Currency' | HasPrecision & Prop<number> & { type: 'Currency' }
export type Attachment = 'Attachment' | HasURL & Prop<string | string[]> & { type: 'Attachment' }
export type Checkbox = 'Checkbox' | Prop<boolean> & { type: 'Checkbox' }
export type MultiSelect = 'MultiSelect' | HasSelectOptions & Prop<string[]> & { type: 'MultiSelect' }
export type SingleSelect = 'SingleSelect' | HasSelectOptions & Prop<string> & { type: 'SingleSelect' }
export type DatePicker = 'Date' | Prop<Date> & { type: 'Date' }
export type DateTimePicker = 'DateTime' | Prop<DateTime> & { type: 'DateTime' }
export type TimePicker = 'Time' | Prop<DateTime> & { type: 'Time' }
export type CreatedDate = 'Created' | IsReadOnly & Prop<DateTime> & { type: 'Created' }
export type ModifiedDate = 'Modified' | IsReadOnly & Prop<DateTime> & { type: 'Modified' }
export type CreatedBy = 'CreatedBy' | IsReadOnly & Prop<User> & { type: 'CreatedBy' }
export type ModifiedBy = 'ModifiedBy' | IsReadOnly & Prop<User> & { type: 'ModifiedBy' }
export type Duration = 'Duration' | IsReadOnly & Prop<number> & { type: 'Duration' }
export type Formula = 'Formula' | HasFormula & Prop<string | number> & { type: 'Formula' }
export type Lookup = 'Lookup' | HasRelationship & Prop<string> & { type: 'Lookup' }
export type Rollup = 'Relationship' | HasRollup & HasRelationship & Prop<string> & { type: 'Relationship' }
export type Relationship = 'Relationship' | HasRelationship & Prop<Noun> & { type: 'Relationship' }
export type Relationships = 'Relationships' | HasMany & HasRelationship & Prop<Noun> & { type: 'Relationships' }

export type OptionalText = 'Text?' | Optional & Text
export type OptionalLongText = 'LongText?' | Optional & LongText
export type OptionalRichText = 'RichText?' | Optional & RichText
export type OptionalNumber = 'Number?' | Optional & Number
export type OptionalPercentage = 'Percentage?' | Optional & Percentage
export type OptionalCurrency = 'Currency?' | Optional & Currency
export type OptionalAttachment = 'Attachment?' | Optional & Attachment
export type OptionalCheckbox = 'Checkbox?' | Optional & Checkbox
export type OptionalMultiSelect = 'MultiSelect?' | Optional & MultiSelect
export type OptionalSingleSelect = 'SingleSelect?' | Optional & SingleSelect
export type OptionalDatePicker = 'DatePicker?' | Optional & DatePicker
export type OptionalDateTimePicker = 'DateTimePicker?' | Optional & DateTimePicker
export type OptionalTimePicker = 'TimePicker?' | Optional & TimePicker
export type OptionalCreatedDate = 'CreatedDate?' | Optional & CreatedDate
export type OptionalModifiedDate = 'ModifiedDate?' | Optional & ModifiedDate
export type OptionalCreatedBy = 'CreatedBy?' | Optional & CreatedBy
export type OptionalModifiedBy = 'ModifiedBy?' | Optional & ModifiedBy
export type OptionalDuration = 'Duration?' | Optional & Duration
export type OptionalFormula = 'Formula?' | Optional & Formula
export type OptionalLookup = 'OptionalLookup?' | Optional & Lookup
export type OptionalRollup = 'Rollup?' | Optional & Rollup
export type OptionalRelationship = 'Relationship?' | Optional & Relationship
export type OptionalRelationships = 'Relationships?' | Optional & Relationships

export type Markdown = string | {
    type: 'Markdown'
}

export type CRUD<T extends Noun> = { 
    onCreate: Trigger<T>
    onUpdate: Trigger<T>
    onDelete: Trigger<T>
    onChange: Trigger<T>
    list: List<T>
    search: Search<T>
    create: Create<T>
    get: Get<T>
    update: Update<T>
    delete: Delete<T>
}

export type HasGlobalScope = { scope: 'global' }
export type HasMultiTenantScope = { scope: 'tenant' }

export type GlobalCRUD<T extends Noun> = CRUD<T> & HasGlobalScope
export type MultiTenantCRUD<T extends Noun> = CRUD<T> & HasMultiTenantScope


export type Criteria = Object

export type Provider<T extends Noun | Integration> = {
    type: 'Provider'
}

export type User = {
    type: 'User'
    name?: string | PersonName
    email?: string | string[]
    image?: string | Image
    userId?: string
    anonymousId?: string
    auth?: AuthAccount[]
}

export type PersonName = {
    prefix?: string
    firstName: string
    middleName?: string
    lastName: string
    suffix?: string
}

export type AuthAccount = {
    provider: string
    metadata: object
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