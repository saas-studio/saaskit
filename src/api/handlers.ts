/**
 * REST API Route Handlers
 *
 * Individual route handler factories for CRUD operations.
 *
 * @module api/handlers
 */

import type { MemoryStore, DataRecord } from '../data/MemoryStore'
import type { Route, RouteContext, ResourceInfo, PaginationMeta } from './types'
import { ErrorCodes } from './types'
import { createErrorResponse, createSuccessResponse, generateETag, serializeResponse, CORS_HEADERS } from './response'
import { validateData, checkUnique } from './validation'
import { parseFilters, applyFilters, applySearch, applySort, selectFields, expandRelations } from './filters'

// Default and max page size
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 1000
const MAX_BULK_ITEMS = 1000

/**
 * Create list handler (GET /api/:resource)
 */
export function createListHandler(
  resource: ResourceInfo,
  store: MemoryStore,
  resources: ResourceInfo[]
): Route['handler'] {
  return async (ctx: RouteContext) => {
    const query = ctx.query

    // Validate pagination params
    const pageParam = query.get('page')
    const pageSizeParam = query.get('pageSize') || query.get('limit')
    const offsetParam = query.get('offset')

    let page = pageParam ? parseInt(pageParam, 10) : 1
    let pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : DEFAULT_PAGE_SIZE
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined

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
  }
}

/**
 * Create single item handler (GET /api/:resource/:id)
 */
export function createGetOneHandler(
  resource: ResourceInfo,
  store: MemoryStore,
  _resources: ResourceInfo[]
): Route['handler'] {
  return async (ctx: RouteContext) => {
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
  }
}

/**
 * Create handler (POST /api/:resource)
 */
export function createCreateHandler(
  resource: ResourceInfo,
  store: MemoryStore,
  resources: ResourceInfo[],
  basePath: string
): Route['handler'] {
  return async (ctx: RouteContext) => {
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
  }
}

/**
 * Update handler (PUT /api/:resource/:id)
 */
export function createUpdateHandler(
  resource: ResourceInfo,
  store: MemoryStore,
  resources: ResourceInfo[]
): Route['handler'] {
  return async (ctx: RouteContext) => {
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
  }
}

/**
 * Patch handler (PATCH /api/:resource/:id)
 */
export function createPatchHandler(
  resource: ResourceInfo,
  store: MemoryStore,
  resources: ResourceInfo[]
): Route['handler'] {
  return async (ctx: RouteContext) => {
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
  }
}

/**
 * Delete handler (DELETE /api/:resource/:id)
 */
export function createDeleteHandler(
  resource: ResourceInfo,
  store: MemoryStore
): Route['handler'] {
  return async (ctx: RouteContext) => {
    const id = ctx.params.id
    const existing = await store.get(resource.collectionName, id)

    if (!existing) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
    }

    await store.delete(resource.collectionName, id)

    return new Response('', { status: 204, headers: CORS_HEADERS })
  }
}

/**
 * Bulk create handler (POST /api/:resource/bulk)
 */
export function createBulkCreateHandler(
  resource: ResourceInfo,
  store: MemoryStore,
  resources: ResourceInfo[]
): Route['handler'] {
  return async (ctx: RouteContext) => {
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
    const created: DataRecord[] = []
    for (const item of body) {
      const { id: _, ...data } = item
      const record = await store.create(resource.collectionName, data)
      created.push(record)
    }

    return createSuccessResponse(created, 201)
  }
}

/**
 * Bulk update handler (PUT /api/:resource/bulk)
 */
export function createBulkUpdateHandler(
  resource: ResourceInfo,
  store: MemoryStore
): Route['handler'] {
  return async (ctx: RouteContext) => {
    const body = ctx.body as Array<{ id: string; [key: string]: unknown }> | null

    if (!Array.isArray(body)) {
      return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'Request body must be an array')
    }

    const updated: DataRecord[] = []
    const errors: { message: string; field?: string }[] = []

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
  }
}

/**
 * Bulk delete handler (DELETE /api/:resource/bulk)
 */
export function createBulkDeleteHandler(
  resource: ResourceInfo,
  store: MemoryStore
): Route['handler'] {
  return async (ctx: RouteContext) => {
    const body = ctx.body as { ids: string[] } | null

    if (!body || !Array.isArray(body.ids)) {
      return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'Request body must have an ids array')
    }

    for (const id of body.ids) {
      await store.delete(resource.collectionName, id)
    }

    return new Response('', { status: 204, headers: CORS_HEADERS })
  }
}

/**
 * Complete action handler (POST /api/:resource/:id/complete)
 */
export function createCompleteHandler(
  resource: ResourceInfo,
  store: MemoryStore
): Route['handler'] {
  return async (ctx: RouteContext) => {
    const id = ctx.params.id
    const existing = await store.get(resource.collectionName, id)

    if (!existing) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
    }

    const record = await store.update(resource.collectionName, id, { done: true })

    return createSuccessResponse(record, 200)
  }
}

/**
 * Complete all action handler (POST /api/:resource/complete-all)
 */
export function createCompleteAllHandler(
  resource: ResourceInfo,
  store: MemoryStore
): Route['handler'] {
  return async (_ctx: RouteContext) => {
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
  }
}

/**
 * Change priority action handler (POST /api/:resource/:id/change-priority)
 */
export function createChangePriorityHandler(
  resource: ResourceInfo,
  store: MemoryStore
): Route['handler'] {
  return async (ctx: RouteContext) => {
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
  }
}
