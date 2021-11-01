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
    hero?: Hero
    features?: Features
    benefits?: Benefits
    blog?: Blog
}

export interface Header {
    logo?: string | Image
    menu?: Link[] | MenuItem[] | Menu | Menu[]
}

export interface Menu {
    name: string
    items: Link[] | MenuItem
}

export interface MenuItem {
    name: string
    href?: string
    onClick?: Function
    icon?: string | Icon
}

export interface Section {
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
    text?: string
    subtext?: string
    icon?: string | Image
    callToAction?: string | CallToAction | CallToAction[]
}

export interface CallToAction {
    name?: string
    href?: string
    onClick?: Function
}

export interface Hero extends Section {
    logo?: string | Image
    image?: string
}

export interface Features extends Section {
    features?: ListItem[]
}

export interface Benefits extends Section {
    benefits?: ListItem[]
}

export interface Pricing extends Section {
    annualBilling?: boolean 
    prices?: Price | Price[]
}

export interface Price {
    currency?: string
    price?: number
    monthlyPrice?: number
    annualPrice?: number
    features?: string | { 
        feature: string, 
        enabled: boolean 
    }
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

export interface Icon {
    name?: string
    src?: string
    link?: string | Link
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

export interface Logo extends Wordmark {
    icon?: string | Icon
}

export interface Wordmark {
    name?: string
    wordmark?: string
    font?: string
    color?: string
}

export interface SocialAccounts {
    twitter?: string
    facebook?: string
    instagram?: string
    github?: string
    producthunt?: string
}

export interface Footer {
    logo?: string | Logo | Wordmark | Image
    copyright?: string
    companyName?: string
    socialAccounts?: string[] | Link[] | SocialAccounts
    links?: string[] | Link[]
    menu?: Link[] | MenuItem[] | Menu | Menu[]
}