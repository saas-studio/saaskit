import { SeoProps } from './seo'

export interface Website {
    name: string
    url: string | URL | Domain
    seo: SeoProps
}

export interface Domain {
    name: string
    subdomain?: string
    domain: string
    tld: string
}

export interface Page {

}

export interface LandingPage extends Website, Page {

}

export interface Header {
  
}