/**
 * Relation Handling
 *
 * Functions for adding inverse relations and validating relation targets.
 */

import type { Resource } from '../types'

/**
 * Add inverse relations based on the inverse property
 */
export function addInverseRelations(resources: Resource[]): void {
  const resourceMap = new Map<string, Resource>()
  for (const resource of resources) {
    resourceMap.set(resource.name, resource)
  }

  for (const resource of resources) {
    for (const relation of resource.relations) {
      if (relation.inverse && relation.cardinality === 'one') {
        const targetResource = resourceMap.get(relation.to)
        if (targetResource) {
          // Check if inverse already exists
          const existingInverse = targetResource.relations.find(
            (r) => r.name === relation.inverse
          )
          if (!existingInverse) {
            targetResource.relations.push({
              name: relation.inverse!,
              to: resource.name,
              cardinality: 'many',
            })
          }
        }
      }
    }
  }
}

/**
 * Validate that all relation targets exist (only if validation is enabled)
 */
export function validateRelations(
  resources: Resource[],
  strict: boolean = false
): void {
  if (!strict) return // Skip validation by default for flexibility

  const resourceNames = new Set(resources.map((r) => r.name))

  for (const resource of resources) {
    for (const relation of resource.relations) {
      if (!resourceNames.has(relation.to)) {
        throw new Error(
          `Resource "${resource.name}" has relation to non-existent resource "${relation.to}"`
        )
      }
    }
  }
}
