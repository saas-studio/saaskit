/**
 * Resource Parser
 *
 * Functions for parsing resource definitions from YAML into Resource objects.
 */

import type { Resource, Field, Relation, ViewConfig, Action } from '../types'
import type { ParsedResource, ParsedShorthandResource } from './types'
import { parseShorthandField, parseObjectField } from './field-parser'

/**
 * Parse a verbose resource definition (array format)
 */
export function parseVerboseResource(
  raw: ParsedResource,
  resourceNames: Set<string>
): Resource {
  const fields: Field[] = []
  const relations: Relation[] = []

  // Parse fields array
  if (Array.isArray(raw.fields)) {
    for (const fieldDef of raw.fields) {
      const { field, relation } = parseObjectField(
        fieldDef.name,
        fieldDef as unknown as Record<string, unknown>
      )
      if (field) {
        fields.push(field)
      }
      if (relation) {
        relations.push(relation)
      }
    }
  }

  // Parse explicit relations
  if (Array.isArray(raw.relations)) {
    for (const rel of raw.relations) {
      relations.push({
        name: rel.name,
        to: rel.to,
        cardinality: rel.cardinality || 'one',
        foreignKey: rel.foreignKey,
        required: rel.required,
        inverse: rel.inverse,
        onDelete: rel.onDelete,
      })
    }
  }

  return {
    name: raw.name,
    pluralName: raw.pluralName,
    description: raw.description,
    fields,
    relations,
    timestamps: raw.timestamps,
    views: raw.views as ViewConfig[] | undefined,
    actions: raw.actions as Action[] | undefined,
  }
}

/**
 * Parse a shorthand resource definition (object format)
 */
export function parseShorthandResource(
  name: string,
  resourceDef: ParsedShorthandResource,
  resourceNames: Set<string>
): Resource {
  const fields: Field[] = []
  const relations: Relation[] = []

  // Check if this is actually a verbose format with a "fields" key
  if (resourceDef.fields && typeof resourceDef.fields === 'object') {
    // This is nested fields format (project-tracker style)
    const fieldsObj = resourceDef.fields as Record<string, unknown>
    for (const [fieldName, fieldDef] of Object.entries(fieldsObj)) {
      const { field, relation } = parseShorthandField(
        fieldName,
        fieldDef as string | Record<string, unknown>
      )
      if (field) {
        fields.push(field)
      }
      if (relation) {
        relations.push(relation)
      }
    }
    return {
      name,
      fields,
      relations,
    }
  }

  // Pure shorthand format (todo style)
  for (const [fieldName, fieldValue] of Object.entries(resourceDef)) {
    const { field, relation } = parseShorthandField(
      fieldName,
      fieldValue as string | Record<string, unknown>
    )
    if (field) {
      fields.push(field)
    }
    if (relation) {
      relations.push(relation)
    }
  }

  return {
    name,
    fields,
    relations,
  }
}
