import { MiddlewareRequest } from "../request"

export type Obj = {
    [propName: string]: string
  }
  
  export interface RouteHandler<T> {
    (request: T & MiddlewareRequest, ...args: any): any
  }
  
  export interface Route {
    <T>(path: string, ...handlers: RouteHandler<T & Request>[]): Router<T>
  }
  
  export interface RouteEntry<T> {
    0: string
    1: RegExp
    2: RouteHandler<T>[]
  }
  
  export type Router<T> = {
    handle: (request: Request, ...extra: any) => any
    routes: RouteEntry<T>[]
  } & {
    [any:string]: Route
  }
  
  export interface RouterOptions<T> {
    base?: string
    routes?: RouteEntry<T>[]
  }
  
  export function Router<T>(options?:RouterOptions<T>): Router<T>