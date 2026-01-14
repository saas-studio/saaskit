/**
 * REST API Type Definitions
 *
 * Core types for REST API functionality.
 *
 * @module api/types
 */

import type { ReactElement } from 'react'
import type { AppProps } from '../schema/App'
import type { MemoryStore } from '../data/MemoryStore'

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

/**
 * Field definition from schema format
 */
export interface FieldDef {
  type: string
  required?: boolean
  unique?: boolean
  auto?: boolean
  values?: string[]
  target?: string
}

/**
 * Resource info extracted from App children
 */
export interface ResourceInfo {
  name: string
  collectionName: string
  fields: Map<string, FieldDef>
}
