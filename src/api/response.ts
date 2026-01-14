/**
 * REST API Response Helpers
 *
 * Utilities for creating standardized API responses.
 *
 * @module api/response
 */

import type { APIError, APIErrorDetail, APIResponse, ErrorCode, PaginationMeta } from './types'
import type { DataRecord } from '../data/MemoryStore'

/**
 * CORS headers to add to all responses
 */
export const CORS_HEADERS: HeadersInit = {
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
 * Generate ETag for a record
 */
export function generateETag(record: DataRecord): string {
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
export function toCSV(data: DataRecord[]): string {
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
export function toYAML(data: unknown): string {
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
export function parseAcceptHeader(accept: string | null): { type: string; quality: number }[] {
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
export function serializeResponse(data: unknown, acceptHeader: string | null, meta?: PaginationMeta): Response {
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
      const csvData = Array.isArray(data) ? toCSV(data) : toCSV([data as DataRecord])
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
