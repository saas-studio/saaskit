# Project Tracker Example

A kanban-style project management application built with SaaSkit. This example demonstrates task lifecycle management, team collaboration, and flexible categorization patterns.

```
+==============================================================================+
|  PROJECT TRACKER                                                [+ New Task] |
+==============================================================================+

+----------------+ +----------------+ +----------------+ +----------------+ +----------------+
| BACKLOG    (3) | | TODO       (2) | | IN PROGRESS(2) | | REVIEW     (1) | | DONE       (4) |
+----------------+ +----------------+ +----------------+ +----------------+ +----------------+
|                | |                | |                | |                | |                |
| +-----------+  | | +-----------+  | | +-----------+  | | +-----------+  | | +-----------+  |
| | Research  |  | | | Design    |  | | | Build API |  | | | Code      |  | | | Project   |  |
| | auth libs |  | | | database  |  | | | endpoints |  | | | review    |  | | | setup     |  |
| |-----------|  | | |-----------|  | | |-----------|  | | | PR #42    |  | | |-----------|  |
| | @sarah    |  | | | @mike     |  | | | @alex     |  | | |-----------|  | | | @team     |  |
| | [P2] Med  |  | | | [P1] High |  | | | [P0] Crit |  | | | @sarah    |  | | | [x] Done  |  |
| | #backend  |  | | | #database |  | | | #api      |  | | | [P1] High |  | | | #setup    |  |
| +-----------+  | | +-----------+  | | +-----------+  | | +-----------+  | | +-----------+  |
|                | |                | |                | |                | |                |
+----------------+ +----------------+ +----------------+ +----------------+ +----------------+

[n] New  [m] Move  [e] Edit  [/] Search  [?] Help  [q] Quit
```

## Features

- **Projects** - Organize work into distinct projects with owners and timelines
- **Kanban Tasks** - Visual workflow with backlog, todo, in_progress, review, done stages
- **Priority Levels** - P0 (critical) through P3 (low) prioritization
- **Team Assignments** - Assign tasks to team members with role-based access
- **Comments** - Collaborate with threaded discussions on tasks
- **Labels** - Flexible tagging for cross-cutting categorization
- **Time Tracking** - Estimate and track actual hours spent

## Quick Start

```bash
# Generate the project-tracker app from schema
npx saaskit generate examples/project-tracker/schema.yaml

# Start the application
cd project-tracker
npm install
npm start
```

## Schema Overview

```
+-------------+       +-------------+       +-------------+
|   users     |       |  projects   |       |   labels    |
+-------------+       +-------------+       +-------------+
| id          |<------| owner_id    |       | id          |
| name        |       | name        |       | name        |
| email       |       | description |       | color       |
| role        |       | status      |       +------+------+
| avatar_url  |       | start_date  |              |
+------+------+       | due_date    |              |
       |              +------+------+              |
       |                     |                     |
       |              +------+------+       +------+------+
       |              |   tasks     |       | task_labels |
       +------------->| id          |<------| task_id     |
         assignee_id  | title       |       | label_id    |
                      | description |       +-------------+
                      | status      |
                      | priority    |
                      | project_id  |
                      | due_date    |
                      | est_hours   |
                      | actual_hours|
                      +------+------+
                             |
                      +------+------+
                      |  comments   |
                      +-------------+
                      | task_id     |
                      | user_id     |
                      | content     |
                      | created_at  |
                      +-------------+
```

## CLI Commands

### Managing Users

```bash
# Create a new user
project-tracker create user \
  --name "Sarah Chen" \
  --email "sarah@example.com" \
  --role admin

# List all users
project-tracker list users

# Show user details
project-tracker show user sarah-chen
```

### Managing Projects

```bash
# Create a new project
project-tracker create project \
  --name "Website Redesign" \
  --description "Complete overhaul of marketing website" \
  --status active \
  --owner sarah-chen \
  --start-date 2025-01-15 \
  --due-date 2025-03-31

# List active projects
project-tracker list projects --status active

# Update project status
project-tracker update project website-redesign --status completed
```

### Managing Tasks

```bash
# Create a new task
project-tracker create task \
  --title "Design new homepage layout" \
  --description "Create wireframes and mockups for the new homepage" \
  --project website-redesign \
  --assignee mike-johnson \
  --priority P1 \
  --status todo \
  --due-date 2025-02-01 \
  --estimated-hours 16

# List tasks in a project
project-tracker list tasks --project website-redesign

# Move task through kanban stages
project-tracker task start design-new-homepage
project-tracker task submit-for-review design-new-homepage
project-tracker task complete design-new-homepage

# View the kanban board
project-tracker board tasks --project website-redesign

# Filter by status
project-tracker list tasks --status in_progress

# Filter by assignee
project-tracker list tasks --assignee mike-johnson

# Filter by priority
project-tracker list tasks --priority P0,P1
```

### Managing Labels

```bash
# Create labels
project-tracker create label --name "bug" --color "#ef4444"
project-tracker create label --name "feature" --color "#22c55e"
project-tracker create label --name "urgent" --color "#f59e0b"

# Apply labels to tasks
project-tracker create task-label \
  --task design-new-homepage \
  --label feature

# List tasks by label
project-tracker list tasks --label bug
```

### Comments

```bash
# Add a comment to a task
project-tracker create comment \
  --task design-new-homepage \
  --user sarah-chen \
  --content "Looking great! Just a few tweaks needed on the header."

# View task with comments
project-tracker show task design-new-homepage --include comments
```

## API Endpoints

### Projects

```bash
# List all projects
GET /api/projects

# Create a project
POST /api/projects
Content-Type: application/json
{
  "name": "Website Redesign",
  "description": "Complete overhaul of marketing website",
  "status": "active",
  "owner_id": "usr_abc123",
  "start_date": "2025-01-15",
  "due_date": "2025-03-31"
}

# Get a project
GET /api/projects/:id

# Update a project
PUT /api/projects/:id
{ "status": "completed" }

# Delete a project
DELETE /api/projects/:id
```

### Tasks

```bash
# List tasks (with filtering)
GET /api/tasks
GET /api/tasks?project_id=prj_abc123
GET /api/tasks?status=in_progress
GET /api/tasks?assignee_id=usr_xyz789
GET /api/tasks?priority=P0,P1

# Create a task
POST /api/tasks
{
  "title": "Build API endpoints",
  "project_id": "prj_abc123",
  "assignee_id": "usr_xyz789",
  "priority": "P1",
  "status": "todo",
  "estimated_hours": 24
}

# Update task status (move on kanban)
PATCH /api/tasks/:id
{ "status": "in_progress" }

# Get task with related data
GET /api/tasks/:id?include=comments,labels
```

## TypeScript SDK

```typescript
import { ProjectTrackerClient } from 'project-tracker-sdk'

const client = new ProjectTrackerClient({ apiKey: '...' })

// Create a project
const project = await client.projects.create({
  name: 'Website Redesign',
  description: 'Complete overhaul of marketing website',
  status: 'active',
  owner_id: 'usr_abc123',
  start_date: new Date('2025-01-15'),
  due_date: new Date('2025-03-31')
})

// Create a task
const task = await client.tasks.create({
  title: 'Design homepage layout',
  project_id: project.id,
  assignee_id: 'usr_xyz789',
  priority: 'P1',
  status: 'todo',
  estimated_hours: 16
})

// Move task through workflow
await client.tasks.update(task.id, { status: 'in_progress' })
await client.tasks.update(task.id, { status: 'review' })
await client.tasks.update(task.id, { status: 'done', actual_hours: 18 })

// Add a comment
await client.comments.create({
  task_id: task.id,
  user_id: 'usr_abc123',
  content: 'Great work on this!'
})

// List tasks on the board
const boardTasks = await client.tasks.list({
  project_id: project.id,
  status: ['todo', 'in_progress', 'review']
})

// Group by status for kanban view
const kanban = {
  backlog: boardTasks.filter(t => t.status === 'backlog'),
  todo: boardTasks.filter(t => t.status === 'todo'),
  in_progress: boardTasks.filter(t => t.status === 'in_progress'),
  review: boardTasks.filter(t => t.status === 'review'),
  done: boardTasks.filter(t => t.status === 'done')
}
```

## MCP Server

The project-tracker runs as an MCP server for AI agent integration:

```bash
# Start MCP server
project-tracker mcp
```

Configure in Claude Desktop:

```json
{
  "mcpServers": {
    "project-tracker": {
      "command": "project-tracker",
      "args": ["mcp"]
    }
  }
}
```

Now Claude can manage your projects:

> "Create a new project called 'Q1 Planning' with me as owner"

> "Show me all P0 and P1 tasks that are in progress"

> "Move the 'Build API' task to review and add a comment that it's ready"

## Workflow Examples

### Sprint Planning Workflow

```bash
# 1. Create the sprint project
project-tracker create project \
  --name "Sprint 42" \
  --status active \
  --owner sarah-chen \
  --start-date 2025-01-20 \
  --due-date 2025-02-03

# 2. Pull tasks from backlog to todo
project-tracker task move-to-todo research-auth-libs
project-tracker task move-to-todo design-database

# 3. Assign team members
project-tracker update task research-auth-libs --assignee sarah-chen
project-tracker update task design-database --assignee mike-johnson
```

### Daily Standup View

```bash
# See what's in progress
project-tracker list tasks --status in_progress --format table

# Output:
# +-------------------------+----------+------------+----------+
# | Title                   | Priority | Assignee   | Due      |
# +-------------------------+----------+------------+----------+
# | Build API endpoints     | P0       | @alex      | Jan 25   |
# | Implement auth flow     | P1       | @sarah     | Jan 26   |
# +-------------------------+----------+------------+----------+

# See what's blocked in review
project-tracker list tasks --status review
```

### Kanban Board ASCII View

```bash
project-tracker board tasks --project sprint-42

# Output:
SPRINT 42 - Tasks Board

BACKLOG (2)              TODO (3)                 IN PROGRESS (2)          REVIEW (1)               DONE (5)
------------------------------------------------------------------------------------------------------------

[1] Research caching     [4] Write API tests      [7] Build auth flow      [10] PR Review           [12] Setup CI
    (unassigned)             @sarah                   @sarah                   #42 ready                @team
    [P3] Low                 [P2] Medium              [P1] High                @alex                    [x] Complete
    #performance             #testing                 #auth                    [P1] High

[2] Explore new UI lib   [5] Design error pages   [8] Optimize queries
    (unassigned)             @mike                    @alex
    [P3] Low                 [P2] Medium              [P0] Critical
    #frontend                #design                  #database

                         [6] Update docs
                             @mike
                             [P3] Low
                             #docs

------------------------------------------------------------------------------------------------------------
Total: 13 tasks | Velocity: 5 done this sprint

[n] New  [m] Move  [e] Edit  [d] Delete  [/] Search  [?] Help
```

### Time Tracking Report

```bash
project-tracker report time --project sprint-42

# Output:
SPRINT 42 - Time Report

Task                          Estimated    Actual    Variance
--------------------------------------------------------------
Build auth flow               16h          18h       +2h (12.5%)
Optimize queries              8h           6h        -2h (25%)
Write API tests               12h          12h       0h
Design error pages            8h           10h       +2h (25%)
--------------------------------------------------------------
Total                         44h          46h       +2h (4.5%)

Completed: 4 tasks
Remaining: 9 tasks (est. 72h)
```

## Output Formats

All commands support multiple output formats for different use cases:

```bash
# Interactive terminal (default)
project-tracker board tasks

# JSON for scripting
project-tracker list tasks --format json | jq '.[] | select(.priority == "P0")'

# Markdown for documentation
project-tracker list tasks --format markdown > sprint-tasks.md

# CSV for spreadsheets
project-tracker list tasks --format csv > tasks.csv

# Plain text for logs
project-tracker list tasks --format plain
```

## Data Model Reference

### Task Status Flow (Kanban)

```
backlog --> todo --> in_progress --> review --> done
   ^         |           |            |
   |         v           v            |
   +---------+-----------+------------+
             (can move backwards)
```

### Priority Levels

| Level | Name     | Usage                              |
|-------|----------|-------------------------------------|
| P0    | Critical | Drop everything, fix immediately   |
| P1    | High     | Current sprint priority            |
| P2    | Medium   | Next sprint or when time allows    |
| P3    | Low      | Backlog, nice-to-have              |

### User Roles

| Role   | Permissions                                    |
|--------|------------------------------------------------|
| admin  | Full access, manage users, delete projects     |
| member | Create/edit tasks, comment, view all projects  |
| viewer | Read-only access to assigned projects          |

### Project Status

| Status    | Description                          |
|-----------|--------------------------------------|
| active    | Currently being worked on            |
| on_hold   | Temporarily paused                   |
| completed | All work finished                    |

## Seed Data

Generate sample data for testing:

```bash
# Run the seed script
npx ts-node examples/project-tracker/seed.ts

# Or with the CLI
project-tracker seed
```

This creates a realistic project with:
- 3 users (admin, 2 members)
- 1 active project
- 12 tasks across all kanban stages
- 5 labels
- Sample comments and label assignments

## License

MIT - See the main SaaSkit repository for details.
