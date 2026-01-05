/**
 * View Annotation Parser
 *
 * Parses inline view annotations from schema definitions.
 * Supports @view annotations for view configuration and field-level
 * annotations like @label, @placeholder, @hidden, @readonly, etc.
 *
 * @module parsers/view-annotation
 */

/**
 * View configuration
 */
export interface ViewConfig {
  name: string
  type: 'list' | 'detail' | 'form' | 'card' | 'table'
  fields?: string[]
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  filters?: { field: string; operator: string; value?: unknown }[]
  groupBy?: string
  layout?: 'horizontal' | 'vertical' | 'grid'
  columns?: number
}

/**
 * Field view configuration
 */
export interface FieldViewConfig {
  visible?: boolean
  label?: string
  placeholder?: string
  readonly?: boolean
  hidden?: boolean
  format?: string
  width?: number | string
  component?: string
}

/**
 * Parse result
 */
export interface ViewAnnotationParseResult {
  success: boolean
  views?: ViewConfig[]
  fieldConfigs?: Record<string, FieldViewConfig>
  errors?: { message: string; line?: number }[]
}

const VALID_VIEW_TYPES = ['list', 'detail', 'form', 'card', 'table']
const KNOWN_ANNOTATIONS = ['view', 'label', 'placeholder', 'hidden', 'readonly', 'width', 'format', 'component']

/**
 * Parse view annotations from schema input
 */
export function parseViewAnnotations(input: string): ViewAnnotationParseResult {
  const errors: { message: string; line?: number }[] = []
  const views: ViewConfig[] = []
  const fieldConfigs: Record<string, FieldViewConfig> = {}

  if (!input.trim()) {
    return { success: false, errors: [{ message: 'Empty input' }] }
  }

  const lines = input.split('\n')
  let pendingFieldAnnotations: { type: string; value?: unknown; line: number }[] = []
  let viewCounter = 0

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1
    const line = lines[i].trim()

    if (!line) continue

    // Check for @view annotation
    const viewMatch = line.match(/^@view\s*\(\s*(['"])([^'"]+)\1/)
    if (viewMatch) {
      const viewType = viewMatch[2]

      if (!VALID_VIEW_TYPES.includes(viewType)) {
        errors.push({ message: `Invalid view type: ${viewType}`, line: lineNum })
        continue
      }

      // Parse the full annotation including options
      const fullAnnotation = extractFullAnnotation(lines, i)
      const viewConfig = parseViewConfig(fullAnnotation, viewType, viewCounter++, errors, lineNum)
      if (viewConfig) {
        views.push(viewConfig)
      }
      continue
    }

    // Check for field annotations
    const labelMatch = line.match(/^@label\s*\(\s*(['"])([^'"]+)\1\s*\)/)
    if (labelMatch) {
      pendingFieldAnnotations.push({ type: 'label', value: labelMatch[2], line: lineNum })
      continue
    }

    const placeholderMatch = line.match(/^@placeholder\s*\(\s*(['"])([^'"]+)\1\s*\)/)
    if (placeholderMatch) {
      pendingFieldAnnotations.push({ type: 'placeholder', value: placeholderMatch[2], line: lineNum })
      continue
    }

    if (line === '@hidden') {
      pendingFieldAnnotations.push({ type: 'hidden', value: true, line: lineNum })
      continue
    }

    if (line === '@readonly') {
      pendingFieldAnnotations.push({ type: 'readonly', value: true, line: lineNum })
      continue
    }

    const widthMatch = line.match(/^@width\s*\(\s*(?:(\d+)|(['"])([^'"]+)\2)\s*\)/)
    if (widthMatch) {
      const value = widthMatch[1] ? parseInt(widthMatch[1], 10) : widthMatch[3]
      pendingFieldAnnotations.push({ type: 'width', value, line: lineNum })
      continue
    }

    const formatMatch = line.match(/^@format\s*\(\s*(['"])([^'"]+)\1\s*\)/)
    if (formatMatch) {
      pendingFieldAnnotations.push({ type: 'format', value: formatMatch[2], line: lineNum })
      continue
    }

    const componentMatch = line.match(/^@component\s*\(\s*(['"])([^'"]+)\1\s*\)/)
    if (componentMatch) {
      pendingFieldAnnotations.push({ type: 'component', value: componentMatch[2], line: lineNum })
      continue
    }

    // Check for unknown annotation
    const unknownAnnotation = line.match(/^@(\w+)/)
    if (unknownAnnotation && !KNOWN_ANNOTATIONS.includes(unknownAnnotation[1])) {
      errors.push({ message: `Unknown annotation: @${unknownAnnotation[1]}`, line: lineNum })
      continue
    }

    // Check for unclosed annotation (missing closing quote)
    if (line.match(/^@view\s*\(\s*['"][^'"]*$/)) {
      errors.push({ message: 'Unclosed string in annotation', line: lineNum })
      continue
    }

    // Check for field definition
    const fieldMatch = line.match(/^(\w+)\s*:\s*(\w+)/)
    if (fieldMatch && pendingFieldAnnotations.length > 0) {
      const fieldName = fieldMatch[1]
      fieldConfigs[fieldName] = fieldConfigs[fieldName] || {}

      for (const annotation of pendingFieldAnnotations) {
        switch (annotation.type) {
          case 'label':
            fieldConfigs[fieldName].label = annotation.value as string
            break
          case 'placeholder':
            fieldConfigs[fieldName].placeholder = annotation.value as string
            break
          case 'hidden':
            fieldConfigs[fieldName].hidden = true
            break
          case 'readonly':
            fieldConfigs[fieldName].readonly = true
            break
          case 'width':
            fieldConfigs[fieldName].width = annotation.value as number | string
            break
          case 'format':
            fieldConfigs[fieldName].format = annotation.value as string
            break
          case 'component':
            fieldConfigs[fieldName].component = annotation.value as string
            break
        }
      }
      pendingFieldAnnotations = []
    }
  }

  return {
    success: errors.length === 0,
    views: views.length > 0 ? views : undefined,
    fieldConfigs: Object.keys(fieldConfigs).length > 0 ? fieldConfigs : undefined,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Extract full annotation that may span multiple lines
 */
function extractFullAnnotation(lines: string[], startIdx: number): string {
  let result = lines[startIdx]
  let parenCount = 0
  let inString = false
  let stringChar = ''

  for (const char of result) {
    if (!inString && (char === '"' || char === "'")) {
      inString = true
      stringChar = char
    } else if (inString && char === stringChar) {
      inString = false
    } else if (!inString) {
      if (char === '(') parenCount++
      if (char === ')') parenCount--
    }
  }

  // If parentheses are balanced, return
  if (parenCount === 0) return result

  // Otherwise, continue reading lines
  for (let i = startIdx + 1; i < lines.length && parenCount > 0; i++) {
    result += '\n' + lines[i]
    for (const char of lines[i]) {
      if (!inString && (char === '"' || char === "'")) {
        inString = true
        stringChar = char
      } else if (inString && char === stringChar) {
        inString = false
      } else if (!inString) {
        if (char === '(') parenCount++
        if (char === ')') parenCount--
      }
    }
  }

  return result
}

/**
 * Parse view configuration from annotation string
 */
function parseViewConfig(
  annotation: string,
  type: string,
  index: number,
  errors: { message: string; line?: number }[],
  lineNum: number
): ViewConfig | null {
  const config: ViewConfig = {
    name: `View${index}`,
    type: type as ViewConfig['type'],
  }

  // Parse name
  const nameMatch = annotation.match(/name\s*:\s*(['"])([^'"]+)\1/)
  if (nameMatch) {
    config.name = nameMatch[2]
  }

  // Parse fields array
  const fieldsMatch = annotation.match(/fields\s*:\s*\[([^\]]*)\]/)
  if (fieldsMatch) {
    const fieldsStr = fieldsMatch[1]
    const fields = fieldsStr.match(/['"]([^'"]+)['"]/g)
    if (fields) {
      config.fields = fields.map((f) => f.replace(/['"]/g, ''))
    }
  }

  // Parse sortBy
  const sortByMatch = annotation.match(/sortBy\s*:\s*(['"])([^'"]+)\1/)
  if (sortByMatch) {
    config.sortBy = sortByMatch[2]
  }

  // Parse sortDirection
  const sortDirMatch = annotation.match(/sortDirection\s*:\s*(['"])([^'"]+)\1/)
  if (sortDirMatch) {
    config.sortDirection = sortDirMatch[2] as 'asc' | 'desc'
  }

  // Parse groupBy
  const groupByMatch = annotation.match(/groupBy\s*:\s*(['"])([^'"]+)\1/)
  if (groupByMatch) {
    config.groupBy = groupByMatch[2]
  }

  // Parse layout
  const layoutMatch = annotation.match(/layout\s*:\s*(['"])([^'"]+)\1/)
  if (layoutMatch) {
    config.layout = layoutMatch[2] as 'horizontal' | 'vertical' | 'grid'
  }

  // Parse columns
  const columnsMatch = annotation.match(/columns\s*:\s*(\d+)/)
  if (columnsMatch) {
    config.columns = parseInt(columnsMatch[1], 10)
  }

  // Parse filters (simplified)
  const filtersMatch = annotation.match(/filters\s*:\s*\[([^\]]*)\]/)
  if (filtersMatch) {
    try {
      // Try to parse filter objects
      const filtersStr = filtersMatch[1]
      const filterObj = filtersStr.match(/\{\s*field\s*:\s*(['"])([^'"]+)\1[^}]*\}/)
      if (filterObj) {
        const field = filterObj[2]
        const operatorMatch = filtersStr.match(/operator\s*:\s*(['"])([^'"]+)\1/)
        const valueMatch = filtersStr.match(/value\s*:\s*(['"])([^'"]+)\1/)

        config.filters = [
          {
            field,
            operator: operatorMatch ? operatorMatch[2] : 'eq',
            value: valueMatch ? valueMatch[2] : undefined,
          },
        ]
      }
    } catch {
      // Ignore parse errors for filters
    }
  }

  return config
}
