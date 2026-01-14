/**
 * REST API Module
 *
 * Modular REST API implementation for SaaSkit.
 * This module provides a complete REST API router that can be created from
 * an App schema definition.
 *
 * ## Architecture
 *
 * The REST API is split into focused modules:
 * - `types.ts` - Type definitions and interfaces
 * - `response.ts` - Response creation and content negotiation
 * - `validation.ts` - Field and data validation
 * - `filters.ts` - Query filtering, sorting, and search
 * - `router.ts` - Route matching utilities
 * - `handlers.ts` - CRUD operation handlers
 * - `relations.ts` - Relationship endpoint handlers
 *
 * ## Usage
 *
 * ```tsx
 * import { createAPIRouter } from 'saaskit/api'
 * import { App, Resource } from 'saaskit'
 * import { MemoryStore } from 'saaskit/data'
 *
 * const app = (
 *   <App name="myapp">
 *     <Resource name="Task" title done />
 *   </App>
 * )
 *
 * const store = new MemoryStore()
 * const router = createAPIRouter({ app, store })
 *
 * // Handle requests
 * const response = await router.handle(request)
 * ```
 *
 * ## Features
 *
 * - Standard CRUD operations (GET, POST, PUT, PATCH, DELETE)
 * - Pagination, filtering, sorting, and search
 * - Field selection and relation expansion
 * - Bulk operations
 * - Content negotiation (JSON, CSV, YAML)
 * - ETag-based caching
 * - CORS support
 *
 * @module api
 */

// Re-export types
export type {
  HTTPMethod,
  RouteContext,
  RouteHandler,
  Route,
  PaginationMeta,
  APIResponse,
  APIErrorDetail,
  APIError,
  APIRouter,
  CreateAPIRouterOptions,
  ErrorCode,
  FieldDef,
  ResourceInfo,
} from './types'

export { ErrorCodes } from './types'

// Re-export response utilities
export {
  createErrorResponse,
  createSuccessResponse,
  generateETag,
  toCSV,
  toYAML,
  parseAcceptHeader,
  serializeResponse,
  CORS_HEADERS,
} from './response'

// Re-export validation utilities
export {
  validateField,
  validateData,
  checkUnique,
} from './validation'

// Re-export filter utilities
export {
  parseFilters,
  compareValues,
  applyFilters,
  applySearch,
  applySort,
  selectFields,
  expandRelations,
} from './filters'

// Re-export router utilities
export {
  matchRoute,
  parseMethod,
  parseBody,
} from './router'

// Re-export the main factory (from rest.ts for backwards compatibility)
export { createAPIRouter } from './rest'
