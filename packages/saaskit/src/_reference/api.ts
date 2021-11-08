import { Context, Domain, SaaS} from "."

export interface API extends SaaS {
    apiProducts: ApiProducts[]
}

export interface ApiProducts {

}

export interface CRUD {
    scope?: 'workspace' | 'user' | 'team' | 'app' | 'global'
    visibility: 'user' | 'tenant' | 'public'
}

export interface Source extends Resource {
    name?: string
    resources?: [] | Resource | Resource[]
}

export interface CRUDSource extends Source {
    name: 'SaaS.Dev' | 'Workers KV' | 'Durable Object' | 'Firebase' | 'Supabase' | 'Fauna' | 'Upstash'
}

export interface Endpoint extends Resource {

}

export interface Headers {
    [key: string]: string
}

export interface Proxy {

}
export interface JsonProxy {

}

export interface Transformation {
  [key: string]: string | Function | Transformation
}

export interface Resource<Data = unknown> {
    uri?: URL
    path?: string
    basePath?: string | URL | Domain
    headers?: Headers
    onRequest?: (ctx: Context) => Promise<void>
    onResponse?: (ctx: Context) => Response
    onSuccess?: (ctx: Context) => Data
    fetcher?: (ctx: Context) => FetcherResponse<Data>
}

export type FetcherResponse<Data = unknown> = Data | Promise<Data>

export type Fetcher<Data = unknown, ResourceKey extends Key = Key> =
  /**
   * () => [{ foo: string }, { bar: number }] | null | undefined | false
   * () => ( [{ foo: string }, { bar: number } ] as const | null | undefined | false )
   */
   ResourceKey extends (() => readonly [...infer Args] | null | undefined | false)
    ? ((...args: [...Args]) => FetcherResponse<Data>)
    : /**
     * [{ foo: string }, { bar: number }]
     * [{ foo: string }, { bar: number }] as const
     */
    ResourceKey extends (readonly [...infer Args])
    ? ((...args: [...Args]) => FetcherResponse<Data>)
    : /**
     * () => string | null | undefined | false
     * () => Record<any, any> | null | undefined | false
     */
    ResourceKey extends (() => infer Arg | null | undefined | false)
    ? (...args: [Arg]) => FetcherResponse<Data>
    : /**
     *  string | Record<any,any> | null | undefined | false
     */
    ResourceKey extends null | undefined | false
    ? never
    : ResourceKey extends (infer Arg)
    ? (...args: [Arg]) => FetcherResponse<Data>
    : never
  
  type ArgumentsTuple = [any, ...unknown[]] | readonly [any, ...unknown[]]
  export type Arguments =
    | string
    | ArgumentsTuple
    | Record<any, any>
    | null
    | undefined
    | false
  export type Key = Arguments | (() => Arguments)
  
  export type MutatorCallback<Data = any> = (
    currentValue?: Data
  ) => Promise<undefined | Data> | undefined | Data
  
  export type Broadcaster<Data = any, Error = any> = (
    cache: Cache<Data>,
    key: string,
    data: Data,
    error?: Error,
    isValidating?: boolean,
    shouldRevalidate?: boolean
  ) => Promise<Data>
  
  export type State<Data, Error> = {
    data?: Data
    error?: Error
    isValidating?: boolean
  }
  
  export type Mutator<Data = any> = (
    cache: Cache,
    key: Key,
    data?: Data | Promise<Data> | MutatorCallback<Data>,
    shouldRevalidate?: boolean
  ) => Promise<Data | undefined>
  
  export interface ScopedMutator<Data = any> {
    /** This is used for bound mutator */
    (
      key: Key,
      data?: Data | Promise<Data> | MutatorCallback<Data>,
      shouldRevalidate?: boolean
    ): Promise<Data | undefined>
    /** This is used for global mutator */
    <T = any>(
      key: Key,
      data?: T | Promise<T> | MutatorCallback<T>,
      shouldRevalidate?: boolean
    ): Promise<T | undefined>
  }
  
  export type KeyedMutator<Data> = (
    data?: Data | Promise<Data> | MutatorCallback<Data>,
    shouldRevalidate?: boolean
  ) => Promise<Data | undefined>
  
  // Public types
  export interface APIResponse<Data, Error> {
    data?: Data
    error?: Error
    mutate: KeyedMutator<Data>
    isValidating: boolean
  }
  
  export type KeyLoader<Args extends Arguments = Arguments> =
    | ((index: number, previousPageData: any | null) => Args)
    | null

    export interface Cache<Data = any> {
        get(key: Key): Data | null | undefined
        set(key: Key, value: Data): void
        delete(key: Key): void
      }
      
    export type Middleware = (
        useSWRNext: void //SWRHook
      ) => <Data = any, Error = any, Args extends Key = Key>(
        key: Args,
        fetcher: Fetcher<Data, Args> | null,
        config: Configuration<Data, Error>
      ) => void //Response<Data, Error>

export type Configuration<
  Data = any,
  Error = any,
  SWRKey extends Key = Key
  > = Partial<PublicConfiguration<Data, Error, SWRKey>>

  export type FullConfiguration = InternalConfiguration & PublicConfiguration

      export interface InternalConfiguration {
        cache: Cache
        mutate: ScopedMutator
      }
      
      export interface PublicConfiguration<
        Data = any,
        Error = any,
        SWRKey extends Key = Key
      > {
        errorRetryInterval: number
        errorRetryCount?: number
        loadingTimeout: number
        focusThrottleInterval: number
        dedupingInterval: number
        refreshInterval?: number
        refreshWhenHidden?: boolean
        refreshWhenOffline?: boolean
        revalidateOnFocus: boolean
        revalidateOnReconnect: boolean
        revalidateOnMount?: boolean
        revalidateIfStale: boolean
        shouldRetryOnError: boolean
        suspense?: boolean
        fallbackData?: Data
        fetcher?: Fetcher<Data, SWRKey>
        use?: Middleware[]
        fallback: { [key: string]: any }
      
        isPaused: () => boolean
        onLoadingSlow: (
          key: string,
          config: Readonly<PublicConfiguration<Data, Error, SWRKey>>
        ) => void
        onSuccess: (
          data: Data,
          key: string,
          config: Readonly<PublicConfiguration<Data, Error, SWRKey>>
        ) => void
        onError: (
          err: Error,
          key: string,
          config: Readonly<PublicConfiguration<Data, Error, SWRKey>>
        ) => void
        onErrorRetry: (
          err: Error,
          key: string,
          config: Readonly<PublicConfiguration<Data, Error, SWRKey>>,
          // revalidate: Revalidator,
          // revalidateOpts: Required<RevalidatorOptions>
        ) => void
        onDiscarded: (key: string) => void
      }
