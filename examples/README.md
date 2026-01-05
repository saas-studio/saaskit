# SaaSkit Examples

Runnable example applications demonstrating SaaSkit features and patterns.

## Quick Start

```bash
# Navigate to any example
cd examples/todo-app

# Generate the application
npx saaskit generate schema.yaml

# Run the seed script (optional)
bun run seed.ts

# Start the app
npx saaskit dev
```

## Examples

| Example | Description | Key Features |
|---------|-------------|--------------|
| [**todo-app**](./todo-app/) | Simple todo list | Basic CRUD, relationships, shorthand syntax |
| [**crm**](./crm/) | Customer relationship management | Complex relations, workflows, multiple views |
| [**blog**](./blog/) | Content management platform | Many-to-many, content workflows, moderation |
| [**project-tracker**](./project-tracker/) | Kanban project management | Task workflows, team collaboration, labels |

## Example Details

### Todo App
The simplest example - a classic todo list with categories.

```
todos (belongs to) -> lists
```

**Demonstrates:**
- Shorthand YAML schema syntax
- Basic field types (text, boolean, date, select)
- One-to-many relationships
- Auto-generated IDs and timestamps

### CRM
A complete customer relationship management system.

```
contacts (belongs to) -> companies
deals (belongs to) -> contacts, companies
activities (belongs to) -> contacts, deals
```

**Demonstrates:**
- Complex entity relationships
- Enum/select fields with workflows
- State machines (deal pipeline, contact lifecycle)
- Multiple view types (table, kanban, calendar)
- Cascade delete behaviors

### Blog
A content management platform with authors, posts, tags, and comments.

```
posts (belongs to) -> authors
posts <-> tags (many-to-many via post_tags)
comments (belongs to) -> posts
```

**Demonstrates:**
- Many-to-many relationships with junction tables
- Content workflow (draft/published/archived)
- Comment moderation (approved flag)
- Slug fields with unique constraints

### Project Tracker
A kanban-style project management tool.

```
projects (belongs to) -> users (owner)
tasks (belongs to) -> projects, users (assignee)
tasks <-> labels (many-to-many via task_labels)
comments (belongs to) -> tasks, users
```

**Demonstrates:**
- Full kanban workflow (backlog → todo → in_progress → review → done)
- Priority levels (P0-P3)
- User roles (admin, member, viewer)
- Time tracking (estimated vs actual hours)
- Task actions (start, submit-for-review, complete)

## What Each Example Includes

Every example contains:

| File | Purpose |
|------|---------|
| `schema.yaml` | SaaSkit schema definition |
| `README.md` | Documentation with CLI/API examples |
| `seed.ts` | Sample data generator |

## Running the Examples

### Using the Generated CLI

```bash
# After generating, the CLI is available
todo-app list todos
crm deal pipeline
blog posts list --status published
project-tracker board tasks
```

### Using the REST API

```bash
# All examples expose a REST API
curl http://localhost:3000/api/todos
curl http://localhost:3000/api/contacts
curl http://localhost:3000/api/posts
curl http://localhost:3000/api/tasks
```

### Using the MCP Server

Each example can run as an MCP server for AI agent integration:

```bash
todo-app mcp
crm mcp
blog mcp
project-tracker mcp
```

## Creating Your Own Example

1. Create a new directory: `examples/my-app/`
2. Define your schema in `schema.yaml`
3. Write a `seed.ts` for sample data
4. Document in `README.md`

Use these examples as templates for your own applications!

## License

MIT - Part of the SaaSkit project.
