# SaaSkit Design System

## The Terminal-First UI Paradigm

This document defines the complete design language for text-based SaaS interfaces that work for both humans and AI agents. It serves as the single source of truth for the entire TUI layer.

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [The Rendering Levels](#the-rendering-levels)
3. [Symbol Language](#symbol-language)
4. [Input & Control States](#input--control-states)
5. [Micro-Visualization](#micro-visualization)
6. [Depth & Shadow](#depth--shadow)
7. [Border Hierarchy](#border-hierarchy)
8. [View Taxonomy](#view-taxonomy)
9. [Animation & Timing](#animation--timing)
10. [Responsive Patterns](#responsive-patterns)
11. [Standard Patterns](#standard-patterns)
12. [Loading & Skeleton States](#loading--skeleton-states)
13. [Toast & Notification System](#toast--notification-system)
14. [Output Modes](#output-modes)
15. [Color System](#color-system)
16. [Keyboard Conventions](#keyboard-conventions)
17. [Agent Interaction Protocol](#agent-interaction-protocol)
18. [OpenTUI Integration](#opentui-integration)
19. [Summary](#summary)

---

## Core Philosophy

### The Insight

After exploring four rendering approaches (plain text, ASCII, Unicode, Terminal/Ink), the key realization is that these aren't competing approaches—they're **progressive enhancement layers**:

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

5. **Keyboard-First Interaction**
   - Every action reachable via keyboard
   - Consistent shortcuts across all views
   - Discoverability through help system

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
- Status through bracketed symbols: `[x]` `[ ]` `[~]` `[!]`

**Use cases:**
- Log files and CI output
- Email notifications
- Plain text exports
- Maximum compatibility environments

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
- Box drawing with `+`, `-`, `|`, `=`
- Better visual containment
- Shadow effects with `\` and `_`
- Still copy-pasteable into any text field

**Use cases:**
- Documentation and READMEs
- Slack/Discord messages
- Any environment without Unicode support

### Level 3: Unicode

Beautiful and widely supported by modern terminals. **This is the default.**

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
- Proper box-drawing characters: `─│┌┐└┘├┤┬┴┼`
- Double-line emphasis: `═║╔╗╚╝╠╣╦╩╬`
- Rounded corners: `╭╮╰╯`
- Rich symbols: `●○◐✓✗▶◀▲▼★☆◆◇`
- Block elements: `████░░░░` for progress
- Braille patterns for micro-charts
- Optional emoji for visual anchors

**Use cases:**
- Interactive terminal applications
- Modern CLI tools
- Default rendering mode

### Level 4: Terminal (React Ink / OpenTUI)

Full interactive experience with color and animation.

```
┌─ TASKS ──────────────────────────────────────────────────── [+ New] ─┐
│                                                                      │
│  ┌──────┬────────────────────┬──────────┬──────────┬──────────┐      │
│  │ Done │ Title              │ Status   │ Priority │ Due      │      │
│  ├──────┼────────────────────┼──────────┼──────────┼──────────┤      │
│  │  ✓   │ Build homepage     │ ● Done   │ ◆ High   │ Jan 15   │ ◀──  │  ← selected (cyan bg)
│  │  ○   │ Write API docs     │ ○ Todo   │ ◇ Medium │ Jan 20   │      │
│  │  ◐   │ Deploy to prod     │ ◐ Active │ ◆ High   │ Jan 22   │      │  ← ◐ animated
│  └──────┴────────────────────┴──────────┴──────────┴──────────┘      │
│                                                                      │
│  ◀ Prev   Page 1 of 3   ▶ Next                         3 of 24      │
│                                                                      │
│  [n] New  [e] Edit  [d] Delete  [/] Search  [?] Help  [q] Quit       │  ← dimmed hints
└──────────────────────────────────────────────────────────────────────┘
```

**Adds:**
- Semantic colors (green=success, red=error, blue=interactive, dim=secondary)
- Bold/dim/underline for emphasis
- Animated spinners and progress
- Focus/selection highlighting with background colors
- Real-time updates
- Cursor positioning

**Use cases:**
- Full interactive applications
- Dashboard displays
- Real-time monitoring

---

## Symbol Language

A consistent vocabulary that scales across all levels.

### Actions

| Meaning | Plain | ASCII | Unicode | Color Hint |
|---------|-------|-------|---------|------------|
| Primary action | `[ Save ]` | `[[ Save ]]` | `┃ Save ┃` | blue bg |
| Secondary action | `( Cancel )` | `( Cancel )` | `( Cancel )` | dim |
| Destructive | `{! Delete !}` | `[! Delete !]` | `✗ Delete` | red |
| Ghost/Link | `> View` | `< View >` | `→ View` | blue text |
| Disabled | `- Save -` | `[ - Save - ]` | `┆ Save ┆` | dim all |

### Selection Controls

| Meaning | Plain | ASCII | Unicode | Color |
|---------|-------|-------|---------|-------|
| Checkbox on | `[x]` | `[x]` | `☑` or `■` | green |
| Checkbox off | `[ ]` | `[ ]` | `☐` or `□` | dim |
| Checkbox indeterminate | `[-]` | `[~]` | `▣` | yellow |
| Radio selected | `(*)` | `(*)` | `◉` or `●` | blue |
| Radio unselected | `( )` | `( )` | `○` | dim |
| Toggle on | `[ON\|off]` | `[ON\|\|\|   ]` | `━━━●═══` | green |
| Toggle off | `[on\|OFF]` | `[   \|\|\|OFF]` | `═══●━━━` | dim |
| Row selected | `> item` | `>> item` | `▶ item` | highlight bg |
| Row focused | `* item` | `* item` | `› item` | inverse |

### Status Indicators

| Meaning | Plain | ASCII | Unicode | Color |
|---------|-------|-------|---------|-------|
| Active/Online | `[ON]` | `[*]` | `●` | green |
| Inactive/Offline | `[OFF]` | `[ ]` | `○` | dim |
| Away/Idle | `[AFK]` | `[o]` | `◐` | yellow |
| Busy | `[DND]` | `[!]` | `◑` | red |
| Pending/Loading | `[...]` | `[...]` | `◐` (animated) | yellow |
| Success | `[OK]` | `[v]` | `✓` | green |
| Error | `[ERR]` | `[x]` | `✗` | red |
| Warning | `[!]` | `[!]` | `⚠` | yellow |
| Info | `[i]` | `(i)` | `ℹ` | blue |

### Progress Indicators

| Style | Plain | ASCII | Unicode |
|-------|-------|-------|---------|
| Bar empty | `[----------]` | `[..........]` | `░░░░░░░░░░` |
| Bar 50% | `[=====-----]` | `[#####.....]` | `█████░░░░░` |
| Bar full | `[==========]` | `[##########]` | `██████████` |
| Segmented | `[== == == ]` | `[## ## ## ]` | `▓▓ ▓▓ ▓▓ ░░` |
| Spinner frames | `\ \| / -` | `\ \| / -` | `◐◓◑◒` |
| Braille spinner | n/a | n/a | `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` |
| Circular | n/a | n/a | `◔◑◕●` (25/50/75/100%) |

### Navigation

| Meaning | Plain | ASCII | Unicode |
|---------|-------|-------|---------|
| Expand/Enter | `>` | `>>` | `▶` or `›` |
| Collapse | `v` | `vv` | `▼` |
| Back | `<` | `<<` | `◀` or `‹` |
| Up | `^` | `^^` | `▲` |
| Down | `v` | `vv` | `▼` |
| More options | `...` | `...` | `⋯` or `⋮` |
| Breadcrumb separator | `/` or `>` | `/` or `>` | `›` or `→` |
| External link | `[^]` | `[^]` | `↗` |

### Priority/Importance

| Level | Plain | ASCII | Unicode | Color |
|-------|-------|-------|---------|-------|
| Critical (P0) | `[!!!]` | `[!!!]` | `◆◆◆` | red |
| High (P1) | `[!!]` | `[!!]` | `◆◆` | orange |
| Medium (P2) | `[!]` | `[!]` | `◆` | yellow |
| Low (P3) | `[-]` | `[-]` | `◇` | dim |
| Backlog (P4) | `[.]` | `[.]` | `·` | very dim |

### Complete Icon Library

#### Objects & Entities

| Meaning | Plain | ASCII | Unicode | Emoji |
|---------|-------|-------|---------|-------|
| Folder | `[D]` | `[=]` | `📁` | 📁 |
| File | `[F]` | `[-]` | `📄` | 📄 |
| Document | `[D]` | `[#]` | `📝` | 📝 |
| Image | `[I]` | `[*]` | `🖼` | 🖼 |
| User | `[@]` | `[@]` | `👤` | 👤 |
| Team/Group | `[@@]` | `[@@]` | `👥` | 👥 |
| Settings/Gear | `[*]` | `[*]` | `⚙` | ⚙️ |
| Search | `[?]` | `(?)` | `🔍` | 🔍 |
| Calendar | `[C]` | `[#]` | `📅` | 📅 |
| Clock/Time | `[T]` | `(@)` | `⏰` | ⏰ |
| Lock/Secure | `[L]` | `[#]` | `🔒` | 🔒 |
| Unlock | `[U]` | `[-]` | `🔓` | 🔓 |
| Link | `[>]` | `->` | `🔗` | 🔗 |
| Star/Favorite | `[*]` | `[*]` | `★` / `⭐` | ⭐ |
| Heart/Like | `[<3]` | `<3` | `♥` / `♡` | ❤️ |
| Comment | `["]` | `["]` | `💬` | 💬 |
| Notification | `[!]` | `(!)` | `🔔` | 🔔 |
| Email | `[@]` | `[@]` | `✉` | 📧 |
| Tag | `[#]` | `[#]` | `🏷` | 🏷 |
| Money | `[$]` | `[$]` | `💰` | 💰 |
| Chart | `[~]` | `[~]` | `📊` | 📊 |

#### Actions

| Action | Plain | ASCII | Unicode |
|--------|-------|-------|---------|
| Add/Create | `[+]` | `[+]` | `＋` |
| Remove/Minus | `[-]` | `[-]` | `－` |
| Edit/Pencil | `[E]` | `[/]` | `✎` |
| Delete/Trash | `[X]` | `[x]` | `🗑` |
| Close | `[x]` | `[x]` | `×` |
| Refresh | `[R]` | `(@)` | `⟳` |
| Undo | `[<-]` | `<-` | `↶` |
| Redo | `[->]` | `->` | `↷` |
| Download | `[v]` | `[v]` | `⤓` |
| Upload | `[^]` | `[^]` | `⤒` |
| Copy | `[C]` | `[=]` | `⎘` |
| Cut | `[X]` | `[%]` | `✂` |
| Paste | `[V]` | `[+]` | `📋` |
| Save | `[S]` | `[S]` | `💾` |
| Print | `[P]` | `[P]` | `🖨` |
| Share | `[>]` | `[>]` | `↗` |
| Filter | `[Y]` | `[Y]` | `⚙` |
| Sort | `[^v]` | `[^v]` | `⇅` |

---

## Input & Control States

Every input has multiple states that must be visually distinct at each rendering level.

### Text Input States

```
DEFAULT
Plain:   Email: [____________________]
ASCII:   Email:
         +----------------------+
         |                      |
         +----------------------+
Unicode: ┌─ Email ─────────────────────────────┐
         │                                     │
         └─────────────────────────────────────┘

FOCUSED (cursor active)
Plain:   Email: [> _________________ ]
ASCII:   Email:
         #======================#
         | _                    |
         #======================#
Unicode: ┏━ Email ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
         ┃ █                                   ┃
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
Color:   Primary border, cursor blink

WITH VALUE
Plain:   Email: [user@example.com   ]
ASCII:   Email:
         +----------------------+
         | user@example.com     |
         +----------------------+
Unicode: ┌─ Email ─────────────────────────────┐
         │ user@example.com                    │
         └─────────────────────────────────────┘

ERROR STATE
Plain:   Email: [invalid-email      ] x Invalid format
ASCII:   Email:
         +!!!!!!!!!!!!!!!!!!!!!!+
         | invalid-email        |
         +!!!!!!!!!!!!!!!!!!!!!!+
         ^ Invalid email format
Unicode: ┌─ Email ─────────────────────────────┐
         │ invalid-email                       │
         └─────────────────────────────────────┘
         ⚠ Invalid email format
Color:   Red border, red error text

SUCCESS/VALID STATE
Plain:   Email: [user@example.com   ] / Valid
ASCII:   Email:
         +----------------------+
         | user@example.com   v |
         +----------------------+
Unicode: ┌─ Email ─────────────────────────────┐
         │ user@example.com                  ✓ │
         └─────────────────────────────────────┘
Color:   Green checkmark, green border (subtle)

DISABLED STATE
Plain:   Email: [- user@example.com -] (locked)
ASCII:   Email:
         +- - - - - - - - - - - +
         | user@example.com     |  [locked]
         +- - - - - - - - - - - +
Unicode: ┌┄┄ Email ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐
         ┆ user@example.com                    ┆
         └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘
Color:   Dim text, dim border
```

### Textarea States

```
DEFAULT
Unicode: ┌─ Description ──────────────────────────────────┐
         │                                                │
         │                                                │
         │                                                │
         └────────────────────────────────────────────────┘
         0/500 characters

FOCUSED WITH CONTENT
Unicode: ┏━ Description ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
         ┃ This is the task description that explains     ┃
         ┃ what needs to be done and why it matters.█     ┃
         ┃                                                ┃
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         89/500 characters
```

### Select/Dropdown States

```
CLOSED
Plain:   Priority: [Medium          v]
ASCII:   Priority:
         +------------------------+
         | Medium               v |
         +------------------------+
Unicode: ┌─ Priority ─────────────────────────▾─┐
         │ ◆ Medium                             │
         └──────────────────────────────────────┘

OPEN (focused)
Unicode: ┏━ Priority ━━━━━━━━━━━━━━━━━━━━━━━━━▴━┓
         ┃ ◆ Medium                             ┃
         ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
         │   ◆◆◆ Critical                       │
         │   ◆◆  High                           │
         │ › ◆   Medium                      ✓  │  ← highlighted + selected
         │   ◇   Low                            │
         └──────────────────────────────────────┘
```

### Button States

```
DEFAULT
Plain:   [ Save Changes ]
Unicode: ┌─────────────────┐
         │  Save Changes   │
         └─────────────────┘

PRIMARY (emphasized)
Unicode: ┏━━━━━━━━━━━━━━━━━┓
         ┃  Save Changes   ┃
         ┗━━━━━━━━━━━━━━━━━┛
Color:   Primary background, white text

HOVER/FOCUSED
Unicode: ┏━━━━━━━━━━━━━━━━━┓
         ┃▸ Save Changes  ◂┃
         ┗━━━━━━━━━━━━━━━━━┛
Color:   Lighter primary bg

PRESSED/ACTIVE
Unicode: ▛▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▜
         ▌  Save Changes   ▐
         ▙▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▟
Color:   Darker primary bg

DISABLED
Plain:   - Save Changes -
Unicode: ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐
         ┆  Save Changes   ┆
         └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘
Color:   Dim everything

LOADING
Unicode: ┏━━━━━━━━━━━━━━━━━┓
         ┃  ◐ Saving...    ┃
         ┗━━━━━━━━━━━━━━━━━┛
Color:   Animated spinner
```

---

## Micro-Visualization

### Braille Patterns

Braille characters provide 2×4 dot resolution per character, enabling micro-charts in text:

```
Dot positions:    ⠁⠂⠄⠈⠐⠠⡀⢀
                  1 2 3 4 5 6 7 8

Full block: ⣿    Empty: ⠀
```

#### Sparklines

```
Ascending trend:   ⣀⣀⣠⣤⣴⣶⣾⣿⣿⣿  ↑ 23%
Descending trend:  ⣿⣿⣾⣶⣴⣤⣠⣀⣀⣀  ↓ 15%
Volatile:          ⣀⣤⣀⣤⣶⣤⣶⣿⣶⣿  → 2%
Flat:              ⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤  → 0%
```

#### Metric Cards with Sparklines

```
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│  Revenue           │  │  Active Users      │  │  Error Rate        │
│                    │  │                    │  │                    │
│     $48,250        │  │      2,847         │  │       0.12%        │
│  ⣀⣠⣤⣴⣶⣾⣿⣿⣿⣿  ↑ 12%  │  │  ⣀⣀⣠⣤⣴⣶⣾⣿⣿⣿  ↑ 8%   │  │  ⣿⣶⣴⣤⣠⣀⣀⣀⣀⣀  ↓ 40%  │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

#### Vertical Braille Bars

```
     ⡇
     ⡇  ⡆
  ⡆  ⡇  ⡇  ⡄
  ⡇  ⡇  ⡇  ⡇  ⡂
──────────────────
  M   T   W   T   F
```

### Block Element Charts

#### Horizontal Bar Charts

```
Revenue by Region:
North America  ████████████████████████░░░░░░  80%
Europe         ██████████████████░░░░░░░░░░░░  60%
Asia Pacific   ████████████░░░░░░░░░░░░░░░░░░  40%
Latin America  ██████░░░░░░░░░░░░░░░░░░░░░░░░  20%
```

#### Vertical Bar Charts (using block elements)

```
     █
     █  ▄
  ▄  █  █  ▄
  █  █  █  █  ▂
──────────────────────────
  Q1  Q2  Q3  Q4  Q1

Legend: Each █ = $10K revenue
```

#### Mini Progress Indicators

```
Tasks:    ████████░░  80%    Revenue: ██████████  100%
Bugs:     ████░░░░░░  40%    Users:   ███░░░░░░░  30%
Reviews:  ██████████  95%    Uptime:  ██████████  99.9%
```

#### Heatmap-style Density

```
Activity (last 52 weeks):
░░▒▓██▓▒░░░░▒▓███▓▒░░░░░▒▓██▓▒░░░░▒▓████▓▒░░░░▒▓██

Legend: ░ Low  ▒ Medium  ▓ High  █ Peak
```

---

## Depth & Shadow

Visual depth creates hierarchy and focus. Use sparingly.

### Shadow Styles

```
FLAT (no shadow)
┌──────────────────┐
│     Content      │
└──────────────────┘

SUBTLE (ASCII-compatible)
┌──────────────────┐
│     Content      │
└──────────────────┘\
 \__________________\

ELEVATED (Unicode blocks)
┌──────────────────┐
│     Content      │░
│                  │░
└──────────────────┘░
 ░░░░░░░░░░░░░░░░░░░░

FLOATING (larger shadow)
┌──────────────────┐
│     Content      │░░
│                  │░░
└──────────────────┘░░
 ░░░░░░░░░░░░░░░░░░░░░
  ░░░░░░░░░░░░░░░░░░░░
```

### Modal Overlays

When showing modals, dim the background:

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░╔══════════════════════════════════╗░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░║                                  ║░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░║   Confirm Delete                 ║░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░║                                  ║░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░║   Are you sure you want to       ║░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░║   delete "Project Alpha"?        ║░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░║                                  ║░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░║        ( Cancel )  ┃ Delete ┃    ║░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░║                                  ║░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░╚══════════════════════════════════╝░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

### Depth Hierarchy

| Level | Use | Shadow |
|-------|-----|--------|
| 0 - Flat | Content, tables, inline elements | None |
| 1 - Card | Cards, panels | Subtle `░` |
| 2 - Elevated | Popovers, dropdowns | Medium `░░` |
| 3 - Modal | Dialogs, alerts | Large + dimmed backdrop |
| 4 - Toast | Notifications | Floating, no backdrop |

---

## Border Hierarchy

Borders convey containment, importance, and interactivity.

### Border Styles

| Style | Characters | Use |
|-------|-----------|-----|
| Single | `─│┌┐└┘├┤┬┴┼` | Standard containers |
| Double | `═║╔╗╚╝╠╣╦╩╬` | App shell, emphasis, modals |
| Rounded | `╭╮╰╯` + `─│` | Friendly elements, buttons, inputs |
| Heavy | `━┃┏┓┗┛┣┫┳┻╋` | Strong focus, selected state |
| Dashed | `┄┆┈┊` | Disabled, placeholder, optional |
| Mixed | `╒╕╘╛╞╡╤╧╪` | Tables with emphasis headers |

### Semantic Usage

```
APP SHELL (double line - highest emphasis)
╔══════════════════════════════════════════════════════════════════════╗
║  App Name                                                            ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║

PRIMARY CONTAINER (single line)
┌──────────────────────────────────────────────────────────────────────┐
│  Section Title                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │

CARD (rounded corners - friendly)
╭──────────────────────────────────────────────────────────────────────╮
│                                                                      │
│  Card content here                                                   │
│                                                                      │
╰──────────────────────────────────────────────────────────────────────╯

FOCUSED INPUT (heavy line - attention)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Input value here                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

DISABLED/OPTIONAL (dashed line)
┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐
┆  Optional content                                                    ┆
└┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘
```

### Table Borders

```
STANDARD TABLE
┌──────┬────────────────────┬──────────┬──────────┐
│ ID   │ Title              │ Status   │ Priority │
├──────┼────────────────────┼──────────┼──────────┤
│ 1    │ Build homepage     │ Done     │ High     │
│ 2    │ Write docs         │ Todo     │ Medium   │
└──────┴────────────────────┴──────────┴──────────┘

TABLE WITH EMPHASIZED HEADER
╒══════╤════════════════════╤══════════╤══════════╕
│ ID   │ Title              │ Status   │ Priority │
╞══════╪════════════════════╪══════════╪══════════╡
│ 1    │ Build homepage     │ Done     │ High     │
│ 2    │ Write docs         │ Todo     │ Medium   │
└──────┴────────────────────┴──────────┴──────────┘

BORDERLESS/MINIMAL TABLE
  ID    Title                 Status     Priority
  ────  ────────────────────  ─────────  ──────────
  1     Build homepage        Done       High
  2     Write docs            Todo       Medium
```

---

## View Taxonomy

### Resource Views (CRUD operations)

```tsx
// List variants
<List variant="table" />      // Rows and columns (default)
<List variant="grid" />       // Cards in grid layout
<List variant="cards" />      // Large rich cards, single column
<List variant="kanban" />     // Columns grouped by status/field
<List variant="timeline" />   // Chronological events
<List variant="tree" />       // Hierarchical/nested
<List variant="compact" />    // Dense, scannable rows

// Detail variants
<Detail layout="page" />      // Full page view
<Detail layout="panel" />     // Side drawer (right)
<Detail layout="modal" />     // Dialog overlay
<Detail layout="inline" />    // Expandable row

// Form variants
<Form mode="create" />        // New record
<Form mode="edit" />          // Modify existing
<Form mode="wizard" />        // Multi-step flow
<Form mode="inline" />        // Edit in place
<Form mode="bulk" />          // Edit multiple records
```

### Aggregate Views

```tsx
<Dashboard>                   // Metrics and visualizations
  <Metric />                  // KPI card with trend sparkline
  <Chart variant="bar" />     // Bar chart (ASCII/block)
  <Chart variant="line" />    // Line chart (braille)
  <Chart variant="sparkline" /> // Inline trend
  <Activity />                // Event/audit feed
</Dashboard>
```

### Layout Views

```tsx
<Shell>                       // App container
  <Header />                  // Top bar with branding, nav, user
  <Sidebar />                 // Left navigation
  <Main />                    // Content area
  <Footer />                  // Status bar, keyboard hints
</Shell>

<Split direction="horizontal" />  // Left/right panes
<Split direction="vertical" />    // Top/bottom panes
<Tabs />                          // Switchable content areas
<Modal />                         // Overlay dialog
<Panel position="right" />        // Slide-in drawer
<Panel position="bottom" />       // Bottom sheet
```

### Meta Views

```tsx
<Empty variant="no-data" />      // Nothing exists yet
<Empty variant="no-results" />   // Search/filter found nothing
<Empty variant="error" />        // Something went wrong
<Loading variant="spinner" />    // Fetching data
<Loading variant="skeleton" />   // Placeholder shapes
<Loading variant="progress" />   // Known progress percentage
```

---

## Animation & Timing

### Animation Timing Specifications

| Animation | Interval | Duration | Frames |
|-----------|----------|----------|--------|
| Spinner (dots) | 80ms | ∞ | `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` |
| Spinner (line) | 80ms | ∞ | `─╲│╱` |
| Spinner (bounce) | 120ms | ∞ | `⠁⠂⠄⠂` |
| Spinner (growing) | 100ms | ∞ | `·∙●∙` |
| Cursor blink | 530ms | ∞ | on/off |
| Progress pulse | 100ms | ∞ | sweep left→right |
| Fade in | 50ms/step | 250ms | 5 opacity levels |
| Fade out | 50ms/step | 250ms | 5 opacity levels |
| Typewriter | 30-50ms | varies | character by character |
| Toast appear | 150ms | 150ms | slide + fade |
| Toast dismiss | 200ms | 200ms | fade out |

### Spinner Variants

```
DOTS (braille, smooth)
Frame 1: ⠋  Frame 2: ⠙  Frame 3: ⠹  Frame 4: ⠸
Frame 5: ⠼  Frame 6: ⠴  Frame 7: ⠦  Frame 8: ⠧
Frame 9: ⠇  Frame 10: ⠏

LINE (classic)
Frame 1: ─  Frame 2: ╲  Frame 3: │  Frame 4: ╱

ARC (quarter turns)
Frame 1: ◜  Frame 2: ◝  Frame 3: ◞  Frame 4: ◟

CLOCK (rotating)
Frame 1: ◐  Frame 2: ◓  Frame 3: ◑  Frame 4: ◒

BLOCKS (filling)
Frame 1: ░  Frame 2: ▒  Frame 3: ▓  Frame 4: █

BOUNCE (vertical)
Frame 1: ⠁  Frame 2: ⠂  Frame 3: ⠄  Frame 4: ⠂
```

### Non-Animated Fallbacks

When animation isn't available (logs, static output):

| Animated | Static Fallback |
|----------|-----------------|
| Spinning `◐◓◑◒` | `[...]` or `◐` |
| Blinking cursor | Solid `█` |
| Pulsing progress | Static `████░░░░` |
| Typewriter text | Complete text |
| Fading modal | Instant show/hide |

### Progress Bar Animation

```
INDETERMINATE (sweeping)
Frame 1: ░░░███░░░░░░░░░░
Frame 2: ░░░░███░░░░░░░░░
Frame 3: ░░░░░███░░░░░░░░
...continues sweeping

DETERMINATE (growing)
  0%: ░░░░░░░░░░░░░░░░░░░░
 25%: █████░░░░░░░░░░░░░░░
 50%: ██████████░░░░░░░░░░
 75%: ███████████████░░░░░
100%: ████████████████████
```

---

## Responsive Patterns

### Terminal Width Breakpoints

| Width | Name | Behavior |
|-------|------|----------|
| < 60 | Compact | Single column, truncated content |
| 60-80 | Narrow | Minimal margins, abbreviated labels |
| 80-120 | Standard | Normal layout (default target) |
| > 120 | Wide | Extra columns, expanded content |

### Responsive Table

```
COMPACT (< 60 columns)
┌────────────────────────────────────────────────────┐
│ ✓ Build homepage                             High  │
│ ○ Write API documentation                  Medium  │
│ ◐ Deploy to production                       High  │
└────────────────────────────────────────────────────┘
  3 items

STANDARD (80-120 columns)
┌────┬───────────────────────────┬──────────┬──────────┐
│    │ Title                     │ Status   │ Priority │
├────┼───────────────────────────┼──────────┼──────────┤
│ ✓  │ Build homepage            │ Done     │ High     │
│ ○  │ Write API documentation   │ Todo     │ Medium   │
│ ◐  │ Deploy to production      │ Active   │ High     │
└────┴───────────────────────────┴──────────┴──────────┘
  Showing 3 of 24

WIDE (> 120 columns)
┌────┬───────────────────────────┬──────────┬──────────┬────────────┬──────────────┐
│    │ Title                     │ Status   │ Priority │ Due Date   │ Assignee     │
├────┼───────────────────────────┼──────────┼──────────┼────────────┼──────────────┤
│ ✓  │ Build homepage            │ Done     │ High     │ Jan 15     │ Sarah Chen   │
│ ○  │ Write API documentation   │ Todo     │ Medium   │ Jan 20     │ Mike Johnson │
│ ◐  │ Deploy to production      │ Active   │ High     │ Jan 22     │ Sarah Chen   │
└────┴───────────────────────────┴──────────┴──────────┴────────────┴──────────────┘
  Showing 3 of 24 tasks  │  Page 1 of 3  │  ◀ Prev  ▶ Next
```

### Responsive Cards

```
WIDE (3-column grid)
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Revenue         │  │  Users           │  │  Conversion      │
│  $48,250         │  │  2,847           │  │  3.2%            │
│  ↑ 12%           │  │  ↑ 8%            │  │  ↓ 0.3%          │
└──────────────────┘  └──────────────────┘  └──────────────────┘

STANDARD (2-column grid)
┌───────────────────────────┐  ┌───────────────────────────┐
│  Revenue                  │  │  Users                    │
│  $48,250         ↑ 12%    │  │  2,847           ↑ 8%     │
└───────────────────────────┘  └───────────────────────────┘
┌───────────────────────────┐
│  Conversion               │
│  3.2%            ↓ 0.3%   │
└───────────────────────────┘

COMPACT (stacked)
┌─────────────────────────────────────────────────────────┐
│  Revenue    $48,250 ↑12%  │  Users  2,847 ↑8%          │
├─────────────────────────────────────────────────────────┤
│  Conversion    3.2% ↓0.3%                               │
└─────────────────────────────────────────────────────────┘
```

### Sidebar Collapse

```
EXPANDED (> 80 columns)
┌──────────────────┬──────────────────────────────────────────────┐
│                  │                                              │
│  📊 Dashboard    │  Content area                                │
│  📋 Tasks        │                                              │
│  👥 Team         │                                              │
│  ⚙ Settings      │                                              │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘

COLLAPSED (< 80 columns)
┌────┬────────────────────────────────────────────────────────────┐
│ 📊 │                                                            │
│ 📋 │  Content area (wider)                                      │
│ 👥 │                                                            │
│ ⚙  │                                                            │
└────┴────────────────────────────────────────────────────────────┘

HIDDEN (< 60 columns, menu opens as overlay)
┌─────────────────────────────────────────────────────────────────┐
│  ☰  App Name                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Full-width content area                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Standard Patterns

### List View with Actions

```
╭──────────────────────────────────────────────────────────────────────────╮
│  📋 TASKS                                     [+ New]  [⚙ Settings]      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🔍 [Search...                      ]   Priority: [All ▾]  Status: [All ▾]
│                                                                          │
│  ┌────┬──────────────────────────────┬──────────┬──────────┬───────────┐ │
│  │    │ Title                      ▲ │ Status   │ Priority │ Due       │ │
│  ├────┼──────────────────────────────┼──────────┼──────────┼───────────┤ │
│  │ ■  │ Build homepage               │ ● Done   │ ◆ High   │ Jan 15    │ │
│  │ □  │ Write API documentation      │ ○ Todo   │ ◇ Medium │ Jan 20    │ │
│  │ □  │ Deploy to production         │ ◐ Active │ ◆ High   │ Jan 22    │ │
│  └────┴──────────────────────────────┴──────────┴──────────┴───────────┘ │
│                                                                          │
│  1 selected                                                              │
│  ◀ Prev   1 of 3   ▶ Next                                   Showing 3/24 │
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

### Wizard / Multi-Step Form

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                           Create New Project                                 ║
║                                                                              ║
║      ● ━━━━━━━━━━━━ ● ━━━━━━━━━━━━ ◐ ━━━━━━━━━━━━ ○                          ║
║    Details        Team         Settings       Review                         ║
║      ✓             ✓              3             4                            ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   Step 3: Project Settings                                                   ║
║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║                                                                              ║
║   Visibility                                                                 ║
║   ◉ Public    - Anyone in the organization can view                          ║
║   ○ Private   - Only team members can view                                   ║
║   ○ Secret    - Hidden from project listings                                 ║
║                                                                              ║
║   ─────────────────────────────────────────────────────────────────────────  ║
║                                                                              ║
║   Features                                                                   ║
║   ☑ Enable issue tracking                                                    ║
║   ☑ Enable wiki documentation                                                ║
║   ☐ Enable discussions                                                       ║
║   ☑ Enable CI/CD pipelines                                                   ║
║                                                                              ║
║   ─────────────────────────────────────────────────────────────────────────  ║
║                                                                              ║
║   Notifications                        Auto-archive after                    ║
║   ━━━●═══════  On                      ╭───────────────────────╮             ║
║                                        │ 90 days             ▾ │             ║
║                                        ╰───────────────────────╯             ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║        ‹ Back                                    Next ›           Skip       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Dashboard

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  📊 DASHBOARD                                          Last updated: 2m ago  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐       ║
║   │ TASKS              │ │ COMPLETED          │ │ OVERDUE            │       ║
║   │                    │ │                    │ │                    │       ║
║   │      24            │ │      18            │ │       3            │       ║
║   │   ⣀⣠⣤⣴⣶⣾⣿⣿⣿⣿      │ │   ⣀⣤⣶⣾⣿⣿⣿⣿⣿⣿      │ │   ⣿⣶⣤⣠⣀⣀⣀⣀⣀⣀      │       ║
║   │     ↑ 12%          │ │     ↑ 25%          │ │     ↓ 40%          │       ║
║   └────────────────────┘ └────────────────────┘ └────────────────────┘       ║
║                                                                              ║
║   COMPLETION BY PRIORITY                    RECENT ACTIVITY                  ║
║   ──────────────────────────────────────    ────────────────────────────     ║
║                                                                              ║
║   High   ████████████████░░░░░░░░  67%     ●  Sarah completed "Homepage"     ║
║   Medium ██████████████████████░░  90%        2 minutes ago                  ║
║   Low    ████████░░░░░░░░░░░░░░░░  33%                                       ║
║                                             ●  Mike created "API docs"       ║
║                                                15 minutes ago                ║
║                                                                              ║
║                                             ●  System backup completed       ║
║                                                1 hour ago                    ║
║                                                                              ║
║                                             ○  View all activity →           ║
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
│                        or import from CSV                                │
│                                                                          │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
```

### Error State

```
╭──────────────────────────────────────────────────────────────────────────╮
│                                                                          │
│                                                                          │
│                              ╭───────╮                                   │
│                              │       │                                   │
│                              │  ⚠    │                                   │
│                              │       │                                   │
│                              ╰───────╯                                   │
│                                                                          │
│                      Something went wrong                                │
│                                                                          │
│            We couldn't load your tasks. This might be a                  │
│           temporary issue. Please try again in a few moments.            │
│                                                                          │
│                       Error Code: ERR_500                                │
│                                                                          │
│              ( Contact Support )         [ Try Again ]                   │
│                                                                          │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
```

### Command Palette

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  › search commands...█                                                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  RECENT                                                                      ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  › Create new task                                           Ctrl+N          ║
║    Open settings                                             Ctrl+,          ║
║                                                                              ║
║  NAVIGATION                                                                  ║
║  ────────────────────────────────────────────────────────────────────────    ║
║    Go to Dashboard                                           G then D        ║
║    Go to Tasks                                               G then T        ║
║    Go to Team                                                G then M        ║
║                                                                              ║
║  ACTIONS                                                                     ║
║  ────────────────────────────────────────────────────────────────────────    ║
║    Toggle sidebar                                            Ctrl+B          ║
║    Toggle dark mode                                          Ctrl+Shift+D    ║
║    Sign out                                                                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Loading & Skeleton States

### Spinner Placement

```
INLINE (in buttons, badges)
┏━━━━━━━━━━━━━━━━━┓
┃  ◐ Saving...    ┃
┗━━━━━━━━━━━━━━━━━┛

CENTERED (full page/section loading)
╭──────────────────────────────────────────────────────────────────────────╮
│                                                                          │
│                                                                          │
│                                   ◐                                      │
│                                                                          │
│                          Loading your tasks...                           │
│                                                                          │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯

WITH PROGRESS (known percentage)
╭──────────────────────────────────────────────────────────────────────────╮
│                                                                          │
│                          Importing data...                               │
│                                                                          │
│                    ████████████████░░░░░░░░░░░░  67%                     │
│                                                                          │
│                       Processing row 670 of 1000                         │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
```

### Skeleton Patterns

Use block elements to show loading placeholders that match content shape:

```
TEXT SKELETON
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░

CARD SKELETON
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                        │
│                                         │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░           │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│                                         │
│ ░░░░░░░░░░░               ░░░░░░░░░░░   │
└─────────────────────────────────────────┘

TABLE SKELETON
┌──────┬────────────────────────────┬────────────┐
│ ░░░  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ░░░░░░░░   │
├──────┼────────────────────────────┼────────────┤
│ ░░░  │ ░░░░░░░░░░░░░░░░░░░░░░░░░  │ ░░░░░░░░   │
│ ░░░  │ ░░░░░░░░░░░░░░░░░░░░░      │ ░░░░░░░░   │
│ ░░░  │ ░░░░░░░░░░░░░░░░░░░░░░░    │ ░░░░░░░░   │
└──────┴────────────────────────────┴────────────┘

METRIC CARD SKELETON
┌────────────────────┐  ┌────────────────────┐
│ ░░░░░░░░░░░░░      │  │ ░░░░░░░░░░░░       │
│                    │  │                    │
│ ▓▓▓▓▓▓▓▓▓▓         │  │ ▓▓▓▓▓▓▓▓▓▓▓▓       │
│                    │  │                    │
│ ░░░░░░░░░░░░░░░░   │  │ ░░░░░░░░░░░░░░░    │
└────────────────────┘  └────────────────────┘

LIST SKELETON
┌────────────────────────────────────────────────────────┐
│ ░░░  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ░░░░░░░   ░░░░░░░    │
│ ░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░   ░░░░░░░    │
│ ░░░  ░░░░░░░░░░░░░░░░░░░░░░░     ░░░░░░░   ░░░░░░░    │
└────────────────────────────────────────────────────────┘
```

### Progressive Loading

Show content as it becomes available:

```
STAGE 1: Shell
╭──────────────────────────────────────────────────────────────────────────╮
│  📋 TASKS                                                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                                   ◐                                      │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯

STAGE 2: Structure
╭──────────────────────────────────────────────────────────────────────────╮
│  📋 TASKS                                                    [+ New]     │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌────┬──────────────────────────────┬──────────┬──────────┐             │
│  │    │ Title                        │ Status   │ Priority │             │
│  ├────┼──────────────────────────────┼──────────┼──────────┤             │
│  │ ░░ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ░░░░░░░  │ ░░░░░░░  │             │
│  │ ░░ │ ░░░░░░░░░░░░░░░░░░░░░░░░░    │ ░░░░░░░  │ ░░░░░░░  │             │
│  │ ░░ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░   │ ░░░░░░░  │ ░░░░░░░  │             │
│  └────┴──────────────────────────────┴──────────┴──────────┘             │
╰──────────────────────────────────────────────────────────────────────────╯

STAGE 3: Content
╭──────────────────────────────────────────────────────────────────────────╮
│  📋 TASKS                                                    [+ New]     │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌────┬──────────────────────────────┬──────────┬──────────┐             │
│  │    │ Title                        │ Status   │ Priority │             │
│  ├────┼──────────────────────────────┼──────────┼──────────┤             │
│  │ ✓  │ Build homepage               │ ● Done   │ ◆ High   │             │
│  │ ○  │ Write API documentation      │ ○ Todo   │ ◇ Medium │             │
│  │ ◐  │ Deploy to production         │ ◐ Active │ ◆ High   │             │
│  └────┴──────────────────────────────┴──────────┴──────────┘             │
╰──────────────────────────────────────────────────────────────────────────╯
```

---

## Toast & Notification System

### Toast Types

```
SUCCESS (auto-dismiss: 4s)
┌─ ✓ ────────────────────────────────┐
│ Changes saved successfully         │
└────────────────────────────────────┘

ERROR (persistent until dismissed)
┌─ ✗ ────────────────────────────────┐
│ Failed to save changes             │
│ Please try again                   │
│                        [ Retry ]   │
└────────────────────────────────────┘

WARNING (auto-dismiss: 6s)
┌─ ⚠ ────────────────────────────────┐
│ Your session expires in 5 minutes  │
│                      [ Extend ]    │
└────────────────────────────────────┘

INFO (auto-dismiss: 4s)
┌─ ℹ ────────────────────────────────┐
│ 2 team members are online          │
└────────────────────────────────────┘

LOADING (persistent until complete)
┌─ ◐ ────────────────────────────────┐
│ Uploading file...                  │
│ ████████░░░░░░░░░░░░  40%          │
└────────────────────────────────────┘
```

### Toast Positioning

```
TOP-RIGHT (default)
╭─────────────────────────────────────────────────────────────────────────╮
│  App Header                                    ┌─ ✓ ─────────────────┐  │
│                                                │ Saved successfully  │  │
├────────────────────────────────────────────────└─────────────────────┘──┤
│                                                                         │
│  Content                                                                │
│                                                                         │
╰─────────────────────────────────────────────────────────────────────────╯

BOTTOM-CENTER (for mobile/narrow)
╭─────────────────────────────────────────────────────────────────────────╮
│                                                                         │
│  Content                                                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                    ┌─ ✓ ─────────────────────┐                          │
│                    │ Saved successfully      │                          │
│                    └─────────────────────────┘                          │
╰─────────────────────────────────────────────────────────────────────────╯
```

### Stacked Toasts

Newest on top, max 3 visible:

```
                                        ┌─ ✓ ─────────────────────────┐
                                        │ Email sent                  │
                                        └─────────────────────────────┘
                                          ┌─ ✓ ───────────────────────┐
                                          │ File uploaded             │
                                          └───────────────────────────┘
                                            ┌─ ℹ ─────────────────────┐
                                            │ 2 users online          │
                                            └─────────────────────────┘
```

### Timing Rules

| Type | Auto-dismiss | User action |
|------|--------------|-------------|
| Success | 4 seconds | Optional dismiss |
| Info | 4 seconds | Optional dismiss |
| Warning | 6 seconds | Optional dismiss, optional action |
| Error | Never | Must dismiss or take action |
| Loading | On completion | Cannot dismiss |

---

## Output Modes

Every view supports multiple output formats:

```bash
$ myapp tasks list              # Default: interactive terminal (Level 4)
$ myapp tasks list --unicode    # Unicode without interactivity (Level 3)
$ myapp tasks list --ascii      # ASCII boxes (Level 2)
$ myapp tasks list --plain      # Plain text (Level 1)
$ myapp tasks list --json       # Structured data (Level 0)
$ myapp tasks list --markdown   # Documentation-ready
$ myapp tasks list --csv        # Spreadsheet-ready
```

### JSON Output (for agents/automation)

```json
{
  "view": "list",
  "resource": "task",
  "data": [
    {
      "id": "1",
      "title": "Build homepage",
      "status": "done",
      "priority": "high",
      "dueDate": "2024-01-15",
      "assignee": { "id": "u1", "name": "Sarah Chen" }
    },
    {
      "id": "2",
      "title": "Write API docs",
      "status": "todo",
      "priority": "medium",
      "dueDate": "2024-01-20",
      "assignee": null
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 10,
    "total": 24,
    "totalPages": 3
  },
  "filters": {
    "status": null,
    "priority": null,
    "search": null
  },
  "sort": {
    "field": "dueDate",
    "direction": "asc"
  },
  "actions": ["create", "edit", "delete", "filter", "sort", "export"],
  "selected": ["1"]
}
```

### Markdown Output (for documentation)

```markdown
# Tasks

| Done | Title | Status | Priority | Due |
|------|-------|--------|----------|-----|
| ✓ | Build homepage | Done | High | Jan 15 |
| ○ | Write API docs | Todo | Medium | Jan 20 |
| ◐ | Deploy to prod | Active | High | Jan 22 |

*Showing 3 of 24 tasks • Page 1 of 3*
```

### CSV Output (for spreadsheets)

```csv
id,title,status,priority,due_date,assignee
1,Build homepage,done,high,2024-01-15,Sarah Chen
2,Write API docs,todo,medium,2024-01-20,
3,Deploy to production,active,high,2024-01-22,Sarah Chen
```

---

## Color System

### Semantic Color Mapping

When color is available, use it for **meaning**, not decoration:

| Semantic | Use Case | Hex (TrueColor) | ANSI 16 |
|----------|----------|-----------------|---------|
| **Primary** | Interactive elements, links, focus | `#3B82F6` | Bright Blue (12) |
| **Success** | Completed, active, online, positive | `#22C55E` | Bright Green (10) |
| **Warning** | Pending, caution, in-progress | `#EAB308` | Bright Yellow (11) |
| **Error** | Failed, destructive, offline | `#EF4444` | Bright Red (9) |
| **Info** | Informational, secondary interactive | `#06B6D4` | Bright Cyan (14) |
| **Neutral** | Borders, secondary text, disabled | `#737373` | Bright Black (8) |

### Complete Palette (TrueColor)

```typescript
const colors = {
  // Primary - Interactive elements
  primary: {
    50:  '#EFF6FF',  // Backgrounds
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',  // Default
    600: '#2563EB',  // Hover
    700: '#1D4ED8',  // Pressed
    800: '#1E40AF',
    900: '#1E3A8A',  // Text on light
  },

  // Success - Positive states
  success: {
    50:  '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',  // Default
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Warning - Caution states
  warning: {
    50:  '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',  // Default
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },

  // Error - Negative states
  error: {
    50:  '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Default
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Neutral - Text, borders, backgrounds
  neutral: {
    50:  '#FAFAFA',  // Page background
    100: '#F5F5F5',  // Card background
    200: '#E5E5E5',  // Borders
    300: '#D4D4D4',  // Disabled borders
    400: '#A3A3A3',  // Placeholder text
    500: '#737373',  // Secondary text
    600: '#525252',  // Primary text
    700: '#404040',
    800: '#262626',
    900: '#171717',  // Headings
  },
}
```

### 256-Color Fallback

```typescript
const colors256 = {
  primary:   { light: 153, default: 33, dark: 27 },
  success:   { light: 157, default: 34, dark: 28 },
  warning:   { light: 229, default: 220, dark: 178 },
  error:     { light: 217, default: 196, dark: 124 },
  neutral:   { light: 252, default: 245, dark: 238 },
}
```

### 16-Color ANSI Mapping

```typescript
const colors16 = {
  primary:   '\x1b[94m',   // Bright Blue
  success:   '\x1b[92m',   // Bright Green
  warning:   '\x1b[93m',   // Bright Yellow
  error:     '\x1b[91m',   // Bright Red
  info:      '\x1b[96m',   // Bright Cyan
  dim:       '\x1b[90m',   // Bright Black (gray)
  bold:      '\x1b[1m',
  reset:     '\x1b[0m',
}
```

### Color Detection

```typescript
function detectColorSupport(): 'truecolor' | '256' | '16' | 'none' {
  if (process.env.COLORTERM === 'truecolor') return 'truecolor'
  if (process.env.TERM?.includes('256color')) return '256'
  if (process.stdout.isTTY) return '16'
  return 'none'
}
```

### Usage Guidelines

1. **Never rely on color alone** - Always pair with symbols/text
2. **Test in grayscale** - UI should work without color
3. **Respect NO_COLOR** - Honor the `NO_COLOR` environment variable
4. **Use sparingly** - Color for meaning, not decoration

---

## Keyboard Conventions

### Global Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Ctrl+K` | Open command palette | Anywhere |
| `Ctrl+B` | Toggle sidebar | Anywhere |
| `Ctrl+/` | Show keyboard shortcuts | Anywhere |
| `Escape` | Close modal/cancel/back | Modals, forms |
| `?` | Show help | When not in input |

### Navigation

| Key | Action |
|-----|--------|
| `↑` / `k` | Move up |
| `↓` / `j` | Move down |
| `←` / `h` | Move left / collapse |
| `→` / `l` | Move right / expand |
| `Home` / `gg` | Go to first item |
| `End` / `G` | Go to last item |
| `PageUp` / `Ctrl+U` | Page up |
| `PageDown` / `Ctrl+D` | Page down |
| `Tab` | Next focusable element |
| `Shift+Tab` | Previous focusable element |

### Actions

| Key | Action |
|-----|--------|
| `Enter` | Open / select / confirm |
| `Space` | Toggle checkbox / selection |
| `n` | New / create |
| `e` | Edit |
| `d` | Delete |
| `r` | Refresh |
| `f` / `/` | Focus search / filter |
| `x` | Toggle selection |
| `Ctrl+A` | Select all |
| `Ctrl+S` | Save |

### Form-Specific

| Key | Action |
|-----|--------|
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit (single-line) / newline (textarea) |
| `Ctrl+Enter` | Submit form |
| `Escape` | Cancel / close |

### Vim-Style (Optional Layer)

| Key | Action |
|-----|--------|
| `gg` | Go to top |
| `G` | Go to bottom |
| `dd` | Delete item |
| `yy` | Copy item |
| `p` | Paste |
| `/` | Search |
| `n` | Next search result |
| `N` | Previous search result |
| `:w` | Save |
| `:q` | Quit |
| `:wq` | Save and quit |

---

## Agent Interaction Protocol

### Structured Output Contract

Every view MUST be able to produce structured output for programmatic consumption:

```typescript
interface RenderOutput {
  // View metadata
  view: ViewType
  resource: string
  timestamp: string

  // Structured data (always available)
  data: unknown[]

  // State information
  state: {
    page?: number
    totalPages?: number
    total?: number
    selected?: string[]
    filters?: Record<string, unknown>
    sort?: { field: string; direction: 'asc' | 'desc' }
  }

  // Available actions
  actions: Array<{
    id: string
    label: string
    shortcut?: string
    enabled: boolean
  }>

  // Navigation context
  navigation: {
    current: string
    breadcrumb: string[]
    available: Array<{
      path: string
      label: string
    }>
  }

  // Human-readable formats
  formats: {
    text: string      // Level 1 - Plain text
    ascii: string     // Level 2 - ASCII boxes
    unicode: string   // Level 3 - Unicode (default)
    markdown: string  // Documentation format
  }
}
```

### Parseable Patterns

Design text output to be agent-parseable:

```
ITEM COUNTS
Showing 3 of 24 tasks
        ^    ^^
        |    total (parseable)
        visible

PAGINATION
Page 1 of 3
     ^    ^
     current  total

ACTIONS (bracketed and labeled)
[n] New  [e] Edit  [d] Delete
 ^   ^
 key action-name

STATUS (consistent format)
● Done   ○ Todo   ◐ Active
^        ^        ^
symbol + space + label

TABLE HEADERS (sort indicators)
Title                      ▲  Status   Priority ▼
                           ^                    ^
                       asc sort            desc sort
```

### Command Interface

Views should support a command interface for agent interaction:

```typescript
interface ViewCommands {
  // Navigation
  'navigate:next': () => void
  'navigate:prev': () => void
  'navigate:first': () => void
  'navigate:last': () => void
  'navigate:page': (page: number) => void

  // Selection
  'select:item': (id: string) => void
  'select:toggle': (id: string) => void
  'select:all': () => void
  'select:none': () => void

  // Actions
  'action:create': () => void
  'action:edit': (id: string) => void
  'action:delete': (ids: string[]) => void
  'action:refresh': () => void

  // Filtering
  'filter:set': (field: string, value: unknown) => void
  'filter:clear': () => void
  'search:query': (query: string) => void

  // Sorting
  'sort:by': (field: string, direction?: 'asc' | 'desc') => void

  // Output
  'output:json': () => RenderOutput
  'output:text': () => string
}
```

### Agent Workflow Example

```bash
# Agent discovers available resources
$ myapp --json resources
{"resources": ["task", "user", "project"]}

# Agent lists tasks with JSON output
$ myapp tasks list --json
{"view": "list", "data": [...], "actions": [...]}

# Agent creates a task
$ myapp tasks create --json --data '{"title": "New task", "priority": "high"}'
{"success": true, "id": "task-123"}

# Agent updates a task
$ myapp tasks update task-123 --json --data '{"status": "done"}'
{"success": true}

# Agent performs bulk operation
$ myapp tasks delete --ids task-1,task-2,task-3 --json
{"success": true, "deleted": 3}
```

---

## OpenTUI Integration

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SaaSkit Architecture                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   View Definition (framework-agnostic)                                       │
│        │                                                                     │
│        ▼                                                                     │
│   ┌─────────────┐                                                            │
│   │   Detect    │                                                            │
│   │   Renderer  │                                                            │
│   └──────┬──────┘                                                            │
│          │                                                                   │
│          ├──────────────────────────────────────┐                            │
│          │                                      │                            │
│          ▼                                      ▼                            │
│   ┌─────────────────────┐              ┌─────────────────────┐              │
│   │  OpenTUI (Primary)  │              │  React Ink (Fallback)│              │
│   │  @opentui/react     │              │  ink                 │              │
│   │  @opentui/core      │              │                      │              │
│   └─────────────────────┘              └─────────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Renderer Detection

```typescript
type RenderEngine = 'opentui' | 'ink' | 'text'

async function detectBestRenderer(): Promise<RenderEngine> {
  // Try OpenTUI first
  try {
    require.resolve('@opentui/core')
    require.resolve('@opentui/react')
    return 'opentui'
  } catch {
    // Try React Ink
    try {
      require.resolve('ink')
      return 'ink'
    } catch {
      // Plain text fallback
      return 'text'
    }
  }
}
```

### Component Mapping

| SaaSkit View | OpenTUI | Ink | Text |
|--------------|---------|-----|------|
| `ListView` | `<Box>` + custom | `<Table>` | ASCII table |
| `DetailView` | `<Box>` sections | `<Box>` | Formatted text |
| `FormView` | `<Box>` + inputs | Custom inputs | Prompted input |
| `ShellView` | Full-screen `<Box>` | `<Box fullScreen>` | n/a |
| `ModalView` | Positioned `<Box>` | `<Box>` overlay | n/a |

### Hook Compatibility

Both OpenTUI and Ink support compatible hooks:

```typescript
// Keyboard input
useInput((input, key) => {
  if (key.upArrow) navigateUp()
  if (key.return) select()
}, { isActive: isFocused })

// Focus management
const { isFocused } = useFocus({ autoFocus: true })

// Terminal dimensions
const { stdout } = useStdout()
const width = stdout.columns
const height = stdout.rows
```

### Build Requirements

```bash
# OpenTUI requires Zig for native components
brew install zig  # macOS
# or
apt install zig   # Linux

# Recommended: Use Bun for development
curl -fsSL https://bun.sh/install | bash
```

---

## Summary

The SaaSkit Design System is built on these core principles:

### 1. Progressive Enhancement

Same content at every rendering level:
- **Level 0**: Structured JSON for agents
- **Level 1**: Plain text for maximum compatibility
- **Level 2**: ASCII for better structure
- **Level 3**: Unicode for beautiful defaults
- **Level 4**: Terminal for full interactivity

### 2. Semantic Consistency

A vocabulary of symbols and patterns:
- `[ ]` = action, `( )` = secondary, `{ }` = destructive
- `●` = active, `○` = inactive, `◐` = pending
- `✓` = success, `✗` = error, `⚠` = warning

### 3. Headless Architecture

Logic separate from presentation:
- Views define **what**, renderers define **how**
- Same view works in terminal, web, or agent contexts
- Framework-agnostic core with React/Ink/OpenTUI adapters

### 4. Agent-First Design

Built for automation:
- Every view produces structured JSON
- Text output is parseable, not just pretty
- Command interface for programmatic control

### 5. Keyboard-First Interaction

No mouse required:
- Consistent shortcuts across all views
- Vim-style optional layer
- Full accessibility

---

The terminal is not a limitation—it's a feature. Text interfaces are:

- **Universally accessible** (SSH, containers, CI, scripts)
- **Infinitely composable** (pipes, chains, automation)
- **AI-native** (agents understand text better than pixels)
- **Fast** (no rendering overhead)
- **Portable** (works everywhere)

This is the foundation for **Headless SaaS in the Age of AI Agents**.
