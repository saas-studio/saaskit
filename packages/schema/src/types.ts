/**
 * Schema AST Types for SaaSKit
 *
 * These types define the unified AST for parsing Mermaid diagrams
 * and powering code generation for API, SDK, TUI, and MCP servers.
 */

// ============================================================================
// Primitive Types
// ============================================================================

/**
 * Supported field types in the schema
 */
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'uuid'
  | 'email'
  | 'url'
  | 'json'
  | 'array'
  | 'enum';

/**
 * Cardinality of a relationship
 */
export type Cardinality = 'one' | 'many';

/**
 * View types for UI rendering
 */
export type ViewType = 'list' | 'grid' | 'kanban' | 'calendar' | 'table' | 'detail';

/**
 * Trigger types for workflow transitions
 */
export type TriggerType = 'manual' | 'automatic' | 'scheduled' | 'webhook';

// ============================================================================
// Field Definition
// ============================================================================

/**
 * Annotations that can be applied to fields
 */
export interface FieldAnnotations {
  /** Field is the primary key */
  primaryKey?: boolean;
  /** Field is unique across all records */
  unique?: boolean;
  /** Field is indexed for faster queries */
  indexed?: boolean;
  /** Field is searchable in full-text search */
  searchable?: boolean;
  /** Field is hidden from API responses */
  hidden?: boolean;
  /** Field is read-only */
  readonly?: boolean;
  /** Custom validation regex pattern */
  pattern?: string;
  /** Minimum value (for numbers) or length (for strings) */
  min?: number;
  /** Maximum value (for numbers) or length (for strings) */
  max?: number;
  /** Enum values if type is 'enum' */
  enumValues?: string[];
  /** Array item type if type is 'array' */
  arrayType?: FieldType;
}

/**
 * Field definition within a resource
 */
export interface Field {
  /** Field name (camelCase) */
  name: string;
  /** Field data type */
  type: FieldType;
  /** Whether the field is required */
  required: boolean;
  /** Default value for the field */
  default?: unknown;
  /** Human-readable description */
  description?: string;
  /** Field annotations for validation and behavior */
  annotations?: FieldAnnotations;
}

// ============================================================================
// Relation Definition
// ============================================================================

/**
 * Relationship between resources
 */
export interface Relation {
  /** Name of the relation (e.g., 'author', 'posts') */
  name: string;
  /** Target resource name */
  to: string;
  /** Cardinality of the relationship */
  cardinality: Cardinality;
  /** Foreign key field name (optional, defaults to `${to}Id`) */
  foreignKey?: string;
  /** Whether the relation is required */
  required?: boolean;
  /** Inverse relation name on the target resource */
  inverse?: string;
  /** Cascade behavior on delete */
  onDelete?: 'cascade' | 'setNull' | 'restrict' | 'noAction';
}

// ============================================================================
// Resource Definition
// ============================================================================

/**
 * Resource (entity) definition
 */
export interface Resource {
  /** Resource name (PascalCase) */
  name: string;
  /** Human-readable plural name */
  pluralName?: string;
  /** Human-readable description */
  description?: string;
  /** Fields belonging to this resource */
  fields: Field[];
  /** Relations to other resources */
  relations: Relation[];
  /** Actions (API endpoints) for this resource */
  actions?: Action[];
  /** View configuration for UI rendering */
  views?: ViewConfig[];
  /** Timestamps configuration */
  timestamps?: {
    createdAt?: boolean;
    updatedAt?: boolean;
    deletedAt?: boolean; // soft delete
  };
}

// ============================================================================
// Action Definition
// ============================================================================

/**
 * Parameter definition for an action
 */
export interface ActionParam {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: FieldType | string; // string allows custom types
  /** Whether the parameter is required */
  required: boolean;
  /** Default value */
  default?: unknown;
  /** Human-readable description */
  description?: string;
}

/**
 * Action (API endpoint) definition
 */
export interface Action {
  /** Action name (camelCase) */
  name: string;
  /** Human-readable description */
  description?: string;
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Input parameters */
  params?: ActionParam[];
  /** Return type (resource name or primitive) */
  returns?: string;
  /** Whether this action returns an array */
  returnsArray?: boolean;
  /** Whether authentication is required */
  authenticated?: boolean;
  /** Required permissions/roles */
  permissions?: string[];
}

// ============================================================================
// Workflow Definition
// ============================================================================

/**
 * Workflow state definition
 */
export interface WorkflowState {
  /** State name */
  name: string;
  /** Human-readable description */
  description?: string;
  /** Whether this is the initial state */
  initial?: boolean;
  /** Whether this is a final state */
  final?: boolean;
  /** Actions to execute on entering this state */
  onEnter?: string[];
  /** Actions to execute on exiting this state */
  onExit?: string[];
}

/**
 * Workflow transition definition
 */
export interface WorkflowTransition {
  /** Transition name */
  name: string;
  /** Source state name */
  from: string;
  /** Target state name */
  to: string;
  /** Trigger type */
  trigger: TriggerType;
  /** Condition expression for automatic triggers */
  condition?: string;
  /** Actions to execute during transition */
  actions?: string[];
  /** Required permissions to execute this transition */
  permissions?: string[];
}

/**
 * Workflow (state machine) definition
 */
export interface Workflow {
  /** Workflow name */
  name: string;
  /** Resource this workflow applies to */
  resource: string;
  /** Field that stores the current state */
  stateField?: string;
  /** Human-readable description */
  description?: string;
  /** Workflow states */
  states: WorkflowState[];
  /** Workflow transitions */
  transitions: WorkflowTransition[];
}

// ============================================================================
// View Configuration
// ============================================================================

/**
 * Column configuration for list/table views
 */
export interface ViewColumn {
  /** Field name to display */
  field: string;
  /** Custom header label */
  label?: string;
  /** Column width */
  width?: number | string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Whether the column is filterable */
  filterable?: boolean;
}

/**
 * View configuration for UI rendering
 */
export interface ViewConfig {
  /** View name */
  name: string;
  /** View type */
  type: ViewType;
  /** Human-readable description */
  description?: string;
  /** Whether this is the default view */
  default?: boolean;
  /** Columns configuration (for list/table views) */
  columns?: ViewColumn[];
  /** Group by field (for kanban/calendar views) */
  groupBy?: string;
  /** Date field (for calendar views) */
  dateField?: string;
  /** Default sort configuration */
  defaultSort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  /** Default filters */
  defaultFilters?: Record<string, unknown>;
  /** Page size for pagination */
  pageSize?: number;
}

// ============================================================================
// Top-Level Schema
// ============================================================================

/**
 * Schema metadata
 */
export interface SchemaMetadata {
  /** Schema name */
  name: string;
  /** Schema version (semver) */
  version: string;
  /** Human-readable description */
  description?: string;
  /** Author information */
  author?: string;
  /** License */
  license?: string;
}

/**
 * Top-level SaaS Schema containing all resources, workflows, and views
 */
export interface SaaSSchema {
  /** Schema metadata */
  metadata: SchemaMetadata;
  /** Resource definitions */
  resources: Resource[];
  /** Workflow definitions */
  workflows?: Workflow[];
  /** Global actions (not tied to a specific resource) */
  globalActions?: Action[];
}

