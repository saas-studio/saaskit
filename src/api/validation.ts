/**
 * REST API Validation
 *
 * Field and data validation utilities.
 *
 * @module api/validation
 */

import type { MemoryStore } from '../data/MemoryStore'
import type { APIErrorDetail, FieldDef, ResourceInfo } from './types'

/**
 * Validates a value against a field definition
 */
export function validateField(
  fieldName: string,
  value: unknown,
  fieldDef: FieldDef,
  _store: MemoryStore,
  _resources: ResourceInfo[]
): APIErrorDetail | null {
  // Auto fields don't need validation
  if (fieldDef.auto) return null

  // Null/undefined check for required fields
  if (value === null || value === undefined) {
    if (fieldDef.required) {
      return { field: fieldName, message: `${fieldName} is required` }
    }
    return null
  }

  // Type validation
  switch (fieldDef.type) {
    case 'string':
    case 'text':
      if (typeof value !== 'string') {
        return { field: fieldName, message: `${fieldName} must be a string` }
      }
      break

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return { field: fieldName, message: `${fieldName} must be a number` }
      }
      break

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { field: fieldName, message: `${fieldName} must be a boolean` }
      }
      break

    case 'date':
    case 'datetime':
      // Accept Date objects, valid date strings, and ISO strings
      if (typeof value === 'string') {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          return { field: fieldName, message: `${fieldName} must be a valid date` }
        }
      } else if (!(value instanceof Date) || isNaN(value.getTime())) {
        return { field: fieldName, message: `${fieldName} must be a valid date` }
      }
      break

    case 'email':
      if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { field: fieldName, message: `${fieldName} must be a valid email address` }
      }
      break

    case 'url':
      if (typeof value !== 'string') {
        return { field: fieldName, message: `${fieldName} must be a valid URL` }
      }
      try {
        new URL(value)
      } catch {
        return { field: fieldName, message: `${fieldName} must be a valid URL` }
      }
      break

    case 'enum':
    case 'select':
      if (fieldDef.values && !fieldDef.values.includes(value as string)) {
        return {
          field: fieldName,
          message: `${fieldName} must be one of: ${fieldDef.values.join(', ')}`,
        }
      }
      break

    case 'relation':
      // Relation validation is async, handled separately
      break
  }

  return null
}

/**
 * Validate all fields in a data object
 */
export async function validateData(
  data: { [key: string]: unknown },
  resource: ResourceInfo,
  store: MemoryStore,
  resources: ResourceInfo[],
  isUpdate: boolean = false
): Promise<APIErrorDetail[]> {
  const errors: APIErrorDetail[] = []

  // Check all defined fields
  for (const [fieldName, fieldDef] of resource.fields.entries()) {
    // Skip id field
    if (fieldName === 'id') continue

    const value = data[fieldName]

    // For updates, skip required check if field not provided
    if (isUpdate && value === undefined) continue

    const error = validateField(fieldName, value, fieldDef, store, resources)
    if (error) {
      errors.push(error)
    }

    // Check relation exists
    if (fieldDef.type === 'relation' && value && fieldDef.target) {
      const targetResource = resources.find((r) => r.name === fieldDef.target)
      if (targetResource) {
        const related = await store.get(targetResource.collectionName, value as string)
        if (!related) {
          errors.push({
            field: fieldName,
            message: `Referenced ${fieldDef.target} with id ${value} does not exist`,
          })
        }
      }
    }
  }

  return errors
}

/**
 * Check unique constraint
 */
export async function checkUnique(
  data: { [key: string]: unknown },
  resource: ResourceInfo,
  store: MemoryStore,
  excludeId?: string
): Promise<APIErrorDetail | null> {
  for (const [fieldName, fieldDef] of resource.fields.entries()) {
    if (fieldDef.unique && data[fieldName] !== undefined) {
      const allRecords = await store.list(resource.collectionName)
      const conflict = allRecords.find(
        (r) => r[fieldName] === data[fieldName] && r.id !== excludeId
      )
      if (conflict) {
        return { field: fieldName, message: `${fieldName} must be unique` }
      }
    }
  }
  return null
}
