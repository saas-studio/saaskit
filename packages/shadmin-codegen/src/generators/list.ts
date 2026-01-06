/**
 * List Component Generator
 *
 * Generates Shadmin/React-Admin List components from schema resources.
 *
 * @see saaskit-16q, saaskit-47c
 */

import type { Resource, Field } from '@saaskit/schema'
import type { GeneratedComponent } from '../types'
import { mapFieldType } from '../field-mapper'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the appropriate field component for list display
 */
function getFieldComponent(field: Field): string {
  const mapping = mapFieldType(field)
  return mapping.listComponent
}

/**
 * Get additional props for a field
 */
function getFieldProps(field: Field): Record<string, unknown> {
  const props: Record<string, unknown> = {
    source: field.name,
  }

  // Add label from description
  if (field.annotations?.description) {
    props.label = field.annotations.description
  }

  // Add showTime for datetime
  if (field.type === 'datetime') {
    props.showTime = true
  }

  return props
}

/**
 * Format props as JSX attributes
 */
function formatProps(props: Record<string, unknown>): string {
  return Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`
      }
      if (typeof value === 'boolean' && value) {
        return key
      }
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(' ')
}

/**
 * Check if field should be shown in list
 */
function shouldShowInList(field: Field): boolean {
  // Skip hidden fields
  if (field.annotations?.hidden) {
    return false
  }
  // Skip id/uuid fields (or limit to one)
  if (field.type === 'uuid' && field.name === 'id') {
    return false
  }
  return true
}

/**
 * Check if field is filterable
 */
function isFilterable(field: Field): boolean {
  return ['string', 'email', 'enum'].includes(field.type)
}

/**
 * Generate filter input for a field
 */
function generateFilterInput(field: Field, isFirst: boolean): string {
  const props: Record<string, unknown> = { source: field.name }

  if (isFirst) {
    props.alwaysOn = true
  }

  if (field.type === 'enum') {
    const choices = (field.annotations?.enumValues || []).map((v: string) => ({
      id: v,
      name: v,
    }))
    return `<SelectInput ${formatProps(props)} choices={${JSON.stringify(choices)}} />`
  }

  return `<TextInput ${formatProps(props)} />`
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generates a List component for a resource
 *
 * @param resource - The resource from the schema
 * @returns Generated component with code, imports, and metadata
 */
export function generateList(resource: Resource): GeneratedComponent {
  const componentName = `${resource.name}List`
  const imports = new Set<string>(['List', 'Datagrid', 'EditButton', 'BulkDeleteButton'])

  // Get visible fields
  const visibleFields = resource.fields.filter(shouldShowInList)

  // Get filterable fields
  const filterableFields = resource.fields.filter(isFilterable)

  // Check for createdAt field for default sort
  const hasCreatedAt = resource.fields.some((f) => f.name === 'createdAt')

  // Generate field columns
  const columns: string[] = []
  for (const field of visibleFields) {
    const component = getFieldComponent(field)
    const props = getFieldProps(field)
    imports.add(component)
    columns.push(`      <${component} ${formatProps(props)} />`)
  }
  columns.push('      <EditButton />')

  // Generate filters
  const filters: string[] = []
  let isFirst = true
  for (const field of filterableFields) {
    filters.push(generateFilterInput(field, isFirst))
    isFirst = false
    if (field.type === 'enum') {
      imports.add('SelectInput')
    } else {
      imports.add('TextInput')
    }
  }

  // Build filters array JSX
  const filtersJsx =
    filters.length > 0
      ? `[\n    ${filters.join(',\n    ')}\n  ]`
      : '[]'

  // Build sort prop
  const sortProp = hasCreatedAt
    ? `sort={{ field: 'createdAt', order: 'DESC' }}`
    : ''

  // Build the component code
  const code = `export const ${componentName} = () => (
  <List
    filters=${filtersJsx}
    ${sortProp}
    empty={<Empty />}
  >
    <Datagrid rowClick="edit" bulkActionButtons={<BulkDeleteButton />}>
${columns.join('\n')}
    </Datagrid>
  </List>
)`

  // Add Empty component import
  imports.add('Empty')

  return {
    name: componentName,
    code,
    imports: Array.from(imports),
    filePath: `${resource.name}/${componentName}.tsx`,
  }
}
