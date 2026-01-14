/**
 * REST API Filtering and Query
 *
 * Utilities for filtering, sorting, and searching records.
 *
 * @module api/filters
 */

import type { DataRecord } from '../data/MemoryStore'
import type { ResourceInfo } from './types'

/**
 * Parse filter operators from query params
 */
export function parseFilters(query: URLSearchParams, _resource: ResourceInfo): Array<{
  field: string
  operator: string
  value: unknown
}> {
  const filters: Array<{ field: string; operator: string; value: unknown }> = []
  const reservedParams = new Set([
    'page', 'pageSize', 'limit', 'offset', 'sort', 'sortBy', 'order', 'orderBy',
    'fields', 'select', 'q', 'search', 'query', 'include',
  ])

  for (const [key, rawValue] of query.entries()) {
    if (reservedParams.has(key)) continue

    // Check for operator syntax: field[op]=value
    const operatorMatch = key.match(/^(.+)\[(gt|lt|gte|lte|ne|in)\]$/)
    if (operatorMatch) {
      const [, field, operator] = operatorMatch
      let value: unknown = rawValue
      if (operator === 'in') {
        value = rawValue.split(',')
      }
      filters.push({ field, operator, value })
    } else {
      // Exact match filter
      // Convert boolean strings
      let value: unknown = rawValue
      if (rawValue === 'true') value = true
      else if (rawValue === 'false') value = false

      filters.push({ field: key, operator: 'eq', value })
    }
  }

  return filters
}

/**
 * Compare values for filter operations (handles Date comparisons)
 */
export function compareValues(
  recordValue: unknown,
  filterValue: unknown,
  operator: string
): boolean {
  // Convert to comparable values
  let rv: string | number | Date = recordValue as string | number | Date
  let fv: string | number | Date = filterValue as string | number | Date

  // Handle date comparisons
  if (recordValue instanceof Date) {
    rv = recordValue.getTime()
    // Try to parse filter value as date
    const parsed = new Date(fv as string)
    if (!isNaN(parsed.getTime())) {
      fv = parsed.getTime()
    }
  } else if (typeof recordValue === 'string' && !isNaN(Date.parse(recordValue))) {
    // Record value might be a date string
    const rvDate = new Date(recordValue)
    if (!isNaN(rvDate.getTime())) {
      rv = rvDate.getTime()
      const fvDate = new Date(fv as string)
      if (!isNaN(fvDate.getTime())) {
        fv = fvDate.getTime()
      }
    }
  }

  switch (operator) {
    case 'eq':
      return rv === fv
    case 'ne':
      return rv !== fv
    case 'gt':
      return rv > fv
    case 'lt':
      return rv < fv
    case 'gte':
      return rv >= fv
    case 'lte':
      return rv <= fv
    default:
      return true
  }
}

/**
 * Apply filters to records
 */
export function applyFilters(
  records: DataRecord[],
  filters: Array<{ field: string; operator: string; value: unknown }>
): DataRecord[] {
  return records.filter((record) => {
    for (const { field, operator, value } of filters) {
      const recordValue = record[field]

      if (operator === 'in') {
        if (!Array.isArray(value) || !value.includes(recordValue as string)) return false
        continue
      }

      if (!compareValues(recordValue, value, operator)) {
        return false
      }
    }
    return true
  })
}

/**
 * Apply search across text fields
 */
export function applySearch(records: DataRecord[], searchTerm: string, resource: ResourceInfo): DataRecord[] {
  const term = searchTerm.toLowerCase()
  return records.filter((record) => {
    for (const [fieldName, fieldDef] of resource.fields.entries()) {
      if (['string', 'text', 'email'].includes(fieldDef.type)) {
        const value = record[fieldName]
        if (typeof value === 'string' && value.toLowerCase().includes(term)) {
          return true
        }
      }
    }
    // Also search title field if exists
    if (record.title && typeof record.title === 'string' && record.title.toLowerCase().includes(term)) {
      return true
    }
    return false
  })
}

/**
 * Apply sorting to records
 */
export function applySort(records: DataRecord[], sortField: string, order: 'asc' | 'desc'): DataRecord[] {
  return [...records].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]

    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    const comparison = aVal < bVal ? -1 : 1
    return order === 'desc' ? -comparison : comparison
  })
}

/**
 * Select specific fields from a record
 */
export function selectFields(record: DataRecord, fields: string[]): DataRecord {
  const result: DataRecord = {} as DataRecord
  for (const field of fields) {
    if (field in record) {
      result[field] = record[field]
    }
  }
  return result
}

/**
 * Expand relations in a record
 */
export async function expandRelations(
  record: DataRecord,
  includes: string[],
  resource: ResourceInfo,
  store: { get: (collection: string, id: string) => Promise<DataRecord | null> },
  resources: ResourceInfo[]
): Promise<DataRecord> {
  const result = { ...record }

  for (const include of includes) {
    const fieldDef = resource.fields.get(include)
    if (fieldDef?.type === 'relation' && fieldDef.target) {
      const targetResource = resources.find((r) => r.name === fieldDef.target)
      if (targetResource && result[include]) {
        const related = await store.get(targetResource.collectionName, result[include] as string)
        if (related) {
          result[include] = related
        }
      }
    }
  }

  return result
}
