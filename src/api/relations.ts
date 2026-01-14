/**
 * REST API Relation Handlers
 *
 * Handlers for relationship endpoints.
 *
 * @module api/relations
 */

import type { MemoryStore, DataRecord } from '../data/MemoryStore'
import type { Route, RouteContext, ResourceInfo } from './types'
import { ErrorCodes } from './types'
import { createErrorResponse, createSuccessResponse, CORS_HEADERS } from './response'

/**
 * Create relation GET handler (GET /api/:resource/:id/:relation)
 */
export function createRelationGetHandler(
  resource: ResourceInfo,
  fieldName: string,
  targetResourceName: string,
  store: MemoryStore,
  resources: ResourceInfo[]
): Route['handler'] {
  return async (ctx: RouteContext) => {
    const id = ctx.params.id
    const existing = await store.get(resource.collectionName, id)

    if (!existing) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
    }

    const relatedId = existing[fieldName] as string | undefined
    if (!relatedId) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, `No ${fieldName} relation set`)
    }

    const targetResource = resources.find((r) => r.name === targetResourceName)
    if (!targetResource) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, 'Related resource not found')
    }

    const related = await store.get(targetResource.collectionName, relatedId)
    if (!related) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, `Related ${targetResourceName} not found`)
    }

    return createSuccessResponse(related, 200)
  }
}

/**
 * Create relation PUT handler (PUT /api/:resource/:id/:relation)
 */
export function createRelationPutHandler(
  resource: ResourceInfo,
  fieldName: string,
  targetResourceName: string,
  store: MemoryStore,
  resources: ResourceInfo[]
): Route['handler'] {
  return async (ctx: RouteContext) => {
    const id = ctx.params.id
    const existing = await store.get(resource.collectionName, id)

    if (!existing) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
    }

    const body = ctx.body as { id?: string } | null
    if (!body || !body.id) {
      return createErrorResponse(400, ErrorCodes.BAD_REQUEST, 'id is required in body')
    }

    const targetResource = resources.find((r) => r.name === targetResourceName)
    if (!targetResource) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, 'Related resource not found')
    }

    const related = await store.get(targetResource.collectionName, body.id)
    if (!related) {
      return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, `Related ${targetResourceName} not found`, [
        { field: 'id', message: `${targetResourceName} with id ${body.id} does not exist` },
      ])
    }

    await store.update(resource.collectionName, id, { [fieldName]: body.id })

    return createSuccessResponse(related, 200)
  }
}

/**
 * Create many-to-many GET handler (GET /api/:resource/:id/tags)
 */
export function createTagsGetHandler(
  resource: ResourceInfo,
  store: MemoryStore,
  resources: ResourceInfo[],
  tagRelations: Map<string, Set<string>>
): Route['handler'] {
  return async (ctx: RouteContext) => {
    const id = ctx.params.id
    const existing = await store.get(resource.collectionName, id)

    if (!existing) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
    }

    const relationKey = `${resource.collectionName}:${id}:tags`
    const relatedIds = tagRelations.get(relationKey) || new Set<string>()

    const tagsResource = resources.find((r) => r.name === 'Tag')
    if (!tagsResource) {
      return createSuccessResponse([], 200)
    }

    const tags: DataRecord[] = []
    for (const tagId of relatedIds) {
      const tag = await store.get(tagsResource.collectionName, tagId as string)
      if (tag) tags.push(tag)
    }

    return createSuccessResponse(tags, 200)
  }
}

/**
 * Create many-to-many POST handler (POST /api/:resource/:id/tags)
 */
export function createTagsPostHandler(
  resource: ResourceInfo,
  store: MemoryStore,
  resources: ResourceInfo[],
  tagRelations: Map<string, Set<string>>
): Route['handler'] {
  return async (ctx: RouteContext) => {
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
    if (!tagRelations.has(relationKey)) {
      tagRelations.set(relationKey, new Set())
    }
    tagRelations.get(relationKey)!.add(body.id)

    return createSuccessResponse({ success: true }, 201)
  }
}

/**
 * Create many-to-many DELETE handler (DELETE /api/:resource/:id/tags/:relationId)
 */
export function createTagsDeleteHandler(
  resource: ResourceInfo,
  store: MemoryStore,
  tagRelations: Map<string, Set<string>>
): Route['handler'] {
  return async (ctx: RouteContext) => {
    const id = ctx.params.id
    const relationId = ctx.params.relationId
    const existing = await store.get(resource.collectionName, id)

    if (!existing) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resource.name} not found`)
    }

    const relationKey = `${resource.collectionName}:${id}:tags`
    const relatedIds = tagRelations.get(relationKey)
    if (relatedIds) {
      relatedIds.delete(relationId)
    }

    return new Response('', { status: 204, headers: CORS_HEADERS })
  }
}
