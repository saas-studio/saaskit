import { mergeConfigs } from './merge-config'
import { normalize } from './normalize-args'

export const withArgs = <SWRType>(hook: any) => {
    return (((...args: any) => {
    //   // Get the default and inherited configuration.
    //   const fallbackConfig = useSWRConfig()
         const fallbackConfig = {}
  
      // Normalize arguments.
      const [key, fn, _config] = normalize<any, any>(args)
  
      // Merge configurations.
      const config = mergeConfigs(fallbackConfig, _config)
  
      // Apply middleware
      let next = hook
      const { use } = config
      if (use) {
        for (let i = use.length; i-- > 0; ) {
          next = use[i](next)
        }
      }
  
      return next(key, fn || config.fetcher, config)
    }) as unknown) as SWRType
  }