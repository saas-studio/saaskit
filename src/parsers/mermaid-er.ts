/**
 * Mermaid ER Diagram Parser
 *
 * Parses Mermaid ER (Entity-Relationship) diagrams into Schema AST.
 *
 * @module parsers/mermaid-er
 */

import {
  type AppNode,
  type ResourceNode,
  type FieldNode,
  type FieldType,
  type ParseResult,
  type ParseError,
  createAppNode,
  createResourceNode,
  createFieldNode,
} from '../schema/ast'

/**
 * Relationship cardinality
 */
interface Relationship {
  from: string
  to: string
  fromCardinality: 'one' | 'many'
  toCardinality: 'one' | 'many'
  label?: string
}

/**
 * Entity definition from parsing
 */
interface EntityDef {
  name: string
  fields: FieldNode[]
}

/**
 * Parse a Mermaid ER diagram into a Schema AST
 */
export function parseMermaidER(input: string, appName: string = 'app'): ParseResult {
  const errors: ParseError[] = []
  const entities: Map<string, EntityDef> = new Map()
  const relationships: Relationship[] = []

  const lines = input.split('\n')
  let inEntity = false
  let currentEntity: string | null = null
  let currentFields: FieldNode[] = []

  // Check for erDiagram directive
  const hasDirective = lines.some((line) => line.trim().toLowerCase().startsWith('erdiagram'))
  if (!hasDirective) {
    return {
      success: false,
      errors: [{ message: 'Missing erDiagram directive' }],
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1
    let line = lines[i]

    // Remove comments
    const commentIdx = line.indexOf('%%')
    if (commentIdx !== -1) {
      line = line.substring(0, commentIdx)
    }

    line = line.trim()
    if (!line) continue

    // Skip directive
    if (line.toLowerCase().startsWith('erdiagram')) continue

    // Check for relationship line
    const relMatch = parseRelationship(line)
    if (relMatch) {
      relationships.push(relMatch)
      continue
    }

    // Check for entity start
    const entityStart = line.match(/^(\w+)\s*\{/)
    if (entityStart) {
      if (inEntity) {
        // Save previous entity
        entities.set(currentEntity!, { name: currentEntity!, fields: currentFields })
      }
      currentEntity = entityStart[1]
      currentFields = []
      inEntity = true
      continue
    }

    // Check for entity end
    if (line === '}') {
      if (inEntity && currentEntity) {
        entities.set(currentEntity, { name: currentEntity, fields: currentFields })
      }
      inEntity = false
      currentEntity = null
      currentFields = []
      continue
    }

    // Parse field inside entity
    if (inEntity && currentEntity) {
      const field = parseField(line, lineNum, errors)
      if (field) {
        currentFields.push(field)
      }
    }
  }

  // Handle unclosed entity
  if (inEntity && currentEntity) {
    entities.set(currentEntity, { name: currentEntity, fields: currentFields })
  }

  // Create resources from entities
  const resources: ResourceNode[] = []
  for (const [name, entity] of entities) {
    resources.push(createResourceNode(name, entity.fields))
  }

  // Add relation fields from relationships
  for (const rel of relationships) {
    // Ensure both entities exist
    if (!entities.has(rel.from)) {
      entities.set(rel.from, { name: rel.from, fields: [] })
      resources.push(createResourceNode(rel.from, []))
    }
    if (!entities.has(rel.to)) {
      entities.set(rel.to, { name: rel.to, fields: [] })
      resources.push(createResourceNode(rel.to, []))
    }

    // Add relation field to the "many" side pointing to "one" side
    if (rel.toCardinality === 'many') {
      const targetResource = resources.find((r) => r.name === rel.to)
      if (targetResource) {
        const fieldName = rel.from.toLowerCase() + 'Id'
        // Check if field doesn't already exist
        if (!targetResource.fields.some((f) => f.name === fieldName)) {
          targetResource.fields.push(
            createFieldNode(fieldName, 'relation', { target: rel.from })
          )
        }
      }
    }
    if (rel.fromCardinality === 'many') {
      const targetResource = resources.find((r) => r.name === rel.from)
      if (targetResource) {
        const fieldName = rel.to.toLowerCase() + 'Id'
        if (!targetResource.fields.some((f) => f.name === fieldName)) {
          targetResource.fields.push(
            createFieldNode(fieldName, 'relation', { target: rel.to })
          )
        }
      }
    }
  }

  if (resources.length === 0 && input.trim().length > 0) {
    return {
      success: false,
      errors: [{ message: 'No entities found in diagram' }],
    }
  }

  const ast = createAppNode(appName, resources)

  return {
    success: errors.length === 0,
    ast,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Parse a relationship line
 */
function parseRelationship(line: string): Relationship | null {
  // Match patterns like: Entity1 ||--o{ Entity2 : label
  // Cardinality symbols: || (one), |o (zero or one), }| (one), }o (zero or one), o{ (zero or more), |{ (one or more)
  const relPattern = /^(\w+)\s*([|o}]+)--([|o{]+)\s*(\w+)\s*(?::\s*(.+))?$/
  const match = line.match(relPattern)

  if (!match) return null

  const [, from, leftCard, rightCard, to, label] = match

  return {
    from,
    to,
    fromCardinality: leftCard.includes('{') || leftCard.includes('}') ? 'many' : 'one',
    toCardinality: rightCard.includes('{') || rightCard.includes('}') ? 'many' : 'one',
    label: label?.trim(),
  }
}

/**
 * Parse a field definition line
 */
function parseField(line: string, lineNum: number, errors: ParseError[]): FieldNode | null {
  // Match: type name [modifiers]
  // Examples: string name, int age PK, string email UK
  const fieldPattern = /^(\w+)\s+(\w+)(?:\s+(.*))?$/
  const match = line.match(fieldPattern)

  if (!match) {
    errors.push({ message: `Invalid field syntax: ${line}`, line: lineNum })
    return null
  }

  const [, typeStr, name, modifiersStr] = match

  // Parse type
  const typeInfo = mapMermaidType(typeStr)

  // Parse modifiers
  const modifiers: FieldNode['modifiers'] = {}
  if (typeInfo.decimal) {
    modifiers.decimal = true
  }

  if (modifiersStr) {
    const mods = modifiersStr.toUpperCase().split(/\s+/)
    for (const mod of mods) {
      switch (mod) {
        case 'PK':
          modifiers.primary = true
          modifiers.required = true
          break
        case 'FK':
          // FK makes this a relation - handled specially
          return createFieldNode(name, 'relation', { modifiers })
        case 'UK':
          modifiers.unique = true
          break
        case 'NOT':
        case 'NULL':
          // Handle "NOT NULL" as required
          if (mods.includes('NOT') && mods.includes('NULL')) {
            modifiers.required = true
          }
          break
      }
    }
  }

  return createFieldNode(name, typeInfo.type, { modifiers })
}

/**
 * Map Mermaid ER types to Schema AST types
 */
function mapMermaidType(mermaidType: string): { type: FieldType; decimal?: boolean } {
  const lower = mermaidType.toLowerCase()

  switch (lower) {
    case 'string':
    case 'varchar':
    case 'text':
    case 'char':
      return { type: 'text' }

    case 'int':
    case 'integer':
    case 'bigint':
    case 'smallint':
    case 'tinyint':
      return { type: 'number' }

    case 'float':
    case 'double':
    case 'decimal':
    case 'numeric':
    case 'real':
      return { type: 'number', decimal: true }

    case 'boolean':
    case 'bool':
    case 'bit':
      return { type: 'boolean' }

    case 'date':
    case 'datetime':
    case 'timestamp':
    case 'time':
      return { type: 'date' }

    case 'email':
      return { type: 'email' }

    case 'json':
    case 'jsonb':
      return { type: 'json' }

    default:
      return { type: 'text' }
  }
}
