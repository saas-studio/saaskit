/**
 * Show Component Generator
 *
 * @see saaskit-ezr, saaskit-5n0
 */

import type { Resource, Field } from '@saaskit/schema'
import type { GeneratedComponent } from '../types'
import { mapFieldType } from '../field-mapper'

function getFieldProps(field: Field): Record<string, unknown> {
  const props: Record<string, unknown> = { source: field.name }
  if (field.annotations?.description) {
    props.label = field.annotations.description
  }
  if (field.type === 'datetime') {
    props.showTime = true
  }
  return props
}

function formatProps(props: Record<string, unknown>): string {
  return Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`
      if (typeof value === 'boolean' && value) return key
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(' ')
}

export function generateShow(resource: Resource): GeneratedComponent {
  const componentName = `${resource.name}Show`
  const imports = new Set<string>(['Show', 'SimpleShowLayout'])

  const fields: string[] = []
  for (const field of resource.fields) {
    const mapping = mapFieldType(field)
    const component = mapping.showComponent
    const props = getFieldProps(field)
    imports.add(component)
    fields.push(`      <${component} ${formatProps(props)} />`)
  }

  const code = `export const ${componentName} = () => (
  <Show>
    <SimpleShowLayout>
${fields.join('\n')}
    </SimpleShowLayout>
  </Show>
)`

  return {
    name: componentName,
    code,
    imports: Array.from(imports),
    filePath: `${resource.name}/${componentName}.tsx`,
  }
}
