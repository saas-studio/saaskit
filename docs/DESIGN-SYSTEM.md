# SaaSkit Design System

## The Terminal-First UI Paradigm

This document synthesizes our explorations into a cohesive design paradigm for text-based SaaS interfaces that work for both humans and AI agents.

---

## Core Philosophy

### The Insight

After exploring four rendering styles (plain text, ASCII, Unicode, Terminal/Ink), the key realization is that these aren't competing approaches—they're **progressive enhancement layers**:

```
Layer 0: Structured Data (JSON)
    ↓ render
Layer 1: Plain Text (alphanumeric only)
    ↓ enhance
Layer 2: ASCII (standard keyboard chars)
    ↓ enhance
Layer 3: Unicode (box drawing, symbols)
    ↓ enhance
Layer 4: Terminal (color, bold, animation)
```

Each layer is a **superset** that degrades gracefully to the layer below. The same information is conveyed at every level—decoration increases, meaning stays constant.

### Design Principles

1. **Content-First, Decoration-Optional**
   - Information hierarchy through structure, not style
   - Every view must be meaningful as plain text
   - Colors and borders are enhancement, not requirements

2. **Structural Parity**
   - Same data, same hierarchy, different rendering
   - A table is a table whether rendered with spaces or box-drawing
   - Switching styles shouldn't change comprehension

3. **Semantic Consistency**
   - `[ ]` always means "action", `( )` always means "secondary"
   - `●` always means "active", `○` always means "inactive"
   - Learn once, recognize everywhere

4. **Agent-Friendly Output**
   - Every view can output structured data (JSON) alongside visual
   - Text output is parseable, not just pretty
   - Consistent patterns enable automation

---

## The Rendering Levels

### Level 1: Plain Text

The baseline. Works everywhere: logs, emails, plain files, any terminal.

```
TASKS

  Title                Status      Priority   Due
  ---------------------------------------------------
  Build homepage       [x] Done    High       Jan 15
  Write API docs       [ ] Todo    Medium     Jan 20
  Deploy to prod       [~] Active  High       Jan 22

  Showing 3 of 24 tasks

  Actions: [N]ew  [F]ilter  [Q]uit
```

**Constraints:**
- Letters, numbers, basic punctuation only
- No box-drawing characters
- Hierarchy through whitespace and CAPS

### Level 2: ASCII

Better structure while remaining keyboard-typeable.

```
+==============================================================+
|  TASKS                                              [+] New  |
+==============================================================+

+------+--------------------+----------+----------+------------+
| Done | Title              | Status   | Priority | Due        |
+------+--------------------+----------+----------+------------+
| [x]  | Build homepage     | Done     | High     | Jan 15     |
| [ ]  | Write API docs     | Todo     | Medium   | Jan 20     |
| [~]  | Deploy to prod     | Active   | High     | Jan 22     |
+------+--------------------+----------+----------+------------+

  < Prev | Page 1 of 3 | Next >
```

**Adds:**
- Box drawing with `+`, `-`, `|`
- Better visual containment
- Still copy-pasteable into any text field

### Level 3: Unicode

Beautiful and widely supported by modern terminals.

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 TASKS                                              [+ New]   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ┌──────┬────────────────────┬──────────┬──────────┬──────────┐  ║
║  │ Done │ Title              │ Status   │ Priority │ Due      │  ║
║  ├──────┼────────────────────┼──────────┼──────────┼──────────┤  ║
║  │  ✓   │ Build homepage     │ ● Done   │ ◆ High   │ Jan 15   │  ║
║  │  ○   │ Write API docs     │ ○ Todo   │ ◇ Medium │ Jan 20   │  ║
║  │  ◐   │ Deploy to prod     │ ◐ Active │ ◆ High   │ Jan 22   │  ║
║  └──────┴────────────────────┴──────────┴──────────┴──────────┘  ║
║                                                                  ║
║  ◀ Prev   Page 1 of 3   ▶ Next                    3 of 24 tasks  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**Adds:**
- Proper box-drawing characters (─│┌┐└┘├┤┬┴┼)
- Rich symbols (●○◐✓✗▶◀▲▼★☆)
- Block elements for progress (████░░░░)
- Optional emoji for visual anchors

### Level 4: Terminal (React Ink)

Full interactive experience with color and animation.

```
┌─ TASKS ──────────────────────────────────────────────────── [+ New] ─┐
│                                                                      │
│  ┌──────┬────────────────────┬──────────┬──────────┬──────────┐      │
│  │ Done │ Title              │ Status   │ Priority │ Due      │      │
│  ├──────┼────────────────────┼──────────┼──────────┼──────────┤      │
│  │  ✓   │ Build homepage     │ ● Done   │ ◆ High   │ Jan 15   │ ◀──  │  (selected row, highlighted)
│  │  ○   │ Write API docs     │ ○ Todo   │ ◇ Medium │ Jan 20   │      │
│  │  ◐   │ Deploy to prod     │ ◐ Active │ ◆ High   │ Jan 22   │      │  (◐ animated spinner)
│  └──────┴────────────────────┴──────────┴──────────┴──────────┘      │
│                                                                      │
│  ◀ Prev   Page 1 of 3   ▶ Next                         3 of 24      │
│                                                                      │
│  [n] New  [e] Edit  [d] Delete  [/] Search  [?] Help  [q] Quit       │  (dimmed hints)
└──────────────────────────────────────────────────────────────────────┘
```

**Adds:**
- Semantic colors (green=success, red=error, blue=interactive, dim=secondary)
- Bold/dim/underline for emphasis
- Animated spinners and progress
- Focus/selection highlighting
- Real-time updates

---

## Symbol Language

A consistent vocabulary that scales across all levels:

### Actions

| Meaning | Plain | Unicode | Color |
|---------|-------|---------|-------|
| Primary action | `[ Save ]` | `[ Save ]` | blue bg |
| Secondary action | `( Cancel )` | `( Cancel )` | dim |
| Destructive | `{! Delete !}` | `🗑 Delete` | red |
| Link/navigate | `> View` | `→ View` | blue text |

### Selection

| Meaning | Plain | Unicode | Color |
|---------|-------|---------|-------|
| Checkbox on | `[x]` | `✓` or `■` | green |
| Checkbox off | `[ ]` | `○` or `□` | dim |
| Radio selected | `(*)` | `●` or `◉` | blue |
| Radio unselected | `( )` | `○` | dim |
| Row selected | `> item` | `▶ item` | highlight bg |

### Status

| Meaning | Plain | Unicode | Color |
|---------|-------|---------|-------|
| Active/Online | `[ON]` | `●` | green |
| Inactive/Offline | `[OFF]` | `○` | dim |
| Pending/Loading | `[...]` | `◐` | yellow (animated) |
| Success | `[OK]` | `✓` | green |
| Error | `[ERR]` | `✗` | red |
| Warning | `[!]` | `⚠` | yellow |
| Info | `[i]` | `ℹ` | blue |

### Progress

| Style | Plain | ASCII | Unicode |
|-------|-------|-------|---------|
| Bar empty | `[----------]` | `[..........] ` | `░░░░░░░░░░` |
| Bar 50% | `[=====-----]` | `[#####.....]` | `█████░░░░░` |
| Bar full | `[==========]` | `[##########]` | `██████████` |
| Spinner | `\|/-` | `\|/-` | `◐◓◑◒` or `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` |
| Sparkline | n/a | n/a | `▁▂▃▄▅▆▇█` |

### Navigation

| Meaning | Plain | Unicode |
|---------|-------|---------|
| Expand/Enter | `>` | `▶` or `›` |
| Collapse | `v` | `▼` |
| Back | `<` | `◀` or `‹` |
| Up | `^` | `▲` |
| More options | `...` | `⋯` or `⋮` |
| Breadcrumb sep | `/` or `>` | `›` or `→` |

### Priority/Importance

| Level | Plain | Unicode | Color |
|-------|-------|---------|-------|
| Critical | `[!!!]` | `◆◆◆` | red |
| High | `[!!]` | `◆◆` | orange |
| Medium | `[!]` | `◆` | yellow |
| Low | `[-]` | `◇` | dim |

---

## Border Hierarchy

Borders convey containment and importance:

| Purpose | ASCII | Unicode Single | Unicode Double | Unicode Rounded |
|---------|-------|----------------|----------------|-----------------|
| App shell | `+==+` | `┌──┐` | `╔══╗` | n/a |
| Primary container | `+--+` | `┌──┐` | `╔══╗` | `╭──╮` |
| Secondary container | `+--+` | `┌──┐` | n/a | `╭──╮` |
| Card/panel | `+--+` | `┌──┐` | n/a | `╭──╮` |
| Table | `+--+` | `┌──┐` | n/a | n/a |
| Input field | `[__]` | `┌──┐` | n/a | `╭──╮` |
| Modal/dialog | `+==+` | `┌──┐` | `╔══╗` | n/a |

**Border semantics:**
- **Double lines** (`═║╔╗╚╝`): Primary containers, app shell, emphasis
- **Single lines** (`─│┌┐└┘`): Standard containers, tables, cards
- **Rounded** (`╭╮╰╯`): Friendly/interactive elements, buttons, inputs
- **Heavy** (`━┃┏┓┗┛`): Strong emphasis, selected state

---

## View Taxonomy

### Resource Views (CRUD operations)

```tsx
// List variants
<List variant="table" />      // Rows and columns
<List variant="grid" />       // Cards in grid
<List variant="cards" />      // Large rich cards
<List variant="kanban" />     // Columns by status
<List variant="timeline" />   // Chronological
<List variant="tree" />       // Hierarchical
<List variant="compact" />    // Dense scannable

// Detail variants
<Detail layout="page" />      // Full page
<Detail layout="panel" />     // Side drawer
<Detail layout="modal" />     // Dialog overlay
<Detail layout="inline" />    // Expandable row

// Form variants
<Form mode="create" />        // New record
<Form mode="edit" />          // Modify record
<Form mode="wizard" />        // Multi-step
<Form mode="inline" />        // Edit in place
```

### Aggregate Views

```tsx
<Dashboard>                   // Metrics and charts
  <Metric />                  // KPI card with trend
  <Chart variant="bar" />     // Bar chart
  <Chart variant="line" />    // Line chart
  <Chart variant="sparkline" />
  <Activity />                // Event feed
</Dashboard>
```

### Layout Views

```tsx
<Shell>                       // App container
  <Header />                  // Top navigation
  <Sidebar />                 // Side navigation
  <Main />                    // Content area
  <Footer />                  // Status bar
</Shell>

<Split />                     // Side-by-side panels
<Tabs />                      // Switchable content
<Modal />                     // Overlay dialog
<Panel />                     // Slide-in drawer
```

### Meta Views

```tsx
<Empty variant="no-data" />      // Nothing here yet
<Empty variant="no-results" />   // Search found nothing
<Empty variant="error" />        // Something broke
<Loading variant="spinner" />    // Fetching...
<Loading variant="skeleton" />   // Placeholder shapes
<Loading variant="progress" />   // Known progress
```

---

## Output Modes

Every view supports multiple output formats:

```bash
$ myapp tasks list              # Default: interactive terminal
$ myapp tasks list --plain      # Plain text (Level 1)
$ myapp tasks list --ascii      # ASCII boxes (Level 2)
$ myapp tasks list --unicode    # Unicode (Level 3) [default]
$ myapp tasks list --json       # Structured data
$ myapp tasks list --markdown   # Documentation-ready
$ myapp tasks list --csv        # Spreadsheet-ready
```

### JSON Output (for agents/automation)

```json
{
  "view": "list",
  "resource": "task",
  "data": [
    {"id": "1", "title": "Build homepage", "status": "done", "priority": "high"},
    {"id": "2", "title": "Write API docs", "status": "todo", "priority": "medium"}
  ],
  "pagination": {"page": 1, "total": 24, "perPage": 10},
  "actions": ["create", "edit", "delete", "filter"]
}
```

### Markdown Output (for documentation)

```markdown
# Tasks

| Done | Title | Status | Priority | Due |
|------|-------|--------|----------|-----|
| ✓ | Build homepage | Done | High | Jan 15 |
| ○ | Write API docs | Todo | Medium | Jan 20 |

*Showing 2 of 24 tasks*
```

---

## Component API

### The `<App/>` Definition (recap)

```tsx
<App name="todos">
  <Task title done priority="low | medium | high" assignee->User? />
  <User name email:email />
</App>
```

### View Configuration

```tsx
<App name="todos">
  <Task title done priority="low | medium | high">
    {/* List view configuration */}
    <List
      variant="table"
      columns={['title', 'done', 'priority']}
      sortable={['title', 'priority']}
      filterable={['priority', 'done']}
      selectable
    />

    {/* Alternative list views */}
    <List variant="kanban" groupBy="priority" name="board" />

    {/* Detail view */}
    <Detail layout="panel" sections={['info', 'activity']} />

    {/* Form configuration */}
    <Form mode="create" fields={['title', 'priority', 'assignee']} />
  </Task>
</App>
```

### Behaviors (Headless)

Behaviors are reusable interaction patterns:

```tsx
// Selection
selectable              // Single select
multiSelectable         // Multi-select with checkboxes
rangeSelectable         // Shift-click ranges

// Data operations
sortable={['field1', 'field2']}
filterable={['field1', 'field2']}
searchable
paginated={perPage: 10}
infiniteScroll

// Editing
inlineEditable
draggable
droppable
reorderable

// Navigation
focusable
keyboardNavigable

// State
collapsible
refreshable
autoRefresh={interval: 5000}
```

---

## Standard Patterns

### List with Actions

```
╭──────────────────────────────────────────────────────────────────────────╮
│  📋 TASKS                                   [+ New]  [⚙ Settings]        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🔍 [Search...                    ]   Priority: [All ▾]   Status: [All ▾]│
│                                                                          │
│  ┌────┬──────────────────────────────┬──────────┬──────────┬───────────┐ │
│  │    │ Title                        │ Status   │ Priority │ Due       │ │
│  ├────┼──────────────────────────────┼──────────┼──────────┼───────────┤ │
│  │ ■  │ Build homepage               │ ● Done   │ ◆ High   │ Jan 15    │ │
│  │ □  │ Write API docs               │ ○ Todo   │ ◇ Medium │ Jan 20    │ │
│  │ □  │ Deploy to production         │ ◐ Active │ ◆ High   │ Jan 22    │ │
│  └────┴──────────────────────────────┴──────────┴──────────┴───────────┘ │
│                                                                          │
│  1 selected                                                              │
│  ◀ Prev   1 of 3   ▶ Next                                 Showing 3/24   │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
│  [n] New  [e] Edit  [d] Delete  [Enter] Open  [/] Search  [?] Help       │
└──────────────────────────────────────────────────────────────────────────┘
```

### Detail View

```
╭──────────────────────────────────────────────────────────────────────────╮
│  ← Tasks                                                    [Edit] [⋮]   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Build the homepage                                                     │
│   ══════════════════════════════════════════════════════════════════     │
│                                                                          │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│   │ ● Done      │  │ ◆ High      │  │ 📅 Jan 15   │  │ 👤 Sarah    │     │
│   │   Status    │  │   Priority  │  │   Due Date  │  │   Assignee  │     │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                                          │
│   DESCRIPTION                                                            │
│   ─────────────────────────────────────────────────────────────────      │
│   Create the main landing page with hero section, features grid,         │
│   and call-to-action. Should be responsive and follow brand guidelines.  │
│                                                                          │
│   ACTIVITY                                                               │
│   ─────────────────────────────────────────────────────────────────      │
│   ┃                                                                      │
│   ●─── 2h ago   Sarah marked as done                                     │
│   ┃                                                                      │
│   ●─── 1d ago   Mike commented: "Looking good!"                          │
│   ┃                                                                      │
│   ●─── 3d ago   Sarah created task                                       │
│   ╵                                                                      │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
```

### Form View

```
╭──────────────────────────────────────────────────────────────────────────╮
│  ✏️  Create Task                                                    [×]   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Title *                                                                │
│   ╭──────────────────────────────────────────────────────────────────╮   │
│   │ Build the homepage                                               │   │
│   ╰──────────────────────────────────────────────────────────────────╯   │
│                                                                          │
│   Description                                                            │
│   ╭──────────────────────────────────────────────────────────────────╮   │
│   │ Create the main landing page with hero section...               │   │
│   │                                                                  │   │
│   ╰──────────────────────────────────────────────────────────────────╯   │
│   0/500                                                                  │
│                                                                          │
│   Priority                        Due Date                               │
│   ╭───────────────────────────╮   ╭───────────────────────────╮          │
│   │ ◆ High                  ▾ │   │ 📅 Jan 15, 2024           │          │
│   ╰───────────────────────────╯   ╰───────────────────────────╯          │
│                                                                          │
│   Assignee                                                               │
│   ╭──────────────────────────────────────────────────────────────────╮   │
│   │ 👤 Search users...                                             ▾ │   │
│   ╰──────────────────────────────────────────────────────────────────╯   │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│                               ( Cancel )              [ Create Task ]    │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
```

### Dashboard

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  📊 DASHBOARD                                            Last updated: 2m ago║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐       ║
║   │ TASKS              │ │ COMPLETED          │ │ OVERDUE            │       ║
║   │                    │ │                    │ │                    │       ║
║   │      24            │ │      18            │ │       3            │       ║
║   │   ▁▂▃▄▅▆▇█▇▆      │ │   ▂▃▄▅▆▇████      │ │   █▇▆▅▄▃▂▁        │       ║
║   │     +12%           │ │     +25%           │ │     -40%           │       ║
║   └────────────────────┘ └────────────────────┘ └────────────────────┘       ║
║                                                                              ║
║   COMPLETION BY PRIORITY                    RECENT ACTIVITY                  ║
║   ──────────────────────────────────────    ────────────────────────────     ║
║                                                                              ║
║   High   ████████████████░░░░░░░░  67%     ●  Sarah completed "Homepage"     ║
║   Medium ██████████████████████░░  90%     ●  Mike created "API docs"        ║
║   Low    ████████░░░░░░░░░░░░░░░░  33%     ●  System backup completed        ║
║                                             ○  3 more events...              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Empty State

```
╭──────────────────────────────────────────────────────────────────────────╮
│                                                                          │
│                                                                          │
│                              ╭───────╮                                   │
│                              │       │                                   │
│                              │  📋   │                                   │
│                              │       │                                   │
│                              ╰───────╯                                   │
│                                                                          │
│                         No tasks yet                                     │
│                                                                          │
│              Create your first task to get started.                      │
│              Tasks help you track work and stay organized.               │
│                                                                          │
│                          [ + Create Task ]                               │
│                                                                          │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
```

---

## Color Semantics (Terminal Level)

When color is available, use it for **meaning**, not decoration:

| Color | Semantic Use |
|-------|--------------|
| **Green** | Success, active, online, complete, positive change |
| **Red** | Error, destructive action, offline, negative change |
| **Yellow** | Warning, pending, in-progress, caution |
| **Blue** | Interactive elements, links, primary actions, info |
| **Cyan** | Secondary interactive, highlighted content |
| **Dim/Gray** | Disabled, secondary info, hints, borders |
| **Bold** | Emphasis, headings, selected items |
| **Inverse** | Focus indicator, current selection |

---

## Keyboard Conventions

Standard shortcuts across all views:

| Key | Action |
|-----|--------|
| `↑↓` or `jk` | Navigate up/down |
| `←→` or `hl` | Navigate left/right, collapse/expand |
| `Enter` | Open/select/confirm |
| `Escape` | Cancel/close/back |
| `Space` | Toggle checkbox/selection |
| `/` | Focus search |
| `?` | Show help |
| `q` | Quit/close |
| `n` | New/create |
| `e` | Edit |
| `d` | Delete |
| `r` | Refresh |
| `Tab` | Next field/element |
| `Shift+Tab` | Previous field/element |

---

## The Standard

**Default rendering: Unicode (Level 3)**

This provides the best balance of:
- Visual clarity (proper box drawing, rich symbols)
- Wide compatibility (most modern terminals)
- Copy-pasteability (still just text)
- Agent-friendliness (structured, parseable)

**Color: Optional enhancement**

- Never required for comprehension
- Adds meaning when available
- Graceful degradation to symbols-only

**Output format: Interactive by default, with flags**

```bash
myapp tasks list                # Interactive Unicode
myapp tasks list --plain        # Plain text (pipes, logs)
myapp tasks list --json         # Programmatic access
myapp tasks list --markdown     # Documentation
```

---

## Summary

The SaaSkit design system is built on:

1. **Progressive enhancement** - Same content at every rendering level
2. **Semantic symbols** - Consistent vocabulary of meaning
3. **Headless views** - Logic separate from presentation
4. **Multi-format output** - Interactive, static, JSON, markdown
5. **Agent-first** - Structured, parseable, automatable

The terminal is not a limitation—it's a feature. Text interfaces are:
- **Universally accessible** (SSH, containers, CI, scripts)
- **Infinitely composable** (pipes, chains, automation)
- **AI-native** (agents understand text better than pixels)
- **Fast** (no rendering overhead)
- **Portable** (works everywhere)

This is the foundation for Headless SaaS in the Age of AI Agents.
