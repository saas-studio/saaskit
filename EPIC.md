# EPIC: SaaSkit Terminal UI Framework

## Vision

Build a headless SaaS framework that generates complete terminal-first applications from declarative `<App/>` definitions, targeting AI agents as primary users.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SaaSkit Stack                               │
├─────────────────────────────────────────────────────────────────────┤
│  Runtime:     Bun >= 1.2.0                                          │
│  UI:          OpenTUI (@opentui/react) or Ink (fallback)            │
│  Framework:   React 18+                                             │
│  Language:    TypeScript (strict)                                   │
│  Testing:     Bun test (built-in)                                   │
│  Build:       Bun build                                             │
└─────────────────────────────────────────────────────────────────────┘
```

## TDD Methodology

Every feature follows the **Red-Green-Refactor** cycle:

1. **🔴 RED**: Write failing tests that define the desired behavior
2. **🟢 GREEN**: Write minimal code to make tests pass
3. **🔵 REFACTOR**: Improve code quality while keeping tests green

Each feature has 3 tickets: `[RED]`, `[GREEN]`, `[REFACTOR]`

---

## Milestone 1: Core Infrastructure

### 1.1 Project Setup

#### 1.1.1 [RED] Project Initialization Tests
```
ID: SAAS-001-RED
Type: Test
Priority: P0
Estimate: 2 points

Acceptance Criteria:
- [ ] Test that `bun create saaskit` scaffolds a new project
- [ ] Test that project has correct package.json structure
- [ ] Test that TypeScript config is strict mode
- [ ] Test that basic imports resolve correctly
- [ ] Test that `bun test` runs without errors on empty project

Test Files:
- tests/setup/scaffold.test.ts
- tests/setup/config.test.ts
```

#### 1.1.2 [GREEN] Project Initialization Implementation
```
ID: SAAS-001-GREEN
Type: Implementation
Priority: P0
Estimate: 3 points
Depends: SAAS-001-RED

Acceptance Criteria:
- [ ] Create package.json with correct dependencies
- [ ] Create tsconfig.json with strict mode
- [ ] Create bunfig.toml for Bun configuration
- [ ] Create src/ directory structure
- [ ] Create initial index.ts entry point
- [ ] All RED tests pass

Files:
- package.json
- tsconfig.json
- bunfig.toml
- src/index.ts
```

#### 1.1.3 [REFACTOR] Project Setup Polish
```
ID: SAAS-001-REFACTOR
Type: Refactor
Priority: P1
Estimate: 1 point
Depends: SAAS-001-GREEN

Acceptance Criteria:
- [ ] Add comprehensive JSDoc comments
- [ ] Ensure consistent code style (biome/prettier)
- [ ] Add .gitignore and .editorconfig
- [ ] Optimize bundle size
- [ ] All tests still pass
```

---

### 1.2 OpenTUI/React Integration

#### 1.2.1 [RED] Terminal Rendering Tests
```
ID: SAAS-002-RED
Type: Test
Priority: P0
Estimate: 3 points

Acceptance Criteria:
- [ ] Test that React components render to terminal output
- [ ] Test that Box component creates bordered container
- [ ] Test that Text component renders styled text
- [ ] Test that colors are applied correctly
- [ ] Test that layout (flexbox) works correctly
- [ ] Test output captures for snapshot testing

Test Files:
- tests/render/basic.test.tsx
- tests/render/layout.test.tsx
- tests/render/styling.test.tsx
```

#### 1.2.2 [GREEN] Terminal Rendering Implementation
```
ID: SAAS-002-GREEN
Type: Implementation
Priority: P0
Estimate: 5 points
Depends: SAAS-002-RED

Acceptance Criteria:
- [ ] Install and configure @opentui/react (or ink fallback)
- [ ] Create render() function that outputs to terminal
- [ ] Create Box component with border support
- [ ] Create Text component with color/style support
- [ ] Implement flexbox layout via Yoga
- [ ] All RED tests pass

Files:
- src/render/index.ts
- src/components/Box.tsx
- src/components/Text.tsx
- src/render/yoga-layout.ts
```

#### 1.2.3 [REFACTOR] Terminal Rendering Optimization
```
ID: SAAS-002-REFACTOR
Type: Refactor
Priority: P1
Estimate: 2 points
Depends: SAAS-002-GREEN

Acceptance Criteria:
- [ ] Optimize render performance (damage buffer)
- [ ] Add render output caching
- [ ] Extract shared styling utilities
- [ ] Add comprehensive TypeScript types
- [ ] All tests still pass
```

---

### 1.3 Multi-Format Output

#### 1.3.1 [RED] Output Format Tests
```
ID: SAAS-003-RED
Type: Test
Priority: P0
Estimate: 3 points

Acceptance Criteria:
- [ ] Test --format=unicode outputs Unicode box drawing
- [ ] Test --format=ascii outputs ASCII-only characters
- [ ] Test --format=plain outputs alphanumeric only
- [ ] Test --format=json outputs structured JSON
- [ ] Test --format=markdown outputs valid Markdown
- [ ] Test default format detection based on terminal capabilities

Test Files:
- tests/output/unicode.test.ts
- tests/output/ascii.test.ts
- tests/output/plain.test.ts
- tests/output/json.test.ts
- tests/output/markdown.test.ts
```

#### 1.3.2 [GREEN] Output Format Implementation
```
ID: SAAS-003-GREEN
Type: Implementation
Priority: P0
Estimate: 5 points
Depends: SAAS-003-RED

Acceptance Criteria:
- [ ] Create OutputFormat enum (unicode, ascii, plain, json, markdown)
- [ ] Create format detection based on $TERM
- [ ] Implement Unicode renderer (Level 3)
- [ ] Implement ASCII renderer (Level 2)
- [ ] Implement Plain renderer (Level 1)
- [ ] Implement JSON serializer
- [ ] Implement Markdown generator
- [ ] All RED tests pass

Files:
- src/output/format.ts
- src/output/unicode.ts
- src/output/ascii.ts
- src/output/plain.ts
- src/output/json.ts
- src/output/markdown.ts
```

#### 1.3.3 [REFACTOR] Output Format Abstraction
```
ID: SAAS-003-REFACTOR
Type: Refactor
Priority: P1
Estimate: 2 points
Depends: SAAS-003-GREEN

Acceptance Criteria:
- [ ] Create unified Renderer interface
- [ ] Extract symbol mapping to configuration
- [ ] Add pluggable renderer architecture
- [ ] Ensure consistent API across formats
- [ ] All tests still pass
```

---

## Milestone 2: Schema & App Definition

### 2.1 App Component

#### 2.1.1 [RED] App Definition Tests
```
ID: SAAS-010-RED
Type: Test
Priority: P0
Estimate: 3 points

Acceptance Criteria:
- [ ] Test <App name="todos"> creates app with name
- [ ] Test App validates required props
- [ ] Test App accepts children (Resource components)
- [ ] Test App generates correct metadata
- [ ] Test App throws on invalid configuration

Test Files:
- tests/schema/app.test.tsx
```

#### 2.1.2 [GREEN] App Definition Implementation
```
ID: SAAS-010-GREEN
Type: Implementation
Priority: P0
Estimate: 3 points
Depends: SAAS-010-RED

Acceptance Criteria:
- [ ] Create App component with name, description, version props
- [ ] Create AppContext for child components
- [ ] Implement App metadata generation
- [ ] Implement validation for required props
- [ ] All RED tests pass

Files:
- src/schema/App.tsx
- src/schema/AppContext.ts
- src/schema/types.ts
```

#### 2.1.3 [REFACTOR] App Definition Polish
```
ID: SAAS-010-REFACTOR
Type: Refactor
Priority: P1
Estimate: 1 point
Depends: SAAS-010-GREEN

Acceptance Criteria:
- [ ] Add comprehensive prop types with JSDoc
- [ ] Extract configuration options
- [ ] Add runtime validation with helpful errors
- [ ] All tests still pass
```

---

### 2.2 Resource Definition (Shorthand Syntax)

#### 2.2.1 [RED] Resource Shorthand Tests
```
ID: SAAS-011-RED
Type: Test
Priority: P0
Estimate: 5 points

Acceptance Criteria:
- [ ] Test <Task title /> creates resource with required text field
- [ ] Test <Task title? /> creates optional field (? suffix)
- [ ] Test <Task done /> infers boolean from name
- [ ] Test <Task status="open | closed" /> creates select field
- [ ] Test <Task priority:number /> creates explicit typed field
- [ ] Test <Task assignee->User /> creates relation
- [ ] Test <Task tags->Tag[] /> creates many relation
- [ ] Test <Task createdAt:auto /> creates auto-generated field
- [ ] Test <Task email:unique /> creates unique constraint

Test Files:
- tests/schema/resource-shorthand.test.tsx
- tests/schema/field-inference.test.tsx
- tests/schema/relations.test.tsx
```

#### 2.2.2 [GREEN] Resource Shorthand Implementation
```
ID: SAAS-011-GREEN
Type: Implementation
Priority: P0
Estimate: 8 points
Depends: SAAS-011-RED

Acceptance Criteria:
- [ ] Create JSX transform for dynamic component names
- [ ] Implement field parsing from props
- [ ] Implement type inference rules (done→boolean, email→email, etc.)
- [ ] Implement relation syntax parsing (->Resource, ->Resource[])
- [ ] Implement modifier parsing (?, :type, :unique, :auto)
- [ ] Implement select parsing from pipe-separated strings
- [ ] Generate Resource schema from parsed props
- [ ] All RED tests pass

Files:
- src/schema/Resource.tsx
- src/schema/field-parser.ts
- src/schema/type-inference.ts
- src/schema/relation-parser.ts
- src/schema/jsx-transform.ts
```

#### 2.2.3 [REFACTOR] Resource Definition Optimization
```
ID: SAAS-011-REFACTOR
Type: Refactor
Priority: P1
Estimate: 3 points
Depends: SAAS-011-GREEN

Acceptance Criteria:
- [ ] Memoize parsing for performance
- [ ] Add helpful error messages for invalid syntax
- [ ] Extract parsing rules to configuration
- [ ] Add custom type registration
- [ ] All tests still pass
```

---

### 2.3 Expanded Syntax Support

#### 2.3.1 [RED] Expanded Syntax Tests
```
ID: SAAS-012-RED
Type: Test
Priority: P1
Estimate: 3 points

Acceptance Criteria:
- [ ] Test expanded field syntax with <Text>, <Boolean>, <Select>, etc.
- [ ] Test mixing shorthand and expanded syntax
- [ ] Test nested configuration in expanded syntax
- [ ] Test field validation rules in expanded syntax

Test Files:
- tests/schema/resource-expanded.test.tsx
```

#### 2.3.2 [GREEN] Expanded Syntax Implementation
```
ID: SAAS-012-GREEN
Type: Implementation
Priority: P1
Estimate: 5 points
Depends: SAAS-012-RED

Acceptance Criteria:
- [ ] Create Text, Number, Boolean, Select field components
- [ ] Create Email, DateTime, Relation field components
- [ ] Allow field components as Resource children
- [ ] Merge shorthand and expanded definitions
- [ ] All RED tests pass

Files:
- src/schema/fields/Text.tsx
- src/schema/fields/Number.tsx
- src/schema/fields/Boolean.tsx
- src/schema/fields/Select.tsx
- src/schema/fields/Email.tsx
- src/schema/fields/DateTime.tsx
- src/schema/fields/Relation.tsx
```

---

## Milestone 3: View System

### 3.1 List View

#### 3.1.1 [RED] List View Tests
```
ID: SAAS-020-RED
Type: Test
Priority: P0
Estimate: 5 points

Acceptance Criteria:
- [ ] Test <List variant="table" /> renders table layout
- [ ] Test <List variant="cards" /> renders card grid
- [ ] Test <List variant="kanban" /> renders columns
- [ ] Test <List variant="compact" /> renders dense list
- [ ] Test columns prop specifies visible fields
- [ ] Test sortable prop enables sorting
- [ ] Test selectable prop enables row selection
- [ ] Test pagination prop enables pagination
- [ ] Test empty state renders correctly
- [ ] Test loading state renders correctly

Test Files:
- tests/views/list/table.test.tsx
- tests/views/list/cards.test.tsx
- tests/views/list/kanban.test.tsx
- tests/views/list/behaviors.test.tsx
```

#### 3.1.2 [GREEN] List View Implementation
```
ID: SAAS-020-GREEN
Type: Implementation
Priority: P0
Estimate: 13 points
Depends: SAAS-020-RED

Acceptance Criteria:
- [ ] Create List component with variant prop
- [ ] Implement Table variant with headers, rows, sorting
- [ ] Implement Cards variant with grid layout
- [ ] Implement Kanban variant with columns
- [ ] Implement Compact variant
- [ ] Implement selection state management
- [ ] Implement pagination state management
- [ ] Implement empty state component
- [ ] Implement loading state component
- [ ] All RED tests pass

Files:
- src/views/List/index.tsx
- src/views/List/Table.tsx
- src/views/List/Cards.tsx
- src/views/List/Kanban.tsx
- src/views/List/Compact.tsx
- src/views/List/EmptyState.tsx
- src/views/List/LoadingState.tsx
- src/views/List/hooks/useSelection.ts
- src/views/List/hooks/usePagination.ts
- src/views/List/hooks/useSorting.ts
```

#### 3.1.3 [REFACTOR] List View Optimization
```
ID: SAAS-020-REFACTOR
Type: Refactor
Priority: P1
Estimate: 3 points
Depends: SAAS-020-GREEN

Acceptance Criteria:
- [ ] Virtualize large lists for performance
- [ ] Extract common behaviors to hooks
- [ ] Add animation support for state changes
- [ ] Optimize re-renders
- [ ] All tests still pass
```

---

### 3.2 Detail View

#### 3.2.1 [RED] Detail View Tests
```
ID: SAAS-021-RED
Type: Test
Priority: P0
Estimate: 3 points

Acceptance Criteria:
- [ ] Test <Detail layout="page" /> renders full page
- [ ] Test <Detail layout="panel" /> renders side panel
- [ ] Test <Detail layout="modal" /> renders modal dialog
- [ ] Test sections prop groups fields
- [ ] Test field labels and values render correctly
- [ ] Test actions render correctly

Test Files:
- tests/views/detail/layouts.test.tsx
- tests/views/detail/sections.test.tsx
```

#### 3.2.2 [GREEN] Detail View Implementation
```
ID: SAAS-021-GREEN
Type: Implementation
Priority: P0
Estimate: 8 points
Depends: SAAS-021-RED

Acceptance Criteria:
- [ ] Create Detail component with layout prop
- [ ] Implement Page layout (full width)
- [ ] Implement Panel layout (drawer from right)
- [ ] Implement Modal layout (centered overlay)
- [ ] Implement Section grouping
- [ ] Implement field label/value rendering
- [ ] Implement action buttons
- [ ] All RED tests pass

Files:
- src/views/Detail/index.tsx
- src/views/Detail/Page.tsx
- src/views/Detail/Panel.tsx
- src/views/Detail/Modal.tsx
- src/views/Detail/Section.tsx
- src/views/Detail/Field.tsx
- src/views/Detail/Actions.tsx
```

---

### 3.3 Form View

#### 3.3.1 [RED] Form View Tests
```
ID: SAAS-022-RED
Type: Test
Priority: P0
Estimate: 5 points

Acceptance Criteria:
- [ ] Test <Form mode="create" /> renders empty form
- [ ] Test <Form mode="edit" /> renders form with values
- [ ] Test <Form mode="wizard" /> renders multi-step form
- [ ] Test text input renders and accepts input
- [ ] Test select input renders options and accepts selection
- [ ] Test checkbox renders and toggles
- [ ] Test validation errors display correctly
- [ ] Test form submission calls handler
- [ ] Test required field indicators

Test Files:
- tests/views/form/modes.test.tsx
- tests/views/form/inputs.test.tsx
- tests/views/form/validation.test.tsx
```

#### 3.3.2 [GREEN] Form View Implementation
```
ID: SAAS-022-GREEN
Type: Implementation
Priority: P0
Estimate: 13 points
Depends: SAAS-022-RED

Acceptance Criteria:
- [ ] Create Form component with mode prop
- [ ] Implement Create mode (empty form)
- [ ] Implement Edit mode (pre-filled form)
- [ ] Implement Wizard mode (steps)
- [ ] Create TextInput component
- [ ] Create SelectInput component
- [ ] Create CheckboxInput component
- [ ] Create DateInput component
- [ ] Implement form state management
- [ ] Implement validation with error display
- [ ] Implement submit handling
- [ ] All RED tests pass

Files:
- src/views/Form/index.tsx
- src/views/Form/Wizard.tsx
- src/views/Form/inputs/TextInput.tsx
- src/views/Form/inputs/SelectInput.tsx
- src/views/Form/inputs/CheckboxInput.tsx
- src/views/Form/inputs/DateInput.tsx
- src/views/Form/hooks/useForm.ts
- src/views/Form/hooks/useValidation.ts
```

---

## Milestone 4: Input & Navigation

### 4.1 Keyboard Input

#### 4.1.1 [RED] Keyboard Input Tests
```
ID: SAAS-030-RED
Type: Test
Priority: P0
Estimate: 3 points

Acceptance Criteria:
- [ ] Test arrow keys navigate list items
- [ ] Test Enter selects/activates item
- [ ] Test Escape closes/cancels
- [ ] Test Tab moves focus forward
- [ ] Test Shift+Tab moves focus backward
- [ ] Test custom key bindings work
- [ ] Test keyboard hints display correctly

Test Files:
- tests/input/keyboard.test.tsx
- tests/input/focus.test.tsx
```

#### 4.1.2 [GREEN] Keyboard Input Implementation
```
ID: SAAS-030-GREEN
Type: Implementation
Priority: P0
Estimate: 5 points
Depends: SAAS-030-RED

Acceptance Criteria:
- [ ] Create useKeyboard hook
- [ ] Create useFocus hook
- [ ] Implement arrow key navigation
- [ ] Implement Enter/Escape handlers
- [ ] Implement Tab/Shift+Tab focus cycling
- [ ] Create KeyboardHints component
- [ ] All RED tests pass

Files:
- src/input/useKeyboard.ts
- src/input/useFocus.ts
- src/input/FocusManager.tsx
- src/components/KeyboardHints.tsx
```

---

### 4.2 Command Palette

#### 4.2.1 [RED] Command Palette Tests
```
ID: SAAS-031-RED
Type: Test
Priority: P1
Estimate: 3 points

Acceptance Criteria:
- [ ] Test Cmd+K opens command palette
- [ ] Test typing filters commands
- [ ] Test arrow keys navigate commands
- [ ] Test Enter executes command
- [ ] Test Escape closes palette
- [ ] Test commands are grouped by category

Test Files:
- tests/components/command-palette.test.tsx
```

#### 4.2.2 [GREEN] Command Palette Implementation
```
ID: SAAS-031-GREEN
Type: Implementation
Priority: P1
Estimate: 5 points
Depends: SAAS-031-RED

Acceptance Criteria:
- [ ] Create CommandPalette component
- [ ] Implement fuzzy search filtering
- [ ] Implement command grouping
- [ ] Implement keyboard navigation
- [ ] Implement command execution
- [ ] All RED tests pass

Files:
- src/components/CommandPalette/index.tsx
- src/components/CommandPalette/CommandList.tsx
- src/components/CommandPalette/CommandItem.tsx
- src/components/CommandPalette/hooks/useCommands.ts
- src/components/CommandPalette/hooks/useFuzzySearch.ts
```

---

## Milestone 5: CLI Generation

### 5.1 CLI Parser

#### 5.1.1 [RED] CLI Parser Tests
```
ID: SAAS-040-RED
Type: Test
Priority: P0
Estimate: 3 points

Acceptance Criteria:
- [ ] Test `app resource list` invokes list command
- [ ] Test `app resource create --field value` parses flags
- [ ] Test `app resource get <id>` parses positional args
- [ ] Test `app --help` shows help
- [ ] Test `app resource --help` shows resource help
- [ ] Test `app --format json` sets output format

Test Files:
- tests/cli/parser.test.ts
- tests/cli/commands.test.ts
```

#### 5.1.2 [GREEN] CLI Parser Implementation
```
ID: SAAS-040-GREEN
Type: Implementation
Priority: P0
Estimate: 5 points
Depends: SAAS-040-RED

Acceptance Criteria:
- [ ] Create CLI argument parser
- [ ] Generate commands from Resource definitions
- [ ] Implement list, get, create, update, delete commands
- [ ] Implement --format flag
- [ ] Implement --help generation
- [ ] All RED tests pass

Files:
- src/cli/parser.ts
- src/cli/commands/list.ts
- src/cli/commands/get.ts
- src/cli/commands/create.ts
- src/cli/commands/update.ts
- src/cli/commands/delete.ts
- src/cli/help.ts
```

---

### 5.2 Interactive Mode

#### 5.2.1 [RED] Interactive Mode Tests
```
ID: SAAS-041-RED
Type: Test
Priority: P0
Estimate: 3 points

Acceptance Criteria:
- [ ] Test `app` (no args) launches interactive mode
- [ ] Test interactive mode shows main view
- [ ] Test navigation between views works
- [ ] Test Ctrl+C exits gracefully

Test Files:
- tests/cli/interactive.test.ts
```

#### 5.2.2 [GREEN] Interactive Mode Implementation
```
ID: SAAS-041-GREEN
Type: Implementation
Priority: P0
Estimate: 5 points
Depends: SAAS-041-RED

Acceptance Criteria:
- [ ] Create InteractiveApp component
- [ ] Implement view routing/navigation
- [ ] Implement graceful exit handling
- [ ] Connect CLI to React render
- [ ] All RED tests pass

Files:
- src/cli/interactive.tsx
- src/cli/router.ts
```

---

## Milestone 6: API & SDK Generation

### 6.1 REST API

#### 6.1.1 [RED] REST API Tests
```
ID: SAAS-050-RED
Type: Test
Priority: P0
Estimate: 5 points

Acceptance Criteria:
- [ ] Test GET /api/resources returns list
- [ ] Test GET /api/resources/:id returns single resource
- [ ] Test POST /api/resources creates resource
- [ ] Test PUT /api/resources/:id updates resource
- [ ] Test DELETE /api/resources/:id deletes resource
- [ ] Test validation errors return 400
- [ ] Test not found returns 404

Test Files:
- tests/api/rest.test.ts
```

#### 6.1.2 [GREEN] REST API Implementation
```
ID: SAAS-050-GREEN
Type: Implementation
Priority: P0
Estimate: 8 points
Depends: SAAS-050-RED

Acceptance Criteria:
- [ ] Create Hono/Elysia router from Resource definitions
- [ ] Implement CRUD endpoints
- [ ] Implement validation middleware
- [ ] Implement error handling
- [ ] Add OpenAPI schema generation
- [ ] All RED tests pass

Files:
- src/api/router.ts
- src/api/handlers/list.ts
- src/api/handlers/get.ts
- src/api/handlers/create.ts
- src/api/handlers/update.ts
- src/api/handlers/delete.ts
- src/api/middleware/validation.ts
- src/api/openapi.ts
```

---

### 6.2 MCP Server

#### 6.2.1 [RED] MCP Server Tests
```
ID: SAAS-051-RED
Type: Test
Priority: P0
Estimate: 5 points

Acceptance Criteria:
- [ ] Test MCP server initializes with tools
- [ ] Test tools are generated from Resources
- [ ] Test list tool returns resources
- [ ] Test create tool creates resource
- [ ] Test MCP protocol messages are valid

Test Files:
- tests/mcp/server.test.ts
- tests/mcp/tools.test.ts
```

#### 6.2.2 [GREEN] MCP Server Implementation
```
ID: SAAS-051-GREEN
Type: Implementation
Priority: P0
Estimate: 8 points
Depends: SAAS-051-RED

Acceptance Criteria:
- [ ] Create MCP server with stdio transport
- [ ] Generate tools from Resource definitions
- [ ] Implement tool handlers for CRUD
- [ ] Generate tool schemas from field definitions
- [ ] All RED tests pass

Files:
- src/mcp/server.ts
- src/mcp/tools/generator.ts
- src/mcp/handlers/list.ts
- src/mcp/handlers/create.ts
- src/mcp/handlers/update.ts
- src/mcp/handlers/delete.ts
```

---

### 6.3 TypeScript SDK

#### 6.3.1 [RED] SDK Generation Tests
```
ID: SAAS-052-RED
Type: Test
Priority: P1
Estimate: 3 points

Acceptance Criteria:
- [ ] Test SDK types are generated from schema
- [ ] Test SDK client methods match API
- [ ] Test SDK handles errors correctly

Test Files:
- tests/sdk/generation.test.ts
- tests/sdk/client.test.ts
```

#### 6.3.2 [GREEN] SDK Generation Implementation
```
ID: SAAS-052-GREEN
Type: Implementation
Priority: P1
Estimate: 5 points
Depends: SAAS-052-RED

Acceptance Criteria:
- [ ] Generate TypeScript types from schema
- [ ] Generate client class with methods
- [ ] Generate request/response types
- [ ] All RED tests pass

Files:
- src/sdk/generator.ts
- src/sdk/templates/client.ts
- src/sdk/templates/types.ts
```

---

## Milestone 7: Data Layer

### 7.1 In-Memory Store

#### 7.1.1 [RED] In-Memory Store Tests
```
ID: SAAS-060-RED
Type: Test
Priority: P0
Estimate: 3 points

Acceptance Criteria:
- [ ] Test store.create() adds record
- [ ] Test store.list() returns records
- [ ] Test store.get(id) returns single record
- [ ] Test store.update(id, data) modifies record
- [ ] Test store.delete(id) removes record
- [ ] Test store persists between operations

Test Files:
- tests/data/memory-store.test.ts
```

#### 7.1.2 [GREEN] In-Memory Store Implementation
```
ID: SAAS-060-GREEN
Type: Implementation
Priority: P0
Estimate: 3 points
Depends: SAAS-060-RED

Acceptance Criteria:
- [ ] Create MemoryStore class
- [ ] Implement CRUD methods
- [ ] Implement ID generation
- [ ] Add timestamps (createdAt, updatedAt)
- [ ] All RED tests pass

Files:
- src/data/MemoryStore.ts
- src/data/types.ts
```

---

### 7.2 SQLite Adapter

#### 7.2.1 [RED] SQLite Adapter Tests
```
ID: SAAS-061-RED
Type: Test
Priority: P1
Estimate: 3 points

Acceptance Criteria:
- [ ] Test SQLite store persists to file
- [ ] Test schema is created from Resource
- [ ] Test CRUD operations work
- [ ] Test migrations run correctly

Test Files:
- tests/data/sqlite-store.test.ts
```

#### 7.2.2 [GREEN] SQLite Adapter Implementation
```
ID: SAAS-061-GREEN
Type: Implementation
Priority: P1
Estimate: 5 points
Depends: SAAS-061-RED

Acceptance Criteria:
- [ ] Create SQLiteStore using bun:sqlite
- [ ] Generate CREATE TABLE from schema
- [ ] Implement CRUD with SQL
- [ ] Implement simple migrations
- [ ] All RED tests pass

Files:
- src/data/SQLiteStore.ts
- src/data/migrations.ts
- src/data/schema-to-sql.ts
```

---

## Summary

### Ticket Count by Milestone

| Milestone | RED | GREEN | REFACTOR | Total |
|-----------|-----|-------|----------|-------|
| 1. Core Infrastructure | 3 | 3 | 3 | 9 |
| 2. Schema & App | 3 | 3 | 2 | 8 |
| 3. View System | 3 | 3 | 1 | 7 |
| 4. Input & Navigation | 2 | 2 | 0 | 4 |
| 5. CLI Generation | 2 | 2 | 0 | 4 |
| 6. API & SDK | 3 | 3 | 0 | 6 |
| 7. Data Layer | 2 | 2 | 0 | 4 |
| **Total** | **18** | **18** | **6** | **42** |

### Story Points by Type

| Type | Points |
|------|--------|
| RED (Tests) | ~52 |
| GREEN (Implementation) | ~91 |
| REFACTOR | ~12 |
| **Total** | **~155** |

### Critical Path

```
SAAS-001 (Setup) → SAAS-002 (Render) → SAAS-010 (App) → SAAS-011 (Resource)
                                                              ↓
SAAS-020 (List) ← SAAS-030 (Input) ← SAAS-040 (CLI) ← SAAS-060 (Store)
      ↓
SAAS-021 (Detail) → SAAS-022 (Form) → SAAS-050 (API) → SAAS-051 (MCP)
```

### Definition of Done

Each ticket is complete when:
1. All acceptance criteria are met
2. All tests pass (`bun test`)
3. Code is typed (`bun run typecheck`)
4. Code is linted (`bun run lint`)
5. Documentation is updated
6. PR is reviewed and merged

---

## Next Steps

1. **Create GitHub Issues**: Convert each ticket to GitHub issue with labels
2. **Set up CI**: Configure GitHub Actions for test/lint/typecheck
3. **Sprint Planning**: Prioritize tickets for first sprint
4. **Architecture Review**: Validate OpenTUI vs Ink decision
5. **Begin SAAS-001**: Start with project scaffolding
