/**
 * Workflow Parser
 *
 * Functions for parsing workflow definitions from YAML into Workflow objects.
 */

import type { Workflow, WorkflowState, WorkflowTransition } from '../types'
import type { ParsedWorkflow } from './types'

/**
 * Parse workflows from YAML
 */
export function parseWorkflows(
  rawWorkflows: ParsedWorkflow[] | undefined
): Workflow[] | undefined {
  if (!rawWorkflows || rawWorkflows.length === 0) {
    return undefined
  }

  return rawWorkflows.map((w) => ({
    name: w.name,
    resource: w.resource,
    stateField: w.stateField,
    description: w.description,
    states: w.states.map((s) => ({
      name: s.name,
      description: s.description,
      initial: s.initial,
      final: s.final,
      onEnter: s.onEnter,
      onExit: s.onExit,
    })) as WorkflowState[],
    transitions: w.transitions.map((t) => ({
      name: t.name,
      from: t.from,
      to: t.to,
      trigger: t.trigger,
      condition: t.condition,
      actions: t.actions,
      permissions: t.permissions,
    })) as WorkflowTransition[],
  }))
}
