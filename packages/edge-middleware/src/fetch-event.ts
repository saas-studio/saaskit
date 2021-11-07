import { EdgeRequest } from './request';


export class MiddlewareFetchEvent extends FetchEvent {
    sourcePage: string;
    constructor(params: { request: EdgeRequest; page: string; }){
        super(params.request);
        this.sourcePage = params.page;
    }
    // @ts-ignore
    get request() {
        throw new DeprecationError({
            page: this.sourcePage
        });
    }
    respondWith() {
        throw new DeprecationError({
            page: this.sourcePage
        });
    }
}

export declare const responseSymbol: unique symbol;
export declare const passThroughSymbol: unique symbol;
export declare const waitUntilSymbol: unique symbol;
export declare class FetchEvent {
    readonly [waitUntilSymbol]: Promise<any>[];
    [responseSymbol]?: Promise<Response>;
    [passThroughSymbol]: boolean;
    constructor(_request: Request);
    respondWith(response: Response | Promise<Response>): void;
    passThroughOnException(): void;
    waitUntil(promise: Promise<any>): void;
}

class DeprecationError extends Error {
    constructor({ page }: { page: string }){
        super(`The middleware "${page}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return new Response("Hello " + request.url)
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
    }
}