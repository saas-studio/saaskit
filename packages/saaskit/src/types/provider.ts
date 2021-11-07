export type Provider = {
    name: string
    type: 'analytics' | 'api'  | 'app' | 'auth' | 'cms' | 'data' | 'hosting' | 'logging' | 'marketing' | 'marketplace'| 'monitoring' | 'repo'
    logo: string
    description: string
    features: string
    benefits: string
    screenshots: string[]
    package: { 
        [key: string]: string 
    }
    auth: OAuthAPI | APIKey
}

export type OAuthAPI = {
    authorizeEndpoint: string
    tokenEndpoint: string
}

export type APIKey = {
    apikey: string
    header?: (apikey: string) => { [key: string]: string }
}