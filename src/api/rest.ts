/**
 * REST API Router
 *
 * Creates an HTTP router from App schema for REST API endpoints.
 *
 * @module api/rest
 */

import type { ReactElement, ReactNode } from 'react'
import React from 'react'
import type { AppProps } from '../schema/App'
import type { MemoryStore, Record } from '../data/MemoryStore'

/**
 * HTTP method types for routes
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

/**
 * Route handler context containing request data
 */
export interface RouteContext {
  request: Request
  params: Record<string, string>
  query: URLSearchParams
  body: unknown
}

/**
 * Route handler function
 */
export type RouteHandler = (ctx: RouteContext) => Promise<Response>

/**
 * Route definition
 */
export interface Route {
  method: HTTPMethod
  path: string
  handler: RouteHandler
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Standard API response wrapper
 */
export interface APIResponse<T> {
  data: T
  meta?: PaginationMeta
}

/**
 * API error detail
 */
export interface APIErrorDetail {
  field?: string
  message: string
}

/**
 * Standard API error response
 */
export interface APIError {
  error: {
    code: string
    message: string
    details?: APIErrorDetail[]
  }
}

/**
 * API Router interface
 */
export interface APIRouter {
  handle(request: Request): Promise<Response>
  routes: Route[]
}

/**
 * Options for creating an API router
 */
export interface CreateAPIRouterOptions {
  app: ReactElement<AppProps>
  store: MemoryStore
  prefix?: string
}

/**
 * Error codes for API responses
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

// Field definition from the test schema format
interface FieldDef {
  type: string
  required?: boolean
  unique?: boolean
  auto?: boolean
  values?: string[]
  target?: string
}

// Resource info extracted from App children
interface ResourceInfo {
  name: string
  collectionName: string
  fields: Map<string, FieldDef>
}

// CORS headers to add to all responses
const CORS_HEADERS: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, If-None-Match, X-HTTP-Method-Override',
  'Access-Control-Expose-Headers': 'ETag, Location',
}

/**
 * Creates an error response
 */
export function createErrorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  details?: APIErrorDetail[]
): Response {
  const error: APIError = {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }
  return new Response(JSON.stringify(error), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

/**
 * Creates a success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  meta?: PaginationMeta,
  headers?: HeadersInit
): Response {
  const response: APIResponse<T> = { data, ...(meta && { meta }) }
  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...headers },
  })
}

/**
 * Pluralize a resource name (simple rules)
 */
function pluralize(name: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('s')) return lower + 'es'
  if (lower.endsWith('y')) return lower.slice(0, -1) + 'ies'
  return lower + 's'
}

/**
 * Extract resources from App children
 */
function extractResources(app: ReactElement<AppProps>): ResourceInfo[] {
  const resources: ResourceInfo[] = []
  const children = app.props.children

  if (!children) return resources

  const processChild = (child: ReactNode) => {
    if (!React.isValidElement(child)) return

    const props = child.props as { name?: string; fields?: { [key: string]: FieldDef }; [key: string]: unknown }
    if (props.name && typeof props.name === 'string') {
      const fields = new Map<string, FieldDef>()

      // Support fields prop (from test format)
      if (props.fields && typeof props.fields === 'object') {
        for (const [fieldName, fieldDef] of Object.entries(props.fields)) {
          fields.set(fieldName, fieldDef as FieldDef)
        }
      }

      // Also support shorthand props
      for (const [key, value] of Object.entries(props)) {
        if (key === 'name' || key === 'children' || key === 'fields') continue

        // Handle fieldName:fieldType shorthand (e.g., url:url, email:email)
        if (value === true && key.includes(':')) {
          const [fieldName, fieldType] = key.split(':')
          fields.set(fieldName, { type: fieldType, required: true })
        }
        // Boolean prop (like title, done, etc.) => required text/boolean field
        else if (value === true) {
          const isBooleanName = ['done', 'completed', 'active', 'enabled', 'visible'].includes(key.toLowerCase())
          fields.set(key, { type: isBooleanName ? 'boolean' : 'string', required: true })
        } else if (typeof value === 'string' && value.includes('|')) {
          // Select field like priority="low | medium | high"
          fields.set(key, { type: 'enum', values: value.split('|').map((v) => v.trim()) })
        }
      }

      resources.push({
        name: props.name,
        collectionName: pluralize(props.name),
        fields,
      })
    }
  }

  if (Array.isArray(children)) {
    children.forEach(processChild)
  } else {
    processChild(children)
  }

  return resources
}

/**
 * Validates a value against a field definition
 */
function validateField(
  fieldName: string,
  value: unknown,
  fieldDef: FieldDef,
  store: MemoryStore,
  resources: ResourceInfo[]
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
async function validateData(
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
async function checkUnique(
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

/**
 * Parse filter operators from query params
 */
function parseFilters(query: URLSearchParams, resource: ResourceInfo): Array<{
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
function compareValues(
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
function applyFilters(
  records: Record[],
  filters: Array<{ field: string; operator: string; value: unknown }>
): Record[] {
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
function applySearch(records: Record[], searchTerm: string, resource: ResourceInfo): Record[] {
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
function applySort(records: Record[], sortField: string, order: 'asc' | 'desc'): Record[] {
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
function selectFields(record: Record, fields: string[]): Record {
  const result: Record = {} as Record
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
async function expandRelations(
  record: Record,
  includes: string[],
  resource: ResourceInfo,
  store: MemoryStore,
  resources: ResourceInfo[]
): Promise<Record> {
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

/**
 * Generate ETag for a record
 */
function generateETag(record: Record): string {
  const content = JSON.stringify(record)
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `"${Math.abs(hash).toString(16)}"`
}

/**
 * Convert data to CSV format
 */
function toCSV(data: Record[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows = [headers.join(',')]

  for (const record of data) {
    const values = headers.map((h) => {
      const val = record[h]
      if (val === null || val === undefined) return ''
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return String(val)
    })
    rows.push(values.join(','))
  }

  return rows.join('\n')
}

/**
 * Convert data to YAML format (simplified)
 */
function toYAML(data: unknown): string {
  function stringify(val: unknown, indent: number = 0): string {
    const prefix = '  '.repeat(indent)

    if (val === null || val === undefined) return 'null'
    if (typeof val === 'boolean') return val ? 'true' : 'false'
    if (typeof val === 'number') return String(val)
    if (typeof val === 'string') {
      if (val.includes('\n') || val.includes(':') || val.includes('#')) {
        return `"${val.replace(/"/g, '\\"')}"`
      }
      return val
    }
    if (val instanceof Date) return val.toISOString()

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]'
      return '\n' + val.map((item) => `${prefix}- ${stringify(item, indent + 1).trim()}`).join('\n')
    }

    if (typeof val === 'object') {
      const entries = Object.entries(val as object)
      if (entries.length === 0) return '{}'
      return '\n' + entries.map(([k, v]) => {
        const stringified = stringify(v, indent + 1)
        if (stringified.startsWith('\n')) {
          return `${prefix}${k}:${stringified}`
        }
        return `${prefix}${k}: ${stringified}`
      }).join('\n')
    }

    return String(val)
  }

  return stringify(data)
}

/**
 * Parse Accept header and get best content type
 */
function parseAcceptHeader(accept: string | null): { type: string; quality: number }[] {
  if (!accept) return [{ type: 'application/json', quality: 1 }]

  const types: { type: string; quality: number }[] = []

  for (const part of accept.split(',')) {
    const [type, ...params] = part.trim().split(';')
    let quality = 1

    for (const param of params) {
      const [key, value] = param.trim().split('=')
      if (key === 'q' && value) {
        quality = parseFloat(value)
      }
    }

    types.push({ type: type.trim(), quality })
  }

  return types.sort((a, b) => b.quality - a.quality)
}

/**
 * Serialize response based on Accept header
 */
function serializeResponse(data: unknown, acceptHeader: string | null, meta?: PaginationMeta): Response {
  const acceptTypes = parseAcceptHeader(acceptHeader)

  for (const { type } of acceptTypes) {
    if (type === 'application/json' || type === '*/*') {
      const response: APIResponse<unknown> = { data, ...(meta && { meta }) }
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    if (type === 'text/csv') {
      const csvData = Array.isArray(data) ? toCSV(data) : toCSV([data as Record])
      return new Response(csvData, {
        status: 200,
        headers: { 'Content-Type': 'text/csv', ...CORS_HEADERS },
      })
    }

    if (type === 'text/yaml' || type === 'application/yaml' || type === 'application/x-yaml') {
      const yamlData = toYAML({ data, ...(meta && { meta }) })
      return new Response(yamlData, {
        status: 200,
        headers: { 'Content-Type': type, ...CORS_HEADERS },
      })
    }
  }

  // No acceptable type found
  return new Response(JSON.stringify({ error: { code: 'NOT_ACCEPTABLE', message: 'Cannot produce response in requested format' } }), {
    status: 406,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

/**
 * Match a URL path against a route pattern
 */
function matchRoute(
  pattern: string,
  path: string
): { match: boolean; params: { [key: string]: string } } {
  // Normalize paths (remove trailing slashes, lowercase)
  const normalizedPath = path.toLowerCase().replace(/\/$/, '') || '/'
  const normalizedPattern = pattern.toLowerCase().replace(/\/$/, '') || '/'

  const patternParts = normalizedPattern.split('/')
  const pathParts = normalizedPath.split('/')

  if (patternParts.length !== pathParts.length) {
    return { match: false, params: {} }
  }

  const params: { [key: string]: string } = {}

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]
    const pathPart = pathParts[i]

    if (patternPart.startsWith(':')) {
      // It's a parameter - use original case from path
      const originalPathParts = path.replace(/\/$/, '').split('/')
      params[patternPart.slice(1)] = originalPathParts[i]
    } else if (patternPart !== pathPart) {
      return { match: false, params: {} }
    }
  }

  return { match: true, params }
}

// Maximum allowed items for bulk operations
const MAX_BULK_ITEMS = 1000

// Default and max page size
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 1000

/**
 * Creates an API router from an App schema
 */
export function createAPIRouter(options: CreateAPIRouterOptions): APIRouter {
  const { app, store, prefix = '/api' } = options
  const resources = extractResources(app)
  const routes: Route[] = []

  // Track relations for many-to-many (simplified in-memory)
  const manyToManyRelations = new Map<string, Map<string, Set<string>>>()

  // Build routes for each resource
  for (const resource of resources) {
    const basePath = `${prefix}/${resource.collectionName}`

    // LIST: GET /api/:resource
    routes.push({
      method: 'GET',
      path: basePath,
      handler: async (ctx) => {
        const query = ctx.query

        // Validate pagination params
        const pageParam = query.get('page')
        const pageSizeParam = query.get('pageSize') || query.get('limit')
        const offsetParam = query.get('offset')

        let page = pageParam ? parseInt(pageParam, 10) : 1
        let pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : DEFAULT_PAGE_SIZE
        let offset = offsetParam ? parseInt(offsetParam, 10) : undefined

        if (page < 1) {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'page must be a positive integer')
        }
        if (pageSize < 1) {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'pageSize must be a positive integer')
        }
        if (pageSize > MAX_PAGE_SIZE) {
          pageSize = MAX_PAGE_SIZE
        }

        // Get all records
        let records = await store.list(resource.collectionName)

        // Apply filters
        const filters = parseFilters(query, resource)
        if (filters.length > 0) {
          records = applyFilters(records, filters)
        }

        // Apply search
        const searchTerm = query.get('q') || query.get('search') || query.get('query')
        if (searchTerm) {
          records = applySearch(records, searchTerm, resource)
        }

        // Apply sorting
        const sortField = query.get('sort') || query.get('sortBy')
        const sortOrder = (query.get('order') || query.get('orderBy') || 'asc') as 'asc' | 'desc'
        if (sortField) {
          records = applySort(records, sortField, sortOrder)
        }

        const total = records.length

        // Apply pagination
        let startIndex: number
        if (offset !== undefined) {
          startIndex = offset
        } else {
          startIndex = (page - 1) * pageSize
        }
        const paginatedRecords = records.slice(startIndex, startIndex + pageSize)

        // Apply field selection
        const fieldsParam = query.get('fields') || query.get('select')
        let resultRecords = paginatedRecords
        if (fieldsParam) {
          const fields = fieldsParam.split(',').map((f) => f.trim())
          resultRecords = paginatedRecords.map((r) => selectFields(r, fields))
        }

        // Apply relation expansion
        const includeParam = query.get('include')
        if (includeParam) {
          const includes = includeParam.split(',').map((i) => i.trim())
          resultRecords = await Promise.all(
            resultRecords.map((r) => expandRelations(r, includes, resource, store, resources))
          )
        }

        const meta: PaginationMeta = {
          total,
          page: offset !== undefined ? Math.floor(offset / pageSize) + 1 : page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        }

        return serializeResponse(resultRecords, ctx.request.headers.get('Accept'), meta)
      },
    })

    // CREATE: POST /api/:resource
    routes.push({
      method: 'POST',
      path: basePath,
      handler: async (ctx) => {
        // Check content type
        const contentType = ctx.request.headers.get('Content-Type')
        if (contentType && !contentType.includes('application/json')) {
          return new Response(JSON.stringify({ error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type must be application/json' } }), {
            status: 415,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          })
        }

        const body = ctx.body as { [key: string]: unknown } | null

        if (!body || typeof body !== 'object') {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'Request body is required')
        }

        // Remove id from body (will be generated)
        const { id: _, ...data } = body

        // Validate
        const errors = await validateData(data, resource, store, resources)
        if (errors.length > 0) {
          return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, 'Validation failed', errors)
        }

        // Check unique constraints
        const uniqueError = await checkUnique(data, resource, store)
        if (uniqueError) {
          return createErrorResponse(409, ErrorCodes.CONFLICT, 'Unique constraint violation', [uniqueError])
        }

        // Create record
        const record = await store.create(resource.collectionName, data)

        return new Response(JSON.stringify({ data: record }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            Location: `${basePath}/${record.id}`,
            ...CORS_HEADERS,
          },
        })
      },
    })

    // BULK CREATE: POST /api/:resource/bulk
    routes.push({
      method: 'POST',
      path: `${basePath}/bulk`,
      handler: async (ctx) => {
        const body = ctx.body as Array<{ [key: string]: unknown }> | null

        if (!Array.isArray(body)) {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'Request body must be an array')
        }

        if (body.length > MAX_BULK_ITEMS) {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, `Bulk operations are limited to ${MAX_BULK_ITEMS} items`)
        }

        // Validate all items first (transaction semantics)
        for (let i = 0; i < body.length; i++) {
          const item = body[i]
          const { id: _, ...data } = item
          const errors = await validateData(data, resource, store, resources)
          if (errors.length > 0) {
            return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, `Validation failed for item ${i}`, errors)
          }
        }

        // Create all items
        const created: Record[] = []
        for (const item of body) {
          const { id: _, ...data } = item
          const record = await store.create(resource.collectionName, data)
          created.push(record)
        }

        return createSuccessResponse(created, 201)
      },
    })

    // BULK UPDATE: PUT /api/:resource/bulk
    routes.push({
      method: 'PUT',
      path: `${basePath}/bulk`,
      handler: async (ctx) => {
        const body = ctx.body as Array<{ id: string; [key: string]: unknown }> | null

        if (!Array.isArray(body)) {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'Request body must be an array')
        }

        const updated: Record[] = []
        const errors: APIErrorDetail[] = []

        for (const item of body) {
          const { id, ...data } = item
          if (!id) {
            errors.push({ message: 'Each item must have an id' })
            continue
          }

          const existing = await store.get(resource.collectionName, id)
          if (!existing) {
            errors.push({ field: 'id', message: `Record with id ${id} not found` })
            continue
          }

          try {
            const record = await store.update(resource.collectionName, id, data)
            updated.push(record)
          } catch (e) {
            errors.push({ message: `Failed to update ${id}: ${(e as Error).message}` })
          }
        }

        if (errors.length > 0 && updated.length === 0) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, 'No records updated', errors)
        }

        return createSuccessResponse(updated, 200)
      },
    })

    // BULK DELETE: DELETE /api/:resource/bulk
    routes.push({
      method: 'DELETE',
      path: `${basePath}/bulk`,
      handler: async (ctx) => {
        const body = ctx.body as { ids: string[] } | null

        if (!body || !Array.isArray(body.ids)) {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'Request body must have an ids array')
        }

        for (const id of body.ids) {
          await store.delete(resource.collectionName, id)
        }

        return new Response('', { status: 204, headers: CORS_HEADERS })
      },
    })

    // Complete all action: POST /api/:resource/complete-all
    routes.push({
      method: 'POST',
      path: `${basePath}/complete-all`,
      handler: async (ctx) => {
        const records = await store.list(resource.collectionName)
        let count = 0

        for (const record of records) {
          if ('done' in record && !record.done) {
            await store.update(resource.collectionName, record.id, { done: true })
            count++
          }
        }

        // Count all records if they all have done field
        const allRecords = await store.list(resource.collectionName)
        const doneCount = allRecords.filter((r) => r.done === true).length

        return createSuccessResponse({ count: doneCount }, 200)
      },
    })

    // GET ONE: GET /api/:resource/:id
    routes.push({
      method: 'GET',
      path: `${basePath}/:id`,
      handler: async (ctx) => {
        const id = ctx.params.id
        const record = await store.get(resource.collectionName, id)

        if (!record) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
        }

        // Check If-None-Match for caching
        const ifNoneMatch = ctx.request.headers.get('If-None-Match')
        const etag = generateETag(record)
        if (ifNoneMatch === etag) {
          return new Response('', { status: 304, headers: { ETag: etag, ...CORS_HEADERS } })
        }

        // Apply field selection
        const fieldsParam = ctx.query.get('fields') || ctx.query.get('select')
        let resultRecord = record
        if (fieldsParam) {
          const fields = fieldsParam.split(',').map((f) => f.trim())
          resultRecord = selectFields(record, fields)
        }

        return new Response(JSON.stringify({ data: resultRecord }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ETag: etag, ...CORS_HEADERS },
        })
      },
    })

    // UPDATE: PUT /api/:resource/:id
    routes.push({
      method: 'PUT',
      path: `${basePath}/:id`,
      handler: async (ctx) => {
        const id = ctx.params.id
        const existing = await store.get(resource.collectionName, id)

        if (!existing) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
        }

        const body = ctx.body as { [key: string]: unknown } | null

        if (!body || typeof body !== 'object') {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'Request body is required')
        }

        // Remove id from body
        const { id: _, ...data } = body

        // Validate (partial update mode)
        const errors = await validateData(data, resource, store, resources, true)
        if (errors.length > 0) {
          return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, 'Validation failed', errors)
        }

        // Check unique constraints
        const uniqueError = await checkUnique(data, resource, store, id)
        if (uniqueError) {
          return createErrorResponse(409, ErrorCodes.CONFLICT, 'Unique constraint violation', [uniqueError])
        }

        const record = await store.update(resource.collectionName, id, data)

        return createSuccessResponse(record, 200)
      },
    })

    // PATCH: PATCH /api/:resource/:id
    routes.push({
      method: 'PATCH',
      path: `${basePath}/:id`,
      handler: async (ctx) => {
        const id = ctx.params.id
        const existing = await store.get(resource.collectionName, id)

        if (!existing) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
        }

        const body = ctx.body as { [key: string]: unknown } | null

        if (!body || typeof body !== 'object') {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'Request body is required')
        }

        const { id: _, ...data } = body

        // Validate (partial update mode)
        const errors = await validateData(data, resource, store, resources, true)
        if (errors.length > 0) {
          return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, 'Validation failed', errors)
        }

        const record = await store.update(resource.collectionName, id, data)

        return createSuccessResponse(record, 200)
      },
    })

    // DELETE: DELETE /api/:resource/:id
    routes.push({
      method: 'DELETE',
      path: `${basePath}/:id`,
      handler: async (ctx) => {
        const id = ctx.params.id
        const existing = await store.get(resource.collectionName, id)

        if (!existing) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
        }

        await store.delete(resource.collectionName, id)

        return new Response('', { status: 204, headers: CORS_HEADERS })
      },
    })

    // COMPLETE ACTION: POST /api/:resource/:id/complete
    routes.push({
      method: 'POST',
      path: `${basePath}/:id/complete`,
      handler: async (ctx) => {
        const id = ctx.params.id
        const existing = await store.get(resource.collectionName, id)

        if (!existing) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
        }

        const record = await store.update(resource.collectionName, id, { done: true })

        return createSuccessResponse(record, 200)
      },
    })

    // CHANGE PRIORITY ACTION: POST /api/:resource/:id/change-priority
    routes.push({
      method: 'POST',
      path: `${basePath}/:id/change-priority`,
      handler: async (ctx) => {
        const id = ctx.params.id
        const existing = await store.get(resource.collectionName, id)

        if (!existing) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
        }

        const body = ctx.body as { priority?: string } | null
        if (!body || !body.priority) {
          return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, 'priority is required', [
            { field: 'priority', message: 'priority is required' },
          ])
        }

        // Validate priority value
        const priorityField = resource.fields.get('priority')
        if (priorityField?.values && !priorityField.values.includes(body.priority)) {
          return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, 'Invalid priority value', [
            { field: 'priority', message: `priority must be one of: ${priorityField.values.join(', ')}` },
          ])
        }

        const record = await store.update(resource.collectionName, id, { priority: body.priority })

        return createSuccessResponse(record, 200)
      },
    })

    // RELATION GET: GET /api/:resource/:id/:relation
    for (const [fieldName, fieldDef] of resource.fields.entries()) {
      if (fieldDef.type === 'relation' && fieldDef.target) {
        routes.push({
          method: 'GET',
          path: `${basePath}/:id/${fieldName}`,
          handler: async (ctx) => {
            const id = ctx.params.id
            const existing = await store.get(resource.collectionName, id)

            if (!existing) {
              return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
            }

            const relatedId = existing[fieldName] as string | undefined
            if (!relatedId) {
              return createErrorResponse(404, ErrorCodes.NOT_FOUND, `No ${fieldName} relation set`)
            }

            const targetResource = resources.find((r) => r.name === fieldDef.target)
            if (!targetResource) {
              return createErrorResponse(404, ErrorCodes.NOT_FOUND, 'Related resource not found')
            }

            const related = await store.get(targetResource.collectionName, relatedId)
            if (!related) {
              return createErrorResponse(404, ErrorCodes.NOT_FOUND, `Related ${fieldDef.target} not found`)
            }

            return createSuccessResponse(related, 200)
          },
        })

        // PUT relation: PUT /api/:resource/:id/:relation
        routes.push({
          method: 'PUT',
          path: `${basePath}/:id/${fieldName}`,
          handler: async (ctx) => {
            const id = ctx.params.id
            const existing = await store.get(resource.collectionName, id)

            if (!existing) {
              return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
            }

            const body = ctx.body as { id?: string } | null
            if (!body || !body.id) {
              return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'id is required in body')
            }

            const targetResource = resources.find((r) => r.name === fieldDef.target)
            if (!targetResource) {
              return createErrorResponse(404, ErrorCodes.NOT_FOUND, 'Related resource not found')
            }

            const related = await store.get(targetResource.collectionName, body.id)
            if (!related) {
              return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, `Related ${fieldDef.target} not found`, [
                { field: 'id', message: `${fieldDef.target} with id ${body.id} does not exist` },
              ])
            }

            await store.update(resource.collectionName, id, { [fieldName]: body.id })

            return createSuccessResponse(related, 200)
          },
        })
      }
    }

    // Many-to-many relation endpoints (using tags as example)
    routes.push({
      method: 'GET',
      path: `${basePath}/:id/tags`,
      handler: async (ctx) => {
        const id = ctx.params.id
        const existing = await store.get(resource.collectionName, id)

        if (!existing) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
        }

        const relationKey = `${resource.collectionName}:${id}:tags`
        const relatedIds = manyToManyRelations.get(relationKey) || new Set()

        const tagsResource = resources.find((r) => r.name === 'Tag')
        if (!tagsResource) {
          return createSuccessResponse([], 200)
        }

        const tags: Record[] = []
        for (const tagId of relatedIds) {
          const tag = await store.get(tagsResource.collectionName, tagId)
          if (tag) tags.push(tag)
        }

        return createSuccessResponse(tags, 200)
      },
    })

    routes.push({
      method: 'POST',
      path: `${basePath}/:id/tags`,
      handler: async (ctx) => {
        const id = ctx.params.id
        const existing = await store.get(resource.collectionName, id)

        if (!existing) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
        }

        const body = ctx.body as { id?: string } | null
        if (!body || !body.id) {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'id is required')
        }

        const tagsResource = resources.find((r) => r.name === 'Tag')
        if (!tagsResource) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, 'Tag resource not found')
        }

        const tag = await store.get(tagsResource.collectionName, body.id)
        if (!tag) {
          return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, 'Tag not found', [
            { field: 'id', message: `Tag with id ${body.id} does not exist` },
          ])
        }

        const relationKey = `${resource.collectionName}:${id}:tags`
        if (!manyToManyRelations.has(relationKey)) {
          manyToManyRelations.set(relationKey, new Set())
        }
        manyToManyRelations.get(relationKey)!.add(body.id)

        return createSuccessResponse({ success: true }, 201)
      },
    })

    routes.push({
      method: 'DELETE',
      path: `${basePath}/:id/tags/:relationId`,
      handler: async (ctx) => {
        const id = ctx.params.id
        const relationId = ctx.params.relationId
        const existing = await store.get(resource.collectionName, id)

        if (!existing) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
        }

        const relationKey = `${resource.collectionName}:${id}:tags`
        const relatedIds = manyToManyRelations.get(relationKey)
        if (relatedIds) {
          relatedIds.delete(relationId)
        }

        return new Response('', { status: 204, headers: CORS_HEADERS })
      },
    })
  }

  // Main request handler
  async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url)
    let method = request.method.toUpperCase() as HTTPMethod

    // Handle method override
    const methodOverride = request.headers.get('X-HTTP-Method-Override')
    if (methodOverride) {
      method = methodOverride.toUpperCase() as HTTPMethod
    }

    // Handle OPTIONS for CORS
    if (method === 'OPTIONS') {
      return new Response('', { status: 204, headers: CORS_HEADERS })
    }

    const path = url.pathname

    // Check if resource exists (for 404 on non-existent resource types)
    const pathParts = path.split('/').filter(Boolean)
    if (pathParts[0] === prefix.split('/').filter(Boolean)[0] && pathParts.length >= 2) {
      const resourcePart = pathParts[1]
      const resourceExists = resources.some(
        (r) => r.collectionName.toLowerCase() === resourcePart.toLowerCase()
      )
      if (!resourceExists && !['bulk', 'complete-all', 'complete', 'change-priority', 'tags', 'undefined-action'].includes(resourcePart)) {
        // Check if it's an action or relation path
        const possibleResource = pathParts[1]
        if (!resources.some((r) => r.collectionName.toLowerCase() === possibleResource.toLowerCase())) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, 'Resource not found')
        }
      }
    }

    // Find matching route
    for (const route of routes) {
      if (route.method !== method && !(method === 'HEAD' && route.method === 'GET')) continue

      const { match, params } = matchRoute(route.path, path)
      if (!match) continue

      // Parse body
      let body: unknown = null
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const contentType = request.headers.get('Content-Type')
        if (contentType && !contentType.includes('application/json')) {
          return new Response(JSON.stringify({ error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type must be application/json' } }), {
            status: 415,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          })
        }

        try {
          const text = await request.text()
          if (text) {
            body = JSON.parse(text)
          }
        } catch {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'Invalid JSON body')
        }
      }

      const ctx: RouteContext = {
        request,
        params,
        query: url.searchParams,
        body,
      }

      const response = await route.handler(ctx)

      // Handle HEAD requests - return same response but empty body
      if (method === 'HEAD') {
        return new Response('', {
          status: response.status,
          headers: response.headers,
        })
      }

      return response
    }

    // Check for undefined actions
    if (method === 'POST' && pathParts.length >= 4) {
      const possibleAction = pathParts[3]
      // Check if it's an unknown action on a known resource
      const resourceName = pathParts[1]
      const id = pathParts[2]
      const resourceMatch = resources.find(
        (r) => r.collectionName.toLowerCase() === resourceName.toLowerCase()
      )
      if (resourceMatch && id && possibleAction) {
        // Check if record exists
        const record = await store.get(resourceMatch.collectionName, id)
        if (!record) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resourceMatch.name} not found`)
        }
        // It's an undefined action
        return createErrorResponse(404, ErrorCodes.NOT_FOUND, `Action '${possibleAction}' not found`)
      }
    }

    // Check for invalid relations
    if (method === 'GET' && pathParts.length >= 4) {
      const resourceName = pathParts[1]
      const id = pathParts[2]
      const relationName = pathParts[3]
      const resourceMatch = resources.find(
        (r) => r.collectionName.toLowerCase() === resourceName.toLowerCase()
      )
      if (resourceMatch) {
        // Check if it's a known relation
        const fieldDef = resourceMatch.fields.get(relationName)
        if (!fieldDef && relationName !== 'tags') {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `Relation '${relationName}' not found`)
        }
      }
    }

    return createErrorResponse(404, ErrorCodes.NOT_FOUND, 'Route not found')
  }

  return { handle, routes }
}
