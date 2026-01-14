/**
 * REST API Router
 *
 * Creates an HTTP router from App schema for REST API endpoints.
 * This file serves as the main entry point and orchestration layer,
 * delegating to focused modules for specific functionality.
 *
 * ## Module Structure
 *
 * - `types.ts` - Type definitions and interfaces
 * - `response.ts` - Response creation and content negotiation
 * - `validation.ts` - Field and data validation
 * - `filters.ts` - Query filtering, sorting, and search
 * - `router.ts` - Route matching utilities
 * - `handlers.ts` - CRUD operation handlers
 * - `relations.ts` - Relationship endpoint handlers
 *
 * @module api/rest
 */

import type { ReactElement, ReactNode } from 'react'
import React from 'react'
import type { AppProps } from '../schema/App'
import type { MemoryStore } from '../data/MemoryStore'
import { pluralize as pluralizeUtil } from '../utils'

// Import types
import type {
  HTTPMethod,
  Route,
  RouteContext,
  APIRouter,
  CreateAPIRouterOptions,
  FieldDef,
  ResourceInfo,
} from './types'
import { ErrorCodes } from './types'

// Import utilities
import { createErrorResponse, CORS_HEADERS } from './response'
import { matchRoute, parseMethod, parseBody } from './router'

// Import handlers
import {
  createListHandler,
  createGetOneHandler,
  createCreateHandler,
  createUpdateHandler,
  createPatchHandler,
  createDeleteHandler,
  createBulkCreateHandler,
  createBulkUpdateHandler,
  createBulkDeleteHandler,
  createCompleteHandler,
  createCompleteAllHandler,
  createChangePriorityHandler,
} from './handlers'

// Import relation handlers
import {
  createRelationGetHandler,
  createRelationPutHandler,
  createTagsGetHandler,
  createTagsPostHandler,
  createTagsDeleteHandler,
} from './relations'

// Re-export for backwards compatibility
export type {
  HTTPMethod,
  RouteContext,
  Route,
  APIRouter,
  CreateAPIRouterOptions,
} from './types'
export type { RouteHandler, PaginationMeta, APIResponse, APIErrorDetail, APIError, ErrorCode } from './types'
export { ErrorCodes } from './types'
export { createErrorResponse, createSuccessResponse } from './response'

/**
 * Pluralize a resource name (delegates to shared util, returns lowercase)
 */
function pluralize(name: string): string {
  return pluralizeUtil(name).toLowerCase()
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
 * Creates an API router from an App schema
 */
export function createAPIRouter(options: CreateAPIRouterOptions): APIRouter {
  const { app, store, prefix = '/api' } = options
  const resources = extractResources(app)
  const routes: Route[] = []

  // Track many-to-many relations
  const tagRelations = new Map<string, Set<string>>()

  // Build routes for each resource
  for (const resource of resources) {
    const basePath = `${prefix}/${resource.collectionName}`

    // LIST: GET /api/:resource
    routes.push({
      method: 'GET',
      path: basePath,
      handler: createListHandler(resource, store, resources),
    })

    // CREATE: POST /api/:resource
    routes.push({
      method: 'POST',
      path: basePath,
      handler: createCreateHandler(resource, store, resources, basePath),
    })

    // BULK CREATE: POST /api/:resource/bulk
    routes.push({
      method: 'POST',
      path: `${basePath}/bulk`,
      handler: createBulkCreateHandler(resource, store, resources),
    })

    // BULK UPDATE: PUT /api/:resource/bulk
    routes.push({
      method: 'PUT',
      path: `${basePath}/bulk`,
      handler: createBulkUpdateHandler(resource, store),
    })

    // BULK DELETE: DELETE /api/:resource/bulk
    routes.push({
      method: 'DELETE',
      path: `${basePath}/bulk`,
      handler: createBulkDeleteHandler(resource, store),
    })

    // Complete all action: POST /api/:resource/complete-all
    routes.push({
      method: 'POST',
      path: `${basePath}/complete-all`,
      handler: createCompleteAllHandler(resource, store),
    })

    // GET ONE: GET /api/:resource/:id
    routes.push({
      method: 'GET',
      path: `${basePath}/:id`,
      handler: createGetOneHandler(resource, store, resources),
    })

    // UPDATE: PUT /api/:resource/:id
    routes.push({
      method: 'PUT',
      path: `${basePath}/:id`,
      handler: createUpdateHandler(resource, store, resources),
    })

    // PATCH: PATCH /api/:resource/:id
    routes.push({
      method: 'PATCH',
      path: `${basePath}/:id`,
      handler: createPatchHandler(resource, store, resources),
    })

    // DELETE: DELETE /api/:resource/:id
    routes.push({
      method: 'DELETE',
      path: `${basePath}/:id`,
      handler: createDeleteHandler(resource, store),
    })

    // COMPLETE ACTION: POST /api/:resource/:id/complete
    routes.push({
      method: 'POST',
      path: `${basePath}/:id/complete`,
      handler: createCompleteHandler(resource, store),
    })

    // CHANGE PRIORITY ACTION: POST /api/:resource/:id/change-priority
    routes.push({
      method: 'POST',
      path: `${basePath}/:id/change-priority`,
      handler: createChangePriorityHandler(resource, store),
    })

    // RELATION ENDPOINTS
    for (const [fieldName, fieldDef] of resource.fields.entries()) {
      if (fieldDef.type === 'relation' && fieldDef.target) {
        // GET relation: GET /api/:resource/:id/:relation
        routes.push({
          method: 'GET',
          path: `${basePath}/:id/${fieldName}`,
          handler: createRelationGetHandler(resource, fieldName, fieldDef.target, store, resources),
        })

        // PUT relation: PUT /api/:resource/:id/:relation
        routes.push({
          method: 'PUT',
          path: `${basePath}/:id/${fieldName}`,
          handler: createRelationPutHandler(resource, fieldName, fieldDef.target, store, resources),
        })
      }
    }

    // Many-to-many relation endpoints (tags)
    routes.push({
      method: 'GET',
      path: `${basePath}/:id/tags`,
      handler: createTagsGetHandler(resource, store, resources, tagRelations),
    })

    routes.push({
      method: 'POST',
      path: `${basePath}/:id/tags`,
      handler: createTagsPostHandler(resource, store, resources, tagRelations),
    })

    routes.push({
      method: 'DELETE',
      path: `${basePath}/:id/tags/:relationId`,
      handler: createTagsDeleteHandler(resource, store, tagRelations),
    })
  }

  // Main request handler
  async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const method = parseMethod(request)

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

      // Parse body for methods that need it
      let body: unknown = null
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const contentType = request.headers.get('Content-Type')
        if (contentType && !contentType.includes('application/json')) {
          return new Response(JSON.stringify({ error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type must be application/json' } }), {
            status: 415,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          })
        }

        const { body: parsedBody, error } = await parseBody(request)
        if (error) {
          return createErrorResponse(400, ErrorCodes.BAD_REQUEST, error)
        }
        body = parsedBody
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
      const resourceName = pathParts[1]
      const id = pathParts[2]
      const resourceMatch = resources.find(
        (r) => r.collectionName.toLowerCase() === resourceName.toLowerCase()
      )
      if (resourceMatch && id && possibleAction) {
        const record = await store.get(resourceMatch.collectionName, id)
        if (!record) {
          return createErrorResponse(404, ErrorCodes.NOT_FOUND, `${resourceMatch.name} not found`)
        }
        return createErrorResponse(404, ErrorCodes.NOT_FOUND, `Action '${possibleAction}' not found`)
      }
    }

    // Check for invalid relations
    if (method === 'GET' && pathParts.length >= 4) {
      const resourceName = pathParts[1]
      const relationName = pathParts[3]
      const resourceMatch = resources.find(
        (r) => r.collectionName.toLowerCase() === resourceName.toLowerCase()
      )
      if (resourceMatch) {
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
