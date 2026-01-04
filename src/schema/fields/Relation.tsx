/**
 * Relation Field Component - defines a relation to another resource in expanded syntax
 * Stub - to be implemented in GREEN phase
 */
import type React from 'react'

export type CascadeType = 'delete' | 'nullify' | 'restrict'

export interface RelationFieldProps {
  name: string
  to: string
  required?: boolean
  optional?: boolean
  many?: boolean
  self?: boolean
  cascade?: CascadeType
}

/**
 * Relation field component for expanded syntax
 *
 * Usage:
 * <Relation name="author" to="User" />           // required relation
 * <Relation name="assignee" to="User" optional /> // optional relation
 * <Relation name="tags" to="Tag" many />         // many-to-many
 * <Relation name="parent" to="Task" self />      // self-referential
 * <Relation name="comments" to="Comment" cascade="delete" />  // cascade
 */
export function Relation(props: RelationFieldProps): React.ReactElement {
  // Stub - returns null, to be implemented
  return null as unknown as React.ReactElement
}

// Field type identifier for metadata extraction
Relation.fieldType = 'relation'
