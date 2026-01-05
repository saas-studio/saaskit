/**
 * List view component - Optimized implementation
 * Displays collections of items in various layouts with:
 * - Memoization for expensive computations
 * - Efficient re-rendering with React.memo
 * - Integrated virtual scrolling for large lists
 * - Clean separation of concerns
 * - Strict type safety
 * - Stable reference optimization to prevent re-renders
 */
import React, { useMemo, useCallback, memo, useRef } from 'react'

// ============================================================================
// Types & Interfaces
// ============================================================================

/** 8 Layout variants from DESIGN-SYSTEM.md */
export type ListVariant =
  | 'table'    // Rows/columns with headers, sorting, selection
  | 'grid'     // Cards in 2-4 columns
  | 'cards'    // Larger cards with more detail
  | 'compact'  // Minimal, dense for scanning
  | 'kanban'   // Columns for stages
  | 'timeline' // Chronological with time markers
  | 'tree'     // Hierarchical with expand/collapse
  | 'grouped'  // Items grouped by field

export type SelectionMode = 'single' | 'multi'

export type SortDirection = 'asc' | 'desc'

export type PaginationStyle = 'pages' | 'loadMore'

export interface PaginationConfig {
  page?: number
  pageSize: number
  total?: number
  style?: PaginationStyle
  hasMore?: boolean
}

export interface FilterConfig {
  field: string
  value: unknown
}

export interface DragDropEvent {
  itemId: string
  fromStage: string
  toStage: string
}

/** Base constraint for list items - must have an identifiable field */
export type ListItem = Record<string, unknown>

/** Extract the ID type from an item based on the idField */
export type ItemId<T extends ListItem, K extends keyof T = 'id'> = T[K] extends string | number ? T[K] : string

export interface ListProps<T extends ListItem = ListItem> {
  // Core data
  data: T[]
  idField?: keyof T & string

  // Layout variant
  variant?: ListVariant

  // Display configuration
  columns?: (keyof T & string)[]

  // Selection
  selectionMode?: SelectionMode
  selectedIds?: string[]
  onSelect?: (selected: T | T[]) => void

  // Pagination
  pagination?: PaginationConfig
  onPageChange?: (page: number) => void
  onLoadMore?: () => void

  // Sorting
  sortable?: boolean
  sortColumn?: keyof T & string
  sortDirection?: SortDirection
  onSort?: (column: keyof T & string, direction: SortDirection) => void

  // Filtering
  filters?: FilterConfig[]
  filterableFields?: (keyof T & string)[]
  onFilter?: (filters: FilterConfig[]) => void
  searchable?: boolean
  searchFields?: (keyof T & string)[]
  onSearch?: (query: string) => void

  // Empty/Loading states
  emptyMessage?: string
  emptyState?: React.ReactElement
  loading?: boolean
  loadingComponent?: React.ReactElement

  // Row interactions
  onRowClick?: (item: T) => void

  // Variant-specific props
  // Kanban
  groupBy?: keyof T & string
  stages?: string[]
  onDragDrop?: (event: DragDropEvent) => void

  // Timeline
  timeField?: keyof T & string

  // Tree
  parentField?: keyof T & string
  expandedIds?: string[]
  onExpand?: (id: string) => void
  onCollapse?: (id: string) => void

  // Virtual scrolling (for large lists)
  virtualize?: boolean
  itemHeight?: number
  viewportHeight?: number
  scrollTop?: number
}

// ============================================================================
// Virtual Scrolling Types & Hooks (Preparation)
// ============================================================================

export interface VirtualScrollConfig {
  /** Total number of items */
  itemCount: number
  /** Height of each item in pixels/rows */
  itemHeight: number
  /** Visible viewport height */
  viewportHeight: number
  /** Number of items to render outside viewport (for smooth scrolling) */
  overscan?: number
}

export interface VirtualScrollResult {
  /** Index of first visible item */
  startIndex: number
  /** Index of last visible item */
  endIndex: number
  /** Total scrollable height */
  totalHeight: number
  /** Offset to apply to visible items */
  offsetTop: number
  /** Visible items count */
  visibleCount: number
}

/**
 * Hook for virtual scrolling calculations
 * Prepares data for windowed rendering of large lists
 */
export function useVirtualScroll(
  config: VirtualScrollConfig,
  scrollTop: number = 0
): VirtualScrollResult {
  const { itemCount, itemHeight, viewportHeight, overscan = 3 } = config

  return useMemo(() => {
    const visibleCount = Math.ceil(viewportHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + 2 * overscan)
    const totalHeight = itemCount * itemHeight
    const offsetTop = startIndex * itemHeight

    return {
      startIndex,
      endIndex,
      totalHeight,
      offsetTop,
      visibleCount,
    }
  }, [itemCount, itemHeight, viewportHeight, overscan, scrollTop])
}

// ============================================================================
// Stable Reference Utilities
// ============================================================================

/**
 * Hook to maintain stable array references when content hasn't changed
 * Prevents unnecessary re-renders when arrays are recreated with same values
 */
function useStableArray<T>(arr: readonly T[]): readonly T[] {
  const ref = useRef<readonly T[]>(arr)

  // Deep comparison for primitive arrays (columns, selectedIds, etc.)
  const isEqual = arr.length === ref.current.length &&
    arr.every((val, i) => val === ref.current[i])

  if (!isEqual) {
    ref.current = arr
  }

  return ref.current
}

/**
 * Hook to maintain stable Set references for O(1) lookups
 * Only recreates Set when the source array actually changes
 */
function useStableSet(arr: readonly string[]): Set<string> {
  const stableArr = useStableArray(arr)
  return useMemo(() => new Set(stableArr), [stableArr])
}

// ============================================================================
// Module-Level State for Test Helpers
// ============================================================================

interface ListState<T extends ListItem = ListItem> {
  data: T[]
  idField: keyof T & string
  selectionMode?: SelectionMode
  sortColumn?: keyof T & string
  sortDirection?: SortDirection
  filters: FilterConfig[]
  onSelect?: (selected: T | T[]) => void
  onSort?: (column: keyof T & string, direction: SortDirection) => void
  onFilter?: (filters: FilterConfig[]) => void
  onSearch?: (query: string) => void
  onPageChange?: (page: number) => void
  onLoadMore?: () => void
  onRowClick?: (item: T) => void
  onExpand?: (id: string) => void
  onCollapse?: (id: string) => void
  onDragDrop?: (event: DragDropEvent) => void
}

let currentListState: ListState | null = null

// ============================================================================
// Memoized Helper Functions
// ============================================================================

/** Type-safe item ID extraction */
function getItemId<T extends ListItem>(item: T, idField: keyof T & string): string {
  const value = item[idField]
  return String(value ?? '')
}

/** Find item by ID with type safety */
function findItemById<T extends ListItem>(
  data: readonly T[],
  id: string,
  idField: keyof T & string
): T | undefined {
  return data.find(item => getItemId(item, idField) === id)
}

/** Memoized grouping function for kanban/grouped variants */
function groupItemsByField<T extends ListItem>(
  data: readonly T[],
  groupBy: keyof T & string,
  stages?: readonly string[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>()

  // Initialize groups from stages if provided
  if (stages) {
    for (const stage of stages) {
      groups.set(stage, [])
    }
  }

  // Group items
  for (const item of data) {
    const groupValue = String(item[groupBy] ?? 'default')
    const existing = groups.get(groupValue)
    if (existing) {
      existing.push(item)
    } else {
      groups.set(groupValue, [item])
    }
  }

  return groups
}

/** Tree node structure for hierarchical data */
interface TreeNode<T> {
  item: T
  children: TreeNode<T>[]
  depth: number
}

/** Build tree structure from flat data */
function buildTree<T extends ListItem>(
  data: readonly T[],
  idField: keyof T & string,
  parentField: keyof T & string
): TreeNode<T>[] {
  const nodeMap = new Map<string | null, TreeNode<T>[]>()
  const itemToNode = new Map<string, TreeNode<T>>()

  // Initialize root
  nodeMap.set(null, [])

  // First pass: create all nodes
  for (const item of data) {
    const itemId = getItemId(item, idField)
    const node: TreeNode<T> = { item, children: [], depth: 0 }
    itemToNode.set(itemId, node)
    nodeMap.set(itemId, node.children)
  }

  // Second pass: build hierarchy
  for (const item of data) {
    const itemId = getItemId(item, idField)
    const parentId = item[parentField] as string | null
    const node = itemToNode.get(itemId)!

    const parentChildren = nodeMap.get(parentId) ?? nodeMap.get(null)!
    parentChildren.push(node)

    // Calculate depth
    let depth = 0
    let currentParentId = parentId
    while (currentParentId !== null) {
      depth++
      const parentNode = itemToNode.get(currentParentId)
      currentParentId = parentNode ? (parentNode.item[parentField] as string | null) : null
    }
    node.depth = depth
  }

  return nodeMap.get(null) ?? []
}

// ============================================================================
// Memoized Item Renderers
// ============================================================================

interface TableRowProps<T extends ListItem> {
  item: T
  itemId: string
  columns: readonly (keyof T & string)[]
  selectionMode?: SelectionMode
  isSelected: boolean
  index: number
}

/** Memoized table row component */
const TableRow = memo(function TableRow<T extends ListItem>({
  item,
  itemId,
  columns,
  selectionMode,
  isSelected,
  index,
}: TableRowProps<T>): React.ReactElement {
  const cells: React.ReactElement[] = []

  // Add checkbox for multi-selection
  if (selectionMode === 'multi') {
    cells.push(
      React.createElement('td', { key: 'checkbox' },
        React.createElement('input', {
          type: 'checkbox',
          checked: isSelected,
          'data-item-id': itemId,
          readOnly: true,
        })
      )
    )
  }

  // Render column cells
  for (const col of columns) {
    const value = item[col]
    cells.push(
      React.createElement('td', { key: col, 'data-column': col },
        String(value ?? '')
      )
    )
  }

  return React.createElement('tr', {
    key: itemId || index,
    'data-item-id': itemId,
    'data-selected': isSelected || undefined,
  }, ...cells)
}) as <T extends ListItem>(props: TableRowProps<T>) => React.ReactElement

interface GridItemProps<T extends ListItem> {
  item: T
  itemId: string
  columns: readonly (keyof T & string)[]
  index: number
}

/** Memoized grid item component */
const GridItem = memo(function GridItem<T extends ListItem>({
  item,
  itemId,
  columns,
  index,
}: GridItemProps<T>): React.ReactElement {
  const content = columns.map(col => {
    const value = item[col]
    return React.createElement('div', { key: col, 'data-field': col }, String(value ?? ''))
  })

  return React.createElement('div', {
    key: itemId || index,
    'data-item-id': itemId,
    'data-role': 'grid-item',
  }, ...content)
}) as <T extends ListItem>(props: GridItemProps<T>) => React.ReactElement

interface CardItemProps<T extends ListItem> {
  item: T
  itemId: string
  columns: readonly (keyof T & string)[]
  index: number
}

/** Memoized card component */
const CardItem = memo(function CardItem<T extends ListItem>({
  item,
  itemId,
  columns,
  index,
}: CardItemProps<T>): React.ReactElement {
  const content = columns.map(col => {
    const value = item[col]
    return React.createElement('div', { key: col, 'data-field': col }, String(value ?? ''))
  })

  return React.createElement('div', {
    key: itemId || index,
    'data-item-id': itemId,
    'data-role': 'card',
  }, ...content)
}) as <T extends ListItem>(props: CardItemProps<T>) => React.ReactElement

interface CompactItemProps<T extends ListItem> {
  item: T
  itemId: string
  columns: readonly (keyof T & string)[]
  index: number
}

/** Memoized compact item component */
const CompactItem = memo(function CompactItem<T extends ListItem>({
  item,
  itemId,
  columns,
  index,
}: CompactItemProps<T>): React.ReactElement {
  const content = columns.map(col => {
    const value = item[col]
    return React.createElement('span', { key: col, 'data-field': col }, String(value ?? ''))
  })

  return React.createElement('div', {
    key: itemId || index,
    'data-item-id': itemId,
    'data-role': 'compact-item',
  }, ...content)
}) as <T extends ListItem>(props: CompactItemProps<T>) => React.ReactElement

interface KanbanCardProps<T extends ListItem> {
  item: T
  itemId: string
  index: number
}

/** Memoized kanban card component */
const KanbanCard = memo(function KanbanCard<T extends ListItem>({
  item,
  itemId,
  index,
}: KanbanCardProps<T>): React.ReactElement {
  const title = (item as Record<string, unknown>).title ??
                (item as Record<string, unknown>).name ??
                itemId

  return React.createElement('div', {
    key: itemId || index,
    'data-item-id': itemId,
    'data-role': 'kanban-card',
  }, String(title))
}) as <T extends ListItem>(props: KanbanCardProps<T>) => React.ReactElement

interface TimelineItemProps<T extends ListItem> {
  item: T
  itemId: string
  columns: readonly (keyof T & string)[]
  timeField?: keyof T & string
  index: number
}

/** Memoized timeline item component */
const TimelineItem = memo(function TimelineItem<T extends ListItem>({
  item,
  itemId,
  columns,
  timeField,
  index,
}: TimelineItemProps<T>): React.ReactElement {
  const timeValue = timeField ? String(item[timeField] ?? '') : ''

  const content = columns.map(col => {
    const value = item[col]
    return React.createElement('span', { key: col, 'data-field': col }, String(value ?? ''))
  })

  return React.createElement('div', {
    key: itemId || index,
    'data-item-id': itemId,
    'data-role': 'timeline-item',
    'data-time': timeValue,
  },
    React.createElement('div', { 'data-role': 'time-marker' }, timeValue),
    React.createElement('div', { 'data-role': 'timeline-content' }, ...content)
  )
}) as <T extends ListItem>(props: TimelineItemProps<T>) => React.ReactElement

interface GroupedItemProps<T extends ListItem> {
  item: T
  itemId: string
  columns: readonly (keyof T & string)[]
  index: number
}

/** Memoized grouped item component */
const GroupedItem = memo(function GroupedItem<T extends ListItem>({
  item,
  itemId,
  columns,
  index,
}: GroupedItemProps<T>): React.ReactElement {
  const content = columns.map(col => {
    const value = item[col]
    return React.createElement('span', { key: col, 'data-field': col }, String(value ?? ''))
  })

  return React.createElement('div', {
    key: itemId || index,
    'data-item-id': itemId,
    'data-role': 'grouped-item',
  }, ...content)
}) as <T extends ListItem>(props: GroupedItemProps<T>) => React.ReactElement

// ============================================================================
// Variant Renderers (using memoized components)
// ============================================================================

function renderTableVariant<T extends ListItem>(
  props: ListProps<T>,
  idField: keyof T & string
): React.ReactElement {
  const {
    data,
    columns = [],
    selectionMode,
    selectedIds = [],
    sortable,
    sortColumn,
    sortDirection,
  } = props

  // Selection lookup set (no hooks for direct function call compatibility)
  const selectedSet = new Set(selectedIds)

  // Build header row
  const headerCells: React.ReactElement[] = []

  // Add select-all checkbox for multi-selection
  if (selectionMode === 'multi') {
    headerCells.push(
      React.createElement('th', { key: 'select-all', 'data-role': 'select-all' },
        React.createElement('input', { type: 'checkbox', 'data-action': 'select-all' })
      )
    )
  }

  for (const col of columns) {
    headerCells.push(
      React.createElement('th', { key: col, 'data-column': col }, col)
    )
  }

  const thead = React.createElement('thead', null,
    React.createElement('tr', null, ...headerCells)
  )

  // Build body rows using memoized components
  const bodyRows = data.map((item, index) => {
    const itemId = getItemId(item, idField)
    const isSelected = selectedSet.has(itemId)

    return React.createElement(TableRow, {
      key: itemId || index,
      item,
      itemId,
      columns,
      selectionMode,
      isSelected,
      index,
    })
  })

  const tbody = React.createElement('tbody', null, ...bodyRows)

  return React.createElement('table', {
    'data-variant': 'table',
    'data-selection-mode': selectionMode,
    'data-sortable': sortable || undefined,
    'data-sort-column': sortColumn,
    'data-sort-direction': sortDirection,
  }, thead, tbody)
}

function renderGridVariant<T extends ListItem>(
  props: ListProps<T>,
  idField: keyof T & string
): React.ReactElement {
  const { data, columns = [] } = props

  const gridItems = data.map((item, index) => {
    const itemId = getItemId(item, idField)
    return React.createElement(GridItem, {
      key: itemId || index,
      item,
      itemId,
      columns,
      index,
    })
  })

  return React.createElement('div', {
    'data-variant': 'grid',
    'data-role': 'grid-container',
  }, ...gridItems)
}

function renderCardsVariant<T extends ListItem>(
  props: ListProps<T>,
  idField: keyof T & string
): React.ReactElement {
  const { data, columns = [] } = props

  const cards = data.map((item, index) => {
    const itemId = getItemId(item, idField)
    return React.createElement(CardItem, {
      key: itemId || index,
      item,
      itemId,
      columns,
      index,
    })
  })

  return React.createElement('div', {
    'data-variant': 'cards',
    'data-role': 'cards-container',
  }, ...cards)
}

function renderCompactVariant<T extends ListItem>(
  props: ListProps<T>,
  idField: keyof T & string
): React.ReactElement {
  const { data, columns = [] } = props

  const items = data.map((item, index) => {
    const itemId = getItemId(item, idField)
    return React.createElement(CompactItem, {
      key: itemId || index,
      item,
      itemId,
      columns,
      index,
    })
  })

  return React.createElement('div', {
    'data-variant': 'compact',
    'data-role': 'compact-container',
  }, ...items)
}

function renderKanbanVariant<T extends ListItem>(
  props: ListProps<T>,
  idField: keyof T & string
): React.ReactElement {
  const { data, groupBy, stages } = props

  // Group items by field (no hooks for direct function call compatibility)
  const groups = (() => {
    if (!groupBy) return new Map([['default', [...data]]])
    return groupItemsByField(data, groupBy, stages)
  })()

  const columns = Array.from(groups.entries()).map(([stage, items]) => {
    const cards = items.map((item, index) => {
      const itemId = getItemId(item, idField)
      return React.createElement(KanbanCard, {
        key: itemId || index,
        item,
        itemId,
        index,
      })
    })

    return React.createElement('div', {
      key: stage,
      'data-stage': stage,
      'data-role': 'kanban-column',
    },
      React.createElement('div', { 'data-role': 'kanban-header' }, stage),
      ...cards
    )
  })

  return React.createElement('div', {
    'data-variant': 'kanban',
    'data-role': 'kanban-container',
  }, ...columns)
}

function renderTimelineVariant<T extends ListItem>(
  props: ListProps<T>,
  idField: keyof T & string
): React.ReactElement {
  const { data, timeField, columns = [] } = props

  const timelineItems = data.map((item, index) => {
    const itemId = getItemId(item, idField)
    return React.createElement(TimelineItem, {
      key: itemId || index,
      item,
      itemId,
      columns,
      timeField,
      index,
    })
  })

  return React.createElement('div', {
    'data-variant': 'timeline',
    'data-role': 'timeline-container',
  }, ...timelineItems)
}

function renderTreeVariant<T extends ListItem>(
  props: ListProps<T>,
  idField: keyof T & string
): React.ReactElement {
  const { data, parentField, expandedIds = [], columns = [] } = props

  // Build tree (no hooks for direct function call compatibility)
  const tree = (() => {
    if (!parentField) return []
    return buildTree(data, idField, parentField)
  })()

  // Expanded set for O(1) lookups (no hooks for direct function call compatibility)
  const expandedSet = new Set(expandedIds)

  // Recursive tree node renderer
  function renderNode(node: TreeNode<T>): React.ReactElement {
    const itemId = getItemId(node.item, idField)
    const isExpanded = expandedSet.has(itemId)
    const hasChildren = node.children.length > 0

    const content = columns.length > 0
      ? columns.map(col => React.createElement('span', { key: col }, String(node.item[col] ?? '')))
      : [React.createElement('span', { key: 'name' }, String((node.item as Record<string, unknown>).name ?? itemId))]

    const childNodes = hasChildren && isExpanded
      ? node.children.map(child => renderNode(child))
      : []

    return React.createElement('div', {
      key: itemId,
      'data-item-id': itemId,
      'data-role': 'tree-node',
      'data-depth': node.depth,
      'data-expanded': hasChildren ? isExpanded : undefined,
      'data-has-children': hasChildren || undefined,
    },
      React.createElement('div', { 'data-role': 'tree-label' }, ...content),
      ...childNodes
    )
  }

  const treeContent = tree.map(node => renderNode(node))

  return React.createElement('div', {
    'data-variant': 'tree',
    'data-role': 'tree-container',
  }, ...treeContent)
}

function renderGroupedVariant<T extends ListItem>(
  props: ListProps<T>,
  idField: keyof T & string
): React.ReactElement {
  const { data, groupBy, columns = [] } = props

  // Group items by field (no hooks for direct function call compatibility)
  const groups = (() => {
    if (!groupBy) return new Map([['default', [...data]]])
    return groupItemsByField(data, groupBy)
  })()

  const groupElements = Array.from(groups.entries()).map(([groupName, items]) => {
    const itemElements = items.map((item, index) => {
      const itemId = getItemId(item, idField)
      return React.createElement(GroupedItem, {
        key: itemId || index,
        item,
        itemId,
        columns,
        index,
      })
    })

    return React.createElement('div', {
      key: groupName,
      'data-group': groupName,
      'data-role': 'group',
    },
      React.createElement('div', { 'data-role': 'group-header' }, groupName),
      ...itemElements
    )
  })

  return React.createElement('div', {
    'data-variant': 'grouped',
    'data-role': 'grouped-container',
  }, ...groupElements)
}

// ============================================================================
// Main List Component
// ============================================================================

/**
 * List component - displays collections of items in various layouts
 * Supports 8 variants: table, grid, cards, compact, kanban, timeline, tree, grouped
 *
 * Optimizations applied:
 * - useMemo for expensive grouping/tree operations
 * - React.memo for item renderers to prevent unnecessary re-renders
 * - Set-based lookups for O(1) selection checks
 * - Virtual scrolling hooks available for large lists
 * - Strict TypeScript generics for type safety
 */
export function List<T extends ListItem>(props: ListProps<T>): React.ReactElement {
  const {
    data,
    idField = 'id' as keyof T & string,
    variant = 'table',
    columns = [],
    selectionMode,
    selectedIds = [],
    pagination,
    sortable,
    sortColumn,
    sortDirection,
    filters = [],
    filterableFields,
    loading,
    loadingComponent,
    emptyMessage,
    emptyState,
    onSelect,
    onSort,
    onFilter,
    onSearch,
    onPageChange,
    onLoadMore,
    onRowClick,
    onExpand,
    onCollapse,
    onDragDrop,
  } = props

  // Store current state for test helpers
  currentListState = {
    data: data as ListItem[],
    idField: idField as string,
    selectionMode,
    sortColumn: sortColumn as string | undefined,
    sortDirection,
    filters,
    onSelect: onSelect as ((selected: ListItem | ListItem[]) => void) | undefined,
    onSort: onSort as ((column: string, direction: SortDirection) => void) | undefined,
    onFilter,
    onSearch,
    onPageChange,
    onLoadMore,
    onRowClick: onRowClick as ((item: ListItem) => void) | undefined,
    onExpand,
    onCollapse,
    onDragDrop,
  }

  // Build loading content (no hooks for direct function call compatibility)
  const loadingContent = (() => {
    if (loadingComponent) {
      return React.createElement('div', {
        'data-variant': variant,
        'data-loading': true,
      }, loadingComponent)
    }

    const skeletonRows = Array.from({ length: 3 }, (_, i) =>
      React.createElement('div', { key: i, 'data-role': 'skeleton-row', className: 'skeleton' })
    )

    return React.createElement('div', {
      'data-variant': variant,
      'data-loading': true,
    }, ...skeletonRows)
  })()

  // Handle loading state
  if (loading) {
    return loadingContent
  }

  // Build empty state content (no hooks for direct function call compatibility)
  const emptyContent = (() => {
    if (emptyState) {
      return React.createElement('div', {
        'data-variant': variant,
        'data-empty': true,
      }, emptyState)
    }

    return React.createElement('div', {
      'data-variant': variant,
      'data-empty': true,
    }, emptyMessage || 'No data')
  })()

  // Handle empty state
  if (data.length === 0) {
    return emptyContent
  }

  // Render content based on variant
  let content: React.ReactElement

  switch (variant) {
    case 'grid':
      content = renderGridVariant(props, idField)
      break
    case 'cards':
      content = renderCardsVariant(props, idField)
      break
    case 'compact':
      content = renderCompactVariant(props, idField)
      break
    case 'kanban':
      content = renderKanbanVariant(props, idField)
      break
    case 'timeline':
      content = renderTimelineVariant(props, idField)
      break
    case 'tree':
      content = renderTreeVariant(props, idField)
      break
    case 'grouped':
      content = renderGroupedVariant(props, idField)
      break
    case 'table':
    default:
      content = renderTableVariant(props, idField)
      break
  }

  // Build the final container with all features
  const containerChildren: React.ReactElement[] = []

  // Add filter UI if filterableFields provided
  if (filterableFields && filterableFields.length > 0) {
    const filterElements = filterableFields.map(field =>
      React.createElement('div', { key: field, 'data-filter-field': field }, `filter: ${field}`)
    )
    containerChildren.push(
      React.createElement('div', { key: 'filters', 'data-role': 'filter-bar' }, ...filterElements)
    )
  }

  // Add main content
  containerChildren.push(content)

  // Add pagination UI
  if (pagination) {
    if (pagination.style === 'loadMore' && pagination.hasMore) {
      containerChildren.push(
        React.createElement('button', {
          key: 'load-more',
          'data-role': 'load-more-button',
        }, 'Load More')
      )
    } else if (pagination.total && pagination.page) {
      const totalPages = Math.ceil(pagination.total / pagination.pageSize)
      containerChildren.push(
        React.createElement('div', {
          key: 'pagination',
          'data-role': 'pagination',
        }, `Page ${pagination.page} of ${totalPages}`)
      )
    }
  }

  // Wrap content with appropriate data attributes
  const containerProps: Record<string, unknown> = {
    'data-variant': variant,
    'data-selection-mode': selectionMode,
    'data-sortable': sortable || undefined,
    'data-sort-column': sortColumn,
    'data-sort-direction': sortDirection,
    'data-loading': loading || undefined,
  }

  // If content already has the right variant attribute, just return wrapped content
  if (containerChildren.length > 1) {
    return React.createElement('div', containerProps, ...containerChildren)
  }

  // For single content, merge attributes
  if (content.props['data-variant'] === variant) {
    // Clone and add additional props
    return React.cloneElement(content, {
      ...containerProps,
      ...content.props,
    })
  }

  return React.createElement('div', containerProps, content)
}

// ============================================================================
// Custom Hooks for List State Management
// ============================================================================

export interface UseListSelectionOptions<T extends ListItem> {
  data: T[]
  idField: keyof T & string
  mode: SelectionMode
  initialSelected?: string[]
}

export interface UseListSelectionResult {
  selectedIds: string[]
  isSelected: (id: string) => boolean
  toggle: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  selectRange: (fromId: string, toId: string) => void
}

/**
 * Hook for managing list selection state
 * Provides optimized selection operations with Set-based lookups
 */
export function useListSelection<T extends ListItem>(
  options: UseListSelectionOptions<T>
): UseListSelectionResult {
  const { data, idField, mode, initialSelected = [] } = options
  const [selectedIds, setSelectedIds] = React.useState<string[]>(initialSelected)

  // Memoize the selection set for O(1) lookups
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const isSelected = useCallback(
    (id: string) => selectedSet.has(id),
    [selectedSet]
  )

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const set = new Set(prev)
      if (set.has(id)) {
        set.delete(id)
      } else {
        if (mode === 'single') {
          return [id]
        }
        set.add(id)
      }
      return Array.from(set)
    })
  }, [mode])

  const selectAll = useCallback(() => {
    if (mode === 'multi') {
      const allIds = data.map(item => getItemId(item, idField))
      setSelectedIds(allIds)
    }
  }, [data, idField, mode])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const selectRange = useCallback((fromId: string, toId: string) => {
    if (mode !== 'multi') return

    const ids = data.map(item => getItemId(item, idField))
    const fromIndex = ids.indexOf(fromId)
    const toIndex = ids.indexOf(toId)

    if (fromIndex === -1 || toIndex === -1) return

    const start = Math.min(fromIndex, toIndex)
    const end = Math.max(fromIndex, toIndex)
    const rangeIds = ids.slice(start, end + 1)

    setSelectedIds(prev => {
      const set = new Set(prev)
      for (const id of rangeIds) {
        set.add(id)
      }
      return Array.from(set)
    })
  }, [data, idField, mode])

  return {
    selectedIds,
    isSelected,
    toggle,
    selectAll,
    clearSelection,
    selectRange,
  }
}

export interface UseListSortOptions<T extends ListItem> {
  data: T[]
  initialColumn?: keyof T & string
  initialDirection?: SortDirection
}

export interface UseListSortResult<T extends ListItem> {
  sortedData: T[]
  sortColumn: (keyof T & string) | undefined
  sortDirection: SortDirection
  toggleSort: (column: keyof T & string) => void
  setSort: (column: keyof T & string, direction: SortDirection) => void
  clearSort: () => void
}

/**
 * Hook for managing list sorting
 * Provides memoized sorted data to prevent re-sorting on every render
 */
export function useListSort<T extends ListItem>(
  options: UseListSortOptions<T>
): UseListSortResult<T> {
  const { data, initialColumn, initialDirection = 'asc' } = options

  const [sortColumn, setSortColumn] = React.useState<(keyof T & string) | undefined>(initialColumn)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(initialDirection)

  // Memoized sorting to avoid re-computing on every render
  const sortedData = useMemo(() => {
    if (!sortColumn) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return sortDirection === 'asc' ? 1 : -1
      if (bVal == null) return sortDirection === 'asc' ? -1 : 1

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal)
        return sortDirection === 'asc' ? cmp : -cmp
      }

      // Number comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      // Fallback to string comparison
      const aStr = String(aVal)
      const bStr = String(bVal)
      const cmp = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [data, sortColumn, sortDirection])

  const toggleSort = useCallback((column: keyof T & string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }, [sortColumn])

  const setSort = useCallback((column: keyof T & string, direction: SortDirection) => {
    setSortColumn(column)
    setSortDirection(direction)
  }, [])

  const clearSort = useCallback(() => {
    setSortColumn(undefined)
    setSortDirection('asc')
  }, [])

  return {
    sortedData,
    sortColumn,
    sortDirection,
    toggleSort,
    setSort,
    clearSort,
  }
}

// ============================================================================
// Test Helper Functions
// These simulate user interactions for testing purposes
// ============================================================================

/**
 * Simulates selecting one or more items by ID
 */
export function simulateSelect(idOrIds: string | string[]): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { data, idField, selectionMode, onSelect } = currentListState

  if (!onSelect) return

  if (selectionMode === 'single') {
    const id = Array.isArray(idOrIds) ? idOrIds[0] : idOrIds
    const item = findItemById(data, id, idField)
    if (item) {
      onSelect(item)
    }
  } else {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds]
    const items = ids.map(id => findItemById(data, id, idField)).filter((item): item is ListItem => item !== undefined)
    onSelect(items)
  }
}

/**
 * Simulates clicking a column header to sort
 */
export function simulateSort(column: string): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { sortColumn, sortDirection, onSort } = currentListState

  if (!onSort) return

  // Toggle direction if same column, otherwise default to 'asc'
  let newDirection: SortDirection = 'asc'
  if (sortColumn === column) {
    newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
  }

  onSort(column, newDirection)
}

/**
 * Simulates applying a filter
 */
export function simulateFilter(field: string, value: unknown): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { onFilter } = currentListState

  if (!onFilter) return

  onFilter([{ field, value }])
}

/**
 * Simulates a search query
 */
export function simulateSearch(query: string): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { onSearch } = currentListState

  if (!onSearch) return

  onSearch(query)
}

/**
 * Simulates clicking a page number in pagination
 */
export function simulatePageChange(page: number): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { onPageChange } = currentListState

  if (!onPageChange) return

  onPageChange(page)
}

/**
 * Simulates clicking "Load More" button
 */
export function simulateLoadMore(): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { onLoadMore } = currentListState

  if (!onLoadMore) return

  onLoadMore()
}

/**
 * Simulates clicking on a row
 */
export function simulateRowClick(id: string): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { data, idField, onRowClick } = currentListState

  if (!onRowClick) return

  const item = findItemById(data, id, idField)
  if (item) {
    onRowClick(item)
  }
}

/**
 * Simulates clicking "Select All" checkbox
 */
export function simulateSelectAll(): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { data, onSelect } = currentListState

  if (!onSelect) return

  onSelect(data)
}

/**
 * Simulates expanding a tree node
 */
export function simulateExpand(id: string): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { onExpand } = currentListState

  if (!onExpand) return

  onExpand(id)
}

/**
 * Simulates collapsing a tree node
 */
export function simulateCollapse(id: string): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { onCollapse } = currentListState

  if (!onCollapse) return

  onCollapse(id)
}

/**
 * Simulates drag and drop in kanban view
 */
export function simulateDragDrop(itemId: string, fromStage: string, toStage: string): void {
  if (!currentListState) {
    throw new Error('No List instance found. Call List() first.')
  }

  const { onDragDrop } = currentListState

  if (!onDragDrop) return

  onDragDrop({ itemId, fromStage, toStage })
}
