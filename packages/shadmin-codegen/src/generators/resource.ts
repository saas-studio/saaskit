/**
 * Resource Generator
 *
 * Generates all React-Admin components for a resource.
 *
 * @see saaskit-ord
 */

import type { Resource } from '@saaskit/schema'
import type { GeneratedComponent, GeneratedResource } from '../types'
import { generateList } from './list'
import { generateShow } from './show'
import { generateEdit } from './edit'
import { generateCreate } from './create'

/**
 * Generate all React-Admin components for a resource
 *
 * @param resource - The resource from the schema
 * @returns Generated resource with all components
 */
export function generateResource(resource: Resource): GeneratedResource {
  const list = generateList(resource)
  const show = generateShow(resource)
  const edit = generateEdit(resource)
  const create = generateCreate(resource)

  // Collect all unique imports
  const allImports = new Set<string>()
  ;[list, show, edit, create].forEach((component) => {
    component.imports.forEach((imp) => allImports.add(imp))
  })

  return {
    name: resource.name,
    list,
    show,
    edit,
    create,
    imports: Array.from(allImports),
  }
}
