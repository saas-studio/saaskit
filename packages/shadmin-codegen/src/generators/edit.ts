/**
 * Edit Component Generator
 *
 * @see saaskit-81k, saaskit-afp
 */

import type { Resource, Field } from '@saaskit/schema'
import type { GeneratedComponent } from '../types'
import { mapFieldType } from '../field-mapper'

function getInputProps(field: Field): Record<string, unknown> {
  const mapping = mapFieldType(field, { isEdit: true })
  const props: Record<string, unknown> = { source: field.name }

  if (field.annotations?.description) {
    props.helperText = field.annotations.description
  }
  if (field.required) {
    props.required = true
  }
  if (field.type === 'uuid' || field.annotations?.primaryKey) {
    props.disabled = true
  }
  if (field.type === 'enum') {
    const choices = (field.annotations?.enumValues || []).map((v: string) => ({ id: v, name: v }))
    props.choices = choices
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

export function generateEdit(resource: Resource): GeneratedComponent {
  const componentName = `${resource.name}Edit`
  const imports = new Set<string>(['Edit', 'SimpleForm'])

  const inputs: string[] = []
  for (const field of resource.fields) {
    const mapping = mapFieldType(field, { isEdit: true })
    const component = mapping.inputComponent
    const props = getInputProps(field)
    imports.add(component)
    inputs.push(`      <${component} ${formatProps(props)} />`)
  }

  const code = `export const ${componentName} = () => (
  <Edit>
    <SimpleForm>
${inputs.join('\n')}
    </SimpleForm>
  </Edit>
)`

  return {
    name: componentName,
    code,
    imports: Array.from(imports),
    filePath: `${resource.name}/${componentName}.tsx`,
  }
}
