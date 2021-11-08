import type { NextRequest } from 'next/server'
import { SaaS } from 'saaskit'

export type EdgeRequest = NextRequest & SaaS & { 
    secrets?: {
        [key: string]: string
    }
    developer?: {
        developerId?: string
    }
    user?: {
        anonymousId?: string
        userId?: string
        name?: string
        email?: string
        image?: string
        scope?: string
        admin?: true
        tokens?: {
            [key: string]: string
        }
    }
}