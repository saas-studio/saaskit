/**
 * REST API Router
 *
 * Route matching and request handling utilities.
 *
 * @module api/router
 */

import type { HTTPMethod } from './types'

/**
 * Match a URL path against a route pattern
 */
export function matchRoute(
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

/**
 * Parse the HTTP method, handling method override
 */
export function parseMethod(request: Request): HTTPMethod {
  let method = request.method.toUpperCase() as HTTPMethod

  // Handle method override
  const methodOverride = request.headers.get('X-HTTP-Method-Override')
  if (methodOverride) {
    method = methodOverride.toUpperCase() as HTTPMethod
  }

  return method
}

/**
 * Parse request body as JSON
 */
export async function parseBody(request: Request): Promise<{ body: unknown; error: string | null }> {
  const contentType = request.headers.get('Content-Type')

  if (contentType && !contentType.includes('application/json')) {
    return { body: null, error: 'Content-Type must be application/json' }
  }

  try {
    const text = await request.text()
    if (text) {
      return { body: JSON.parse(text), error: null }
    }
    return { body: null, error: null }
  } catch {
    return { body: null, error: 'Invalid JSON body' }
  }
}
