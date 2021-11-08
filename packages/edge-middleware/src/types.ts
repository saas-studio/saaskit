

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