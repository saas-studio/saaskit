import { Analytics } from "@segment/analytics-next"
import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import { Thing } from "schema-dts"

export type KeyValue<T = string> = {
    [key: string]: T
}

export type ObjectOrArray = object | any[]

export type Schema = 'Thing' | 'Action' | 'Whatever'

export type Instances = ''
export type NounTypes = 'Name' | 'PartOfSpeech' | 'Plural' | 'Description' | 'Icon' | 'Image' | 'Schema' | 'SchemaType' 
export type VerbTypes = 'Create' | 'Update' | 'Delete' | 'List' | 'Search' | 'Trigger' | 'Build' | 'Launch'

export type Personas = 'Founder' | 'Builder' | 'Maker' | 'Coder' | 'Seller' 

export type Heros = 'Founder' | 'Buil'

export type Pains = `Doesn't like to` | 'Has issues with' | 'Struggles'
export type InternalProblems = ''
                 


// export type SaaS = {
//     persona: `${Personas} ${Verbs} ${Nouns}`
//     problem: ``
// }

export type Noun<O = object, I = Instances, N = Nouns, V = Verbs> = {
    _type: string
    _key?: string
    _rev?: string
    name?: string
    partOfSpeech?: 'Noun'
    plural?: string
    description?: string
    icon?: string | Icon 
    image?: string | string[] | Image | Image[]
    schema?: Thing
    schemaType?: Schema
    url?: string 
    app?: App
    api?: API
    is?: Noun | Noun[]
    has?: N
    can?: V
    sameAs?: Noun | Noun[]
    hasTypes?: N
    isInstance?: Instances
    hasInstances?: I
    scope?: Scope
    visibility?: Visibility
    auth?: Authorization
    triggers?: Triggers
    searches?: Searches
    actions?: Actions
    functions?: Functions
    integrations?: Integration[]
    plugins?: Plugin[]
    provider?: Provider
    onCreate?: CreateTrigger<O>
    onUpdate?: UpdateTrigger<O>
    onDelete?: DeleteTrigger<O>
    onChange?: ChangeTrigger<O>
    list?: List<O>
    search?: Search<O>
    create?: Create<O>
    get?: Get<O>
    update?: Update<O>
    delete?: Delete<O>
}

export type Relationship<F extends Nouns, T extends Nouns> = Noun & {
    _type: 'Relationship'
    _id: `${F}/${T}`
    _key: string
    name: string
    relationship: string
}

// export type Is = Relationship<Noun, Noun>
// export type Has = Relationship<Noun, Noun>
// export type HasInstances = Relationship<Nouns, Nouns>

export type HasRelationship = {
    relationship: Noun
}
// export type Relationship = 'Relationship' | HasRelationship & Prop<Noun> & { _type: 'Relationship' }
// export type Relationships = 'Relationships' | HasMany & HasRelationship & Prop<Noun> & { _type: 'Relationships' }
// export type OptionalRelationship = 'Relationship?' | Optional & Relationship
// export type OptionalRelationships = 'Relationships?' | Optional & Relationships

export type CreateTrigger<T> = Trigger<T>
export type UpdateTrigger<T> = Trigger<T>
export type DeleteTrigger<T> = Trigger<T>
export type ChangeTrigger<T> = Trigger<T>

export type WebhookTrigger<T> = Trigger<T>
export type CRONTrigger<T> = Trigger<T>
export type WebsocketTrigger<T> = Trigger<T>
export type EmailTrigger<T> = Trigger<T>

export type Props = KeyValue<Prop>

export type Prop<T = any> = {
    _type: string
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

export type HasRollup = {
    _type: 'min' | 'max' | 'sum' | 'avg' 
    filter?: Criteria
}

export type DurationPeriod = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'

export type HasDuration = {
    format?: DurationPeriod
}

export type HasMany = {
    many: true
}

export type Properties = 'Text' | 'LongText' | 'RichText' | 'Number' | 'Percentage' // ToDo

export type Text = 'Text' | Prop<string> & { _type: 'Text' }
export type LongText = 'LongText' | Prop<string> & { _type: 'LongText' }
export type RichText = 'RichText' | Prop<Markdown> & { _type: 'LongText' }
export type Number = 'Number' | HasNumericFormat & HasPrecision & Prop<number> & { _type: 'Number' } 
export type Percentage = 'Percentage' | HasPrecision & Prop<number> & { _type: 'Percentage' }
export type Currency = 'Currency' | HasPrecision & Prop<number> & { _type: 'Currency' }
export type Attachment = 'Attachment' | HasURL & Prop<string | string[]> & { _type: 'Attachment' }
export type Checkbox = 'Checkbox' | Prop<boolean> & { _type: 'Checkbox' }
export type MultiSelect = 'MultiSelect' | HasSelectOptions & Prop<string[]> & { _type: 'MultiSelect' }
export type SingleSelect = 'SingleSelect' | HasSelectOptions & Prop<string> & { _type: 'SingleSelect' }
export type DatePicker = 'Date' | Prop<Date> & { _type: 'Date' }
export type DateTimePicker = 'DateTime' | Prop<Date> & { _type: 'DateTime' }
export type TimePicker = 'Time' | Prop<Date> & { _type: 'Time' }
export type CreatedDate = 'Created' | IsReadOnly & Prop<Date> & { _type: 'Created' }
export type ModifiedDate = 'Modified' | IsReadOnly & Prop<Date> & { _type: 'Modified' }
export type CreatedBy = 'CreatedBy' | IsReadOnly & Prop<User> & { _type: 'CreatedBy' }
export type ModifiedBy = 'ModifiedBy' | IsReadOnly & Prop<User> & { _type: 'ModifiedBy' }
export type Duration = 'Duration' | IsReadOnly & Prop<number> & { _type: 'Duration' }
export type Formula = 'Formula' | HasFormula & Prop<string | number> & { _type: 'Formula' }
export type Lookup = 'Lookup' | HasRelationship & Prop<string> & { _type: 'Lookup' }
export type Rollup = 'Relationship' | HasRollup & HasRelationship & Prop<string> & { _type: 'Relationship' }

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

export type Markdown = string | {
    _type: 'Markdown'
}

// export type MDX = {
//     type = 'MDX'
//     components?: Component[]
//     packages?: Package[]
// }

// export type Component = {
//     type = 'Component'
// }

export type Package = {
    name: string
    version: string
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

export type Provider = Noun & {
    _type: 'Provider'
}

export type User = Noun & {
    _type: 'User'
    name?: string | PersonName
    email?: string | string[]
    image?: string | Image
    userId?: string
    anonymousId?: string
    auth?: AuthAccount[]
}

export type PersonName = Name & {
    prefix?: string
    firstName: string
    middleName?: string
    lastName: string
    suffix?: string
    name: () => string
}

export type AuthAccount = {
    provider: string
    metadata: object
}

export type Instance = {
    id: string
    name?: string
}

export type App = SaaS & {
    _type: 'App'
    app: AppConfig
}
export type API = SaaS & {
    _type: 'API'
    api: APIConfig
}
export type Marketplace = Noun & {
    _type: 'Marketplace'
}

export type EdgeRequest = NextRequest & {
    jwt?: JWT 
    user?: User
    analytics?: Analytics
}

export type IsInstance = { isInstance: true, name: string }

export type Product = Noun & {
    _type: 'Product'
    name: string
    price?: Price
    domain?: string
    url?: string
}

export type JourneyStages = 'Beginning' | 'Middle' | 'End' | 'Build' | 'Grow' | 'Launch' | 'Scale' | 'Enterprise' | 'Discover'
export type Journey = KeyValue<Stage>

export type Stage = string | JourneyStages | Verb | Activity | KeyValue<Activity> & { _type: 'Stage' }

export type Story = {
    _type: 'Story'
    persona: string | Persona | Hero
    wants?: string | Wants
    needs?: string | Needs
    problem: string | Problem
    solution: string | Solution
    journey: string | Journey 
    callToAction: string | CallToAction
    failure: string | Failure
    success: string | Success
    transformation: string | BeforeAfter | Transformation<Persona, Persona>
}

export type Success = {
    _type: 'Success'
    metric: Metric
}

export type MetricValue = Number | Percentage | Currency | Checkbox
export type MetricType = ''
export type MetricValueTime = { 
    _type: 'MetricValueTime'
    value: MetricValue
    metric: KPI
    time: DurationPeriod
 }



export type KPI = 'Visitors Registered' | 'Users Activated' | 'Users Subscribed' | 'Customers Churned' | 'Advocates Shared'

export type Metric = {
    _type: 'Metric'
    target: MetricValue
    metric: KPI
    now: MetricValue
    past: MetricValueTime
}

export type BeforeAfter = {
    _type: 'Before'

}

export type Failure = {
    _type: 'Failure'
    means?: string | string[]
    fears?: string | string[]
}

export type CallToAction = string | Activities

export type FeaturesAndBenefits = {
    features?: Features
    benefits?: Benefits
}

export type Wants = KeyValue & { _type: 'Wants' }
export type Needs = KeyValue & { _type: 'Needs' }
export type Problem = {
    _type: 'Problem'
    villian?: string | string[] 
    internal: string | string[] 
    external: string | string[] 
    philosophical: string | string[] 
}
export type Solution = {
    _type: 'Solution'
    modifier?: string | string[] | Modifier
    noun: string | string[] | Noun | Noun[]
    solution: string | string[] | Solution | Solution[]
}

export type Modifier = 'Startup' | 'Headless' | 'Low-Code' | 'No-Code'
export type SolutionType = 'App' | 'Marketplace' | 'Platform' | 'Framework' | 'SaaS' | 'Management Platform' | 'Management App'

export type Solutions = `${Modifier} ${Nouns} ${SolutionType}`


export type SaaS<T = Activity> = Noun<T> & Product & Story & {
    _type: 'SaaS'

}


export type AppConfig = Noun & {
    _type: 'AppConfig'
}
export type APIConfig = Noun & {
    _type: 'APIConfig'
}

export type EdgeResponse<T> = NextResponse & {
    json: (obj: T, options: { camelCase: boolean, pretty: boolean }) => void
    text: (message: string) => void
    rewrite: (args: {source: string, destination: string, rewriter: HTMLRewriter}) => void
    experiment: (experiment: Experiment) => void
    track: (activity: Activity) => void
}

export type EdgeFetchEvent = NextFetchEvent

export type JWT = {}

export type Proxy<T> = (req: EdgeRequest, event: EdgeFetchEvent) => EdgeResponse<T>
export type Transformation<I, O> = (input: I) => O
export type Mashup<I extends [], O> = (input: I) => O

export type APIProxy<T> = (req: EdgeRequest, event: EdgeFetchEvent) => EdgeResponse<T> & {
    _type: 'APIProxy'
    source: Source
    // resource: Resource<T | S>
    // transformation: Transformation<
}

export type Resource<T> = Noun<T>

export type DurableObject<T> = {
    id: string
    storage: DurableObjectStorage<T> 
}

export type DurableObjectStorage<T> = {
    get: (key: string | string[]) => Promise<T> | Promise<Map<string, any>>
    // get: (key: string | string[], options: DurableObjectsStorageOptions) => Promise<T> | Promise<Map<string, any>>
    //put: (obj: string | object)
}

export type DurableObjectsStorageGetOptions = { allowConcurrency: Boolean, noCache: boolean}

export type Source = Noun & {
    _type: 'Source'
}

export type Marketing = {} 
export type Launch = {}

export type Visibility = {}
export type Scope = {}
export type Authorization = {}

export type Persona = Noun & { _type: 'Persona' }

export type Trigger<T = object> = Noun & { 
    _type: 'Trigger' 
    trigger: (instance: T, ctx: Context) => any
}
export type Search<T = object> = Noun & { 
    _type: 'Search' 
    search: (criteria: Criteria, ctx: Context) => SearchResults<T>
}
export type Action<T = object> = Noun & { 
    _type: 'Action' 
    trigger: (instance: T, ctx: Context) => any
}

export type SearchResults<T = object> = {
    _type: 'SearchResults'
    results: T[]
    count: number
    total: number
}

export type Triggers<T = object> = KeyValue<Trigger<T>>
export type Searches<T = object> = KeyValue<Search<T>>
export type Actions<T = object> = KeyValue<Action<T>>

export type Experiment = Noun & {
    _type: 'Experiment'
}

export type List<T = object> = (criteria: Criteria) => { 
    _type: 'List' 
    criteria?: Criteria
    items: T[]
    count: number
    total: number
}
export type Create<T = object> = T
export type Get<T = object> = T
export type Update<T = object> = T
export type Delete<T = object> = T

export type Function<P = any, O = any> = (props: P) => O
export type Functions = KeyValue<Function>
export type Integration<T = object> = T
export type Plugin<T = object> = T

export type Context<T = object> = { _type: 'Context', context: T }

export type AppContext = Context<App> & { _type: 'AppContext' }
export type APIContext = Context<API> & { _type: 'APIContext' }
export type PluginContext = Context<Plugin> & { _type: 'PluginContext' }
export type IntegrationContext = Context<Integration> & { _type: 'IntegrationContext' }


export type IsPhrase = { phrase: string }

export type Activity<V = Verb, N = Noun> = { 
    _type: 'Activity', 
    // name: `${V.verb} ${N.noun}`, 
    verb: V, 
    noun: N 
}

export type Activities = `${Verbs} ${Nouns}`

export type FounderActivities = `${FounderVerbs} ${FounderNouns}`

export type NounVerbs = 'List' | 'Search' | 'Get' | 'Create' | 'Update' | 'Delete'
export type ProductVerbs = 'Create' | 'Build' | 'Design' | 'Define' | 'Develop' | 'Manage' | 'Launch'
export type FounderVerbs = 'Start' | 'Define' | 'Plan' | 'Build' | 'Grow' | 'Scale'

export type FounderNouns = 'Company' | 'Startup' | 'Business' | 'OKRs' | 'KPIs'
export type CoderNouns = 'App' | 'API' | 'Code' | 'Language' | 'Platform'


export type Nouns = FounderNouns | CoderNouns
export type Verbs = NounVerbs | ProductVerbs

export type Verb<T = object> = {
    _type: 'Verb'
    actions: T
}

export type Name<T = object> = Noun<T> & {
    _type: 'Name'
    name: string
} 

export type PartOfSpeech = 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Preposition'

export type Word<T> = {
    _type: 'Word'
    partOfSpeech?: PartOfSpeech
    word: T
}
export type Adjective<T = object> = {
    _type: 'Adjective'
    partOfSpeech: Adjective
    adjective: T
}
export type Adverb<T = object> = {
    _type: 'Adverb'
    partOfSpeech: Adverb
    adverb: T
}
export type Sentence<T = object> = {
    _type: 'Sentence'
    sentence: T
}


export type Icon = string
// export type Image = string
export type Logo = string
export type Wordmark = string
export type Brand = string
// export type Color = string
export type Theme = string
export type Style = string


export type Plans = 'Plans' | PlansObject
export type PlansObject = {
    _type: 'Plans'
    [key: string]: 'Plans' | Plan
}

export type Plan = 'Plan' | PlanObject
export type PlanObject = {
    _type: 'Plan'
    price: number | Price
    description?: string
    features?: Feature
}

export type Feature = Noun | Verb | Activity | Function | Integration | Trigger | Search | Action

export type Price = 'Price' | PriceObject
export type PriceObject = {
    _type: 'Price'
    price?: number
    monthlyPrice?: number
    annualPrice?: number
    monthlyPricePerUser?: number
    annualPricePerUser?: number
    pricePerUnit?: number
    currency?: string
}

export type Website = Noun & {
    _type: 'Website'
    title: string
    home: Page
    domain: Domain
    pages?: Page[]
    header?: Header
    footer?: Footer
    login?: string | URL
    privacy?: string | URL
    terms?: string | URL
}


export type Domain = Noun & Name & {
    _type: 'Domain'
    name: string
    isInstance: true
    subdomains: SubDomain[]
}

//export type DomainName = `${name}.${tld}`



export type OwnedDomains = 'SaaS.Dev' | 'SaaS.Studio' | 'Blogs.sh' | 'APIs.dev'
export type AvailableSubDomains = `${Nouns}.${OwnedDomains}`

export type SubDomain = `${Nouns}.${OwnedDomains}`

export type Path = string

// export type 

export type LandingPage = Website & Page & {
    _type: 'LandingPage'
    hero: Hero | Section | Section[]
    features?: Features | Section | Section[]
    benefits?: Benefits | Section | Section[]
    callToAction?: CallToAction | Section | Section[]
    blog?: Blog | Section | Section[]
}

export type Page = Noun & {
    _type: 'Page'
    title: string
    header: Header
    sections: Section[]
    footer: Footer
}

export type Header = {
    _type: 'Header'
    logo?: string | Image
    menu?: Link[] | MenuItem[] | Menu | Menu[]
}

export interface Menu {
    _type: 'Menu'
    name: string
    items: Link[] | MenuItem
}

export interface MenuItem {
    _type: 'MenuItem'
    name: string
    href?: string
    onClick?: Function
    icon?: string | Icon
}

export interface Section {
    _type: 'Section'
    title?: string
    subtitle?: string
    description?: string
    headerBadge?: string
    headerText?: string
    icon?: string | Image
    image?: string | Image
    screenshot?: string | Image
    callToAction?: string | CallToAction | CallToAction[]
}

export interface ListItem {
    _type: 'ListItem'
    text?: string
    subtext?: string
    icon?: string | Image
    callToAction?: string | CallToAction | CallToAction[]
}

// export type CallToAction = CallToAction & {
//     _type: 'CallToAction'
    // name?: string
    // href?: string
    // onClick?: Function
// }

export type Hero = Section & Persona & {
    _type: 'HeroSection'
    logo?: string | Image
    image?: string
}

export type Features = Section & {
    _type: 'FeaturesSection'
    features?: ListItem[]
}

export type Benefits = Section & {
    _type: 'BenefitsSection'
    benefits?: ListItem[]
}

export interface Pricing extends Section {
    annualBilling?: boolean 
    prices?: Price | Price[]
}

export interface FAQs extends Section {
    questions: {
        question: string,
        answer: string,
        icon?: string | Image
        callToAction: string | CallToAction
        link?: string | Link
    }[]
}

export interface Newsletter extends Section {
    emailBoxLabel?: string
    signupButtonText?: string
}

export interface Blog extends Section {
    posts: BlogPost[] 
}

export interface BlogPost {
    title: string
    subtitle?: string
    description?: Text
    image?: string | Image
    icon?: string | Icon
}

export interface Logos extends Section {
    logos: string[] | Image[]
}

export interface Link {
    text: string
    href: string
}

export interface Font {
    family?: string
    name?: string
}

export interface Color {
    name?: string
    rgb?: string
    rgba?: string
    red?: string | number
    green?: string | number
    blue?: string | number
    alpha?: string | number
}
export interface Image {
    src?: string
    layout?: 'intrinsic' | 'fixed' | 'responsive' | 'fill'
    height?: number | string
    width?: number | string
    link?: string | Link
}

export type SocialAccounts = Noun & {
    twitter?: string
    facebook?: string
    instagram?: string
    github?: string
    producthunt?: string
}

export type Footer = Section & {
    _type: 'Footer'
    logo?: string | Logo | Wordmark | Image
    copyright?: string
    companyName?: string
    socialAccounts?: string[] | Link[] | SocialAccounts
    links?: string[] | Link[]
    menu?: Link[] | MenuItem[] | Menu | Menu[]
}