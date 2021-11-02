import { isFunction } from './helper'

import { Key, Fetcher, Configuration } from '../api'

export const normalize = <KeyType = Key, Data = any>(
  args:
    | [KeyType]
    | [KeyType, Fetcher<Data> | null]
    | [KeyType, Configuration | undefined]
    | [KeyType, Fetcher<Data> | null, Configuration | undefined]
): [KeyType, Fetcher<Data> | null, Partial<Configuration<Data>>] => {
  return isFunction(args[1])
    ? [args[0], args[1], args[2] || {}]
    : [args[0], null, (args[1] === null ? args[2] : args[1]) || {}]
}