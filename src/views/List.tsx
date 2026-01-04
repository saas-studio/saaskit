/**
 * List view component
 * Stub - to be implemented in GREEN phase
 */
import type React from 'react'

export type ListVariant = 'table' | 'cards' | 'kanban' | 'compact' | 'timeline' | 'tree'

export interface ListProps<T = unknown> {
	data: T[]
	variant?: ListVariant
	columns?: string[]
	sortable?: boolean
	selectable?: boolean
	pagination?: boolean
	pageSize?: number
	emptyMessage?: string
	loading?: boolean
	onSelect?: (item: T) => void
	onSort?: (column: string, direction: 'asc' | 'desc') => void
}

export function List<T>(_props: ListProps<T>): React.ReactElement {
	// TODO: Implement in GREEN phase
	throw new Error('Not implemented')
}
