# List/Table View Pattern

## Overview

The list/table view is the most common pattern in SaaS applications. It displays collections of items with support for selection, sorting, filtering, and bulk actions.

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  █ Projects                                           [?] Help  [⚙]   │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ⌕ Search projects...                    Sort: Updated ▼   Filter: All │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │    NAME              STATUS      UPDATED        MEMBERS  ACTIONS │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ ›● api-gateway       ● Active    2 hours ago    5        ⋮      │   │
│  │  ○ mobile-app        ◐ Building  5 minutes ago  3        ⋮      │   │
│  │  ○ dashboard         ● Active    1 day ago      8        ⋮      │   │
│  │  ○ auth-service      ○ Stopped   3 days ago     2        ⋮      │   │
│  │  ○ data-pipeline     ⚠ Warning   1 week ago     4        ⋮      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ◂ 1-5 of 23 ▸                                 [+ New Project] [⋮ More]│
│                                                                         │
│  ↑↓ Navigate  Space Select  Enter Open  / Search  ? Help              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## States

### Default State
```
┌──────────────────────────────────────────────────────────────────┐
│    NAME              STATUS       UPDATED         ACTIONS        │
├──────────────────────────────────────────────────────────────────┤
│  ○ api-gateway       ● Active     2 hours ago     ⋮              │
│  ○ mobile-app        ● Active     5 minutes ago   ⋮              │
│  ○ dashboard         ● Active     1 day ago       ⋮              │
└──────────────────────────────────────────────────────────────────┘
```

### Focused Row (keyboard navigation)
```
┌──────────────────────────────────────────────────────────────────┐
│    NAME              STATUS       UPDATED         ACTIONS        │
├──────────────────────────────────────────────────────────────────┤
│  ○ api-gateway       ● Active     2 hours ago     ⋮              │
│▌›● mobile-app        ● Active     5 minutes ago   ⋮              │ ← FOCUSED
│  ○ dashboard         ● Active     1 day ago       ⋮              │
└──────────────────────────────────────────────────────────────────┘

Note: Focused row has:
- Blue left border (▌)
- Pointer indicator (›)
- Filled selection circle (● when selected)
- Brighter text color
```

### Selected Rows (multi-select)
```
┌──────────────────────────────────────────────────────────────────┐
│  ☑ 3 selected                              [Delete] [Move] [⋮]  │
├──────────────────────────────────────────────────────────────────┤
│  ● api-gateway       ● Active     2 hours ago     ⋮              │ SELECTED
│▌›● mobile-app        ● Active     5 minutes ago   ⋮              │ FOCUSED+SELECTED
│  ● dashboard         ● Active     1 day ago       ⋮              │ SELECTED
│  ○ auth-service      ○ Stopped    3 days ago      ⋮              │
└──────────────────────────────────────────────────────────────────┘

Selection mode header shows:
- Count of selected items
- Bulk action buttons
```

### Loading State
```
┌──────────────────────────────────────────────────────────────────┐
│    NAME              STATUS       UPDATED         ACTIONS        │
├──────────────────────────────────────────────────────────────────┤
│  ░░░░░░░░░░░░░░     ░░░░░░░░    ░░░░░░░░░░░    ░░░             │
│  ░░░░░░░░░░░        ░░░░░░░░    ░░░░░░░░░░░    ░░░             │
│  ░░░░░░░░░░░░░      ░░░░░░░░    ░░░░░░░░░░░    ░░░             │
│  ░░░░░░░░░░░░░░░    ░░░░░░░░    ░░░░░░░░░░░    ░░░             │
│  ░░░░░░░░░░░        ░░░░░░░░    ░░░░░░░░░░░    ░░░             │
└──────────────────────────────────────────────────────────────────┘

⠋ Loading projects...
```

### Empty State
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                          ┌─────────┐                            │
│                          │  📂     │                            │
│                          └─────────┘                            │
│                                                                  │
│                    No projects found                             │
│                                                                  │
│           Create your first project to get started               │
│                                                                  │
│                     [+ Create Project]                           │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Empty Search Results
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    No results for "xyz"                          │
│                                                                  │
│             Try adjusting your search or filters                 │
│                                                                  │
│                      [Clear Search]                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Error State
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│               ✗ Failed to load projects                          │
│                                                                  │
│             Could not connect to the server.                     │
│             Please check your connection.                        │
│                                                                  │
│                    [↻ Try Again]                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Sorting Indicators

```
┌─────────────────────────────────────────────────────────────────┐
│  Column Headers with Sort State:                                │
│                                                                 │
│  NAME ▲          Sorted ascending (A-Z, oldest first)          │
│  NAME ▼          Sorted descending (Z-A, newest first)         │
│  NAME            Not sorted (no indicator)                      │
│  NAME ⇅          Sortable (hover/focus state)                  │
│                                                                 │
│  Active sort column is highlighted in primary color            │
└─────────────────────────────────────────────────────────────────┘
```

## Row Actions

### Inline Actions (visible on focus)
```
┌──────────────────────────────────────────────────────────────────┐
│  api-gateway       ● Active                    [Edit] [⋮]       │
└──────────────────────────────────────────────────────────────────┘

Actions appear on row focus
Primary action (Edit) always visible
Secondary actions under menu (⋮)
```

### Action Menu Expanded
```
┌──────────────────────────────────────────────────────────────────┐
│  api-gateway       ● Active                         ⋮           │
│                                            ┌─────────────┐      │
│                                            │ ✎ Edit      │      │
│                                            │ 📋 Duplicate │      │
│                                            │ ───────────  │      │
│                                            │ ✗ Delete    │      │
│                                            └─────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

## Keyboard Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│  KEY           ACTION                                           │
├─────────────────────────────────────────────────────────────────┤
│  ↑ / k         Move focus up                                    │
│  ↓ / j         Move focus down                                  │
│  Space         Toggle selection                                 │
│  Enter         Open item / Primary action                       │
│  e             Edit focused item                                │
│  d / Delete    Delete focused item (with confirm)              │
│  /             Focus search                                     │
│  Escape        Clear selection / Close menu                     │
│  Ctrl+A        Select all                                       │
│  Ctrl+Shift+A  Deselect all                                    │
│  Home          Jump to first row                                │
│  End           Jump to last row                                 │
│  Page Up       Move up one page                                 │
│  Page Down     Move down one page                               │
│  s             Open sort menu                                   │
│  f             Open filter menu                                 │
│  Tab           Move to next section                             │
│  ?             Show keyboard shortcuts                          │
└─────────────────────────────────────────────────────────────────┘
```

## React Ink Implementation

```tsx
import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useFocus } from 'ink';

interface TableColumn<T> {
  key: keyof T;
  header: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface TableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onSelect?: (item: T) => void;
  onAction?: (action: string, item: T) => void;
  selectable?: boolean;
  multiSelect?: boolean;
}

export function Table<T extends { id: string }>({
  data,
  columns,
  loading,
  emptyMessage = 'No items found',
  onSelect,
  onAction,
  selectable = true,
  multiSelect = false,
}: TableProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { isFocused } = useFocus();

  useInput((input, key) => {
    if (!isFocused) return;

    // Navigation
    if (key.upArrow || input === 'k') {
      setFocusedIndex(i => Math.max(0, i - 1));
    }
    if (key.downArrow || input === 'j') {
      setFocusedIndex(i => Math.min(data.length - 1, i + 1));
    }

    // Selection
    if (input === ' ' && selectable) {
      const item = data[focusedIndex];
      if (item) {
        setSelectedIds(prev => {
          const next = new Set(prev);
          if (next.has(item.id)) {
            next.delete(item.id);
          } else {
            if (!multiSelect) next.clear();
            next.add(item.id);
          }
          return next;
        });
      }
    }

    // Actions
    if (key.return) {
      const item = data[focusedIndex];
      if (item) onSelect?.(item);
    }

    if (input === 'e') {
      const item = data[focusedIndex];
      if (item) onAction?.('edit', item);
    }

    if (input === 'd') {
      const item = data[focusedIndex];
      if (item) onAction?.('delete', item);
    }
  });

  // Loading skeleton
  if (loading) {
    return (
      <Box flexDirection="column">
        <TableHeader columns={columns} />
        {[...Array(5)].map((_, i) => (
          <Box key={i} paddingX={1}>
            {columns.map((col, j) => (
              <Box key={j} width={col.width || 15}>
                <Text color="#3F3F46">{'░'.repeat((col.width || 15) - 2)}</Text>
              </Box>
            ))}
          </Box>
        ))}
        <Box marginTop={1}>
          <Text color="#3B82F6">⠋</Text>
          <Text> Loading...</Text>
        </Box>
      </Box>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Box
        flexDirection="column"
        alignItems="center"
        paddingY={2}
      >
        <Text color="#71717A">📂</Text>
        <Text color="#A1A1AA">{emptyMessage}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Selection header */}
      {selectedIds.size > 0 && (
        <Box marginBottom={1}>
          <Text color="#3B82F6">☑ {selectedIds.size} selected</Text>
          <Text color="#3F3F46"> │ </Text>
          <Text color="#A1A1AA">[d] Delete  [Esc] Clear</Text>
        </Box>
      )}

      {/* Table header */}
      <TableHeader columns={columns} />

      {/* Table rows */}
      {data.map((item, index) => {
        const isFocusedRow = index === focusedIndex && isFocused;
        const isSelected = selectedIds.has(item.id);

        return (
          <TableRow
            key={item.id}
            item={item}
            columns={columns}
            focused={isFocusedRow}
            selected={isSelected}
            selectable={selectable}
          />
        );
      })}

      {/* Keyboard hints */}
      <Box marginTop={1}>
        <Text color="#71717A">
          ↑↓ Navigate  Space Select  Enter Open  / Search  ? Help
        </Text>
      </Box>
    </Box>
  );
}

// Table header component
function TableHeader<T>({ columns }: { columns: TableColumn<T>[] }) {
  return (
    <Box borderStyle="single" borderBottom borderColor="#3F3F46" paddingX={1}>
      <Text>   </Text> {/* Space for selection indicator */}
      {columns.map((col, i) => (
        <Box key={i} width={col.width || 15}>
          <Text bold color="#A1A1AA">
            {col.header.toUpperCase()}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

// Table row component
function TableRow<T extends { id: string }>({
  item,
  columns,
  focused,
  selected,
  selectable,
}: {
  item: T;
  columns: TableColumn<T>[];
  focused: boolean;
  selected: boolean;
  selectable: boolean;
}) {
  return (
    <Box paddingX={1}>
      {/* Focus/selection indicator */}
      <Text color={focused ? '#3B82F6' : '#3F3F46'}>
        {focused ? '▌›' : '  '}
      </Text>
      <Text color={selected ? '#3B82F6' : '#71717A'}>
        {selectable ? (selected ? '●' : '○') : ' '}
      </Text>
      <Text> </Text>

      {/* Columns */}
      {columns.map((col, i) => (
        <Box key={i} width={col.width || 15}>
          <Text color={focused ? '#E4E4E7' : '#A1A1AA'}>
            {col.render
              ? col.render(item[col.key], item)
              : String(item[col.key])
            }
          </Text>
        </Box>
      ))}

      {/* Row actions (visible when focused) */}
      {focused && (
        <Text color="#71717A"> [e]dit [d]el ⋮</Text>
      )}
    </Box>
  );
}

// Status cell renderer
export const StatusCell: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { icon: string; color: string }> = {
    active: { icon: '●', color: '#22C55E' },
    building: { icon: '◐', color: '#3B82F6' },
    stopped: { icon: '○', color: '#71717A' },
    error: { icon: '✗', color: '#EF4444' },
    warning: { icon: '⚠', color: '#F59E0B' },
  };

  const { icon, color } = config[status.toLowerCase()] || config.stopped;

  return (
    <Text color={color}>
      {icon} {status}
    </Text>
  );
};

// Example usage
const ProjectsTable = () => {
  const projects = [
    { id: '1', name: 'api-gateway', status: 'Active', updated: '2 hours ago', members: 5 },
    { id: '2', name: 'mobile-app', status: 'Building', updated: '5 min ago', members: 3 },
    { id: '3', name: 'dashboard', status: 'Active', updated: '1 day ago', members: 8 },
  ];

  const columns = [
    { key: 'name' as const, header: 'Name', width: 20 },
    {
      key: 'status' as const,
      header: 'Status',
      width: 15,
      render: (value: string) => <StatusCell status={value} />
    },
    { key: 'updated' as const, header: 'Updated', width: 15 },
    { key: 'members' as const, header: 'Members', width: 10 },
  ];

  return (
    <Table
      data={projects}
      columns={columns}
      multiSelect
      onSelect={(item) => console.log('Selected:', item.name)}
      onAction={(action, item) => console.log(action, item.name)}
    />
  );
};
```

## Animation Patterns

### Row Add Animation
```
Frame 0: (row doesn't exist)
Frame 1: ░░░░░░░░░░░░  (placeholder, height expanding)
Frame 2: api-gateway   (text fading in, highlighted)
Frame 3: api-gateway   (highlight fading out, normal state)
```

### Row Delete Animation
```
Frame 0: api-gateway   (normal)
Frame 1: a̶p̶i̶-̶g̶a̶t̶e̶w̶a̶y̶   (strikethrough, dimming)
Frame 2: (row height collapsing)
Frame 3: (row removed)
```

### Loading to Content Transition
```
Frame 0: ░░░░░░░░░░░░  (skeleton)
Frame 1: ▒▒▒░░░░░░░░░  (shimmer moving)
Frame 2: ▓▓▓░░░░░░░░░  (content starting to appear)
Frame 3: api-gateway   (content fully rendered)
```

## Accessibility Notes

1. **Never rely solely on color** - Always pair status colors with icons
2. **Provide keyboard navigation** - Full table navigable without mouse
3. **Announce changes** - Use ARIA live regions equivalent for dynamic updates
4. **Show current position** - "Item 3 of 23" for screen reader context
5. **Clear focus indicators** - High contrast focus state visible to all
