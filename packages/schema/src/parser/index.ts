/**
 * YAML Parser Module
 *
 * Re-exports all parser functionality for a clean module interface.
 */

// Types
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
} from './types'

// Constants
export {
  VALID_FIELD_TYPES,
  AUTO_TIMESTAMP_FIELDS,
  isAutoTimestampField,
} from './constants'

// Helpers
export {
  isShorthandFormat,
  normalizeFieldType,
  isEnumDefinition,
  isRelationDefinition,
} from './helpers'

// Field parsing
export { parseShorthandField, parseObjectField } from './field-parser'

// Resource parsing
export { parseVerboseResource, parseShorthandResource } from './resource-parser'

// Workflow parsing
export { parseWorkflows } from './workflow-parser'

// Relation handling
export { addInverseRelations, validateRelations } from './relations'

// Main parser functions
export { parseSchemaYaml, convertParsedToSchema } from './schema-parser'
