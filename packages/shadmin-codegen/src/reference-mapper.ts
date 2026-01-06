/**
 * Reference Field Mapper
 *
 * Maps SaaSKit schema relations to React-Admin reference components.
 *
 * @see saaskit-uor, saaskit-2nq
 */

import type { Relation } from '@saaskit/schema'

// ============================================================================
// Types
// ============================================================================

export interface ReferenceMapping {
  /** Display component (ReferenceField or ReferenceManyField) */
  displayComponent: string
  /** Input component (ReferenceInput or null for hasMany) */
  inputComponent: string | null
  /** Child component inside reference (TextField, AutocompleteInput, Datagrid) */
  childComponent: string
  /** Props for the reference component */
  props: Record<string, unknown>
  /** Props for the child component */
  childProps?: Record<string, unknown>
  /** Generated JSX for display */
  displayOutput: string
  /** Generated JSX for input (null for hasMany) */
  inputOutput: string | null
  /** Required imports */
  imports: string[]
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Pluralize a resource name (simple English rules)
 */
function pluralize(name: string): string {
  const lower = name.toLowerCase()

  // Words ending in 's', 'x', 'z', 'ch', 'sh' add 'es'
  if (/(?:s|x|z|ch|sh)$/.test(lower)) {
    return lower + 'es'
  }

  // Words ending in consonant + 'y' change to 'ies'
  if (/[^aeiou]y$/.test(lower)) {
    return lower.slice(0, -1) + 'ies'
  }

  // Default: add 's'
  return lower + 's'
}

/**
 * Get the foreign key for a relation
 */
function getForeignKey(relation: Relation): string {
  if (relation.foreignKey) {
    return relation.foreignKey
  }
  // Default: relationName + 'Id'
  return relation.name + 'Id'
}

/**
 * Get the target field for hasMany relations
 */
function getTargetField(relation: Relation): string {
  if (relation.inverse) {
    return relation.inverse + 'Id'
  }
  // Default: guess based on relation name (needs parent context)
  return relation.name + 'Id'
}

/**
 * Format props as JSX attributes
 */
function formatProps(props: Record<string, unknown>): string {
  return Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`
      if (typeof value === 'boolean' && value) return key
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(' ')
}

// ============================================================================
// Main Mapper Function
// ============================================================================

/**
 * Maps a schema relation to React-Admin reference components
 *
 * @param relation - The relation from the schema
 * @returns Reference mapping with component names and props
 */
export function mapRelationType(relation: Relation): ReferenceMapping {
  const isBelongsTo = relation.cardinality === 'one'
  const resourceName = pluralize(relation.to)
  const imports: string[] = []

  if (isBelongsTo) {
    // belongsTo (cardinality: 'one') -> ReferenceField + ReferenceInput
    const foreignKey = getForeignKey(relation)
    const props: Record<string, unknown> = {
      source: foreignKey,
      reference: resourceName,
    }

    if (relation.required) {
      props.required = true
    }

    imports.push('ReferenceField', 'ReferenceInput', 'AutocompleteInput', 'TextField')

    const displayOutput = `<ReferenceField ${formatProps(props)}>
  <TextField source="name" />
</ReferenceField>`

    const inputOutput = `<ReferenceInput ${formatProps(props)}>
  <AutocompleteInput optionText="name" />
</ReferenceInput>`

    return {
      displayComponent: 'ReferenceField',
      inputComponent: 'ReferenceInput',
      childComponent: 'AutocompleteInput',
      props,
      childProps: { optionText: 'name' },
      displayOutput,
      inputOutput,
      imports,
    }
  } else {
    // hasMany (cardinality: 'many') -> ReferenceManyField (read-only)
    const targetField = getTargetField(relation)
    const props: Record<string, unknown> = {
      reference: resourceName,
      target: targetField,
    }

    imports.push('ReferenceManyField', 'Datagrid', 'TextField')

    const displayOutput = `<ReferenceManyField ${formatProps(props)}>
  <Datagrid>
    <TextField source="name" />
  </Datagrid>
</ReferenceManyField>`

    return {
      displayComponent: 'ReferenceManyField',
      inputComponent: null,
      childComponent: 'Datagrid',
      props,
      displayOutput,
      inputOutput: null,
      imports,
    }
  }
}
