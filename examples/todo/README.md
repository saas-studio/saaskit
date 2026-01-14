# Todo App Example

A minimal todo list application demonstrating SaaSkit's core features.

## What This Example Demonstrates

- **Schema Definition**: Using shorthand YAML syntax to define resources
- **Relationships**: Todos belong to Lists (one-to-many)
- **Field Types**: text, boolean, date, select (enum), auto-generated timestamps
- **CLI Interface**: CRUD operations via command line
- **REST API**: Programmatic access to todos and lists
- **MCP Server**: AI agent integration

## Schema Overview

```
+------------------+         +------------------+
|      List        |         |      Todo        |
+------------------+         +------------------+
| id (auto)        |<-----+  | id (auto)        |
| name             |      |  | title            |
| color?           |      |  | completed        |
| description?     |      +--| list (->List)    |
| createdAt (auto) |         | priority (enum)  |
+------------------+         | dueDate?         |
                             | createdAt (auto) |
                             +------------------+
```

## Running the Example

### Prerequisites

- [Bun](https://bun.sh) >= 1.2.0
- SaaSkit installed

### Start the Application

```bash
# From the saaskit root directory
cd examples/todo

# Run in development mode
bun run dev

# Or use tsx
npx tsx index.ts
```

## CLI Commands

### Lists

```bash
# Create a list
todos list create --name "Work" --color "#3b82f6" --description "Work tasks"

# List all lists
todos list list

# Get a specific list
todos list get <list-id>

# Update a list
todos list update <list-id> --name "Work Projects"

# Delete a list
todos list delete <list-id>
```

### Todos

```bash
# Create a todo
todos todo create --title "Review PR" --priority high --list <list-id>

# List all todos
todos todo list

# List todos by priority
todos todo list --priority high

# List incomplete todos
todos todo list --completed false

# Mark a todo as complete
todos todo update <todo-id> --completed true

# Delete a todo
todos todo delete <todo-id>
```

### Output Formats

```bash
# Default terminal UI
todos todo list

# JSON output (for piping)
todos todo list --format json

# Markdown table
todos todo list --format markdown

# CSV export
todos todo list --format csv
```

## REST API

### Lists Endpoints

```bash
# List all
GET /api/lists

# Create
POST /api/lists
Content-Type: application/json
{"name": "Work", "color": "#3b82f6"}

# Get one
GET /api/lists/:id

# Update
PUT /api/lists/:id
Content-Type: application/json
{"name": "Updated Name"}

# Delete
DELETE /api/lists/:id
```

### Todos Endpoints

```bash
# List all
GET /api/todos

# Filter by list
GET /api/todos?list=<list-id>

# Filter by priority
GET /api/todos?priority=high

# Create
POST /api/todos
Content-Type: application/json
{"title": "New task", "priority": "medium", "list": "<list-id>"}

# Get one
GET /api/todos/:id

# Update
PUT /api/todos/:id
Content-Type: application/json
{"completed": true}

# Delete
DELETE /api/todos/:id
```

### Example with curl

```bash
# Create a list
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -d '{"name": "Shopping", "color": "#22c55e"}'

# Create a todo in that list
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "priority": "medium", "list": "<list-id>"}'

# Mark as complete
curl -X PUT http://localhost:3000/api/todos/<todo-id> \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

## MCP Server

Start the MCP server for AI agent integration:

```bash
todos mcp
```

Configure in Claude Desktop (`~/.config/claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "todos": {
      "command": "todos",
      "args": ["mcp"]
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `todos_list_list` | List all lists |
| `todos_list_create` | Create a new list |
| `todos_list_get` | Get a list by ID |
| `todos_list_update` | Update a list |
| `todos_list_delete` | Delete a list |
| `todos_todo_list` | List all todos |
| `todos_todo_create` | Create a new todo |
| `todos_todo_get` | Get a todo by ID |
| `todos_todo_update` | Update a todo |
| `todos_todo_delete` | Delete a todo |

## Terminal UI Preview

```
+-----------------------------------------------------------------------------+
|  todos                                                           v1.0.0     |
+-----------------------------------------------------------------------------+
|                                                                             |
|  LISTS                                                         2 items      |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | Name          | Color   | Todos | Created                            |  |
|  +---------------+---------+-------+--------------------------------------+  |
|  | Work          | #3b82f6 | 5     | 2025-01-05                          |  |
|  | Personal      | #22c55e | 3     | 2025-01-05                          |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  TODOS (Work)                                                  5 items      |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | Title                      | Done | Priority | Due        | Actions   |  |
|  +----------------------------+------+----------+------------+-----------+  |
|  | Review PR #123             |  [ ] | high     | 2025-01-06 | [e] [d]   |  |
|  | Update documentation       |  [ ] | medium   | 2025-01-07 | [e] [d]   |  |
|  | Deploy to staging          |  [x] | high     | 2025-01-05 | [e] [d]   |  |
|  | Write unit tests           |  [ ] | low      |     -      | [e] [d]   |  |
|  | Code review feedback       |  [x] | medium   | 2025-01-04 | [e] [d]   |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  [n] New todo    [l] Lists    [/] Search    [?] Help    [q] Quit            |
|                                                                             |
+-----------------------------------------------------------------------------+
```

## Project Structure

```
examples/todo/
  schema.yaml    # Resource definitions
  seed.ts        # Sample data generator
  README.md      # This file
```

## Learn More

- [SaaSkit Documentation](../../README.md)
- [Schema Reference](../../docs/schema.md)
- [CLI Guide](../../docs/cli.md)
- [API Reference](../../docs/api.md)
