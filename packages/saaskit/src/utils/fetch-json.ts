
export default function fetchJSON<T = object>(url = 'https://saas.dev/api', options?: FetcherOptions) {
    const {
        base = undefined,
        query = undefined,
        params = undefined,
        graph = undefined,
        body = graph ?? undefined,
        method = body ? 'POST' : 'GET',
        as = 'saaskit',
        headers = { accept: 'application/json', 'user-agent': userAgent[as] },
    } = options
    return (fetch(base ? base + url : url + (query ? new URLSearchParams(params).toString() : ''), { 
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
     })).then(res => res.json()) as Promise<T>
}

export type FetcherOptions = {
    base?: string
    path?: string
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    headers?: {
        [key: string]: string
    }
    body?: any
    query?: string | Object
    params?: {
        [key: string]: string
    }
    as?: 'browser' | 'saaskit'
    graph?: GraphQL
}

export type GraphQL = {
    query?: string
    variables?: Object
}

const userAgent = {
    browser: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko)',
    saaskit: `saaskit@1.0.1`
}