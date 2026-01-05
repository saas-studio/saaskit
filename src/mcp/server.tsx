/**
 * MCP Server Implementation
 *
 * Model Context Protocol server that exposes App resources as MCP tools and resources.
 *
 * @module mcp/server
 */

import type { ReactElement, ReactNode } from 'react'
import React from 'react'
import type { AppProps } from '../schema/App'
import type { ResourceProps } from '../schema/Resource'
import type { MemoryStore, Record } from '../data/MemoryStore'

/**
 * MCP Tool definition
 */
export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

/**
 * MCP Resource definition
 */
export interface MCPResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

/**
 * MCP Server configuration
 */
export interface MCPServerConfig {
  app: ReactElement<AppProps>
  store: MemoryStore
  name?: string
  version?: string
}

/**
 * MCP Server info
 */
export interface MCPServerInfo {
  name: string
  version: string
}

/**
 * Field definition extracted from Resource children
 */
interface FieldDef {
  type: string
  required?: boolean
  unique?: boolean
  values?: string[]
}

/**
 * Resource info extracted from App children
 */
interface ResourceInfo {
  name: string
  path: string
  collectionName: string
  fields: Map<string, FieldDef>
}

/**
 * MCP Error with code
 */
export class MCPError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'MCPError'
  }
}

/**
 * MCP Server class
 */
export class MCPServer {
  private config: MCPServerConfig
  private resources: ResourceInfo[] = []
  private appName: string = ''
  private appVersion: string = ''

  constructor(config: MCPServerConfig) {
    this.config = config
    this.parseApp()
  }

  /**
   * Parse the App element to extract resources
   */
  private parseApp(): void {
    const { app } = this.config

    // Get app props
    const appProps = app.props as AppProps
    this.appName = this.config.name ?? appProps.name ?? 'App'
    this.appVersion = this.config.version ?? appProps.version ?? '1.0.0'

    // Extract resources from children
    const children = React.Children.toArray(appProps.children)
    for (const child of children) {
      if (React.isValidElement(child)) {
        const type = child.type as { displayName?: string }
        if (type.displayName === 'Resource' || (child.props as any).name) {
          this.parseResource(child)
        }
      }
    }
  }

  /**
   * Parse a Resource element to extract field definitions
   */
  private parseResource(element: ReactElement): void {
    const props = element.props as ResourceProps
    const name = props.name
    const path = props.path || `/${name.toLowerCase()}s`
    const collectionName = name

    const fields = new Map<string, FieldDef>()

    // Extract fields from children
    const children = React.Children.toArray(props.children)
    for (const child of children) {
      if (React.isValidElement(child)) {
        const fieldProps = child.props as any
        const fieldType = child.type as { displayName?: string; fieldType?: string; name?: string }
        // Try fieldType, displayName, or function name
        const typeName = fieldType.fieldType || fieldType.displayName || fieldType.name || 'Text'

        if (fieldProps.name) {
          fields.set(fieldProps.name, {
            type: typeName.toLowerCase(),
            required: fieldProps.required ?? false,
            unique: fieldProps.unique ?? false,
            // Support both 'values' and 'options' props for select fields
            values: fieldProps.values || fieldProps.options,
          })
        }
      }
    }

    this.resources.push({ name, path, collectionName, fields })
  }

  /**
   * Get server info
   */
  getServerInfo(): MCPServerInfo {
    return {
      name: this.appName,
      version: this.appVersion,
    }
  }

  /**
   * List all available tools
   */
  listTools(): MCPTool[] {
    const tools: MCPTool[] = []

    for (const resource of this.resources) {
      const pluralName = resource.name.toLowerCase() + 's'
      const singularName = resource.name.toLowerCase()

      // Build input schema from fields
      const properties: Record<string, unknown> = {}
      const required: string[] = []

      for (const [fieldName, fieldDef] of resource.fields) {
        const prop: Record<string, unknown> = {}

        switch (fieldDef.type) {
          case 'number':
            prop.type = 'number'
            break
          case 'select':
            prop.type = 'string'
            if (fieldDef.values) {
              prop.enum = fieldDef.values
            }
            break
          case 'boolean':
            prop.type = 'boolean'
            break
          default:
            prop.type = 'string'
        }

        properties[fieldName] = prop
        if (fieldDef.required) {
          required.push(fieldName)
        }
      }

      // Create tool
      tools.push({
        name: `create_${singularName}`,
        description: `Create a new ${resource.name}`,
        inputSchema: {
          type: 'object',
          properties,
          required: required.length > 0 ? required : undefined,
        },
      })

      // List tool
      tools.push({
        name: `list_${pluralName}`,
        description: `List all ${resource.name} records`,
        inputSchema: {
          type: 'object',
          properties: {},
        },
      })

      // Get tool
      tools.push({
        name: `get_${singularName}`,
        description: `Get a ${resource.name} by ID`,
        inputSchema: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
      })

      // Update tool
      tools.push({
        name: `update_${singularName}`,
        description: `Update an existing ${resource.name}`,
        inputSchema: {
          type: 'object',
          properties: { id: { type: 'string' }, ...properties },
          required: ['id'],
        },
      })

      // Delete tool
      tools.push({
        name: `delete_${singularName}`,
        description: `Delete a ${resource.name}`,
        inputSchema: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
      })
    }

    return tools
  }

  /**
   * List all available resources
   */
  listResources(): MCPResource[] {
    const mcpResources: MCPResource[] = []
    const appPrefix = this.appName.toLowerCase()

    for (const resource of this.resources) {
      const pluralName = resource.name.toLowerCase() + 's'

      mcpResources.push({
        uri: `resource://${appPrefix}/${pluralName}`,
        name: resource.name,
        description: `${resource.name} resource schema and data`,
        mimeType: 'application/json',
      })
    }

    return mcpResources
  }

  /**
   * Call a tool by name
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    // Parse tool name
    const parts = name.split('_')
    if (parts.length < 2) {
      throw new MCPError('UNKNOWN_TOOL', `Unknown tool: ${name}`)
    }

    const action = parts[0]
    const resourceName = parts.slice(1).join('_')

    // Find resource
    const resource = this.findResource(resourceName)
    if (!resource) {
      throw new MCPError('UNKNOWN_TOOL', `Unknown tool: ${name}`)
    }

    const { store } = this.config

    switch (action) {
      case 'create':
        return this.handleCreate(resource, args)

      case 'list':
        return store.list(resource.collectionName)

      case 'get':
        if (!args.id || typeof args.id !== 'string') {
          throw new MCPError('VALIDATION_ERROR', 'id is required')
        }
        return store.get(resource.collectionName, args.id)

      case 'update':
        return this.handleUpdate(resource, args)

      case 'delete':
        if (!args.id || typeof args.id !== 'string') {
          throw new MCPError('VALIDATION_ERROR', 'id is required')
        }
        await store.delete(resource.collectionName, args.id)
        return undefined

      default:
        throw new MCPError('UNKNOWN_TOOL', `Unknown tool: ${name}`)
    }
  }

  /**
   * Handle create operation with validation
   */
  private async handleCreate(
    resource: ResourceInfo,
    args: Record<string, unknown>
  ): Promise<Record> {
    // Validate required fields
    for (const [fieldName, fieldDef] of resource.fields) {
      if (fieldDef.required && !(fieldName in args)) {
        throw new MCPError('VALIDATION_ERROR', `${fieldName} is required`)
      }
    }

    // Validate all provided field values
    for (const [fieldName, value] of Object.entries(args)) {
      const fieldDef = resource.fields.get(fieldName)
      if (fieldDef) {
        this.validateField(fieldName, value, fieldDef)
      }
    }

    // Create record
    return this.config.store.create(resource.collectionName, args)
  }

  /**
   * Handle update operation with validation
   */
  private async handleUpdate(
    resource: ResourceInfo,
    args: Record<string, unknown>
  ): Promise<Record> {
    if (!args.id || typeof args.id !== 'string') {
      throw new MCPError('VALIDATION_ERROR', 'id is required')
    }

    const { id, ...data } = args

    // Validate field types
    for (const [fieldName, value] of Object.entries(data)) {
      const fieldDef = resource.fields.get(fieldName)
      if (fieldDef) {
        this.validateField(fieldName, value, fieldDef)
      }
    }

    return this.config.store.update(resource.collectionName, id, data)
  }

  /**
   * Validate a field value
   */
  private validateField(name: string, value: unknown, fieldDef: FieldDef): void {
    switch (fieldDef.type) {
      case 'number':
        if (typeof value !== 'number') {
          throw new MCPError('VALIDATION_ERROR', `${name} must be a number`)
        }
        break

      case 'select':
        if (fieldDef.values && !fieldDef.values.includes(value as string)) {
          throw new MCPError('VALIDATION_ERROR', `${name} has an invalid value`)
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new MCPError('VALIDATION_ERROR', `${name} must be a boolean`)
        }
        break
    }
  }

  /**
   * Find a resource by singular or plural name
   */
  private findResource(name: string): ResourceInfo | undefined {
    const normalized = name.toLowerCase()
    return this.resources.find((r) => {
      const singular = r.name.toLowerCase()
      const plural = singular + 's'
      return normalized === singular || normalized === plural
    })
  }

  /**
   * Read a resource by URI
   */
  async readResource(uri: string): Promise<{ contents: unknown }> {
    // Parse URI: resource://appname/resourcename or resource://appname/resourcename/data
    const match = uri.match(/^resource:\/\/([^/]+)\/([^/]+)(\/data)?$/)
    if (!match) {
      throw new MCPError('INVALID_URI', `Invalid resource URI: ${uri}`)
    }

    const [, , resourcePath, dataPath] = match
    const resource = this.findResource(resourcePath)

    if (!resource) {
      throw new MCPError('NOT_FOUND', `Resource not found: ${resourcePath}`)
    }

    if (dataPath === '/data') {
      // Return resource data
      const data = await this.config.store.list(resource.collectionName)
      return { contents: data }
    }

    // Return resource schema
    const fields: Record<string, { type: string; required?: boolean; values?: string[] }> = {}
    for (const [fieldName, fieldDef] of resource.fields) {
      fields[fieldName] = {
        type: fieldDef.type,
        ...(fieldDef.required && { required: true }),
        ...(fieldDef.values && { values: fieldDef.values }),
      }
    }

    return {
      contents: {
        name: resource.name,
        path: resource.path,
        fields,
      },
    }
  }
}

/**
 * Create an MCP server from app configuration
 */
export function createMCPServer(config: MCPServerConfig): MCPServer {
  return new MCPServer(config)
}
