# @saaskit/tui

Terminal UI renderer for SaaSkit using OpenTUI (primary) with React Ink fallback.

## Quick Start

```bash
npm install @saaskit/tui @opentui/core @opentui/react
```

## Architecture

```
@saaskit/tui
├── src/
│   ├── index.ts              # Main exports
│   ├── App.tsx               # TUI Application root
│   ├── render.ts             # Renderer detection & startup
│   │
│   ├── components/
│   │   ├── data/
│   │   │   ├── ListView.tsx  # Table, Grid, Cards, Kanban
│   │   │   ├── DetailView.tsx
│   │   │   └── FormView.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── ShellView.tsx # App container with nav
│   │   │   ├── SplitView.tsx
│   │   │   ├── PanelView.tsx
│   │   │   └── TabView.tsx
│   │   │
│   │   ├── meta/
│   │   │   ├── EmptyView.tsx
│   │   │   ├── LoadingView.tsx
│   │   │   └── ErrorView.tsx
│   │   │
│   │   ├── interaction/
│   │   │   ├── CommandPalette.tsx
│   │   │   └── DialogView.tsx
│   │   │
│   │   └── inputs/
│   │       ├── TextInput.tsx
│   │       ├── Select.tsx
│   │       ├── Checkbox.tsx
│   │       └── index.ts
│   │
│   ├── hooks/
│   │   ├── useView.ts
│   │   ├── useInput.ts
│   │   ├── useFocus.ts
│   │   └── useApp.ts
│   │
│   ├── context/
│   │   ├── AppContext.ts
│   │   ├── FocusContext.ts
│   │   └── ThemeContext.ts
│   │
│   ├── theme/
│   │   └── index.ts          # Color system integration
│   │
│   └── utils/
│       ├── fuzzy.ts          # Fuzzy matching
│       └── keyboard.ts       # Key parsing
│
├── package.json
└── tsconfig.json
```

## Usage

### With SaaSkit App

```tsx
import { App } from 'saaskit'
import { startTUI } from '@saaskit/tui'

const app = (
  <App name="todos">
    <Task title done priority="low | medium | high" />
  </App>
)

// Start terminal UI
startTUI(app)
```

### Standalone Components

```tsx
import { ListView, ShellView, FormView } from '@saaskit/tui'

// Use components directly with View types
const view: ListView<Task> = {
  type: 'list',
  config: { variant: 'table', columns: [...] },
  data: tasks,
  state: { focusedIndex: 0, ... }
}

render(<ListViewComponent view={view} />)
```

## Keyboard Shortcuts

### Global
| Key | Action |
|-----|--------|
| `Ctrl+K` | Open command palette |
| `Ctrl+B` | Toggle sidebar |
| `?` | Show help |
| `q` | Quit |

### Navigation
| Key | Action |
|-----|--------|
| `↑/k` | Move up |
| `↓/j` | Move down |
| `←/h` | Move left |
| `→/l` | Move right |
| `Tab` | Next focusable |
| `Shift+Tab` | Previous focusable |
| `Enter` | Select/Confirm |
| `Esc` | Cancel/Close |

### List View
| Key | Action |
|-----|--------|
| `/` | Search |
| `n` | New item |
| `e` | Edit selected |
| `d` | Delete selected |
| `Space` | Toggle selection |
| `Ctrl+A` | Select all |

### Form View
| Key | Action |
|-----|--------|
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Ctrl+Enter` | Submit |
| `Esc` | Cancel |

## Renderer Priority

1. **OpenTUI** (`@opentui/react`) - Primary, modern architecture
2. **React Ink** - Fallback for production stability
3. **Text** - Plain text for non-TTY environments

```typescript
// Automatic detection
import { render } from '@saaskit/tui'
render(app) // Uses best available renderer

// Force specific renderer
import { renderWithOpenTUI, renderWithInk } from '@saaskit/tui'
renderWithOpenTUI(app)
renderWithInk(app)
```

## View Types

All view types from `@saaskit/core` are supported:

### Data Views
- **ListView** - Collections (table, grid, cards, kanban, timeline, tree)
- **DetailView** - Single record display
- **FormView** - Create/edit forms with validation

### Layout Views
- **ShellView** - App container with header, sidebar, footer
- **SplitView** - Horizontal/vertical pane division
- **PanelView** - Modals, drawers, dialogs
- **TabView** - Tab navigation

### Meta Views
- **EmptyView** - No data, no results, not found states
- **LoadingView** - Spinner, progress, skeleton
- **ErrorView** - Error display with retry

### Interaction Views
- **CommandView** - Command palette with fuzzy search
- **DialogView** - Confirmation dialogs

## Configuration

```typescript
import { TUIConfig } from '@saaskit/tui'

const config: TUIConfig = {
  // Renderer preference
  renderer: 'auto' | 'opentui' | 'ink' | 'text',

  // Color mode
  colorMode: 'auto' | 'truecolor' | '256' | '16' | 'none',

  // Theme
  theme: {
    primary: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
  },

  // Keyboard
  vimMode: true,  // Enable hjkl navigation

  // Accessibility
  announceChanges: true,  // Screen reader support
}
```

## Development

```bash
# Install dependencies (requires Zig for OpenTUI)
brew install zig
npm install

# Development with hot reload
npm run dev

# Build
npm run build

# Test
npm test
```

## Contributing

See [OPENTUI.md](../../docs/OPENTUI.md) for architecture details and migration guide.
