# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Nothing yet

## [0.1.0] - 2026-01-05

### Added

#### JSX-Based Schema Definition
- `<App/>` component for defining complete SaaS applications declaratively
- `<Resource/>` components that automatically generate CRUD operations
- `<Field/>` components with comprehensive type system
- Field shorthand syntax for rapid prototyping (e.g., `title`, `done`, `email:email`)
- Expanded form with explicit field components (`<Text>`, `<Boolean>`, `<Select>`, `<Relation>`)
- Type inference for common field names (done, email, url, createdAt, etc.)
- Relation syntax for resource linking (`->Resource`, `->Resource[]`, `->Resource?`)
- Unique constraints and auto-generated fields (`:unique`, `:auto`)

#### Multi-Format Parsers
- JSX Schema Parser for processing `<App/>` component definitions
- Mermaid ER diagram parser for entity-relationship diagrams
- State diagram parser for workflow definitions
- View annotation parser for terminal UI configuration
- Schema AST with validation and compilation

#### Code Generation
- TypeScript type definitions from schema
- JSON Schema generation for validation
- OpenAPI specification generation
- TypeScript SDK generator with type-safe client methods
- Schema compiler for transforming JSX to runtime artifacts

#### REST API Generation
- Automatic CRUD endpoints for all resources (`GET`, `POST`, `PUT`, `DELETE`)
- RESTful URL patterns (`/api/:resource`, `/api/:resource/:id`)
- Search functionality across resources
- Multiple output formats (JSON, table, markdown, CSV, YAML)

#### Terminal UI Views (React Ink)
- List view with configurable columns and pagination
- Detail view for single resource display
- Form view for creating and editing resources
- Table component with custom renderers
- Box component with border styles
- Spinner and Progress components for async operations
- Markdown fallback mode for agent-friendly output

#### MCP Server Support
- Full MCP (Model Context Protocol) server implementation
- Auto-generated tools for all CRUD operations
- stdio transport for Claude Desktop integration
- Tool schemas derived from resource definitions

#### CLI Features
- Command palette with interactive mode
- Resource-based command structure (`app resource action`)
- Flag parsing with type coercion
- Multiple output format support (`--format json|table|markdown|csv|yaml`)

#### Data Persistence
- SQLite adapter with full CRUD support
- Transaction support for data integrity
- Query builder for complex operations

#### Custom Logic
- Actions for custom operations beyond CRUD
- Hooks for reacting to data changes (`on="create"`, `on="update"`, etc.)
- Views for customizing terminal presentation

[Unreleased]: https://github.com/saas-studio/saaskit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/saas-studio/saaskit/releases/tag/v0.1.0
