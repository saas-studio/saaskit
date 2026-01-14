/**
 * YAML Schema Parser for SaaSKit
 *
 * Parses YAML schema files into the unified SaaSSchema AST.
 * Supports both shorthand and verbose YAML formats.
 *
 * This file re-exports from the modular parser/ directory for backwards compatibility.
 */

// Re-export all types
export type {
  ParsedAppMetadata,
  ParsedFieldModifiers,
  ParsedField,
  ParsedRelation,
  ParsedTimestamps,
  ParsedViewColumn,
  ParsedViewConfig,
  ParsedActionParam,
  ParsedAction,
  ParsedResource,
  ParsedShorthandResource,
  ParsedWorkflowState,
  ParsedWorkflowTransition,
  ParsedWorkflow,
  ParsedYamlSchema,
} from './parser'

// Re-export helper functions
export {
  isShorthandFormat,
  normalizeFieldType,
  parseShorthandField,
} from './parser'

// Re-export main parser functions
export { parseSchemaYaml, convertParsedToSchema } from './parser'
