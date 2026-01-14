/**
 * Schema Parser
 *
 * Main entry point for parsing YAML schema strings into the unified SaaSSchema AST.
 */

import { parse as parseYaml } from 'yaml'
import type { SaaSSchema, SchemaMetadata, Resource, Action } from '../types'
import type { ParsedYamlSchema } from './types'
import { parseVerboseResource, parseShorthandResource } from './resource-parser'
import { parseWorkflows } from './workflow-parser'
import { addInverseRelations, validateRelations } from './relations'

/**
 * Parse a YAML schema string into the unified SaaSSchema AST
 */
export function parseSchemaYaml(yamlString: string): SaaSSchema {
  // Parse YAML
  let parsed: ParsedYamlSchema
  try {
    parsed = parseYaml(yamlString) as ParsedYamlSchema
  } catch (e) {
    throw new Error(`Invalid YAML syntax: ${(e as Error).message}`)
  }

  // Extract metadata
  const rawMetadata = parsed.app || parsed.metadata
  if (!rawMetadata) {
    throw new Error('Schema must have either "app" or "metadata" section')
  }
  if (!rawMetadata.name) {
    throw new Error('Schema metadata must have a "name" field')
  }
  if (!rawMetadata.version) {
    throw new Error('Schema metadata must have a "version" field')
  }

  const metadata: SchemaMetadata = {
    name: rawMetadata.name,
    version: String(rawMetadata.version),
    description: rawMetadata.description,
    author: rawMetadata.author,
    license: rawMetadata.license,
  }

  // Parse resources (optional for metadata-only schemas)
  const resources: Resource[] = []
  const resourceNames = new Set<string>()

  if (parsed.resources) {
    if (Array.isArray(parsed.resources)) {
      // Verbose array format
      for (const raw of parsed.resources) {
        if (resourceNames.has(raw.name)) {
          throw new Error(`Duplicate resource name: ${raw.name}`)
        }
        resourceNames.add(raw.name)
      }
      for (const raw of parsed.resources) {
        resources.push(parseVerboseResource(raw, resourceNames))
      }
    } else if (typeof parsed.resources === 'object') {
      // Shorthand object format
      const keys = Object.keys(parsed.resources)
      for (const name of keys) {
        if (resourceNames.has(name)) {
          throw new Error(`Duplicate resource name: ${name}`)
        }
        resourceNames.add(name)
      }
      for (const [name, resourceDef] of Object.entries(parsed.resources)) {
        resources.push(parseShorthandResource(name, resourceDef, resourceNames))
      }
    }
  }

  // Add inverse relations
  addInverseRelations(resources)

  // Validate relations
  validateRelations(resources)

  // Parse workflows
  const workflows = parseWorkflows(parsed.workflows)

  return {
    metadata,
    resources,
    workflows,
    globalActions: parsed.globalActions as Action[] | undefined,
  }
}

/**
 * Helper function to convert parsed YAML to SaaSSchema
 * (Alias for parseSchemaYaml for backwards compatibility)
 */
export function convertParsedToSchema(parsed: ParsedYamlSchema): SaaSSchema {
  // Re-serialize and parse (simple approach)
  // This is for when you already have a parsed object
  const metadata = parsed.app || parsed.metadata
  if (!metadata) {
    throw new Error('Schema must have either "app" or "metadata" section')
  }

  return {
    metadata: {
      name: metadata.name,
      version: String(metadata.version),
      description: metadata.description,
      author: metadata.author,
      license: metadata.license,
    },
    resources: [],
    workflows: parseWorkflows(parsed.workflows),
  }
}
