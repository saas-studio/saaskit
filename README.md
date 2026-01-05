# SaaSkit

**Headless SaaS for AI Agents**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   The future of SaaS is not browser-based applications for humans.           │
│   It's headless services for AI agents.                                      │
│                                                                              │
│   SaaSkit generates complete SaaS products from a single <App/> component:   │
│                                                                              │
│     • Terminal UI (React Ink)     Primary interface for agents & humans      │
│     • REST API                    Programmatic access                        │
│     • TypeScript SDK              Type-safe client libraries                 │
│     • MCP Server                  Native AI agent integration                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## The Thesis

AI agents are fundamentally changing how software is consumed. The traditional SaaS model—browser-based UIs designed for human point-and-click interaction—is becoming obsolete for an increasing number of use cases.

**What agents need:**
- Clean, parseable output (not pixel-perfect screenshots)
- Structured data alongside human-readable presentation
- CLI interfaces that can be invoked programmatically
- MCP servers for native tool integration
- Self-documenting APIs with predictable patterns

**What SaaSkit provides:**
- A single declarative `<App/>` component that generates everything
- Terminal-first UI that renders beautifully AND degrades to markdown
- Automatic API, SDK, and MCP generation from your schema
- Output that can be copy-pasted, piped, and parsed

## Quick Start

```bash
npx create-saas-app my-app
cd my-app
npm start
```

## The `<App/>` Component

Define your entire SaaS product in a single file:

```tsx
import { App } from 'saaskit'

export default (
  <App name="todos">
    <Task title done priority="low | medium | high" />
  </App>
)
```

That's it. The component name *is* the resource. Attributes *are* the fields. Types are inferred or declared inline.

### Field Shorthand

```tsx
<Task
  title                       // text (required - first field)
  description?                // text (optional)
  done                        // boolean (inferred from name)
  priority="low | medium | high"  // select (pipe-separated options)
  dueDate:date               // explicit type
  assignee->User             // relation to another resource
  tags->Tag[]                // many relation
/>
```

### Expanded Form

When you need more control:

```tsx
import { App, Text, Boolean, Select, Relation } from 'saaskit'

export default (
  <App name="todos">
    <Task>
      <Text name="title" required />
      <Text name="description" />
      <Boolean name="done" default={false} />
      <Select name="priority" options={['low', 'medium', 'high']} default="medium" />
      <Relation name="assignee" to="User" />
    </Task>
  </App>
)
```

This single definition generates:

### Terminal UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  todos                                                           v1.0.0    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TASKS                                                        3 items       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Title                          │ Done │ Priority │ Actions          │  │
│  ├─────────────────────────────────┼──────┼──────────┼──────────────────┤  │
│  │  Build the MVP                  │  ☐   │ high     │ [edit] [delete]  │  │
│  │  Write documentation            │  ☐   │ medium   │ [edit] [delete]  │  │
│  │  Deploy to production           │  ☑   │ high     │ [edit] [delete]  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  [n] New task    [/] Search    [?] Help    [q] Quit                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Markdown Fallback (Agent-Friendly)

The same view, when colors/boxes aren't available:

```markdown
# todos v1.0.0

## TASKS (3 items)

| Title                | Done | Priority |
|----------------------|------|----------|
| Build the MVP        | [ ]  | high     |
| Write documentation  | [ ]  | medium   |
| Deploy to production | [x]  | high     |

Commands: [n]ew [/]search [?]help [q]uit
```

### CLI

```bash
$ todos list
$ todos create --title "New task" --priority high
$ todos update abc123 --done true
$ todos delete abc123
$ todos search "MVP"
```

### REST API

```bash
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### TypeScript SDK

```typescript
import { TodosClient } from 'todos-sdk'

const client = new TodosClient({ apiKey: '...' })

const tasks = await client.tasks.list()
const task = await client.tasks.create({ title: 'New task', priority: 'high' })
await client.tasks.update(task.id, { done: true })
```

### MCP Server

```bash
$ todos mcp
# Starts MCP server on stdio
```

Auto-generated tools:
```json
{
  "tools": [
    {
      "name": "todos_tasks_list",
      "description": "List all tasks",
      "inputSchema": { "type": "object", "properties": {} }
    },
    {
      "name": "todos_tasks_create",
      "description": "Create a new task",
      "inputSchema": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "description": { "type": "string" },
          "done": { "type": "boolean" },
          "priority": { "enum": ["low", "medium", "high"] }
        },
        "required": ["title"]
      }
    }
  ]
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              <App/>                                         │
│                                │                                            │
│                    ┌───────────┴───────────┐                                │
│                    │                       │                                │
│               <Resource/>             <Resource/>                           │
│                    │                       │                                │
│         ┌─────────┴─────────┐    ┌────────┴────────┐                       │
│         │         │         │    │        │        │                       │
│      <Field>   <Field>   <Field> ...                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
         ┌──────────────────────────────────────────────────────┐
         │                    Generators                         │
         ├──────────────┬──────────────┬─────────────┬──────────┤
         │  Terminal UI │   REST API   │     SDK     │   MCP    │
         │  (React Ink) │   (Hono)     │ (TypeScript)│  Server  │
         └──────────────┴──────────────┴─────────────┴──────────┘
```

## Core Concepts

### Resources

Each component becomes a resource with automatic:
- CRUD operations (create, read, update, delete, list)
- Search functionality
- CLI commands
- API endpoints
- SDK methods
- MCP tools

```tsx
<User name email:email bio? createdAt:auto />
```

### Field Syntax

| Syntax | Meaning | Example |
|--------|---------|---------|
| `name` | Required text | `<Task title />` |
| `name?` | Optional text | `<Task description? />` |
| `name:type` | Explicit type | `<Task dueDate:date />` |
| `name:unique` | Unique constraint | `<User email:unique />` |
| `name:auto` | Auto-generated | `<Task createdAt:auto />` |
| `name="a \| b \| c"` | Select options | `<Task status="todo \| done" />` |
| `name->Resource` | Relation | `<Task assignee->User />` |
| `name->Resource[]` | Many relation | `<Task tags->Tag[] />` |
| `name->Resource?` | Optional relation | `<Task assignee->User? />` |

### Type Inference

Common field names are auto-typed:

| Name Pattern | Inferred Type |
|--------------|---------------|
| `done`, `completed`, `active`, `enabled` | Boolean |
| `email` | Email |
| `url`, `website`, `link` | URL |
| `createdAt`, `updatedAt`, `*At` | DateTime |
| `count`, `amount`, `price`, `value` | Number |
| `*Id` | Relation (if resource exists) |

### Views

Views define terminal presentation:

```tsx
<Task title done priority="low | medium | high">
  <View name="list" default columns={['title', 'done', 'priority']} />
  <View name="board" groupBy="priority" />
  <View name="detail" />
</Task>
```

### Actions

Custom operations beyond CRUD:

```tsx
<Task title done>
  <Action name="complete-all" run={async (ctx) => {
    await ctx.db.task.updateMany({ done: true })
    return 'All tasks completed'
  }} />
</Task>
```

```bash
$ todos task complete-all
✓ All tasks completed
```

### Hooks

React to data changes:

```tsx
<Task title done priority="low | medium | high">
  <Hook on="create" run={async (task, ctx) => {
    if (task.priority === 'high') {
      await ctx.notify(`High priority: ${task.title}`)
    }
  }} />
</Task>
```

## Terminal UI Components

Built on React Ink, designed for both human readability and agent parseability:

### Table

```tsx
<Table
  data={tasks}
  columns={[
    { key: 'title', label: 'Title', width: 30 },
    { key: 'done', label: 'Done', render: (v) => v ? '☑' : '☐' },
    { key: 'priority', label: 'Priority' }
  ]}
/>
```

### Form

```tsx
<Form
  onSubmit={handleCreate}
  fields={[
    { name: 'title', type: 'text', required: true },
    { name: 'priority', type: 'select', options: ['low', 'medium', 'high'] }
  ]}
/>
```

### Detail

```tsx
<Detail
  data={task}
  fields={['title', 'description', 'done', 'priority', 'createdAt']}
/>
```

Output:
```
┌─────────────────────────────────────────┐
│  Task: Build the MVP                    │
├─────────────────────────────────────────┤
│  Title:       Build the MVP             │
│  Description: Create initial version    │
│  Done:        ☐                         │
│  Priority:    high                      │
│  Created:     2024-01-15 10:30:00       │
└─────────────────────────────────────────┘
```

### Box

```tsx
<Box title="Stats" border="single">
  <Text>Total: 42</Text>
  <Text>Completed: 28</Text>
  <Text>Pending: 14</Text>
</Box>
```

### Spinner & Progress

```tsx
<Spinner text="Loading..." />
<Progress value={0.75} label="Uploading" />
```

## Output Modes

Every command supports multiple output formats:

```bash
$ todos list                    # Default: Terminal UI
$ todos list --format table     # ASCII table
$ todos list --format json      # JSON (for piping)
$ todos list --format markdown  # Markdown
$ todos list --format csv       # CSV
$ todos list --format yaml      # YAML
```

This is critical for agent interoperability. An agent can request JSON for processing:

```bash
$ todos list --format json | jq '.[] | select(.priority == "high")'
```

## MCP Integration

Every SaaSkit app is an MCP server. Start it with:

```bash
$ todos mcp
```

Configure in Claude Desktop:
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

Now Claude can natively manage your todos:

> "Create a high-priority task to review the PR"
> "Show me all incomplete tasks"
> "Mark the deployment task as done"

## Configuration

```tsx
<App
  name="todos"
  description="Task management"
  version="1.0.0"

  // Database
  database="sqlite://./data.db"  // or postgres://, mysql://, etc.

  // Authentication
  auth={{
    providers: ['api-key', 'oauth'],
    apiKeyHeader: 'X-API-Key'
  }}

  // Rate limiting
  rateLimit={{
    requests: 100,
    window: '1m'
  }}

  // Theming (terminal colors)
  theme={{
    primary: 'cyan',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  }}
>
```

## Why Terminal First?

1. **Agents excel at CLI**: Frontier models are remarkably good at understanding and generating CLI commands. They struggle with screenshots and pixel coordinates.

2. **Composability**: Unix philosophy. Pipe outputs, chain commands, integrate with existing tools.

3. **Accessibility**: Terminal output works over SSH, in containers, in CI/CD, in scripts. Browser UIs don't.

4. **Bandwidth efficiency**: Text is tiny. No asset loading, no JavaScript bundles, no layout thrashing.

5. **Determinism**: Same command, same output. No race conditions from async UI rendering.

6. **Markdown parity**: Terminal tables and boxes map 1:1 to markdown. Easy to document, share, and discuss.

## The Vision

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   Today:                                                                    │
│   Human → Browser → SaaS UI → Database                                      │
│                                                                             │
│   Tomorrow:                                                                 │
│   Agent → CLI/MCP → Headless SaaS → Database                                │
│   Human → Agent → CLI/MCP → Headless SaaS → Database                        │
│                                                                             │
│   The human is still in the loop, but increasingly through natural          │
│   language to agents rather than direct UI manipulation.                    │
│                                                                             │
│   SaaSkit is infrastructure for this future.                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Examples

### CRM

```tsx
<App name="crm">
  <Contact name email:email company? status="lead | prospect | customer | churned" />
  <Deal title contact->Contact value:number stage="discovery | proposal | negotiation | closed" />
  <Activity contact->Contact type="call | email | meeting | note" notes? />
</App>
```

```bash
$ crm contact create --name "Jane Smith" --email "jane@acme.com" --company "Acme Inc"
$ crm deal create --title "Enterprise License" --contact jane-smith --value 50000
$ crm activity create --contact jane-smith --type call --notes "Discussed pricing"
$ crm contact list --status customer
```

### Issue Tracker

```tsx
<App name="issues">
  <Issue title body? status="open | in-progress | resolved | closed" priority="critical | high | medium | low" assignee->User? labels->Label[] />
  <User name email:email />
  <Label name color? />
</App>
```

### Content Management

```tsx
<App name="cms">
  <Post title slug:unique content:markdown status="draft | published | archived" author->Author tags->Tag[] publishedAt:date? />
  <Author name email:email bio? />
  <Tag name:unique />
</App>
```

### The Simplest App

```tsx
<App name="notes">
  <Note content />
</App>
```

That's a complete app. One resource, one field. Generates CLI, API, SDK, MCP—everything.

## Comparison

| Feature | Traditional SaaS | SaaSkit |
|---------|-----------------|---------|
| Primary interface | Browser UI | Terminal CLI |
| Secondary interfaces | Mobile app, API | API, SDK, MCP |
| Target user | Human | AI Agent + Human |
| Output format | Rendered pixels | Structured text |
| Composability | Low (walled garden) | High (Unix pipes) |
| Automation | Selenium/Playwright | Native CLI/API |
| Documentation | Screenshots | Markdown (identical to UI) |

## Roadmap

- [x] Core `<App/>` component
- [x] Resource definition and CRUD
- [x] React Ink terminal UI
- [x] CLI generation
- [x] REST API generation
- [x] TypeScript SDK generation
- [x] MCP server generation
- [ ] Authentication providers
- [ ] Webhooks
- [ ] Real-time subscriptions (WebSocket)
- [ ] Multi-tenancy
- [ ] Plugin system
- [ ] Marketplace

## Philosophy

> "The best interface is no interface."
> — Golden Krishna

For AI agents, this is literally true. They don't need interfaces—they need protocols. SaaSkit provides protocols (CLI, API, MCP) that happen to also render as beautiful terminal UIs for the humans who are still in the loop.

The terminal is not a step backward. It's a return to fundamentals: text in, text out, infinitely composable, universally accessible, and perfectly suited for the age of AI agents.

## Runnable Examples

Explore complete, runnable example applications in the [`examples/`](./examples/) directory:

| Example | Description | Key Features |
|---------|-------------|--------------|
| [**todo-app**](./examples/todo-app/) | Simple todo list | Basic CRUD, relationships, shorthand syntax |
| [**crm**](./examples/crm/) | Customer relationship management | Complex relations, workflows, multiple views |
| [**blog**](./examples/blog/) | Content management platform | Many-to-many, content workflows, moderation |
| [**project-tracker**](./examples/project-tracker/) | Kanban project management | Task workflows, team collaboration, labels |

Each example includes:
- `schema.yaml` — SaaSkit schema definition
- `README.md` — Documentation with CLI/API examples
- `seed.ts` — Sample data generator

```bash
# Try an example
cd examples/todo-app
npx saaskit generate schema.yaml
bun run seed.ts
npx saaskit dev
```

## License

MIT

---

**SaaSkit** — Headless SaaS for the Age of AI Agents
