/**
 * List view component
 * Displays collections of items in various layouts
 */
import React from 'react'

// 8 Layout variants from DESIGN-SYSTEM.md
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

export interface ListProps<T = unknown> {
  // Core data
  data: T[]
  idField?: string

  // Layout variant
  variant?: ListVariant

  // Display configuration
  columns?: string[]

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
  sortColumn?: string
  sortDirection?: SortDirection
  onSort?: (column: string, direction: SortDirection) => void

  // Filtering
  filters?: FilterConfig[]
  filterableFields?: string[]
  onFilter?: (filters: FilterConfig[]) => void
  searchable?: boolean
  searchFields?: string[]
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
  groupBy?: string
  stages?: string[]
  onDragDrop?: (event: DragDropEvent) => void

  // Timeline
  timeField?: string

  // Tree
  parentField?: string
  expandedIds?: string[]
  onExpand?: (id: string) => void
  onCollapse?: (id: string) => void
}

// ============================================================================
// Module-Level State for Test Helpers
// ============================================================================

interface ListState<T = unknown> {
  data: T[]
  idField: string
  selectionMode?: SelectionMode
  sortColumn?: string
  sortDirection?: SortDirection
  filters: FilterConfig[]
  onSelect?: (selected: T | T[]) => void
  onSort?: (column: string, direction: SortDirection) => void
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
// Helper Functions
// ============================================================================

function getItemId<T>(item: T, idField: string): string {
  return String((item as Record<string, unknown>)[idField])
}

function findItemById<T>(data: T[], id: string, idField: string): T | undefined {
  return data.find(item => getItemId(item, idField) === id)
}

// ============================================================================
// Variant Renderers
// ============================================================================

function renderTableVariant<T>(props: ListProps<T>): React.ReactElement {
  const { data, columns = [], selectionMode, selectedIds = [], sortable, sortColumn, sortDirection } = props
  const idField = props.idField || 'id'

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

  columns.forEach(col => {
    headerCells.push(
      React.createElement('th', { key: col, 'data-column': col }, col)
    )
  })

  const thead = React.createElement('thead', null,
    React.createElement('tr', null, ...headerCells)
  )

  // Build body rows
  const bodyRows = data.map((item, index) => {
    const itemId = getItemId(item, idField)
    const isSelected = selectedIds.includes(itemId)
    const cells: React.ReactElement[] = []

    // Add checkbox for multi-selection
    if (selectionMode === 'multi') {
      cells.push(
        React.createElement('td', { key: 'checkbox' },
          React.createElement('input', {
            type: 'checkbox',
            checked: isSelected,
            'data-item-id': itemId
          })
        )
      )
    }

    columns.forEach(col => {
      const value = (item as Record<string, unknown>)[col]
      cells.push(
        React.createElement('td', { key: col, 'data-column': col }, String(value ?? ''))
      )
    })

    return React.createElement('tr', {
      key: itemId || index,
      'data-item-id': itemId,
      'data-selected': isSelected || undefined
    }, ...cells)
  })

  const tbody = React.createElement('tbody', null, ...bodyRows)

  return React.createElement('table', {
    'data-variant': 'table',
    'data-selection-mode': selectionMode,
    'data-sortable': sortable || undefined,
    'data-sort-column': sortColumn,
    'data-sort-direction': sortDirection
  }, thead, tbody)
}

function renderGridVariant<T>(props: ListProps<T>): React.ReactElement {
  const { data, columns = [] } = props
  const idField = props.idField || 'id'

  const gridItems = data.map((item, index) => {
    const itemId = getItemId(item, idField)
    const content = columns.map(col => {
      const value = (item as Record<string, unknown>)[col]
      return React.createElement('div', { key: col, 'data-field': col }, String(value ?? ''))
    })

    return React.createElement('div', {
      key: itemId || index,
      'data-item-id': itemId,
      'data-role': 'grid-item'
    }, ...content)
  })

  return React.createElement('div', {
    'data-variant': 'grid',
    'data-role': 'grid-container'
  }, ...gridItems)
}

function renderCardsVariant<T>(props: ListProps<T>): React.ReactElement {
  const { data, columns = [] } = props
  const idField = props.idField || 'id'

  const cards = data.map((item, index) => {
    const itemId = getItemId(item, idField)
    const content = columns.map(col => {
      const value = (item as Record<string, unknown>)[col]
      return React.createElement('div', { key: col, 'data-field': col }, String(value ?? ''))
    })

    return React.createElement('div', {
      key: itemId || index,
      'data-item-id': itemId,
      'data-role': 'card'
    }, ...content)
  })

  return React.createElement('div', {
    'data-variant': 'cards',
    'data-role': 'cards-container'
  }, ...cards)
}

function renderCompactVariant<T>(props: ListProps<T>): React.ReactElement {
  const { data, columns = [] } = props
  const idField = props.idField || 'id'

  const items = data.map((item, index) => {
    const itemId = getItemId(item, idField)
    const content = columns.map(col => {
      const value = (item as Record<string, unknown>)[col]
      return React.createElement('span', { key: col, 'data-field': col }, String(value ?? ''))
    })

    return React.createElement('div', {
      key: itemId || index,
      'data-item-id': itemId,
      'data-role': 'compact-item'
    }, ...content)
  })

  return React.createElement('div', {
    'data-variant': 'compact',
    'data-role': 'compact-container'
  }, ...items)
}

function renderKanbanVariant<T>(props: ListProps<T>): React.ReactElement {
  const { data, groupBy, stages } = props
  const idField = props.idField || 'id'

  // Group items by the groupBy field
  const groups: Record<string, T[]> = {}

  // Initialize groups from stages if provided
  if (stages) {
    stages.forEach(stage => {
      groups[stage] = []
    })
  }

  data.forEach(item => {
    const groupValue = groupBy ? String((item as Record<string, unknown>)[groupBy]) : 'default'
    if (!groups[groupValue]) {
      groups[groupValue] = []
    }
    groups[groupValue].push(item)
  })

  const columns = Object.entries(groups).map(([stage, items]) => {
    const cards = items.map((item, index) => {
      const itemId = getItemId(item, idField)
      const itemRecord = item as Record<string, unknown>
      return React.createElement('div', {
        key: itemId || index,
        'data-item-id': itemId,
        'data-role': 'kanban-card'
      }, String(itemRecord.title ?? itemRecord.name ?? itemId))
    })

    return React.createElement('div', {
      key: stage,
      'data-stage': stage,
      'data-role': 'kanban-column'
    },
      React.createElement('div', { 'data-role': 'kanban-header' }, stage),
      ...cards
    )
  })

  return React.createElement('div', {
    'data-variant': 'kanban',
    'data-role': 'kanban-container'
  }, ...columns)
}

function renderTimelineVariant<T>(props: ListProps<T>): React.ReactElement {
  const { data, timeField, columns = [] } = props
  const idField = props.idField || 'id'

  const timelineItems = data.map((item, index) => {
    const itemId = getItemId(item, idField)
    const itemRecord = item as Record<string, unknown>
    const timeValue = timeField ? String(itemRecord[timeField] ?? '') : ''

    const content = columns.map(col => {
      const value = itemRecord[col]
      return React.createElement('span', { key: col, 'data-field': col }, String(value ?? ''))
    })

    return React.createElement('div', {
      key: itemId || index,
      'data-item-id': itemId,
      'data-role': 'timeline-item',
      'data-time': timeValue
    },
      React.createElement('div', { 'data-role': 'time-marker' }, timeValue),
      React.createElement('div', { 'data-role': 'timeline-content' }, ...content)
    )
  })

  return React.createElement('div', {
    'data-variant': 'timeline',
    'data-role': 'timeline-container'
  }, ...timelineItems)
}

function renderTreeVariant<T>(props: ListProps<T>): React.ReactElement {
  const { data, parentField, expandedIds = [], columns = [] } = props
  const idField = props.idField || 'id'

  // Build tree structure
  interface TreeNode {
    item: T
    children: TreeNode[]
  }

  const nodeMap = new Map<string | null, TreeNode[]>()

  // Initialize the map
  nodeMap.set(null, [])

  data.forEach(item => {
    const itemId = getItemId(item, idField)
    nodeMap.set(itemId, [])
  })

  // Group items by parent
  data.forEach(item => {
    const itemId = getItemId(item, idField)
    const parentId = parentField
      ? ((item as Record<string, unknown>)[parentField] as string | null)
      : null

    const node: TreeNode = { item, children: [] }
    const siblings = nodeMap.get(parentId) || nodeMap.get(null)!
    siblings.push(node)
    nodeMap.set(itemId, node.children)
  })

  // Render tree nodes recursively
  function renderNode(node: TreeNode, depth: number): React.ReactElement {
    const itemId = getItemId(node.item, idField)
    const itemRecord = node.item as Record<string, unknown>
    const isExpanded = expandedIds.includes(itemId)
    const hasChildren = nodeMap.get(itemId)!.length > 0

    const content = columns.length > 0
      ? columns.map(col => React.createElement('span', { key: col }, String(itemRecord[col] ?? '')))
      : [React.createElement('span', { key: 'name' }, String(itemRecord.name ?? itemId))]

    const childNodes = hasChildren && isExpanded
      ? nodeMap.get(itemId)!.map(child => renderNode(child, depth + 1))
      : []

    return React.createElement('div', {
      key: itemId,
      'data-item-id': itemId,
      'data-role': 'tree-node',
      'data-depth': depth,
      'data-expanded': hasChildren ? isExpanded : undefined,
      'data-has-children': hasChildren || undefined
    },
      React.createElement('div', { 'data-role': 'tree-label' }, ...content),
      ...childNodes
    )
  }

  const rootNodes = nodeMap.get(null)!
  const treeContent = rootNodes.map(node => renderNode(node, 0))

  return React.createElement('div', {
    'data-variant': 'tree',
    'data-role': 'tree-container'
  }, ...treeContent)
}

function renderGroupedVariant<T>(props: ListProps<T>): React.ReactElement {
  const { data, groupBy, columns = [] } = props
  const idField = props.idField || 'id'

  // Group items by the groupBy field
  const groups: Record<string, T[]> = {}

  data.forEach(item => {
    const groupValue = groupBy ? String((item as Record<string, unknown>)[groupBy]) : 'default'
    if (!groups[groupValue]) {
      groups[groupValue] = []
    }
    groups[groupValue].push(item)
  })

  const groupElements = Object.entries(groups).map(([groupName, items]) => {
    const itemElements = items.map((item, index) => {
      const itemId = getItemId(item, idField)
      const content = columns.map(col => {
        const value = (item as Record<string, unknown>)[col]
        return React.createElement('span', { key: col, 'data-field': col }, String(value ?? ''))
      })

      return React.createElement('div', {
        key: itemId || index,
        'data-item-id': itemId,
        'data-role': 'grouped-item'
      }, ...content)
    })

    return React.createElement('div', {
      key: groupName,
      'data-group': groupName,
      'data-role': 'group'
    },
      React.createElement('div', { 'data-role': 'group-header' }, groupName),
      ...itemElements
    )
  })

  return React.createElement('div', {
    'data-variant': 'grouped',
    'data-role': 'grouped-container'
  }, ...groupElements)
}

// ============================================================================
// Main List Component
// ============================================================================

/**
 * List component - displays collections of items in various layouts
 * Supports 8 variants: table, grid, cards, compact, kanban, timeline, tree, grouped
 */
export function List<T>(props: ListProps<T>): React.ReactElement {
  const {
    data,
    idField = 'id',
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
    onDragDrop
  } = props

  // Store current state for test helpers
  currentListState = {
    data: data as unknown[],
    idField,
    selectionMode,
    sortColumn,
    sortDirection,
    filters,
    onSelect: onSelect as ((selected: unknown | unknown[]) => void) | undefined,
    onSort,
    onFilter,
    onSearch,
    onPageChange,
    onLoadMore,
    onRowClick: onRowClick as ((item: unknown) => void) | undefined,
    onExpand,
    onCollapse,
    onDragDrop
  }

  // Handle loading state
  if (loading) {
    if (loadingComponent) {
      return React.createElement('div', {
        'data-variant': variant,
        'data-loading': true
      }, loadingComponent)
    }

    // Render skeleton loader
    const skeletonRows = Array.from({ length: 3 }, (_, i) =>
      React.createElement('div', { key: i, 'data-role': 'skeleton-row', className: 'skeleton' })
    )

    return React.createElement('div', {
      'data-variant': variant,
      'data-loading': true
    }, ...skeletonRows)
  }

  // Handle empty state
  if (data.length === 0) {
    if (emptyState) {
      return React.createElement('div', {
        'data-variant': variant,
        'data-empty': true
      }, emptyState)
    }

    return React.createElement('div', {
      'data-variant': variant,
      'data-empty': true
    }, emptyMessage || 'No data')
  }

  // Render content based on variant
  let content: React.ReactElement

  switch (variant) {
    case 'grid':
      content = renderGridVariant(props)
      break
    case 'cards':
      content = renderCardsVariant(props)
      break
    case 'compact':
      content = renderCompactVariant(props)
      break
    case 'kanban':
      content = renderKanbanVariant(props)
      break
    case 'timeline':
      content = renderTimelineVariant(props)
      break
    case 'tree':
      content = renderTreeVariant(props)
      break
    case 'grouped':
      content = renderGroupedVariant(props)
      break
    case 'table':
    default:
      content = renderTableVariant(props)
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
          'data-role': 'load-more-button'
        }, 'Load More')
      )
    } else if (pagination.total && pagination.page) {
      const totalPages = Math.ceil(pagination.total / pagination.pageSize)
      containerChildren.push(
        React.createElement('div', {
          key: 'pagination',
          'data-role': 'pagination'
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
    'data-loading': loading || undefined
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
      ...content.props
    })
  }

  return React.createElement('div', containerProps, content)
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
    const items = ids.map(id => findItemById(data, id, idField)).filter(Boolean)
    onSelect(items as unknown[])
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
