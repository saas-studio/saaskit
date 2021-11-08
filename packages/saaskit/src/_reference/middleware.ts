import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { SaaS } from '.'

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

export class EdgeResponse extends NextResponse {
    constructor(body?: BodyInit | null, init?: ResponseInit) {
        super(body, init)
        this.identifyDeveloper = todo
        this.identifyUser = todo
        this.performExperiments = todo
        this.getFeatures = todo
        this.logRequest = todo
        this.captureEvent = todo
        this.catchErrors = todo
        this.withCORS = todo
    }

    identifyDeveloper: () => void
    identifyUser: () => void
    performExperiments: () => void
    getFeatures: () => void
    logRequest: () => void
    captureEvent: () => void
    catchErrors: () => void
    withCORS: () => void
}

export class SaaSResponse extends EdgeResponse {
    constructor(body?: BodyInit | null, init?: ResponseInit) {
        super(body, init)
    }
}

export function todo() {

}
