import { Transformation } from '../types/api'
import { ObjectOrArray } from '../types'
import camelCaseKeys, { Options } from 'camelcase-keys'

export const camelCase: Transformation<ObjectOrArray> = (input: ObjectOrArray, options: Options)  => {
    return camelCaseKeys<ObjectOrArray>(input, options = { deep: true }) as Transformation<ObjectOrArray>
}