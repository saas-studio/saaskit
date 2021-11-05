export type Email = string
export type Currency = number | {
    amount?: number
    currency?: 'USD' | 'EUR' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'GBP' | 'INR' | 'JPY'
    symbol?: '$' | '€' | '£' | '¥'
}
export type Percentage = number

export type KeyValue<T = any> = { 
    [key: string]: T 
}


export type Markdown = string
export type KPI = boolean | number | Percentage | Currency
export type Domain = string | string[] | {
    name: string
    tld: string
}
export type Subdomain = string | string[] | {
    name: string
    domain: Domain | Subdomain
}

export type HttpMethod = 'https' | 'http'