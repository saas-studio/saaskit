/**
 * Mermaid State Diagram Parser
 *
 * Parses Mermaid state diagrams to extract states for select fields.
 *
 * @module parsers/mermaid-state
 */

/**
 * State parse result
 */
export interface StateParseResult {
  success: boolean
  states?: string[]
  transitions?: { from: string; to: string; label?: string }[]
  errors?: { message: string; line?: number }[]
}

/**
 * Select field configuration derived from states
 */
export interface SelectFieldConfig {
  name: string
  values: string[]
  default?: string
}

/**
 * Parse a Mermaid state diagram
 */
export function parseMermaidState(input: string): StateParseResult {
  const errors: { message: string; line?: number }[] = []
  const states: Set<string> = new Set()
  const transitions: { from: string; to: string; label?: string }[] = []

  if (!input.trim()) {
    return {
      success: false,
      errors: [{ message: 'Empty input' }],
    }
  }

  const lines = input.split('\n')

  // Check for stateDiagram directive
  const hasDirective = lines.some(
    (line) =>
      line.trim().toLowerCase().startsWith('statediagram') ||
      line.trim().toLowerCase().startsWith('statediagram-v2')
  )

  if (!hasDirective) {
    return {
      success: false,
      errors: [{ message: 'Missing stateDiagram directive' }],
    }
  }

  let inNote = false
  let inCompositeState = false
  let compositePrefix = ''
  const pseudoStates: Set<string> = new Set() // Track choice, fork, join pseudo-states

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

    // Skip directives
    if (line.toLowerCase().startsWith('statediagram')) continue

    // Handle notes
    if (line.toLowerCase().startsWith('note ')) {
      inNote = true
      continue
    }
    if (line.toLowerCase() === 'end note') {
      inNote = false
      continue
    }
    if (inNote) continue

    // Handle composite state start
    const compositeMatch = line.match(/^state\s+(\w+)\s*\{/)
    if (compositeMatch) {
      inCompositeState = true
      compositePrefix = compositeMatch[1] + '.'
      states.add(compositeMatch[1])
      continue
    }

    // Handle composite state end
    if (line === '}' && inCompositeState) {
      inCompositeState = false
      compositePrefix = ''
      continue
    }

    // Skip pseudo-states (choice, fork, join) but track their names
    const pseudoMatch = line.match(/^state\s+(\w+)\s+<<(choice|fork|join)>>/)
    if (pseudoMatch) {
      pseudoStates.add(pseudoMatch[1])
      continue
    }

    // Handle state description: StateName: description
    const stateDescMatch = line.match(/^(\w+)\s*:\s*.+$/)
    if (stateDescMatch) {
      const stateName = inCompositeState ? compositePrefix + stateDescMatch[1] : stateDescMatch[1]
      states.add(stateName)
      continue
    }

    // Parse transitions: State1 --> State2 : label
    // Support alphanumeric, underscore, and hyphen in state names
    const transitionMatch = line.match(/^(\[?\*?\]?|[\w-]+)\s*-->\s*(\[?\*?\]?|[\w-]+)(?:\s*:\s*(.+))?$/)
    if (transitionMatch) {
      let [, from, to, label] = transitionMatch

      // Skip start/end markers but extract states
      const isFromMarker = from === '[*]'
      const isToMarker = to === '[*]'
      const isFromPseudo = pseudoStates.has(from)
      const isToPseudo = pseudoStates.has(to)

      if (!isFromMarker && !isFromPseudo) {
        const fromState = inCompositeState ? compositePrefix + from : from
        states.add(fromState)
      }
      if (!isToMarker && !isToPseudo) {
        const toState = inCompositeState ? compositePrefix + to : to
        states.add(toState)
      }

      // Record transition (excluding markers)
      if (!isFromMarker && !isToMarker) {
        transitions.push({
          from: inCompositeState ? compositePrefix + from : from,
          to: inCompositeState ? compositePrefix + to : to,
          label: label?.trim(),
        })
      } else if (!isFromMarker) {
        // Transition from state to end
        transitions.push({
          from: inCompositeState ? compositePrefix + from : from,
          to: '[*]',
          label: label?.trim(),
        })
      } else if (!isToMarker) {
        // Transition from start to state
        transitions.push({
          from: '[*]',
          to: inCompositeState ? compositePrefix + to : to,
          label: label?.trim(),
        })
      }

      continue
    }
  }

  // Convert set to array, preserving order of first appearance
  const statesArray = Array.from(states)

  // If we have no states and no transitions, and input had content, it's likely invalid
  if (statesArray.length === 0 && transitions.length === 0) {
    errors.push({ message: 'No valid states or transitions found' })
  }

  return {
    success: errors.length === 0,
    states: statesArray,
    transitions,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Convert parsed states to a select field configuration
 */
export function stateToSelectField(
  result: StateParseResult,
  fieldName: string
): SelectFieldConfig | null {
  if (!result.success || !result.states || result.states.length === 0) {
    return null
  }

  // Find the first state (state that comes from [*])
  let defaultState = result.states[0]

  // Look for a transition from [*] to determine the initial state
  const initialTransition = result.transitions?.find((t) => t.from === '[*]')
  if (initialTransition) {
    defaultState = initialTransition.to
  }

  return {
    name: fieldName,
    values: result.states,
    default: defaultState,
  }
}
